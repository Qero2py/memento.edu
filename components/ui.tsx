import Link from "next/link";
import type { ReactNode } from "react";
import type { Locale } from "@/lib/i18n";

const PATHS: Record<string, string> = {
  home: "M3 11l9-8 9 8v9a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1z",
  book: "M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2zM4 19a2 2 0 012-2h13",
  check: "M5 12.5l4.5 4.5L19 7.5",
  calendar: "M4 6h16v14H4zM4 10h16M8 3v4M16 3v4",
  bell: "M6 16v-5a6 6 0 1112 0v5l2 2H4zM10 21h4",
  file: "M6 3h8l4 4v14H6zM14 3v4h4",
  play: "M8 5l11 7-11 7z",
  link: "M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1",
  out: "M9 4H5v16h4M16 8l4 4-4 4M20 12H9",
  flask: "M9 3h6M10 3v6l-5 9a2 2 0 002 3h10a2 2 0 002-3l-5-9V3",
  slide: "M3 4h18v12H3zM8 20l4-4 4 4",
  task: "M9 11l3 3 8-8M4 12v8h14v-5",
  chev: "M9 6l6 6-6 6",
  globe: "M12 3a9 9 0 100 18 9 9 0 000-18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18",
};
export function Icon({ name, className = "h-5 w-5" }: { name: keyof typeof PATHS | string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  );
}
export const kindIcon = (k: string) => ({ pdf: "file", slide: "slide", video: "play", link: "link" }[k] ?? "file");

export function Logo({ locale, light = false }: { locale: Locale; light?: boolean }) {
  return (
    <Link href={`/${locale}`} className="inline-flex items-center gap-2.5" aria-label="memento.edu">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="" width={38} height={21} className={light ? "brightness-0 invert" : ""} />
      <span className="font-serif text-[1.35rem] font-semibold tracking-tight">
        memento<span className={light ? "text-sage-mid" : "text-sage"}>.edu</span>
      </span>
    </Link>
  );
}

export function Progress({ value, label }: { value: number; label?: string }) {
  return (
    <div role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={label} className="h-1.5 w-full overflow-hidden rounded-full bg-sage-tint">
      <div className="h-full rounded-full bg-sage transition-[width] duration-500" style={{ width: `${value}%` }} />
    </div>
  );
}

export function Field({ label, name, type = "text", autoComplete, placeholder, defaultValue }: { label: string; name: string; type?: string; autoComplete?: string; placeholder?: string; defaultValue?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <input className="input" name={name} type={type} autoComplete={autoComplete} placeholder={placeholder} defaultValue={defaultValue} required />
    </label>
  );
}

export function Alert({ children, tone = "error" }: { children: ReactNode; tone?: "error" | "ok" }) {
  return (
    <p role={tone === "error" ? "alert" : "status"} className={`rounded-xl border px-4 py-3 text-sm ${tone === "error" ? "border-warn/30 bg-warn/5 text-warn" : "border-sage/30 bg-sage-tint text-sage-deep"}`}>
      {children}
    </p>
  );
}

// The signature element: a vertical trail of sessions marked with dots from the logo.
export type TrailItem = { key: string | number; title: string; meta?: string; state: "done" | "current" | "next" };
export function Trail({ items, className = "" }: { items: TrailItem[]; className?: string }) {
  return (
    <ol className={`trail-in relative ${className}`}>
      {items.map((it, i) => (
        <li key={it.key} className="relative flex gap-4 pb-6 last:pb-0">
          {i < items.length - 1 && <span aria-hidden className={`absolute left-[11px] top-6 h-full w-px ${it.state === "done" ? "bg-ink" : "bg-line"}`} />}
          <span aria-hidden className={`relative z-10 mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 ${
            it.state === "done" ? "border-ink bg-ink text-white" : it.state === "current" ? "border-sage bg-sage ring-4 ring-sage-tint" : "border-line bg-card"}`}>
            {it.state === "done" && <Icon name="check" className="h-3.5 w-3.5" />}
          </span>
          <div className="min-w-0">
            <p className={`font-medium leading-snug ${it.state === "next" ? "text-ink-soft" : ""}`}>{it.title}</p>
            {it.meta && <p className="text-sm text-ink-soft">{it.meta}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
