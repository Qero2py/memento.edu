import type { ReactNode } from "react";
import { notFound, redirect } from "next/navigation";
import { getT, isLocale } from "@/lib/i18n";
import { requireUser } from "@/lib/auth";
import { taughtCourses } from "@/lib/teach";
import { tt } from "@/lib/teachText";
import { logout } from "@/lib/actions";
import { myCourses } from "@/lib/queries";
import { Icon, Logo } from "@/components/ui";
import NavLink from "@/components/NavLink";
import LangSwitch from "@/components/LangSwitch";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const user = await requireUser(locale);
  const t = getT(locale);
  const lecturer = user.role === "lecturer";
  const courses = lecturer ? await taughtCourses(user.id) : await myCourses(user.id);
  return (
    <div className="lg:grid lg:grid-cols-[264px_1fr]">
      <aside className="border-b border-line bg-card/60 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-5 py-4 lg:py-6"><Logo locale={locale} /><LangSwitch locale={locale} label={t("lang.switch")} className="lg:hidden" /></div>
        <nav aria-label="App" className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-1 lg:flex-col lg:overflow-y-auto lg:pb-0">
          {lecturer ? (
            <NavLink href={`/${locale}/teach`} exact><Icon name="task" className="h-[18px] w-[18px]" />{tt(locale, "nav.teaching")}</NavLink>
          ) : (
            <>
              <NavLink href={`/${locale}/dashboard`} exact><Icon name="home" className="h-[18px] w-[18px]" />{t("nav.dashboard")}</NavLink>
              <NavLink href={`/${locale}/courses`} exact><Icon name="book" className="h-[18px] w-[18px]" />{t("nav.mycourses")}</NavLink>
            </>
          )}
          <ul className="hidden lg:mt-4 lg:block lg:space-y-0.5 lg:border-t lg:border-line lg:pt-4">
            {courses.map((c) => (
              <li key={c.id}>
                <NavLink href={`/${locale}/${lecturer ? "teach" : "courses"}/${c.code}`}>
                  <span className="truncate">{locale === "id" ? c.title_id : c.title_en}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="hidden border-t border-line p-4 lg:block">
          <LangSwitch locale={locale} label={t("lang.switch")} className="mb-4 px-1" />
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink text-sm font-semibold text-white" aria-hidden>{user.name[0]}</span>
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{user.name}</p><p className="truncate text-xs text-ink-soft">{user.email}</p></div>
            <form action={logout}>
              <input type="hidden" name="locale" value={locale} />
              <button className="rounded-lg p-2 text-ink-soft hover:bg-sage-tint hover:text-ink" aria-label={t("nav.logout")} title={t("nav.logout")}><Icon name="out" className="h-[18px] w-[18px]" /></button>
            </form>
          </div>
        </div>
      </aside>
      <main className="mx-auto w-full max-w-5xl px-5 py-8 lg:px-10 lg:py-12">
        {children}
        <form action={logout} className="mt-12 lg:hidden"><input type="hidden" name="locale" value={locale} /><button className="btn btn-ghost btn-sm">{t("nav.logout")}</button></form>
      </main>
    </div>
  );
}
