import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  Database,
  BookOpen,
  Radio,
  Sparkles,
  CreditCard,
  Send,
  ShieldCheck,
  RefreshCw,
  Clock,
  Server,
  CheckCircle2,
  Cpu,
  Lock,
  Globe,
} from "lucide-react";
import { get, errMsg } from "../../lib/admin";
import { Card } from "./ui";

interface HealthServiceItem {
  key: string;
  name: string;
  status: "healthy" | "degraded" | "unhealthy" | string;
  detail: string;
  latency_ms?: number | null;
}

interface DetailedHealthResponse {
  status: "healthy" | "degraded" | "unhealthy" | string;
  uptime_seconds: number;
  environment: string;
  checked_at: string;
  services: HealthServiceItem[];
}

function fmtUptime(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h >= 24) {
    const d = Math.floor(h / 24);
    return `${d}z ${h % 24}h ${m}m`;
  }
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function fmtCheckedTime(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleTimeString("ro-RO", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

const SERVICE_META: Record<
  string,
  { icon: typeof Activity; category: string; description: string }
> = {
  database: {
    icon: Database,
    category: "Persistență & Date",
    description:
      "Stochează rezervările, camerele, unitățile fizice, utilizatorii, snapshot-urile zilnice de ocupare și jurnalele de audit cu verificări de latență în timp real.",
  },
  rag_kb: {
    icon: BookOpen,
    category: "Cunoștințe AI (RAG)",
    description:
      "Index hibrid BM25 + fuzzy + sinonime încărcat automat din fișiere Markdown modulare, izolat strict pe 3 niveluri de acces (public, guest și admin).",
  },
  websockets: {
    icon: Radio,
    category: "Sincronizare Live",
    description:
      "Canal bidirecțional /ws/live care actualizează instant panoul Admin, KDS Bucătărie, Housekeeping, Smart Lock și pagina de urmărire a comenzii fără refresh.",
  },
  gemini_ai: {
    icon: Sparkles,
    category: "Inteligență Artificială",
    description:
      "Alimentează concierge-ul multilingv Esy (cu 15+ tool-uri live), Asistentul Executiv SQL/Telegram, analiza de sentiment pe recenzii și AI Quality Audit.",
  },
  stripe: {
    icon: CreditCard,
    category: "Procesare Plăți",
    description:
      "Procesează plățile securizate 3D Secure pentru rezervări de camere, comenzi Room Service și închiderea notei de cameră (Folio), cu confirmare prin webhook.",
  },
  telegram: {
    icon: Send,
    category: "Operațiuni Mobile",
    description:
      "Botul executiv al proprietarului pentru interogări vocale/text în baza de date, acțiuni agentice live, alerte de erori 500 și briefing-ul automat de dimineață.",
  },
  email_security: {
    icon: ShieldCheck,
    category: "Comunicare & Protecție",
    description:
      "Trimite confirmări de rezervare, coduri PIN Smart Lock, campanii newsletter cu dezabonare 1-click și protejează global toate cele 28 de routere prin SlowAPI Rate Limiter.",
  },
};

export default function SystemHealthWidget() {
  const [data, setData] = useState<DetailedHealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHealth = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const res = await get<DetailedHealthResponse>("/health/detailed");
      setData(res);
    } catch (e) {
      setError(errMsg(e));
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadHealth();
  }, [loadHealth]);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = window.setInterval(() => {
      void loadHealth(true);
    }, 15000);
    return () => window.clearInterval(id);
  }, [autoRefresh, loadHealth]);

  const services = data?.services || [];
  const healthyCount = services.filter((s) => s.status === "healthy").length;
  const dbService = services.find((s) => s.key === "database");
  const dbLatency = dbService?.latency_ms != null ? `${dbService.latency_ms} ms` : "—";

  const overallDot =
    data?.status === "healthy"
      ? "bg-emerald-400"
      : data?.status === "degraded"
        ? "bg-[#f5d588]"
        : "bg-rose-400";

  const overallLabel =
    data?.status === "healthy"
      ? "Toate sistemele funcționează optim"
      : data?.status === "degraded"
        ? "Anumite servicii necesită atenție"
        : "Defecțiune critică detectată";

  return (
    <div className="space-y-6">
      {/* 1. Hero Status Banner — curat Alb + Navy */}
      <div className="overflow-hidden rounded-2xl border border-[#e1e8f0] bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0d2c5c] px-6 py-5 text-white">
          <div className="flex items-center gap-3.5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 text-white">
              <Activity size={22} />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h3 className="text-[19px] font-bold tracking-tight font-['Outfit',sans-serif]">
                  {overallLabel}
                </h3>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 border border-white/20 px-3 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-white">
                  <span className={`h-2 w-2 rounded-full ${overallDot} animate-pulse`} />
                  {data?.status === "healthy" ? "LIVE OK" : data?.status || "VERIFICARE"}
                </span>
              </div>
              <p className="text-[12.5px] text-white/75 mt-0.5">
                Monitorizare în timp real pentru baza de date, motorul AI RAG, plăți, WebSocket și automatizările Vila Casa Esy.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setAutoRefresh((v) => !v)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[11px] font-bold uppercase tracking-wider transition cursor-pointer ${
                autoRefresh
                  ? "bg-white/18 border border-white/35 text-white"
                  : "bg-white/5 border border-white/15 text-white/70 hover:bg-white/10"
              }`}
            >
              <Clock size={12.5} />
              Auto-sync 15s {autoRefresh ? "ON" : "OFF"}
            </button>
            <button
              type="button"
              onClick={() => void loadHealth()}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-[#0d2c5c] shadow-sm hover:bg-[#f4f7fb] transition disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw size={12.5} className={loading ? "animate-spin" : ""} />
              Verifică acum
            </button>
          </div>
        </div>

        {/* 4 Summary KPI Tiles — fundal alb curat */}
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 divide-x divide-[#eef2f7] bg-white">
          <div className="p-4 sm:p-5">
            <div className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#6b7c99] flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-600" /> Servicii Operaționale
            </div>
            <div className="mt-1.5 text-[24px] font-extrabold text-[#0d2c5c]">
              {healthyCount} <span className="text-[14px] font-semibold text-[#6b7c99]">/ {services.length || 7}</span>
            </div>
            <div className="text-[11.5px] text-[#5e718f] mt-0.5">Toate modulele critice monitorizate</div>
          </div>

          <div className="p-4 sm:p-5">
            <div className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#6b7c99] flex items-center gap-1.5">
              <Database size={13} className="text-[#0d2c5c]" /> Latență Bază de Date
            </div>
            <div className="mt-1.5 text-[24px] font-extrabold text-[#0d2c5c]">
              {dbLatency}
            </div>
            <div className="text-[11.5px] text-[#5e718f] mt-0.5">Interogare live SELECT 1</div>
          </div>

          <div className="p-4 sm:p-5">
            <div className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#6b7c99] flex items-center gap-1.5">
              <Server size={13} className="text-[#0d2c5c]" /> Mediu &amp; Uptime
            </div>
            <div className="mt-1.5 text-[24px] font-extrabold text-[#0d2c5c]">
              {data ? fmtUptime(data.uptime_seconds) : "—"}
            </div>
            <div className="text-[11.5px] text-[#5e718f] mt-0.5">
              Mediu activ: <b className="text-[#0d2c5c]">{data?.environment || "—"}</b>
            </div>
          </div>

          <div className="p-4 sm:p-5">
            <div className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#6b7c99] flex items-center gap-1.5">
              <Clock size={13} className="text-[#0d2c5c]" /> Ultima Verificare
            </div>
            <div className="mt-1.5 text-[24px] font-extrabold text-[#0d2c5c] tabular-nums">
              {fmtCheckedTime(data?.checked_at)}
            </div>
            <div className="text-[11.5px] text-[#5e718f] mt-0.5">Endpoint /health/detailed</div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-[13px] font-medium text-rose-700">
          Nu am putut interoga `/health/detailed`: {error}
        </div>
      )}

      {/* 2. Detailed Service Cards Grid — carduri albe curate fără tentă galbenă */}
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 ${loading && !data ? "opacity-60" : ""}`}>
        {services.map((svc) => {
          const meta = SERVICE_META[svc.key] || {
            icon: Activity,
            category: "Serviciu Sistem",
            description: "Componentă internă monitorizată automat de backend-ul Vila Casa Esy.",
          };
          const Icon = meta.icon;
          const isOk = svc.status === "healthy";
          const isWarn = svc.status === "degraded";

          const dotCls = isOk ? "bg-emerald-500" : isWarn ? "bg-amber-500" : "bg-rose-500";
          const badgeCls = isOk
            ? "text-emerald-700 bg-emerald-50 border-emerald-200"
            : isWarn
              ? "text-amber-700 bg-amber-50 border-amber-200"
              : "text-rose-700 bg-rose-50 border-rose-200";
          const barCls = isOk ? "bg-emerald-500 w-full" : isWarn ? "bg-amber-500 w-3/4" : "bg-rose-500 w-1/4";

          return (
            <Card
              key={svc.key}
              className="p-5 border border-[#e1e8f0] bg-white flex flex-col justify-between gap-3.5 shadow-sm hover:border-[#0d2c5c]/30 transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3.5 min-w-0">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0d2c5c]/8 text-[#0d2c5c]">
                    <Icon size={19} />
                  </span>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#6b7c99] block">
                      {meta.category}
                    </span>
                    <h4 className="text-[16px] font-bold text-[#0d2c5c] leading-snug">
                      {svc.name}
                    </h4>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider shrink-0 ${badgeCls}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${dotCls}`} />
                  {isOk ? "Operațional" : isWarn ? "Atenție" : "Eroare"}
                </span>
              </div>

              <div className="rounded-xl border border-[#e6ecf5] bg-[#f8fafd] px-3.5 py-2 text-[12.5px] font-semibold text-[#0d2c5c]">
                {svc.detail}
              </div>

              <p className="text-[12.5px] leading-relaxed text-[#556885]">
                {meta.description}
              </p>

              <div className="pt-1">
                <div className="h-1.5 w-full rounded-full bg-[#eef2f7] overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${barCls}`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* 3. Architecture & Active Automations Overview — carduri albe curate */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 border border-[#e1e8f0] bg-white space-y-2 shadow-sm">
          <div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.12em] text-[#0d2c5c]">
            <Lock size={15} className="text-[#0d2c5c]" />
            Securitate &amp; Protecție API
          </div>
          <p className="text-[12.5px] leading-relaxed text-[#556885]">
            Protecție globală <b className="text-[#0d2c5c]">SlowAPI Rate Limiter</b> pe toate cele 28 de routere, matrice RBAC strictă pe 6 roluri, sesiuni JWT revocabile, firewall IP și Content-Security-Policy activă pe Netlify.
          </p>
        </Card>

        <Card className="p-5 border border-[#e1e8f0] bg-white space-y-2 shadow-sm">
          <div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.12em] text-[#0d2c5c]">
            <Cpu size={15} className="text-[#0d2c5c]" />
            Job-uri Automate (Scheduler)
          </div>
          <p className="text-[12.5px] leading-relaxed text-[#556885]">
            Briefing zilnic Telegram la <b className="text-[#0d2c5c]">08:00 (Europe/Bucharest)</b> cu meteo și KPI-uri, recalculare nocturnă <b className="text-[#0d2c5c]">OccupancySnapshot</b> pe 90 de zile și curățare automată sesiuni expirate la 30 minute.
          </p>
        </Card>

        <Card className="p-5 border border-[#e1e8f0] bg-white space-y-2 shadow-sm">
          <div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.12em] text-[#0d2c5c]">
            <Globe size={15} className="text-[#0d2c5c]" />
            Integrări Externe &amp; Fallback
          </div>
          <p className="text-[12.5px] leading-relaxed text-[#556885]">
            <b className="text-[#0d2c5c]">Nager.Date API</b> pentru sărbătorile legale RO (+ algoritm Meeus Paște/Rusalii), <b className="text-[#0d2c5c]">Open-Meteo</b> Eforie Nord, Stripe 3DS Checkout, Google OAuth 2.0 și Telegram Webhook.
          </p>
        </Card>
      </div>
    </div>
  );
}
