"use server";
import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { sql } from "./db";
import { getUser, type User } from "./auth";
import { ALLOWED_EXT, MAX_UPLOAD_MB, publicUrl, removeFiles, signedUpload, storageEnabled } from "./storage";

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const lang = (path: string) => (path.startsWith("/id") ? "id" : "en");
const refresh = (path: string) => revalidatePath(path.split("?")[0]);
// A pair of texts: if only one language is filled in, the other copies it.
const bi = (f: FormData, base: string): [string, string] => {
  const en = str(f, `${base}_en`), id = str(f, `${base}_id`);
  return [en || id, id || en];
};
const jakarta = (local: string) => (/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/.test(local) ? `${local.length === 10 ? local + "T09:00" : local}:00+07:00` : null);

// Every action starts here: signed in AND a lecturer.
async function lecturer(path: string): Promise<User> {
  const u = await getUser();
  if (!u || u.role !== "lecturer") redirect(`/${lang(path)}/login?error=session`);
  return u;
}
const owns = async (uid: number, courseId?: number) =>
  !!courseId && (await sql`select 1 from courses where id = ${courseId} and lecturer_id = ${uid}`).length > 0;
const one = async (q: PromiseLike<any[]>) => (await q)[0]?.course_id as number | undefined;
const courseOfSession = (id: number) => one(sql`select course_id from course_sessions where id = ${id}`);
const courseOfMaterial = (id: number) => one(sql`select s.course_id from materials m join course_sessions s on s.id = m.session_id where m.id = ${id}`);
const courseOfAssignment = (id: number) => one(sql`select course_id from assignments where id = ${id}`);
const courseOfPracticum = (id: number) => one(sql`select course_id from practicums where id = ${id}`);
const courseOfEvent = (id: number) => one(sql`select course_id from events where id = ${id}`);
const courseOfSubmission = (id: number) => one(sql`select a.course_id from submissions s join assignments a on a.id = s.assignment_id where s.id = ${id}`);

/* ---------- courses ---------- */
export async function claimCourse(courseId: number, path: string) {
  const u = await lecturer(path);
  await sql`update courses set lecturer_id = ${u.id} where id = ${courseId} and lecturer_id is null`;
  refresh(path);
}

export async function createCourse(path: string, f: FormData) {
  const u = await lecturer(path);
  const code = str(f, "code"), [te, ti] = bi(f, "title"), [de, di] = bi(f, "desc");
  const back = (e: string) => redirect(`${path.split("?")[0]}?e=${e}`);
  if (!/^[A-Za-z0-9_-]{2,20}$/.test(code)) back("codefmt");
  if (!te) back("fields");
  if ((await sql`select 1 from courses where code = ${code}`).length) back("code");
  const credits = Math.min(Math.max(parseInt(str(f, "credits")) || 2, 1), 8);
  const [{ id }] = await sql`insert into courses(code, title_en, title_id, desc_en, desc_id, lecturer, credits, lecturer_id)
    values(${code}, ${te}, ${ti}, ${de}, ${di}, ${u.name}, ${credits}, ${u.id}) returning id`;
  await sql`insert into enrollments(user_id, course_id) select id, ${id} from users where role = 'student'`;
  redirect(`/${lang(path)}/teach/${code}`);
}

export async function updateCourse(courseId: number, path: string, f: FormData) {
  const u = await lecturer(path);
  if (!(await owns(u.id, courseId))) return;
  const [te, ti] = bi(f, "title"), [de, di] = bi(f, "desc");
  if (!te) return;
  const credits = Math.min(Math.max(parseInt(str(f, "credits")) || 2, 1), 8);
  await sql`update courses set title_en = ${te}, title_id = ${ti}, desc_en = ${de}, desc_id = ${di}, lecturer = ${str(f, "lecturer") || u.name}, credits = ${credits} where id = ${courseId}`;
  refresh(path);
}

/* ---------- sessions ---------- */
export async function addSession(courseId: number, path: string, f: FormData) {
  const u = await lecturer(path);
  if (!(await owns(u.id, courseId))) return;
  const [te, ti] = bi(f, "title"), [se, si] = bi(f, "summary");
  if (!te) return;
  const held = jakarta(str(f, "date")) ?? new Date().toISOString();
  await sql`insert into course_sessions(course_id, num, title_en, title_id, summary_en, summary_id, held_on)
    values(${courseId}, (select coalesce(max(num), 0) + 1 from course_sessions where course_id = ${courseId}), ${te}, ${ti}, ${se}, ${si}, ${held})`;
  refresh(path);
}

export async function updateSession(sessionId: number, path: string, f: FormData) {
  const u = await lecturer(path);
  if (!(await owns(u.id, await courseOfSession(sessionId)))) return;
  const [te, ti] = bi(f, "title"), [se, si] = bi(f, "summary");
  if (!te) return;
  const held = jakarta(str(f, "date"));
  await sql`update course_sessions set title_en = ${te}, title_id = ${ti}, summary_en = ${se}, summary_id = ${si}, held_on = coalesce(${held}::timestamptz, held_on) where id = ${sessionId}`;
  refresh(path);
}

