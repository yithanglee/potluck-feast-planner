import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  // Cloudflare Pages serves the site from root
  base: "/",
  server: {
    allowedHosts: ["sevenss.damienslab.com"],
    host: "::",
    port: 8080,
    proxy: {
      // Local dev: send API calls to the local Express + SQLite server
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});