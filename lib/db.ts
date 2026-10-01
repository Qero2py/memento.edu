import postgres from "postgres";

export type Row = Record<string, any>;

const url = process.env.DATABASE_URL;
const local = !url || /@(localhost|127\.0\.0\.1)/.test(url);

const options = {
  ssl: local ? (false as const) : ("require" as const),
  prepare: false, // required for Supabase's pooled (transaction mode) connections
  max: process.env.VERCEL ? 1 : 10,
  idle_timeout: 20,
  connect_timeout: 15,
  onnotice: () => {},
  // Return timestamps as ISO strings so they can be passed around and compared easily.
  types: {
    timestamptz: {
      to: 1184,
      from: [1184],
      serialize: (x: unknown) => (x instanceof Date ? x.toISOString() : String(x)),
      parse: (x: string) => new Date(x).toISOString(),
    },
  },
};

const g = globalThis as unknown as { __sql?: postgres.Sql<any> };
export const sql: postgres.Sql<any> = g.__sql ?? (g.__sql = url ? postgres(url, options) : postgres(options));
