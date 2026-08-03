import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User as UserIcon,
  Shield,
  CalendarCheck,
  Download,
  Settings as SettingsIcon,
  TriangleAlert,
  Mail,
  Phone,
  Save,
  LogOut,
  Eye,
  EyeOff,
  Check,
  Trash2,
  ChevronRight,
  Bell,
  Moon,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  MapPin,
  Clock,
  KeyRound,
  ShieldCheck,
  Lock,
  RefreshCw,
  ExternalLink,
  FileText,
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

const API_URL = "http://localhost:8000";

type TabKey =
  | "personal"
  | "security"
  | "reservations"
  | "downloads"
  | "settings"
  | "danger";

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
    key: "downloads",
    label: "Descărcări",
    hint: "Facturi & resurse",
    icon: Download,
  },
  {
    key: "settings",
    label: "Preferințe",
    hint: "Notificări & temă",
    icon: SettingsIcon,
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
      const s = await fetchSession(true);
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
      <div className="min-h-[70vh] flex items-center justify-center text-[#8595aa] text-sm tracking-wide uppercase">
        Se încarcă profilul…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9fc]">
      {/* Hero band */}
      <ProfileHero user={user} />

      <div className="max-w-[1240px] mx-auto px-6 lg:px-10 -mt-20 relative z-10 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          <SideNav tab={tab} setTab={setTab} onLogout={handleLogout} />

          <section className="bg-white border border-[#e6ecf3] rounded-[18px] shadow-[0_10px_40px_rgba(13,44,92,0.06)] overflow-hidden">
            {tab === "personal" && (
              <PersonalTab user={user} setUser={setUser} />
            )}
            {tab === "security" && <SecurityTab user={user} />}
            {tab === "reservations" && <ReservationsTab />}
            {tab === "downloads" && <DownloadsTab />}
            {tab === "settings" && <SettingsTab />}
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
          "linear-gradient(180deg, rgba(9,24,52,0.75) 0%, rgba(13,44,92,0.9) 100%), url(https://images.pexels.com/photos/1320684/pexels-photo-1320684.jpeg?auto=compress&cs=tinysrgb&w=1920&h=400&fit=crop)",
      }}
    >
      <div className="max-w-[1240px] mx-auto h-full px-6 lg:px-10 flex items-end pb-24">
        <div className="flex items-center gap-5 text-white">
          <div className="w-[92px] h-[92px] rounded-full bg-[#c69a3f] border-[3px] border-white/90 shadow-lg flex items-center justify-center font-['Cormorant_Garamond',serif] text-[34px] font-semibold text-white">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt=""
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              initials
            )}
          </div>
          <div>
            <p className="text-[10.5px] font-bold tracking-[0.3em] uppercase text-[#c69a3f] mb-1.5">
              Contul meu
            </p>
            <h1 className="font-['Cormorant_Garamond',serif] text-[36px] leading-none font-medium">
              {fullName}
            </h1>
            <p className="text-[13px] text-white/70 mt-1">{user.email}</p>
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
    <aside className="bg-white border border-[#e6ecf3] rounded-[18px] p-3 h-fit shadow-[0_10px_40px_rgba(13,44,92,0.06)] sticky top-24">
      <nav className="flex flex-col gap-1">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          const danger = t.key === "danger";
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`group flex items-center gap-3 px-3.5 py-3 rounded-[10px] text-left transition-all duration-200 ${
                active
                  ? danger
                    ? "bg-red-50 text-red-700"
                    : "bg-[#0d2c5c] text-white shadow-[0_4px_14px_rgba(13,44,92,0.2)]"
                  : danger
                    ? "text-red-600 hover:bg-red-50/60"
                    : "text-[#3c4043] hover:bg-[#f4f7fb]"
              }`}
            >
              <span
                className={`w-8 h-8 rounded-md flex items-center justify-center ${
                  active
                    ? danger
                      ? "bg-red-100 text-red-700"
                      : "bg-white/10 text-[#c69a3f]"
                    : danger
                      ? "bg-red-50 text-red-500"
                      : "bg-[#f4f7fb] text-[#0d2c5c]"
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
                        : "text-white/60"
                      : "text-[#8595aa]"
                  }`}
                >
                  {t.hint}
                </p>
              </div>
              <ChevronRight
                size={14}
                className={`opacity-40 transition-transform duration-200 group-hover:translate-x-0.5 ${
                  active ? "opacity-70" : ""
                }`}
              />
            </button>
          );
        })}
      </nav>

      <div className="mt-3 pt-3 border-t border-[#e6ecf3]">
        <button
          onClick={onLogout}
          className="flex items-center gap-2 w-full px-3.5 py-2.5 rounded-[10px] text-[13px] font-semibold text-[#3c4043] hover:bg-[#f4f7fb] transition-colors"
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
    <header className="px-8 pt-8 pb-6 border-b border-[#eef2f7]">
      <p className="text-[10.5px] font-bold tracking-[0.3em] uppercase text-[#c69a3f] mb-2">
        {eyebrow}
      </p>
      <h2 className="font-['Cormorant_Garamond',serif] text-[28px] font-medium text-[#0d2c5c] leading-tight">
        {title}
      </h2>
      <p className="text-[13.5px] text-[#5a6b85] mt-2 max-w-[560px]">
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
        {/* Monogram */}
        <div className="flex items-center gap-5">
          <div className="w-[86px] h-[86px] rounded-full bg-[#0d2c5c] text-white flex items-center justify-center font-['Cormorant_Garamond',serif] text-[30px] font-semibold">
            {initials}
          </div>
          <div>
            <p className="text-[14px] font-semibold text-[#0d2c5c]">
              Monograma ta
            </p>
            <p className="text-[12.5px] text-[#8595aa] mt-0.5">
              Se generează automat din numele tău.
            </p>
          </div>
        </div>

        <Divider />

        {/* Fields */}
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
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8595aa]"
              />
              <input
                type="email"
                value={user.email}
                disabled
                className={`${fieldInput} pl-11 bg-[#f4f7fb] text-[#5a6b85] cursor-not-allowed`}
              />
            </div>
          </Field>
          <Field label="Număr de telefon">
            <div className="relative">
              <Phone
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8595aa]"
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
            className={`flex items-center gap-2 text-[13px] font-medium px-4 py-3 rounded-lg ${
              status.ok
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-red-50 text-red-700 border border-red-200"
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
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#0d2c5c] text-white text-[13px] font-semibold rounded-[10px] hover:bg-[#c69a3f] hover:text-[#0d2c5c] transition-colors disabled:opacity-60"
          >
            <Save size={15} />
            {saving ? "Se salvează…" : "Salvează modificările"}
          </button>
        </div>
      </form>
    </>
  );
}

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

function SecurityTab({ user }: { user: NonNullable<SessionUser> }) {
  const { toast } = useToast();
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [status, setStatus] = useState<null | { ok: boolean; msg: string }>(
    null,
  );
  const [saving, setSaving] = useState(false);
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

  const revokeSession = async (id: string) => {
    try {
      await apiFetch(`/users/me/sessions/${id}`, { method: "DELETE" });
      toast("Sesiunea a fost revocată.", "success");
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

  const rules = useMemo(
    () => ({
      length: pw.next.length >= 8 && pw.next.length <= 64,
      lowercase: /[a-z]/.test(pw.next),
      uppercase: /[A-Z]/.test(pw.next),
      number: /[0-9]/.test(pw.next),
      symbol: /[^A-Za-z0-9]/.test(pw.next),
      match: pw.next.length > 0 && pw.next === pw.confirm,
    }),
    [pw],
  );
  const strong = Object.values(rules).every(Boolean);

  const provider = (user.provider || "local").toLowerCase();
  const isGoogle = provider === "google";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!strong) return;
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch(`${API_URL}/auth/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          current_password: pw.current,
          new_password: pw.next,
        }),
      });
      if (res.ok) {
        setStatus({ ok: true, msg: "Parola a fost actualizată." });
        setPw({ current: "", next: "", confirm: "" });
      } else {
        setStatus({ ok: false, msg: "Parola actuală nu este corectă." });
      }
    } catch {
      setStatus({ ok: false, msg: "Problemă de conexiune cu serverul." });
    } finally {
      setSaving(false);
    }
  };

  const otherSessions = sessions.filter((s) => !s.is_current);

  return (
    <>
      <SectionHead
        eyebrow="Securitate"
        title="Protecția contului tău"
        description="Metoda de autentificare, parola și dispozitivele de pe care ești conectat la Casa Esy."
      />

      <div className="p-8 space-y-10">
        {/* ── Auth provider — premium banner ── */}
        <div className="relative overflow-hidden rounded-[18px] bg-[linear-gradient(120deg,#07203f_0%,#0d2c5c_55%,#123a75_100%)] text-white p-7">
          <div className="absolute -right-16 -top-20 w-64 h-64 rounded-full bg-[#c69a3f]/15 blur-2xl" />
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
                <h3 className="font-['Cormorant_Garamond',serif] text-[26px] leading-tight font-medium">
                  {isGoogle ? "Cont Google" : "Email și parolă"}
                </h3>
                <p className="text-[13px] text-white/70 mt-1.5 max-w-[420px]">
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

        {/* ── Password ── */}
        {isGoogle ? (
          <div className="flex items-start gap-4 p-6 rounded-[16px] border border-[#e6ecf3] bg-[#fafbfd]">
            <div className="w-10 h-10 rounded-full bg-white border border-[#e6ecf3] flex items-center justify-center shrink-0">
              <Lock size={16} className="text-[#8595aa]" />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-[#0d2c5c]">
                Nu există parolă pentru acest cont
              </p>
              <p className="text-[13px] text-[#5a6b85] mt-1 max-w-[560px]">
                Contul tău folosește exclusiv autentificarea Google, așa că nu
                ai o parolă Casa Esy de schimbat. Pentru parolă, verificare în
                doi pași sau dispozitive de încredere, folosește setările de
                securitate Google.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-full bg-[#f4f7fb] text-[#0d2c5c] flex items-center justify-center">
                <KeyRound size={16} />
              </span>
              <div>
                <h3 className="text-[15px] font-semibold text-[#0d2c5c] leading-tight">
                  Schimbă parola
                </h3>
                <p className="text-[12px] text-[#8595aa] mt-0.5">
                  Recomandăm o parolă unică, folosită doar pentru Casa Esy.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="Parola actuală">
                <PwInput
                  value={pw.current}
                  onChange={(v) => setPw({ ...pw, current: v })}
                  show={showPw}
                  onToggle={() => setShowPw((s) => !s)}
                />
              </Field>
              <Field label="Parolă nouă">
                <PwInput
                  value={pw.next}
                  onChange={(v) => setPw({ ...pw, next: v })}
                  show={showPw}
                  onToggle={() => setShowPw((s) => !s)}
                />
              </Field>
              <Field label="Confirmă parola nouă">
                <PwInput
                  value={pw.confirm}
                  onChange={(v) => setPw({ ...pw, confirm: v })}
                  show={showPw}
                  onToggle={() => setShowPw((s) => !s)}
                />
              </Field>
            </div>

            {(pw.next.length > 0 || pw.confirm.length > 0) && (
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
                      className={`flex items-center gap-1.5 ${ok ? "text-emerald-600" : "text-[#8595aa]"}`}
                    >
                      <Check size={13} className={ok ? "" : "opacity-30"} />
                      {label}
                    </li>
                  );
                })}
              </ul>
            )}

            {status && (
              <div
                className={`text-[13px] font-medium px-4 py-3 rounded-lg ${
                  status.ok
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {status.msg}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!strong || saving}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#0d2c5c] text-white text-[13px] font-semibold rounded-[10px] hover:bg-[#c69a3f] hover:text-[#0d2c5c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Shield size={15} />
                {saving ? "Se salvează…" : "Actualizează parola"}
              </button>
            </div>
          </form>
        )}

        <Divider />

        {/* ── Sessions ── */}
        <div>
          <div className="flex flex-wrap items-end justify-between gap-4 mb-5">
            <div>
              <p className="text-[10.5px] font-bold tracking-[0.3em] uppercase text-[#c69a3f] mb-1.5">
                Dispozitive
              </p>
              <h3 className="font-['Cormorant_Garamond',serif] text-[24px] font-medium text-[#0d2c5c] leading-tight">
                Sesiuni active
              </h3>
              <p className="text-[12.5px] text-[#8595aa] mt-1">
                {sessionsLoading
                  ? "Se verifică dispozitivele conectate…"
                  : `${sessions.length} ${sessions.length === 1 ? "dispozitiv conectat" : "dispozitive conectate"}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={loadSessions}
                className="inline-flex items-center gap-2 text-[12px] font-semibold text-[#0d2c5c] border border-[#e1e8f0] px-3.5 py-2 rounded-full hover:border-[#c69a3f] transition-colors"
              >
                <RefreshCw size={13} /> Reîmprospătează
              </button>
              {otherSessions.length > 0 && (
                <button
                  onClick={revokeAllOther}
                  className="inline-flex items-center gap-2 text-[12px] font-semibold text-red-600 border border-red-200 px-3.5 py-2 rounded-full hover:bg-red-50 transition-colors"
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
                  className="h-[116px] rounded-[16px] border border-[#eef2f7] bg-[#fafbfd] animate-pulse"
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
                    className={`relative p-5 rounded-[16px] border transition-colors ${
                      s.is_current
                        ? "border-[#c69a3f]/50 bg-[#fffdf7]"
                        : "border-[#e6ecf3] bg-white hover:border-[#c69a3f]/40"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0 ${
                          s.is_current
                            ? "bg-[#c69a3f] text-white"
                            : "bg-[#f4f7fb] text-[#0d2c5c]"
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
                            <span className="text-[9.5px] font-bold tracking-[0.18em] uppercase text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                              Sesiunea curentă
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#8595aa] mt-1">
                          {meta.label}
                          {os ? ` · ${os}` : ""}
                        </p>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-[12px] text-[#5a6b85]">
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
                            <span className="font-mono text-[11.5px] text-[#8595aa]">
                              {s.ip_address}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {!s.is_current && (
                      <div className="mt-4 pt-4 border-t border-[#eef2f7] flex justify-end">
                        <button
                          onClick={() => revokeSession(s.id)}
                          className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-red-600 border border-red-200 px-3.5 py-2 rounded-full hover:bg-red-50 transition-colors"
                        >
                          <LogOut size={12} /> Deconectează
                        </button>
                      </div>
                    )}
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

/* ─────────────────── RESERVATIONS ─────────────────── */
function ReservationsTab() {
  const [scope, setScope] = useState<"upcoming" | "past">("upcoming");
  const reservations = {
    upcoming: [
      {
        id: "CE-24071",
        room: "Suită Deluxe cu vedere la mare",
        checkIn: "12 Aug 2026",
        checkOut: "18 Aug 2026",
        nights: 6,
        status: "Confirmat",
        total: "3 240 RON",
      },
    ],
    past: [
      {
        id: "CE-23108",
        room: "Cameră Standard Twin",
        checkIn: "04 Iul 2025",
        checkOut: "07 Iul 2025",
        nights: 3,
        status: "Finalizat",
        total: "1 180 RON",
      },
    ],
  };

  const items = reservations[scope];

  return (
    <>
      <SectionHead
        eyebrow="Rezervări"
        title="Sejururile tale la Casa Esy"
        description="Vezi rezervările active, istoricul și detaliile fiecărui sejur."
      />

      <div className="p-8">
        <div className="inline-flex p-1 bg-[#f4f7fb] rounded-full mb-6">
          {[
            { k: "upcoming" as const, label: "Viitoare / Active" },
            { k: "past" as const, label: "Trecute" },
          ].map((t) => (
            <button
              key={t.k}
              onClick={() => setScope(t.k)}
              className={`px-5 py-2 text-[12.5px] font-semibold rounded-full transition-all ${
                scope === t.k
                  ? "bg-white text-[#0d2c5c] shadow-sm"
                  : "text-[#5a6b85] hover:text-[#0d2c5c]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {items.length === 0 ? (
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
                className="group grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 p-5 rounded-[14px] border border-[#e6ecf3] hover:border-[#c69a3f]/50 hover:shadow-[0_6px_24px_rgba(13,44,92,0.06)] transition-all"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10.5px] font-bold tracking-[0.2em] uppercase text-[#8595aa]">
                      #{r.id}
                    </span>
                    <StatusPill status={r.status} />
                  </div>
                  <h4 className="font-['Cormorant_Garamond',serif] text-[22px] text-[#0d2c5c] leading-tight">
                    {r.room}
                  </h4>
                  <p className="text-[13px] text-[#5a6b85] mt-2">
                    {r.checkIn} → {r.checkOut} · {r.nights} nopți
                  </p>
                </div>
                <div className="flex md:flex-col items-end md:items-end justify-between md:justify-center gap-3 md:border-l md:border-[#eef2f7] md:pl-6">
                  <p className="font-['Cormorant_Garamond',serif] text-[24px] text-[#0d2c5c]">
                    {r.total}
                  </p>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 text-[12px] font-semibold text-[#0d2c5c] border border-[#e1e8f0] rounded-lg hover:border-[#c69a3f] transition-colors">
                      Detalii
                    </button>
                    {scope === "upcoming" && (
                      <button className="px-4 py-2 text-[12px] font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                        Anulează
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
    Confirmat: "text-emerald-700 bg-emerald-50 border-emerald-200",
    "În așteptare": "text-amber-700 bg-amber-50 border-amber-200",
    Anulat: "text-red-700 bg-red-50 border-red-200",
    Finalizat: "text-[#0d2c5c] bg-[#eef2f7] border-[#dfe6ef]",
  };
  return (
    <span
      className={`text-[10.5px] font-bold tracking-[0.15em] uppercase px-2.5 py-1 rounded-full border ${map[status] || map.Finalizat}`}
    >
      {status}
    </span>
  );
}

/* ─────────────────── DOWNLOADS ─────────────────── */
function DownloadsTab() {
  const files = [
    {
      name: "Factură #CE-23108.pdf",
      date: "07 Iul 2025",
      size: "142 KB",
      href: "#",
    },
    {
      name: "Voucher check-in — Aug 2026.pdf",
      date: "22 Iul 2026",
      size: "88 KB",
      href: "#",
    },
  ];
  return (
    <>
      <SectionHead
        eyebrow="Descărcări"
        title="Facturi & resurse"
        description="Documentele generate pentru rezervările tale. Le poți descărca oricând."
      />
      <div className="p-8">
        {files.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Nimic de descărcat"
            text="Facturile și voucherele tale vor apărea aici."
          />
        ) : (
          <ul className="divide-y divide-[#eef2f7] border border-[#e6ecf3] rounded-[14px] overflow-hidden">
            {files.map((f) => (
              <li
                key={f.name}
                className="flex items-center justify-between p-4 hover:bg-[#fafbfc] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-md bg-[#f4f7fb] flex items-center justify-center text-[#0d2c5c]">
                    <FileText size={17} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-semibold text-[#0d2c5c] truncate">
                      {f.name}
                    </p>
                    <p className="text-[11.5px] text-[#8595aa] mt-0.5">
                      {f.date} · {f.size}
                    </p>
                  </div>
                </div>
                <a
                  href={f.href}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-[12px] font-semibold text-[#0d2c5c] border border-[#e1e8f0] rounded-lg hover:border-[#c69a3f] hover:text-[#c69a3f] transition-colors"
                >
                  <Download size={14} /> Descarcă
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

/* ─────────────────── SETTINGS ─────────────────── */
function SettingsTab() {
  const [prefs, setPrefs] = useState({
    emailNews: true,
    emailOffers: true,
    sms: false,
    push: true,
    language: "RO",
    theme: "light" as "light" | "dark",
  });

  return (
    <>
      <SectionHead
        eyebrow="Preferințe"
        title="Notificări & aparență"
        description="Personalizează modul în care comunicăm cu tine și cum arată contul tău."
      />
      <div className="p-8 space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Bell size={15} className="text-[#c69a3f]" />
            <h3 className="text-[15px] font-semibold text-[#0d2c5c]">
              Notificări
            </h3>
          </div>
          <div className="space-y-2">
            <Toggle
              label="Ofertele Casa Esy pe email"
              hint="Reduceri sezoniere, evenimente private, promoții."
              value={prefs.emailOffers}
              onChange={(v) => setPrefs({ ...prefs, emailOffers: v })}
            />
            <Toggle
              label="Noutăți pe email"
              hint="Anunțuri importante despre contul și rezervările tale."
              value={prefs.emailNews}
              onChange={(v) => setPrefs({ ...prefs, emailNews: v })}
            />
            <Toggle
              label="Notificări SMS"
              hint="Confirmări rapide pe telefon pentru rezervările tale."
              value={prefs.sms}
              onChange={(v) => setPrefs({ ...prefs, sms: v })}
            />
            <Toggle
              label="Notificări push"
              value={prefs.push}
              onChange={(v) => setPrefs({ ...prefs, push: v })}
            />
          </div>
        </div>

        <Divider />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Globe size={15} className="text-[#c69a3f]" />
              <h3 className="text-[15px] font-semibold text-[#0d2c5c]">
                Limbă
              </h3>
            </div>
            <div className="flex gap-2">
              {["RO", "EN", "DE"].map((l) => (
                <button
                  key={l}
                  onClick={() => setPrefs({ ...prefs, language: l })}
                  className={`px-4 py-2 rounded-lg text-[12.5px] font-semibold border transition-colors ${
                    prefs.language === l
                      ? "bg-[#0d2c5c] text-white border-[#0d2c5c]"
                      : "border-[#e1e8f0] text-[#3c4043] hover:border-[#c69a3f]"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Moon size={15} className="text-[#c69a3f]" />
              <h3 className="text-[15px] font-semibold text-[#0d2c5c]">Temă</h3>
            </div>
            <div className="flex gap-2">
              {[
                { k: "light" as const, l: "Luminos" },
                { k: "dark" as const, l: "Întunecat" },
              ].map((t) => (
                <button
                  key={t.k}
                  onClick={() => setPrefs({ ...prefs, theme: t.k })}
                  className={`px-4 py-2 rounded-lg text-[12.5px] font-semibold border transition-colors ${
                    prefs.theme === t.k
                      ? "bg-[#0d2c5c] text-white border-[#0d2c5c]"
                      : "border-[#e1e8f0] text-[#3c4043] hover:border-[#c69a3f]"
                  }`}
                >
                  {t.l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─────────────────── DANGER ZONE ─────────────────── */
function DangerTab({ onDeleted }: { onDeleted: () => void }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [word, setWord] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const canDelete = word === "ȘTERGE" && pw.length > 0;

  const doDelete = async () => {
    setBusy(true);
    setErr("");
    try {
      const res = await fetch(`${API_URL}/users/me`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password: pw }),
      });
      if (res.ok) {
        onDeleted();
      } else {
        setErr("Nu am putut șterge contul. Verifică parola.");
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
        title="Dezactivare & ștergere cont"
        description="Acțiunile din această zonă sunt permanente. Recomandăm o pauză înainte de ștergerea definitivă."
      />
      <div className="p-8 space-y-5">
        <div className="flex items-center justify-between p-5 rounded-[12px] border border-amber-200 bg-amber-50/50">
          <div>
            <p className="text-[14px] font-semibold text-amber-900">
              Dezactivează temporar contul
            </p>
            <p className="text-[12.5px] text-amber-800/80 mt-1 max-w-[520px]">
              Contul devine invizibil, dar datele tale se păstrează. Poți reveni
              oricând prin login.
            </p>
          </div>
          <button className="px-5 py-2.5 text-[12.5px] font-semibold text-amber-800 border border-amber-300 rounded-lg hover:bg-amber-100 transition-colors whitespace-nowrap">
            Dezactivează
          </button>
        </div>

        <div className="p-5 rounded-[12px] border border-red-200 bg-red-50/40">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-[14px] font-semibold text-red-800">
                Șterge permanent contul
              </p>
              <p className="text-[12.5px] text-red-800/80 mt-1 max-w-[520px]">
                Toate rezervările, facturile și datele tale vor fi șterse
                definitiv. Această acțiune nu poate fi anulată.
              </p>
            </div>
            {!confirmOpen && (
              <button
                onClick={() => setConfirmOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-[12.5px] font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap"
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
              <Field label="Confirmă cu parola contului">
                <input
                  type="password"
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  className={fieldInput}
                  placeholder="••••••••"
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
                    setPw("");
                    setErr("");
                  }}
                  className="px-5 py-2.5 text-[12.5px] font-semibold text-[#3c4043] border border-[#e1e8f0] rounded-lg hover:bg-[#f4f7fb] transition-colors"
                >
                  Renunță
                </button>
                <button
                  disabled={!canDelete || busy}
                  onClick={doDelete}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-[12.5px] font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
  "w-full py-3 px-4 border border-[#e1e8f0] rounded-[10px] font-sans text-[14px] text-[#1a1a1a] bg-white outline-none transition-all duration-200 focus:border-[#1e4d8c] focus:shadow-[0_0_0_3px_rgba(30,77,140,0.08)] placeholder:text-[#a4b0c1]";

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
      <span className="text-[11px] font-bold tracking-[0.15em] uppercase text-[#5a6b85]">
        {label}
      </span>
      {children}
      {hint && <span className="text-[11.5px] text-[#8595aa]">{hint}</span>}
    </label>
  );
}

function PwInput({
  value,
  onChange,
  show,
  onToggle,
}: {
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${fieldInput} pr-11`}
        placeholder="••••••••"
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8595aa] hover:text-[#0d2c5c] p-1"
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

function Toggle({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 p-4 rounded-[12px] border border-[#e6ecf3] hover:border-[#c69a3f]/40 transition-colors cursor-pointer">
      <div>
        <p className="text-[13.5px] font-semibold text-[#0d2c5c]">{label}</p>
        {hint && <p className="text-[12px] text-[#8595aa] mt-0.5">{hint}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative w-11 h-6 rounded-full transition-colors ${
          value ? "bg-[#0d2c5c]" : "bg-[#dfe6ef]"
        }`}
        aria-pressed={value}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
            value ? "translate-x-5" : ""
          }`}
        />
      </button>
    </label>
  );
}

function Divider() {
  return <div className="h-px bg-[#eef2f7]" />;
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
      <div className="w-14 h-14 rounded-full bg-[#f4f7fb] text-[#0d2c5c] flex items-center justify-center mx-auto mb-4">
        <Icon size={22} />
      </div>
      <p className="font-['Cormorant_Garamond',serif] text-[22px] text-[#0d2c5c]">
        {title}
      </p>
      <p className="text-[13px] text-[#8595aa] mt-1.5">{text}</p>
    </div>
  );
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase() || "?";
}
