-- memento.edu schema (PostgreSQL / Supabase)
create table if not exists users (
  id serial primary key,
  name text not null,
  email text unique not null,
  password_hash text not null,
  role text not null default 'student',
  locale text not null default 'en'
);
create table if not exists auth_sessions (
  token text primary key,
  user_id int not null references users(id) on delete cascade,
  expires_at timestamptz not null
);
create table if not exists reset_tokens (
  token text primary key,
  user_id int not null references users(id) on delete cascade,
  expires_at timestamptz not null
);
create table if not exists auth_rate_limits (
  key text primary key,
  attempts int not null,
  window_started_at timestamptz not null
);
create table if not exists courses (
  id serial primary key,
  code text unique not null,
  title_en text not null, title_id text not null,
  desc_en text, desc_id text,
  lecturer text, credits int
);
create table if not exists enrollments (
  user_id int references users(id) on delete cascade,
  course_id int references courses(id) on delete cascade,
  primary key (user_id, course_id)
);
create table if not exists course_sessions (
  id serial primary key,
  course_id int not null references courses(id) on delete cascade,
  num int not null,
  title_en text not null, title_id text not null,
  summary_en text, summary_id text,
  held_on timestamptz
);
create table if not exists materials (
  id serial primary key,
  session_id int not null references course_sessions(id) on delete cascade,
  kind text not null,
  title_en text not null, title_id text not null,
  url text not null default '#'
);
create table if not exists assignments (
  id serial primary key,
  course_id int not null references courses(id) on delete cascade,
  title_en text not null, title_id text not null,
  desc_en text, desc_id text,
  due_at timestamptz not null
);
create table if not exists submissions (
  id serial primary key,
  assignment_id int not null references assignments(id) on delete cascade,
  user_id int not null references users(id) on delete cascade,
  content text,
  submitted_at timestamptz not null default now(),
  grade int,
  unique (assignment_id, user_id)
);
create table if not exists practicums (
  id serial primary key,
  course_id int not null references courses(id) on delete cascade,
  num int not null,
  title_en text not null, title_id text not null,
  desc_en text, desc_id text
);
create table if not exists progress (
  user_id int references users(id) on delete cascade,
  kind text not null,
  ref_id int not null,
  primary key (user_id, kind, ref_id)
);
create table if not exists events (
  id serial primary key,
  course_id int not null references courses(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  room text,
  kind text not null default 'lecture'
);
create table if not exists notifications (
  id serial primary key,
  user_id int not null references users(id) on delete cascade,
  title_en text not null, title_id text not null,
  body_en text, body_id text,
  created_at timestamptz not null default now(),
  read boolean not null default false
);
create index if not exists idx_sessions_course on course_sessions(course_id);
create index if not exists idx_materials_session on materials(session_id);
create index if not exists idx_notifications_user on notifications(user_id, created_at desc);
create index if not exists idx_auth_sessions_user on auth_sessions(user_id);
create index if not exists idx_reset_tokens_user on reset_tokens(user_id);
create index if not exists idx_enrollments_course on enrollments(course_id);
create index if not exists idx_assignments_course on assignments(course_id);
create index if not exists idx_submissions_user on submissions(user_id);
create index if not exists idx_practicums_course on practicums(course_id);
create index if not exists idx_events_course on events(course_id);

-- Lecturer features (safe to re-run)
alter table courses add column if not exists lecturer_id int references users(id) on delete set null;
alter table materials add column if not exists storage_path text;
alter table submissions add column if not exists feedback text;
create index if not exists idx_courses_lecturer on courses(lecturer_id);
create index if not exists idx_auth_sessions_expiry on auth_sessions(expires_at);
create index if not exists idx_auth_rate_limits_window on auth_rate_limits(window_started_at);
