import { useEffect, useState } from "react";
import { Navigate } from "@/lib/router-compat";
import { fetchSession, type SessionUser } from "../lib/auth";
import { usePreviewMode } from "../hooks/usePreviewMode";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const preview = usePreviewMode();
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
    if (preview) {
      return (
        <>
          <div className="bg-[#fff6e0] border-b border-[#f0dcaa] px-4 py-2.5 text-center text-[12px] text-[#8a6a1f]">
            Mod preview — vezi interfața de administrare fără autentificare.
            Datele apar când backendul este pornit.
          </div>
          {children}
        </>
      );
    }
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
