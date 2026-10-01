import type { ReactNode } from "react";
import { getT, type Locale } from "@/lib/i18n";
import { Logo } from "./ui";
import LangSwitch from "./LangSwitch";

export default function AuthShell({ locale, title, sub, children }: { locale: Locale; title: string; sub: string; children: ReactNode }) {
  const t = getT(locale);
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-ink p-12 text-white lg:flex">
        <Logo locale={locale} light />
        <p className="h-display max-w-[11ch] text-6xl">{t("brand.tag")}</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="" aria-hidden className="pointer-events-none absolute -bottom-16 -right-16 w-96 opacity-[0.07] brightness-0 invert" />
      </aside>
      <main className="flex flex-col px-6 py-8 sm:px-12">
        <div className="flex items-center justify-between lg:justify-end">
          <span className="lg:hidden"><Logo locale={locale} /></span>
          <LangSwitch locale={locale} label={t("lang.switch")} />
        </div>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          <h1 className="h-section text-4xl">{title}</h1>
          {sub && <p className="mt-2 text-ink-soft">{sub}</p>}
          <div className="mt-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
