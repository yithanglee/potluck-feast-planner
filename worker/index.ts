import { handleHealth, handleLogin, handleSignups } from "../functions/handlers";

interface Fetcher {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}

interface Env {
  DATABASE_URL?: string;
  ADMIN_TOKEN?: string;
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/health" && request.method === "GET") {
      return handleHealth();
    }
    if (url.pathname === "/api/login" && request.method === "POST") {
      return handleLogin(request, env);
    }
    if (url.pathname === "/api/signups") {
      return handleSignups(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};
