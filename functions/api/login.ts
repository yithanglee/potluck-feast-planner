import { handleLogin } from "../handlers";

export const onRequestPost = async (ctx: { request: Request; env: { DATABASE_URL?: string } }) => {
  return handleLogin(ctx.request, ctx.env);
};
