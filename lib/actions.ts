"use server";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { sql } from "./db";
import { createSession, destroySession, getUser } from "./auth";
import { isLocale, type Locale } from "./i18n";

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const expired = (path: string): never => redirect(`/${path.startsWith("/id") ? "id" : "en"}/login?error=session`);
const loc = (f: FormData): Locale => (isLocale(str(f, "locale")) ? (str(f, "locale") as Locale) : "en");

export async function login(f: FormData) {
  const l = loc(f);
  const [user] = await sql`select id, role, password_hash from users where email = ${str(f, "email").toLowerCase()}`;
  if (!user || !bcrypt.compareSync(String(f.get("password") ?? ""), user.password_hash)) redirect(`/${l}/login?error=invalid`);
  await createSession(user.id);
  redirect(`/${l}/${user.role === "lecturer" ? "teach" : "dashboard"}`);
}

export async function register(f: FormData) {
  const l = loc(f);
  const name = str(f, "name"), email = str(f, "email").toLowerCase(), pw = String(f.get("password") ?? "");
  const back = (e: string) => redirect(`/${l}/register?error=${e}`);
  if (!name || !email) back("fields");
  if (pw.length < 8) back("short");
  if (pw !== String(f.get("confirm") ?? "")) back("mismatch");
  const role = str(f, "role") === "lecturer" ? "lecturer" : "student";
  const secret = process.env.LECTURER_CODE;
  if (role === "lecturer" && secret && str(f, "code") !== secret) back("lecturercode");
  const taken = await sql`select 1 from users where email = ${email}`;
  if (taken.length) back("exists");
  const [{ id }] = await sql`insert into users(name, email, password_hash, role, locale) values(${name}, ${email}, ${bcrypt.hashSync(pw, 10)}, ${role}, ${l}) returning id`;
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

export async function forgotPassword(f: FormData) {
  const l = loc(f);
  const [user] = await sql`select id from users where email = ${str(f, "email").toLowerCase()}`;
  let q = "sent=1";
  if (user) {
    const token = randomBytes(24).toString("hex");
    await sql`insert into reset_tokens(token, user_id, expires_at) values(${token}, ${user.id}, now() + interval '1 hour')`;
    q += `&token=${token}`;
  }
  redirect(`/${l}/forgot-password?${q}`);
}

export async function resetPassword(f: FormData) {
  const l = loc(f), token = str(f, "token"), pw = String(f.get("password") ?? "");
  const [row] = await sql`select user_id from reset_tokens where token = ${token} and expires_at > now()`;
  if (!row) redirect(`/${l}/reset/${token}?error=token`);
  if (pw.length < 8) redirect(`/${l}/reset/${token}?error=short`);
  if (pw !== String(f.get("confirm") ?? "")) redirect(`/${l}/reset/${token}?error=mismatch`);
  await sql`update users set password_hash = ${bcrypt.hashSync(pw, 10)} where id = ${row.user_id}`;
  await sql`delete from reset_tokens where user_id = ${row.user_id}`;
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
