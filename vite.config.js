import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    // Dev-only: forward API calls to the Express server so the app and the
    // backend share an origin (no CORS during development).
    proxy: {
      "/api": "http://localhost:3001",
    },
  },
});
