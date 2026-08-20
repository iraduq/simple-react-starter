import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  BedDouble,
  Tags,
  DollarSign,
  MapPin,
  Users,
  Shield,
  LogOut,
  ChevronDown,
  Activity,
  Monitor,
  X,
  Menu,
} from "lucide-react";
import { fetchSession, clearSession, getCachedUser, type SessionUser } from "../../lib/auth";
import { get, post, list, errMsg, type SessionInfo } from "../../lib/admin";
import { useToast } from "../Toast";

import OverviewTab from "./OverviewTab";
import BookingsTab from "./BookingsTab";
import RoomsTab from "./RoomsTab";
import NomenclatureTab from "./NomenclatureTab";
import PricingTab from "./PricingTab";
import AdminPlacesTab from "./AdminPlacesTab";
import UsersTab from "./UsersTab";
import AuditLogsTab from "./AuditLogsTab";

type TabKey = "overview" | "bookings" | "rooms" | "nomenclature" | "pricing" | "places" | "users" | "audit";

const NAV: { key: TabKey; label: string; icon: typeof LayoutDashboard }[] = [
  { key: "overview", label: "Prezentare generală", icon: LayoutDashboard },
  { key: "bookings", label: "Rezervări", icon: CalendarDays },
  { key: "rooms", label: "Camere & unități", icon: BedDouble },
  { key: "nomenclature", label: "Tipuri & facilități", icon: Tags },
  { key: "pricing", label: "Prețuri & calendar", icon: DollarSign },
  { key: "places", label: "Atracții locale", icon: MapPin },
  { key: "users", label: "Utilizatori", icon: Users },
  { key: "audit", label: "Jurnal de securitate", icon: Shield },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<SessionUser>(getCachedUser());
  const [loading, setLoading] = useState(!user);
  const [tab, setTab] = useState<TabKey>("overview");
  const [health, setHealth] = useState<"online" | "offline" | "checking">("checking");
  const [acctOpen, setAcctOpen] = useState(false);
  const [sessionsOpen, setSessionsOpen] = useState(false);
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const acctRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const s = await fetchSession(true);
      if (!active) return;
      if (!s || s.role !== "admin") {
        navigate("/", { replace: true });
        return;
      }
      setUser(s);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [navigate]);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch("https://backend-licenta-i0lr.onrender.com/health", { credentials: "include" });
        setHealth(res.ok ? "online" : "offline");
      } catch {
        setHealth("offline");
      }
    };
    void checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (acctRef.current && !acctRef.current.contains(e.target as Node)) setAcctOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    await clearSession();
    toast("Te-ai deloghat cu succes.", "success");
    navigate("/");
  };

  const handleLogoutAll = async () => {
    try {
      await post("/auth/logout-all", {});
      toast("Deconectat de pe toate dispozitivele.", "success");
    } catch (e) {
      toast(errMsg(e), "error");
    }
    await clearSession();
    navigate("/");
  };

  const openSessions = async () => {
    setAcctOpen(false);
    setSessionsOpen(true);
    try {
      const data = await get<unknown>("/users/me/sessions");
      setSessions(list<SessionInfo>(data));
    } catch (e) {
      toast(errMsg(e), "error");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f9fc] text-[#8595aa]">
        <div className="animate-pulse text-sm uppercase tracking-[0.2em]">Se încarcă dashboard-ul…</div>
      </div>
    );
  }

  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(" ") || user?.email || "Admin";
  const initials = fullName.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

  const healthColor = health === "online" ? "bg-emerald-500" : health === "offline" ? "bg-red-500" : "bg-amber-500";
  const healthLabel = health === "online" ? "Backend online" : health === "offline" ? "Backend offline" : "Se verifică…";

  return (
    <div className="min-h-screen bg-[#f7f9fc]">
      {/* Topbar */}
      <header className="sticky top-0 z-40 border-b border-[#e1e8f0] bg-white/95 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e1e8f0] text-[#4f6280] lg:hidden"
            >
              <Menu size={18} />
            </button>
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0d2c5c] text-[14px] font-bold text-[#c69a3f]">CE</span>
              <div className="flex flex-col leading-none">
                <span className="font-['Cormorant_Garamond',serif] text-[19px] font-semibold text-[#0d2c5c]">Casa Esy</span>
                <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#c69a3f]">Panou administrare</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Health indicator */}
            <div className="hidden items-center gap-2 rounded-full border border-[#e1e8f0] px-3 py-1.5 sm:flex">
              <span className={`h-2 w-2 rounded-full ${healthColor} ${health === "checking" ? "animate-pulse" : ""}`} />
              <span className="text-[11px] font-semibold text-[#4f6280]">{healthLabel}</span>
            </div>

            {/* Profile dropdown */}
            <div className="relative" ref={acctRef}>
              <button
                onClick={() => setAcctOpen((v) => !v)}
                className="flex items-center gap-2.5 rounded-full border border-transparent py-1 pl-1 pr-3 transition-colors hover:border-[#e1e8f0]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0d2c5c] text-[13px] font-semibold text-white">
                  {initials}
                </span>
                <span className="hidden text-left sm:block">
                  <span className="block text-[13px] font-semibold leading-tight text-[#0d2c5c]">{fullName}</span>
                  <span className="block text-[11px] text-[#6b7c99]">{user?.email}</span>
                </span>
                <ChevronDown size={14} className="text-[#6b7c99]" />
              </button>

              {acctOpen && (
                <div className="absolute right-0 top-[calc(100%+8px)] w-64 rounded-xl border border-[#e1e8f0] bg-white p-3 shadow-[0_12px_40px_rgba(13,44,92,0.12)]">
                  <div className="border-b border-[#eef2f7] pb-3">
                    <p className="text-[13px] font-semibold text-[#0d2c5c]">{fullName}</p>
                    <p className="text-[11px] text-[#6b7c99]">{user?.email}</p>
                    <span className="mt-1.5 inline-block rounded-full bg-[#f4e5c8] px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.15em] text-[#8a6413]">
                      {user?.role}
                    </span>
                  </div>
                  <button
                    onClick={openSessions}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] font-medium text-[#0d2c5c] transition-colors hover:bg-[#f4f7fb]"
                  >
                    <Monitor size={15} /> Sesiuni active
                  </button>
                  <button
                    onClick={() => void handleLogout()}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] font-medium text-[#0d2c5c] transition-colors hover:bg-[#f4f7fb]"
                  >
                    <LogOut size={15} /> Deconectare
                  </button>
                  <button
                    onClick={() => void handleLogoutAll()}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] font-medium text-red-600 transition-colors hover:bg-red-50"
                  >
                    <LogOut size={15} /> Deconectare toate dispozitivele
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar — desktop */}
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 border-r border-[#e1e8f0] bg-white lg:block">
          <SidebarContent tab={tab} setTab={setTab} />
        </aside>

        {/* Sidebar — mobile drawer */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-[#07203f]/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <aside className="absolute left-0 top-0 h-full w-72 border-r border-[#e1e8f0] bg-white">
              <div className="flex h-16 items-center justify-between border-b border-[#eef2f7] px-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0d2c5c] text-[12px] font-bold text-[#c69a3f]">CE</span>
                  <span className="font-['Cormorant_Garamond',serif] text-[18px] font-semibold text-[#0d2c5c]">Meniu</span>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="text-[#6b7c99]"><X size={18} /></button>
              </div>
              <SidebarContent
                tab={tab}
                setTab={(t) => { setTab(t); setSidebarOpen(false); }}
              />
            </aside>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-[1200px]">
            {tab === "overview" && <OverviewTab />}
            {tab === "bookings" && <BookingsTab />}
            {tab === "rooms" && <RoomsTab />}
            {tab === "nomenclature" && <NomenclatureTab />}
            {tab === "pricing" && <PricingTab />}
            {tab === "places" && <AdminPlacesTab />}
            {tab === "users" && <UsersTab />}
            {tab === "audit" && <AuditLogsTab />}
          </div>
        </main>
      </div>

      {/* Sessions modal */}
      {sessionsOpen && (
        <div className="fixed inset-0 z-[500] flex items-start justify-center overflow-y-auto bg-[#07203f]/50 p-4 py-10 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-[#e1e8f0] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#eef2f7] px-6 py-4">
              <h3 className="text-lg font-semibold text-[#0d2c5c]" style={{ fontFamily: "var(--font-display)" }}>
                Sesiuni active
              </h3>
              <button onClick={() => setSessionsOpen(false)} className="text-[#6b7c99] hover:text-[#0d2c5c]"><X size={18} /></button>
            </div>
            <div className="px-6 py-5">
              {sessions.length === 0 ? (
                <p className="py-8 text-center text-sm text-[#6b7c99]">Nicio sesiune activă.</p>
              ) : (
                <div className="space-y-3">
                  {sessions.map((s) => (
                    <div key={s.id} className="flex items-center justify-between rounded-xl border border-[#e1e8f0] p-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f4f7fb] text-[#0d2c5c]">
                          <Monitor size={16} />
                        </span>
                        <div>
                          <p className="text-[13px] font-semibold text-[#0d2c5c]">
                            {[s.browser_family, s.os_family].filter(Boolean).join(" · ") || "Dispozitiv necunoscut"}
                            {s.is_current && (
                              <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-emerald-600">
                                Această sesiune
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-[#6b7c99]">
                            {s.location || "—"} · {s.ip_address || "—"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────── SIDEBAR ─────────────── */
function SidebarContent({ tab, setTab }: { tab: TabKey; setTab: (t: TabKey) => void }) {
  return (
    <nav className="flex flex-col gap-1 p-4">
      {NAV.map((item) => {
        const Icon = item.icon;
        const active = tab === item.key;
        return (
          <button
            key={item.key}
            onClick={() => setTab(item.key)}
            className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-left text-[13.5px] font-semibold transition-all duration-200 ${
              active
                ? "bg-[#0d2c5c] text-white shadow-[0_4px_14px_rgba(13,44,92,0.2)]"
                : "text-[#4f6280] hover:bg-[#f4f7fb] hover:text-[#0d2c5c]"
            }`}
          >
            <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${
              active ? "bg-white/10 text-[#c69a3f]" : "bg-[#f4f7fb] text-[#0d2c5c]"
            }`}>
              <Icon size={15} strokeWidth={1.75} />
            </span>
            {item.label}
          </button>
        );
      })}
      <div className="mt-2 border-t border-[#eef2f7] pt-2">
        <div className="flex items-center gap-2 px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8595aa]">
          <Activity size={12} /> Sistem
        </div>
      </div>
    </nav>
  );
}
