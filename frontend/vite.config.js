// =============================================================
// vite.config.js
// Purpose: Vite build configuration.
//          Proxy /api calls to the Node.js backend on port 5000.
// =============================================================

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Forward API requests to backend (uncomment when backend is ready)
    // proxy: {
    //   "/api": "http://localhost:5000",
    // },
  },
});
