export const API_URL = import.meta.env.PROD
  ? "/api"
  : import.meta.env.VITE_API_URL || "https://backend-licenta-i0lr.onrender.com";
