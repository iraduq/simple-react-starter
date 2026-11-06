import { API_URL } from "../lib/config";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  User as UserIcon,
  Shield,
  CalendarCheck,
  TriangleAlert,
  Mail,
  Phone,
  Save,
  LogOut,
  Check,
  Trash2,
  ChevronRight,
  Monitor,
  Smartphone,
  Tablet,
  MapPin,
  Clock,
  KeyRound,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Mailbox,
  Lock,
  Copy, FileText, Waves, Download, SlidersHorizontal, Award, MessageSquare, BadgeCheck, RefreshCcw, Share2,
} from "lucide-react";
import {
  clearSession,
  fetchSession,
  getCachedUser,
  notifySessionChange,
  onSessionChange,
  type SessionUser,
} from "../lib/auth";
import { apiFetch, ApiError } from "../lib/api";
import { useToast } from "../components/Toast";
import { downloadBookingInvoicePdf } from "../lib/admin";

type TabKey = "overview" | "personal" | "security" | "reservations" | "danger";

const TABS: {
  key: TabKey;
  label: string;
  hint: string;
  icon: typeof UserIcon;
}[] = [
  { key: "overview", label: "Overview & Sejur", hint: "Sejurul următor", icon: Waves },
  { key: "personal", label: "Date personale", hint: "Date personale", icon: UserIcon },
  {
    key: "security",
    label: "Securitate & Date",
    hint: "Parolă & sesiuni",
    icon: Shield,
  },
  {
    key: "reservations",
    label: "Istoric & Facturare",
    hint: "Istoric & viitoare",
    icon: CalendarCheck,
  },
  {
    key: "danger",
    label: "Zonă periculoasă",
    hint: "Ștergere cont",
    icon: TriangleAlert,
  },
];

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<SessionUser>(getCachedUser());
  const [loading, setLoading] = useState(!user);
  const [tab, setTab] = useState<TabKey>("overview")
  const [bookings, setBookings] = useState<Booking[]>([]);
  useEffect(() => {
    apiFetch<Booking[]>("/bookings/my-bookings").then((d) => setBookings(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);;

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

  const handleLogout = async () => {
    await clearSession();
    navigate("/");
  };

  if (loading || !user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-[#6b7c99] text-[11px] font-bold tracking-[0.2em] uppercase pt-32">
        Se încarcă profilul…
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full max-w-full bg-[#f8fafd] pt-20 lg:pt-24 overflow-x-hidden">
      <div className="max-w-[1280px] mx-auto px-3 sm:px-6 lg:px-8 pb-20 sm:pb-24 w-full">
        <ProfileHero />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 lg:gap-8 items-start -mt-20 sm:-mt-24 px-2 sm:px-4 lg:px-5">
          <div className="flex flex-col gap-6"><ProfileCard user={user} bookings={bookings} onLogout={handleLogout} /><ButlerCard /></div>

          <div className="min-w-0 flex flex-col gap-6">
            {/* Tab bar */}
            <div className="bg-white/95 backdrop-blur-md border border-[#e1e8f0] rounded-[18px] p-1.5 shadow-[0_10px_40px_rgba(13,44,92,0.10)] overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-1 min-w-max">
                {TABS.map((t) => {
                  const Icon = t.icon;
                  const active = tab === t.key;
                  const danger = t.key === "danger";
                  return (
                    <button
                      key={t.key}
                      onClick={() => setTab(t.key)}
                      className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-[12px] text-[13.5px] font-semibold transition-colors shrink-0 ${
                        active
                          ? danger
                            ? "bg-red-50 text-red-700"
                            : "bg-[#eaf1fb] text-[#0d2c5c]"
                          : danger
                            ? "text-red-600 hover:bg-red-50/60"
                            : "text-[#3d4f6b] hover:text-[#0d2c5c] hover:bg-[#f4f7fb]"
                      }`}
                    >
                      <Icon size={15} strokeWidth={1.8} />
                      {t.label}
                    </button>
                  );
                })}
                <span className="hidden xl:block pl-3 pr-2 text-[11px] leading-tight text-[#6b7c99]">Actualizat<br />astăzi</span>
              </div>
            </div>

            {tab === "overview" && <OverviewTab user={user} bookings={bookings} goTo={setTab} />}
            {tab !== "overview" && <section className="min-w-0 bg-white border border-[#e1e8f0] rounded-[22px] shadow-[0_10px_40px_rgba(13,44,92,0.06)] overflow-hidden">
              {tab === "personal" && (
                <PersonalTab user={user} setUser={setUser} />
              )}
              {tab === "security" && <SecurityTab user={user} />}
              {tab === "reservations" && <ReservationsTab />}
              {tab === "danger" && <DangerTab onDeleted={handleLogout} />}
            </section>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── HERO ─────────────────── */
function ProfileHero() {
  return (
    <div
      className="relative h-[220px] sm:h-[300px] lg:h-[340px] w-full rounded-[24px] sm:rounded-[32px] bg-cover bg-center overflow-hidden shadow-[0_20px_50px_rgba(13,44,92,0.18)]"
      style={{
        backgroundImage:
          "linear-gradient(180deg, rgba(13,44,92,0.05) 0%, rgba(13,44,92,0.35) 100%), url(https://images.pexels.com/photos/1320684/pexels-photo-1320684.jpeg?auto=compress&cs=tinysrgb&w=1920&h=700&fit=crop)",
      }}
    >
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-[12px] font-semibold">
        <MapPin size={13} /> Casa Esy · Mamaia
      </div>
    </div>
  );
}

/* ─────────────────── PROFILE CARD ─────────────────── */
function ProfileCard({
  user,
  bookings,
  onLogout,
}: {
  user: NonNullable<SessionUser>;
  bookings: Booking[];
  onLogout: () => void;
}) {
  const fullName =
    [user.first_name, user.last_name].filter(Boolean).join(" ") ||
    user.email.split("@")[0];
  return (
    <aside className="bg-white border border-[#e1e8f0] rounded-[24px] p-6 sm:p-7 shadow-[0_20px_50px_rgba(13,44,92,0.10)] lg:sticky lg:top-24">
      <div className="flex flex-col items-center text-center">
        <div className="relative">
          <div className="w-[112px] h-[112px] sm:w-[128px] sm:h-[128px] rounded-[26px] p-[3px] bg-gradient-to-br from-[#0d2c5c] via-[#2563a8] to-[#7fb3e8] shadow-[0_12px_30px_rgba(13,44,92,0.25)]">
            <div className="w-full h-full rounded-[23px] bg-[#0d2c5c] flex items-center justify-center font-['Cormorant_Garamond',serif] text-[40px] sm:text-[46px] font-semibold text-white">
              {getInitials(fullName)}
            </div>
          </div>
          <span className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-md">
            <span className="w-6 h-6 rounded-full bg-[#2563a8] text-white flex items-center justify-center">
              <Check size={13} strokeWidth={3} />
            </span>
          </span>
        </div>
        <h1 className="mt-5 font-['Cormorant_Garamond',serif] text-[28px] font-semibold text-[#0d2c5c] leading-tight break-words max-w-full">
          {fullName}
        </h1>
        <p className="text-[13.5px] text-[#3d4f6b] mt-1">Oaspete · Casa Esy</p>
        <p className="text-[12px] text-[#6b7c99] mt-1 flex items-center gap-1.5 max-w-full">
          <Mail size={12} className="shrink-0" />
          <span className="truncate">{user.email}</span>
        </p>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={onLogout}
          title="Deloghează-te"
          aria-label="Deloghează-te"
          className="w-12 h-12 shrink-0 rounded-[14px] bg-[#f4f7fb] border border-[#e1e8f0] text-[#3d4f6b] flex items-center justify-center hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors"
        >
          <LogOut size={17} />
        </button>
        <Link
          to="/camere"
          className="flex-1 h-12 rounded-[14px] bg-gradient-to-r from-[#0d2c5c] to-[#2563a8] text-white text-[14px] font-semibold flex items-center justify-center gap-2 shadow-[0_10px_24px_rgba(37,99,168,0.3)] hover:shadow-[0_12px_28px_rgba(37,99,168,0.4)] transition-shadow"
        >
          <CalendarCheck size={16} /> Rezervă sejur nou
        </Link>
      </div>

      <div className="mt-6 pt-5 border-t border-[#e1e8f0]">
        <p className="text-[10.5px] font-bold tracking-[0.2em] uppercase text-[#6b7c99] mb-3">
          Beneficii incluse:
        </p>
        <div className="flex flex-wrap gap-2">
          {["Check-in devreme 11:00", "Șezlong VIP plajă", "Room service", "Acces facilități", "Parcare privată"].map((l) => (
            <span key={l} className="px-3 py-1.5 rounded-full border border-[#e1e8f0] text-[12px] text-[#3d4f6b]">{l}</span>
          ))}
        </div>
      </div>
      <div className="mt-6 pt-5 border-t border-[#e1e8f0] grid grid-cols-3 text-center">
        {(() => {
          const done = bookings.filter((b) => b.status !== "cancelled");
          const nightsTotal = done.reduce((n, b) => n + Math.max(0, Math.round((+new Date(b.check_out) - +new Date(b.check_in)) / 864e5)), 0);
          const items = [
            { v: String(done.length), l: "Sejururi", accent: false },
            { v: String(nightsTotal), l: "Nopți", accent: true },
            { v: done.length >= 3 ? "Gold" : "Silver", l: "Statut", accent: false },
          ];
          return items.map((it, i) => (
            <div key={it.l} className={i === 1 ? "border-x border-[#e1e8f0]" : ""}>
              <p className={`text-[20px] font-bold ${it.accent ? "text-[#2563a8]" : "text-[#0d2c5c]"}`}>{it.v}</p>
              <p className="text-[11px] text-[#6b7c99] mt-0.5">{it.l}</p>
            </div>
          ));
        })()}
      </div>
    </aside>
  );
}

/* ─────────────────── SECTION HEADER ─────────────────── */
function SectionHead({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <header className="px-5 sm:px-8 pt-6 sm:pt-8 pb-5 sm:pb-6 border-b border-[#e1e8f0]">
      <p className="text-[10px] sm:text-[10.5px] font-bold tracking-[0.25em] sm:tracking-[0.3em] uppercase text-[#c69a3f] mb-1.5 sm:mb-2">
        {eyebrow}
      </p>
      <h2 className="font-['Cormorant_Garamond',serif] text-[24px] sm:text-[28px] font-medium text-[#0d2c5c] leading-tight">
        {title}
      </h2>
      <p className="text-[13px] sm:text-[13.5px] text-[#6b7c99] mt-1.5 sm:mt-2 max-w-[560px]">
        {description}
      </p>
    </header>
  );
}

/* ─────────────────── PERSONAL TAB ─────────────────── */
function PersonalTab({
  user,
  setUser,
}: {
  user: NonNullable<SessionUser>;
  setUser: (u: SessionUser) => void;
}) {
  const [form, setForm] = useState({
    first_name: user.first_name || "",
    last_name: user.last_name || "",
    phone: user.phone || "",
  });
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<null | { ok: boolean; msg: string }>(
    null,
  );

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await apiFetch<Record<string, any>>("/users/me").catch(
          () => null,
        );
        if (!active) return;
        if (data) {
          setForm({
            first_name: data.first_name || user.first_name || "",
            last_name: data.last_name || user.last_name || "",
            phone: data.phone || user.phone || "",
          });
        }
      } catch {
        // fallback
      }
    })();

    const unsub = onSessionChange(() => {
      const fresh = getCachedUser();
      if (fresh && active) {
        setUser(fresh);
        setForm({
          first_name: fresh.first_name || "",
          last_name: fresh.last_name || "",
          phone: fresh.phone || "",
        });
      }
    });

    return () => {
      active = false;
      unsub();
    };
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      await apiFetch(`${API_URL}/users/me`, {
        method: "PATCH",
        body: JSON.stringify(form),
      });
      setStatus({ ok: true, msg: "Modificările au fost salvate." });
      setUser({ ...user, ...form });
      const fresh = await fetchSession(true);
      if (fresh) setUser(fresh);
      notifySessionChange();
    } catch (err: any) {
      setStatus({
        ok: false,
        msg: err?.message || "Nu am putut salva modificările.",
      });
    } finally {
      setSaving(false);
    }
  };

  const initials = getInitials(
    [form.first_name, form.last_name].filter(Boolean).join(" ") || user.email,
  );

  return (
    <>
      <SectionHead
        eyebrow="Date personale"
        title="Profilul tău"
        description="Actualizează informațiile de contact și modul în care apari pe rezervările tale la Casa Esy."
      />

      <form
        onSubmit={handleSubmit}
        className="p-5 sm:p-8 space-y-6 sm:space-y-8"
      >
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="w-[72px] h-[72px] sm:w-[86px] sm:h-[86px] rounded-full bg-[#0d2c5c] text-white border-2 border-[#c69a3f] flex items-center justify-center font-['Cormorant_Garamond',serif] text-[26px] sm:text-[30px] font-semibold shadow-md shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] sm:text-[14px] font-semibold text-[#0d2c5c]">
              Monograma ta
            </p>
            <p className="text-[12px] sm:text-[12.5px] text-[#6b7c99] mt-0.5">
              Se generează automat din numele tău.
            </p>
          </div>
        </div>

        <Divider />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          <Field label="Prenume">
            <input
              type="text"
              value={form.first_name}
              onChange={(e) => setForm({ ...form, first_name: e.target.value })}
              className={fieldInput}
              placeholder="ex: Andrei"
            />
          </Field>
          <Field label="Nume">
            <input
              type="text"
              value={form.last_name}
              onChange={(e) => setForm({ ...form, last_name: e.target.value })}
              className={fieldInput}
              placeholder="ex: Popescu"
            />
          </Field>
          <Field label="Adresă email" hint="Adresa de email asociată contului.">
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7c99]"
              />
              <input
                type="email"
                value={user.email}
                disabled
                className={`${fieldInput} pl-11 bg-[#f8fafd] text-[#6b7c99] cursor-not-allowed`}
              />
            </div>
          </Field>
          <Field label="Număr de telefon">
            <div className="relative">
              <Phone
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7c99]"
              />
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className={`${fieldInput} pl-11`}
                placeholder="+40 7XX XXX XXX"
              />
            </div>
          </Field>
        </div>

        {status && (
          <div
            className={`flex items-center gap-2 text-[12.5px] sm:text-[13px] font-medium px-4 py-3 rounded-xl border ${
              status.ok
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-red-50 text-red-800 border-red-200"
            }`}
          >
            {status.ok ? <Check size={16} /> : <TriangleAlert size={16} />}
            <span>{status.msg}</span>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-gradient-to-r from-[#c69a3f] to-[#b3862f] text-[#0d2c5c] text-[11px] font-bold uppercase tracking-[0.16em] rounded-full hover:from-[#0d2c5c] hover:to-[#12386f] hover:text-white transition-all shadow-[0_8px_20px_-8px_rgba(198,154,63,0.8)] disabled:opacity-60"
          >
            <Save size={15} />
            {saving ? "Se salvează…" : "Salvează modificările"}
          </button>
        </div>
      </form>
    </>
  );
}

/* ─────────────────── SECURITY TAB ─────────────────── */
type Session = {
  id: string;
  browser_family?: string;
  browser_version?: string;
  os_family?: string;
  os_version?: string;
  device_type?: string;
  country_code?: string;
  city?: string;
  ip_address?: string;
  created_at?: string;
  is_current?: boolean;
};

function deviceKind(s: Session): "mobile" | "tablet" | "desktop" {
  const raw = `${s.device_type || ""} ${s.os_family || ""}`.toLowerCase();
  if (/tablet|ipad/.test(raw)) return "tablet";
  if (/mobile|phone|android|ios|iphone/.test(raw)) return "mobile";
  return "desktop";
}

const DEVICE_META = {
  mobile: { icon: Smartphone, label: "Telefon" },
  tablet: { icon: Tablet, label: "Tabletă" },
  desktop: { icon: Monitor, label: "Desktop / Laptop" },
} as const;

function PasswordResetFlow({ email }: { email: string }) {
  const [step, setStep] = useState<"idle" | "sent">("idle");
  const [code, setCode] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<null | { ok: boolean; msg: string }>(
    null,
  );

  const rules = useMemo(
    () => ({
      length: next.length >= 8 && next.length <= 64,
      lowercase: /[a-z]/.test(next),
      uppercase: /[A-Z]/.test(next),
      number: /[0-9]/.test(next),
      symbol: /[^A-Za-z0-9]/.test(next),
      match: next.length > 0 && next === confirm,
    }),
    [next, confirm],
  );
  const strong = Object.values(rules).every(Boolean);

  const requestCode = async () => {
    setSending(true);
    setStatus(null);
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStep("sent");
        setStatus({
          ok: true,
          msg: `Am trimis un cod de resetare la ${email}.`,
        });
      } else {
        setStatus({
          ok: false,
          msg: "Nu am putut trimite codul. Încearcă din nou.",
        });
      }
    } catch {
      setStatus({ ok: false, msg: "Problemă de conexiune cu serverul." });
    } finally {
      setSending(false);
    }
  };

  const submitReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!strong || !code) return;
    setSending(true);
    setStatus(null);
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, code, new_password: next }),
      });
      if (res.ok) {
        setStatus({ ok: true, msg: "Parola a fost resetată cu succes." });
        setStep("idle");
        setCode("");
        setNext("");
        setConfirm("");
      } else {
        setStatus({
          ok: false,
          msg: "Cod invalid/expirat sau parolă respinsă.",
        });
      }
    } catch {
      setStatus({ ok: false, msg: "Problemă de conexiune cu serverul." });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-5 overflow-hidden">
      <div className="flex items-center gap-3">
        <span className="w-9 h-9 rounded-full bg-[#f8fafd] text-[#0d2c5c] border border-[#e1e8f0] flex items-center justify-center shrink-0">
          <KeyRound size={16} />
        </span>
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold text-[#0d2c5c] leading-tight">
            Schimbă parola
          </h3>
          <p className="text-[12px] text-[#6b7c99] mt-0.5">
            Îți trimitem un cod de verificare pe email pentru a confirma
            schimbarea.
          </p>
        </div>
      </div>

      {step === "idle" ? (
        <button
          type="button"
          onClick={requestCode}
          disabled={sending}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0d2c5c] text-white text-[13px] font-semibold rounded-[12px] hover:bg-[#c69a3f] hover:text-[#0d2c5c] transition-colors disabled:opacity-50 shadow-sm"
        >
          <Mailbox size={15} />
          {sending ? "Se trimite…" : "Trimite cod de resetare pe email"}
        </button>
      ) : (
        <form onSubmit={submitReset} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Cod primit pe email">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className={fieldInput}
                placeholder="XXXXXX"
              />
            </Field>
            <Field label="Parolă nouă">
              <input
                type="password"
                value={next}
                onChange={(e) => setNext(e.target.value)}
                className={fieldInput}
                placeholder="••••••••"
              />
            </Field>
            <Field label="Confirmă parola nouă">
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={fieldInput}
                placeholder="••••••••"
              />
            </Field>
          </div>

          {(next.length > 0 || confirm.length > 0) && (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1.5 text-[12px]">
              {[
                ["length", "8–64 caractere"],
                ["lowercase", "O literă mică"],
                ["uppercase", "O literă mare"],
                ["number", "O cifră"],
                ["symbol", "Un simbol"],
                ["match", "Parolele coincid"],
              ].map(([k, label]) => {
                const ok = rules[k as keyof typeof rules];
                return (
                  <li
                    key={k}
                    className={`flex items-center gap-1.5 ${
                      ok ? "text-emerald-700 font-medium" : "text-[#6b7c99]"
                    }`}
                  >
                    <Check size={13} className={ok ? "" : "opacity-30"} />
                    {label}
                  </li>
                );
              })}
            </ul>
          )}

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 justify-between">
            <button
              type="button"
              onClick={requestCode}
              disabled={sending}
              className="text-[12px] font-semibold text-[#0d2c5c] hover:text-[#c69a3f] transition-colors text-left"
            >
              Retrimite codul
            </button>
            <button
              type="submit"
              disabled={!strong || !code || sending}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0d2c5c] text-white text-[13px] font-semibold rounded-[12px] hover:bg-[#c69a3f] hover:text-[#0d2c5c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <Shield size={15} />
              {sending ? "Se salvează…" : "Confirmă parola nouă"}
            </button>
          </div>
        </form>
      )}

      {status && (
        <div
          className={`text-[13px] font-medium px-4 py-3 rounded-xl border ${
            status.ok
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          {status.msg}
        </div>
      )}
    </div>
  );
}

function SecurityTab({ user }: { user: NonNullable<SessionUser> }) {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  const loadSessions = async () => {
    setSessionsLoading(true);
    try {
      const data = await apiFetch<Session[]>("/users/me/sessions");
      setSessions(Array.isArray(data) ? data : []);
    } catch {
      setSessions([]);
    } finally {
      setSessionsLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const finishForcedLogout = async () => {
    await clearSession();
    toast("Sesiunea a fost deconectată. Autentifică-te din nou.", "warning");
    window.location.assign("/login");
  };

  const revokeSession = async (session: Session) => {
    try {
      const result = await apiFetch<
        | {
            current_session_revoked?: boolean;
            revoked_current?: boolean;
            logged_out?: boolean;
          }
        | undefined
      >(`/users/me/sessions/${session.id}`, { method: "DELETE" });
      toast("Sesiunea a fost revocată.", "success");
      if (
        session.is_current ||
        result?.current_session_revoked ||
        result?.revoked_current ||
        result?.logged_out
      ) {
        await finishForcedLogout();
        return;
      }
      await loadSessions();
    } catch (e) {
      if (e instanceof ApiError) toast(e.message, "error");
      else toast("Nu am putut revoca sesiunea.", "error");
    }
  };

  const revokeAllOther = async () => {
    try {
      await apiFetch("/users/me/sessions", { method: "DELETE" });
      toast("Toate celelalte sesiuni au fost revocate.", "success");
      await loadSessions();
    } catch (e) {
      if (e instanceof ApiError) toast(e.message, "error");
      else toast("Nu am putut revoca sesiunile.", "error");
    }
  };

  const provider = (user.provider || "").toLowerCase();
  const isGoogle =
    provider.includes("google") || user.email?.endsWith("@gmail.com");
  const otherSessions = sessions.filter((s) => !s.is_current);

  return (
    <>
      <SectionHead
        eyebrow="Securitate"
        title="Protecția contului tău"
        description="Metoda de autentificare, parola și dispozitivele de pe care ești conectat la Casa Esy."
      />

      <div className="p-5 sm:p-8 space-y-8 sm:space-y-10">
        {/* Auth provider banner */}
        <div className="relative overflow-hidden rounded-[20px] bg-[#0d2c5c] text-white p-5 sm:p-7 border border-[#c69a3f]/30 shadow-lg">
          <div className="absolute -right-16 -top-20 w-64 h-64 rounded-full bg-[#c69a3f]/10 blur-2xl pointer-events-none" />
          <div className="absolute right-8 -bottom-24 w-52 h-52 rounded-full bg-white/5 pointer-events-none" />
          <div className="relative flex flex-col lg:flex-row lg:items-center gap-6 lg:justify-between">
            <div className="flex items-start gap-4 sm:gap-5 min-w-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.25)] shrink-0">
                {isGoogle ? (
                  <svg width="24" height="24" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                ) : (
                  <KeyRound size={22} className="text-[#0d2c5c]" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-[10.5px] font-bold tracking-[0.25em] sm:tracking-[0.3em] uppercase text-[#c69a3f] mb-1 sm:mb-1.5">
                  Metodă de autentificare
                </p>
                <h3 className="font-['Cormorant_Garamond',serif] text-[22px] sm:text-[26px] leading-tight font-medium text-white truncate">
                  {isGoogle ? "Cont Google" : "Email și parolă"}
                </h3>
                <p className="text-[12.5px] sm:text-[13px] text-white/80 mt-1 sm:mt-1.5 max-w-[420px]">
                  {isGoogle
                    ? "Autentificarea este gestionată prin Google. Securitatea și parola contului tău sunt administrate direct din setările Google."
                    : "Te autentifici cu adresa de email și o parolă administrată de Casa Esy."}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[10.5px] font-bold tracking-[0.18em] uppercase text-emerald-300 bg-emerald-400/10 border border-emerald-300/30 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full">
                <ShieldCheck size={13} /> Activ
              </span>
              {isGoogle && (
                <a
                  href="https://myaccount.google.com/security"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-[12px] font-semibold px-4 py-2.5 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 transition-colors"
                >
                  Securitate Google <ExternalLink size={13} />
                </a>
              )}
            </div>
          </div>
        </div>

        {isGoogle ? (
          <div className="flex items-start gap-4 p-5 sm:p-6 rounded-[18px] border border-[#e1e8f0] bg-[#f8fafd]">
            <div className="w-10 h-10 rounded-full bg-white border border-[#e1e8f0] flex items-center justify-center shrink-0">
              <Lock size={16} className="text-[#6b7c99]" />
            </div>
            <div className="min-w-0">
              <p className="text-[14px] font-semibold text-[#0d2c5c]">
                Autentificare securizată prin Google
              </p>
              <p className="text-[12.5px] sm:text-[13px] text-[#6b7c99] mt-1 max-w-[560px]">
                Deoarece folosești Google pentru a te loga, nu ai nevoie de o
                parolă separată Casa Esy.
              </p>
            </div>
          </div>
        ) : (
          <PasswordResetFlow email={user.email} />
        )}

        <Divider />

        {/* Sessions */}
        <div className="min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5">
            <div className="min-w-0">
              <p className="text-[10px] sm:text-[10.5px] font-bold tracking-[0.25em] sm:tracking-[0.3em] uppercase text-[#c69a3f] mb-1 sm:mb-1.5">
                Dispozitive
              </p>
              <h3 className="font-['Cormorant_Garamond',serif] text-[22px] sm:text-[24px] font-medium text-[#0d2c5c] leading-tight">
                Sesiuni active
              </h3>
              <p className="text-[12px] sm:text-[12.5px] text-[#6b7c99] mt-0.5 sm:mt-1">
                {sessionsLoading
                  ? "Se verifică dispozitivele conectate…"
                  : `${sessions.length} ${
                      sessions.length === 1
                        ? "dispozitiv conectat"
                        : "dispozitive conectate"
                    }`}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={loadSessions}
                className="inline-flex items-center gap-2 text-[12px] font-semibold text-[#0d2c5c] border border-[#e1e8f0] bg-white px-4 py-2 rounded-full hover:border-[#0d2c5c] hover:bg-[#f8fafd] transition-colors"
              >
                <RefreshCw size={13} /> Reîmprospătează
              </button>
              {otherSessions.length > 0 && (
                <button
                  onClick={revokeAllOther}
                  className="inline-flex items-center gap-2 text-[12px] font-semibold text-red-600 border border-red-200 bg-white px-4 py-2 rounded-full hover:bg-red-50 transition-colors"
                >
                  <LogOut size={13} /> Revocă toate celelalte
                </button>
              )}
            </div>
          </div>

          {sessionsLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="h-[120px] rounded-[18px] border border-[#e1e8f0] bg-[#f8fafd] animate-pulse"
                />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <EmptyState
              icon={Monitor}
              title="Nicio sesiune activă"
              text="Dispozitivele de pe care te conectezi vor apărea aici."
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {sessions.map((s) => {
                const kind = deviceKind(s);
                const meta = DEVICE_META[kind];
                const DeviceIcon = meta.icon;
                const browser = s.browser_family
                  ? `${s.browser_family} ${s.browser_version || ""}`.trim()
                  : null;
                const os = s.os_family
                  ? `${s.os_family} ${s.os_version || ""}`.trim()
                  : null;
                return (
                  <article
                    key={s.id}
                    className={`relative p-4 sm:p-5 rounded-[18px] border transition-all flex flex-col justify-between min-w-0 ${
                      s.is_current
                        ? "border-[#c69a3f]/60 bg-[#fdf8ec]/30 shadow-sm"
                        : "border-[#e1e8f0] bg-white hover:border-[#0d2c5c]/30 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-start gap-3.5 sm:gap-4 min-w-0">
                      <div
                        className={`w-11 h-11 sm:w-12 sm:h-12 rounded-[14px] flex items-center justify-center shrink-0 ${
                          s.is_current
                            ? "bg-[#0d2c5c] text-white"
                            : "bg-[#f8fafd] text-[#0d2c5c] border border-[#e1e8f0]"
                        }`}
                      >
                        <DeviceIcon size={20} strokeWidth={1.6} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-[13.5px] sm:text-[14px] font-semibold text-[#0d2c5c] truncate max-w-full">
                            {browser || meta.label}
                          </p>
                          {s.is_current && (
                            <span className="text-[9px] sm:text-[9.5px] font-bold tracking-[0.15em] sm:tracking-[0.18em] uppercase text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 sm:px-2.5 py-0.5 rounded-full shrink-0">
                              Curentă
                            </span>
                          )}
                        </div>
                        <p className="text-[10.5px] sm:text-[11px] font-bold tracking-[0.15em] sm:tracking-[0.18em] uppercase text-[#6b7c99] mt-0.5 sm:mt-1 truncate">
                          {meta.label}
                          {os ? ` · ${os}` : ""}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2.5 sm:mt-3 text-[11.5px] sm:text-[12px] text-[#3d4f6b]">
                          <span className="inline-flex items-center gap-1 truncate max-w-full">
                            <MapPin
                              size={12}
                              className="text-[#c69a3f] shrink-0"
                            />
                            <span className="truncate">
                              {[s.city, s.country_code]
                                .filter(Boolean)
                                .join(", ") || "Locație necunoscută"}
                            </span>
                          </span>
                          {s.created_at && (
                            <span className="inline-flex items-center gap-1 shrink-0">
                              <Clock
                                size={12}
                                className="text-[#c69a3f] shrink-0"
                              />
                              {new Date(s.created_at).toLocaleDateString(
                                "ro-RO",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-3.5 border-t border-[#e1e8f0] flex justify-end">
                      <button
                        onClick={() => revokeSession(s)}
                        className="inline-flex items-center gap-1.5 text-[11.5px] sm:text-[12px] font-semibold text-red-600 border border-red-200 bg-white px-3.5 py-2 rounded-full hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={12} /> Deconectează
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ─────────────────── RESERVATIONS TAB ─────────────────── */
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

const STATUS_LABEL: Record<string, string> = {
  pending: "În așteptare",
  confirmed: "Confirmat",
  completed: "Finalizat",
  cancelled: "Anulat",
};

function ReservationsTab() {
  const { toast } = useToast();
  const [scope, setScope] = useState<"upcoming" | "past">("upcoming");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedPin, setCopiedPin] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<Booking[]>("/bookings/my-bookings");
      setBookings(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast(err?.message || "Nu am putut încărca rezervările.", "error");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

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
      .sort(
        (a, b) =>
          new Date(a.check_in).getTime() - new Date(b.check_in).getTime(),
      );
  }, [bookings, scope, now]);

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("ro-RO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const nights = (a: string, b: string) =>
    Math.max(
      1,
      Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000),
    );

  return (
    <>
      <SectionHead
        eyebrow="Rezervări"
        title="Sejururile tale la Casa Esy"
        description="Vezi rezervările active, istoricul și detaliile fiecărui sejur."
      />

      <div className="p-5 sm:p-8">
        <div className="flex p-1 bg-[#f8fafd] border border-[#e1e8f0] rounded-full mb-6 w-full sm:w-fit">
          {[
            { k: "upcoming" as const, label: "Viitoare / Active" },
            { k: "past" as const, label: "Trecute" },
          ].map((t) => (
            <button
              key={t.k}
              onClick={() => setScope(t.k)}
              className={`flex-1 sm:flex-initial px-4 sm:px-5 py-2 text-[12px] sm:text-[12.5px] font-semibold rounded-full transition-all text-center ${
                scope === t.k
                  ? "bg-[#0d2c5c] text-white shadow-sm"
                  : "text-[#3d4f6b] hover:text-[#0d2c5c]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="h-[120px] rounded-[18px] border border-[#e1e8f0] bg-[#f8fafd] animate-pulse"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={CalendarCheck}
            title="Nicio rezervare aici"
            text="Când vei face o rezervare, aceasta va apărea aici."
          />
        ) : (
          <div className="space-y-4">
            {items.map((r) => {
              const isPaid = r.payment_status === "paid";
              return (
                <article
                  key={r.id}
                  className="group relative flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 p-5 sm:p-6 rounded-[20px] border border-[#e1e8f0] bg-white hover:border-[#c69a3f]/50 hover:shadow-[0_8px_30px_rgba(13,44,92,0.06)] transition-all"
                >
                  <div className="space-y-2 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {r.booking_code && (
                        <span className="text-[10.5px] sm:text-[11px] font-bold tracking-[0.12em] sm:tracking-[0.15em] text-[#c69a3f] bg-[#c69a3f]/10 px-2.5 py-1 rounded-md">
                          #{r.booking_code}
                        </span>
                      )}
                      <StatusPill status={r.status} />
                      {isPaid && (
                        <span className="text-[9.5px] sm:text-[10px] font-bold tracking-[0.12em] sm:tracking-[0.15em] uppercase text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 sm:px-3 py-1 rounded-full">
                          Achitat
                        </span>
                      )}
                      {r.unit_number && (
                        <span className="text-[10.5px] sm:text-[11px] font-medium text-[#6b7c99] bg-[#f8fafd] border border-[#e1e8f0] px-2.5 py-1 rounded-md">
                          Cameră {r.unit_number}
                        </span>
                      )}
                    </div>

                    <h4 className="text-[17px] sm:text-[18px] font-semibold text-[#0d2c5c] tracking-tight truncate">
                      {r.room?.title || "Cameră Casa Esy"}
                    </h4>

                    <div className="flex items-center gap-2 text-[12.5px] sm:text-[13px] text-[#6b7c99] font-normal flex-wrap">
                      <CalendarCheck
                        size={14}
                        className="text-[#c69a3f] shrink-0"
                      />
                      <span>
                        {fmt(r.check_in)} → {fmt(r.check_out)}
                      </span>
                      <span className="text-[#e1e8f0]">•</span>
                      <span>{nights(r.check_in, r.check_out)} nopți</span>
                    </div>

                    {/* DIGITAL PIN & SELF CHECK-IN */}
                    {r.access_pin ? (
                      <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-gradient-to-r from-[#0c1523] to-[#1a2d48] p-3 text-white">
                        <div className="flex items-center gap-1.5">
                          <KeyRound size={15} className="text-[#e6b85c]" />
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#e6b85c]">
                            PIN Smart Lock:
                          </span>
                          <span className="font-mono text-[15px] font-black tracking-widest text-white px-2 py-0.5 rounded bg-white/10">
                            {r.access_pin}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(r.access_pin!);
                            setCopiedPin(r.access_pin!);
                            toast(`Codul PIN ${r.access_pin} a fost copiat!`, "success");
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
                            className="ml-auto inline-flex items-center gap-1 text-[11px] font-bold text-[#e6b85c] hover:underline"
                          >
                            Pass Digital & Tastatură →
                          </Link>
                        )}
                      </div>
                    ) : r.booking_code && r.status === "confirmed" ? (
                      <div className="mt-3">
                        <Link
                          to={`/checkin/${r.booking_code}`}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-[#0d2c5c] px-4 py-2 text-[11.5px] font-bold uppercase tracking-wider text-white hover:bg-[#c69a3f] hover:text-[#0c1523] transition-all shadow-sm"
                        >
                          <KeyRound size={13} />
                          Self Check-in Online & Cheie Digitală
                        </Link>
                      </div>
                    ) : null}
                  </div>

                  <div className="flex md:flex-col items-center md:items-end justify-between pt-3 sm:pt-4 md:pt-0 border-t md:border-t-0 border-[#e1e8f0] shrink-0">
                    {r.total_price != null && (
                      <div className="text-left md:text-right">
                        <span className="text-[10px] sm:text-[10.5px] font-bold tracking-[0.12em] sm:tracking-[0.15em] uppercase text-[#6b7c99] block md:hidden">
                          Total
                        </span>
                        <span className="text-[18px] sm:text-[20px] font-bold text-[#0d2c5c] tracking-tight">
                          {r.total_price.toLocaleString("ro-RO")} RON
                          <button type="button" onClick={() => void downloadBookingInvoicePdf(String(r.booking_code || r.id), r.booking_code || String(r.id)).catch((e: any) => toast(e?.message || "Factura nu a putut fi descărcată.", "error"))} className="mt-2 flex items-center gap-1.5 rounded-lg border border-[#e1e8f0] bg-[#f8fafd] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#0d2c5c] hover:border-[#c69a3f] hover:bg-[#c69a3f]/10 transition-all cursor-pointer"><FileText size={13} className="text-[#c69a3f]" /> Descarcă Factură PDF</button>
                        </span>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    confirmed: "text-emerald-800 bg-emerald-50 border-emerald-200",
    pending: "text-amber-800 bg-amber-50 border-amber-200",
    cancelled: "text-red-800 bg-red-50 border-red-200",
    completed: "text-[#0d2c5c] bg-[#f8fafd] border-[#e1e8f0]",
  };
  return (
    <span
      className={`text-[9.5px] sm:text-[10px] font-bold tracking-[0.12em] sm:tracking-[0.15em] uppercase px-2.5 sm:px-3 py-1 rounded-full border ${
        map[status] || map.completed
      }`}
    >
      {STATUS_LABEL[status] || status}
    </span>
  );
}

/* ─────────────────── DANGER ZONE ─────────────────── */
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
    <>
      <SectionHead
        eyebrow="Zonă periculoasă"
        title="Ștergere cont"
        description="Ștergerea contului este permanentă și revocă automat toate sesiunile tale active."
      />
      <div className="p-5 sm:p-8 space-y-5">
        <div className="p-4 sm:p-5 rounded-[16px] border border-red-200 bg-red-50/40">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 sm:gap-6">
            <div className="min-w-0">
              <p className="text-[14px] font-semibold text-red-900">
                Șterge permanent contul
              </p>
              <p className="text-[12px] sm:text-[12.5px] text-red-800/80 mt-1 max-w-[520px]">
                Toate rezervările și datele tale vor fi șterse definitiv.
                Această acțiune nu poate fi anulată.
              </p>
            </div>
            {!confirmOpen && (
              <button
                onClick={() => setConfirmOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-[12.5px] font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors whitespace-nowrap shadow-sm shrink-0"
              >
                <Trash2 size={14} /> Șterge contul
              </button>
            )}
          </div>

          {confirmOpen && (
            <div className="mt-5 pt-5 border-t border-red-200 space-y-4">
              <Field label='Scrie cuvântul „ȘTERGE" pentru a confirma'>
                <input
                  type="text"
                  value={word}
                  onChange={(e) => setWord(e.target.value.toUpperCase())}
                  className={fieldInput}
                  placeholder="ȘTERGE"
                />
              </Field>
              {err && (
                <p className="text-[12.5px] text-red-700 font-medium">{err}</p>
              )}
              <div className="flex flex-col sm:flex-row gap-2 justify-end">
                <button
                  onClick={() => {
                    setConfirmOpen(false);
                    setWord("");
                    setErr("");
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 text-[12.5px] font-semibold text-[#0d2c5c] border border-[#e1e8f0] rounded-xl bg-white hover:bg-[#f8fafd] transition-colors"
                >
                  Renunță
                </button>
                <button
                  disabled={!canDelete || busy}
                  onClick={doDelete}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-[12.5px] font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  <Trash2 size={14} />
                  {busy ? "Se șterge…" : "Confirm ștergerea"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ─────────────────── PRIMITIVES ─────────────────── */
const fieldInput =
  "w-full py-3 px-4 border border-[#e1e8f0] rounded-[12px] font-sans text-[14px] text-[#0d2c5c] bg-white outline-none transition-all duration-200 focus:border-[#c69a3f] focus:ring-2 focus:ring-[#c69a3f]/10 placeholder:text-[#a3a3a3]";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5 min-w-0">
      <span className="text-[10.5px] sm:text-[11px] font-bold tracking-[0.12em] sm:tracking-[0.15em] uppercase text-[#6b7c99]">
        {label}
      </span>
      {children}
      {hint && (
        <span className="text-[11px] sm:text-[11.5px] text-[#6b7c99]">
          {hint}
        </span>
      )}
    </label>
  );
}

function Divider() {
  return <div className="h-px bg-[#e1e8f0]" />;
}

function EmptyState({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof UserIcon;
  title: string;
  text: string;
}) {
  return (
    <div className="text-center py-12 sm:py-16 px-4">
      <div className="w-14 h-14 rounded-full bg-[#f8fafd] border border-[#e1e8f0] text-[#0d2c5c] flex items-center justify-center mx-auto mb-4">
        <Icon size={22} />
      </div>
      <p className="font-['Cormorant_Garamond',serif] text-[20px] sm:text-[22px] text-[#0d2c5c]">
        {title}
      </p>
      <p className="text-[12.5px] sm:text-[13px] text-[#6b7c99] mt-1.5 max-w-[320px] mx-auto">
        {text}
      </p>
    </div>
  );
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase() || "?";
}

/* ─────────────────── BUTLER CARD ─────────────────── */
function ButlerCard() {
  return (
    <div className="bg-white border border-[#e1e8f0] rounded-[24px] p-6 shadow-[0_10px_40px_rgba(13,44,92,0.06)]">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10.5px] font-bold tracking-[0.2em] uppercase text-[#6b7c99]">Concierge dedicat</p>
        <span className="px-2.5 py-0.5 rounded-full bg-[#eaf1fb] text-[#2563a8] text-[11px] font-semibold">Activ</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative w-12 h-12 rounded-full bg-[#0d2c5c] text-white flex items-center justify-center font-semibold shrink-0">
          CE
          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-[#0d2c5c]">Recepția Casa Esy</p>
          <p className="text-[12px] text-[#6b7c99]">Concierge · Serviciu 24/7</p>
        </div>
        <Link to="/contact" aria-label="Contact" className="w-10 h-10 rounded-[12px] bg-[#f4f7fb] text-[#0d2c5c] flex items-center justify-center hover:bg-[#eaf1fb]">
          <MessageSquare size={16} />
        </Link>
      </div>
    </div>
  );
}

/* ─────────────────── OVERVIEW TAB ─────────────────── */
const PREFS = ["Pernă hipoalergenică", "Etaj superior", "Fără lactoză", "Temperatură cameră 21.5°C", "Vin spumant la sosire", "Pat matrimonial"];
const DAY_ACT = ["Check-in VIP", "Plajă", "Restaurant", "Relaxare", "Spa", "Cină"];

function OverviewTab({ user, bookings, goTo }: { user: NonNullable<SessionUser>; bookings: Booking[]; goTo: (t: TabKey) => void }) {
  const [prefs, setPrefs] = useState<string[]>(() => JSON.parse(localStorage.getItem("esy_prefs") || '["Etaj superior","Temperatură cameră 21.5°C"]'));
  const [sms, setSms] = useState(() => localStorage.getItem("esy_sms") !== "0");
  const toast = useToast();
  const togglePref = (p: string) => setPrefs((cur) => cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p]);
  const save = () => {
    localStorage.setItem("esy_prefs", JSON.stringify(prefs));
    localStorage.setItem("esy_sms", sms ? "1" : "0");
    (toast as any)?.success?.("Setările profilului au fost salvate") ?? (toast as any)?.show?.("Setările profilului au fost salvate");
  };
  const next = useMemo(() => bookings
    .filter((b) => b.status !== "cancelled" && b.status !== "completed" && new Date(b.check_out) >= new Date())
    .sort((a, b) => +new Date(a.check_in) - +new Date(b.check_in))[0], [bookings]);
  const days = useMemo(() => {
    if (!next) return [];
    const out: Date[] = [];
    const d = new Date(next.check_in); const end = new Date(next.check_out);
    while (d <= end && out.length < 7) { out.push(new Date(d)); d.setDate(d.getDate() + 1); }
    return out;
  }, [next]);
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.email.split("@")[0];
  const nightsTotal = bookings.filter((b) => b.status !== "cancelled").reduce((n, b) => n + Math.max(0, Math.round((+new Date(b.check_out) - +new Date(b.check_in)) / 864e5)), 0);
  const points = nightsTotal * 150; const goal = 3500;
  const card = "bg-white border border-[#e1e8f0] rounded-[24px] shadow-[0_10px_40px_rgba(13,44,92,0.06)]";
  const eyebrow = "text-[11px] font-bold tracking-[0.15em] uppercase text-[#6b7c99]";
  const wd = (d: Date) => d.toLocaleDateString("ro-RO", { weekday: "short" }).replace(".", "").toUpperCase();
  const dm = (d: Date) => d.toLocaleDateString("ro-RO", { day: "numeric", month: "short" }).replace(".", "");

  return (
    <div className="flex flex-col gap-6">
      {/* Next stay */}
      <div className={`${card} p-6 sm:p-8`}>
        {next ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-[11.5px] font-bold tracking-[0.12em] uppercase text-[#2563a8]">
                <span className="w-2 h-2 rounded-full bg-[#2563a8]" /> Următorul sejur {next.status === "confirmed" ? "confirmat" : "în așteptare"}
                {next.booking_code && <span className="font-normal normal-case tracking-normal text-[#6b7c99]">· Rezervare #{next.booking_code}</span>}
              </p>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#eaf1fb] text-[#0d2c5c] text-[12px] font-medium">
                <BadgeCheck size={13} /> {next.payment_status === "paid" ? "Achitat integral" : "Plată la sosire"}
              </span>
            </div>
            <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="min-w-0">
                <h2 className="text-[28px] sm:text-[32px] font-bold text-[#0d2c5c] leading-tight">{next.room?.title || "Cameră Casa Esy"}</h2>
                <p className="mt-1.5 flex items-center gap-2 text-[13.5px] text-[#3d4f6b]">
                  <Waves size={15} className="text-[#2563a8] shrink-0" />
                  Mamaia · {Math.max(1, days.length - 1)} nopți{next.unit_number ? ` · Unitatea ${next.unit_number}` : ""}
                </p>
              </div>
              <div className="flex gap-3 shrink-0">
                <button onClick={() => downloadBookingInvoicePdf(next.id).catch(() => {})} className="px-5 h-12 rounded-[12px] border border-[#e1e8f0] text-[13px] font-medium text-[#0d2c5c] flex items-center gap-2 hover:border-[#2563a8]">
                  <Download size={15} /> Descarcă voucher
                </button>
                <button onClick={() => goTo("reservations")} className="px-5 h-12 rounded-[12px] bg-[#0d2c5c] text-white text-[13px] font-semibold flex items-center gap-2 hover:bg-[#123a75]">
                  <SlidersHorizontal size={15} /> Detalii rezervare
                </button>
              </div>
            </div>
            <div className="mt-7 pt-6 border-t border-[#e1e8f0]">
              <div className="flex items-center justify-between mb-4">
                <p className={eyebrow}>Zilele sejurului dumneavoastră</p>
                <Link to="/facilitati" className="text-[12.5px] font-medium text-[#2563a8] hover:underline">Program activități</Link>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                {days.slice(0, 6).map((d, i, arr) => {
                  const first = i === 0; const last = i === arr.length - 1 && arr.length > 1;
                  return (
                    <div key={i} className={`rounded-[16px] border p-3 text-center ${first ? "border-[#9cc0ea] bg-[#f2f7fd]" : "border-[#e1e8f0] bg-[#fbfcfe]"}`}>
                      <p className="text-[11px] font-semibold text-[#6b7c99]">{wd(d)}</p>
                      <p className="text-[19px] font-bold text-[#0d2c5c] mt-1">{dm(d)}</p>
                      {last ? (
                        <span className="inline-block mt-1.5 px-2 py-0.5 rounded-[8px] bg-red-50 text-red-600 text-[10.5px]">Check-out</span>
                      ) : (
                        <p className={`text-[10.5px] mt-1.5 ${first ? "text-[#0d2c5c] font-medium" : "text-[#6b7c99]"}`}>{DAY_ACT[i] || "Relaxare"}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div>
              <p className="flex items-center gap-2 text-[11.5px] font-bold tracking-[0.12em] uppercase text-[#2563a8]"><span className="w-2 h-2 rounded-full bg-[#2563a8]" /> Niciun sejur programat</p>
              <h2 className="mt-3 text-[26px] font-bold text-[#0d2c5c]">Marea vă așteaptă</h2>
              <p className="text-[13.5px] text-[#3d4f6b] mt-1">Rezervați următoarea vacanță la Casa Esy, Mamaia.</p>
            </div>
            <Link to="/camere" className="px-6 h-12 rounded-[12px] bg-[#0d2c5c] text-white text-[13px] font-semibold flex items-center justify-center">Vezi camerele</Link>
          </div>
        )}
      </div>

      {/* Contact + prefs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`${card} p-6 flex flex-col`}>
          <div className="flex items-center justify-between mb-5">
            <p className={eyebrow}>Date personale de contact</p>
            <button onClick={() => goTo("personal")} className="text-[13px] font-medium text-[#2563a8] hover:underline">Editează</button>
          </div>
          {[
            ["Nume complet", fullName],
            ["Email", user.email],
            ["Telefon", (user as any).phone || "—"],
          ].map(([l, v]) => (
            <div key={l} className="mb-4">
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#6b7c99]">{l}</p>
              <p className="text-[14.5px] text-[#0d2c5c] mt-1 break-all flex items-center gap-1.5">{v}{l === "Email" && <BadgeCheck size={13} className="text-[#2563a8]" />}</p>
            </div>
          ))}
          <div className="mt-auto pt-4 border-t border-[#e1e8f0] flex justify-between text-[12.5px]">
            <span className="text-[#6b7c99]">Limba de comunicare: <b className="text-[#0d2c5c] font-semibold">Română</b></span>
            <span className="text-[#2563a8]">✓ Date verificate</span>
          </div>
        </div>
        <div className={`${card} p-6 flex flex-col`}>
          <div className="flex items-center justify-between mb-3">
            <p className={eyebrow}>Preferințe salvate în cameră</p>
            <span className="text-[13px] font-medium text-[#2563a8]">Configurează</span>
          </div>
          <p className="text-[13px] text-[#3d4f6b] mb-4">Setările favorite sunt aplicate automat la sosirea în orice cameră Casa Esy.</p>
          <div className="flex flex-col items-start gap-2">
            {PREFS.map((p) => {
              const on = prefs.includes(p);
              return (
                <button key={p} onClick={() => togglePref(p)} className={`px-3.5 py-1.5 rounded-[10px] border text-[12.5px] transition-colors flex items-center gap-1.5 ${on ? "border-[#9cc0ea] bg-[#f2f7fd] text-[#0d2c5c]" : "border-[#e1e8f0] text-[#6b7c99] hover:border-[#9cc0ea]"}`}>
                  {on && <Check size={12} />}{p}
                </button>
              );
            })}
          </div>
          <div className="mt-auto pt-4 border-t border-[#e1e8f0] flex items-center justify-between mt-5">
            <span className="text-[12.5px] text-[#3d4f6b]">Notificări SMS / WhatsApp</span>
            <button onClick={() => setSms((v) => !v)} aria-pressed={sms} className={`w-11 h-6 rounded-full p-0.5 transition-colors ${sms ? "bg-[#2563a8]" : "bg-[#d5dde8]"}`}>
              <span className={`block w-5 h-5 rounded-full bg-white shadow transition-transform ${sms ? "translate-x-5" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Loyalty */}
      <div className="rounded-[24px] bg-[#0d2c5c] p-6 sm:p-7 flex flex-col md:flex-row md:items-center gap-5 shadow-[0_20px_50px_rgba(13,44,92,0.25)]">
        <div className="w-12 h-12 rounded-[14px] bg-white/10 border border-white/15 text-[#9cc0ea] flex items-center justify-center shrink-0"><Award size={22} /></div>
        <div className="flex-1 min-w-0">
          <p className="flex flex-wrap items-center gap-2 text-white text-[19px] font-bold">
            Nivel {points >= goal ? "Gold" : "Silver"} Casa Esy
            <span className="px-2 py-0.5 rounded-md bg-[#2563a8] text-[10.5px] tracking-[0.1em] font-bold">{points.toLocaleString("ro-RO")} / {goal.toLocaleString("ro-RO")} PUNCTE</span>
          </p>
          <p className="text-[12.5px] text-white/75 mt-1">
            {points >= goal ? "Ați atins nivelul maxim — beneficiile Gold sunt active." : <>Mai aveți nevoie de {(goal - points).toLocaleString("ro-RO")} puncte pentru <b className="text-white">nivelul Gold</b> (150 puncte / noapte).</>}
          </p>
        </div>
        <Link to="/camere" className="px-6 h-11 rounded-[12px] bg-[#2563a8] text-white text-[12.5px] font-bold tracking-[0.1em] uppercase flex items-center justify-center hover:bg-[#2f72bd]">Rezervă & câștigă</Link>
      </div>

      {/* Save bar */}
      <div className={`${card} px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
        <p className="flex items-center gap-2 text-[12.5px] text-[#3d4f6b]"><RefreshCcw size={13} className="text-[#2563a8]" /> Modificările sunt sincronizate cu recepția.</p>
        <div className="flex items-center gap-5">
          <button onClick={() => goTo("danger")} className="text-[12.5px] text-[#6b7c99] hover:text-[#0d2c5c]">Date GDPR</button>
          <button onClick={save} className="px-5 h-11 rounded-[12px] bg-[#0d2c5c] text-white text-[13px] font-semibold hover:bg-[#123a75]">Salvare setări profil</button>
        </div>
      </div>
    </div>
  );
}
