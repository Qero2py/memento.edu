import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { randomBytes } from "node:crypto";
import { sql } from "./db";

const COOKIE = "mem_session";
const WEEK = 7 * 24 * 3600;

export type User = { id: number; name: string; email: string; role: string; locale: string };

export const getUser = cache(async (): Promise<User | null> => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const [row] = await sql<User[]>`select u.id, u.name, u.email, u.role, u.locale from auth_sessions s
    join users u on u.id = s.user_id where s.token = ${token} and s.expires_at > now()`;
  return row ?? null;
});

export async function createSession(userId: number) {
  const jar = await cookies();
  const previousToken = jar.get(COOKIE)?.value;
  if (previousToken) await sql`delete from auth_sessions where token = ${previousToken}`;
  await sql`delete from auth_sessions where expires_at <= now()`;
  const token = randomBytes(32).toString("hex");
  await sql`insert into auth_sessions(token, user_id, expires_at) values(${token}, ${userId}, now() + interval '7 days')`;
  jar.set(COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: WEEK });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await sql`delete from auth_sessions where token = ${token}`;
  jar.delete(COOKIE);
}

export async function requireUser(locale: string): Promise<User> {
  const user = await getUser();
  if (!user) redirect(`/${locale}/login`);
  return user;
}

// Students only: lecturers are sent to their own area.
export async function requireStudent(locale: string): Promise<User> {
  const user = await requireUser(locale);
  if (user.role === "lecturer") redirect(`/${locale}/teach`);
  return user;
}

// Lecturers only: students are sent back to their dashboard.
export async function requireLecturer(locale: string): Promise<User> {
  const user = await requireUser(locale);
  if (user.role !== "lecturer") redirect(`/${locale}/dashboard`);
  return user;
}
