import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";
import App from "./App.tsx";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "410501815287-drt4c6ll5dk5v8rrr0sbmur2ptlq4of8.apps.googleusercontent.com";

createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId={CLIENT_ID} locale="ro">
    <App />
  </GoogleOAuthProvider>,
);
