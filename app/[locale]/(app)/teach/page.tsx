import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, pick } from "@/lib/i18n";
import { requireLecturer } from "@/lib/auth";
import { tt, ttAll, type TKey } from "@/lib/teachText";
import { taughtCourses, unclaimedCourses } from "@/lib/teach";
import { claimCourse, createCourse } from "@/lib/teach-actions";
import { Alert } from "@/components/ui";
import SubmitButton from "@/components/SubmitButton";
import { F, formGrid } from "@/components/teach/Fields";

export const metadata = { title: "Teaching" };

export default async function Teach({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ e?: string }> }) {
  const { locale } = await params;
  const { e } = await searchParams;
  if (!isLocale(locale)) notFound();
  const user = await requireLecturer(locale);
  const [mine, free] = await Promise.all([taughtCourses(user.id), unclaimedCourses()]);
  const L = ttAll(locale), path = `/${locale}/teach`;
  const errKey = (["code", "codefmt", "fields"].includes(e ?? "") ? `e.${e}` : null) as TKey | null;

  return (
    <>
      <h1 className="h-section text-4xl">{L.title}</h1>
      <p className="mb-10 mt-2 text-ink-soft">{L.sub}</p>

      <section aria-labelledby="mine">
        <h2 id="mine" className="h-section mb-4 text-2xl">{L.mycourses}</h2>
        {mine.length === 0 ? <p className="card p-6 text-ink-soft">{L.none}</p> : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {mine.map((c) => (
              <li key={c.id}>
                <Link href={`/${locale}/teach/${c.code}`} className="card block p-5 transition-colors hover:border-sage">
                  <span className="text-xs font-semibold text-sage">{c.code}</span>
                  <h3 className="mb-3 mt-1 font-serif text-xl leading-snug">{pick(c, "title", locale)}</h3>
                  <p className="text-sm text-ink-soft">{tt(locale, "sessions", { n: c.session_count })} - {tt(locale, "assignments", { n: c.assignment_count })}</p>
                  <p className={`mt-2 inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${c.to_grade ? "bg-sage-tint text-sage-deep" : "border border-line text-ink-soft"}`}>
                    {c.to_grade ? tt(locale, "togr", { n: c.to_grade }) : L.nograde}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="claim" className="mt-12">
        <h2 id="claim" className="h-section text-2xl">{L.claim}</h2>
        <p className="mb-4 mt-1 text-ink-soft">{L["claim.sub"]}</p>
        {free.length === 0 ? <p className="text-ink-soft">{L["claim.none"]}</p> : (
          <ul className="card divide-y divide-line">
            {free.map((c) => (
              <li key={c.id} className="flex items-center gap-4 p-4">
                <div className="min-w-0 flex-1"><p className="truncate font-medium">{pick(c, "title", locale)}</p><p className="text-sm text-ink-soft">{c.code} - {c.lecturer}</p></div>
                <form action={claimCourse.bind(null, c.id, path)}><SubmitButton className="btn btn-primary btn-sm">{L["claim.btn"]}</SubmitButton></form>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="create" className="mt-12">
        <h2 id="create" className="h-section mb-4 text-2xl">{L.create}</h2>
        {errKey && <div className="mb-4"><Alert>{L[errKey]}</Alert></div>}
        <form action={createCourse.bind(null, path)} className={`${formGrid} card p-5`}>
          <F label={L["f.code"]} name="code" required /><F label={L["f.credits"]} name="credits" type="number" min={1} max={8} defaultValue={3} />
          <F label={L["f.title.en"]} name="title_en" /><F label={L["f.title.id"]} name="title_id" />
          <F label={L["f.desc.en"]} name="desc_en" rows={2} /><F label={L["f.desc.id"]} name="desc_id" rows={2} />
          <p className="text-xs text-ink-soft sm:col-span-2">{L["f.opt"]}</p>
          <div className="sm:col-span-2"><SubmitButton className="btn btn-primary btn-sm">{L["create.btn"]}</SubmitButton></div>
        </form>
      </section>
    </>
  );
}
