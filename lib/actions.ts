"use server";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { sql } from "./db";
import { createSession, destroySession, getUser } from "./auth";
import { isLocale, type Locale } from "./i18n";
import { consumeRateLimit } from "./rateLimit";
import { normalizeEmail, passwordError } from "./authPolicy";
import { authenticate, resetPasswordFlow } from "./authFlows";

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const expired = (path: string): never => redirect(`/${path.startsWith("/id") ? "id" : "en"}/login?error=session`);
const loc = (f: FormData): Locale => (isLocale(str(f, "locale")) ? (str(f, "locale") as Locale) : "en");

export async function login(f: FormData) {
  const l = loc(f);
  const email = normalizeEmail(str(f, "email"));
  const result = await authenticate(email, String(f.get("password") ?? ""), {
    allowAttempt: async (value) => (await consumeRateLimit("login", value, 8, 15 * 60)).allowed,
    findUser: async (value) => (await sql<{ id: number; role: string; password_hash: string }[]>`select id, role, password_hash from users where email = ${value}`)[0],
    verifyPassword: bcrypt.compare,
    createSession,
  });
  if (result.status === "throttled") redirect(`/${l}/login?error=throttle`);
  if (result.status === "invalid") redirect(`/${l}/login?error=invalid`);
  redirect(`/${l}/${result.role === "lecturer" ? "teach" : "dashboard"}`);
}

export async function register(f: FormData) {
  const l = loc(f);
  const name = str(f, "name"), email = normalizeEmail(str(f, "email")), pw = String(f.get("password") ?? "");
  const back = (e: string) => redirect(`/${l}/register?error=${e}`);
  if (!name || !email) back("fields");
  const pwError = passwordError(pw, String(f.get("confirm") ?? ""));
  if (pwError) back(pwError);
  const role = str(f, "role") === "lecturer" ? "lecturer" : "student";
  const secret = process.env.LECTURER_CODE;
  if (role === "lecturer" && secret && str(f, "code") !== secret) back("lecturercode");
  const taken = await sql`select 1 from users where email = ${email}`;
  if (taken.length) back("exists");
  const passwordHash = await bcrypt.hash(pw, 10);
  const [{ id }] = await sql`insert into users(name, email, password_hash, role, locale) values(${name}, ${email}, ${passwordHash}, ${role}, ${l}) returning id`;
  if (role === "student") await sql`insert into enrollments(user_id, course_id) select ${id}, id from courses`; // demo: students join every course
  await sql`insert into notifications(user_id, title_en, title_id, body_en, body_id)
    values(${id}, 'Welcome to memento.edu', 'Selamat datang di memento.edu',
      ${role === "lecturer" ? "Open Teaching to claim or create your courses." : "Your courses are ready."},
      ${role === "lecturer" ? "Buka Mengajar untuk mengambil atau membuat mata kuliahmu." : "Mata kuliahmu sudah siap."})`;
  await createSession(id);
  redirect(`/${l}/${role === "lecturer" ? "teach" : "dashboard"}`);
}

export async function logout(f: FormData) {
  await destroySession();
  redirect(`/${loc(f)}`);
}

export type ForgotPasswordState = { token?: string; sent?: boolean; throttled?: boolean };

export async function forgotPassword(_previous: ForgotPasswordState, f: FormData): Promise<ForgotPasswordState> {
  const email = normalizeEmail(str(f, "email"));
  const limit = await consumeRateLimit("forgot-password", email, 3, 60 * 60);
  if (!limit.allowed) return { throttled: true };
  await sql`delete from reset_tokens where expires_at <= now()`;
  const [user] = await sql`select id from users where email = ${email}`;
  if (user) {
    const token = randomBytes(24).toString("hex");
    await sql`insert into reset_tokens(token, user_id, expires_at) values(${token}, ${user.id}, now() + interval '1 hour')`;
    return { sent: true, token };
  }
  // Keep the demo response shape identical for unknown emails to avoid account enumeration.
  return { sent: true, token: randomBytes(24).toString("hex") };
}

export type ResetPasswordState = { error?: "token" | "short" | "mismatch"; throttled?: boolean };

export async function resetPassword(_previous: ResetPasswordState, f: FormData): Promise<ResetPasswordState> {
  const l = loc(f), token = str(f, "token"), pw = String(f.get("password") ?? "");
  const result = await resetPasswordFlow(token, pw, String(f.get("confirm") ?? ""), {
    allowAttempt: async (value) => (await consumeRateLimit("reset-password", value, 5, 15 * 60)).allowed,
    hasValidToken: async (value) => (await sql`select 1 from reset_tokens where token = ${value} and expires_at > now()`).length > 0,
    hashPassword: (value) => bcrypt.hash(value, 10),
    consumeAndUpdate: async (value, hash) => {
      const [consumed] = await sql.begin(async (tx) => {
        const [row] = await tx`delete from reset_tokens where token = ${value} and expires_at > now() returning user_id`;
        if (!row) return [];
        await tx`update users set password_hash = ${hash} where id = ${row.user_id}`;
        await tx`delete from reset_tokens where user_id = ${row.user_id}`;
        await tx`delete from auth_sessions where user_id = ${row.user_id}`;
        return [row];
      });
      return !!consumed;
    },
  });
  if (result.status === "throttled") return { throttled: true };
  if (result.status !== "updated") return { error: result.status === "invalid" ? "token" : result.status };
  redirect(`/${l}/login?reset=1`);
}

export async function toggleProgress(kind: "session" | "material" | "practicum", refId: number, path: string) {
  const user = await getUser();
  if (!user) return expired(path);
  const removed = await sql`delete from progress where user_id = ${user.id} and kind = ${kind} and ref_id = ${refId}`;
  if (!removed.count) await sql`insert into progress(user_id, kind, ref_id) values(${user.id}, ${kind}, ${refId}) on conflict do nothing`;
  revalidatePath(path);
}

export async function submitAssignment(assignmentId: number, path: string, f: FormData) {
  const user = await getUser();
  const content = str(f, "content");
  if (!user) return expired(path);
  if (!content) return;
  await sql`insert into submissions(assignment_id, user_id, content) values(${assignmentId}, ${user.id}, ${content})
    on conflict (assignment_id, user_id) do update set content = excluded.content, submitted_at = now()`;
  revalidatePath(path);
}

export async function markAllRead(path: string) {
  const user = await getUser();
  if (!user) return expired(path);
  await sql`update notifications set read = true where user_id = ${user.id}`;
  revalidatePath(path);
}