export async function deleteSession(sessionId: number, path: string) {
  const u = await lecturer(path);
  const cid = await courseOfSession(sessionId);
  if (!cid || !(await owns(u.id, cid))) return;
  const files = (await sql`select storage_path from materials where session_id = ${sessionId} and storage_path is not null`).map((r) => r.storage_path as string);
  await sql`delete from progress where (kind = 'session' and ref_id = ${sessionId}) or (kind = 'material' and ref_id in (select id from materials where session_id = ${sessionId}))`;
  await sql`delete from course_sessions where id = ${sessionId}`;
  await sql`update course_sessions s set num = r.n from (select id, row_number() over (order by num, id)::int as n from course_sessions where course_id = ${cid}) r where s.id = r.id`;
  await removeFiles(files);
  refresh(path);
}

/* ---------- materials ---------- */
export async function addMaterial(sessionId: number, path: string, f: FormData): Promise<{ error?: string }> {
  const u = await lecturer(path);
  const cid = await courseOfSession(sessionId);
  if (!cid || !(await owns(u.id, cid))) return { error: "e.fields" };
  const kind = str(f, "kind");
  const [te, ti] = bi(f, "title");
  if (!["pdf", "slide", "video", "link"].includes(kind)) return { error: "e.fields" };
  if (!te) return { error: "e.title" };

  let url = str(f, "url"), storagePath: string | null = str(f, "storage_path") || null;
  if (storagePath) {
    const [{ code }] = await sql`select code from courses where id = ${cid}`;
    if (!storageEnabled() || !storagePath.startsWith(`${code}/`) || storagePath.includes("..")) return { error: "e.up" };
    url = publicUrl(storagePath); // never trust a URL sent by the browser for uploaded files
  } else if (!/^https?:\/\/\S+$/i.test(url)) return { error: "e.url" };

  await sql`insert into materials(session_id, kind, title_en, title_id, url, storage_path) values(${sessionId}, ${kind}, ${te}, ${ti}, ${url}, ${storagePath})`;
  refresh(path);
  return {};
}

export async function deleteMaterial(materialId: number, path: string) {
  const u = await lecturer(path);
  if (!(await owns(u.id, await courseOfMaterial(materialId)))) return;
  const [m] = await sql`select storage_path from materials where id = ${materialId}`;
  await sql`delete from progress where kind = 'material' and ref_id = ${materialId}`;
  await sql`delete from materials where id = ${materialId}`;
  if (m?.storage_path) await removeFiles([m.storage_path]);
  refresh(path);
}

// Step 1 of an upload: the browser asks for a one-time URL, then sends the file straight to Supabase Storage.
export async function getUploadUrl(courseId: number, filename: string, size: number, path: string): Promise<{ error: string } | { path: string; token: string }> {
  const u = await lecturer(path);
  if (!(await owns(u.id, courseId))) return { error: "e.fields" };
  if (!storageEnabled()) return { error: "upload.off" };
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED_EXT.includes(ext)) return { error: "e.type" };
  if (size > MAX_UPLOAD_MB * 1024 * 1024) return { error: "e.size" };
  const [{ code }] = await sql`select code from courses where id = ${courseId}`;
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
  try {
    const s = await signedUpload(`${code}/${randomUUID()}-${safe}`);
    return { path: s.path, token: s.token };
  } catch { return { error: "e.up" }; }
}

/* ---------- assignments & grading ---------- */
export async function addAssignment(courseId: number, path: string, f: FormData) {
  const u = await lecturer(path);
  if (!(await owns(u.id, courseId))) return;
  const [te, ti] = bi(f, "title"), [de, di] = bi(f, "desc"), due = jakarta(str(f, "due"));
  if (!te || !due) return;
  await sql`insert into assignments(course_id, title_en, title_id, desc_en, desc_id, due_at) values(${courseId}, ${te}, ${ti}, ${de}, ${di}, ${due})`;
  await sql`insert into notifications(user_id, title_en, title_id, body_en, body_id)
    select e.user_id, ${"New assignment: " + te}, ${"Tugas baru: " + ti}, c.title_en, c.title_id from enrollments e join courses c on c.id = e.course_id where e.course_id = ${courseId}`;
  refresh(path);
}

export async function updateAssignment(assignmentId: number, path: string, f: FormData) {
  const u = await lecturer(path);
  if (!(await owns(u.id, await courseOfAssignment(assignmentId)))) return;
  const [te, ti] = bi(f, "title"), [de, di] = bi(f, "desc"), due = jakarta(str(f, "due"));
  if (!te || !due) return;
  await sql`update assignments set title_en = ${te}, title_id = ${ti}, desc_en = ${de}, desc_id = ${di}, due_at = ${due} where id = ${assignmentId}`;
  refresh(path);
}

