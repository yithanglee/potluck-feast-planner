import { Pool } from "pg";

const DATABASE_URL = (process.env.DATABASE_URL || "").trim();

if (!DATABASE_URL) {
  // Fail fast and clearly if the connection string is not provided
  throw new Error(
    "DATABASE_URL is required. Set it to your Neon Postgres connection string."
  );
}

let ssl: any = undefined;
try {
  const host = new URL(DATABASE_URL).hostname;
  // Neon requires SSL; auto-enable when the host looks like Neon
  if (host.endsWith("neon.tech")) {
    ssl = { rejectUnauthorized: false };
  }
} catch {
  // ignore URL parse errors; let pg handle invalid URLs later
}

export const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl,
});

export async function query<T = any>(text: string, params: any[] = []) {
  const result = await pool.query<T>(text, params);
  return result;
}


