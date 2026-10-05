import { handleSignups } from "../handlers";

type Ctx = { request: Request; env: { DATABASE_URL?: string; ADMIN_TOKEN?: string } };

export const onRequestGet = (ctx: Ctx) => handleSignups(ctx.request, ctx.env);
export const onRequestPost = (ctx: Ctx) => handleSignups(ctx.request, ctx.env);
export const onRequestPut = (ctx: Ctx) => handleSignups(ctx.request, ctx.env);
export const onRequestDelete = (ctx: Ctx) => handleSignups(ctx.request, ctx.env);
