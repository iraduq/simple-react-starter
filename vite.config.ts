import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // Backend-ul tinta pentru proxy-ul de dezvoltare (implicit: Render).
  const target =
    env.VITE_PROXY_TARGET || "https://backend-licenta-i0lr.onrender.com";

  return {
    plugins: [react(), tailwindcss()],
    server: {
      watch: { usePolling: true },
      // Cererile /api/* merg prin Vite => same-origin, deci cookie-urile
      // de autentificare sunt first-party si nu mai e nevoie de CORS.
      proxy: {
        "/api": {
          target,
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
  };
});
