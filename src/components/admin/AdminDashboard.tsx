import { API_URL } from "../../lib/config";
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
  DoorOpen,
} from "lucide-react";
import {
  fetchSession,
  clearSession,
  getCachedUser,
  type SessionUser,
} from "../../lib/auth";
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
import UnitsTab from "./UnitsTab";

type TabKey =
  | "overview"
  | "bookings"
  | "rooms"
  | "units"
  | "nomenclature"
  | "pricing"
  | "places"
  | "users"
  | "audit";

const NAV: { key: TabKey; label: string; icon: typeof LayoutDashboard }[] = [
  { key: "overview", label: "Prezentare generală", icon: LayoutDashboard },
  { key: "bookings", label: "Rezervări", icon: CalendarDays },
  { key: "rooms", label: "Camere & foto", icon: BedDouble },
  { key: "units", label: "Unități fizice", icon: DoorOpen },
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
  const [health, setHealth] = useState<"online" | "offline" | "checking">(
    "checking",
  );
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
    return () => {
      active = false;
    };
  }, [navigate]);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch(`${API_URL}/health`, {
          credentials: "include",
        });
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
      if (acctRef.current && !acctRef.current.contains(e.target as Node))
        setAcctOpen(false);
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
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa] text-[#8a8a8a]">
        <div className="animate-pulse text-sm uppercase tracking-[0.2em]">
          Se încarcă dashboard-ul…
        </div>
      </div>
    );
  }

  const fullName =
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
    user?.email ||
    "Admin";
  const initials = fullName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const healthColor =
    health === "online"
      ? "bg-neutral-1000"
      : health === "offline"
        ? "bg-red-500"
        : "bg-neutral-400";
  const healthLabel =
    health === "online"
      ? "Backend online"
      : health === "offline"
        ? "Backend offline"
        : "Se verifică…";

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Topbar */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-3 border-b border-[#e5e5e5] bg-white/90 px-4 backdrop-blur lg:px-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e5e5e5] text-[#111111] lg:hidden"
            aria-label="Deschide meniul"
          >
            <Menu size={17} />
          </button>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#111111] text-[12px] font-bold text-[#737373]">
              CE
            </span>
            <span
              className="text-[18px] font-semibold text-[#111111]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Casa Esy · Admin
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-2 rounded-full border border-[#e5e5e5] px-3 py-1.5 text-[11px] font-semibold text-[#525252] sm:flex">
            <span className={`h-2 w-2 rounded-full ${healthColor}`} />
            {healthLabel}
          </span>
          <div className="relative" ref={acctRef}>
            <button
              onClick={() => setAcctOpen((v) => !v)}
              className="flex items-center gap-2 rounded-full border border-[#e5e5e5] py-1.5 pl-1.5 pr-3 transition-all hover:bg-[#f5f5f5]"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#111111] text-[11px] font-bold text-white">
                {initials}
              </span>
              <span className="hidden text-[12.5px] font-semibold text-[#111111] sm:block">
                {fullName}
              </span>
              <ChevronDown size={14} className="text-[#8a8a8a]" />
            </button>
            {acctOpen && (
              <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-[#e5e5e5] bg-white py-1 shadow-xl">
                <button
                  onClick={() => void openSessions()}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-[13px] text-[#525252] hover:bg-[#f5f5f5]"
                >
                  <Monitor size={14} /> Sesiuni active
                </button>
                <button
                  onClick={() => void handleLogoutAll()}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-[13px] text-[#525252] hover:bg-[#f5f5f5]"
                >
                  <Shield size={14} /> Ieși de pe toate
                </button>
                <button
                  onClick={() => void handleLogout()}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-[13px] text-red-600 hover:bg-red-50"
                >
                  <LogOut size={14} /> Deconectare
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar — desktop */}
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 border-r border-[#e5e5e5] bg-white lg:block">
          <SidebarContent tab={tab} setTab={setTab} />
        </aside>

        {/* Sidebar — mobile drawer */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-[#000000]/40 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <aside className="absolute left-0 top-0 h-full w-72 border-r border-[#e5e5e5] bg-white">
              <div className="flex h-16 items-center justify-between border-b border-[#ededed] px-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#111111] text-[12px] font-bold text-[#737373]">
                    CE
                  </span>
                  <span className="font-['Cormorant_Garamond',serif] text-[18px] font-semibold text-[#111111]">
                    Meniu
                  </span>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="text-[#6b6b6b]"
                >
                  <X size={18} />
                </button>
              </div>
              <SidebarContent
                tab={tab}
                setTab={(t) => {
                  setTab(t);
                  setSidebarOpen(false);
                }}
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
            {tab === "units" && <UnitsTab />}
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
        <div className="fixed inset-0 z-[500] flex items-start justify-center overflow-y-auto bg-[#000000]/50 p-4 py-10 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-[#e5e5e5] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#ededed] px-6 py-4">
              <h3
                className="text-lg font-semibold text-[#111111]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Sesiuni active
              </h3>
              <button
                onClick={() => setSessionsOpen(false)}
                className="text-[#6b6b6b] hover:text-[#111111]"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-5">
              {sessions.length === 0 ? (
                <p className="py-8 text-center text-sm text-[#6b6b6b]">
                  Nicio sesiune activă.
                </p>
              ) : (
                <div className="space-y-3">
                  {sessions.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between rounded-xl border border-[#e5e5e5] p-4"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f5f5f5] text-[#111111]">
                          <Monitor size={16} />
                        </span>
                        <div>
                          <p className="text-[13px] font-semibold text-[#111111]">
                            {[s.browser_family, s.os_family]
                              .filter(Boolean)
                              .join(" · ") || "Dispozitiv necunoscut"}
                            {s.is_current && (
                              <span className="ml-2 rounded-full bg-neutral-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-neutral-800">
                                Această sesiune
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-[#6b6b6b]">
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
function SidebarContent({
  tab,
  setTab,
}: {
  tab: TabKey;
  setTab: (t: TabKey) => void;
}) {
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
                ? "bg-[#111111] text-white shadow-[0_4px_14px_rgba(13,44,92,0.2)]"
                : "text-[#525252] hover:bg-[#f5f5f5] hover:text-[#111111]"
            }`}
          >
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                active
                  ? "bg-white/10 text-[#737373]"
                  : "bg-[#f5f5f5] text-[#111111]"
              }`}
            >
              <Icon size={15} strokeWidth={1.75} />
            </span>
            {item.label}
          </button>
        );
      })}
      <div className="mt-2 border-t border-[#ededed] pt-2">
        <div className="flex items-center gap-2 px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8a8a8a]">
          <Activity size={12} /> Sistem
        </div>
      </div>
    </nav>
  );
}
