import { API_URL } from "../lib/config";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  User as UserIcon,
  Shield,
  CalendarCheck,
  TriangleAlert,
  Phone,
  LogOut,
  Check,
  Trash2,
  Monitor,
  MapPin,
  KeyRound,
  Download,
  SlidersHorizontal,
  Award,
  MessageSquare,
  BadgeCheck,
  RefreshCcw,
  Share2,
  Camera,
  Calendar,
  BedDouble,
  Building,
  Utensils,
  Thermometer,
  Wine,
  FileText,
  Copy,
  Sparkles,
} from "lucide-react";
import {
  clearSession,
  fetchSession,
  getCachedUser,
  notifySessionChange,
  onSessionChange,
  type SessionUser,
} from "../lib/auth";
import { apiFetch } from "../lib/api";
import { useToast } from "../components/Toast";
import { downloadBookingInvoicePdf } from "../lib/admin";

type TabKey = "overview" | "personal" | "hospitality" | "reservations" | "security" | "danger";

type Booking = {
  id: string;
  room?: { title?: string } | null;
  check_in: string;
  check_out: string;
  status: string;
  total_price?: number | null;
  cancellation_reason?: string | null;
  booking_code?: string;
  unit_number?: string;
  payment_status?: string;
  access_pin?: string | null;
  self_checkin_completed_at?: string | null;
};

type SessionItem = {
  id: string;
  browser_family?: string;
  browser_version?: string;
  os_family?: string;
  os_version?: string;
  device_type?: string;
  ip_address?: string;
  created_at?: string;
  is_current?: boolean;
};

