import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { fetchSession, type SessionUser } from "../lib/auth";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | "loading">("loading");

  useEffect(() => {
    let active = true;
    (async () => {
      const s = await fetchSession(true);
      if (!active) return;
      setUser(s);
    })();
    return () => {
      active = false;
    };
  }, []);

  if (user === "loading") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-[#8595aa] text-sm tracking-wide uppercase">
        Se încarcă…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
