"use client";
import Link from "next/link";
import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Icon } from "./ui";

function Inner({ locale, label, className = "" }: { locale: "en" | "id"; label: string; className?: string }) {
  const path = usePathname();
  const qs = useSearchParams().toString();
  const other = locale === "en" ? "id" : "en";
  const href = path.replace(/^\/(en|id)/, `/${other}`) + (qs ? `?${qs}` : "");
  return (
    <Link href={href} hrefLang={other} lang={other} className={`inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink ${className}`}>
      <Icon name="globe" className="h-4 w-4" /> {label}
    </Link>
  );
}

export default function LangSwitch(props: { locale: "en" | "id"; label: string; className?: string }) {
  return <Suspense fallback={<span className={props.className} />}><Inner {...props} /></Suspense>;
}
