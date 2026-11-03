export const API_URL = import.meta.env.PROD
  ? "/api"
  : import.meta.env.VITE_API_URL || "https://backend-licenta-i0lr.onrender.com";

export const WS_URL = import.meta.env.PROD
  ? `${typeof window !== "undefined" && window.location.protocol === "https:" ? "wss:" : "ws:"}//${typeof window !== "undefined" ? window.location.host : "localhost:8000"}`
  : import.meta.env.VITE_WS_URL || "wss://backend-licenta-i0lr.onrender.com";
