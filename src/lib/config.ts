const useLocalWs =
  import.meta.env.DEV &&
  (import.meta.env.MODE === "local" ||
    import.meta.env.VITE_USE_LOCAL_BACKEND === "true" ||
    Boolean(import.meta.env.VITE_PROXY_TARGET?.includes("127.0.0.1")) ||
    Boolean(import.meta.env.VITE_PROXY_TARGET?.includes("localhost")));

const localWsOrigin =
  typeof window !== "undefined"
    ? `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}`
    : "ws://localhost:5173";

export const API_URL = import.meta.env.PROD
  ? "/api"
  : import.meta.env.VITE_API_URL || "/api";

export const WS_URL =
  import.meta.env.VITE_WS_URL ||
  (useLocalWs ? localWsOrigin : "wss://backend-licenta-i0lr.onrender.com");
