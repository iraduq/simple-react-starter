import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
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
  TrendingUp,
  UtensilsCrossed,
  KeyRound,
  LayoutDashboard,
} from "lucide-react";
import { fetchSession, clearSession, getCachedUser } from "../../lib/auth";
import { useToast } from "../Toast";

import BookingsTab from "./BookingsTab";
import RoomsTab from "./RoomsTab";
import NomenclatureTab from "./NomenclatureTab";
import PricingTab from "./PricingTab";
import AdminPlacesTab from "./AdminPlacesTab";
import AdminMenuTab from "./AdminMenuTab";
import UsersTab from "./UsersTab";
import AuditLogsTab from "./AuditLogsTab";
import UnitsTab from "./UnitsTab";
import SmartLockTab from "./SmartLockTab";
import AnalyticsTab from "./AnalyticsTab";

export type TabKey =
  | "bookings"
  | "rooms"
  | "units"
  | "smartlocks"
  | "nomenclature"
  | "pricing"
  | "places"
  | "menu"
  | "analytics"
  | "users"
  | "audit";

const NAV: { key: TabKey; label: string; icon: typeof LayoutDashboard }[] = [
  { key: "bookings", label: "Rezervări", icon: CalendarDays },
  { key: "rooms", label: "Camere", icon: BedDouble },
  { key: "units", label: "Unități fizice", icon: DoorOpen },
  { key: "smartlocks", label: "Smart Lock & Uși", icon: KeyRound },
  { key: "nomenclature", label: "Facilități", icon: Tags },
  { key: "pricing", label: "Prețuri", icon: DollarSign },
  { key: "places", label: "Locații", icon: MapPin },
  { key: "menu", label: "Meniu & Bar", icon: UtensilsCrossed },
  { key: "analytics", label: "Analize & Rapoarte AI", icon: TrendingUp },
  { key: "users", label: "Utilizatori", icon: Users },
  { key: "audit", label: "Jurnal de securitate", icon: Shield },
];

