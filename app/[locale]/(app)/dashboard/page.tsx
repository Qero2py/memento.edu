import Link from "next/link";
import { notFound } from "next/navigation";
import { fmt, getT, isLocale, pick } from "@/lib/i18n";
import { requireUser } from "@/lib/auth";
import { markAllRead } from "@/lib/actions";
import { assignmentsFor, myCourses, nextSession, notificationsFor, upcomingEvents } from "@/lib/queries";
import CourseCard from "@/components/CourseCard";
import { AssignmentStatus } from "@/components/Status";
import { Icon } from "@/components/ui";

export const metadata = { title: "Dashboard" };

export default async function Dashboard({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getT(locale);
  const user = await requireUser(locale);
  const hour = Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Jakarta", hour: "numeric", hour12: false }).format(new Date()));
  const greet = hour < 11 ? "greet.morning" : hour < 18 ? "greet.afternoon" : "greet.evening";
  const first = user.name.split(" ")[0];

  const [courses, next, allAssignments, events, notes] = await Promise.all([
    myCourses(user.id), nextSession(user.id), assignmentsFor(user.id), upcomingEvents(user.id), notificationsFor(user.id),
  ]);
  const assignments = allAssignments.sort((a, b) => Number(!!a.submitted_at) - Number(!!b.submitted_at) || a.due_at.localeCompare(b.due_at)).slice(0, 4);
  const time = { hour: "2-digit", minute: "2-digit", hour12: false } as const;
  const path = `/${locale}/dashboard`;

  return (
    <>
      <h1 className="h-section text-4xl">{t(greet, { name: first })}</h1>
      <p className="mt-2 text-ink-soft">{t("dash.sub")}</p>

      <section aria-labelledby="continue" className="mt-8 flex flex-col justify-between gap-5 rounded-2xl bg-ink p-6 text-white sm:flex-row sm:items-center sm:p-8">
        <div>
          <h2 id="continue" className="text-sm text-white/70">{t("dash.continue")}</h2>
          {next ? (
            <>
              <p className="mt-1 font-serif text-2xl sm:text-3xl">{pick(next.session, "title", locale)}</p>
              <p className="mt-1 text-white/70">{pick(next.course, "title", locale)} - {t("session.label", { n: next.session.num })}</p>
            </>
          ) : <p className="mt-1 font-serif text-2xl">{t(courses.some((c) => c.session_count > 0) ? "dash.alldone" : "dash.nosessions")}</p>}
        </div>
        {next && <Link href={`/${locale}/courses/${next.course.code}`} className="btn shrink-0 bg-white text-ink hover:bg-sage-tint">{t("dash.open")}</Link>}
      </section>

      <div className="mt-10 grid gap-10 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-10">
          <section aria-labelledby="courses">
            <h2 id="courses" className="h-section mb-4 text-2xl">{t("dash.courses")}</h2>
            {courses.length ? <ul className="grid gap-4 sm:grid-cols-2">{courses.map((c) => <li key={c.id}><CourseCard c={c} locale={locale} /></li>)}</ul> : <p className="text-ink-soft">{t("dash.nocourses")}</p>}
          </section>

          <section aria-labelledby="assign">
            <h2 id="assign" className="h-section mb-4 text-2xl">{t("dash.assign")}</h2>
            {assignments.length ? (
              <ul className="card divide-y divide-line">
                {assignments.map((a) => (
                  <li key={a.id}>
                    <Link href={`/${locale}/courses/${a.code}?tab=assignments`} className="flex items-center gap-4 p-4 hover:bg-sage-tint/40">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{pick(a, "title", locale)}</p>
                        <p className="text-sm text-ink-soft">{a.code} - {t("due", { date: fmt(a.due_at, locale, { day: "numeric", month: "short" }) })}</p>
                      </div>
                      <AssignmentStatus a={a} locale={locale} />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : <p className="text-ink-soft">{t("dash.noassign")}</p>}
          </section>
        </div>

        <div className="space-y-10">
          <section aria-labelledby="sched">
            <h2 id="sched" className="h-section mb-4 text-2xl">{t("dash.schedule")}</h2>
            {events.length ? (
              <ul className="space-y-3">
                {events.map((e) => (
                  <li key={e.id} className="card flex gap-4 p-4">
                    <div className="w-12 shrink-0 text-center">
                      <p className="font-serif text-2xl leading-none">{fmt(e.starts_at, locale, { day: "numeric" })}</p>
                      <p className="mt-1 text-xs text-ink-soft">{fmt(e.starts_at, locale, { month: "short" })}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{pick(e, "title", locale)}</p>
                      <p className="text-sm text-ink-soft">{fmt(e.starts_at, locale, time)} - {fmt(e.ends_at, locale, time)}, {e.room}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : <p className="text-ink-soft">{t("dash.nosched")}</p>}
          </section>

          <section aria-labelledby="notif">
            <div className="mb-4 flex items-baseline justify-between gap-3">
              <h2 id="notif" className="h-section text-2xl">{t("dash.notif")}</h2>
              {notes.some((n) => !n.read) && <form action={markAllRead.bind(null, path)}><button className="text-sm font-medium text-sage hover:underline">{t("dash.markread")}</button></form>}
            </div>
            {notes.length ? (
              <ul className="card divide-y divide-line">
                {notes.map((n) => (
                  <li key={n.id} className="flex gap-3 p-4">
                    <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${n.read ? "bg-line" : "bg-sage"}`} aria-hidden />
                    <div><p className="font-medium">{pick(n, "title", locale)}</p><p className="text-sm text-ink-soft">{pick(n, "body", locale)}</p></div>
                  </li>
                ))}
              </ul>
            ) : <p className="flex items-center gap-2 text-ink-soft"><Icon name="bell" className="h-4 w-4" />{t("dash.nonotif")}</p>}
          </section>
        </div>
      </div>
    </>
  );
}
