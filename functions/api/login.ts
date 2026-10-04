import { ensureSchema, getSql } from "../../functions/_db";

export const onRequestPost = async (ctx: any) => {
  try {
    const body = await ctx.request.json().catch(() => ({}));
    const username = String(body?.username || "").trim();
    if (!username) {
      return json({ success: false, error: "Missing username" }, { status: 400 });
    }

    const sql = getSql(ctx.env as any);
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
};

function json(data: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(data), { ...init, headers });
}

