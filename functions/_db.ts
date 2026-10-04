import { neon } from "@neondatabase/serverless";

export type EnvWithDb = { DATABASE_URL?: string };

export function getSql(env: EnvWithDb) {
  const url = (env.DATABASE_URL || "").trim();
  if (!url) {
    throw new Error("DATABASE_URL is required (Cloudflare Pages env var).");
  }
  return neon(url);
}

export async function ensureSchema(sql: ReturnType<typeof getSql>) {
  // Run DDL idempotently. Separate statements to avoid multi-statement limitations.
  await sql/* sql */`
    CREATE TABLE IF NOT EXISTS users (
      id BIGSERIAL PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL
    )
  `;

  await sql/* sql */`
    CREATE TABLE IF NOT EXISTS signups (
      id BIGSERIAL PRIMARY KEY,
      category TEXT NOT NULL,
      item TEXT NOT NULL,
      slot INTEGER NOT NULL CHECK (slot > 0),
      user_email TEXT NOT NULL,
      user_name TEXT NOT NULL,
      notes TEXT NOT NULL DEFAULT '',
      timestamp TIMESTAMPTZ NOT NULL,
      CONSTRAINT signups_unique_slot UNIQUE (category, item, slot)
    )
  `;
}

