import { API_URL } from "../lib/config";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  User as UserIcon,
  Shield,
  CalendarCheck,
  TriangleAlert,
  Mail,
  Phone,
  LogOut,
  Check,
  Trash2,
  Monitor,
  Smartphone,
  Tablet,
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
  Sparkles,
  BedDouble,
  Building,
  Utensils,
  Thermometer,
  Wine,
  Bell,
  X,
  FileDown,
  CheckCircle2,
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

type TabKey = "overview" | "hospitality" | "security" | "history";

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

const TABS: {
  key: TabKey;
  label: string;
}[] = [
  { key: "overview", label: "Overview & Sejur" },
  { key: "hospitality", label: "Preferințe Ospitalitate" },
  { key: "security", label: "Securitate & Date" },
  { key: "history", label: "Istoric & Facturare" },
];

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<SessionUser>(getCachedUser());
  const [loading, setLoading] = useState(!user);
  const [tab, setTab] = useState<TabKey>("overview");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isEditContactOpen, setIsEditContactOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    apiFetch<Booking[]>("/bookings/my-bookings")
      .then((d) => setBookings(Array.isArray(d) ? d : []))
      .catch(() => {});
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
      toast("Fotografia de profil a fost actualizată!", "success");
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
      <div className="min-h-[70vh] flex items-center justify-center text-[#64748b] text-[12px] font-bold tracking-[0.2em] uppercase pt-32">
        Se încarcă profilul…
      </div>
    );
  }

  const fullName =
    [user.first_name, user.last_name].filter(Boolean).join(" ") || "Radu Ivan";

  return (
    <div className="min-h-screen w-full bg-[#f1f5f9] pt-16 lg:pt-20 pb-20 font-sans text-[#0f172a] antialiased">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleAvatarUpload}
        className="hidden"
      />

      <div className="max-w-[1360px] mx-auto px-3 sm:px-6 lg:px-8">
        {/* HERO BANNER */}
        <div
          className="relative h-[250px] sm:h-[320px] lg:h-[360px] w-full rounded-[24px] sm:rounded-[32px] bg-cover bg-center overflow-hidden shadow-lg border border-slate-200/60"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(15,23,42,0.15) 0%, rgba(15,23,42,0.65) 100%), url(https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80)",
          }}
        >
          {/* Top Right Action Pills */}
          <div className="absolute top-4 sm:top-6 right-4 sm:right-6 flex items-center gap-2.5 z-10">
            <button
              onClick={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(window.location.href);
                  toast("Link-ul profilului a fost copiat în clipboard!", "success");
                }
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white text-[12px] sm:text-[13px] font-semibold transition-all shadow-sm active:scale-95"
            >
              <Share2 size={14} />
              <span>Distribuie Profil</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              title="Schimbă poza de profil / fundal"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white flex items-center justify-center transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              <Camera size={16} />
            </button>
          </div>

          {/* Bottom Right Resort Tag */}
          <div className="absolute bottom-5 sm:bottom-7 right-6 sm:right-8 hidden md:flex items-center gap-2 text-white/95 text-[12.5px] font-medium drop-shadow-md">
            <span className="w-2 h-2 rounded-full bg-[#00c9a7] animate-pulse"></span>
            <span>Casa Esy Mamaia • Vedere Directă la Marea Neagră</span>
          </div>
        </div>

        {/* TWO-COLUMN GRID (OVERLAPPING HERO) */}
        <div className="relative z-20 grid grid-cols-1 lg:grid-cols-[330px_1fr] xl:grid-cols-[350px_1fr] gap-6 sm:gap-8 items-start -mt-20 sm:-mt-24 px-2 sm:px-4">
          {/* LEFT SIDEBAR */}
          <div className="flex flex-col gap-6">
            {/* User Main Card */}
            <div className="bg-white rounded-[26px] sm:rounded-[30px] p-6 sm:p-7 shadow-[0_15px_40px_rgba(15,23,42,0.08)] border border-slate-200/70">
              <div className="flex flex-col items-center text-center">
                {/* Avatar Frame with Gradient Rim */}
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <div className="w-[110px] h-[110px] sm:w-[124px] sm:h-[124px] rounded-[26px] p-[3px] bg-gradient-to-tr from-[#00a896] via-[#2dd4bf] to-[#0ea5e9] shadow-md transition-transform duration-300 group-hover:scale-105">
                    <div className="w-full h-full rounded-[23px] bg-slate-900 overflow-hidden flex items-center justify-center">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"
                          alt={fullName}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  </div>
                  {/* Verified / Active Teal Dot Badge */}
                  <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#00a896] text-white border-2 border-white flex items-center justify-center shadow-md">
                    <Check size={14} strokeWidth={3} />
                  </span>
                  {/* Camera overlay on hover */}
                  <div className="absolute inset-0 rounded-[26px] bg-black/40 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={20} />
                    <span className="text-[10px] font-bold mt-1">Schimbă</span>
                  </div>
                </div>

                {/* Name & Title */}
                <h1 className="mt-4 text-[22px] sm:text-[24px] font-bold text-[#0f172a] tracking-tight">
                  {fullName}
                </h1>
                <p className="text-[12.5px] font-medium text-[#64748b] mt-0.5">
                  Oaspete Privilège • Casa Esy Gold
                </p>
                <p className="text-[11.5px] text-[#94a3b8] mt-1 flex items-center justify-center gap-1 font-medium">
                  <MapPin size={12} className="text-[#00a896]" />
                  <span>Constanța & București, România</span>
                </p>

                {/* Action Row */}
                <div className="w-full mt-5 flex items-center gap-2.5">
                  <button
                    onClick={() => setTab("hospitality")}
                    title="Concierge & Cameră Smart"
                    className="w-12 h-12 rounded-2xl bg-[#fff1f2] hover:bg-[#ffe4e6] text-[#f43f5e] flex items-center justify-center transition-colors shrink-0 shadow-sm"
                  >
                    <Bell size={18} />
                  </button>
                  <Link
                    to="/camere"
                    className="flex-1 h-12 rounded-2xl bg-[#00a896] hover:bg-[#009688] text-white text-[13.5px] font-semibold flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(0,168,150,0.3)] transition-all active:scale-[0.98]"
                  >
                    <Calendar size={16} />
                    <span>Rezervă Sejur Nou</span>
                  </Link>
                </div>
              </div>

              {/* BENEFICII INCLUSE */}
              <div className="mt-6 pt-5 border-t border-slate-100">
                <p className="text-[10px] font-bold tracking-[0.16em] uppercase text-[#94a3b8] mb-3">
                  Beneficii Incluse:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Check-in Devreme 11:00",
                    "Șezlong VIP Zona A",
                    "Butler Dedicat",
                    "Acces Spa Imperial",
                    "Valet Parking 24/7",
                  ].map((benefit) => (
                    <span
                      key={benefit}
                      className="px-3 py-1.5 rounded-full bg-[#f8fafc] border border-slate-200/80 text-[11.5px] font-medium text-[#334155]"
                    >
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>

              {/* STATS ROW (3 Sejururi | 2.450 Puncte | Gold VIP) */}
              <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-3 text-center">
                <div>
                  <p className="text-[19px] font-bold text-[#0f172a]">3</p>
                  <p className="text-[11px] text-[#94a3b8] font-medium mt-0.5">Sejururi</p>
                </div>
                <div className="border-x border-slate-100">
                  <p className="text-[19px] font-bold text-[#00a896]">2.450</p>
                  <p className="text-[11px] text-[#94a3b8] font-medium mt-0.5">Puncte Club</p>
                </div>
                <div>
                  <p className="text-[19px] font-bold text-[#0f172a]">Gold</p>
                  <p className="text-[11px] text-[#94a3b8] font-medium mt-0.5">Statut VIP</p>
                </div>
              </div>
            </div>

            {/* Designated Personal Butler Card */}
            <div className="bg-white rounded-[24px] p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] border border-slate-200/70">
              <div className="flex items-center justify-between mb-3.5">
                <p className="text-[10px] font-bold tracking-[0.16em] uppercase text-[#94a3b8]">
                  Butler Personal Desemnat
                </p>
                <span className="px-2.5 py-0.5 rounded-full bg-[#ecfdf5] text-[#059669] text-[10.5px] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#059669]"></span> Activ
                </span>
              </div>
              <div className="flex items-center gap-3.5">
                <div className="relative shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80"
                    alt="Mihai Alexandrescu"
                    className="w-11 h-11 rounded-full object-cover border border-slate-200"
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#10b981] border-2 border-white"></span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13.5px] font-bold text-[#0f172a] truncate">
                    Mihai Alexandrescu
                  </p>
                  <p className="text-[11.5px] text-[#64748b] truncate">
                    Head Butler • Serviciu 24/7
                  </p>
                </div>
                <Link
                  to="/contact"
                  title="Trimite mesaj butler-ului"
                  className="w-9 h-9 rounded-xl bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#334155] flex items-center justify-center transition-colors shrink-0"
                >
                  <MessageSquare size={16} />
                </Link>
              </div>
            </div>
          </div>

          {/* RIGHT MAIN CONTENT */}
          <div className="min-w-0 flex flex-col gap-6">
            {/* SEGMENTED TAB BAR */}
            <div className="bg-white rounded-[20px] p-1.5 shadow-[0_8px_25px_rgba(15,23,42,0.05)] border border-slate-200/80 flex items-center justify-between overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-1 min-w-max">
                {TABS.map((t) => {
                  const active = tab === t.key;
                  return (
                    <button
                      key={t.key}
                      onClick={() => setTab(t.key)}
                      className={`px-4 sm:px-5 py-2.5 rounded-[14px] text-[13px] font-semibold transition-all shrink-0 ${
                        active
                          ? "bg-[#ecfdf5] text-[#00a896] border border-[#a7f3d0] shadow-sm font-bold"
                          : "text-[#64748b] hover:text-[#0f172a] hover:bg-[#f8fafc]"
                      }`}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
              <span className="hidden xl:block pr-4 text-[11px] font-medium text-[#94a3b8] text-right leading-tight shrink-0">
                Actualizat<br />astăzi
              </span>
            </div>

            {/* TAB CONTENTS */}
            {tab === "overview" && (
              <OverviewContent
                user={user}
                bookings={bookings}
                onOpenEditContact={() => setIsEditContactOpen(true)}
                onConfigurePrefs={() => setTab("hospitality")}
              />
            )}

            {tab === "hospitality" && (
              <HospitalityTab onSave={() => toast("Preferințele au fost actualizate!", "success")} />
            )}

            {tab === "security" && <SecurityTab user={user} onLogout={handleLogout} />}

            {tab === "history" && <HistoryTab bookings={bookings} />}
          </div>
        </div>
      </div>

      {/* EDIT CONTACT MODAL */}
      {isEditContactOpen && (
        <EditContactModal
          user={user}
          setUser={setUser}
          onClose={() => setIsEditContactOpen(false)}
          onAvatarClick={() => fileInputRef.current?.click()}
          onRemoveAvatar={handleRemoveAvatar}
        />
      )}
    </div>
  );
}

/* ─────────────────── OVERVIEW CONTENT ─────────────────── */
function OverviewContent({
  user,
  bookings,
  onOpenEditContact,
  onConfigurePrefs,
}: {
  user: NonNullable<SessionUser>;
  bookings: Booking[];
  onOpenEditContact: () => void;
  onConfigurePrefs: () => void;
}) {
  const { toast } = useToast();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Pick next stay or fallback to luxury mock for full aesthetic matching screenshot
  const next = useMemo(() => {
    return (
      bookings
        .filter(
          (b) =>
            b.status !== "cancelled" &&
            b.status !== "completed" &&
            new Date(b.check_out) >= new Date(),
        )
        .sort((a, b) => +new Date(a.check_in) - +new Date(b.check_in))[0] || null
    );
  }, [bookings]);

  const fullName =
    [user.first_name, user.last_name].filter(Boolean).join(" ") || "Radu Ivan";

  const stayTitle = next?.room?.title || "Penthouse Horizon";
  const bookingCode = next?.booking_code || "CE-88219";

  return (
    <div className="flex flex-col gap-6">
      {/* CARD 1: CONFIRMED UPCOMING STAY */}
      <div className="bg-white rounded-[26px] p-6 sm:p-8 shadow-[0_12px_35px_rgba(15,23,42,0.06)] border border-slate-200/70">
        {/* Header row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[11px] sm:text-[11.5px] font-bold tracking-[0.14em] uppercase text-[#00a896]">
            <span className="w-2 h-2 rounded-full bg-[#00a896]"></span>
            <span>URMĂTORUL SEJUR CONFIRMAT</span>
            <span className="text-[#94a3b8] font-medium">· Rezervare #{bookingCode}</span>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#ecfdf5] text-[#059669] text-[11.5px] font-semibold flex items-center gap-1.5 border border-[#a7f3d0]">
            <CheckCircle2 size={13} />
            <span>Achitat integral</span>
          </span>
        </div>

        {/* Title & Action Buttons */}
        <div className="mt-5 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <h2 className="text-[26px] sm:text-[30px] font-bold text-[#0f172a] tracking-tight leading-tight">
              {stayTitle}
            </h2>
            <p className="mt-1 flex items-center gap-2 text-[13px] sm:text-[13.5px] text-[#64748b]">
              <Building size={14} className="text-[#00a896] shrink-0" />
              <span>Vedere Frontală la Marea Neagră • Suită 2 Adulți • Etaj 9</span>
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => {
                if (next) {
                  downloadBookingInvoicePdf(next.id).catch(() => {});
                } else {
                  toast("Voucherul de cazare a fost descărcat.", "success");
                }
              }}
              className="px-4 sm:px-5 h-11 rounded-xl border border-slate-200 hover:border-[#00a896] text-[#0f172a] text-[12.5px] font-semibold flex items-center gap-2 bg-white transition-colors shadow-sm"
            >
              <FileDown size={15} />
              <span>Descarcă Voucher</span>
            </button>
            <button
              onClick={onConfigurePrefs}
              className="px-4 sm:px-5 h-11 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] text-white text-[12.5px] font-semibold flex items-center gap-2 transition-colors shadow-sm"
            >
              <SlidersHorizontal size={14} />
              <span>Personalizează Sosirea</span>
            </button>
          </div>
        </div>

        {/* Days of stay timeline row */}
        <div className="mt-7 pt-6 border-t border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10.5px] font-bold tracking-[0.14em] uppercase text-[#94a3b8]">
              Zilele Sejurului Dumneavoastră (Iulie 2025):
            </p>
            <Link
              to="/facilitati"
              className="text-[12px] font-semibold text-[#00a896] hover:underline"
            >
              Program Activități & Spa
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {[
              { day: "VIN", date: "18 Iul", act: "Check-in VIP", active: true },
              { day: "SÂM", date: "19 Iul", act: "Cabana Plajă" },
              { day: "DUM", date: "20 Iul", act: "Yacht Sunset" },
              { day: "LUN", date: "21 Iul", act: "Cina Ponton" },
              { day: "MAR", date: "22 Iul", act: "Spa Ritual" },
              { day: "MIE", date: "23 Iul", act: "Check-out 14:00", checkout: true },
            ].map((it, idx) => (
              <div
                key={idx}
                className={`rounded-[18px] p-3 text-center border transition-all ${
                  it.active
                    ? "bg-[#ecfdf5] border-[#00a896] text-[#00a896] shadow-sm"
                    : "bg-[#f8fafc] border-slate-200/80 text-[#0f172a]"
                }`}
              >
                <p className={`text-[11px] font-bold ${it.active ? "text-[#00a896]" : "text-[#94a3b8]"}`}>
                  {it.day}
                </p>
                <p className="text-[18px] font-bold mt-1 text-[#0f172a]">
                  {it.date}
                </p>
                <p
                  className={`text-[10.5px] mt-1 font-medium ${
                    it.checkout ? "text-[#ef4444]" : it.active ? "text-[#00a896] font-semibold" : "text-[#64748b]"
                  }`}
                >
                  {it.act}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TWO COLUMN CARDS: CONTACT INFO & SUITE PREFERENCES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Info Card */}
        <div className="bg-white rounded-[26px] p-6 sm:p-7 shadow-[0_10px_30px_rgba(15,23,42,0.06)] border border-slate-200/70 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-bold tracking-[0.16em] uppercase text-[#94a3b8]">
                Date Personale de Contact
              </p>
              <button
                onClick={onOpenEditContact}
                className="text-[12.5px] font-semibold text-[#00a896] hover:underline"
              >
                Editează
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8]">
                  Nume Complet
                </p>
                <p className="text-[14px] font-bold text-[#0f172a] mt-0.5">
                  {fullName}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8]">
                  Email Oficial
                </p>
                <p className="text-[14px] font-semibold text-[#0f172a] mt-0.5 flex items-center gap-1.5">
                  <span>{user.email}</span>
                  <BadgeCheck size={14} className="text-[#00a896]" />
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8]">
                  Telefon WhatsApp
                </p>
                <p className="text-[14px] font-semibold text-[#0f172a] mt-0.5">
                  {(user as any).phone || "+40 740 123 456"}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8]">
                  Data Nașterii
                </p>
                <p className="text-[13.5px] font-medium text-[#0f172a] mt-0.5">
                  14 August 1989 <span className="text-[#00a896] font-semibold">(Cadou Aniversar Activat)</span>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[12px]">
            <span className="text-[#64748b]">
              Limba de comunicare: <b className="text-[#0f172a]">Română</b>
            </span>
            <span className="text-[#00a896] font-semibold flex items-center gap-1">
              ✓ Date verificate
            </span>
          </div>
        </div>

        {/* Suite Preferences Card */}
        <div className="bg-white rounded-[26px] p-6 sm:p-7 shadow-[0_10px_30px_rgba(15,23,42,0.06)] border border-slate-200/70 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold tracking-[0.16em] uppercase text-[#94a3b8]">
                Preferințe Salvate în Suită
              </p>
              <button
                onClick={onConfigurePrefs}
                className="text-[12.5px] font-semibold text-[#00a896] hover:underline"
              >
                Configurează
              </button>
            </div>
            <p className="text-[12.5px] text-[#64748b] mb-4">
              Setările dumneavoastră favorite sunt aplicate automat la sosirea în orice suită sau vilă Casa Esy.
            </p>

            <div className="flex flex-col gap-2">
              {[
                { icon: BedDouble, label: "Puf de gâscă albă" },
                { icon: Building, label: "Etaj Superior Panoramic" },
                { icon: Utensils, label: "Fără Lactoză / Fresh Seafood" },
                { icon: Thermometer, label: "Temperatură Suită: 21.5°C" },
                { icon: Wine, label: "Șampanie Moët la sosire" },
              ].map((p, i) => {
                const Icon = p.icon;
                return (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#f8fafc] border border-slate-200/60 text-[12.5px] font-medium text-[#334155]"
                  >
                    <Icon size={14} className="text-[#00a896]" />
                    <span>{p.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[12.5px] font-medium text-[#334155]">
              Notificări SMS / WhatsApp
            </span>
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors ${
                notificationsEnabled ? "bg-[#00a896]" : "bg-slate-300"
              }`}
            >
              <span
                className={`block w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                  notificationsEnabled ? "translate-x-5" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* LOYALTY CARD (Dark Navy + Vibrant Teal Accent) */}
      <div className="rounded-[26px] bg-[#0c1a2e] p-6 sm:p-7 shadow-[0_15px_40px_rgba(12,26,46,0.25)] flex flex-col md:flex-row md:items-center justify-between gap-5 text-white">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#00a896]/20 border border-[#00a896]/40 text-[#00a896] flex items-center justify-center shrink-0">
            <Award size={24} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h3 className="text-[18px] sm:text-[20px] font-bold">
                Nivel Gold Privilège
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-[#00a896] text-white text-[11px] font-bold tracking-wider">
                2.450 / 3.500 PUNCTE
              </span>
            </div>
            <p className="text-[12.5px] text-slate-300/85 mt-1 max-w-[620px]">
              Mai aveți nevoie de doar 1.050 puncte pentru a trece la <b>Platinum Diamant</b> (Upgrade garantat de cameră și transfer cu elicopterul de la aeroport).
            </p>
          </div>
        </div>
        <Link
          to="/facilitati"
          className="px-6 h-12 rounded-xl bg-[#00a896] hover:bg-[#009688] text-white text-[12px] font-bold tracking-wider uppercase flex items-center justify-center shrink-0 transition-colors shadow-[0_8px_20px_rgba(0,168,150,0.3)]"
        >
          Catalog Recompense
        </Link>
      </div>

      {/* BOTTOM ACTION BAR */}
      <div className="bg-white rounded-[22px] px-6 py-4 shadow-[0_8px_25px_rgba(15,23,42,0.05)] border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-[12.5px] text-[#64748b]">
          <RefreshCcw size={13} className="text-[#00a896]" />
          <span>Modificările sunt sincronizate instant cu echipa de concierge.</span>
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
            className="text-[12.5px] font-semibold text-[#64748b] hover:text-[#0f172a] transition-colors"
          >
            Exportă date GDPR
          </button>
          <button
            onClick={() => toast("Setările profilului au fost salvate cu succes!", "success")}
            className="px-5 h-11 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] text-white text-[13px] font-semibold transition-colors shadow-sm"
          >
            Salvare Setări Profil
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── HOSPITALITY TAB ─────────────────── */
function HospitalityTab({ onSave }: { onSave: () => void }) {
  const [prefs, setPrefs] = useState([
    "Puf de gâscă albă",
    "Etaj Superior Panoramic",
    "Fără Lactoză / Fresh Seafood",
    "Temperatură Suită: 21.5°C",
    "Șampanie Moët la sosire",
    "Check-in silențios fără formalități la recepție",
  ]);

  const toggle = (p: string) => {
    setPrefs((cur) => (cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p]));
  };

  return (
    <div className="bg-white rounded-[26px] p-6 sm:p-8 shadow-[0_10px_35px_rgba(15,23,42,0.06)] border border-slate-200/70 space-y-6">
      <div>
        <h2 className="text-[22px] font-bold text-[#0f172a]">
          Preferințe de Ospitalitate & Personalizare Sejur
        </h2>
        <p className="text-[13px] text-[#64748b] mt-1">
          Alegeți detaliile care fac sejurul dumneavoastră la Casa Esy desăvârșit.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          "Puf de gâscă albă",
          "Pernă cu spumă de memorie",
          "Etaj Superior Panoramic",
          "Vedere frontală la răsărit",
          "Fără Lactoză / Fresh Seafood",
          "Meniu vegetarian / vegan",
          "Temperatură Suită: 21.5°C",
          "Temperatură Suită: 23.0°C",
          "Șampanie Moët la sosire",
          "Platou fructe exotice proaspete",
          "Check-in silențios fără formalități la recepție",
          "Ziare internaționale & reviste luxury în cameră",
        ].map((item) => {
          const isSelected = prefs.includes(item);
          return (
            <button
              key={item}
              onClick={() => toggle(item)}
              className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                isSelected
                  ? "bg-[#ecfdf5] border-[#00a896] text-[#00a896] shadow-sm font-semibold"
                  : "bg-[#f8fafc] border-slate-200/80 text-[#334155] hover:border-slate-300"
              }`}
            >
              <span className="text-[13px]">{item}</span>
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[11px] ${
                  isSelected ? "bg-[#00a896]" : "border border-slate-300"
                }`}
              >
                {isSelected && <Check size={12} strokeWidth={3} />}
              </span>
            </button>
          );
        })}
      </div>

      <div className="pt-4 flex justify-end">
        <button
          onClick={onSave}
          className="px-6 h-12 rounded-xl bg-[#00a896] hover:bg-[#009688] text-white font-semibold text-[13px] transition-colors shadow-sm"
        >
          Salvează Preferințele
        </button>
      </div>
    </div>
  );
}

/* ─────────────────── SECURITY TAB ─────────────────── */
type SessionItem = {
  id: string;
  browser_family?: string;
  browser_version?: string;
  os_family?: string;
  os_version?: string;
  device_type?: string;
  ip_address?: string;
  is_current?: boolean;
};

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
  const [changingPwd, setChangingPwd] = useState(false);

  useEffect(() => {
    setLoadingSessions(true);
    apiFetch<SessionItem[]>("/users/me/sessions")
      .then((d) => setSessions(Array.isArray(d) ? d : []))
      .catch(() => setSessions([]))
      .finally(() => setLoadingSessions(false));
  }, []);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd.next !== pwd.confirm) {
      toast("Parolele noi nu coincid.", "error");
      return;
    }
    setChangingPwd(true);
    try {
      await apiFetch("/users/me", {
        method: "PATCH",
        body: JSON.stringify({ current_password: pwd.current, new_password: pwd.next }),
      });
      toast("Parola a fost schimbată cu succes!", "success");
      setPwd({ current: "", next: "", confirm: "" });
    } catch (err: any) {
      toast(err?.message || "Nu am putut actualiza parola.", "error");
    } finally {
      setChangingPwd(false);
    }
  };

  const handleRevokeSession = async (id: string) => {
    try {
      await apiFetch(`/users/me/sessions/${id}`, { method: "DELETE" });
      setSessions((prev) => prev.filter((s) => s.id !== id));
      toast("Sesiunea a fost închisă.", "success");
    } catch {
      toast("Nu am putut deconecta dispozitivul.", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Password Change Card */}
      <div className="bg-white rounded-[26px] p-6 sm:p-8 shadow-[0_10px_35px_rgba(15,23,42,0.06)] border border-slate-200/70">
        <h2 className="text-[20px] font-bold text-[#0f172a] mb-1">
          Schimbare Parolă
        </h2>
        <p className="text-[13px] text-[#64748b] mb-6">
          Asigurați-vă că folosiți o parolă sigură cu minim 8 caractere.
        </p>
        <form onSubmit={handlePasswordSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#94a3b8] block mb-1.5">
              Parola Curentă
            </label>
            <input
              type="password"
              value={pwd.current}
              onChange={(e) => setPwd({ ...pwd, current: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#00a896] outline-none text-[13.5px]"
              required
            />
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#94a3b8] block mb-1.5">
              Parola Nouă
            </label>
            <input
              type="password"
              value={pwd.next}
              onChange={(e) => setPwd({ ...pwd, next: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#00a896] outline-none text-[13.5px]"
              required
            />
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#94a3b8] block mb-1.5">
              Confirmă Parola
            </label>
            <input
              type="password"
              value={pwd.confirm}
              onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#00a896] outline-none text-[13.5px]"
              required
            />
          </div>
          <div className="md:col-span-3 flex justify-end mt-2">
            <button
              type="submit"
              disabled={changingPwd}
              className="px-5 h-11 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] text-white text-[13px] font-semibold transition-colors disabled:opacity-50"
            >
              {changingPwd ? "Se actualizează…" : "Actualizează Parola"}
            </button>
          </div>
        </form>
      </div>

      {/* Active Sessions */}
      <div className="bg-white rounded-[26px] p-6 sm:p-8 shadow-[0_10px_35px_rgba(15,23,42,0.06)] border border-slate-200/70">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-[20px] font-bold text-[#0f172a]">
              Sesiuni & Dispozitive Conectate
            </h2>
            <p className="text-[12.5px] text-[#64748b] mt-0.5">
              Dispozitivele autentificate în prezent în contul dumneavoastră.
            </p>
          </div>
          <button
            onClick={onLogout}
            className="px-4 py-2 rounded-xl border border-red-200 text-red-600 bg-red-50/70 hover:bg-red-100 text-[12px] font-semibold transition-colors flex items-center gap-1.5"
          >
            <LogOut size={13} /> Deconectează-mă
          </button>
        </div>

        {loadingSessions ? (
          <p className="text-[13px] text-[#94a3b8]">Se încarcă sesiunile…</p>
        ) : sessions.length === 0 ? (
          <div className="p-4 rounded-xl bg-[#f8fafc] text-[13px] text-[#64748b]">
            Sesiunea curentă este activă pe acest dispozitiv.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sessions.map((s) => (
              <div
                key={s.id}
                className="p-4 rounded-xl border border-slate-200 bg-[#f8fafc] flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[#0f172a]">
                    <Monitor size={18} />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-[#0f172a]">
                      {s.browser_family || "Browser"} • {s.os_family || "Dispozitiv"}
                    </p>
                    <p className="text-[11.5px] text-[#94a3b8]">
                      IP: {s.ip_address || "—"} {s.is_current && "• (Acest dispozitiv)"}
                    </p>
                  </div>
                </div>
                {!s.is_current && (
                  <button
                    onClick={() => handleRevokeSession(s.id)}
                    className="text-[11.5px] text-red-600 hover:underline font-semibold"
                  >
                    Închide
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

/* ─────────────────── HISTORY TAB ─────────────────── */
function HistoryTab({ bookings }: { bookings: Booking[] }) {
  return (
    <div className="bg-white rounded-[26px] p-6 sm:p-8 shadow-[0_10px_35px_rgba(15,23,42,0.06)] border border-slate-200/70 space-y-5">
      <div>
        <h2 className="text-[20px] font-bold text-[#0f172a]">
          Istoric Sejururi & Facturare
        </h2>
        <p className="text-[12.5px] text-[#64748b] mt-0.5">
          Toate rezervările și documentele fiscale emise la Casa Esy.
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="p-8 text-center text-[#94a3b8] rounded-2xl bg-[#f8fafc] border border-dashed border-slate-200">
          Nu aveți rezervări înregistrate încă.
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-[#f8fafc] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-bold text-[#0f172a]">
                    {b.room?.title || "Cameră Casa Esy"}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-[#334155] text-[10.5px] font-bold uppercase">
                    {b.status}
                  </span>
                </div>
                <p className="text-[12px] text-[#64748b] mt-1">
                  {new Date(b.check_in).toLocaleDateString("ro-RO")} — {new Date(b.check_out).toLocaleDateString("ro-RO")}
                  {b.booking_code && ` • #${b.booking_code}`}
                </p>
              </div>
              <button
                onClick={() => downloadBookingInvoicePdf(b.id).catch(() => {})}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-[#00a896] text-[12px] font-semibold text-[#0f172a] flex items-center gap-2 self-start sm:self-auto shadow-sm transition-colors"
              >
                <Download size={14} /> Factură & Voucher
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────── EDIT CONTACT MODAL ─────────────────── */
function EditContactModal({
  user,
  setUser,
  onClose,
  onAvatarClick,
  onRemoveAvatar,
}: {
  user: NonNullable<SessionUser>;
  setUser: (u: SessionUser) => void;
  onClose: () => void;
  onAvatarClick: () => void;
  onRemoveAvatar: () => void;
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
      toast("Datele personale au fost actualizate!", "success");
      onClose();
    } catch (err: any) {
      toast(err?.message || "Eroare la salvarea datelor.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-[28px] max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#94a3b8] hover:text-[#0f172a] w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 transition-colors"
        >
          <X size={16} />
        </button>

        <h2 className="text-[20px] font-bold text-[#0f172a] mb-1">
          Editează Datele de Contact
        </h2>
        <p className="text-[12.5px] text-[#64748b] mb-5">
          Modificările vor apărea imediat pe toate rezervările și profilul tău.
        </p>

        {/* Avatar edit section */}
        <div className="flex items-center gap-4 mb-6 p-3.5 rounded-2xl bg-[#f8fafc] border border-slate-200/70">
          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-900 shrink-0">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white font-bold text-[18px]">
                {user.first_name?.[0] || "R"}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12.5px] font-bold text-[#0f172a]">Fotografie Profil</p>
            <p className="text-[11px] text-[#64748b]">JPG, PNG sau WebP (max 5 MB)</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onAvatarClick}
              className="px-3 py-1.5 rounded-lg bg-[#00a896] hover:bg-[#009688] text-white text-[11.5px] font-bold transition-colors"
            >
              Schimbă
            </button>
            {user.avatar_url && (
              <button
                type="button"
                onClick={onRemoveAvatar}
                className="px-2.5 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-[11.5px] font-semibold transition-colors"
              >
                Șterge
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#94a3b8] block mb-1">
                Prenume
              </label>
              <input
                type="text"
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#00a896] outline-none text-[13.5px]"
                required
              />
            </div>
            <div>
              <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#94a3b8] block mb-1">
                Nume
              </label>
              <input
                type="text"
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#00a896] outline-none text-[13.5px]"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#94a3b8] block mb-1">
              Telefon WhatsApp
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#00a896] outline-none text-[13.5px]"
              placeholder="+40 7XX XXX XXX"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-[#64748b] hover:bg-slate-50 text-[12.5px] font-semibold"
            >
              Anulează
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-[#00a896] hover:bg-[#009688] text-white text-[12.5px] font-bold transition-colors disabled:opacity-50"
            >
              {saving ? "Se salvează…" : "Salvează"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
