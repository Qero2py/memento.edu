import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Open /api/health on the deployed site to check the database connection.
export async function GET() {
  const url = process.env.DATABASE_URL;
  const info = {
    hasDatabaseUrl: !!url,
    port: url?.match(/:(\d+)\/[^/]*$/)?.[1] ?? null,
    looksLikePooler: url ? url.includes("pooler.supabase.com") : false,
    looksLikeDirect: url ? /@db\.[a-z0-9]+\.supabase\.co/.test(url) : false,
  };
  const t0 = Date.now();
  try {
    await sql`select 1`;
    const [{ users, courses }] = await sql`select (select count(*) from users)::int as users, (select count(*) from courses)::int as courses`;
    return NextResponse.json({ ok: true, ms: Date.now() - t0, users, courses, ...info });
  } catch (e: any) {
    return NextResponse.json({ ok: false, ms: Date.now() - t0, error: e?.code ?? e?.name, message: String(e?.message ?? e).slice(0, 200), ...info }, { status: 500 });
  }
}
