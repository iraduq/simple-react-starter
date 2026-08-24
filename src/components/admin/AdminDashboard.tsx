import { API_URL } from "../../lib/config";
import { useEffect, useState } from "react";
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
  Activity,
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
import { useToast } from "../Toast";

import BookingsTab from "./BookingsTab";
import RoomsTab from "./RoomsTab";
import NomenclatureTab from "./NomenclatureTab";
import PricingTab from "./PricingTab";
import AdminPlacesTab from "./AdminPlacesTab";
import UsersTab from "./UsersTab";
import AuditLogsTab from "./AuditLogsTab";
import UnitsTab from "./UnitsTab";

type TabKey =
  | "bookings"
  | "rooms"
  | "units"
  | "nomenclature"
  | "pricing"
  | "places"
  | "users"
  | "audit";

const NAV: { key: TabKey; label: string; icon: typeof LayoutDashboard }[] = [
  { key: "bookings", label: "Rezervări", icon: CalendarDays },
  { key: "rooms", label: "Camere", icon: BedDouble },
  { key: "units", label: "Unități fizice", icon: DoorOpen },
  { key: "nomenclature", label: "Facilități", icon: Tags },
  { key: "pricing", label: "Prețuri", icon: DollarSign },
  { key: "places", label: "Atracții locale", icon: MapPin },
  { key: "users", label: "Utilizatori", icon: Users },
  { key: "audit", label: "Jurnal de securitate", icon: Shield },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<SessionUser>(getCachedUser());
  const [loading, setLoading] = useState(!user);
  const [tab, setTab] = useState<TabKey>("bookings");
  const [health, setHealth] = useState<"online" | "offline" | "checking">(
    "checking",
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const handleLogout = async () => {
    await clearSession();
    toast("Te-ai deloghat cu succes.", "success");
    navigate("/");
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
      ? "bg-[#111111]"
      : health === "offline"
        ? "bg-[#111111]"
        : "bg-[#8a8a8a]";
  const healthLabel =
    health === "online"
      ? "Backend online"
      : health === "offline"
        ? "Backend offline"
        : "Se verifică…";

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="flex">
        {/* Sidebar — desktop */}
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 overflow-y-auto border-r border-[#e5e5e5] bg-white lg:block">
          <SidebarContent tab={tab} setTab={setTab} onLogout={handleLogout} />
        </aside>

        {/* Sidebar — mobile drawer */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-[#000000]/40 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <aside className="absolute left-0 top-0 h-full w-72 max-w-[85vw] overflow-y-auto border-r border-[#e5e5e5] bg-white">
              <div className="flex h-14 items-center justify-between border-b border-[#ededed] px-4">
                <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#111111]">
                  Meniu
                </span>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="text-[#6b6b6b]"
                  aria-label="Închide meniul"
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
                onLogout={handleLogout}
              />
            </aside>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-[1200px]">
            <button
              onClick={() => setSidebarOpen(true)}
              className="mb-4 inline-flex items-center gap-2 rounded-xl border border-[#e5e5e5] bg-white px-3.5 py-2.5 text-[12px] font-bold uppercase tracking-[0.14em] text-[#111111] lg:hidden"
            >
              <Menu size={15} /> Meniu
            </button>
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
    </div>
  );
}

/* ─────────────── SIDEBAR ─────────────── */
function SidebarContent({
  tab,
  setTab,
  fullName,
  initials,
  healthColor,
  healthLabel,
}: {
  tab: TabKey;
  setTab: (t: TabKey) => void;
  fullName: string;
  initials: string;
  healthColor: string;
  healthLabel: string;
}) {
  return (
    <nav className="flex flex-col gap-1 p-3 sm:p-4">
      {NAV.map((item) => {
        const Icon = item.icon;
        const active = tab === item.key;
        return (
          <button
            key={item.key}
            onClick={() => setTab(item.key)}
            className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-left text-[13px] font-semibold transition-all duration-200 sm:text-[13.5px] ${
              active
                ? "bg-[#111111] text-white"
                : "text-[#525252] hover:bg-[#f5f5f5] hover:text-[#111111]"
            }`}
          >
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                active
                  ? "bg-white/15 text-white"
                  : "bg-[#f5f5f5] text-[#111111]"
              }`}
            >
              <Icon size={15} strokeWidth={1.75} />
            </span>
            {item.label}
          </button>
        );
      })}
      <div className="mt-3 space-y-2 border-t border-[#ededed] pt-3">
        <div className="flex items-center gap-2 px-1.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#111111] text-[11px] font-bold text-white">
            {initials}
          </span>
          <span className="truncate text-[12px] font-semibold text-[#525252]">
            {fullName}
          </span>
        </div>
        <div className="flex items-center gap-2 px-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8a8a8a]">
          <Activity size={12} />
          <span className={`h-2 w-2 rounded-full ${healthColor}`} />
          {healthLabel}
        </div>
      </div>
    </nav>
  );
}