/* ───────────────────────────────────────────────
   DECORATIVE FLOATING MARINE MOTIFS (WEBSITE THEME)
─────────────────────────────────────────────── */
function SunRing({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" className={className}>
      <circle cx="60" cy="60" r="22" stroke="currentColor" strokeWidth="1.2" />
      <circle
        cx="60"
        cy="60"
        r="34"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeDasharray="2 5"
      />
      {Array.from({ length: 16 }).map((_, i) => {
        const a = (i * Math.PI * 2) / 16;
        const x1 = 60 + Math.cos(a) * 44;
        const y1 = 60 + Math.sin(a) * 44;
        const x2 = 60 + Math.cos(a) * (i % 2 ? 52 : 58);
        const y2 = 60 + Math.sin(a) * (i % 2 ? 52 : 58);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

function Shell({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
      <path
        d="M50 92 L8 44 Q50 -8 92 44 Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      {[-30, -15, 0, 15, 30].map((o) => (
        <path
          key={o}
          d={`M50 92 Q${50 + o * 0.4} 50 ${50 + o * 0.7} 22`}
          stroke="currentColor"
          strokeWidth="0.9"
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}

const float = (duration: number, y: number, rotate: number, delay = 0) => ({
  animate: {
    y: [-y / 2, y / 2, -y / 2],
    rotate: [-rotate / 2, rotate / 2, -rotate / 2],
  },
  transition: {
    duration,
    repeat: Infinity,
    ease: "easeInOut" as const,
    delay,
  },
});

export default function AdminDashboard({ initialTab }: { initialTab?: TabKey }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(!getCachedUser());

  const queryTab = searchParams.get("tab") as TabKey | null;
  const [tab, setTab] = useState<TabKey>(
    initialTab || (queryTab && NAV.some((n) => n.key === queryTab) ? queryTab : "bookings")
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const mainScrollRef = useRef<HTMLElement>(null);

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

  const handleSelectTab = (newTab: TabKey) => {
    setTab(newTab);
    setSearchParams({ tab: newTab });
  };

  const handleLogout = async () => {
    await clearSession();
    toast("Te-ai deloghat cu succes.", "success");
    navigate("/");
  };

  useEffect(() => {
    mainScrollRef.current?.scrollTo({ top: 0, left: 0 });
  }, [tab]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-[#6b7c99]">
        <div className="animate-pulse text-sm uppercase tracking-[0.2em] text-[#0d2c5c]">
          Se încarcă dashboard-ul…
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full bg-white pt-[68px] sm:pt-20 overflow-hidden">
      {/* ── FLOATING LUXURY BACKGROUND MOTIFS (CASA ESY THEME) ── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <motion.div
          {...float(14, 20, 10, 0)}
          className="absolute top-[18%] left-[16%] opacity-[0.035] hidden xl:block"
        >
          <SunRing className="h-56 w-56 text-[#0d2c5c]" />
        </motion.div>
        <motion.div
          {...float(16, 24, -12, 1.5)}
          className="absolute top-[55%] right-[4%] opacity-[0.045] hidden lg:block"
        >
          <Shell className="h-48 w-48 text-[#c69a3f]" />
        </motion.div>
        <motion.div
          {...float(18, 16, 8, 2.5)}
          className="absolute bottom-[8%] left-[24%] opacity-[0.04] hidden md:block"
        >
          <SunRing className="h-44 w-44 text-[#c69a3f]" />
        </motion.div>
      </div>

      <div className="relative z-10 flex h-full w-full overflow-hidden">
        {/* Sidebar — desktop */}
        <aside className="hidden h-full w-64 shrink-0 overflow-y-auto border-r border-[#e1e8f0] bg-white lg:block">
          <SidebarContent tab={tab} setTab={handleSelectTab} onLogout={handleLogout} />
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
                  className="text-[#4f6280] hover:text-[#0d2c5c]"
                  aria-label="Închide meniul"
                >
                  <X size={18} />
                </button>
              </div>
              <SidebarContent
                tab={tab}
                setTab={(t) => {
                  handleSelectTab(t);
                  setSidebarOpen(false);
                }}
                onLogout={handleLogout}
              />
            </aside>
          </div>
        )}

        {/* Main content — shifted up and left */}
        <main ref={mainScrollRef} className="flex-1 h-full overflow-y-auto px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-5 overflow-x-hidden w-full max-w-full">
          <div className="w-full max-w-[1400px]">
            <button
              onClick={() => setSidebarOpen(true)}
              className="mb-3 inline-flex items-center gap-2 rounded-xl border border-[#e1e8f0] bg-white px-3.5 py-2.5 text-[12px] font-bold uppercase tracking-[0.14em] text-[#0d2c5c] shadow-sm lg:hidden hover:bg-[#f8fafd]"
            >
              <Menu size={15} /> Meniu
            </button>
            {tab === "bookings" && <BookingsTab />}
            {tab === "rooms" && <RoomsTab />}
            {tab === "units" && <UnitsTab />}
            {tab === "smartlocks" && <SmartLockTab />}
            {tab === "nomenclature" && <NomenclatureTab />}
            {tab === "pricing" && <PricingTab />}
            {tab === "places" && <AdminPlacesTab />}
            {tab === "menu" && <AdminMenuTab />}
            {tab === "analytics" && <AnalyticsTab />}
            {tab === "users" && <UsersTab />}
            {tab === "audit" && <AuditLogsTab />}
          </div>
        </main>
      </div>
    </div>
  );
}

/* ─────────────── SIDEBAR EXACT ORIGINAL STYLE ─────────────── */
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
    <nav className="flex flex-col gap-1 px-3 pt-2.5 pb-4 sm:px-4 sm:pt-3 sm:pb-4">
      {NAV.map((item) => {
        const Icon = item.icon;
        const active = tab === item.key;
        return (
          <button
            key={item.key}
            onClick={() => setTab(item.key)}
            className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-left text-[13px] font-semibold transition-all duration-200 sm:text-[13.5px] cursor-pointer ${
              active
                ? "bg-[#0d2c5c] text-white shadow-[0_10px_24px_rgba(13,44,92,0.18)]"
                : "text-[#2a3b52] hover:bg-[#f4f6f9] hover:text-[#0d2c5c]"
            }`}
          >
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors ${
                active
                  ? "bg-white/15 text-[#e6b85c]"
                  : "bg-[#f4f6f9] text-[#0d2c5c]"
              }`}
            >
              <Icon size={15} strokeWidth={1.75} />
            </span>
            <span className="truncate">{item.label}</span>
          </button>
        );
      })}
      <div className="mt-3 border-t border-[#eef2f7] pt-3">
        <button
          onClick={() => void onLogout()}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-[13px] font-semibold text-[#2a3b52] transition-colors hover:bg-[#f4f6f9] hover:text-[#0d2c5c] cursor-pointer"
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
