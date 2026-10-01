import { NextRequest, NextResponse } from "next/server";

// Sends "/" and any path without a language prefix to /en or /id.
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (/^\/(en|id)(\/|$)/.test(pathname)) return;
  const lang = (req.headers.get("accept-language") ?? "").toLowerCase().startsWith("id") ? "id" : "en";
  return NextResponse.redirect(new URL(`/${lang}${pathname === "/" ? "" : pathname}`, req.url));
}
export const config = { matcher: ["/((?!_next|api|.*\\..*).*)"] };
