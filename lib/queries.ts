import { cache } from "react";
import { sql, type Row } from "./db";
export type { Row };

// One query returns every enrolled course with its totals (instead of several queries per course).
const coursesWithStats = async (userId: number, only?: number): Promise<Row[]> => {
  const rows = await sql<Row[]>`select c.*,
    (select count(*) from course_sessions s where s.course_id = c.id)::int as session_count,
    ((select count(*) from course_sessions s where s.course_id = c.id)
     + (select count(*) from materials m join course_sessions s on s.id = m.session_id where s.course_id = c.id)
     + (select count(*) from practicums x where x.course_id = c.id))::int as total,
    ((select count(*) from progress p join course_sessions s on p.kind = 'session' and p.ref_id = s.id where p.user_id = ${userId} and s.course_id = c.id)
     + (select count(*) from progress p join materials m on p.kind = 'material' and p.ref_id = m.id join course_sessions s on s.id = m.session_id where p.user_id = ${userId} and s.course_id = c.id)
     + (select count(*) from progress p join practicums x on p.kind = 'practicum' and p.ref_id = x.id where p.user_id = ${userId} and x.course_id = c.id))::int as done
    from courses c join enrollments e on e.course_id = c.id and e.user_id = ${userId}
    where ${only == null ? sql`true` : sql`c.id = ${only}`} order by c.id`;
  return rows.map((c) => ({ ...c, percent: c.total ? Math.round((c.done / c.total) * 100) : 0 }));
};

export async function courseTotals(userId: number, courseId: number) {
  const [c] = await coursesWithStats(userId, courseId);
  return c ? { total: c.total as number, done: c.done as number, percent: c.percent as number } : { total: 0, done: 0, percent: 0 };
}

export const myCourses = cache((userId: number): Promise<Row[]> => coursesWithStats(userId));

export const publicCourses = (): Promise<Row[]> =>
  sql<Row[]>`select c.*, (select count(*) from course_sessions where course_id = c.id)::int as session_count from courses c order by c.id`;

export async function getCourse(code: string): Promise<Row | undefined> {
  const [row] = await sql<Row[]>`select * from courses where code = ${code}`;
  return row;
}

export async function isEnrolled(userId: number, courseId: number) {
  const rows = await sql`select 1 from enrollments where user_id = ${userId} and course_id = ${courseId}`;
  return rows.length > 0;
}

export async function sessionsWithState(courseId: number, userId?: number): Promise<Row[]> {
  const sessions = await sql<Row[]>`select * from course_sessions where course_id = ${courseId} order by num`;
  const ids = sessions.map((s) => s.id);
  const materials = ids.length ? await sql<Row[]>`select * from materials where session_id in ${sql(ids)} order by id` : [];
  const progress = userId ? await sql<Row[]>`select kind || ':' || ref_id as k from progress where user_id = ${userId}` : [];
  const doneSet = new Set(progress.map((r) => r.k));
  let currentFound = false;
  return sessions.map((s) => {
    const done = doneSet.has(`session:${s.id}`);
    const state: "done" | "current" | "next" = done ? "done" : !currentFound ? ((currentFound = true), "current") : "next";
    return { ...s, state, materials: materials.filter((m) => m.session_id === s.id).map((m) => ({ ...m, done: doneSet.has(`material:${m.id}`) })) };
  });
}

export async function practicumsWithState(courseId: number, userId: number): Promise<Row[]> {
  const done = new Set((await sql<Row[]>`select ref_id from progress where user_id = ${userId} and kind = 'practicum'`).map((r) => r.ref_id));
  const rows = await sql<Row[]>`select * from practicums where course_id = ${courseId} order by num`;
  return rows.map((p) => ({ ...p, done: done.has(p.id) }));
}

export async function assignmentsFor(userId: number, courseId?: number): Promise<Row[]> {
  const rows = await sql<Row[]>`select a.*, c.code, c.title_en as course_title_en, c.title_id as course_title_id, s.content, s.grade, s.submitted_at
    from assignments a join courses c on c.id = a.course_id
    join enrollments e on e.course_id = c.id and e.user_id = ${userId}
    left join submissions s on s.assignment_id = a.id and s.user_id = ${userId}
    where ${courseId == null ? sql`true` : sql`a.course_id = ${courseId}`} order by a.due_at`;
  return rows.map((a) => ({ ...a, overdue: !a.submitted_at && new Date(a.due_at) < new Date() }));
}

export async function upcomingEvents(userId: number): Promise<Row[]> {
  // Classes repeat weekly: roll each stored first occurrence forward to its next run.
  const week = 7 * 86400000, now = Date.now(), from = now - 2 * 3600000, to = now + week;
  const rows = await sql<Row[]>`select ev.*, c.code, c.title_en, c.title_id from events ev
    join courses c on c.id = ev.course_id join enrollments e on e.course_id = c.id and e.user_id = ${userId}`;
  return rows
    .map((e) => {
      const end = new Date(e.ends_at).getTime();
      const n = Math.max(0, Math.ceil((from - end) / week));
      return { ...e, starts_at: new Date(new Date(e.starts_at).getTime() + n * week).toISOString(), ends_at: new Date(end + n * week).toISOString() };
    })
    .filter((e) => new Date(e.starts_at).getTime() <= to)
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at));
}

export const notificationsFor = (userId: number): Promise<Row[]> =>
  sql<Row[]>`select * from notifications where user_id = ${userId} order by created_at desc limit 6`;

export async function nextSession(userId: number) {
  const [row] = await sql<Row[]>`select s.*, c.code as course_code, c.title_en as course_title_en, c.title_id as course_title_id
    from course_sessions s join courses c on c.id = s.course_id
    join enrollments e on e.course_id = c.id and e.user_id = ${userId}
    where not exists (select 1 from progress p where p.user_id = ${userId} and p.kind = 'session' and p.ref_id = s.id)
    order by c.id, s.num limit 1`;
  if (!row) return null;
  return {
    session: row,
    course: { code: row.course_code, title_en: row.course_title_en, title_id: row.course_title_id },
  };
}
