# memento.edu

A bilingual (English and Bahasa Indonesia) learning management system for students and lecturers. It uses Next.js 16 App Router, TypeScript, Tailwind CSS 4, PostgreSQL, and optional Supabase Storage.

## Features

- Student and lecturer accounts with separate dashboards and course tools.
- Course sessions, materials, assignments, submissions, grades, schedules, notifications, and progress tracking.
- English and Indonesian interface with Jakarta time handling.
- Password reset demo flow and optional direct uploads to Supabase Storage.

## Requirements

- Node.js 22 or later and npm.
- A PostgreSQL database. Supabase is supported and used by the deployment setup below.

## Configure the database

1. Create a Supabase project and open **Project settings → Database → Connection string**.
2. Choose the **Transaction pooler** connection string (port 6543). URL-encode special characters in the database password.
3. Copy `.env.example` to `.env.local` and set `DATABASE_URL` to that connection string.

Optional environment variables:

| Variable | Purpose |
| --- | --- |
| `RATE_LIMIT_SECRET` | Dedicated random secret for HMAC-protected rate-limit identifiers. If omitted, the database URL is used as the HMAC key. |
| `LECTURER_CODE` | Restricts lecturer registration to people with this code. Set it before deployment if lecturer registration should be restricted. |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL, required to enable file uploads. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key, required to enable file uploads. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only Supabase service key, required to enable file uploads. Never expose it in client-side code or commit it. |
| `SUPABASE_BUCKET` | Storage bucket name; defaults to `materials`. |

File uploads are disabled unless all three Supabase URL/key variables are set. When enabled, lecturers can upload supported files up to 50 MB. Without Storage configuration, lecturers can add material links instead.

## Run locally

```bash
npm install
npm run db:setup
npm run dev
```

Open <http://localhost:3000>. The setup command creates any missing schema objects and seeds demo data only when the database has no users. It is safe to rerun against an existing database.

Demo student account:

- Email: `ahmeth@memento.edu`
- Password: `memento123`

`npm run db:reset` drops the application tables and reseeds the database. Use it only when you intend to erase existing app data.

### Updating an existing database

After pulling a change to `db/schema.sql`, run `npm run db:setup` with `DATABASE_URL` pointing to the same database used by the app. This adds the rate-limit table and indexes without dropping existing data. If login reports `relation "auth_rate_limits" does not exist`, the schema update has not been applied to the database that the app is using.

## Verify changes

Run these checks before submitting changes:

```bash
npm run typecheck
npm test
npm run build
```

The unit tests cover email and password policies, login outcomes, throttling behavior, reset-token validation, and the lecturer course-ownership check. They do not replace a database-backed integration test or a browser walkthrough.

GitHub Actions runs `npm ci`, the typecheck, unit tests, and production build on each push and pull request. Confirm the workflow passes before submitting.

For a manual demo check, verify student and lecturer login, course navigation, an assignment submission and grading flow, and password reset. Forgot-password is currently a demo flow: no email is sent, and the reset form is returned in the same flow. Connect an email provider before public production use.

## Deploy to Vercel

1. Push the project to GitHub. `.env.local` is ignored by Git; do not commit secrets.
2. Import the repository into Vercel as a Next.js project.
3. Add `DATABASE_URL` in the Vercel project settings. Use the same Supabase database initialized with `npm run db:setup`.
4. Add `RATE_LIMIT_SECRET` and `LECTURER_CODE` if needed. Add the Supabase Storage variables only if uploads should be enabled.
5. Deploy, then open `/api/health` on the deployed site to check database connectivity.

## Security notes

- Passwords are hashed with bcrypt. Login and password-reset attempts are throttled by IP and account/token.
- Session tokens are random, stored in the database, and sent in an `httpOnly`, `SameSite=Lax` cookie. Expired sessions are cleaned up during login; login replaces the current browser session token.
- Reset tokens expire after one hour, are consumed on use, and are never placed in the URL.
- Database queries use parameterized `postgres.js` templates. Lecturer actions check role and course ownership on the server.
- The reset flow is for demonstration until connected to an email provider. Do not use demo credentials for a public deployment.

## Project structure

- `app/[locale]/`: localized pages and authenticated student/lecturer routes.
- `components/`: shared UI and lecturer course tools.
- `db/schema.sql`: PostgreSQL tables and indexes.
- `lib/actions.ts`: authentication, reset, progress, and student actions.
- `lib/teach-actions.ts`: lecturer actions and ownership checks.
- `lib/queries.ts`, `lib/teach.ts`: database reads.
- `lib/i18n.ts`: English and Indonesian interface strings.
- `lib/seed.ts`: demo users, courses, timetable, and notifications.
- `tests/`: unit tests for authentication policies and flows.
- `.github/workflows/`: automated CI checks.

## Known limitations

- Password reset does not send email yet.
- Course material links are sample content until replaced with real resources.
- Supabase free projects may pause after inactivity; restore the project in Supabase before a demo if needed.
