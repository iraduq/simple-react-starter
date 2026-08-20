import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  clearSession,
  fetchSession,
  getCachedUser,
  notifySessionChange,
  onSessionChange,
  type SessionUser,
} from "../lib/auth";
import type { AuthStatus } from "../types/auth";

type AuthContextValue = {
  user: SessionUser;
  status: AuthStatus;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  hasPermission: (permission: string) => boolean;
  reload: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Sursa unică de adevăr pentru sesiune. Încarcă utilizatorul curent prin
 * GET /auth/me la pornire; cookie-urile HttpOnly nu sunt citite manual.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser>(getCachedUser());
  const [status, setStatus] = useState<AuthStatus>("loading");

  const load = useCallback(async (force = true) => {
    const s = await fetchSession(force);
    setUser(s);
    setStatus(s ? "authenticated" : "unauthenticated");
  }, []);

  useEffect(() => {
    void load(true);
    return onSessionChange(() => {
      const cached = getCachedUser();
      setUser(cached);
      setStatus(cached ? "authenticated" : "unauthenticated");
    });
  }, [load]);

  const signOut = useCallback(async () => {
    await clearSession();
    setUser(null);
    setStatus("unauthenticated");
    notifySessionChange();
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const role = (user?.role || "").toLowerCase();
    const perms = user?.permissions ?? [];
    return {
      user,
      status,
      loading: status === "loading",
      isAuthenticated: status === "authenticated" && Boolean(user),
      isAdmin: role === "admin" || role === "superadmin" || role === "owner",
      hasPermission: (permission: string) =>
        role === "admin" || role === "superadmin" || perms.includes(permission),
      reload: () => load(true),
      signOut,
    };
  }, [user, status, load, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
