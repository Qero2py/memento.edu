import type postgres from "postgres";
import bcrypt from "bcryptjs";

type P = [string, string];
const day = 86400000;

// Time in Asia/Jakarta (UTC+7), stored as ISO/UTC.
const at = (offsetDays: number, h = 9, m = 0) => {
  const d = new Date(Date.now() + offsetDays * day);
  d.setUTCHours(h - 7, m, 0, 0);
  return d.toISOString();
};
// Days from today until the next given weekday (1 = Monday ... 6 = Saturday), counted in Jakarta time. 0 = today.
const daysUntil = (weekday: number) => (weekday - new Date(Date.now() + 7 * 3600000).getUTCDay() + 7) % 7;

type Course = {
  code: string; lecturer: string; credits: number; title: P; desc: P;
  sessions: [P, P][]; assignments: [P, P, number][]; practicum: [P, P][];
};
// Add sessions / assignments / practicum here later. Sessions look like: [["Title EN", "Judul ID"], ["Summary EN", "Ringkasan ID"]]
const course = (code: string, lecturer: string, credits: number, en: string, id: string): Course =>
  ({ code, lecturer, credits, title: [en, id], desc: [en, id], sessions: [], assignments: [], practicum: [] });

const COURSES: Course[] = [
  course("03045056", "NUR CHALIK AZHAR, M.Kom", 3, "Audit System & IT Governance", "Audit System & IT Governance"),
  course("03035999", "KUN FAYAKUN, ST., MT.", 2, "Critical and Creative Thinking", "Berpikir Kritis dan Kreatif (Kompetensi)"),
  course("03045100", "MUHAMMAD GIVI EFGIVIA, Dr., Ir., M.Kom", 3, "Big Data", "Big Data"),
  course("0000001", "FALDY IRWIENSYAH, S.Kom, MTI", 2, "Enterprise Resource Planning (ERP)", "Enterprise Resource Planning (ERP)"),
  course("03035996", "HENDI SARYANTO, ST., M.Eng", 3, "Innovation and Design Thinking", "Inovasi dan Pemikiran Desain"),
  course("03045037", "BUDI PERMANA YUSUF, Dr., MM., SE.", 3, "Entrepreneurship", "Kewirausahaan"),
  course("03045061", "TIRTA ANHARI, S.T, M.Kom", 3, "Risk Management", "Manajemen Resiko"),
  course("03045057", "MUHAMMAD GIVI EFGIVIA, Dr., Ir., M.Kom", 2, "Capstone Project Seminar", "Seminar Capstone Project"),
  course("03045058", "ERIZAL, S.Kom., M.Kom.", 3, "Decision and Executive Support Systems", "Sistem Pendukung Keputusan dan Eksekutif"),
];

// Weekly timetable from the KRS: [course code, weekday (1=Mon), start h, start m, end h, end m, room]
const TIMETABLE: [string, number, number, number, number, number, string][] = [
  ["0000001", 1, 13, 0, 14, 40, "FT-301 / Lt 301"],
  ["03045057", 1, 14, 40, 16, 20, "FT-305 / Lt 305"],
  ["03045056", 2, 9, 30, 12, 0, "FT-305 / Lt 305"],
  ["03045037", 2, 13, 0, 15, 30, "FT-403 / Lt 403"],
  ["03045100", 3, 7, 50, 10, 20, "FT-401 / Lt 401"],
  ["03045061", 3, 15, 30, 18, 0, "FT-404 / Lt 404"],
  ["03045058", 4, 14, 40, 17, 10, "FT-305 / Lt 305"],
];

export async function seed(sql: postgres.Sql<any>) {
  const hash = bcrypt.hashSync("memento123", 10);
  await sql.begin(async (tx: any) => {
    const id = async (q: PromiseLike<any[]>) => (await q)[0].id as number;

    const student = await id(tx`insert into users(name,email,password_hash,locale) values('Ahmeth Maulana Ishaq','ahmeth@memento.edu',${hash},'id') returning id`);

    const courseIds: Record<string, number> = {};
    for (const c of COURSES) {
      const cid = await id(tx`insert into courses(code,title_en,title_id,desc_en,desc_id,lecturer,credits)
        values(${c.code},${c.title[0]},${c.title[1]},${c.desc[0]},${c.desc[1]},${c.lecturer},${c.credits}) returning id`);
      courseIds[c.code] = cid;
      await tx`insert into enrollments(user_id,course_id) values(${student},${cid})`;

      for (const [i, [t, s]] of c.sessions.entries()) {
        const sid = await id(tx`insert into course_sessions(course_id,num,title_en,title_id,summary_en,summary_id,held_on)
          values(${cid},${i + 1},${t[0]},${t[1]},${s[0]},${s[1]},${at(i * 7, 9)}) returning id`);
        await tx`insert into materials(session_id,kind,title_en,title_id,url) values(${sid},'slide',${"Slides: " + t[0]},${"Slide: " + t[1]},'#')`;
        await tx`insert into materials(session_id,kind,title_en,title_id,url) values(${sid},'pdf','Reading notes','Catatan bacaan','#')`;
      }
      for (const [t, d, due] of c.assignments)
        await tx`insert into assignments(course_id,title_en,title_id,desc_en,desc_id,due_at) values(${cid},${t[0]},${t[1]},${d[0]},${d[1]},${at(due, 23, 59)})`;
      for (const [i, [t, d]] of c.practicum.entries())
        await tx`insert into practicums(course_id,num,title_en,title_id,desc_en,desc_id) values(${cid},${i + 1},${t[0]},${t[1]},${d[0]},${d[1]})`;
    }

    // First occurrence of each weekly class; the dashboard rolls these forward every week.
    for (const [code, wd, h1, m1, h2, m2, room] of TIMETABLE) {
      const off = daysUntil(wd);
      await tx`insert into events(course_id,starts_at,ends_at,room,kind) values(${courseIds[code]},${at(off, h1, m1)},${at(off, h2, m2)},${room},'lecture')`;
    }

    const notes: [P, P, number][] = [
      [["Semester Gasal 2026/2027", "Semester Gasal 2026/2027"], ["Your Semester Gasal 2026/2027 courses are ready.", "Mata kuliah Semester Gasal 2026/2027 kamu sudah tersedia."], 0],
      [["Schedule available", "Jadwal kuliah tersedia"], ["Your weekly class schedule is now available.", "Jadwal kuliah mingguan kamu sudah tersedia."], -1],
    ];
    for (const [t, b, off] of notes)
      await tx`insert into notifications(user_id,title_en,title_id,body_en,body_id,created_at) values(${student},${t[0]},${t[1]},${b[0]},${b[1]},${at(off, 8)})`;
  });
}
