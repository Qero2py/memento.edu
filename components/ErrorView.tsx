"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./ui";
import { et, localeFromPath } from "@/lib/errorText";

type Props = {
  kind: "notfound" | "course" | "error";
  variant: "page" | "app"; // "page" = full screen, "app" = inside the dashboard layout
  digest?: string;
  onRetry?: () => void;
};

export default function ErrorView({ kind, variant, digest, onRetry }: Props) {
  const locale = localeFromPath(usePathname());
  const t = (k: Parameters<typeof et>[1]) => et(locale, k);
  const code = kind === "error" ? "500" : "404";
  const key = kind === "error" ? "500" : kind === "course" ? "course" : "404";
  const base = `/${locale}`;

  const content = (
    <div>
      <span className="inline-flex rounded-full bg-sage-tint px-3 py-1 text-xs font-semibold text-sage-deep">{code}</span>
      <h1 className="h-section mt-4 text-3xl sm:text-4xl">{t(`${key}.title` as "404.title")}</h1>
      <p className="mt-3 max-w-md text-ink-soft">{t(`${key}.body` as "404.body")}</p>
      {digest && <p className="mt-4 text-xs text-ink-soft">{t("ref")}: <code className="rounded bg-sage-tint px-1.5 py-0.5">{digest}</code></p>}
      <div className="mt-8 flex flex-wrap gap-3">
        {onRetry && <button onClick={onRetry} className="btn btn-primary">{t("retry")}</button>}
        {variant === "app" ? (
          <>
            <Link href={`${base}/dashboard`} className={`btn ${onRetry ? "btn-ghost" : "btn-primary"}`}>{t("dashboard")}</Link>
            <Link href={`${base}/courses`} className="btn btn-ghost">{t("courses")}</Link>
          </>
        ) : (
          <>
            <Link href={base} className={`btn ${onRetry ? "btn-ghost" : "btn-primary"}`}>{t("home")}</Link>
            <Link href={`${base}/login`} className="btn btn-ghost">{t("login")}</Link>
          </>
        )}
      </div>
    </div>
  );

  if (variant === "app") return <div role="alert" className="card mt-4 max-w-xl p-8 sm:p-10">{content}</div>;
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <header className="mx-auto w-full max-w-5xl px-5 py-5"><Logo locale={locale} /></header>
      <main role="alert" className="mx-auto flex w-full max-w-5xl flex-1 items-center px-5 pb-20">{content}</main>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="" aria-hidden className="pointer-events-none absolute bottom-10 right-8 hidden w-56 opacity-[0.07] sm:block" />
    </div>
  );
}
