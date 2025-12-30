import express from "express";
import cors from "cors";
import { initDb } from "./init";
import { db } from "./db";

initDb();

const app = express();

const PORT = Number(process.env.PORT || 3001);
const CORS_ORIGIN = process.env.CORS_ORIGIN || true; // true = reflect origin
const ADMIN_TOKEN = (process.env.ADMIN_TOKEN || "").trim();

app.use(cors({ origin: CORS_ORIGIN as any, credentials: false }));
app.use(express.json({ limit: "256kb" }));

app.get("/api/health", (_req, res) => res.json({ ok: true }));

function requireAdmin(req: express.Request, res: express.Response): boolean {
  if (!ADMIN_TOKEN) return true; // no token configured => allow
  const headerToken = String(req.header("x-admin-token") || "").trim();
  if (headerToken && headerToken === ADMIN_TOKEN) return true;
  res.status(401).json({ success: false, error: "Admin token required" });
  return false;
}

app.post("/api/login", (req, res) => {
  const username = String(req.body?.username || "").trim();

  if (!username) {
    return res.status(400).json({ success: false, error: "Missing username" });
  }

  try {
    const createdAt = new Date().toISOString();

    // Upsert: if username exists, keep it; otherwise create it.
    db.prepare(
      `INSERT INTO users (username, name, created_at)
       VALUES (?, ?, ?)
       ON CONFLICT(username) DO UPDATE SET name = excluded.name`
    ).run(username, username, createdAt);

    const row = db
      .prepare("SELECT username, name FROM users WHERE username = ?")
      .get(username) as { username: string; name: string };

    return res.json({ success: true, user: row });
  } catch {
    return res.status(500).json({ success: false, error: "Login failed" });
  }
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
  const userEmail = String(req.body?.user_email || "").trim();
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

app.put("/api/signups", (req, res) => {
  if (!requireAdmin(req, res)) return;

  const category = String(req.body?.category || "").trim();
  const item = String(req.body?.item || "").trim();
  const slot = Number(req.body?.slot);
  const userName = req.body?.user_name !== undefined ? String(req.body?.user_name || "").trim() : undefined;
  const notes = req.body?.notes !== undefined ? String(req.body?.notes || "").trim() : undefined;

  if (!category || !item || !Number.isFinite(slot) || slot <= 0) {
    return res.status(400).json({ success: false, error: "Invalid update payload" });
  }

  if (userName === undefined && notes === undefined) {
    return res.status(400).json({ success: false, error: "Nothing to update" });
  }

  const parts: string[] = [];
  const values: any[] = [];
  if (userName !== undefined) {
    parts.push("user_name = ?");
    values.push(userName);
  }
  if (notes !== undefined) {
    parts.push("notes = ?");
    values.push(notes);
  }
  values.push(category, item, slot);

  const info = db
    .prepare(`UPDATE signups SET ${parts.join(", ")} WHERE category = ? AND item = ? AND slot = ?`)
    .run(...values);

  if (info.changes === 0) {
    return res.status(404).json({ success: false, error: "Signup not found" });
  }

  return res.json({ success: true });
});

app.delete("/api/signups", (req, res) => {
  if (!requireAdmin(req, res)) return;

  const category = String(req.body?.category || "").trim();
  const item = String(req.body?.item || "").trim();
  const slot = Number(req.body?.slot);
  const userEmail = String(req.body?.user_email || "").trim();

  if (!category || !item || !Number.isFinite(slot) || slot <= 0) {
    return res.status(400).json({ success: false, error: "Invalid remove payload" });
  }

  const info = userEmail
    ? db
        .prepare("DELETE FROM signups WHERE category = ? AND item = ? AND slot = ? AND user_email = ?")
        .run(category, item, slot, userEmail)
    : db
        .prepare("DELETE FROM signups WHERE category = ? AND item = ? AND slot = ?")
        .run(category, item, slot);

  if (info.changes === 0) {
    return res.status(404).json({ success: false, error: "Signup not found" });
  }

  return res.json({ success: true });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Potluck API listening on http://localhost:${PORT}`);
});


