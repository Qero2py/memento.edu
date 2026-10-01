# memento.edu

A bilingual (English / Bahasa Indonesia) learning management system.
Next.js 16 (App Router), TypeScript, Tailwind CSS 4, PostgreSQL (Supabase).

## 1. Create the database (Supabase)

1. Create a project at https://supabase.com (free plan is fine). Save the database password.
2. Open **Project settings > Database > Connection string**, choose **Transaction pooler** (port 6543) and copy it.
3. Copy `.env.example` to `.env.local` and paste the string as `DATABASE_URL`, replacing `[YOUR-PASSWORD]`.
   If the password has special characters (`@ : / # ?`), URL-encode them.

## 2. Run locally

```bash
npm install
npm run db:setup     # creates the tables and seeds your courses (safe to re-run)
npm run dev          # http://localhost:3000
```

Demo student: `ahmeth@memento.edu` / `memento123`.
`npm run db:reset` wipes everything and reseeds (use after editing `lib/seed.ts`).

## 3. Deploy to Vercel

1. Push this folder to a GitHub repository (`.env.local` is git-ignored, so your password stays private).
2. In Vercel: **Add New > Project**, import the repository (framework is detected as Next.js).
3. Under **Environment Variables** add `DATABASE_URL` with the same Transaction pooler string.
4. Deploy. The tables already exist because you ran `npm run db:setup` against the same Supabase database.

## Structure

- `app/[locale]/` pages: landing, login, register, forgot/reset password, and the signed-in area `(app)/` (dashboard, courses, course page)
- `db/schema.sql` the database tables; `lib/seed.ts` your courses, timetable and notifications
- `lib/db.ts` connection; `lib/queries.ts` reads; `lib/actions.ts` writes (auth, progress, submissions)
- `lib/i18n.ts` every UI string as [English, Indonesian] pairs
- `proxy.ts` sends `/` to `/en` or `/id` from the browser language

## Notes

- Auth: bcrypt-hashed passwords, random session tokens stored in the database, httpOnly cookie.
- Forgot password is demo mode: the reset link appears on screen instead of being emailed.
- Material links are `#` placeholders until real URLs are added.
- Supabase free projects pause after about a week of inactivity. Open the app before a demo; if it was paused, restore it in the Supabase dashboard.
