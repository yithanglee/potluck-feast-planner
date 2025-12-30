import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

export const DB_PATH =
  process.env.DB_PATH ||
  path.resolve(process.cwd(), "server", "data", "potluck.sqlite");

// Ensure parent directory exists before opening SQLite file.
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

export const db = new Database(DB_PATH);

// Performance + safety defaults
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");