const TABS: {
  key: TabKey;
  label: string;
  icon: typeof UserIcon;
  color: string;
  activeBg: string;
}[] = [
  {
    key: "overview",
    label: "Overview & Sejur",
    icon: CalendarCheck,
    color: "text-[#00a896]",
    activeBg: "bg-gradient-to-r from-[#00a896] to-[#0284c7]",
  },
  {
    key: "personal",
    label: "Date Personale",
    icon: UserIcon,
    color: "text-[#0284c7]",
    activeBg: "bg-gradient-to-r from-[#0284c7] to-[#0d2c5c]",
  },
  {
    key: "hospitality",
    label: "Preferințe Suită",
    icon: Sparkles,
    color: "text-[#d97706]",
    activeBg: "bg-gradient-to-r from-[#d97706] to-[#b45309]",
  },
  {
    key: "reservations",
    label: "Istoric & Facturi",
    icon: FileText,
    color: "text-[#6366f1]",
    activeBg: "bg-gradient-to-r from-[#6366f1] to-[#4f46e5]",
  },
  {
    key: "security",
    label: "Securitate & Sesiuni",
    icon: Shield,
    color: "text-[#059669]",
    activeBg: "bg-gradient-to-r from-[#059669] to-[#0d9488]",
  },
  {
    key: "danger",
    label: "Zonă Periculoasă",
    icon: TriangleAlert,
    color: "text-red-500",
    activeBg: "bg-gradient-to-r from-red-600 to-rose-700",
  },
];

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<SessionUser>(getCachedUser());
  const [loading, setLoading] = useState(!user);
  const [tab, setTab] = useState<TabKey>("overview");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    apiFetch<Booking[]>("/bookings/my-bookings")
      .then((d) => setBookings(Array.isArray(d) ? d : []))
      .catch(() => setBookings([]));
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      const s = await fetchSession(false);
      if (!active) return;
      if (!s) {
        navigate("/login", { replace: true });
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
    const unsub = onSessionChange(() => {
      const fresh = getCachedUser();
      if (fresh) setUser(fresh);
    });
    return unsub;
  }, []);

  const handleLogout = async () => {
    await clearSession();
    navigate("/");
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await apiFetch<any>("/users/me/avatar", {
        method: "POST",
        body: formData,
      });
      setUser((prev) => (prev ? { ...prev, avatar_url: res.avatar_url } : prev));
      await fetchSession(true);
      notifySessionChange();
      toast("Fotografia de profil a fost actualizată cu succes!", "success");
    } catch (err: any) {
      toast(err?.message || "Eroare la încărcarea fotografiei.", "error");
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveAvatar = async () => {
    setUploadingAvatar(true);
    try {
      await apiFetch<any>("/users/me/avatar", { method: "DELETE" });
      setUser((prev) => (prev ? { ...prev, avatar_url: null } : prev));
      await fetchSession(true);
      notifySessionChange();
      toast("Fotografia de profil a fost eliminată.", "success");
    } catch (err: any) {
      toast(err?.message || "Eroare la ștergerea fotografiei.", "error");
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-[#6b7c99] text-[11px] font-bold tracking-[0.2em] uppercase pt-24">
        Se încarcă profilul…
      </div>
    );
  }

  const fullName =
    [user.first_name, user.last_name].filter(Boolean).join(" ") ||
    user.email.split("@")[0];

  return (
    <div className="min-h-screen w-full bg-[#fbfcfd] text-[#0d2c5c] font-sans antialiased relative overflow-hidden">
      {/* ── OBIECTE MARITIME & ELEMENTE FLOTANTE PE FUNDAL ALB ── */}
      <FloatingMaritimeBackgroundWhite />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleAvatarUpload}
        className="hidden"
      />

      {/* ── 1. HERO BANNER FULL BLEED (EDGE-TO-EDGE PE TOATĂ LĂȚIMEA ECRANULUI) ── */}
      <div className="relative w-full h-[270px] sm:h-[330px] lg:h-[380px] xl:h-[420px] overflow-hidden border-b border-[#e1e8f0] pt-16 sm:pt-20">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover saturate-60 contrast-110 brightness-95"
        >
          <source src="/hero-bg.mp4" type="video/mp4" />
        </video>
        {/* Straturi cromatice din mainpage */}
        <div className="absolute inset-0 bg-[#0d2c5c]/60 mix-blend-color" />
        <div className="absolute inset-0 bg-[#0b2146]/35 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d2c5c]/85 via-[#0d2c5c]/25 to-[#0d2c5c]/95" />

        {/* Ornamente ambientale aurii pe hero */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 -left-16 w-80 h-80 rounded-full bg-[#c69a3f]/25 blur-[85px]"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 -right-16 w-96 h-96 rounded-full bg-[#c69a3f]/20 blur-[90px]"
        />

        {/* Top Content inside full-width Hero */}
        <div className="relative z-10 w-full h-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 flex flex-col justify-between pt-4 sm:pt-6 pb-24 sm:pb-28">
          <div className="flex items-center justify-between">
            {/* Top Left Tag */}
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0d2c5c]/70 backdrop-blur-md border border-white/20 text-white text-[12px] font-medium shadow-lg">
              <span className="text-[#c69a3f] text-[11px] tracking-widest font-serif font-semibold">★★★</span>
              <span className="font-sans font-semibold tracking-wide">Casa Esy • Mamaia Resort & Spa</span>
            </div>

            {/* Top Right Action Pills */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => {
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(window.location.href);
                    toast("Link-ul profilului a fost copiat!", "success");
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#0d2c5c]/60 hover:bg-[#0d2c5c]/80 backdrop-blur-md border border-white/20 text-white text-[12.5px] font-semibold transition-all shadow-md active:scale-95"
              >
                <Share2 size={13} className="text-[#c69a3f]" />
                <span className="hidden sm:inline">Distribuie Profil</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                title="Încarcă fotografie de profil"
                className="w-9 h-9 rounded-full bg-[#0d2c5c]/60 hover:bg-[#0d2c5c]/80 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all shadow-md active:scale-95 disabled:opacity-50"
              >
                <Camera size={14} className="text-[#c69a3f]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. CORPUL PRINCIPAL PE TOATĂ LĂȚIMEA PAGINII (FULL-WIDTH CONTAINER) ── */}
      <div className="w-full px-3 sm:px-5 md:px-7 lg:px-9 xl:px-10 pb-20 relative z-20">
        {/* TWO-COLUMN GRID: SIDEBAR & MAIN CONTENT (PE TOATĂ LĂȚIMEA PAGINII) */}
        <div className="relative grid grid-cols-1 lg:grid-cols-[340px_1fr] xl:grid-cols-[380px_1fr] 2xl:grid-cols-[410px_1fr] gap-6 lg:gap-8 items-start -mt-20 sm:-mt-24 lg:-mt-28">
          {/* LEFT SIDEBAR */}
          <div className="flex flex-col gap-6">
            {/* User Profile Card */}
            <div className="bg-white rounded-[26px] p-6 sm:p-7 shadow-[0_12px_45px_rgba(13,44,92,0.06)] border border-[#e1e8f0]">
              <div className="flex flex-col items-center text-center">
                {/* Avatar with vibrant coastal teal & gold border */}
                <div
                  className="relative group cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                  title="Apasă pentru a schimba fotografia de profil"
                >
                  <div className="w-[114px] h-[114px] sm:w-[128px] sm:h-[128px] rounded-full p-[3px] bg-gradient-to-tr from-[#00a896] via-[#0284c7] to-[#f59e0b] shadow-lg transition-transform duration-300 group-hover:scale-105">
                    <div className="w-full h-full rounded-full bg-[#0d2c5c] overflow-hidden flex items-center justify-center font-['Outfit',sans-serif] text-[40px] font-bold text-white">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        getInitials(fullName)
                      )}
                    </div>
                  </div>
                  <span className="absolute bottom-0 right-1 w-8 h-8 rounded-full bg-[#00a896] text-white border-2 border-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                    <Camera size={14} />
                  </span>
                </div>

                <h1 className="mt-4 font-['Outfit',sans-serif] text-[28px] sm:text-[32px] font-bold text-[#0d2c5c] leading-tight tracking-tight">
                  {fullName}
                </h1>
                <div className="mt-2 flex items-center justify-center">
                  <span className="px-3.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200/90 text-[11px] font-['Plus_Jakarta_Sans',sans-serif] font-bold tracking-wider uppercase flex items-center gap-1.5 shadow-xs">
                    <span className="text-[#f59e0b]">★</span>
                    <span>Oaspete Privilège • Casa Esy Gold</span>
                  </span>
                </div>
                <p className="text-[12px] text-[#64748b] mt-2 flex items-center justify-center gap-1.5 font-['Plus_Jakarta_Sans',sans-serif]">
                  <MapPin size={13} className="text-[#0284c7]" />
                  <span>Mamaia, Constanța • România</span>
                </p>

                {/* Quick actions */}
                <div className="w-full mt-5 flex items-center gap-2.5">
                  <button
                    onClick={() => setTab("personal")}
                    title="Editează datele personale"
                    className="w-12 h-12 rounded-[14px] bg-[#f0f9ff] hover:bg-[#e0f2fe] border border-[#bae6fd] text-[#0284c7] flex items-center justify-center transition-colors shrink-0 shadow-sm"
                  >
                    <SlidersHorizontal size={17} />
                  </button>
                  <Link
                    to="/camere"
                    className="flex-1 h-12 rounded-[14px] bg-gradient-to-r from-[#00a896] to-[#0284c7] hover:from-[#009282] hover:to-[#0369a1] text-white text-[13.5px] font-['Plus_Jakarta_Sans',sans-serif] font-bold flex items-center justify-center gap-2 shadow-[0_8px_25px_rgba(0,168,150,0.32)] transition-all active:scale-[0.99]"
                  >
                    <Calendar size={15} />
                    <span>Rezervă Sejur Nou</span>
                  </Link>
                </div>
              </div>

              {/* BENEFICII INCLUSE (CULORI COLORATE PASTEL) */}
              <div className="mt-6 pt-5 border-t border-[#e1e8f0]">
                <p className="font-['Plus_Jakarta_Sans',sans-serif] text-[10.5px] font-bold tracking-[0.2em] uppercase text-[#64748b] mb-3">
                  Beneficii Incluse:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: "Check-in Devreme 11:00", bg: "bg-emerald-50 text-emerald-800 border-emerald-200" },
                    { label: "Șezlong VIP Zonă Plajă", bg: "bg-amber-50 text-amber-800 border-amber-200" },
                    { label: "Butler & Room Service", bg: "bg-sky-50 text-sky-800 border-sky-200" },
                    { label: "Acces Spa & Piscină", bg: "bg-teal-50 text-teal-800 border-teal-200" },
                    { label: "Parcare Gratuită", bg: "bg-indigo-50 text-indigo-800 border-indigo-200" },
                  ].map((b) => (
                    <span
                      key={b.label}
                      className={`px-3 py-1.5 rounded-full border text-[11.5px] font-['Plus_Jakarta_Sans',sans-serif] font-semibold ${b.bg}`}
                    >
                      {b.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* STATISTICI DIN REZERVARI REALE */}
              <div className="mt-6 pt-5 border-t border-[#e1e8f0] grid grid-cols-3 text-center">
                {(() => {
                  const valid = bookings.filter((b) => b.status !== "cancelled");
                  const nightsTotal = valid.reduce(
                    (n, b) =>
                      n +
                      Math.max(
                        0,
                        Math.round(
                          (+new Date(b.check_out) - +new Date(b.check_in)) /
                            864e5
                        )
                      ),
                    0
                  );
                  const points = nightsTotal * 150;
                  return (
                    <>
                      <div>
                        <p className="font-['Outfit',sans-serif] text-[26px] sm:text-[28px] font-bold text-[#0d2c5c] leading-none">
                          {valid.length}
                        </p>
                        <p className="font-['Plus_Jakarta_Sans',sans-serif] text-[11px] text-[#64748b] mt-1 font-semibold">
                          Sejururi
                        </p>
                      </div>
                      <div className="border-x border-[#e1e8f0]">
                        <p className="font-['Outfit',sans-serif] text-[26px] sm:text-[28px] font-bold text-[#00a896] leading-none">
                          {points.toLocaleString("ro-RO")}
                        </p>
                        <p className="font-['Plus_Jakarta_Sans',sans-serif] text-[11px] text-[#00a896] mt-1 font-semibold">
                          Puncte Club
                        </p>
                      </div>
                      <div>
                        <p className="font-['Outfit',sans-serif] text-[26px] sm:text-[28px] font-bold text-[#d97706] leading-none">
                          {valid.length >= 2 ? "Gold" : "Silver"}
                        </p>
                        <p className="font-['Plus_Jakarta_Sans',sans-serif] text-[11px] text-[#d97706] mt-1 font-semibold">
                          Statut VIP
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Butler & Concierge Card */}
            <div className="bg-white rounded-[24px] p-5 shadow-[0_12px_45px_rgba(13,44,92,0.06)] border border-[#e1e8f0]">
              <div className="flex items-center justify-between mb-3.5">
                <p className="font-['Plus_Jakarta_Sans',sans-serif] text-[10px] font-bold tracking-[0.2em] uppercase text-[#64748b]">
                  Butler Personal Desemnat
                </p>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10.5px] font-['Plus_Jakarta_Sans',sans-serif] font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Activ
                </span>
              </div>
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#00a896] to-[#0284c7] text-white flex items-center justify-center font-['Outfit',sans-serif] text-[16px] font-bold shrink-0 shadow-sm">
                  CE
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold text-[#0d2c5c] truncate font-['Plus_Jakarta_Sans',sans-serif]">
                    Recepția & Concierge
                  </p>
                  <p className="text-[11.5px] text-[#64748b] truncate font-['Plus_Jakarta_Sans',sans-serif]">
                    Head Butler • Serviciu 24/7
                  </p>
                </div>
                <Link
                  to="/contact"
                  title="Contactează concierge-ul"
                  className="w-9 h-9 rounded-[12px] bg-[#f0f9ff] hover:bg-[#e0f2fe] border border-[#bae6fd] text-[#0284c7] flex items-center justify-center transition-colors shrink-0 shadow-xs"
                >
                  <MessageSquare size={16} />
                </Link>
              </div>
            </div>
          </div>

          {/* RIGHT MAIN CONTENT */}
          <div className="min-w-0 flex flex-col gap-6">
            {/* TAB BAR COLORAT ȘI ADAPTIV PENTRU DESKTOP */}
            <div className="bg-white rounded-[22px] p-2 shadow-[0_8px_30px_rgba(13,44,92,0.06)] border border-[#e1e8f0]">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5">
                {TABS.map((t) => {
                  const Icon = t.icon;
                  const active = tab === t.key;
                  const isDanger = t.key === "danger";
                  return (
                    <button
                      key={t.key}
                      onClick={() => setTab(t.key)}
                      className={`flex items-center justify-center gap-1.5 sm:gap-2 px-2 py-3 rounded-[14px] text-[12px] xl:text-[13px] font-['Plus_Jakarta_Sans',sans-serif] font-bold transition-all duration-200 text-center select-none ${
                        active
                          ? isDanger
                            ? "bg-red-50 text-red-700 border border-red-200 shadow-sm"
                            : `${t.activeBg} text-white shadow-[0_4px_16px_rgba(0,168,150,0.25)]`
                          : isDanger
                            ? "text-red-600/80 hover:bg-red-50/70 hover:text-red-700"
                            : "text-[#475569] hover:text-[#0d2c5c] hover:bg-[#f1f5f9]"
                      }`}
                    >
                      <Icon
                        size={15}
                        className={`shrink-0 ${
                          active
                            ? "text-white"
                            : t.color
                        }`}
                      />
                      <span className="truncate">{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* TAB PANELS */}
            {tab === "overview" && (
              <OverviewTab
                user={user}
                bookings={bookings}
                goToTab={setTab}
              />
            )}

            {tab === "personal" && (
              <PersonalTab
                user={user}
                setUser={setUser}
                onAvatarClick={() => fileInputRef.current?.click()}
                onRemoveAvatar={handleRemoveAvatar}
                uploadingAvatar={uploadingAvatar}
              />
            )}

            {tab === "hospitality" && <HospitalityTab />}

            {tab === "reservations" && <ReservationsTab bookings={bookings} />}

            {tab === "security" && <SecurityTab user={user} onLogout={handleLogout} />}

            {tab === "danger" && <DangerTab onDeleted={handleLogout} />}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── OVERVIEW TAB ─────────────────── */
function OverviewTab({
  user,
  bookings,
  goToTab,
}: {
  user: NonNullable<SessionUser>;
  bookings: Booking[];
  goToTab: (t: TabKey) => void;
}) {
  const { toast } = useToast();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const next = useMemo(() => {
    return (
      bookings
        .filter(
          (b) =>
            b.status !== "cancelled" &&
            b.status !== "completed" &&
            new Date(b.check_out) >= new Date()
        )
        .sort((a, b) => +new Date(a.check_in) - +new Date(b.check_in))[0] || null
    );
  }, [bookings]);

  const stayDays = useMemo(() => {
    if (!next) return [];
    const out: Date[] = [];
    const cur = new Date(next.check_in);
    const end = new Date(next.check_out);
    while (cur <= end && out.length < 7) {
      out.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }
    return out;
  }, [next]);

  const fullName =
    [user.first_name, user.last_name].filter(Boolean).join(" ") ||
    user.email.split("@")[0];

  const fmtDay = (d: Date) =>
    d.toLocaleDateString("ro-RO", { weekday: "short" }).replace(".", "").toUpperCase();
  const fmtDate = (d: Date) =>
    d.toLocaleDateString("ro-RO", { day: "numeric", month: "short" }).replace(".", "");

  return (
    <div className="flex flex-col gap-6">
      {/* CARD 1: SEJUR URMĂTOR (ALB CURAT) */}
      <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-[0_10px_40px_rgba(13,44,92,0.06)] border border-[#e1e8f0]">
        {next ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[11px] font-bold tracking-[0.22em] uppercase text-[#c69a3f]">
                <span className="w-5 h-px bg-gradient-to-r from-transparent to-[#c69a3f]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#c69a3f]"></span>
                <span className="text-[#0d2c5c]">URMĂTORUL SEJUR CONFIRMAT</span>
                {next.booking_code && (
                  <span className="text-[#6b7c99] font-normal normal-case tracking-normal">
                    • Rezervare #{next.booking_code}
                  </span>
                )}
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11.5px] font-semibold flex items-center gap-1.5">
                <Check size={13} strokeWidth={2.5} />
                <span>{next.payment_status === "paid" ? "Achitat integral" : "Plată la sosire"}</span>
              </span>
            </div>

            <div className="mt-5 flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div>
                <h2 className="font-['Outfit',sans-serif] text-[28px] sm:text-[34px] font-bold text-[#0d2c5c] leading-tight tracking-tight">
                  {next.room?.title || "Cameră Casa Esy"}
                </h2>
                <p className="mt-1 flex items-center gap-2 text-[13px] text-[#64748b] font-['Plus_Jakarta_Sans',sans-serif]">
                  <Building size={14} className="text-[#00a896] shrink-0" />
                  <span>
                    Mamaia Resort • {Math.max(1, stayDays.length - 1)} nopți
                    {next.unit_number ? ` • Suita ${next.unit_number}` : ""}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  onClick={() => {
                    downloadBookingInvoicePdf(
                      String(next.booking_code || next.id),
                      next.booking_code || String(next.id)
                    ).catch((e: any) =>
                      toast(e?.message || "Factura nu a putut fi descărcată.", "error")
                    );
                  }}
                  className="px-4 h-11 rounded-[14px] border border-[#bae6fd] hover:border-[#0284c7] text-[#0284c7] hover:bg-[#f0f9ff] text-[12.5px] font-['Plus_Jakarta_Sans',sans-serif] font-bold flex items-center gap-2 bg-white transition-colors shadow-xs"
                >
                  <Download size={14} className="text-[#0284c7]" />
                  <span>Descarcă Voucher</span>
                </button>
                <button
                  onClick={() => goToTab("reservations")}
                  className="px-4 h-11 rounded-[14px] bg-[#0d2c5c] hover:bg-[#07203f] text-white text-[12.5px] font-['Plus_Jakarta_Sans',sans-serif] font-bold flex items-center gap-2 transition-colors shadow-sm"
                >
                  <SlidersHorizontal size={14} className="text-[#c69a3f]" />
                  <span>Detalii Sejur</span>
                </button>
              </div>
            </div>

            {/* Zilele sejurului (CARDURI COLORATE PASTEL) */}
            {stayDays.length > 0 && (
              <div className="mt-6 pt-5 border-t border-[#e1e8f0]">
                <div className="flex items-center justify-between mb-3.5">
                  <p className="font-['Plus_Jakarta_Sans',sans-serif] text-[11px] font-bold tracking-[0.2em] uppercase text-[#64748b] flex items-center gap-1.5">
                    <span className="w-3 h-px bg-[#00a896]" />
                    <span>Zilele Sejurului Dumneavoastră:</span>
                  </p>
                  <Link
                    to="/facilitati"
                    className="text-[12px] font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[#00a896] hover:underline"
                  >
                    Program Activități & Spa →
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                  {stayDays.map((d, i, arr) => {
                    const isFirst = i === 0;
                    const isLast = i === arr.length - 1 && arr.length > 1;
                    const dayStyles = [
                      { bg: "bg-teal-50 border-teal-300 text-teal-900 shadow-sm", badge: "text-teal-800 bg-teal-100" },
                      { bg: "bg-sky-50 border-sky-200 text-sky-900", badge: "text-sky-800 bg-sky-100" },
                      { bg: "bg-indigo-50 border-indigo-200 text-indigo-900", badge: "text-indigo-800 bg-indigo-100" },
                      { bg: "bg-amber-50 border-amber-200 text-amber-900", badge: "text-amber-800 bg-amber-100" },
                      { bg: "bg-purple-50 border-purple-200 text-purple-900", badge: "text-purple-800 bg-purple-100" },
                      { bg: "bg-rose-50 border-rose-300 text-rose-900", badge: "text-rose-800 bg-rose-100" },
                    ];
                    const curStyle = isFirst
                      ? dayStyles[0]
                      : isLast
                        ? dayStyles[5]
                        : dayStyles[(i % (dayStyles.length - 2)) + 1];
                    return (
                      <div
                        key={i}
                        className={`rounded-[18px] p-3.5 text-center border transition-all ${curStyle.bg}`}
                      >
                        <p className="font-['Plus_Jakarta_Sans',sans-serif] text-[11px] font-bold tracking-wider uppercase opacity-75">
                          {fmtDay(d)}
                        </p>
                        <p className="font-['Outfit',sans-serif] text-[22px] font-bold mt-1">
                          {fmtDate(d)}
                        </p>
                        <p className="mt-1.5 inline-block">
                          <span className={`text-[10.5px] font-['Plus_Jakarta_Sans',sans-serif] font-bold px-2 py-0.5 rounded-full ${curStyle.badge}`}>
                            {isFirst ? "Check-in" : isLast ? "Check-out" : "Sejur"}
                          </span>
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 py-2">
            <div>
              <div className="flex items-center gap-2 font-['Plus_Jakarta_Sans',sans-serif] text-[11px] font-bold tracking-[0.22em] uppercase text-[#00a896]">
                <span className="w-5 h-px bg-[#00a896]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#00a896]"></span>
                <span>Sejururi Casa Esy</span>
              </div>
              <h2 className="font-['Outfit',sans-serif] text-[28px] sm:text-[34px] font-bold text-[#0d2c5c] mt-2 tracking-tight">
                Refugiul tău la Marea Neagră te așteaptă
              </h2>
              <p className="text-[13.5px] text-[#64748b] mt-1 max-w-[560px] leading-relaxed font-['Plus_Jakarta_Sans',sans-serif]">
                Descoperă camerele și suitele noastre de lux, beneficiază de ospitalitate caldă și priveliști superbe la malul mării.
              </p>
            </div>
            <Link
              to="/camere"
              className="px-6 h-12 rounded-[14px] bg-gradient-to-r from-[#00a896] to-[#0284c7] hover:brightness-105 text-white text-[13px] font-['Plus_Jakarta_Sans',sans-serif] font-bold flex items-center justify-center gap-2 transition-all shadow-[0_8px_20px_rgba(0,168,150,0.3)] shrink-0"
            >
              <CalendarCheck size={16} />
              <span>Explorează Camerele</span>
            </Link>
          </div>
        )}
      </div>

      {/* GRID 2 COLOANE: CONTACT & PREFERINTE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Date Personale Contact */}
        <div className="bg-white rounded-[24px] p-6 sm:p-7 shadow-[0_10px_40px_rgba(13,44,92,0.06)] border border-[#e1e8f0] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="font-['Plus_Jakarta_Sans',sans-serif] text-[11px] font-bold tracking-[0.22em] uppercase text-[#0284c7] flex items-center gap-2">
                <span className="w-4 h-px bg-[#0284c7]" />
                <span>Date Personale de Contact</span>
              </p>
              <button
                onClick={() => goToTab("personal")}
                className="text-[12.5px] font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[#0284c7] hover:underline"
              >
                Editează
              </button>
            </div>

            <div className="space-y-3.5 font-['Plus_Jakarta_Sans',sans-serif]">
              <div>
                <p className="text-[10.5px] font-bold uppercase tracking-wider text-[#64748b]">
                  Nume Complet
                </p>
                <p className="font-['Outfit',sans-serif] text-[18px] font-bold text-[#0d2c5c] mt-0.5">
                  {fullName}
                </p>
              </div>
              <div>
                <p className="text-[10.5px] font-bold uppercase tracking-wider text-[#64748b]">
                  Email Oficial
                </p>
                <p className="text-[14px] text-[#0d2c5c] mt-0.5 flex items-center gap-1.5 truncate font-semibold">
                  <span>{user.email}</span>
                  <BadgeCheck size={14} className="text-[#00a896] shrink-0" />
                </p>
              </div>
              <div>
                <p className="text-[10.5px] font-bold uppercase tracking-wider text-[#64748b]">
                  Telefon
                </p>
                <p className="text-[14px] text-[#0d2c5c] mt-0.5 font-semibold">
                  {(user as any).phone || "Necompletat"}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#e1e8f0] flex items-center justify-between text-[12px] font-['Plus_Jakarta_Sans',sans-serif]">
            <span className="text-[#64748b]">
              Limba: <b className="text-[#0d2c5c]">Română</b>
            </span>
            <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
              ✓ Cont Verificat
            </span>
          </div>
        </div>

        {/* Preferințe Salvate în Suită */}
        <div className="bg-white rounded-[24px] p-6 sm:p-7 shadow-[0_10px_40px_rgba(13,44,92,0.06)] border border-[#e1e8f0] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="font-['Plus_Jakarta_Sans',sans-serif] text-[11px] font-bold tracking-[0.22em] uppercase text-[#d97706] flex items-center gap-2">
                <span className="w-4 h-px bg-[#d97706]" />
                <span>Preferințe în Suită</span>
              </p>
              <button
                onClick={() => goToTab("hospitality")}
                className="text-[12.5px] font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[#d97706] hover:underline"
              >
                Configurează
              </button>
            </div>
            <p className="text-[12.5px] text-[#64748b] mb-4 font-['Plus_Jakarta_Sans',sans-serif]">
              Setările favorite sunt aplicate automat la sosirea în orice cameră sau suită Casa Esy.
            </p>

            <div className="flex flex-col gap-2">
              {[
                { icon: BedDouble, label: "Puf de gâscă albă", color: "bg-sky-50 text-sky-800 border-sky-200", iconCol: "text-sky-600" },
                { icon: Building, label: "Etaj Superior Panoramic", color: "bg-indigo-50 text-indigo-800 border-indigo-200", iconCol: "text-indigo-600" },
                { icon: Utensils, label: "Meniu Fresh Seafood", color: "bg-emerald-50 text-emerald-800 border-emerald-200", iconCol: "text-emerald-600" },
                { icon: Thermometer, label: "Temperatură Cameră: 21.5°C", color: "bg-amber-50 text-amber-800 border-amber-200", iconCol: "text-amber-600" },
                { icon: Wine, label: "Vin spumant la sosire", color: "bg-rose-50 text-rose-800 border-rose-200", iconCol: "text-rose-600" },
              ].map((p, i) => {
                const Icon = p.icon;
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-[14px] border text-[12.5px] font-['Plus_Jakarta_Sans',sans-serif] font-semibold ${p.color}`}
                  >
                    <Icon size={15} className={p.iconCol} />
                    <span>{p.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-[#e1e8f0] flex items-center justify-between font-['Plus_Jakarta_Sans',sans-serif]">
            <span className="text-[12.5px] font-semibold text-[#0d2c5c]">
              Notificări SMS / WhatsApp
            </span>
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors ${
                notificationsEnabled ? "bg-[#00a896]" : "bg-slate-300"
              }`}
            >
              <span
                className={`block w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  notificationsEnabled ? "translate-x-5" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* LOYALTY CARD (ROYAL NAVY THEME CU DETALII AURII & TEAL) */}
      <div className="rounded-[24px] bg-gradient-to-r from-[#071d3d] via-[#0d2c5c] to-[#0a2349] p-6 sm:p-8 shadow-[0_15px_40px_rgba(13,44,92,0.18)] border border-[#00a896]/30 flex flex-col md:flex-row md:items-center justify-between gap-5 text-white relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#00a896]/20 blur-[60px] pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-13 h-13 rounded-[16px] bg-[#00a896]/20 border border-[#00a896]/40 text-[#00a896] flex items-center justify-center shrink-0">
            <Award size={26} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h3 className="font-['Outfit',sans-serif] text-[26px] sm:text-[28px] font-bold text-white tracking-tight">
                Nivel Gold Privilège
              </h3>
              <span className="px-3 py-1 rounded-full bg-[#00a896] text-white text-[11px] font-bold tracking-wider uppercase font-['Plus_Jakarta_Sans',sans-serif] shadow-xs">
                2.450 / 3.500 Puncte
              </span>
            </div>
            <p className="text-[13px] text-white/80 mt-1 max-w-[620px] leading-relaxed font-['Plus_Jakarta_Sans',sans-serif]">
              Mai aveți nevoie de doar 1.050 puncte pentru a trece la Platinum Diamant (Upgrade garantat de cameră și experiențe VIP).
            </p>
          </div>
        </div>
        <Link
          to="/camere"
          className="px-6 h-12 rounded-[14px] bg-gradient-to-r from-[#00a896] to-[#0ea5e9] hover:brightness-110 text-white text-[12px] font-bold tracking-wider uppercase flex items-center justify-center shrink-0 transition-all shadow-[0_6px_20px_rgba(0,168,150,0.35)] font-['Plus_Jakarta_Sans',sans-serif] relative z-10"
        >
          Catalog Recompense
        </Link>
      </div>

      {/* BOTTOM ACTION BAR */}
      <div className="bg-white rounded-[20px] px-6 py-4 shadow-[0_10px_35px_rgba(13,44,92,0.06)] border border-[#e1e8f0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-[12.5px] text-[#6b7c99]">
          <RefreshCcw size={13} className="text-[#c69a3f]" />
          <span>Modificările sunt sincronizate instant cu sistemul hotelului.</span>
        </p>
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(user, null, 2));
              const downloadAnchor = document.createElement("a");
              downloadAnchor.setAttribute("href", dataStr);
              downloadAnchor.setAttribute("download", `gdpr_data_${user.email}.json`);
              document.body.appendChild(downloadAnchor);
              downloadAnchor.click();
              downloadAnchor.remove();
              toast("Datele GDPR au fost exportate cu succes.", "success");
            }}
            className="text-[12.5px] font-semibold text-[#6b7c99] hover:text-[#0d2c5c] transition-colors"
          >
            Exportă date GDPR
          </button>
          <button
            onClick={() => toast("Setările profilului au fost salvate cu succes!", "success")}
            className="px-5 h-11 rounded-[12px] bg-[#0d2c5c] hover:bg-[#123a75] text-white text-[13px] font-semibold transition-colors shadow-sm"
          >
            Salvare Setări Profil
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── PERSONAL TAB ─────────────────── */
function PersonalTab({
  user,
  setUser,
  onAvatarClick,
  onRemoveAvatar,
  uploadingAvatar,
}: {
  user: NonNullable<SessionUser>;
  setUser: (u: SessionUser) => void;
  onAvatarClick: () => void;
  onRemoveAvatar: () => void;
  uploadingAvatar: boolean;
}) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    first_name: user.first_name || "",
    last_name: user.last_name || "",
    phone: (user as any).phone || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch("/users/me", {
        method: "PATCH",
        body: JSON.stringify(form),
      });
      setUser({ ...user, ...form });
      await fetchSession(true);
      notifySessionChange();
      toast("Datele profilului au fost salvate!", "success");
    } catch (err: any) {
      toast(err?.message || "Eroare la salvarea datelor.", "error");
    } finally {
      setSaving(false);
    }
  };

  const fullName =
    [form.first_name, form.last_name].filter(Boolean).join(" ") ||
    user.email.split("@")[0];

  return (
    <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-[0_10px_40px_rgba(13,44,92,0.06)] border border-[#e1e8f0] space-y-6">
      <div>
        <p className="font-['Plus_Jakarta_Sans',sans-serif] text-[11px] font-bold tracking-[0.22em] uppercase text-[#0284c7] mb-2 flex items-center gap-2">
          <span className="w-5 h-px bg-[#0284c7]" />
          <span>Date Personale</span>
        </p>
        <h2 className="font-['Outfit',sans-serif] text-[28px] sm:text-[34px] font-bold tracking-tight text-[#0d2c5c]">
          Profilul Tău la Casa Esy
        </h2>
        <p className="text-[13.5px] text-[#64748b] mt-1 leading-relaxed font-['Plus_Jakarta_Sans',sans-serif]">
          Actualizează datele de contact și fotografia afișată pe contul tău de oaspete.
        </p>
      </div>

      {/* Profil Avatar uploader */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 p-4 rounded-[18px] bg-[#f0f9ff]/60 border border-[#bae6fd]">
        <div className="relative w-20 h-20 rounded-full p-[2.5px] bg-gradient-to-tr from-[#00a896] via-[#0284c7] to-[#f59e0b] shrink-0 shadow-md">
          <div className="w-full h-full rounded-full bg-[#0d2c5c] overflow-hidden flex items-center justify-center font-['Outfit',sans-serif] text-[26px] font-bold text-white">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={fullName} className="w-full h-full object-cover" />
            ) : (
              getInitials(fullName)
            )}
          </div>
        </div>
        <div className="flex-1 min-w-0 font-['Plus_Jakarta_Sans',sans-serif]">
          <p className="text-[14.5px] font-bold text-[#0d2c5c]">
            Fotografie de Profil
          </p>
          <p className="text-[12px] text-[#64748b] mt-0.5">
            Formate acceptate: JPG, PNG sau WebP (maxim 5 MB).
          </p>
          <div className="flex items-center gap-2 mt-3">
            <button
              type="button"
              onClick={onAvatarClick}
              disabled={uploadingAvatar}
              className="px-4 py-2 rounded-[12px] bg-gradient-to-r from-[#00a896] to-[#0284c7] hover:brightness-105 text-white text-[12px] font-bold transition-all disabled:opacity-50 shadow-xs"
            >
              {uploadingAvatar ? "Se încarcă…" : user.avatar_url ? "Schimbă Fotografia" : "Încarcă Fotografie"}
            </button>
            {user.avatar_url && (
              <button
                type="button"
                onClick={onRemoveAvatar}
                disabled={uploadingAvatar}
                className="px-3.5 py-2 rounded-[12px] border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-[12px] font-bold transition-colors disabled:opacity-50"
              >
                Șterge
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Formular date */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#6b7c99] block mb-1.5">
              Prenume
            </label>
            <input
              type="text"
              value={form.first_name}
              onChange={(e) => setForm({ ...form, first_name: e.target.value })}
              className="w-full px-4 py-3 rounded-[12px] border border-[#e1e8f0] focus:border-[#c69a3f] outline-none text-[13.5px] text-[#0d2c5c] bg-white transition-all"
              required
            />
          </div>
          <div>
            <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#6b7c99] block mb-1.5">
              Nume de Familie
            </label>
            <input
              type="text"
              value={form.last_name}
              onChange={(e) => setForm({ ...form, last_name: e.target.value })}
              className="w-full px-4 py-3 rounded-[12px] border border-[#e1e8f0] focus:border-[#c69a3f] outline-none text-[13.5px] text-[#0d2c5c] bg-white transition-all"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#6b7c99] block mb-1.5">
              Adresă Email (Conectată)
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full px-4 py-3 rounded-[12px] border border-[#e1e8f0] bg-[#f8fafd] text-[#6b7c99] text-[13.5px] cursor-not-allowed"
            />
          </div>
          <div>
            <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#6b7c99] block mb-1.5">
              Număr de Telefon
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-4 py-3 rounded-[14px] border border-[#e1e8f0] focus:border-[#0284c7] outline-none text-[13.5px] text-[#0d2c5c] bg-white transition-all font-medium"
              placeholder="+40 7XX XXX XXX"
            />
          </div>
        </div>

        <div className="pt-3 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 h-12 rounded-[14px] bg-gradient-to-r from-[#00a896] to-[#0284c7] hover:brightness-105 text-white text-[13px] font-['Plus_Jakarta_Sans',sans-serif] font-bold transition-all shadow-[0_4px_16px_rgba(0,168,150,0.3)] disabled:opacity-50"
          >
            {saving ? "Se salvează…" : "Salvează Modificările"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ─────────────────── HOSPITALITY TAB ─────────────────── */
function HospitalityTab() {
  const { toast } = useToast();
  const [prefs, setPrefs] = useState(() =>
    JSON.parse(
      localStorage.getItem("esy_hospitality_prefs") ||
        '["Puf de gâscă albă","Etaj Superior Panoramic","Temperatură Cameră: 21.5°C"]'
    )
  );

  const toggle = (item: string) => {
    setPrefs((cur: string[]) =>
      cur.includes(item) ? cur.filter((x) => x !== item) : [...cur, item]
    );
  };

  const handleSave = () => {
    localStorage.setItem("esy_hospitality_prefs", JSON.stringify(prefs));
    toast("Preferințele de ospitalitate au fost salvate!", "success");
  };

  const options = [
    "Puf de gâscă albă",
    "Pernă hipoalergenică cu memorie",
    "Etaj Superior Panoramic",
    "Vedere frontală spre răsărit",
    "Fără Lactoză / Fresh Seafood",
    "Meniu vegetarian / vegan",
    "Temperatură Cameră: 21.5°C",
    "Temperatură Cameră: 23.0°C",
    "Vin spumant la sosire",
    "Platou fructe proaspete",
    "Check-in silențios fără formalități",
    "Arome esențiale lavandă & eucalipt",
  ];

  return (
    <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-[0_10px_40px_rgba(13,44,92,0.06)] border border-[#e1e8f0] space-y-6">
      <div>
        <p className="font-['Plus_Jakarta_Sans',sans-serif] text-[11px] font-bold tracking-[0.22em] uppercase text-[#d97706] mb-2 flex items-center gap-2">
          <span className="w-5 h-px bg-[#d97706]" />
          <span>Ospitalitate Personalizată</span>
        </p>
        <h2 className="font-['Outfit',sans-serif] text-[28px] sm:text-[34px] font-bold tracking-tight text-[#0d2c5c]">
          Preferințele Tale în Suită
        </h2>
        <p className="text-[13.5px] text-[#64748b] mt-1 leading-relaxed font-['Plus_Jakarta_Sans',sans-serif]">
          Selectează detaliile care asigură un sejur impecabil la fiecare vizită la Casa Esy.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-['Plus_Jakarta_Sans',sans-serif]">
        {options.map((item) => {
          const isSelected = prefs.includes(item);
          return (
            <button
              key={item}
              onClick={() => toggle(item)}
              className={`p-4 rounded-[16px] border text-left flex items-center justify-between transition-all ${
                isSelected
                  ? "bg-amber-50/80 border-[#d97706] text-[#0d2c5c] font-bold shadow-xs"
                  : "bg-[#f8fafd] border-[#e1e8f0] text-[#3d4f6b] hover:border-[#d97706]/40"
              }`}
            >
              <span className="text-[13px]">{item}</span>
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[10.5px] ${
                  isSelected ? "bg-[#d97706]" : "border border-slate-300"
                }`}
              >
                {isSelected && <Check size={12} strokeWidth={3} />}
              </span>
            </button>
          );
        })}
      </div>

      <div className="pt-2 flex justify-end">
        <button
          onClick={handleSave}
          className="px-6 h-12 rounded-[14px] bg-gradient-to-r from-[#d97706] to-[#b45309] hover:brightness-105 text-white text-[13px] font-['Plus_Jakarta_Sans',sans-serif] font-bold transition-all shadow-sm"
        >
          Salvează Preferințele
        </button>
      </div>
    </div>
  );
}

/* ─────────────────── RESERVATIONS TAB ─────────────────── */
function ReservationsTab({ bookings }: { bookings: Booking[] }) {
  const { toast } = useToast();
  const [scope, setScope] = useState<"upcoming" | "past">("upcoming");
  const [copiedPin, setCopiedPin] = useState<string | null>(null);

  const now = Date.now();
  const items = useMemo(() => {
    return bookings
      .filter((b) => {
        const isPast =
          new Date(b.check_out).getTime() < now ||
          b.status === "completed" ||
          b.status === "cancelled";
        return scope === "past" ? isPast : !isPast;
      })
      .sort((a, b) => new Date(a.check_in).getTime() - new Date(b.check_in).getTime());
  }, [bookings, scope, now]);

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("ro-RO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const calcNights = (a: string, b: string) =>
    Math.max(1, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 864e5));

  return (
    <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-[0_10px_40px_rgba(13,44,92,0.06)] border border-[#e1e8f0] space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="font-['Plus_Jakarta_Sans',sans-serif] text-[11px] font-bold tracking-[0.22em] uppercase text-[#6366f1] mb-2 flex items-center gap-2">
            <span className="w-5 h-px bg-[#6366f1]" />
            <span>Sejururi & Documente</span>
          </p>
          <h2 className="font-['Outfit',sans-serif] text-[28px] sm:text-[34px] font-bold tracking-tight text-[#0d2c5c]">
            Rezervările Tale la Casa Esy
          </h2>
        </div>

        {/* Toggle Scope */}
        <div className="flex p-1 bg-[#f0f4ff] border border-[#c7d2fe] rounded-full self-start sm:self-auto font-['Plus_Jakarta_Sans',sans-serif]">
          {[
            { k: "upcoming" as const, label: "Active & Viitoare" },
            { k: "past" as const, label: "Istoric Sejururi" },
          ].map((t) => (
            <button
              key={t.k}
              onClick={() => setScope(t.k)}
              className={`px-4 py-1.5 text-[12px] font-bold rounded-full transition-all ${
                scope === t.k
                  ? "bg-gradient-to-r from-[#6366f1] to-[#4f46e5] text-white shadow-xs"
                  : "text-[#6366f1] hover:text-[#4338ca]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 px-4 border border-dashed border-[#e1e8f0] rounded-[20px] bg-[#f8fafd]">
          <CalendarCheck size={32} className="mx-auto text-[#c69a3f] mb-3 opacity-60" />
          <p className="font-['Cormorant_Garamond',serif] text-[20px] font-semibold text-[#0d2c5c]">
            Nicio rezervare în această categorie
          </p>
          <p className="text-[12.5px] text-[#6b7c99] mt-1 max-w-[340px] mx-auto">
            Când vei efectua o rezervare la Casa Esy, detaliile sejurului vor apărea automat aici.
          </p>
          <Link
            to="/camere"
            className="mt-4 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-[12px] bg-[#0d2c5c] text-white text-[12px] font-semibold"
          >
            Vezi Camerele Disponibile
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((r) => {
            const isPaid = r.payment_status === "paid";
            return (
              <article
                key={r.id}
                className="p-5 sm:p-6 rounded-[20px] border border-[#e1e8f0] bg-white hover:border-[#c69a3f]/50 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                <div className="space-y-2 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {r.booking_code && (
                      <span className="text-[11px] font-bold tracking-wider text-[#c69a3f] bg-[#c69a3f]/10 px-2.5 py-1 rounded-md">
                        #{r.booking_code}
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        r.status === "confirmed"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : r.status === "pending"
                            ? "bg-amber-50 text-amber-800 border border-amber-200"
                            : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {r.status === "confirmed"
                        ? "Confirmat"
                        : r.status === "pending"
                          ? "În așteptare"
                          : r.status}
                    </span>
                    {isPaid && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                        Achitat
                      </span>
                    )}
                    {r.unit_number && (
                      <span className="text-[11px] font-medium text-[#6b7c99] bg-[#f8fafd] border border-[#e1e8f0] px-2.5 py-1 rounded-md">
                        Cameră {r.unit_number}
                      </span>
                    )}
                  </div>

                  <h3 className="text-[18px] font-bold text-[#0d2c5c]">
                    {r.room?.title || "Cameră Casa Esy"}
                  </h3>

                  <div className="flex items-center gap-2 text-[12.5px] text-[#6b7c99] flex-wrap">
                    <CalendarCheck size={14} className="text-[#c69a3f]" />
                    <span>
                      {fmtDate(r.check_in)} → {fmtDate(r.check_out)}
                    </span>
                    <span>•</span>
                    <span>{calcNights(r.check_in, r.check_out)} nopți</span>
                  </div>

                  {/* SMART LOCK PIN & CHECK-IN */}
                  {r.access_pin ? (
                    <div className="mt-3 flex flex-wrap items-center gap-2 rounded-[14px] bg-[#0d2c5c] p-3 text-white">
                      <div className="flex items-center gap-1.5">
                        <KeyRound size={15} className="text-[#c69a3f]" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#c69a3f]">
                          PIN Smart Lock:
                        </span>
                        <span className="font-mono text-[14px] font-black tracking-widest text-white px-2 py-0.5 rounded bg-white/10">
                          {r.access_pin}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(r.access_pin!);
                          setCopiedPin(r.access_pin!);
                          toast(`PIN copiat: ${r.access_pin}`, "success");
                          setTimeout(() => setCopiedPin(null), 2500);
                        }}
                        className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-semibold hover:bg-white/20 transition-colors"
                      >
                        {copiedPin === r.access_pin ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        {copiedPin === r.access_pin ? "Copiat" : "Copiază"}
                      </button>
                      {r.booking_code && (
                        <Link
                          to={`/checkin/${r.booking_code}`}
                          className="ml-auto text-[11px] font-bold text-[#c69a3f] hover:underline"
                        >
                          Pass Digital & Tastatură →
                        </Link>
                      )}
                    </div>
                  ) : r.booking_code && r.status === "confirmed" ? (
                    <div className="mt-2">
                      <Link
                        to={`/checkin/${r.booking_code}`}
                        className="inline-flex items-center gap-1.5 rounded-[12px] bg-[#0d2c5c] px-3.5 py-2 text-[11.5px] font-bold text-white hover:bg-[#c69a3f] hover:text-[#0d2c5c] transition-all"
                      >
                        <KeyRound size={13} />
                        Self Check-in Online & Cheie Digitală
                      </Link>
                    </div>
                  ) : null}
                </div>

                <div className="flex md:flex-col items-center md:items-end justify-between pt-3 md:pt-0 border-t md:border-t-0 border-[#e1e8f0] shrink-0">
                  {r.total_price != null && (
                    <div className="text-left md:text-right">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#6b7c99] block md:hidden">
                        Total
                      </span>
                      <span className="text-[18px] sm:text-[20px] font-bold text-[#0d2c5c]">
                        {r.total_price.toLocaleString("ro-RO")} RON
                      </span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      void downloadBookingInvoicePdf(
                        String(r.booking_code || r.id),
                        r.booking_code || String(r.id)
                      ).catch((e: any) =>
                        toast(e?.message || "Factura nu a putut fi descărcată.", "error")
                      )
                    }
                    className="mt-2 flex items-center gap-1.5 rounded-[10px] border border-[#e1e8f0] bg-[#f8fafd] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#0d2c5c] hover:border-[#c69a3f] transition-all"
                  >
                    <Download size={13} className="text-[#c69a3f]" />
                    <span>Factură & Voucher</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─────────────────── SECURITY TAB ─────────────────── */
function SecurityTab({
  user,
  onLogout,
}: {
  user: NonNullable<SessionUser>;
  onLogout: () => void;
}) {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });
  const [savingPwd, setSavingPwd] = useState(false);

  const loadSessions = () => {
    setLoadingSessions(true);
    apiFetch<SessionItem[]>("/users/me/sessions")
      .then((d) => setSessions(Array.isArray(d) ? d : []))
      .catch(() => setSessions([]))
      .finally(() => setLoadingSessions(false));
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd.next !== pwd.confirm) {
      toast("Parolele noi nu coincid.", "error");
      return;
    }
    setSavingPwd(true);
    try {
      await apiFetch("/users/me", {
        method: "PATCH",
        body: JSON.stringify({ current_password: pwd.current, new_password: pwd.next }),
      });
      toast("Parola a fost actualizată cu succes!", "success");
      setPwd({ current: "", next: "", confirm: "" });
    } catch (err: any) {
      toast(err?.message || "Eroare la schimbarea parolei.", "error");
    } finally {
      setSavingPwd(false);
    }
  };

  const handleRevokeSession = async (id: string) => {
    try {
      await apiFetch(`/users/me/sessions/${id}`, { method: "DELETE" });
      setSessions((cur) => cur.filter((s) => s.id !== id));
      toast("Sesiunea a fost revocată.", "success");
    } catch {
      toast("Eroare la revocarea sesiunii.", "error");
    }
  };

  const handleRevokeAllOther = async () => {
    try {
      await apiFetch("/users/me/sessions", { method: "DELETE" });
      setSessions((cur) => cur.filter((s) => s.is_current));
      toast("Toate celelalte dispozitive au fost deconectate.", "success");
    } catch {
      toast("Eroare la revocarea sesiunilor.", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Schimbare Parolă */}
      <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-[0_10px_40px_rgba(13,44,92,0.06)] border border-[#e1e8f0]">
        <p className="font-['Plus_Jakarta_Sans',sans-serif] text-[11px] font-bold tracking-[0.22em] uppercase text-[#059669] mb-2 flex items-center gap-2">
          <span className="w-5 h-px bg-[#059669]" />
          <span>Securitate Cont</span>
        </p>
        <h2 className="font-['Outfit',sans-serif] text-[28px] sm:text-[34px] font-bold tracking-tight text-[#0d2c5c]">
          Schimbare Parolă
        </h2>
        <p className="text-[13.5px] text-[#64748b] mt-1 mb-5 leading-relaxed font-['Plus_Jakarta_Sans',sans-serif]">
          Folosește o parolă puternică cu majuscule, litere mici, cifre și simboluri pentru protecția contului.
        </p>

        <form onSubmit={handlePasswordSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 font-['Plus_Jakarta_Sans',sans-serif]">
          <div>
            <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#64748b] block mb-1.5">
              Parola Curentă
            </label>
            <input
              type="password"
              value={pwd.current}
              onChange={(e) => setPwd({ ...pwd, current: e.target.value })}
              className="w-full px-4 py-3 rounded-[14px] border border-[#e1e8f0] focus:border-[#059669] outline-none text-[13.5px] text-[#0d2c5c]"
              required
            />
          </div>
          <div>
            <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#64748b] block mb-1.5">
              Parola Nouă
            </label>
            <input
              type="password"
              value={pwd.next}
              onChange={(e) => setPwd({ ...pwd, next: e.target.value })}
              className="w-full px-4 py-3 rounded-[14px] border border-[#e1e8f0] focus:border-[#059669] outline-none text-[13.5px] text-[#0d2c5c]"
              required
            />
          </div>
          <div>
            <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#64748b] block mb-1.5">
              Confirmă Parola
            </label>
            <input
              type="password"
              value={pwd.confirm}
              onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
              className="w-full px-4 py-3 rounded-[14px] border border-[#e1e8f0] focus:border-[#059669] outline-none text-[13.5px] text-[#0d2c5c]"
              required
            />
          </div>
          <div className="md:col-span-3 flex justify-end mt-2">
            <button
              type="submit"
              disabled={savingPwd}
              className="px-6 h-12 rounded-[14px] bg-gradient-to-r from-[#059669] to-[#0d9488] hover:brightness-105 text-white text-[13px] font-bold transition-all shadow-xs disabled:opacity-50"
            >
              {savingPwd ? "Se actualizează…" : "Actualizează Parola"}
            </button>
          </div>
        </form>
      </div>

      {/* Sesiuni Active */}
      <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-[0_10px_40px_rgba(13,44,92,0.06)] border border-[#e1e8f0]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <p className="font-['Plus_Jakarta_Sans',sans-serif] text-[10.5px] font-bold tracking-[0.2em] uppercase text-[#059669] mb-1">
              Dispozitive Conectate
            </p>
            <h2 className="font-['Outfit',sans-serif] text-[24px] font-bold text-[#0d2c5c]">
              Sesiuni Active
            </h2>
            <p className="text-[12.5px] text-[#64748b] mt-0.5 font-['Plus_Jakarta_Sans',sans-serif]">
              Gestionează dispozitivele conectate la contul tău Casa Esy.
            </p>
          </div>
          <div className="flex items-center gap-2 font-['Plus_Jakarta_Sans',sans-serif]">
            <button
              onClick={loadSessions}
              className="px-3.5 py-2 rounded-[12px] border border-[#e1e8f0] text-[12px] font-bold text-[#0d2c5c] hover:bg-[#f8fafd]"
            >
              Reîmprospătează
            </button>
            {sessions.some((s) => !s.is_current) && (
              <button
                onClick={handleRevokeAllOther}
                className="px-3.5 py-2 rounded-[12px] border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-[12px] font-bold transition-colors"
              >
                Revocă Celelalte
              </button>
            )}
          </div>
        </div>

        {loadingSessions ? (
          <p className="text-[13px] text-[#6b7c99]">Se încarcă dispozitivele…</p>
        ) : sessions.length === 0 ? (
          <p className="text-[13px] text-[#6b7c99]">Nicio sesiune activă raportată.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-['Plus_Jakarta_Sans',sans-serif]">
            {sessions.map((s) => (
              <div
                key={s.id}
                className={`p-4 rounded-[16px] border flex items-center justify-between ${
                  s.is_current
                    ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                    : "bg-[#f8fafd] border-[#e1e8f0]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${s.is_current ? "bg-emerald-100 text-emerald-800" : "bg-white border border-[#e1e8f0] text-[#0d2c5c]"}`}>
                    <Monitor size={17} />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-[#0d2c5c]">
                      {s.browser_family || "Browser"} • {s.os_family || "Dispozitiv"}
                    </p>
                    <p className="text-[11.5px] text-[#64748b]">
                      IP: {s.ip_address || "—"} {s.is_current && "• (Acest dispozitiv)"}
                    </p>
                  </div>
                </div>
                {!s.is_current && (
                  <button
                    onClick={() => handleRevokeSession(s.id)}
                    className="text-[11.5px] text-red-600 hover:underline font-bold"
                  >
                    Deconectează
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────── DANGER TAB ─────────────────── */
function DangerTab({ onDeleted }: { onDeleted: () => void }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [word, setWord] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const canDelete = word === "ȘTERGE";

  const doDelete = async () => {
    setBusy(true);
    setErr("");
    try {
      const res = await fetch(`${API_URL}/users/me`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        onDeleted();
      } else {
        setErr("Nu am putut șterge contul. Încearcă din nou.");
      }
    } catch {
      setErr("Problemă de conexiune cu serverul.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-[0_10px_40px_rgba(13,44,92,0.06)] border border-red-200 space-y-6">
      <div>
        <p className="font-['Plus_Jakarta_Sans',sans-serif] text-[11px] font-bold tracking-[0.22em] uppercase text-red-600 mb-2 flex items-center gap-2">
          <span className="w-5 h-px bg-red-400" />
          <span>Zonă Periculoasă</span>
        </p>
        <h2 className="font-['Outfit',sans-serif] text-[28px] sm:text-[34px] font-bold tracking-tight text-red-700">
          Ștergere Cont Permanentă
        </h2>
        <p className="text-[13.5px] text-[#64748b] mt-1 leading-relaxed font-['Plus_Jakarta_Sans',sans-serif]">
          Această acțiune este ireversibilă. Toate datele tale, rezervările și punctele de loialitate vor fi eliminate definitiv din sistemul Casa Esy.
        </p>
      </div>

      <div className="p-5 rounded-[18px] border border-red-200 bg-red-50/50">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h4 className="text-[15px] font-bold text-red-900">
              Elimină definitiv contul tău Casa Esy
            </h4>
            <p className="text-[12.5px] text-red-700/80 mt-1 max-w-[500px]">
              Vei fi delogat imediat de pe toate dispozitivele și nu vei mai putea recupera contul sau istoricul de sejururi.
            </p>
          </div>
          {!confirmOpen && (
            <button
              onClick={() => setConfirmOpen(true)}
              className="px-5 py-2.5 rounded-[12px] bg-red-600 hover:bg-red-700 text-white text-[12.5px] font-semibold transition-colors shrink-0 shadow-sm"
            >
              Șterge Contul
            </button>
          )}
        </div>

        {confirmOpen && (
          <div className="mt-5 pt-5 border-t border-red-200 space-y-4">
            <p className="text-[12.5px] font-semibold text-red-900">
              Pentru a confirma ștergerea definitivă, tastează cuvântul{" "}
              <b className="font-mono text-red-700 font-black">ȘTERGE</b> mai jos:
            </p>
            <input
              type="text"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder="ȘTERGE"
              className="w-full sm:w-[260px] px-4 py-2.5 rounded-[12px] border border-red-300 bg-white text-red-900 font-mono text-[14px] outline-none"
            />
            {err && <p className="text-[12px] font-semibold text-red-600">{err}</p>}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  setConfirmOpen(false);
                  setWord("");
                  setErr("");
                }}
                className="px-4 py-2 rounded-[10px] border border-[#e1e8f0] bg-white text-[12.5px] font-semibold text-[#0d2c5c]"
              >
                Renunță
              </button>
              <button
                disabled={!canDelete || busy}
                onClick={doDelete}
                className="px-5 py-2 rounded-[10px] bg-red-600 hover:bg-red-700 text-white text-[12.5px] font-semibold transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                <Trash2 size={13} />
                <span>{busy ? "Se șterge…" : "Confirmă Ștergerea Definitivă"}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────── MODERN LUXURY BACKGROUND (CLEAN & SUBTLE) ─────────────────── */
function FloatingMaritimeBackgroundWhite() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      {/* 1. SOFT CONTEMPORARY RADIAL MESH */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(0,168,150,0.06),transparent_70%)]" />

      {/* 2. SUBTLE ARCHITECTURAL WATERMARKS (STATIC, ELEGANT, ULTRA-LOW OPACITY) */}
      <div className="absolute -top-12 -right-16 w-[520px] h-[520px] opacity-[0.02] text-[#0d2c5c]">
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 6" />
          <circle cx="100" cy="100" r="62" stroke="currentColor" strokeWidth="1" />
          <circle cx="100" cy="100" r="46" stroke="currentColor" strokeWidth="2" />
          <path
            d="M100 12 L114 86 L188 100 L114 114 L100 188 L86 114 L12 100 L86 86 Z"
            fill="currentColor"
            fillOpacity="0.4"
          />
        </svg>
      </div>

      <div className="absolute -bottom-24 -left-24 w-[480px] h-[480px] opacity-[0.018] text-[#c69a3f]">
        <svg viewBox="0 0 100 100" fill="currentColor">
          <path d="M50 0 C55 20 80 45 100 50 C80 55 55 80 50 100 C45 80 20 55 0 50 C20 45 45 20 50 0 Z" />
        </svg>
      </div>

      {/* 3. SOFT AMBIENT LUXURY GLOWS (CLEAN & NON-INTRUSIVE) */}
      <div className="absolute top-[28%] -left-20 w-[450px] h-[450px] rounded-full bg-[#c69a3f]/[0.025] blur-[140px]" />
      <div className="absolute top-[60%] -right-20 w-[500px] h-[500px] rounded-full bg-[#0d2c5c]/[0.02] blur-[150px]" />
    </div>
  );
}

/* ─────────────────── HELPER FUNCTIONS ─────────────────── */
function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase() || "?";
}
