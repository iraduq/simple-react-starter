export const API_URL = import.meta.env.PROD
  ? "/api"
  : import.meta.env.VITE_API_URL || "/api";

export const WS_URL =
  import.meta.env.VITE_WS_URL || "wss://backend-licenta-i0lr.onrender.com";
