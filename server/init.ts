import { pool } from "./db";

export function initDb() {
  // Create tables if they do not exist (Postgres)
  // - users: username unique
  // - signups: unique(category, item, slot)
  const ddl = `
    CREATE TABLE IF NOT EXISTS users (
      id BIGSERIAL PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL
    );

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
    );
  `;

  // Run as a single multi-statement query
  return pool.query(ddl);
}


