"use client";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { et, localeFromPath } from "@/lib/errorText";

export const Bar = ({ className = "" }: { className?: string }) => <div className={`animate-pulse rounded-xl bg-sage-tint ${className}`} />;

// Wrapper that announces "Loading…" to screen readers in the page's language.
export function Busy({ children }: { children: ReactNode }) {
  const locale = localeFromPath(usePathname());
  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">{et(locale, "loading")}</span>
      {children}
    </div>
  );
}

export function AuthSkeleton({ fields = 2 }: { fields?: number }) {
  return (
    <Busy>
      <div className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
        <aside className="hidden bg-ink lg:block" />
        <main className="mx-auto flex w-full max-w-sm flex-col justify-center gap-4 px-6 py-10">
          <Bar className="h-10 w-3/4" />
          <Bar className="mb-4 h-4 w-1/2" />
          {Array.from({ length: fields }, (_, i) => <Bar key={i} className="h-12 w-full" />)}
          <Bar className="h-11 w-full !rounded-full" />
        </main>
      </div>
    </Busy>
  );
}
