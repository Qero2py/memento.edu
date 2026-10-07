import { createHmac } from "node:crypto";
import { headers } from "next/headers";
import { sql } from "./db";

export type RateLimitResult = { allowed: true } | { allowed: false; retryAfterSeconds: number };

function keyFor(scope: string, value: string) {
  const secret = process.env.RATE_LIMIT_SECRET || process.env.DATABASE_URL || "memento-development-rate-limit-key";
  return createHmac("sha256", secret).update(`${scope}:${value}`).digest("hex");
}

export async function consumeRateLimit(scope: string, identity: string, maximum: number, windowSeconds: number): Promise<RateLimitResult> {
  if (Math.random() < 0.01) await sql`delete from auth_rate_limits where window_started_at < now() - interval '1 day'`;
  const requestHeaders = await headers();
  const ip = requestHeaders.get("x-real-ip") || requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const keys = [keyFor(`${scope}:ip`, ip), keyFor(`${scope}:identity`, identity.toLowerCase())];

  for (const key of keys) {
    const [row] = await sql<{ attempts: number; window_started_at: string }[]>`
      insert into auth_rate_limits (key, attempts, window_started_at)
      values (${key}, 1, now())
      on conflict (key) do update set
        attempts = case when auth_rate_limits.window_started_at <= now() - (${windowSeconds} * interval '1 second') then 1 else auth_rate_limits.attempts + 1 end,
        window_started_at = case when auth_rate_limits.window_started_at <= now() - (${windowSeconds} * interval '1 second') then now() else auth_rate_limits.window_started_at end
      returning attempts, window_started_at`;
    if (row.attempts > maximum) {
      const [remaining] = await sql<{ seconds: number }[]>`select greatest(1, ceil(extract(epoch from (${row.window_started_at}::timestamptz + (${windowSeconds} * interval '1 second') - now())))::int as seconds`;
      return { allowed: false, retryAfterSeconds: remaining.seconds };
    }
  }
  return { allowed: true };
}
