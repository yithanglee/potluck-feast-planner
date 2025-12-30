import fs from "fs";
import path from "path";
import { db, DB_PATH } from "./db";

export function initDb() {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

  // New schema: users are identified by username only (no password/email).
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS signups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      item TEXT NOT NULL,
      slot INTEGER NOT NULL,
      user_email TEXT NOT NULL,
      user_name TEXT NOT NULL,
      notes TEXT NOT NULL DEFAULT '',
      timestamp TEXT NOT NULL,
      UNIQUE(category, item, slot)
    );
  `);

  // Migrate older schemas:
  // - (email, password_hash, name, created_at) → (username, name, created_at)
  // - (email, name, created_at) → (username, name, created_at)
  //
  // This is safe because `signups` does not FK to `users`; it stores identifiers directly.
  const cols = db.prepare("PRAGMA table_info(users)").all() as Array<{ name: string }>;
  const hasUsername = cols.some((c) => c.name === "username");
  const hasEmail = cols.some((c) => c.name === "email");
  if (!hasUsername && hasEmail) {
    db.exec(`
      BEGIN;
      DROP TABLE IF EXISTS users_new;
      CREATE TABLE users_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      INSERT INTO users_new (id, username, name, created_at)
      SELECT id, email, name, created_at FROM users;
      DROP TABLE users;
      ALTER TABLE users_new RENAME TO users;
      COMMIT;
    `);
  }
}


