import Link from "next/link";
import { notFound } from "next/navigation";
import { fmt, getT, isLocale, pick, type Key } from "@/lib/i18n";
import { publicCourses } from "@/lib/queries";
import { SiteFooter, SiteHeader } from "@/components/Site";
import { Icon, Trail } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function Landing({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getT(locale);
  const courses = await publicCourses();
  const demo = courses.find((c) => c.code === "03045100") ?? courses[0];
  const states = ["done", "done", "current", "next", "next"] as const;
  const trail = states.map((state, i) => ({ key: i, state, title: t(`hero.step${i + 1}` as Key), meta: t("session.label", { n: i + 1 }) }));
  const features = [
    ["book", "f.sessions"], ["file", "f.materials"], ["task", "f.assign"], ["calendar", "f.schedule"], ["check", "f.progress"], ["bell", "f.notify"],
  ] as const;

  return (
    <>
      <SiteHeader locale={locale} />
      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-14 md:pt-24 lg:grid-cols-[1.25fr_1fr]">
          <div>
            <h1 className="h-display max-w-[13ch] text-[clamp(2.9rem,7vw,5.6rem)]">{t("brand.tag")}</h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-soft">{t("hero.sub")}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href={`/${locale}/register`} className="btn btn-primary">{t("hero.cta")}</Link>
              <Link href={`/${locale}/login`} className="btn btn-ghost">{t("hero.demo")}</Link>
            </div>
          </div>
          {demo && <div className="card p-6 sm:p-8" aria-label={pick(demo, "title", locale)}>
            <p className="font-serif text-2xl">{pick(demo, "title", locale)}</p>
            <p className="mb-7 mt-1 text-sm text-ink-soft">{t("course.lecturer", { name: demo.lecturer })}</p>
            <Trail items={trail} />
          </div>}
        </section>

        <section id="about" className="scroll-mt-16 bg-ink text-white">
          <div className="mx-auto grid max-w-6xl gap-8 px-5 py-20 md:grid-cols-2 md:gap-16">
            <h2 className="h-section text-3xl md:text-4xl">{t("about.title")}</h2>
            <p className="max-w-prose text-lg leading-relaxed text-white/80">{t("about.body")}</p>
          </div>
        </section>

        <section id="courses" className="mx-auto max-w-6xl scroll-mt-16 px-5 py-20">
          <h2 className="h-section text-3xl md:text-4xl">{t("courses.title")}</h2>
          <p className="mt-2 text-ink-soft">{t("courses.sub")}</p>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {courses.map((c) => (
              <li key={c.id} className="card flex flex-col p-6">
                <span className="mb-4 inline-flex w-fit rounded-full bg-sage-tint px-3 py-1 text-xs font-semibold text-sage-deep">{c.code}</span>
                <h3 className="font-serif text-2xl">{pick(c, "title", locale)}</h3>
                <p className="mt-2 flex-1 text-ink-soft">{pick(c, "desc", locale)}</p>
                <p className="mt-5 border-t border-line pt-4 text-sm text-ink-soft">
                  {c.lecturer} &nbsp;|&nbsp; {t("courses.sessions", { n: c.session_count })} &nbsp;|&nbsp; {t("courses.credits", { n: c.credits })}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section id="features" className="mx-auto max-w-6xl scroll-mt-16 px-5 pb-24">
          <h2 className="h-section max-w-xl text-3xl md:text-4xl">{t("features.title")}</h2>
          <ul className="mt-10 grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(([icon, k]) => (
              <li key={k} className="border-t border-ink pt-5">
                <Icon name={icon} className="mb-4 h-6 w-6 text-sage" />
                <h3 className="text-lg font-semibold">{t(`${k}.t`)}</h3>
                <p className="mt-1.5 text-ink-soft">{t(`${k}.d`)}</p>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
