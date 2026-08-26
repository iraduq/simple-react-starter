import { API_URL } from "../lib/config";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";
import {
  clearSession,
  fetchSession,
  getCachedUser,
  notifySessionChange,
  type SessionUser,
} from "../lib/auth";
import { apiFetch, ApiError } from "../lib/api";
import { useToast } from "../components/Toast";

type TabKey = "personal" | "security" | "reservations" | "danger";

const TABS: {
  key: TabKey;
  label: string;
  hint: string;
  icon: typeof UserIcon;
}[] = [
  { key: "personal", label: "Profil", hint: "Date personale", icon: UserIcon },
  {
    key: "security",
    label: "Securitate",
    hint: "Parolă & sesiuni",
    icon: Shield,
  },
  {
    key: "reservations",
    label: "Rezervări",
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
  const [tab, setTab] = useState<TabKey>("personal");

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
    <div className="min-h-screen bg-[#f8fafd] pt-20 lg:pt-24">
      {/* Hero band */}
      <ProfileHero user={user} />

      <div className="max-w-[1240px] mx-auto px-6 lg:px-10 -mt-20 relative z-10 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          <SideNav tab={tab} setTab={setTab} onLogout={handleLogout} />

          <section className="bg-white border border-[#e1e8f0] rounded-[22px] shadow-[0_10px_40px_rgba(13,44,92,0.06)] overflow-hidden">
            {tab === "personal" && (
              <PersonalTab user={user} setUser={setUser} />
            )}
            {tab === "security" && <SecurityTab user={user} />}
            {tab === "reservations" && <ReservationsTab />}
            {tab === "danger" && <DangerTab onDeleted={handleLogout} />}
          </section>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── HERO ─────────────────── */
function ProfileHero({ user }: { user: NonNullable<SessionUser> }) {
  const fullName =
    [user.first_name, user.last_name].filter(Boolean).join(" ") ||
    user.email.split("@")[0];
  const initials = getInitials(fullName);

  return (
    <div
      className="relative h-[260px] bg-cover bg-center"
      style={{
        backgroundImage:
          "linear-gradient(180deg, rgba(13,44,92,0.65) 0%, rgba(13,44,92,0.85) 100%), url(https://images.pexels.com/photos/1320684/pexels-photo-1320684.jpeg?auto=compress&cs=tinysrgb&w=1920&h=400&fit=crop)",
      }}
    >
      <div className="max-w-[1240px] mx-auto h-full px-6 lg:px-10 flex items-end pb-24">
        <div className="flex items-center gap-5 text-white">
          <div className="w-[92px] h-[92px] rounded-full bg-[#0d2c5c] border-[3px] border-[#c69a3f] shadow-[0_8px_24px_rgba(13,44,92,0.3)] flex items-center justify-center font-['Cormorant_Garamond',serif] text-[34px] font-semibold text-white">
            {initials}
          </div>
          <div>
            <p className="text-[10.5px] font-bold tracking-[0.3em] uppercase text-[#c69a3f] mb-1.5">
              Contul meu
            </p>
            <h1 className="font-['Cormorant_Garamond',serif] text-[36px] leading-none font-medium">
              {fullName}
            </h1>
            <p className="text-[13px] text-white/80 mt-1">{user.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── SIDE NAV ─────────────────── */
function SideNav({
  tab,
  setTab,
  onLogout,
}: {
  tab: TabKey;
  setTab: (t: TabKey) => void;
  onLogout: () => void;
}) {
  return (
    <aside className="bg-white border border-[#e1e8f0] rounded-[22px] p-3.5 h-fit shadow-[0_10px_40px_rgba(13,44,92,0.06)] sticky top-24">
      <nav className="flex flex-col gap-1.5">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          const danger = t.key === "danger";
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`group flex items-center gap-3 px-3.5 py-3 rounded-[14px] text-left transition-all duration-200 ${
                active
                  ? danger
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-[#0d2c5c] text-white shadow-[0_4px_14px_rgba(13,44,92,0.2)]"
                  : danger
                    ? "text-red-600 hover:bg-red-50/60"
                    : "text-[#3d4f6b] hover:bg-[#f8fafd] hover:text-[#0d2c5c]"
              }`}
            >
              <span
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  active
                    ? danger
                      ? "bg-red-100 text-red-700"
                      : "bg-[#c69a3f]/20 text-[#c69a3f]"
                    : danger
                      ? "bg-red-50 text-red-500"
                      : "bg-[#f8fafd] text-[#0d2c5c]"
                }`}
              >
                <Icon size={16} strokeWidth={1.75} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[13.5px] font-semibold leading-tight">
                  {t.label}
                </p>
                <p
                  className={`text-[11px] mt-0.5 ${
                    active
                      ? danger
                        ? "text-red-500"
                        : "text-[#c69a3f]"
                      : "text-[#6b7c99]"
                  }`}
                >
                  {t.hint}
                </p>
              </div>
              <ChevronRight
                size={14}
                className={`opacity-40 transition-transform duration-200 group-hover:translate-x-0.5 ${
                  active ? "opacity-80" : ""
                }`}
              />
            </button>
          );
        })}
      </nav>

      <div className="mt-4 pt-3.5 border-t border-[#e1e8f0]">
        <button
          onClick={onLogout}
          className="flex items-center gap-2.5 w-full px-3.5 py-3 rounded-[14px] text-[13px] font-semibold text-[#3d4f6b] hover:bg-red-50 hover:text-red-700 transition-colors"
        >
          <LogOut size={15} /> Deloghează-te
        </button>
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
    <header className="px-8 pt-8 pb-6 border-b border-[#e1e8f0]">
      <p className="text-[10.5px] font-bold tracking-[0.3em] uppercase text-[#c69a3f] mb-2">
        {eyebrow}
      </p>
      <h2 className="font-['Cormorant_Garamond',serif] text-[28px] font-medium text-[#0d2c5c] leading-tight">
        {title}
      </h2>
      <p className="text-[13.5px] text-[#6b7c99] mt-2 max-w-[560px]">
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
    setForm({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      phone: user.phone || "",
    });
  }, [user.first_name, user.last_name, user.phone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch(`${API_URL}/users/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus({ ok: true, msg: "Modificările au fost salvate." });
        setUser({ ...user, ...form });
        const fresh = await fetchSession(true);
        if (fresh) setUser(fresh);
        notifySessionChange();
      } else {
        setStatus({ ok: false, msg: "Nu am putut salva modificările." });
      }
    } catch {
      setStatus({ ok: false, msg: "Problemă de conexiune cu serverul." });
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

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        <div className="flex items-center gap-5">
          <div className="w-[86px] h-[86px] rounded-full bg-[#0d2c5c] text-white border-2 border-[#c69a3f] flex items-center justify-center font-['Cormorant_Garamond',serif] text-[30px] font-semibold shadow-md">
            {initials}
          </div>
          <div>
            <p className="text-[14px] font-semibold text-[#0d2c5c]">
              Monograma ta
            </p>
            <p className="text-[12.5px] text-[#6b7c99] mt-0.5">
              Se generează automat din numele tău.
            </p>
          </div>
        </div>

        <Divider />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
          <Field
            label="Adresă email"
            hint="Contactează-ne pentru a schimba emailul."
          >
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
            className={`flex items-center gap-2 text-[13px] font-medium px-4 py-3 rounded-xl border ${
              status.ok
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-red-50 text-red-800 border-red-200"
            }`}
          >
            {status.ok ? <Check size={16} /> : <TriangleAlert size={16} />}
            {status.msg}
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-[#c69a3f] to-[#b3862f] text-[#0d2c5c] text-[11px] font-bold uppercase tracking-[0.16em] rounded-full hover:from-[#0d2c5c] hover:to-[#12386f] hover:text-white transition-all shadow-[0_8px_20px_-8px_rgba(198,154,63,0.8)] disabled:opacity-60"
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
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="w-9 h-9 rounded-full bg-[#f8fafd] text-[#0d2c5c] border border-[#e1e8f0] flex items-center justify-center">
          <KeyRound size={16} />
        </span>
        <div>
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
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#0d2c5c] text-white text-[13px] font-semibold rounded-[12px] hover:bg-[#c69a3f] hover:text-[#0d2c5c] transition-colors disabled:opacity-50 shadow-sm"
        >
          <Mailbox size={15} />
          {sending ? "Se trimite…" : "Trimite cod de resetare pe email"}
        </button>
      ) : (
        <form onSubmit={submitReset} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <ul className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1.5 text-[12px]">
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
                    className={`flex items-center gap-1.5 ${ok ? "text-emerald-700 font-medium" : "text-[#6b7c99]"}`}
                  >
                    <Check size={13} className={ok ? "" : "opacity-30"} />
                    {label}
                  </li>
                );
              })}
            </ul>
          )}

          <div className="flex items-center gap-3 justify-between">
            <button
              type="button"
              onClick={requestCode}
              disabled={sending}
              className="text-[12px] font-semibold text-[#0d2c5c] hover:text-[#c69a3f] transition-colors"
            >
              Retrimite codul
            </button>
            <button
              type="submit"
              disabled={!strong || !code || sending}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#0d2c5c] text-white text-[13px] font-semibold rounded-[12px] hover:bg-[#c69a3f] hover:text-[#0d2c5c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
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

  const provider = (user.provider || "local").toLowerCase();
  const isGoogle = provider === "google";
  const otherSessions = sessions.filter((s) => !s.is_current);

  return (
    <>
      <SectionHead
        eyebrow="Securitate"
        title="Protecția contului tău"
        description="Metoda de autentificare, parola și dispozitivele de pe care ești conectat la Casa Esy."
      />

      <div className="p-8 space-y-10">
        {/* Auth provider banner */}
        <div className="relative overflow-hidden rounded-[20px] bg-[#0d2c5c] text-white p-7 border border-[#c69a3f]/30 shadow-lg">
          <div className="absolute -right-16 -top-20 w-64 h-64 rounded-full bg-[#c69a3f]/10 blur-2xl" />
          <div className="absolute right-8 -bottom-24 w-52 h-52 rounded-full bg-white/5" />
          <div className="relative flex flex-col md:flex-row md:items-center gap-6 md:justify-between">
            <div className="flex items-start gap-5">
              <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.25)] shrink-0">
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
              <div>
                <p className="text-[10.5px] font-bold tracking-[0.3em] uppercase text-[#c69a3f] mb-1.5">
                  Metodă de autentificare
                </p>
                <h3 className="font-['Cormorant_Garamond',serif] text-[26px] leading-tight font-medium text-white">
                  {isGoogle ? "Cont Google" : "Email și parolă"}
                </h3>
                <p className="text-[13px] text-white/80 mt-1.5 max-w-[420px]">
                  {isGoogle
                    ? "Autentificarea este gestionată de Google. Parola nu se administrează aici — o schimbi direct din contul tău Google."
                    : "Te autentifici cu adresa de email și o parolă administrată de Casa Esy."}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold tracking-[0.2em] uppercase text-emerald-300 bg-emerald-400/10 border border-emerald-300/30 px-3.5 py-2 rounded-full">
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
          <div className="flex items-start gap-4 p-6 rounded-[18px] border border-[#e1e8f0] bg-[#f8fafd]">
            <div className="w-10 h-10 rounded-full bg-white border border-[#e1e8f0] flex items-center justify-center shrink-0">
              <KeyRound size={16} className="text-[#6b7c99]" />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-[#0d2c5c]">
                Nu există parolă pentru acest cont
              </p>
              <p className="text-[13px] text-[#6b7c99] mt-1 max-w-[560px]">
                Contul tău folosește exclusiv autentificarea Google, așa că nu
                ai o parolă Casa Esy de schimbat.
              </p>
            </div>
          </div>
        ) : (
          <PasswordResetFlow email={user.email} />
        )}

        <Divider />

        {/* Sessions — real, GET/DELETE /users/me/sessions */}
        <div>
          <div className="flex flex-wrap items-end justify-between gap-4 mb-5">
            <div>
              <p className="text-[10.5px] font-bold tracking-[0.3em] uppercase text-[#c69a3f] mb-1.5">
                Dispozitive
              </p>
              <h3 className="font-['Cormorant_Garamond',serif] text-[24px] font-medium text-[#0d2c5c] leading-tight">
                Sesiuni active
              </h3>
              <p className="text-[12.5px] text-[#6b7c99] mt-1">
                {sessionsLoading
                  ? "Se verifică dispozitivele conectate…"
                  : `${sessions.length} ${sessions.length === 1 ? "dispozitiv conectat" : "dispozitive conectate"}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="h-[116px] rounded-[18px] border border-[#e1e8f0] bg-[#f8fafd] animate-pulse"
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    className={`relative p-5 rounded-[18px] border transition-all ${
                      s.is_current
                        ? "border-[#c69a3f]/60 bg-[#fdf8ec]/30 shadow-sm"
                        : "border-[#e1e8f0] bg-white hover:border-[#0d2c5c]/30 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0 ${
                          s.is_current
                            ? "bg-[#0d2c5c] text-white"
                            : "bg-[#f8fafd] text-[#0d2c5c] border border-[#e1e8f0]"
                        }`}
                      >
                        <DeviceIcon size={20} strokeWidth={1.6} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-[14px] font-semibold text-[#0d2c5c] truncate">
                            {browser || meta.label}
                          </p>
                          {s.is_current && (
                            <span className="text-[9.5px] font-bold tracking-[0.18em] uppercase text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                              Sesiunea curentă
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#6b7c99] mt-1">
                          {meta.label}
                          {os ? ` · ${os}` : ""}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-[12px] text-[#3d4f6b]">
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin size={12} className="text-[#c69a3f]" />
                            {[s.city, s.country_code]
                              .filter(Boolean)
                              .join(", ") || "Locație necunoscută"}
                          </span>
                          {s.created_at && (
                            <span className="inline-flex items-center gap-1.5">
                              <Clock size={12} className="text-[#c69a3f]" />
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
                          {s.ip_address && (
                            <span className="font-mono text-[11.5px] text-[#6b7c99]">
                              {s.ip_address}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-[#e1e8f0] flex justify-end">
                      <button
                        onClick={() => revokeSession(s)}
                        className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-red-600 border border-red-200 bg-white px-3.5 py-2 rounded-full hover:bg-red-50 transition-colors"
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
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<Booking[]>("/bookings/my-bookings");
      setBookings(Array.isArray(data) ? data : []);
    } catch {
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

  const cancel = async (id: string) => {
    setCancellingId(id);
    try {
      await apiFetch(`/bookings/${id}/cancel`, { method: "POST" });
      toast("Rezervarea a fost anulată.", "success");
      await load();
    } catch (e) {
      if (e instanceof ApiError) toast(e.message, "error");
      else toast("Nu am putut anula rezervarea.", "error");
    } finally {
      setCancellingId(null);
    }
  };

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

      <div className="p-8">
        <div className="inline-flex p-1 bg-[#f8fafd] border border-[#e1e8f0] rounded-full mb-6">
          {[
            { k: "upcoming" as const, label: "Viitoare / Active" },
            { k: "past" as const, label: "Trecute" },
          ].map((t) => (
            <button
              key={t.k}
              onClick={() => setScope(t.k)}
              className={`px-5 py-2 text-[12.5px] font-semibold rounded-full transition-all ${
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
                className="h-[110px] rounded-[16px] border border-[#e1e8f0] bg-[#f8fafd] animate-pulse"
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
            {items.map((r) => (
              <article
                key={r.id}
                className="group grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 p-5 rounded-[16px] border border-[#e1e8f0] bg-white hover:border-[#c69a3f]/50 hover:shadow-[0_6px_24px_rgba(13,44,92,0.06)] transition-all"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10.5px] font-bold tracking-[0.2em] uppercase text-[#c69a3f]">
                      #{r.id.slice(0, 8)}
                    </span>
                    <StatusPill status={r.status} />
                  </div>
                  <h4 className="font-['Cormorant_Garamond',serif] text-[22px] text-[#0d2c5c] leading-tight">
                    {r.room?.title || "Cameră"}
                  </h4>
                  <p className="text-[13px] text-[#6b7c99] mt-2">
                    {fmt(r.check_in)} → {fmt(r.check_out)} ·{" "}
                    {nights(r.check_in, r.check_out)} nopți
                  </p>
                </div>
                <div className="flex md:flex-col items-end md:items-end justify-between md:justify-center gap-3 md:border-l md:border-[#e1e8f0] md:pl-6">
                  {r.total_price != null && (
                    <p className="font-['Cormorant_Garamond',serif] text-[24px] text-[#0d2c5c]">
                      {r.total_price.toLocaleString("ro-RO")} RON
                    </p>
                  )}
                  <div className="flex gap-2">
                    {scope === "upcoming" && r.status !== "cancelled" && (
                      <button
                        onClick={() => cancel(r.id)}
                        disabled={cancellingId === r.id}
                        className="px-4 py-2 text-[12px] font-semibold text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        {cancellingId === r.id ? "Se anulează…" : "Anulează"}
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
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
      className={`text-[10.5px] font-bold tracking-[0.15em] uppercase px-2.5 py-1 rounded-full border ${map[status] || map.completed}`}
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
      <div className="p-8 space-y-5">
        <div className="p-5 rounded-[16px] border border-red-200 bg-red-50/40">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-[14px] font-semibold text-red-900">
                Șterge permanent contul
              </p>
              <p className="text-[12.5px] text-red-800/80 mt-1 max-w-[520px]">
                Toate rezervările și datele tale vor fi șterse definitiv.
                Această acțiune nu poate fi anulată.
              </p>
            </div>
            {!confirmOpen && (
              <button
                onClick={() => setConfirmOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-[12.5px] font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors whitespace-nowrap shadow-sm"
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
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setConfirmOpen(false);
                    setWord("");
                    setErr("");
                  }}
                  className="px-5 py-2.5 text-[12.5px] font-semibold text-[#0d2c5c] border border-[#e1e8f0] rounded-xl bg-white hover:bg-[#f8fafd] transition-colors"
                >
                  Renunță
                </button>
                <button
                  disabled={!canDelete || busy}
                  onClick={doDelete}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-[12.5px] font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
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
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-bold tracking-[0.15em] uppercase text-[#6b7c99]">
        {label}
      </span>
      {children}
      {hint && <span className="text-[11.5px] text-[#6b7c99]">{hint}</span>}
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
    <div className="text-center py-16">
      <div className="w-14 h-14 rounded-full bg-[#f8fafd] border border-[#e1e8f0] text-[#0d2c5c] flex items-center justify-center mx-auto mb-4">
        <Icon size={22} />
      </div>
      <p className="font-['Cormorant_Garamond',serif] text-[22px] text-[#0d2c5c]">
        {title}
      </p>
      <p className="text-[13px] text-[#6b7c99] mt-1.5">{text}</p>
    </div>
  );
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase() || "?";
}
