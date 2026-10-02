import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, pick } from "@/lib/i18n";
import { requireLecturer } from "@/lib/auth";
import { ttAll, type TKey } from "@/lib/teachText";
import { ownedCourse, teachAssignments, teachPracticums, teachSessions } from "@/lib/teach";
import type { Row } from "@/lib/db";
import { Icon } from "@/components/ui";
import SessionsTab from "@/components/teach/SessionsTab";
import AssignmentsTab from "@/components/teach/AssignmentsTab";
import PracticumTab from "@/components/teach/PracticumTab";
import InfoTab from "@/components/teach/InfoTab";

const TABS = ["sessions", "assignments", "practicum", "info"] as const;
type Tab = (typeof TABS)[number];

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }) {
  return { title: `${(await params).code} - Teaching` };
}

export default async function TeachCourse({ params, searchParams }: { params: Promise<{ locale: string; code: string }>; searchParams: Promise<{ tab?: string }> }) {
  const { locale, code } = await params;
  const { tab: raw } = await searchParams;
  if (!isLocale(locale)) notFound();
  const user = await requireLecturer(locale);
  const course = await ownedCourse(user.id, code);
  if (!course) notFound();

  const L = ttAll(locale);
  const tab: Tab = (TABS as readonly string[]).includes(raw ?? "") ? (raw as Tab) : "sessions";
  const path = `/${locale}/teach/${code}`;
  const [sessions, assignments, practicums] = await Promise.all([
    tab === "sessions" ? teachSessions(course.id) : Promise.resolve([] as Row[]),
    tab === "assignments" ? teachAssignments(course.id) : Promise.resolve([] as Row[]),
    tab === "practicum" ? teachPracticums(course.id) : Promise.resolve([] as Row[]),
  ]);

  return (
    <>
      <Link href={`/${locale}/teach`} className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-ink-soft hover:text-ink"><Icon name="chev" className="h-4 w-4 rotate-180" />{L.back}</Link>
      <header className="mb-8">
        <span className="inline-flex rounded-full bg-sage-tint px-3 py-1 text-xs font-semibold text-sage-deep">{course.code}</span>
        <h1 className="h-display mt-3 text-4xl sm:text-5xl">{pick(course, "title", locale)}</h1>
      </header>
      <nav aria-label="Course" className="mb-8 flex gap-6 overflow-x-auto border-b border-line">
        {TABS.map((k) => (
          <Link key={k} href={`${path}?tab=${k}`} aria-current={tab === k ? "page" : undefined}
            className={`-mb-px whitespace-nowrap border-b-2 pb-3 text-sm font-semibold ${tab === k ? "border-ink text-ink" : "border-transparent text-ink-soft hover:text-ink"}`}>
            {L[`tab.${k}` as TKey]}
          </Link>
        ))}
      </nav>
      {tab === "sessions" && <SessionsTab course={course} sessions={sessions} locale={locale} path={path} />}
      {tab === "assignments" && <AssignmentsTab course={course} assignments={assignments} locale={locale} path={path} />}
      {tab === "practicum" && <PracticumTab course={course} items={practicums} locale={locale} path={path} />}
      {tab === "info" && <InfoTab course={course} locale={locale} path={path} />}
    </>
  );
}
