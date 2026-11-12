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
  Calendar,
  Building,
  FileText,
  Copy,
  Sparkles,
  Wrench,
  Star,
  Lock,
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
import { useAdminLiveSync } from "../context/AdminLiveSyncContext";
import { useToast } from "../components/Toast";
import { downloadBookingInvoicePdf } from "../lib/admin";
import RoomFolioCard from "../components/upsell/RoomFolioCard";
import MaintenanceReportModal from "../components/maintenance/MaintenanceReportModal";
import GuestFeedbackModal from "../components/reviews/GuestFeedbackModal";
import LoyaltyCard, { type LoyaltyAccountData } from "../components/loyalty/LoyaltyCard";

type TabKey = "overview" | "personal" | "reservations" | "security" | "danger";

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
}[] = [
  {
    key: "overview",
    label: "Prezentare și sejur",
    icon: CalendarCheck,
  },
  {
    key: "personal",
    label: "Date personale",
    icon: UserIcon,
  },
  {
    key: "reservations",
    label: "Istoric și facturi",
    icon: FileText,
  },
  {
    key: "security",
    label: "Securitate și sesiuni",
    icon: Shield,
  },
  {
    key: "danger",
    label: "Zonă de siguranță cont",
    icon: TriangleAlert,
  },
];

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<SessionUser>(getCachedUser());
  const [loading, setLoading] = useState(!user);
  const [tab, setTab] = useState<TabKey>("overview");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loyaltyAccount, setLoyaltyAccount] = useState<LoyaltyAccountData | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    apiFetch<Booking[]>("/bookings/my-bookings")
      .then((d) => setBookings(Array.isArray(d) ? d : []))
      .catch(() => setBookings([]));
    apiFetch<LoyaltyAccountData>("/loyalty/my-account")
      .then((d) => setLoyaltyAccount(d))
      .catch(() => {});
  }, []);

  useAdminLiveSync({
    topic: "loyalty",
    onSync: () => {
      apiFetch<LoyaltyAccountData>("/loyalty/my-account")
        .then((d) => setLoyaltyAccount(d))
        .catch(() => {});
    },
  });

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
    <div className="min-h-screen w-full bg-[#f8f6f1] text-[#0d2c5c] font-sans antialiased relative overflow-hidden">
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
                {/* Avatar with luxury gold border */}
                <div className="relative">
                  <div className="w-[114px] h-[114px] sm:w-[128px] sm:h-[128px] rounded-full p-[3px] bg-[#c69a3f]/40 shadow-md border border-[#c69a3f]/30">
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
                </div>

                <h1 className="mt-4 font-['Outfit',sans-serif] text-[28px] sm:text-[32px] font-bold text-[#0d2c5c] leading-tight tracking-tight">
                  {fullName}
                </h1>
                <div className="mt-2 flex items-center justify-center">
                  <span className="px-3.5 py-1 rounded-full bg-[#fdf8ec] text-[#9c7624] border border-[#c69a3f]/35 text-[11px] font-['Plus_Jakarta_Sans',sans-serif] font-bold tracking-wider uppercase flex items-center gap-1.5 shadow-xs">
                    <span className="text-[#c69a3f]">★</span>
                    <span>Oaspete Privilège • Casa Esy {loyaltyAccount?.tier || "Bronze"}</span>
                  </span>
                </div>
                <p className="text-[12px] text-[#64748b] mt-2 flex items-center justify-center gap-1.5 font-['Plus_Jakarta_Sans',sans-serif]">
                  <MapPin size={13} className="text-[#c69a3f]" />
                  <span>Mamaia, Constanța • România</span>
                </p>

                {/* Quick actions */}
                <div className="w-full mt-5 flex items-center gap-2.5">
                  <button
                    onClick={() => setTab("personal")}
                    title="Editează datele personale"
                    className="w-12 h-12 rounded-[14px] bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#e1e8f0] text-[#0d2c5c] flex items-center justify-center transition-colors shrink-0 shadow-xs"
                  >
                    <SlidersHorizontal size={17} className="text-[#0d2c5c]" />
                  </button>
                  <Link
                    to="/camere"
                    className="flex-1 h-12 rounded-[14px] bg-[#0d2c5c] hover:bg-[#07203f] text-white text-[13.5px] font-['Plus_Jakarta_Sans',sans-serif] font-bold flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(13,44,92,0.18)] transition-all active:scale-[0.99]"
                  >
                    <Calendar size={15} className="text-[#c69a3f]" />
                    <span>Rezervă Sejur Nou</span>
                  </Link>
                </div>
              </div>

              {/* BENEFICII INCLUSE (STIL LUXURY CASA ESY - NAVY ȘI GOLD) */}
              <div className="mt-6 pt-5 border-t border-[#e1e8f0]">
                <p className="font-['Plus_Jakarta_Sans',sans-serif] text-[10.5px] font-bold tracking-[0.2em] uppercase text-[#64748b] mb-3">
                  Beneficii incluse în statut:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(loyaltyAccount?.tier_perks?.length
                    ? loyaltyAccount.tier_perks
                    : [
                        "100 Puncte / noapte cazare",
                        "1 Punct / 10 RON comenzi",
                        "Welcome Drink rece la check-in",
                        "Wi-Fi de mare viteză gratuit",
                      ]
                  ).map((label) => (
                    <span
                      key={label}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#e1e8f0] bg-[#f8fafc] text-[11.5px] font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-[#0d2c5c]"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#c69a3f]" />
                      <span>{label}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* STATISTICI DIN CONTUL VIP & REZERVARI REALE */}
              <div className="mt-6 pt-5 border-t border-[#e1e8f0] grid grid-cols-3 text-center">
                {(() => {
                  const valid = bookings.filter((b) => b.status !== "cancelled");
                  const points = loyaltyAccount?.points_balance ?? 0;
                  const vipTier = loyaltyAccount?.tier || "Bronze";
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
                        <p className="font-['Outfit',sans-serif] text-[26px] sm:text-[28px] font-bold text-[#0d2c5c] leading-none">
                          {points.toLocaleString("ro-RO")}
                        </p>
                        <p className="font-['Plus_Jakarta_Sans',sans-serif] text-[11px] text-[#64748b] mt-1 font-semibold">
                          Puncte Club
                        </p>
                      </div>
                      <div>
                        <p className="font-['Outfit',sans-serif] text-[26px] sm:text-[28px] font-bold text-[#c69a3f] leading-none">
                          {vipTier}
                        </p>
                        <p className="font-['Plus_Jakarta_Sans',sans-serif] text-[11px] text-[#c69a3f] mt-1 font-semibold">
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
                <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-[#c69a3f] border border-[#c69a3f]/30 text-[10.5px] font-['Plus_Jakarta_Sans',sans-serif] font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c69a3f]"></span> Serviciu Activ
                </span>
              </div>
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-full bg-[#0d2c5c] text-[#c69a3f] border border-[#c69a3f]/30 flex items-center justify-center font-['Outfit',sans-serif] text-[16px] font-bold shrink-0 shadow-sm">
                  CE
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold text-[#0d2c5c] truncate font-['Plus_Jakarta_Sans',sans-serif]">
                    Recepție și concierge
                  </p>
                  <p className="text-[11.5px] text-[#64748b] truncate font-['Plus_Jakarta_Sans',sans-serif]">
                    Head Butler • Serviciu 24/7
                  </p>
                </div>
                <Link
                  to="/contact"
                  title="Contactează concierge-ul"
                  className="w-9 h-9 rounded-[12px] bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#e1e8f0] text-[#0d2c5c] flex items-center justify-center transition-colors shrink-0 shadow-xs"
                >
                  <MessageSquare size={16} className="text-[#c69a3f]" />
                </Link>
              </div>
            </div>
          </div>

          {/* RIGHT MAIN CONTENT */}
          <div className="min-w-0 flex flex-col gap-6">
            {/* TAB BAR LUXURY CASA ESY - ROYAL NAVY & GOLD */}
            <div className="bg-white rounded-[22px] p-2 shadow-[0_8px_30px_rgba(13,44,92,0.06)] border border-[#e1e8f0]">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5">
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
                            ? "bg-red-700 text-white shadow-sm"
                            : "bg-[#0d2c5c] text-white shadow-sm"
                          : isDanger
                            ? "text-red-600 hover:bg-red-50 hover:text-red-700"
                            : "text-[#64748b] hover:text-[#0d2c5c] hover:bg-[#f8fafc]"
                      }`}
                    >
                      <Icon
                        size={15}
                        className={`shrink-0 ${
                          active
                            ? isDanger
                              ? "text-white"
                              : "text-[#c69a3f]"
                            : isDanger
                              ? "text-red-500"
                              : "text-[#64748b]"
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
                onLoyaltyChange={setLoyaltyAccount}
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
  onLoyaltyChange,
}: {
  user: NonNullable<SessionUser>;
  bookings: Booking[];
  goToTab: (t: TabKey) => void;
  onLoyaltyChange: (acc: LoyaltyAccountData | null) => void;
}) {
  const { toast } = useToast();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [maintenanceModalOpen, setMaintenanceModalOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);

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
                <span className="text-[#0d2c5c]">Următorul sejur confirmat</span>
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
                  <Building size={14} className="text-[#c69a3f] shrink-0" />
                  <span>
                    Mamaia Resort • {Math.max(1, stayDays.length - 1)} nopți
                    {next.unit_number ? ` • Suita ${next.unit_number}` : ""}
                  </span>
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  onClick={() => setFeedbackModalOpen(true)}
                  className="px-4 h-11 rounded-[14px] border border-[#e1e8f0] hover:border-[#c69a3f] text-[#0d2c5c] hover:bg-[#f8fafc] text-[12.5px] font-['Plus_Jakarta_Sans',sans-serif] font-bold flex items-center gap-2 bg-white transition-colors shadow-xs"
                  title="Oferă o evaluare pentru sejurul dumneavoastră"
                >
                  <Star size={14} className="fill-[#c69a3f] text-[#c69a3f]" />
                  <span>Evaluează sejurul</span>
                </button>
                <button
                  onClick={() => setMaintenanceModalOpen(true)}
                  className="px-4 h-11 rounded-[14px] border border-[#e1e8f0] hover:border-[#c69a3f] text-[#0d2c5c] hover:bg-[#f8fafc] text-[12.5px] font-['Plus_Jakarta_Sans',sans-serif] font-bold flex items-center gap-2 bg-white transition-colors shadow-xs"
                  title="Raportează o defecțiune tehnică în cameră"
                >
                  <Wrench size={14} className="text-[#c69a3f]" />
                  <span>Raportează problemă</span>
                </button>
                <button
                  onClick={() => {
                    downloadBookingInvoicePdf(
                      String(next.booking_code || next.id),
                      next.booking_code || String(next.id)
                    ).catch((e: any) =>
                      toast(e?.message || "Factura nu a putut fi descărcată.", "error")
                    );
                  }}
                  className="px-4 h-11 rounded-[14px] border border-[#e1e8f0] hover:border-[#c69a3f] text-[#0d2c5c] hover:bg-[#f8fafc] text-[12.5px] font-['Plus_Jakarta_Sans',sans-serif] font-bold flex items-center gap-2 bg-white transition-colors shadow-xs"
                >
                  <Download size={14} className="text-[#c69a3f]" />
                  <span>Descarcă voucher</span>
                </button>
                <button
                  onClick={() => goToTab("reservations")}
                  className="px-4 h-11 rounded-[14px] bg-[#0d2c5c] hover:bg-[#07203f] text-white text-[12.5px] font-['Plus_Jakarta_Sans',sans-serif] font-bold flex items-center gap-2 transition-colors shadow-sm"
                >
                  <SlidersHorizontal size={14} className="text-[#c69a3f]" />
                  <span>Detalii sejur</span>
                </button>
              </div>
            </div>

            {/* Zilele sejurului (STIL ELEGANT CASA ESY) */}
            {stayDays.length > 0 && (
              <div className="mt-6 pt-5 border-t border-[#e1e8f0]">
                <div className="flex items-center justify-between mb-3.5">
                  <p className="font-['Plus_Jakarta_Sans',sans-serif] text-[11px] font-bold tracking-[0.2em] uppercase text-[#64748b] flex items-center gap-1.5">
                    <span className="w-3 h-px bg-[#c69a3f]" />
                    <span>Zilele sejurului tău:</span>
                  </p>
                  <Link
                    to="/facilitati"
                    className="text-[12px] font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[#0d2c5c] hover:text-[#c69a3f] hover:underline transition-colors"
                  >
                    Program activități și spa →
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                  {stayDays.map((d, i, arr) => {
                    const isFirst = i === 0;
                    const isLast = i === arr.length - 1 && arr.length > 1;
                    return (
                      <div
                        key={i}
                        className={`rounded-[18px] p-3.5 text-center border transition-all ${
                          isFirst
                            ? "bg-white border-[#c69a3f]/70 text-[#0d2c5c] shadow-xs"
                            : isLast
                            ? "bg-white border-[#0d2c5c]/40 text-[#0d2c5c]"
                            : "bg-[#f8fafc] border-[#e1e8f0] text-[#0d2c5c]"
                        }`}
                      >
                        <p className="font-['Plus_Jakarta_Sans',sans-serif] text-[11px] font-bold tracking-wider uppercase opacity-70">
                          {fmtDay(d)}
                        </p>
                        <p className="font-['Outfit',sans-serif] text-[22px] font-bold mt-1 text-[#0d2c5c]">
                          {fmtDate(d)}
                        </p>
                        <p className="mt-1.5 inline-block">
                          <span
                            className={`text-[10.5px] font-['Plus_Jakarta_Sans',sans-serif] font-bold px-2 py-0.5 rounded-full ${
                              isFirst
                                ? "bg-amber-50 text-[#c69a3f] border border-[#c69a3f]/40"
                                : isLast
                                ? "bg-[#0d2c5c] text-white"
                                : "bg-white text-[#64748b] border border-[#e1e8f0]"
                            }`}
                          >
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
              <div className="flex items-center gap-2 font-['Plus_Jakarta_Sans',sans-serif] text-[11px] font-bold tracking-[0.22em] uppercase text-[#0d2c5c]">
                <span className="w-5 h-px bg-[#c69a3f]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#c69a3f]"></span>
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
              className="px-6 h-12 rounded-[14px] bg-[#0d2c5c] hover:bg-[#07203f] text-white text-[13px] font-['Plus_Jakarta_Sans',sans-serif] font-bold flex items-center justify-center gap-2 transition-all shadow-[0_4px_16px_rgba(13,44,92,0.18)] shrink-0"
            >
              <CalendarCheck size={16} className="text-[#c69a3f]" />
              <span>Explorează Camerele</span>
            </Link>
          </div>
        )}
      </div>

      {/* PROGRAM VIP & LOYALTY PRIVILEGE CLUB */}
      <LoyaltyCard
        bookings={bookings.map((b) => ({
          id: b.id,
          booking_code: b.booking_code,
          check_in: b.check_in,
          check_out: b.check_out,
          status: b.status,
          room_title: b.room?.title,
        }))}
        onAccountChange={onLoyaltyChange}
      />

      {/* NOTA CAMEREI & SOLD RĂMAS (ROOM FOLIO & UPSELLING MIC DEJUN) */}
      {next && (
        <RoomFolioCard
          bookingId={String(next.id)}
          bookingCode={next.booking_code || String(next.id)}
          nightsCount={Math.max(1, stayDays.length - 1)}
          adultsCount={2}
        />
      )}

      {/* GRID 2 COLOANE: CONTACT & SECURITATE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Date Personale Contact */}
        <div className="bg-white rounded-[24px] p-6 sm:p-7 shadow-[0_10px_40px_rgba(13,44,92,0.06)] border border-[#e1e8f0] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="font-['Plus_Jakarta_Sans',sans-serif] text-[11px] font-bold tracking-[0.22em] uppercase text-[#0d2c5c] flex items-center gap-2">
                <span className="w-4 h-px bg-[#c69a3f]" />
                <span>Date personale de contact</span>
              </p>
              <button
                onClick={() => goToTab("personal")}
                className="text-[12.5px] font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[#c69a3f] hover:underline"
              >
                Editează
              </button>
            </div>

            <div className="space-y-3.5 font-['Plus_Jakarta_Sans',sans-serif]">
              <div>
                <p className="text-[10.5px] font-bold uppercase tracking-wider text-[#64748b]">
                  Nume complet
                </p>
                <p className="font-['Outfit',sans-serif] text-[18px] font-bold text-[#0d2c5c] mt-0.5">
                  {fullName}
                </p>
              </div>
              <div>
                <p className="text-[10.5px] font-bold uppercase tracking-wider text-[#64748b]">
                  Adresă de email
                </p>
                <p className="text-[14px] text-[#0d2c5c] mt-0.5 flex items-center gap-1.5 truncate font-semibold">
                  <span>{user.email}</span>
                  <BadgeCheck size={14} className="text-[#c69a3f] shrink-0" />
                </p>
              </div>
              <div>
                <p className="text-[10.5px] font-bold uppercase tracking-wider text-[#64748b]">
                  Număr de telefon
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
            <span className="text-[#0d2c5c] bg-amber-50 border border-[#c69a3f]/30 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
              ✓ Cont verificat
            </span>
          </div>
        </div>

        {/* Securitate și setări cont */}
        <div className="bg-white rounded-[24px] p-6 sm:p-7 shadow-[0_10px_40px_rgba(13,44,92,0.06)] border border-[#e1e8f0] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="font-['Plus_Jakarta_Sans',sans-serif] text-[11px] font-bold tracking-[0.22em] uppercase text-[#0d2c5c] flex items-center gap-2">
                <span className="w-4 h-px bg-[#c69a3f]" />
                <span>Securitate și setări cont</span>
              </p>
              <button
                onClick={() => goToTab("security")}
                className="text-[12.5px] font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[#c69a3f] hover:underline"
              >
                Gestionează
              </button>
            </div>

            <div className="space-y-3 font-['Plus_Jakarta_Sans',sans-serif]">
              <div className="flex items-center justify-between p-3 rounded-[14px] bg-[#f8fafc] border border-[#e1e8f0]">
                <div className="flex items-center gap-2.5">
                  <Shield size={16} className="text-[#c69a3f]" />
                  <div>
                    <p className="text-[12.5px] font-bold text-[#0d2c5c]">Protecție cont</p>
                    <p className="text-[11px] text-[#64748b]">Parolă criptată cu hash securizat</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-[#0d2c5c] bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  Activ
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-[14px] bg-[#f8fafc] border border-[#e1e8f0]">
                <div className="flex items-center gap-2.5">
                  <Lock size={16} className="text-[#c69a3f]" />
                  <div>
                    <p className="text-[12.5px] font-bold text-[#0d2c5c]">Sesiuni conectate</p>
                    <p className="text-[11px] text-[#64748b]">Dispozitive autorizate Casa Esy</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-[#0d2c5c] bg-amber-50 border border-[#c69a3f]/30 px-2.5 py-0.5 rounded-full">
                  1 Activă
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-[#e1e8f0] flex items-center justify-between font-['Plus_Jakarta_Sans',sans-serif]">
            <span className="text-[12.5px] font-semibold text-[#0d2c5c]">
              Notificări SMS / WhatsApp
            </span>
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors ${
                notificationsEnabled ? "bg-[#0d2c5c]" : "bg-slate-300"
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
            Salvează setările profilului
          </button>
        </div>
      </div>

      <MaintenanceReportModal
        isOpen={maintenanceModalOpen}
        onClose={() => setMaintenanceModalOpen(false)}
        bookingCode={next?.booking_code}
        unitNumber={next?.unit_number}
        defaultGuestName={fullName}
      />

      <GuestFeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        roomId={next?.room && (next.room as any).id ? String((next.room as any).id) : undefined}
        roomTitle={next?.room?.title}
        bookingCode={next?.booking_code}
        unitNumber={next?.unit_number}
        defaultGuestName={fullName}
      />
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
        <p className="font-['Plus_Jakarta_Sans',sans-serif] text-[11px] font-bold tracking-[0.22em] uppercase text-[#0d2c5c] mb-2 flex items-center gap-2">
          <span className="w-5 h-px bg-[#c69a3f]" />
          <span>Date personale</span>
        </p>
        <h2 className="font-['Outfit',sans-serif] text-[28px] sm:text-[34px] font-bold tracking-tight text-[#0d2c5c]">
          Profilul tău la Casa Esy
        </h2>
        <p className="text-[13.5px] text-[#64748b] mt-1 leading-relaxed font-['Plus_Jakarta_Sans',sans-serif]">
          Actualizează datele de contact și fotografia afișată pe contul tău de oaspete.
        </p>
      </div>

      {/* Profil Avatar uploader */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 p-4 rounded-[18px] bg-[#f8fafc] border border-[#e1e8f0]">
        <div className="relative w-20 h-20 rounded-full p-[2.5px] bg-[#c69a3f]/40 border border-[#c69a3f]/30 shrink-0 shadow-sm">
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
              className="px-4 py-2 rounded-[12px] bg-[#0d2c5c] hover:bg-[#07203f] text-white text-[12px] font-bold transition-all disabled:opacity-50 shadow-xs"
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
              className="w-full px-4 py-3 rounded-[14px] border border-[#e1e8f0] focus:border-[#c69a3f] outline-none text-[13.5px] text-[#0d2c5c] bg-white transition-all font-medium"
              placeholder="+40 7XX XXX XXX"
            />
          </div>
        </div>

        <div className="pt-3 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 h-12 rounded-[14px] bg-[#0d2c5c] hover:bg-[#07203f] text-white text-[13px] font-['Plus_Jakarta_Sans',sans-serif] font-bold transition-all shadow-sm disabled:opacity-50"
          >
            {saving ? "Se salvează…" : "Salvează Modificările"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ─────────────────── RESERVATIONS TAB ─────────────────── */
function ReservationsTab({ bookings }: { bookings: Booking[] }) {
  const { toast } = useToast();
  const [scope, setScope] = useState<"upcoming" | "past">("upcoming");
  const [copiedPin, setCopiedPin] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const [cancelledIds, setCancelledIds] = useState<Record<string, boolean>>({});

  const now = Date.now();
  const items = useMemo(() => {
    return bookings
      .map((b) => (cancelledIds[b.id] ? { ...b, status: "cancelled" } : b))
      .filter((b) => {
        const isPast =
          new Date(b.check_out).getTime() < now ||
          b.status === "completed" ||
          b.status === "cancelled";
        return scope === "past" ? isPast : !isPast;
      })
      .sort((a, b) => new Date(a.check_in).getTime() - new Date(b.check_in).getTime());
  }, [bookings, scope, now, cancelledIds]);

  const handleCancelRefund = async (bookingId: string) => {
    setCancellingId(bookingId);
    try {
      await apiFetch(`/bookings/${encodeURIComponent(bookingId)}/cancel`, {
        method: "POST",
        body: JSON.stringify({
          status: "cancelled",
          cancellation_reason: "Anulare solicitată de client în termen de 30 de zile",
        }),
      });
      setCancelledIds((prev) => ({ ...prev, [bookingId]: true }));
      setConfirmCancelId(null);
      toast("Rezervarea a fost anulată și rambursarea a fost inițiată prin Stripe.", "success");
    } catch (e: any) {
      toast(e?.message || "Anularea nu a putut fi procesată.", "error");
    } finally {
      setCancellingId(null);
    }
  };

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
          <p className="font-['Plus_Jakarta_Sans',sans-serif] text-[11px] font-bold tracking-[0.22em] uppercase text-[#0d2c5c] mb-2 flex items-center gap-2">
            <span className="w-5 h-px bg-[#c69a3f]" />
            <span>Sejururi și documente</span>
          </p>
          <h2 className="font-['Outfit',sans-serif] text-[28px] sm:text-[34px] font-bold tracking-tight text-[#0d2c5c]">
            Rezervările tale la Casa Esy
          </h2>
        </div>

        {/* Toggle Scope */}
        <div className="flex p-1 bg-[#f8fafc] border border-[#e1e8f0] rounded-full self-start sm:self-auto font-['Plus_Jakarta_Sans',sans-serif]">
          {[
            { k: "upcoming" as const, label: "Active și viitoare" },
            { k: "past" as const, label: "Istoric sejururi" },
          ].map((t) => (
            <button
              key={t.k}
              onClick={() => setScope(t.k)}
              className={`px-4 py-1.5 text-[12px] font-bold rounded-full transition-all ${
                scope === t.k
                  ? "bg-[#0d2c5c] text-white shadow-xs"
                  : "text-[#64748b] hover:text-[#0d2c5c]"
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
            Vezi camerele disponibile
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
                          Permis digital și tastatură →
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
                        Check-in online și cheie digitală
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
                    <span>Factură și voucher</span>
                  </button>

                  {(() => {
                    const plan = (r as any).rate_plan_code || "flexible";
                    const createdRaw = (r as any).created_at || (r as any).booking_date;
                    const createdMs = createdRaw ? new Date(createdRaw).getTime() : now;
                    const daysElapsed = Math.max(0, Math.floor((now - createdMs) / 864e5));
                    const canRefund =
                      r.status === "confirmed" &&
                      plan !== "non_refundable" &&
                      new Date(r.check_in).getTime() >= now &&
                      daysElapsed <= 30;
                    if (!canRefund) return null;

                    if (confirmCancelId === r.id) {
                      return (
                        <div className="mt-2 flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={cancellingId === r.id}
                            onClick={() => void handleCancelRefund(r.id)}
                            className="flex items-center gap-1 rounded-[10px] bg-rose-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-rose-700 transition-all disabled:opacity-60"
                          >
                            <RefreshCcw size={12} className={cancellingId === r.id ? "animate-spin" : ""} />
                            <span>{cancellingId === r.id ? "Procesare..." : "Confirmă Refund"}</span>
                          </button>
                          <button
                            type="button"
                            disabled={cancellingId === r.id}
                            onClick={() => setConfirmCancelId(null)}
                            className="rounded-[10px] border border-[#e1e8f0] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[#6b7c99] hover:bg-slate-50"
                          >
                            Nu
                          </button>
                        </div>
                      );
                    }

                    return (
                      <button
                        type="button"
                        onClick={() => setConfirmCancelId(r.id)}
                        className="mt-2 flex items-center gap-1.5 rounded-[10px] border border-rose-200 bg-rose-50/70 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-rose-700 hover:bg-rose-100 transition-all"
                      >
                        <RefreshCcw size={12} />
                        <span>Anulare & Refund ({30 - daysElapsed}z)</span>
                      </button>
                    );
                  })()}
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
        <p className="font-['Plus_Jakarta_Sans',sans-serif] text-[11px] font-bold tracking-[0.22em] uppercase text-[#0d2c5c] mb-2 flex items-center gap-2">
          <span className="w-5 h-px bg-[#c69a3f]" />
          <span>Securitate cont</span>
        </p>
        <h2 className="font-['Outfit',sans-serif] text-[28px] sm:text-[34px] font-bold tracking-tight text-[#0d2c5c]">
          Schimbare parolă
        </h2>
        <p className="text-[13.5px] text-[#64748b] mt-1 mb-5 leading-relaxed font-['Plus_Jakarta_Sans',sans-serif]">
          Folosește o parolă puternică cu majuscule, litere mici, cifre și simboluri pentru protecția contului.
        </p>

        <form onSubmit={handlePasswordSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 font-['Plus_Jakarta_Sans',sans-serif]">
          <div>
            <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#64748b] block mb-1.5">
              Parola curentă
            </label>
            <input
              type="password"
              value={pwd.current}
              onChange={(e) => setPwd({ ...pwd, current: e.target.value })}
              className="w-full px-4 py-3 rounded-[14px] border border-[#e1e8f0] focus:border-[#c69a3f] outline-none text-[13.5px] text-[#0d2c5c]"
              required
            />
          </div>
          <div>
            <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#64748b] block mb-1.5">
              Parola nouă
            </label>
            <input
              type="password"
              value={pwd.next}
              onChange={(e) => setPwd({ ...pwd, next: e.target.value })}
              className="w-full px-4 py-3 rounded-[14px] border border-[#e1e8f0] focus:border-[#c69a3f] outline-none text-[13.5px] text-[#0d2c5c]"
              required
            />
          </div>
          <div>
            <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#64748b] block mb-1.5">
              Confirmă parola nouă
            </label>
            <input
              type="password"
              value={pwd.confirm}
              onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
              className="w-full px-4 py-3 rounded-[14px] border border-[#e1e8f0] focus:border-[#c69a3f] outline-none text-[13.5px] text-[#0d2c5c]"
              required
            />
          </div>
          <div className="md:col-span-3 flex justify-end mt-2">
            <button
              type="submit"
              disabled={savingPwd}
              className="px-6 h-12 rounded-[14px] bg-[#0d2c5c] hover:bg-[#07203f] text-white text-[13px] font-bold transition-all shadow-sm disabled:opacity-50"
            >
              {savingPwd ? "Se actualizează..." : "Actualizează parola"}
            </button>
          </div>
        </form>
      </div>

      {/* Sesiuni Active */}
      <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-[0_10px_40px_rgba(13,44,92,0.06)] border border-[#e1e8f0]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <p className="font-['Plus_Jakarta_Sans',sans-serif] text-[10.5px] font-bold tracking-[0.2em] uppercase text-[#0d2c5c] mb-1">
              Dispozitive conectate
            </p>
            <h2 className="font-['Outfit',sans-serif] text-[24px] font-bold text-[#0d2c5c]">
              Sesiuni active
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
                Deconectează celelalte
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
          <span>Zonă de siguranță cont</span>
        </p>
        <h2 className="font-['Outfit',sans-serif] text-[28px] sm:text-[34px] font-bold tracking-tight text-red-700">
          Ștergere definitivă a contului
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
              Șterge contul definitiv
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
