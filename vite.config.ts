import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // GitHub Pages serves the site from `/<repo>/` in production.
  base: mode === "production" ? "/potluck-feast-planner/" : "/",
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
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
