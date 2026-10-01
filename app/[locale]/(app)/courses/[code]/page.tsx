import Link from "next/link";
import { notFound } from "next/navigation";
import { fmt, getT, isLocale, pick, type Key } from "@/lib/i18n";
import { requireUser } from "@/lib/auth";
import { submitAssignment, toggleProgress } from "@/lib/actions";
import type { Row } from "@/lib/queries";
import { assignmentsFor, courseTotals, getCourse, isEnrolled, practicumsWithState, sessionsWithState } from "@/lib/queries";
import { AssignmentStatus } from "@/components/Status";
import { Icon, Progress, kindIcon } from "@/components/ui";

const TABS = ["sessions", "materials", "assignments", "practicum"] as const;
type Tab = (typeof TABS)[number];

function Toggle({ done, action, label }: { done: boolean; action: () => Promise<void> | void; label: string }) {
  return (
    <form action={action}>
      <button aria-pressed={done} aria-label={label} title={label}
        className={`grid h-7 w-7 place-items-center rounded-full border-2 transition-colors ${done ? "border-sage bg-sage text-white" : "border-line text-transparent hover:border-sage hover:text-sage-mid"}`}>
        <Icon name="check" className="h-4 w-4" />
      </button>
    </form>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }) {
  return { title: (await params).code };
}

