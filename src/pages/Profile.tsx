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
}[] = [
  { key: "overview", label: "Overview & Sejur", icon: CalendarCheck },
  { key: "personal", label: "Date Personale", icon: UserIcon },
  { key: "hospitality", label: "Preferințe Suită", icon: Sparkles },
  { key: "reservations", label: "Istoric & Facturi", icon: FileText },
  { key: "security", label: "Securitate & Sesiuni", icon: Shield },
  { key: "danger", label: "Zonă Periculoasă", icon: TriangleAlert },
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
      <div className="min-h-screen bg-[#071a36] flex items-center justify-center text-[#c69a3f] text-[11px] font-bold tracking-[0.25em] uppercase pt-24">
        Se încarcă profilul…
      </div>
    );
  }

  const fullName =
    [user.first_name, user.last_name].filter(Boolean).join(" ") ||
    user.email.split("@")[0];

  return (
    <div className="min-h-screen w-full bg-[#071a36] bg-[radial-gradient(ellipse_at_top,_rgba(28,77,143,0.45)_0%,_#071a36_75%)] text-white pt-20 lg:pt-24 pb-24 font-sans antialiased relative overflow-hidden">
      {/* ── OBIECTE MARITIME & ELEMENTE FLOTANTE PE FUNDAL (CA PE MAINPAGE) ── */}
      <FloatingMaritimeBackground />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleAvatarUpload}
        className="hidden"
      />

      <div className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* HERO BANNER CU CLIPUL DE PE MAINPAGE & STRATURI CROMATICE BRAND */}
        <div className="relative h-[210px] sm:h-[260px] lg:h-[300px] w-full rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.45)] border border-[#c69a3f]/25">
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="h-full w-full object-cover saturate-60 contrast-110 brightness-95"
          >
            <source src="/hero-bg.mp4" type="video/mp4" />
          </video>
          {/* Straturi cromatice din mainpage */}
          <div className="absolute inset-0 bg-[#0d2c5c]/60 mix-blend-color" />
          <div className="absolute inset-0 bg-[#0b2146]/40 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0d2c5c]/80 via-[#0d2c5c]/25 to-[#071a36]" />

          {/* Ornamente ambientale aurii pe hero */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-16 -left-16 w-72 h-72 rounded-full bg-[#c69a3f]/25 blur-[75px]"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-16 -right-16 w-80 h-80 rounded-full bg-[#c69a3f]/20 blur-[80px]"
          />

          {/* Top Left Tag */}
          <div className="absolute top-4 sm:top-6 left-4 sm:left-6 flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0d2c5c]/70 backdrop-blur-md border border-[#c69a3f]/40 text-white text-[12px] font-semibold z-10 shadow-lg">
            <MapPin size={13} className="text-[#c69a3f]" />
            <span>Casa Esy • Mamaia Resort & Spa</span>
          </div>

          {/* Top Right Action Pills */}
          <div className="absolute top-4 sm:top-6 right-4 sm:right-6 flex items-center gap-2.5 z-10">
            <button
              onClick={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(window.location.href);
                  toast("Link-ul profilului a fost copiat!", "success");
                }
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#0d2c5c]/75 hover:bg-[#0d2c5c] backdrop-blur-md border border-[#c69a3f]/40 text-white text-[12.5px] font-semibold transition-all shadow-md active:scale-95"
            >
              <Share2 size={13} className="text-[#c69a3f]" />
              <span className="hidden sm:inline">Distribuie</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              title="Încarcă fotografie de profil"
              className="w-9 h-9 rounded-full bg-[#0d2c5c]/75 hover:bg-[#0d2c5c] backdrop-blur-md border border-[#c69a3f]/40 text-[#c69a3f] flex items-center justify-center transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              <Camera size={15} />
            </button>
          </div>
        </div>

        {/* TWO-COLUMN GRID: SIDEBAR & MAIN CONTENT (AERISIT, FĂRĂ SUPRAPUNERI) */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[330px_1fr] xl:grid-cols-[350px_1fr] gap-6 sm:gap-8 items-start -mt-14 sm:-mt-16">
          {/* LEFT SIDEBAR */}
          <div className="flex flex-col gap-6">
            {/* User Profile Card */}
            <div className="bg-[#0d2c5c]/85 backdrop-blur-xl rounded-[26px] p-6 sm:p-7 shadow-[0_20px_50px_rgba(5,16,35,0.6)] border border-[#c69a3f]/30">
              <div className="flex flex-col items-center text-center">
                {/* Avatar with luxury navy & gold border */}
                <div
                  className="relative group cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                  title="Apasă pentru a schimba fotografia de profil"
                >
                  <div className="w-[110px] h-[110px] sm:w-[124px] sm:h-[124px] rounded-full p-[3px] bg-gradient-to-tr from-[#c69a3f] via-[#e6c373] to-[#c69a3f] shadow-lg transition-transform duration-300 group-hover:scale-105">
                    <div className="w-full h-full rounded-full bg-[#071a36] overflow-hidden flex items-center justify-center font-['Cormorant_Garamond',serif] text-[40px] font-semibold text-white">
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
                  <span className="absolute bottom-0 right-1 w-7 h-7 rounded-full bg-[#071a36] text-[#c69a3f] border-2 border-[#c69a3f] flex items-center justify-center shadow-md">
                    <Camera size={13} />
                  </span>
                </div>

                <h1 className="mt-4 font-['Cormorant_Garamond',serif] text-[28px] font-semibold text-white leading-tight">
                  {fullName}
                </h1>
                <p className="text-[12.5px] font-bold text-[#c69a3f] tracking-wider uppercase mt-1">
                  Oaspete Privilège • Casa Esy
                </p>
                <p className="text-[11.5px] text-slate-300/80 mt-1 flex items-center justify-center gap-1">
                  <MapPin size={12} className="text-[#c69a3f]" />
                  <span>Constanța & București, România</span>
                </p>

                {/* Quick actions */}
                <div className="w-full mt-5 flex items-center gap-2.5">
                  <button
                    onClick={() => setTab("personal")}
                    title="Editează datele personale"
                    className="w-12 h-12 rounded-[14px] bg-[#071d3d] hover:bg-[#0a2754] border border-[#c69a3f]/30 text-[#c69a3f] flex items-center justify-center transition-colors shrink-0 shadow-sm"
                  >
                    <SlidersHorizontal size={17} />
                  </button>
                  <Link
                    to="/camere"
                    className="flex-1 h-12 rounded-[14px] bg-gradient-to-r from-[#c69a3f] to-[#b3862f] hover:from-[#d4a84d] hover:to-[#c69a3f] text-[#071a36] text-[13.5px] font-bold flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(198,154,63,0.3)] transition-all"
                  >
                    <Calendar size={15} />
                    <span>Rezervă Sejur Nou</span>
                  </Link>
                </div>
              </div>

              {/* BENEFICII INCLUSE */}
              <div className="mt-6 pt-5 border-t border-[#c69a3f]/20">
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#c69a3f] mb-3">
                  Beneficii Incluse:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Check-in Devreme 11:00",
                    "Șezlong VIP Zonă Plajă",
                    "Butler & Room Service",
                    "Acces Spa & Piscină",
                    "Parcare Gratuită",
                  ].map((benefit) => (
                    <span
                      key={benefit}
                      className="px-3 py-1.5 rounded-full bg-[#071d3d] border border-[#c69a3f]/20 text-[11.5px] font-medium text-slate-200"
                    >
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>

              {/* STATISTICI DIN REZERVARI REALE */}
              <div className="mt-6 pt-5 border-t border-[#c69a3f]/20 grid grid-cols-3 text-center">
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
                        <p className="text-[20px] font-bold text-white">
                          {valid.length}
                        </p>
                        <p className="text-[11px] text-slate-300 font-medium mt-0.5">
                          Sejururi
                        </p>
                      </div>
                      <div className="border-x border-[#c69a3f]/20">
                        <p className="text-[20px] font-bold text-[#c69a3f]">
                          {points.toLocaleString("ro-RO")}
                        </p>
                        <p className="text-[11px] text-slate-300 font-medium mt-0.5">
                          Puncte Club
                        </p>
                      </div>
                      <div>
                        <p className="text-[20px] font-bold text-white">
                          {valid.length >= 2 ? "Gold" : "Silver"}
                        </p>
                        <p className="text-[11px] text-slate-300 font-medium mt-0.5">
                          Statut VIP
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Butler & Concierge Card */}
            <div className="bg-[#0d2c5c]/85 backdrop-blur-xl rounded-[24px] p-5 shadow-[0_20px_50px_rgba(5,16,35,0.6)] border border-[#c69a3f]/30">
              <div className="flex items-center justify-between mb-3.5">
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#c69a3f]">
                  Concierge & Butler Dedicat
                </p>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10.5px] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Activ
                </span>
              </div>
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-full bg-[#071a36] text-[#c69a3f] flex items-center justify-center font-serif text-[17px] font-bold shrink-0 border border-[#c69a3f]/50">
                  CE
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold text-white truncate">
                    Recepția Casa Esy
                  </p>
                  <p className="text-[11.5px] text-slate-300/80 truncate">
                    Serviciu Oaspeți • Asistență 24/7
                  </p>
                </div>
                <Link
                  to="/contact"
                  title="Contactează recepția"
                  className="w-9 h-9 rounded-[12px] bg-[#071d3d] hover:bg-[#0a2754] border border-[#c69a3f]/30 text-[#c69a3f] flex items-center justify-center transition-colors shrink-0"
                >
                  <MessageSquare size={16} />
                </Link>
              </div>
            </div>
          </div>

          {/* RIGHT MAIN CONTENT */}
          <div className="min-w-0 flex flex-col gap-6">
            {/* HORIZONTAL TAB BAR */}
            <div className="bg-[#0a2349]/90 backdrop-blur-xl rounded-[20px] p-1.5 shadow-[0_15px_40px_rgba(5,16,35,0.5)] border border-[#c69a3f]/30 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-1 min-w-max">
                {TABS.map((t) => {
                  const Icon = t.icon;
                  const active = tab === t.key;
                  const isDanger = t.key === "danger";
                  return (
                    <button
                      key={t.key}
                      onClick={() => setTab(t.key)}
                      className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-[14px] text-[13px] font-semibold transition-all shrink-0 ${
                        active
                          ? isDanger
                            ? "bg-red-500/25 text-red-200 border border-red-500/40 shadow-sm font-bold"
                            : "bg-gradient-to-r from-[#c69a3f] to-[#b3862f] text-[#071a36] font-bold shadow-md"
                          : isDanger
                            ? "text-red-300 hover:bg-red-500/10"
                            : "text-white/70 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <Icon size={14} className={active ? (isDanger ? "text-red-200" : "text-[#071a36]") : "text-[#c69a3f]"} />
                      <span>{t.label}</span>
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
      {/* CARD 1: SEJUR URMĂTOR (DINAMIC SAU EMPTY STATE LUXURY) */}
      <div className="bg-[#0d2c5c]/85 backdrop-blur-xl rounded-[26px] p-6 sm:p-8 shadow-[0_20px_50px_rgba(5,16,35,0.6)] border border-[#c69a3f]/30">
        {next ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[11px] sm:text-[11.5px] font-bold tracking-[0.15em] uppercase text-[#c69a3f]">
                <span className="w-2 h-2 rounded-full bg-[#c69a3f]"></span>
                <span>URMĂTORUL SEJUR CONFIRMAT</span>
                {next.booking_code && (
                  <span className="text-slate-300 font-normal normal-case tracking-normal">
                    • Rezervare #{next.booking_code}
                  </span>
                )}
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/35 text-[11.5px] font-semibold flex items-center gap-1.5">
                <Check size={13} strokeWidth={2.5} />
                <span>{next.payment_status === "paid" ? "Achitat integral" : "Plată la sosire"}</span>
              </span>
            </div>

            <div className="mt-5 flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div>
                <h2 className="font-['Cormorant_Garamond',serif] text-[30px] sm:text-[34px] font-semibold text-white leading-tight">
                  {next.room?.title || "Cameră Casa Esy"}
                </h2>
                <p className="mt-1 flex items-center gap-2 text-[13px] text-slate-300">
                  <Building size={14} className="text-[#c69a3f] shrink-0" />
                  <span>
                    Mamaia • {Math.max(1, stayDays.length - 1)} nopți
                    {next.unit_number ? ` • Unitatea ${next.unit_number}` : ""}
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
                  className="px-4 h-11 rounded-[12px] border border-[#c69a3f]/40 hover:border-[#c69a3f] text-[#c69a3f] text-[12.5px] font-bold flex items-center gap-2 bg-[#071d3d] transition-colors shadow-sm"
                >
                  <Download size={14} />
                  <span>Descarcă Voucher</span>
                </button>
                <button
                  onClick={() => goToTab("reservations")}
                  className="px-4 h-11 rounded-[12px] bg-gradient-to-r from-[#c69a3f] to-[#b3862f] text-[#071a36] text-[12.5px] font-bold flex items-center gap-2 transition-all shadow-md"
                >
                  <SlidersHorizontal size={14} />
                  <span>Detalii Sejur</span>
                </button>
              </div>
            </div>

            {/* Zilele sejurului */}
            {stayDays.length > 0 && (
              <div className="mt-6 pt-5 border-t border-[#c69a3f]/20">
                <div className="flex items-center justify-between mb-3.5">
                  <p className="text-[10.5px] font-bold tracking-[0.16em] uppercase text-[#c69a3f]">
                    Zilele Sejurului Dumneavoastră:
                  </p>
                  <Link
                    to="/facilitati"
                    className="text-[12px] font-semibold text-[#c69a3f] hover:underline"
                  >
                    Program Activități & Spa
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                  {stayDays.map((d, i, arr) => {
                    const isFirst = i === 0;
                    const isLast = i === arr.length - 1 && arr.length > 1;
                    return (
                      <div
                        key={i}
                        className={`rounded-[16px] p-3 text-center border transition-all ${
                          isFirst
                            ? "bg-[#c69a3f]/20 border-[#c69a3f] text-white shadow-md"
                            : "bg-[#071d3d] border-[#c69a3f]/20 text-white"
                        }`}
                      >
                        <p className={`text-[10.5px] font-bold ${isFirst ? "text-[#c69a3f]" : "text-slate-300"}`}>
                          {fmtDay(d)}
                        </p>
                        <p className="text-[18px] font-bold mt-1 text-white">
                          {fmtDate(d)}
                        </p>
                        <p
                          className={`text-[10.5px] mt-1 font-medium ${
                            isLast
                              ? "text-red-400 font-semibold"
                              : isFirst
                                ? "text-[#c69a3f] font-semibold"
                                : "text-slate-300/80"
                          }`}
                        >
                          {isFirst ? "Check-in" : isLast ? "Check-out" : "Sejur"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 py-3">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-bold tracking-[0.18em] uppercase text-[#c69a3f]">
                <span className="w-2 h-2 rounded-full bg-[#c69a3f]"></span>
                <span>Niciun Sejur Viitor Programat</span>
              </div>
              <h2 className="font-['Cormorant_Garamond',serif] text-[30px] font-semibold text-white mt-2">
                Refugiul tău la Marea Neagră te așteaptă
              </h2>
              <p className="text-[13px] text-slate-300 mt-1 max-w-[560px]">
                Descoperă camerele și suitele noastre de lux, beneficiază de ospitalitate caldă și priveliști superbe spre răsărit.
              </p>
            </div>
            <Link
              to="/camere"
              className="px-6 h-12 rounded-[14px] bg-gradient-to-r from-[#c69a3f] to-[#b3862f] hover:from-[#d4a84d] hover:to-[#c69a3f] text-[#071a36] text-[13px] font-bold flex items-center justify-center gap-2 transition-all shadow-lg shrink-0"
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
        <div className="bg-[#0d2c5c]/85 backdrop-blur-xl rounded-[26px] p-6 sm:p-7 shadow-[0_20px_50px_rgba(5,16,35,0.6)] border border-[#c69a3f]/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#c69a3f]">
                Date Personale de Contact
              </p>
              <button
                onClick={() => goToTab("personal")}
                className="text-[12.5px] font-semibold text-[#c69a3f] hover:underline"
              >
                Editează
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Nume Complet
                </p>
                <p className="text-[15px] font-semibold text-white mt-0.5">
                  {fullName}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Email Oficial
                </p>
                <p className="text-[14px] text-white mt-0.5 flex items-center gap-1.5 truncate">
                  <span>{user.email}</span>
                  <BadgeCheck size={14} className="text-[#c69a3f] shrink-0" />
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Telefon
                </p>
                <p className="text-[14px] text-white mt-0.5">
                  {(user as any).phone || "Necompletat"}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#c69a3f]/20 flex items-center justify-between text-[12px]">
            <span className="text-slate-300">
              Limba: <b className="text-[#c69a3f]">Română</b>
            </span>
            <span className="text-[#c69a3f] font-semibold flex items-center gap-1">
              ✓ Cont Verificat
            </span>
          </div>
        </div>

        {/* Preferințe Salvate în Suită */}
        <div className="bg-[#0d2c5c]/85 backdrop-blur-xl rounded-[26px] p-6 sm:p-7 shadow-[0_20px_50px_rgba(5,16,35,0.6)] border border-[#c69a3f]/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#c69a3f]">
                Preferințe Salvate în Suită
              </p>
              <button
                onClick={() => goToTab("hospitality")}
                className="text-[12.5px] font-semibold text-[#c69a3f] hover:underline"
              >
                Configurează
              </button>
            </div>
            <p className="text-[12.5px] text-slate-300 mb-4">
              Setările favorite sunt aplicate automat la sosirea în orice cameră sau suită Casa Esy.
            </p>

            <div className="flex flex-col gap-2">
              {[
                { icon: BedDouble, label: "Puf de gâscă albă" },
                { icon: Building, label: "Etaj Superior Panoramic" },
                { icon: Utensils, label: "Meniu Fresh Seafood" },
                { icon: Thermometer, label: "Temperatură Cameră: 21.5°C" },
                { icon: Wine, label: "Vin spumant la sosire" },
              ].map((p, i) => {
                const Icon = p.icon;
                return (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-[12px] bg-[#071d3d] border border-[#c69a3f]/20 text-[12.5px] font-medium text-slate-200"
                  >
                    <Icon size={14} className="text-[#c69a3f]" />
                    <span>{p.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-[#c69a3f]/20 flex items-center justify-between">
            <span className="text-[12.5px] font-medium text-slate-200">
              Notificări SMS / WhatsApp
            </span>
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors ${
                notificationsEnabled ? "bg-[#c69a3f]" : "bg-slate-600"
              }`}
            >
              <span
                className={`block w-5 h-5 rounded-full bg-[#071a36] shadow transition-transform ${
                  notificationsEnabled ? "translate-x-5" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* LOYALTY CARD (ROYAL NAVY & GOLD THEME) */}
      <div className="rounded-[26px] bg-gradient-to-r from-[#0d2c5c] to-[#071d3d] p-6 sm:p-7 shadow-[0_20px_50px_rgba(5,16,35,0.6)] border border-[#c69a3f]/40 flex flex-col md:flex-row md:items-center justify-between gap-5 text-white">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[16px] bg-[#c69a3f]/20 border border-[#c69a3f]/40 text-[#c69a3f] flex items-center justify-center shrink-0">
            <Award size={24} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h3 className="font-['Cormorant_Garamond',serif] text-[24px] font-semibold text-white">
                Nivel Gold Privilège
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-[#c69a3f] text-[#071a36] text-[10.5px] font-black tracking-wider">
                CLUB EXCLUSIV
              </span>
            </div>
            <p className="text-[12.5px] text-slate-300 mt-1 max-w-[620px]">
              Fiecare noapte petrecută la Casa Esy vă aduce puncte bonus pentru upgrade garantat de cameră și experiențe VIP.
            </p>
          </div>
        </div>
        <Link
          to="/camere"
          className="px-6 h-12 rounded-[12px] bg-gradient-to-r from-[#c69a3f] to-[#b3862f] hover:from-[#d4a84d] hover:to-[#c69a3f] text-[#071a36] text-[12px] font-bold tracking-wider uppercase flex items-center justify-center shrink-0 transition-all shadow-md"
        >
          Rezervă & Câștigă
        </Link>
      </div>

      {/* BOTTOM ACTION BAR */}
      <div className="bg-[#0a2349]/90 backdrop-blur-xl rounded-[20px] px-6 py-4 shadow-[0_15px_40px_rgba(5,16,35,0.5)] border border-[#c69a3f]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-[12.5px] text-slate-300">
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
            className="text-[12.5px] font-semibold text-slate-300 hover:text-[#c69a3f] transition-colors"
          >
            Exportă date GDPR
          </button>
          <button
            onClick={() => toast("Setările profilului au fost salvate cu succes!", "success")}
            className="px-5 h-11 rounded-[12px] bg-gradient-to-r from-[#c69a3f] to-[#b3862f] text-[#071a36] text-[13px] font-bold transition-all shadow-md"
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
    <div className="bg-[#0d2c5c]/85 backdrop-blur-xl rounded-[26px] p-6 sm:p-8 shadow-[0_20px_50px_rgba(5,16,35,0.6)] border border-[#c69a3f]/30 space-y-6">
      <div>
        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#c69a3f] mb-1">
          Date Personale
        </p>
        <h2 className="font-['Cormorant_Garamond',serif] text-[28px] font-semibold text-white">
          Profilul Tău
        </h2>
        <p className="text-[13px] text-slate-300 mt-0.5">
          Actualizează datele de contact și fotografia afișată pe contul tău.
        </p>
      </div>

      {/* Profil Avatar uploader */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 p-4 rounded-[18px] bg-[#071d3d] border border-[#c69a3f]/25">
        <div className="relative w-20 h-20 rounded-full p-[2px] bg-gradient-to-tr from-[#c69a3f] to-[#e6c373] shrink-0">
          <div className="w-full h-full rounded-full bg-[#071a36] overflow-hidden flex items-center justify-center font-['Cormorant_Garamond',serif] text-[28px] font-semibold text-white">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={fullName} className="w-full h-full object-cover" />
            ) : (
              getInitials(fullName)
            )}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-white">
            Fotografie de Profil
          </p>
          <p className="text-[12px] text-slate-300 mt-0.5">
            Formate acceptate: JPG, PNG sau WebP (maxim 5 MB).
          </p>
          <div className="flex items-center gap-2 mt-3">
            <button
              type="button"
              onClick={onAvatarClick}
              disabled={uploadingAvatar}
              className="px-4 py-2 rounded-[10px] bg-gradient-to-r from-[#c69a3f] to-[#b3862f] text-[#071a36] text-[12px] font-bold transition-all disabled:opacity-50"
            >
              {uploadingAvatar ? "Se încarcă…" : user.avatar_url ? "Schimbă Fotografia" : "Încarcă Fotografie"}
            </button>
            {user.avatar_url && (
              <button
                type="button"
                onClick={onRemoveAvatar}
                disabled={uploadingAvatar}
                className="px-3 py-2 rounded-[10px] border border-red-400/40 bg-red-500/20 hover:bg-red-500/30 text-red-200 text-[12px] font-semibold transition-colors disabled:opacity-50"
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
            <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#c69a3f] block mb-1.5">
              Prenume
            </label>
            <input
              type="text"
              value={form.first_name}
              onChange={(e) => setForm({ ...form, first_name: e.target.value })}
              className="w-full px-4 py-3 rounded-[12px] border border-[#c69a3f]/30 focus:border-[#c69a3f] outline-none text-[13.5px] text-white bg-[#071d3d] transition-all"
              required
            />
          </div>
          <div>
            <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#c69a3f] block mb-1.5">
              Nume de Familie
            </label>
            <input
              type="text"
              value={form.last_name}
              onChange={(e) => setForm({ ...form, last_name: e.target.value })}
              className="w-full px-4 py-3 rounded-[12px] border border-[#c69a3f]/30 focus:border-[#c69a3f] outline-none text-[13.5px] text-white bg-[#071d3d] transition-all"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#c69a3f] block mb-1.5">
              Adresă Email (Conectată)
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full px-4 py-3 rounded-[12px] border border-[#c69a3f]/20 bg-[#071a36]/80 text-slate-400 text-[13.5px] cursor-not-allowed"
            />
          </div>
          <div>
            <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#c69a3f] block mb-1.5">
              Număr de Telefon
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-4 py-3 rounded-[12px] border border-[#c69a3f]/30 focus:border-[#c69a3f] outline-none text-[13.5px] text-white bg-[#071d3d] transition-all"
              placeholder="+40 7XX XXX XXX"
            />
          </div>
        </div>

        <div className="pt-3 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 h-12 rounded-[12px] bg-gradient-to-r from-[#c69a3f] to-[#b3862f] text-[#071a36] text-[13px] font-bold transition-all shadow-md disabled:opacity-50"
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
    <div className="bg-[#0d2c5c]/85 backdrop-blur-xl rounded-[26px] p-6 sm:p-8 shadow-[0_20px_50px_rgba(5,16,35,0.6)] border border-[#c69a3f]/30 space-y-6">
      <div>
        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#c69a3f] mb-1">
          Ospitalitate Personalizată
        </p>
        <h2 className="font-['Cormorant_Garamond',serif] text-[28px] font-semibold text-white">
          Preferințele Tale în Suită
        </h2>
        <p className="text-[13px] text-slate-300 mt-0.5">
          Selectează detaliile care asigură un sejur impecabil la fiecare vizită la Casa Esy.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((item) => {
          const isSelected = prefs.includes(item);
          return (
            <button
              key={item}
              onClick={() => toggle(item)}
              className={`p-4 rounded-[16px] border text-left flex items-center justify-between transition-all ${
                isSelected
                  ? "bg-[#c69a3f]/25 border-[#c69a3f] text-white font-semibold shadow-md"
                  : "bg-[#071d3d] border-[#c69a3f]/20 text-slate-200 hover:border-[#c69a3f]/50"
              }`}
            >
              <span className="text-[13px]">{item}</span>
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[#071a36] text-[10.5px] font-bold ${
                  isSelected ? "bg-[#c69a3f]" : "border border-slate-500"
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
          className="px-6 h-12 rounded-[12px] bg-gradient-to-r from-[#c69a3f] to-[#b3862f] text-[#071a36] text-[13px] font-bold transition-all shadow-md"
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
    <div className="bg-[#0d2c5c]/85 backdrop-blur-xl rounded-[26px] p-6 sm:p-8 shadow-[0_20px_50px_rgba(5,16,35,0.6)] border border-[#c69a3f]/30 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#c69a3f] mb-1">
            Sejururi & Documente
          </p>
          <h2 className="font-['Cormorant_Garamond',serif] text-[28px] font-semibold text-white">
            Rezervările Tale la Casa Esy
          </h2>
        </div>

        {/* Toggle Scope */}
        <div className="flex p-1 bg-[#071d3d] border border-[#c69a3f]/30 rounded-full self-start sm:self-auto">
          {[
            { k: "upcoming" as const, label: "Active & Viitoare" },
            { k: "past" as const, label: "Istoric Sejururi" },
          ].map((t) => (
            <button
              key={t.k}
              onClick={() => setScope(t.k)}
              className={`px-4 py-1.5 text-[12px] font-semibold rounded-full transition-all ${
                scope === t.k
                  ? "bg-gradient-to-r from-[#c69a3f] to-[#b3862f] text-[#071a36] font-bold shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 px-4 border border-dashed border-[#c69a3f]/30 rounded-[20px] bg-[#071d3d]/60">
          <CalendarCheck size={34} className="mx-auto text-[#c69a3f] mb-3 opacity-75" />
          <p className="font-['Cormorant_Garamond',serif] text-[22px] font-semibold text-white">
            Nicio rezervare în această categorie
          </p>
          <p className="text-[12.5px] text-slate-300 mt-1 max-w-[340px] mx-auto">
            Când vei efectua o rezervare la Casa Esy, detaliile sejurului vor apărea automat aici.
          </p>
          <Link
            to="/camere"
            className="mt-4 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-[12px] bg-gradient-to-r from-[#c69a3f] to-[#b3862f] text-[#071a36] text-[12px] font-bold"
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
                className="p-5 sm:p-6 rounded-[20px] border border-[#c69a3f]/25 bg-[#071d3d] hover:border-[#c69a3f]/60 hover:shadow-lg transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                <div className="space-y-2 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {r.booking_code && (
                      <span className="text-[11px] font-bold tracking-wider text-[#c69a3f] bg-[#c69a3f]/20 px-2.5 py-1 rounded-md">
                        #{r.booking_code}
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        r.status === "confirmed"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          : r.status === "pending"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                            : "bg-slate-700 text-slate-300"
                      }`}
                    >
                      {r.status === "confirmed"
                        ? "Confirmat"
                        : r.status === "pending"
                          ? "În așteptare"
                          : r.status}
                    </span>
                    {isPaid && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-1 rounded-full">
                        Achitat
                      </span>
                    )}
                    {r.unit_number && (
                      <span className="text-[11px] font-medium text-slate-300 bg-[#071a36] border border-[#c69a3f]/20 px-2.5 py-1 rounded-md">
                        Cameră {r.unit_number}
                      </span>
                    )}
                  </div>

                  <h3 className="text-[19px] font-bold text-white">
                    {r.room?.title || "Cameră Casa Esy"}
                  </h3>

                  <div className="flex items-center gap-2 text-[12.5px] text-slate-300 flex-wrap">
                    <CalendarCheck size={14} className="text-[#c69a3f]" />
                    <span>
                      {fmtDate(r.check_in)} → {fmtDate(r.check_out)}
                    </span>
                    <span>•</span>
                    <span>{calcNights(r.check_in, r.check_out)} nopți</span>
                  </div>

                  {/* SMART LOCK PIN & CHECK-IN */}
                  {r.access_pin ? (
                    <div className="mt-3 flex flex-wrap items-center gap-2 rounded-[14px] bg-[#071a36] p-3 text-white border border-[#c69a3f]/30">
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
                        className="inline-flex items-center gap-1.5 rounded-[12px] bg-gradient-to-r from-[#c69a3f] to-[#b3862f] px-3.5 py-2 text-[11.5px] font-bold text-[#071a36] transition-all shadow-sm"
                      >
                        <KeyRound size={13} />
                        Self Check-in Online & Cheie Digitală
                      </Link>
                    </div>
                  ) : null}
                </div>

                <div className="flex md:flex-col items-center md:items-end justify-between pt-3 md:pt-0 border-t md:border-t-0 border-[#c69a3f]/20 shrink-0">
                  {r.total_price != null && (
                    <div className="text-left md:text-right">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block md:hidden">
                        Total
                      </span>
                      <span className="text-[18px] sm:text-[20px] font-bold text-white">
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
                    className="mt-2 flex items-center gap-1.5 rounded-[10px] border border-[#c69a3f]/40 bg-[#071a36] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#c69a3f] hover:border-[#c69a3f] transition-all"
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
      <div className="bg-[#0d2c5c]/85 backdrop-blur-xl rounded-[26px] p-6 sm:p-8 shadow-[0_20px_50px_rgba(5,16,35,0.6)] border border-[#c69a3f]/30">
        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#c69a3f] mb-1">
          Securitate Cont
        </p>
        <h2 className="font-['Cormorant_Garamond',serif] text-[28px] font-semibold text-white">
          Schimbare Parolă
        </h2>
        <p className="text-[13px] text-slate-300 mt-0.5 mb-5">
          Folosește o parolă puternică cu majuscule, litere mici, cifre și simboluri.
        </p>

        <form onSubmit={handlePasswordSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#c69a3f] block mb-1.5">
              Parola Curentă
            </label>
            <input
              type="password"
              value={pwd.current}
              onChange={(e) => setPwd({ ...pwd, current: e.target.value })}
              className="w-full px-4 py-3 rounded-[12px] border border-[#c69a3f]/30 focus:border-[#c69a3f] outline-none text-[13.5px] text-white bg-[#071d3d]"
              required
            />
          </div>
          <div>
            <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#c69a3f] block mb-1.5">
              Parola Nouă
            </label>
            <input
              type="password"
              value={pwd.next}
              onChange={(e) => setPwd({ ...pwd, next: e.target.value })}
              className="w-full px-4 py-3 rounded-[12px] border border-[#c69a3f]/30 focus:border-[#c69a3f] outline-none text-[13.5px] text-white bg-[#071d3d]"
              required
            />
          </div>
          <div>
            <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#c69a3f] block mb-1.5">
              Confirmă Parola
            </label>
            <input
              type="password"
              value={pwd.confirm}
              onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
              className="w-full px-4 py-3 rounded-[12px] border border-[#c69a3f]/30 focus:border-[#c69a3f] outline-none text-[13.5px] text-white bg-[#071d3d]"
              required
            />
          </div>
          <div className="md:col-span-3 flex justify-end mt-2">
            <button
              type="submit"
              disabled={savingPwd}
              className="px-6 h-12 rounded-[12px] bg-gradient-to-r from-[#c69a3f] to-[#b3862f] text-[#071a36] text-[13px] font-bold transition-all shadow-md disabled:opacity-50"
            >
              {savingPwd ? "Se actualizează…" : "Actualizează Parola"}
            </button>
          </div>
        </form>
      </div>

      {/* Sesiuni Active */}
      <div className="bg-[#0d2c5c]/85 backdrop-blur-xl rounded-[26px] p-6 sm:p-8 shadow-[0_20px_50px_rgba(5,16,35,0.6)] border border-[#c69a3f]/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#c69a3f] mb-1">
              Dispozitive Conectate
            </p>
            <h2 className="font-['Cormorant_Garamond',serif] text-[26px] font-semibold text-white">
              Sesiuni Active
            </h2>
            <p className="text-[12.5px] text-slate-300 mt-0.5">
              Gestionează dispozitivele conectate la contul tău Casa Esy.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadSessions}
              className="px-3.5 py-2 rounded-[10px] border border-[#c69a3f]/30 text-[12px] font-semibold text-[#c69a3f] hover:bg-[#071d3d]"
            >
              Reîmprospătează
            </button>
            {sessions.some((s) => !s.is_current) && (
              <button
                onClick={handleRevokeAllOther}
                className="px-3.5 py-2 rounded-[10px] border border-red-500/40 bg-red-500/20 hover:bg-red-500/30 text-red-200 text-[12px] font-semibold transition-colors"
              >
                Revocă Celelalte
              </button>
            )}
          </div>
        </div>

        {loadingSessions ? (
          <p className="text-[13px] text-slate-300">Se încarcă dispozitivele…</p>
        ) : sessions.length === 0 ? (
          <p className="text-[13px] text-slate-300">Nicio sesiune activă raportată.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sessions.map((s) => (
              <div
                key={s.id}
                className={`p-4 rounded-[16px] border flex items-center justify-between ${
                  s.is_current
                    ? "bg-[#c69a3f]/20 border-[#c69a3f]"
                    : "bg-[#071d3d] border-[#c69a3f]/20"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#071a36] border border-[#c69a3f]/40 flex items-center justify-center text-[#c69a3f]">
                    <Monitor size={17} />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-white">
                      {s.browser_family || "Browser"} • {s.os_family || "Dispozitiv"}
                    </p>
                    <p className="text-[11.5px] text-slate-300">
                      IP: {s.ip_address || "—"} {s.is_current && "• (Acest dispozitiv)"}
                    </p>
                  </div>
                </div>
                {!s.is_current && (
                  <button
                    onClick={() => handleRevokeSession(s.id)}
                    className="text-[11.5px] text-red-400 hover:underline font-semibold"
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
    <div className="bg-[#0d2c5c]/85 backdrop-blur-xl rounded-[26px] p-6 sm:p-8 shadow-[0_20px_50px_rgba(5,16,35,0.6)] border border-red-500/40 space-y-6">
      <div>
        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-red-400 mb-1">
          Zonă Periculoasă
        </p>
        <h2 className="font-['Cormorant_Garamond',serif] text-[28px] font-semibold text-red-300">
          Ștergere Cont Permanentă
        </h2>
        <p className="text-[13px] text-slate-300 mt-0.5">
          Această acțiune este ireversibilă. Toate datele tale, rezervările și punctele de loialitate vor fi eliminate definitiv.
        </p>
      </div>

      <div className="p-5 rounded-[18px] border border-red-500/35 bg-red-900/20">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h4 className="text-[15px] font-bold text-red-200">
              Elimină definitiv contul tău Casa Esy
            </h4>
            <p className="text-[12.5px] text-slate-300 mt-1 max-w-[500px]">
              Vei fi delogat imediat de pe toate dispozitivele și nu vei mai putea recupera contul sau istoricul de sejururi.
            </p>
          </div>
          {!confirmOpen && (
            <button
              onClick={() => setConfirmOpen(true)}
              className="px-5 py-2.5 rounded-[12px] bg-red-600 hover:bg-red-700 text-white text-[12.5px] font-bold transition-colors shrink-0 shadow-md"
            >
              Șterge Contul
            </button>
          )}
        </div>

        {confirmOpen && (
          <div className="mt-5 pt-5 border-t border-red-500/30 space-y-4">
            <p className="text-[12.5px] font-semibold text-red-200">
              Pentru a confirma ștergerea definitivă, tastează cuvântul{" "}
              <b className="font-mono text-red-400 font-black">ȘTERGE</b> mai jos:
            </p>
            <input
              type="text"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder="ȘTERGE"
              className="w-full sm:w-[260px] px-4 py-2.5 rounded-[12px] border border-red-400/50 bg-[#071d3d] text-white font-mono text-[14px] outline-none"
            />
            {err && <p className="text-[12px] font-semibold text-red-400">{err}</p>}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  setConfirmOpen(false);
                  setWord("");
                  setErr("");
                }}
                className="px-4 py-2 rounded-[10px] border border-[#c69a3f]/30 bg-[#071d3d] text-[12.5px] font-semibold text-slate-200"
              >
                Renunță
              </button>
              <button
                disabled={!canDelete || busy}
                onClick={doDelete}
                className="px-5 py-2 rounded-[10px] bg-red-600 hover:bg-red-700 text-white text-[12.5px] font-bold transition-colors disabled:opacity-50 flex items-center gap-1.5"
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

/* ─────────────────── OBIECTE MARITIME & ELEMENTE FLOTANTE (MAINPAGE THEME) ─────────────────── */
function FloatingMaritimeBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      {/* 1. COMPASS ROSE ROTATIV MARITIM DREAPTA-SUS (IDENTIC CU CEL DIN MAINPAGE - FEATURES) */}
      <div
        className="absolute -top-12 -right-20 w-[620px] h-[620px] opacity-[0.06] text-[#c69a3f]"
        style={{ animation: "spin 180s linear infinite" }}
      >
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="2" strokeDasharray="4 6" />
          <circle cx="100" cy="100" r="65" stroke="currentColor" strokeWidth="1" />
          <circle cx="100" cy="100" r="50" stroke="currentColor" strokeWidth="2.5" />
          <path
            d="M100 10 L115 85 L190 100 L115 115 L100 190 L85 115 L10 100 L85 85 Z"
            fill="currentColor"
            fillOpacity="0.4"
          />
        </svg>
      </div>

      {/* 2. STEA MARITIMĂ DECORATIVĂ STÂNGA-JOS (IDENTICĂ CU CEA DIN ABOUT SECTION DE PE MAINPAGE) */}
      <div
        className="absolute -bottom-36 -left-36 w-[650px] h-[650px] opacity-[0.05] text-[#c69a3f]"
        style={{ animation: "spin 220s linear infinite reverse" }}
      >
        <svg viewBox="0 0 100 100" fill="currentColor">
          <path d="M50 0 C55 20 80 45 100 50 C80 55 55 80 50 100 C45 80 20 55 0 50 C20 45 45 20 50 0 Z" />
          <path
            d="M50 15 C52 25 75 48 85 50 C75 52 52 75 50 85 C48 75 25 52 15 50 C25 48 48 25 50 15 Z"
            opacity="0.5"
          />
        </svg>
      </div>

      {/* 3. SFÈRE AMBIENTALE LUMINOASE AURII & COBALT (GLOW ORBS) */}
      <div className="absolute top-[20%] left-[-8%] w-[500px] h-[500px] rounded-full bg-[#c69a3f]/15 blur-[140px] animate-float-slow" />
      <div className="absolute top-[48%] right-[-10%] w-[580px] h-[580px] rounded-full bg-[#1e4d8c]/35 blur-[150px] animate-float-reverse" />
      <div className="absolute bottom-[8%] left-[28%] w-[480px] h-[480px] rounded-full bg-[#c69a3f]/12 blur-[130px] animate-float-slow" />

      {/* 4. STELE AURII FLOTANTE & SPARKLES TRIDIMENSIONALE */}
      {[
        { top: "15%", left: "8%", delay: "0s", duration: "14s", size: 20 },
        { top: "28%", right: "10%", delay: "2.5s", duration: "18s", size: 24 },
        { top: "45%", left: "5%", delay: "4s", duration: "16s", size: 18 },
        { top: "60%", right: "7%", delay: "1.2s", duration: "15s", size: 22 },
        { top: "75%", left: "12%", delay: "3.5s", duration: "19s", size: 26 },
        { top: "88%", right: "12%", delay: "5s", duration: "14s", size: 18 },
      ].map((p, idx) => (
        <div
          key={idx}
          className="absolute animate-float-slow opacity-75"
          style={{
            top: p.top,
            left: (p as any).left,
            right: (p as any).right,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        >
          <svg
            width={p.size}
            height={p.size}
            viewBox="0 0 24 24"
            fill="none"
            className="text-[#c69a3f] animate-shimmer-particle drop-shadow-[0_0_12px_rgba(198,154,63,0.8)]"
          >
            <path
              d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"
              fill="currentColor"
            />
          </svg>
        </div>
      ))}

      {/* 5. PARTICULE LUMINOASE AURII CU SCLIPIRI PULSATORII */}
      {[
        { top: "18%", left: "25%", delay: "1s" },
        { top: "35%", right: "28%", delay: "3s" },
        { top: "52%", left: "18%", delay: "0.5s" },
        { top: "68%", right: "20%", delay: "4s" },
        { top: "82%", left: "32%", delay: "2s" },
      ].map((d, i) => (
        <div
          key={`dot-${i}`}
          className="absolute w-2.5 h-2.5 rounded-full bg-[#c69a3f]/70 animate-shimmer-particle shadow-[0_0_10px_#c69a3f]"
          style={{
            top: d.top,
            left: (d as any).left,
            right: (d as any).right,
            animationDelay: d.delay,
          }}
        />
      ))}
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
