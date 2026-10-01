"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export default function NavLink({ href, children, exact = false }: { href: string; children: ReactNode; exact?: boolean }) {
  const path = usePathname();
  const active = exact ? path === href : path === href || path.startsWith(href + "/");
  return (
    <Link href={href} aria-current={active ? "page" : undefined}
      className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors ${active ? "bg-sage-tint text-sage-deep" : "text-ink-soft hover:bg-sage-tint/60 hover:text-ink"}`}>
      {children}
    </Link>
  );
}
