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
  X,
  Menu,
  DoorOpen,
} from "lucide-react";
import { fetchSession, clearSession, getCachedUser } from "../../lib/auth";
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
  const [loading, setLoading] = useState(!getCachedUser());
  const [tab, setTab] = useState<TabKey>("bookings");
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

      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [navigate]);

  const handleLogout = async () => {
    await clearSession();
    toast("Te-ai deloghat cu succes.", "success");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-[#6b7c99]">
        <div className="animate-pulse text-sm uppercase tracking-[0.2em]">
          Se încarcă dashboard-ul…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-[76px] lg:pt-[96px]">
      <div className="flex">
        {/* Sidebar — desktop */}
        <aside className="sticky top-[76px] hidden h-[calc(100vh-76px)] w-64 shrink-0 overflow-y-auto border-r border-[#e1e8f0] bg-white lg:top-[96px] lg:block lg:h-[calc(100vh-96px)]">
          <SidebarContent tab={tab} setTab={setTab} onLogout={handleLogout} />
        </aside>

        {/* Sidebar — mobile drawer */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-[300] lg:hidden">
            <div
              className="absolute inset-0 bg-[#07203f]/40 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <aside className="absolute left-0 top-0 h-full w-72 max-w-[85vw] overflow-y-auto border-r border-[#e1e8f0] bg-white">
              <div className="flex h-14 items-center justify-between border-b border-[#eef2f7] px-4">
                <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#0d2c5c]">
                  Meniu
                </span>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="text-[#4f6280]"
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
              className="mb-4 inline-flex items-center gap-2 rounded-xl border border-[#e1e8f0] bg-white px-3.5 py-2.5 text-[12px] font-bold uppercase tracking-[0.14em] text-[#0d2c5c] lg:hidden"
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
  onLogout,
}: {
  tab: TabKey;
  setTab: (t: TabKey) => void;
  onLogout: () => void | Promise<void>;
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
                ? "bg-[#0d2c5c] text-white shadow-[0_10px_24px_rgba(13,44,92,0.18)]"
                : "text-[#2a3b52] hover:bg-[#f4f6f9] hover:text-[#0d2c5c]"
            }`}
          >
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                active
                  ? "bg-white/15 text-[#e6b85c]"
                  : "bg-[#f4f6f9] text-[#0d2c5c]"
              }`}
            >
              <Icon size={15} strokeWidth={1.75} />
            </span>
            {item.label}
          </button>
        );
      })}
      <div className="mt-3 border-t border-[#eef2f7] pt-3">
        <button
          onClick={() => void onLogout()}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-[13px] font-semibold text-[#2a3b52] transition-colors hover:bg-[#f4f6f9] hover:text-[#0d2c5c]"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#f4f6f9] text-[#0d2c5c]">
            <LogOut size={15} strokeWidth={1.75} />
          </span>
          Deconectare
        </button>
      </div>
    </nav>
  );
}
