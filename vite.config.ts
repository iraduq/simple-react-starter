import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const useLocal =
    mode === "local" || env.VITE_USE_LOCAL_BACKEND === "true";
  const target =
    env.VITE_PROXY_TARGET ||
    (useLocal
      ? "http://127.0.0.1:8000"
      : "https://backend-licenta-i0lr.onrender.com");
  const isHttps = target.startsWith("https://");

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
          secure: isHttps,
          rewrite: (path) => path.replace(/^\/api/, ""),
          // Doar in dev: cookie-urile vin de la un backend HTTPS cu Secure +
          // SameSite=None, pe care browserele le resping pe pagini http://IP.
          // Cererile sunt same-origin prin proxy, deci le adaptam local.
          configure: (proxy) => {
            proxy.on("proxyRes", (proxyRes) => {
              const sc = proxyRes.headers["set-cookie"];
              if (!sc) return;
              proxyRes.headers["set-cookie"] = sc.map((c) =>
                c
                  .replace(/;\s*Secure/gi, "")
                  .replace(/;\s*SameSite=None/gi, "; SameSite=Lax"),
              );
            });
          },
        },
        "/ws": {
          target,
          ws: true,
          changeOrigin: true,
          secure: isHttps,
        },
      },
    },
  };
});
