import fs from "fs";
import path from "path";
import { db, DB_PATH } from "./db";

export function initDb() {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
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
}


