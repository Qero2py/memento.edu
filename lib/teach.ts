import { sql, type Row } from "./db";

export const taughtCourses = (uid: number): Promise<Row[]> => sql<Row[]>`select c.*,
  (select count(*) from course_sessions where course_id = c.id)::int as session_count,
  (select count(*) from assignments where course_id = c.id)::int as assignment_count,
  (select count(*) from submissions s join assignments a on a.id = s.assignment_id where a.course_id = c.id and s.grade is null)::int as to_grade
  from courses c where c.lecturer_id = ${uid} order by c.id`;

export const unclaimedCourses = (): Promise<Row[]> => sql<Row[]>`select * from courses where lecturer_id is null order by id`;

export async function ownedCourse(uid: number, code: string): Promise<Row | undefined> {
  const [row] = await sql<Row[]>`select * from courses where code = ${code} and lecturer_id = ${uid}`;
  return row;
}

export async function teachSessions(courseId: number): Promise<Row[]> {
  const sessions = await sql<Row[]>`select * from course_sessions where course_id = ${courseId} order by num`;
  const ids = sessions.map((s) => s.id);
  const mats = ids.length ? await sql<Row[]>`select * from materials where session_id in ${sql(ids)} order by id` : [];
  return sessions.map((s) => ({ ...s, materials: mats.filter((m) => m.session_id === s.id) }));
}

export async function teachAssignments(courseId: number): Promise<Row[]> {
  const [{ n: students }] = await sql<Row[]>`select count(*)::int as n from enrollments where course_id = ${courseId}`;
  const list = await sql<Row[]>`select * from assignments where course_id = ${courseId} order by due_at`;
  const ids = list.map((a) => a.id);
  const subs = ids.length ? await sql<Row[]>`select s.*, u.name as student from submissions s join users u on u.id = s.user_id
    where s.assignment_id in ${sql(ids)} order by s.submitted_at` : [];
  return list.map((a) => ({ ...a, students, submissions: subs.filter((s) => s.assignment_id === a.id) }));
}

export const teachPracticums = (courseId: number): Promise<Row[]> => sql<Row[]>`select * from practicums where course_id = ${courseId} order by num`;

// Dates are entered in Jakarta time (UTC+7).
export const toDateInput = (iso: string) => new Date(iso).toLocaleDateString("sv-SE", { timeZone: "Asia/Jakarta" });
export const toDateTimeInput = (iso: string) => new Date(iso).toLocaleString("sv-SE", { timeZone: "Asia/Jakarta" }).slice(0, 16).replace(" ", "T");
