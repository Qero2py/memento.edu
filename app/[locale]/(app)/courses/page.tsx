import { notFound } from "next/navigation";
import { getT, isLocale } from "@/lib/i18n";
import { requireStudent } from "@/lib/auth";
import { myCourses } from "@/lib/queries";
import CourseCard from "@/components/CourseCard";

export const metadata = { title: "My courses" };

export default async function Courses({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getT(locale);
  const user = await requireStudent(locale);
  const courses = await myCourses(user.id);
  return (
    <>
      <h1 className="h-section text-4xl">{t("nav.mycourses")}</h1>
      <p className="mb-8 mt-2 text-ink-soft">{t("mycourses.sub")}</p>
      <ul className="grid gap-4 sm:grid-cols-2">{courses.map((c) => <li key={c.id}><CourseCard c={c} locale={locale} /></li>)}</ul>
    </>
  );
}
