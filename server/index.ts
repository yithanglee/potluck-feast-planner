import express from "express";
import cors from "cors";
import { initDb } from "./init";
import { db } from "./db";

initDb();

const app = express();

const PORT = Number(process.env.PORT || 3001);
const CORS_ORIGIN = process.env.CORS_ORIGIN || true; // true = reflect origin

app.use(cors({ origin: CORS_ORIGIN as any, credentials: false }));
app.use(express.json({ limit: "256kb" }));

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.post("/api/register", (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const passwordHash = String(req.body?.password_hash || "").trim();
  const name = String(req.body?.name || "").trim();

  if (!email || !passwordHash || !name) {
    return res.status(400).json({ success: false, error: "Missing email/password_hash/name" });
  }

  try {
    const createdAt = new Date().toISOString();
    const stmt = db.prepare(
      "INSERT INTO users (email, password_hash, name, created_at) VALUES (?, ?, ?, ?)"
    );
    stmt.run(email, passwordHash, name, createdAt);
    return res.json({ success: true, user: { email, name } });
  } catch (e: any) {
    const msg = String(e?.message || e);
    if (msg.includes("UNIQUE")) {
      return res.status(409).json({ success: false, error: "Email already registered" });
    }
    return res.status(500).json({ success: false, error: "Registration failed" });
  }
});

app.post("/api/login", (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const passwordHash = String(req.body?.password_hash || "").trim();

  if (!email || !passwordHash) {
    return res.status(400).json({ success: false, error: "Missing email/password_hash" });
  }

  const row = db
    .prepare("SELECT email, name FROM users WHERE email = ? AND password_hash = ?")
    .get(email, passwordHash) as { email: string; name: string } | undefined;

  if (!row) {
    return res.status(401).json({ success: false, error: "Invalid email or password" });
  }

  return res.json({ success: true, user: row });
});

app.get("/api/signups", (_req, res) => {
  const rows = db
    .prepare(
      `SELECT category, item, slot, user_email as userEmail, user_name as userName, notes, timestamp
       FROM signups
       ORDER BY timestamp DESC`
    )
    .all();
  return res.json({ success: true, signups: rows });
});

app.post("/api/signups", (req, res) => {
  const category = String(req.body?.category || "").trim();
  const item = String(req.body?.item || "").trim();
  const slot = Number(req.body?.slot);
  const userEmail = String(req.body?.user_email || "").trim().toLowerCase();
  const userName = String(req.body?.user_name || "").trim();
  const notes = String(req.body?.notes || "").trim();

  if (!category || !item || !Number.isFinite(slot) || slot <= 0 || !userEmail || !userName) {
    return res.status(400).json({ success: false, error: "Invalid signup payload" });
  }

  try {
    const timestamp = new Date().toISOString();
    db.prepare(
      `INSERT INTO signups (category, item, slot, user_email, user_name, notes, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(category, item, slot, userEmail, userName, notes, timestamp);
    return res.json({ success: true });
  } catch (e: any) {
    const msg = String(e?.message || e);
    if (msg.includes("UNIQUE")) {
      return res.status(409).json({ success: false, error: "Slot already taken" });
    }
    return res.status(500).json({ success: false, error: "Failed to add signup" });
  }
});

app.delete("/api/signups", (req, res) => {
  const category = String(req.body?.category || "").trim();
  const item = String(req.body?.item || "").trim();
  const slot = Number(req.body?.slot);
  const userEmail = String(req.body?.user_email || "").trim().toLowerCase();

  if (!category || !item || !Number.isFinite(slot) || slot <= 0 || !userEmail) {
    return res.status(400).json({ success: false, error: "Invalid remove payload" });
  }

  const info = db
    .prepare("DELETE FROM signups WHERE category = ? AND item = ? AND slot = ? AND user_email = ?")
    .run(category, item, slot, userEmail);

  if (info.changes === 0) {
    return res.status(404).json({ success: false, error: "Signup not found" });
  }

  return res.json({ success: true });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Potluck API listening on http://localhost:${PORT}`);
});


