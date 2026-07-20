import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The build lands in ../public, which the Express server (and Vercel) serve
// statically with an SPA fallback — one deployment runs the whole app.
// In dev, /api is proxied to the local Express backend on port 3000.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
  build: {
    outDir: "../public",
    emptyOutDir: true,
  },
});
