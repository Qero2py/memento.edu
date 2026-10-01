import { sql, type Row } from "./db";
export type { Row };

export async function courseTotals(userId: number, courseId: number) {
  const [t] = await sql<Row[]>`select
    (select count(*) from course_sessions where course_id = ${courseId})::int +
    (select count(*) from materials m join course_sessions s on s.id = m.session_id where s.course_id = ${courseId})::int +
    (select count(*) from practicums where course_id = ${courseId})::int as n`;
  const [d] = await sql<Row[]>`select count(*)::int as n from progress p where p.user_id = ${userId} and (
    (p.kind = 'session' and p.ref_id in (select id from course_sessions where course_id = ${courseId})) or
    (p.kind = 'material' and p.ref_id in (select m.id from materials m join course_sessions s on s.id = m.session_id where s.course_id = ${courseId})) or
    (p.kind = 'practicum' and p.ref_id in (select id from practicums where course_id = ${courseId})))`;
  const total = t.n as number, done = d.n as number;
  return { total, done, percent: total ? Math.round((done / total) * 100) : 0 };
}

export async function myCourses(userId: number): Promise<Row[]> {
  const rows = await sql<Row[]>`select c.*, (select count(*) from course_sessions where course_id = c.id)::int as session_count
    from courses c join enrollments e on e.course_id = c.id where e.user_id = ${userId} order by c.id`;
  return Promise.all(rows.map(async (c) => ({ ...c, ...(await courseTotals(userId, c.id)) })));
}

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
  for (const c of await myCourses(userId)) {
    const cur = (await sessionsWithState(c.id, userId)).find((s) => s.state === "current");
    if (cur) return { course: c, session: cur };
  }
  return null;
}
