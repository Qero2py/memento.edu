import Link from "next/link";
import { getT, pick, type Locale } from "@/lib/i18n";
import { Progress } from "./ui";

export default function CourseCard({ c, locale }: { c: Record<string, any>; locale: Locale }) {
  const t = getT(locale);
  return (
    <Link href={`/${locale}/courses/${c.code}`} className="card group block p-5 transition-colors hover:border-sage">
      <span className="text-xs font-semibold text-sage">{c.code}</span>
      <h3 className="mb-1 mt-1 font-serif text-xl leading-snug">{pick(c, "title", locale)}</h3>
      <p className="mb-5 text-sm text-ink-soft">{c.lecturer}</p>
      <Progress value={c.percent} label={pick(c, "title", locale)} />
      <p className="mt-2 text-xs text-ink-soft">{t("progress", { n: c.percent })}</p>
    </Link>
  );
}
