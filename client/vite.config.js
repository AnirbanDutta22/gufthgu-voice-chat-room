import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      // Directs any request starting with /api to the backend target
      "/api/v1": {
        target: "http://localhost:5000/api/v1", // Your backend URL
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""), // Optional: strips /api from the URL
      },
    },
  },
  plugins: [react(), tailwindcss()],
});
