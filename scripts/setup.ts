import { sql } from "../lib/db";
import { seed } from "../lib/seed";
import { ensureBucket, storageEnabled, BUCKET } from "../lib/storage";

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.");
    process.exit(1);
  }
  if (process.argv.includes("--reset")) {
    await sql`drop table if exists notifications, events, progress, practicums, submissions, assignments, materials, course_sessions, enrollments, courses, reset_tokens, auth_sessions, users cascade`;
    console.log("Dropped all tables.");
  }
  await sql.file("db/schema.sql");
  console.log("Schema ready.");
  if (storageEnabled()) {
    try { await ensureBucket(); console.log(`Storage bucket "${BUCKET}" ready.`); }
    catch (e: any) { console.warn("Could not prepare the storage bucket:", e?.message ?? e); }
  } else console.log("File uploads are off (storage variables not set). Lecturers can still paste links.");
  const [{ n }] = await sql`select count(*)::int as n from users`;
  if (n === 0) {
    await seed(sql);
    console.log("Seeded demo data. Login: ahmeth@memento.edu / memento123");
  } else {
    console.log("Database already has data. Run `npm run db:reset` to wipe and reseed.");
  }
  await sql.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