export default async function CoursePage({ params, searchParams }: { params: Promise<{ locale: string; code: string }>; searchParams: Promise<{ tab?: string }> }) {
  const { locale, code } = await params;
  const { tab: rawTab } = await searchParams;
  if (!isLocale(locale)) notFound();
  const t = getT(locale);
  const user = await requireUser(locale);
  const course = await getCourse(code);
  if (!course || !(await isEnrolled(user.id, course.id))) notFound();

  const tab: Tab = (TABS as readonly string[]).includes(rawTab ?? "") ? (rawTab as Tab) : "sessions";
  const path = `/${locale}/courses/${code}`;
  const [totals, sessions, assignments, practicums] = await Promise.all([
    courseTotals(user.id, course.id),
    sessionsWithState(course.id, user.id),
    tab === "assignments" ? assignmentsFor(user.id, course.id) : Promise.resolve([] as Row[]),
    tab === "practicum" ? practicumsWithState(course.id, user.id) : Promise.resolve([] as Row[]),
  ]);
  const date = (iso: string) => fmt(iso, locale, { weekday: "short", day: "numeric", month: "short" });

  return (
    <>
      <Link href={`/${locale}/courses`} className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-ink-soft hover:text-ink"><Icon name="chev" className="h-4 w-4 rotate-180" />{t("back")}</Link>
      <header className="mb-8">
        <span className="inline-flex rounded-full bg-sage-tint px-3 py-1 text-xs font-semibold text-sage-deep">{course.code}</span>
        <h1 className="h-display mt-3 text-4xl sm:text-5xl">{pick(course, "title", locale)}</h1>
        <p className="mt-3 max-w-xl text-ink-soft">{pick(course, "desc", locale)}</p>
        <p className="mt-1 text-sm text-ink-soft">{t("course.lecturer", { name: course.lecturer })}</p>
        <div className="mt-5 max-w-sm"><Progress value={totals.percent} label={pick(course, "title", locale)} /><p className="mt-2 text-sm text-ink-soft">{t("progress", { n: totals.percent })}</p></div>
      </header>

      <nav aria-label="Course" className="mb-8 flex gap-6 overflow-x-auto border-b border-line">
        {TABS.map((k) => (
          <Link key={k} href={`${path}?tab=${k}`} aria-current={tab === k ? "page" : undefined}
            className={`-mb-px whitespace-nowrap border-b-2 pb-3 text-sm font-semibold ${tab === k ? "border-ink text-ink" : "border-transparent text-ink-soft hover:text-ink"}`}>
            {t(`tab.${k}` as Key)}
          </Link>
        ))}
      </nav>

      {tab === "sessions" && !sessions.length && <p className="card p-6 text-ink-soft">{t("empty.sessions")}</p>}
      {tab === "sessions" && !!sessions.length && (
        <ol>
          {sessions.map((s, i) => {
            const done = s.state === "done";
            return (
              <li key={s.id} className="relative pb-4 pl-10 last:pb-0">
                {i < sessions.length - 1 && <span aria-hidden className={`absolute left-[11px] top-7 h-full w-px ${done ? "bg-ink" : "bg-line"}`} />}
                <span aria-hidden className={`absolute left-0 top-4 grid h-6 w-6 place-items-center rounded-full border-2 ${done ? "border-ink bg-ink text-white" : s.state === "current" ? "border-sage bg-sage ring-4 ring-sage-tint" : "border-line bg-card"}`}>
                  {done && <Icon name="check" className="h-3.5 w-3.5" />}
                </span>
                <details open={s.state === "current"} className="card">
                  <summary className="flex items-center gap-3 p-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-ink-soft">{t("session.label", { n: s.num })} - {date(s.held_on)}</p>
                      <p className="font-serif text-xl leading-snug">{pick(s, "title", locale)}</p>
                    </div>
                    <span className={`hidden rounded-full px-2.5 py-0.5 text-xs font-semibold sm:inline ${done ? "bg-ink text-white" : s.state === "current" ? "bg-sage-tint text-sage-deep" : "border border-line text-ink-soft"}`}>
                      {t(done ? "session.done" : s.state === "current" ? "session.current" : "session.upcoming")}
                    </span>
                    <Icon name="chev" className="chev h-4 w-4 shrink-0 text-ink-soft transition-transform" />
                  </summary>
                  <div className="border-t border-line p-4">
                    <p className="text-ink-soft">{pick(s, "summary", locale)}</p>
                    <ul className="mt-4 space-y-1">
                      {s.materials.map((m: Row) => (
                        <li key={m.id} className="flex items-center gap-3 rounded-lg py-1.5">
                          <Toggle done={m.done} label={t("mat.toggle")} action={toggleProgress.bind(null, "material", m.id, path)} />
                          <Icon name={kindIcon(m.kind)} className="h-4 w-4 shrink-0 text-ink-soft" />
                          <a href={m.url} target={m.url.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="min-w-0 flex-1 truncate hover:underline">{pick(m, "title", locale)}</a>
                        </li>
                      ))}
                    </ul>
                    <form action={toggleProgress.bind(null, "session", s.id, path)} className="mt-4">
                      <button className={`btn btn-sm ${done ? "btn-ghost" : "btn-primary"}`}>{t(done ? "session.undo" : "session.markdone")}</button>
                    </form>
                  </div>
                </details>
              </li>
            );
          })}
        </ol>
      )}

      {tab === "materials" && !sessions.some((s: Row) => s.materials.length) && <p className="card p-6 text-ink-soft">{t("mat.empty")}</p>}
      {tab === "materials" && (
        <div className="space-y-8">
          {(["slide", "pdf", "video", "link"] as const).map((kind) => {
            const rows = sessions.flatMap((s: Row) => s.materials.filter((m: Row) => m.kind === kind).map((m: Row) => ({ ...m, num: s.num })));
            if (!rows.length) return null;
            return (
              <section key={kind}>
                <h2 className="h-section mb-3 text-xl">{t(`kind.${kind}` as Key)}</h2>
                <ul className="card divide-y divide-line">
                  {rows.map((m) => (
                    <li key={m.id} className="flex items-center gap-3 p-4">
                      <Toggle done={m.done} label={t("mat.toggle")} action={toggleProgress.bind(null, "material", m.id, path)} />
                      <Icon name={kindIcon(m.kind)} className="h-5 w-5 shrink-0 text-sage" />
                      <div className="min-w-0 flex-1"><p className="truncate font-medium">{pick(m, "title", locale)}</p><p className="text-sm text-ink-soft">{t("session.label", { n: m.num })}</p></div>
                      <a href={m.url} target={m.url.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="btn btn-ghost btn-sm">{t("mat.open")}</a>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}

      {tab === "assignments" && !assignments.length && <p className="card p-6 text-ink-soft">{t("empty.assign")}</p>}
      {tab === "assignments" && (
        <ul className="space-y-4">
          {assignments.map((a) => (
            <li key={a.id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div><h2 className="font-serif text-xl">{pick(a, "title", locale)}</h2><p className="text-sm text-ink-soft">{t("due", { date: `${date(a.due_at)}, ${fmt(a.due_at, locale, { hour: "2-digit", minute: "2-digit", hour12: false })}` })}</p></div>
                <AssignmentStatus a={a} locale={locale} />
              </div>
              <p className="mt-3 text-ink-soft">{pick(a, "desc", locale)}</p>
              {a.content && <div className="mt-4 rounded-xl bg-sage-tint/60 p-4 text-sm"><p className="mb-1 font-semibold">{t("assign.yours")}</p><p className="whitespace-pre-wrap">{a.content}</p></div>}
              <form action={submitAssignment.bind(null, a.id, `${path}?tab=assignments`)} className="mt-4 space-y-3">
                <label className="sr-only" htmlFor={`c${a.id}`}>{t("assign.yours")}</label>
                <textarea id={`c${a.id}`} name="content" required rows={3} placeholder={t("assign.placeholder")} defaultValue={a.content ?? ""} className="input resize-y" />
                <button className="btn btn-primary btn-sm">{t(a.content ? "assign.update" : "assign.submit")}</button>
              </form>
            </li>
          ))}
        </ul>
      )}

      {tab === "practicum" && !practicums.length && <p className="card p-6 text-ink-soft">{t("empty.prac")}</p>}
      {tab === "practicum" && (
        <ul className="space-y-4">
          {practicums.map((p) => (
            <li key={p.id} className="card flex items-start gap-4 p-5">
              <Toggle done={p.done} label={t("mat.toggle")} action={toggleProgress.bind(null, "practicum", p.id, path)} />
              <div><p className="text-sm text-ink-soft">{t("prac.task", { n: p.num })}</p><h2 className="font-serif text-xl">{pick(p, "title", locale)}</h2><p className="mt-1 text-ink-soft">{pick(p, "desc", locale)}</p></div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
