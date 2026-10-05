import { ensureSchema, getSql, type EnvWithDb } from "./_db";

type Env = EnvWithDb & { ADMIN_TOKEN?: string };

export function handleHealth() {
  return json({ ok: true });
}

export async function handleLogin(request: Request, env: Env) {
  try {
    const body = await request.json().catch(() => ({}));
    const username = String((body as { username?: string })?.username || "").trim();
    if (!username) {
      return json({ success: false, error: "Missing username" }, { status: 400 });
    }

    const sql = getSql(env);
    await ensureSchema(sql);

    const createdAt = new Date().toISOString();
    await sql/* sql */`
      INSERT INTO users (username, name, created_at)
      VALUES (${username}, ${username}, ${createdAt})
      ON CONFLICT (username) DO UPDATE SET name = EXCLUDED.name
    `;

    const rows = await sql<{ username: string; name: string }[]>/* sql */`
      SELECT username, name FROM users WHERE username = ${username}
    `;
    const user = rows[0];
    return json({ success: true, user });
  } catch {
    return json({ success: false, error: "Login failed" }, { status: 500 });
  }
}

export async function handleSignups(request: Request, env: Env) {
  if (request.method === "GET") return listSignups(env);
  if (request.method === "POST") return createSignup(request, env);
  if (request.method === "PUT") return updateSignup(request, env);
  if (request.method === "DELETE") return deleteSignup(request, env);
  return json({ success: false, error: "Method not allowed" }, { status: 405 });
}

async function listSignups(env: Env) {
  const sql = getSql(env);
  await ensureSchema(sql);
  const rows = await sql/* sql */`
    SELECT
      category,
      item,
      slot,
      user_email AS "userEmail",
      user_name AS "userName",
      notes,
      timestamp
    FROM signups
    ORDER BY timestamp DESC
  `;
  return json({ success: true, signups: rows });
}

async function createSignup(request: Request, env: Env) {
  const sql = getSql(env);
  await ensureSchema(sql);

  const body = await request.json().catch(() => ({}));
  const category = String(body?.category || "").trim();
  const item = String(body?.item || "").trim();
  const slot = Number(body?.slot);
  const userEmail = String(body?.user_email || "").trim();
  const userName = String(body?.user_name || "").trim();
  const notes = String(body?.notes || "").trim();

  if (!category || !item || !Number.isFinite(slot) || slot <= 0 || !userEmail || !userName) {
    return json({ success: false, error: "Invalid signup payload" }, { status: 400 });
  }

  try {
    const timestamp = new Date().toISOString();
    await sql/* sql */`
      INSERT INTO signups (category, item, slot, user_email, user_name, notes, timestamp)
      VALUES (${category}, ${item}, ${slot}, ${userEmail}, ${userName}, ${notes}, ${timestamp})
    `;
    return json({ success: true });
  } catch (e: any) {
    const code = e?.code || "";
    const msg = String(e?.message || "");
    if (code === "23505" || msg.toLowerCase().includes("duplicate key")) {
      return json({ success: false, error: "Slot already taken" }, { status: 409 });
    }
    return json({ success: false, error: "Failed to add signup" }, { status: 500 });
  }
}

async function updateSignup(request: Request, env: Env) {
  if (!requireAdmin(request, env)) return unauthorized();

  const sql = getSql(env);
  await ensureSchema(sql);

  const body = await request.json().catch(() => ({}));
  const category = String(body?.category || "").trim();
  const item = String(body?.item || "").trim();
  const slot = Number(body?.slot);
  const userName =
    body?.user_name !== undefined ? String(body?.user_name || "").trim() : undefined;
  const notes = body?.notes !== undefined ? String(body?.notes || "").trim() : undefined;

  if (!category || !item || !Number.isFinite(slot) || slot <= 0) {
    return json({ success: false, error: "Invalid update payload" }, { status: 400 });
  }
  if (userName === undefined && notes === undefined) {
    return json({ success: false, error: "Nothing to update" }, { status: 400 });
  }

  let rows: Array<{ updated: number }> = [];
  if (userName !== undefined && notes !== undefined) {
    rows = await sql/* sql */`
      UPDATE signups
      SET user_name = ${userName}, notes = ${notes}
      WHERE category = ${category} AND item = ${item} AND slot = ${slot}
      RETURNING 1 AS updated
    `;
  } else if (userName !== undefined) {
    rows = await sql/* sql */`
      UPDATE signups
      SET user_name = ${userName}
      WHERE category = ${category} AND item = ${item} AND slot = ${slot}
      RETURNING 1 AS updated
    `;
  } else if (notes !== undefined) {
    rows = await sql/* sql */`
      UPDATE signups
      SET notes = ${notes}
      WHERE category = ${category} AND item = ${item} AND slot = ${slot}
      RETURNING 1 AS updated
    `;
  }

  if (!rows.length) {
    return json({ success: false, error: "Signup not found" }, { status: 404 });
  }
  return json({ success: true });
}

async function deleteSignup(request: Request, env: Env) {
  if (!requireAdmin(request, env)) return unauthorized();

  const sql = getSql(env);
  await ensureSchema(sql);
  const body = await request.json().catch(() => ({}));

  const category = String(body?.category || "").trim();
  const item = String(body?.item || "").trim();
  const slot = Number(body?.slot);
  const userEmail = String(body?.user_email || "").trim();

  if (!category || !item || !Number.isFinite(slot) || slot <= 0) {
    return json({ success: false, error: "Invalid remove payload" }, { status: 400 });
  }

  const rows = userEmail
    ? await sql/* sql */`
        DELETE FROM signups
        WHERE category = ${category} AND item = ${item} AND slot = ${slot} AND user_email = ${userEmail}
        RETURNING 1 AS deleted
      `
    : await sql/* sql */`
        DELETE FROM signups
        WHERE category = ${category} AND item = ${item} AND slot = ${slot}
        RETURNING 1 AS deleted
      `;

  if (!rows.length) {
    return json({ success: false, error: "Signup not found" }, { status: 404 });
  }
  return json({ success: true });
}

function requireAdmin(request: Request, env: Env): boolean {
  const ADMIN_TOKEN = String(env.ADMIN_TOKEN || "").trim();
  if (!ADMIN_TOKEN) return true;
  const token = String(request.headers.get("x-admin-token") || "").trim();
  return Boolean(token && token === ADMIN_TOKEN);
}

function unauthorized() {
  return json({ success: false, error: "Admin token required" }, { status: 401 });
}

function json(data: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(data), { ...init, headers });
}