export async function deleteAssignment(assignmentId: number, path: string) {
  const u = await lecturer(path);
  if (!(await owns(u.id, await courseOfAssignment(assignmentId)))) return;
  await sql`delete from assignments where id = ${assignmentId}`;
  refresh(path);
}

export async function gradeSubmission(submissionId: number, path: string, f: FormData) {
  const u = await lecturer(path);
  if (!(await owns(u.id, await courseOfSubmission(submissionId)))) return;
  const raw = str(f, "grade");
  const grade = raw === "" ? null : Math.min(Math.max(parseInt(raw), 0), 100);
  if (raw !== "" && Number.isNaN(grade)) return;
  const [row] = await sql`update submissions set grade = ${grade}, feedback = ${str(f, "feedback") || null} where id = ${submissionId}
    returning user_id, assignment_id`;
  if (row && grade !== null) {
    await sql`insert into notifications(user_id, title_en, title_id, body_en, body_id)
      select ${row.user_id}, 'Your work was graded', 'Tugasmu sudah dinilai', a.title_en || ': ' || ${grade}::text, a.title_id || ': ' || ${grade}::text from assignments a where a.id = ${row.assignment_id}`;
  }
  refresh(path);
}

/* ---------- practicum ---------- */
export async function addPracticum(courseId: number, path: string, f: FormData) {
  const u = await lecturer(path);
  if (!(await owns(u.id, courseId))) return;
  const [te, ti] = bi(f, "title"), [de, di] = bi(f, "desc");
  if (!te) return;
  await sql`insert into practicums(course_id, num, title_en, title_id, desc_en, desc_id)
    values(${courseId}, (select coalesce(max(num), 0) + 1 from practicums where course_id = ${courseId}), ${te}, ${ti}, ${de}, ${di})`;
  refresh(path);
}

export async function deletePracticum(practicumId: number, path: string) {
  const u = await lecturer(path);
  const cid = await courseOfPracticum(practicumId);
  if (!cid || !(await owns(u.id, cid))) return;
  await sql`delete from progress where kind = 'practicum' and ref_id = ${practicumId}`;
  await sql`delete from practicums where id = ${practicumId}`;
  await sql`update practicums p set num = r.n from (select id, row_number() over (order by num, id)::int as n from practicums where course_id = ${cid}) r where p.id = r.id`;
  refresh(path);
}

/* ---------- weekly schedule ---------- */
const hhmm = (v: string) => (/^([01]\d|2[0-3]):[0-5]\d$/.test(v) ? v : null);
// A weekly class is stored as its next occurrence; the dashboard rolls it forward every week.
function nextOccurrence(day: number, start: string, end: string): [string, string] {
  const jakartaNow = Date.now() + 7 * 3600000;
  const diff = ((day % 7) - new Date(jakartaNow).getUTCDay() + 7) % 7;
  const date = new Date(jakartaNow + diff * 86400000).toISOString().slice(0, 10);
  return [`${date}T${start}:00+07:00`, `${date}T${end}:00+07:00`];
}
function readSlot(f: FormData, path: string) {
  const day = parseInt(str(f, "day")), start = hhmm(str(f, "start")), end = hhmm(str(f, "end"));
  if (!(day >= 1 && day <= 7) || !start || !end) return null;
  if (end <= start) redirect(`${path.split("?")[0]}?tab=schedule&e=time`);
  const kind = str(f, "kind") === "practicum" ? "practicum" : "lecture";
  const [startsAt, endsAt] = nextOccurrence(day, start, end);
  return { kind, room: str(f, "room").slice(0, 60), startsAt, endsAt };
}

export async function addEvent(courseId: number, path: string, f: FormData) {
  const u = await lecturer(path);
  if (!(await owns(u.id, courseId))) return;
  const s = readSlot(f, path);
  if (!s) return;
  await sql`insert into events(course_id, starts_at, ends_at, room, kind) values(${courseId}, ${s.startsAt}, ${s.endsAt}, ${s.room}, ${s.kind})`;
  refresh(path);
}

export async function updateEvent(eventId: number, path: string, f: FormData) {
  const u = await lecturer(path);
  if (!(await owns(u.id, await courseOfEvent(eventId)))) return;
  const s = readSlot(f, path);
  if (!s) return;
  await sql`update events set starts_at = ${s.startsAt}, ends_at = ${s.endsAt}, room = ${s.room}, kind = ${s.kind} where id = ${eventId}`;
  refresh(path);
}

export async function deleteEvent(eventId: number, path: string) {
  const u = await lecturer(path);
  if (!(await owns(u.id, await courseOfEvent(eventId)))) return;
  await sql`delete from events where id = ${eventId}`;
  refresh(path);
}
