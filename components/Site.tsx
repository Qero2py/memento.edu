import Link from "next/link";
import { getT, type Locale } from "@/lib/i18n";
import { getUser } from "@/lib/auth";
import { Logo } from "./ui";
import LangSwitch from "./LangSwitch";

export async function SiteHeader({ locale }: { locale: Locale }) {
  const t = getT(locale);
  const user = await getUser();
  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-paper/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-2 gap-y-2 px-3 py-3 sm:gap-4 sm:px-5 sm:py-3.5">
        <Logo locale={locale} />
        <nav aria-label="Main" className="hidden items-center gap-7 text-sm font-medium text-ink-soft md:flex">
          <a href="#about" className="hover:text-ink">{t("nav.about")}</a>
          <a href="#courses" className="hover:text-ink">{t("nav.courses")}</a>
          <a href="#features" className="hover:text-ink">{t("nav.features")}</a>
        </nav>
        <div className="ml-auto flex items-center gap-1.5 sm:gap-3">
          <LangSwitch locale={locale} label={t("lang.switch")} />
          {user ? (
            <Link href={`/${locale}/dashboard`} className="btn btn-primary btn-sm">{t("nav.dashboard")}</Link>
          ) : (
            <>
              <Link href={`/${locale}/login`} className="btn btn-ghost btn-sm max-sm:border-transparent max-sm:bg-transparent max-sm:px-1.5">{t("nav.login")}</Link>
              <Link href={`/${locale}/register`} className="btn btn-primary btn-sm max-sm:px-3">{t("nav.register")}</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function SiteFooter({ locale }: { locale: Locale }) {
  const t = getT(locale);
  const col = "space-y-2.5 text-sm text-ink-soft [&_a:hover]:text-ink";
  return (
    <footer className="border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 md:grid-cols-[1.6fr_1fr_1fr]">
        <div>
          <Logo locale={locale} />
          <p className="mt-3 max-w-xs font-serif text-lg text-ink-soft">{t("brand.tag")}</p>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold">{t("foot.product")}</h2>
          <ul className={col}>
            <li><a href="#about">{t("nav.about")}</a></li>
            <li><a href="#courses">{t("nav.courses")}</a></li>
            <li><a href="#features">{t("nav.features")}</a></li>
          </ul>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold">{t("foot.account")}</h2>
          <ul className={col}>
            <li><Link href={`/${locale}/login`}>{t("nav.login")}</Link></li>
            <li><Link href={`/${locale}/register`}>{t("nav.register")}</Link></li>
            <li><LangSwitch locale={locale} label={t("lang.switch")} /></li>
          </ul>
        </div>
      </div>
      <p className="border-t border-line px-5 py-5 text-center text-sm text-ink-soft">{t("foot.rights", { y: new Date().getFullYear() })}</p>
    </footer>
  );
}
