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
  if (h >= 24) {
    const d = Math.floor(h / 24);
    return `${d}z ${h % 24}h`;
  }
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

const ICON_MAP: Record<string, typeof Activity> = {
  database: Database,
  rag_kb: BookOpen,
  websockets: Radio,
  gemini_ai: Sparkles,
  stripe: CreditCard,
  telegram: Send,
  email_security: ShieldCheck,
};

export default function SystemHealthWidget() {
  const [data, setData] = useState<DetailedHealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHealth = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await get<DetailedHealthResponse>("/health/detailed");
      setData(res);
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadHealth();
  }, [loadHealth]);

  const overallDot =
    data?.status === "healthy"
      ? "bg-emerald-500"
      : data?.status === "degraded"
        ? "bg-[#c69a3f]"
        : "bg-rose-500";

  const overallLabel =
    data?.status === "healthy"
      ? "Toate sistemele operaționale"
      : data?.status === "degraded"
        ? "Servicii parțial degradate"
        : "Verificare necesară";

  return (
    <Card className="p-5 sm:p-6 border-[#e5dcc3] bg-gradient-to-br from-white via-[#fcfdff] to-[#fdfaf3] space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-[#e8eef6]">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0d2c5c] text-[#f5d588] shadow-xs">
            <Activity size={19} />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[17px] font-bold text-[#0d2c5c] font-['Outfit',sans-serif]">
                Stare Sistem &amp; Infrastructură Live
              </h3>
              {data && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e1e8f0] bg-white px-2.5 py-0.5 text-[10.5px] font-bold text-[#0d2c5c]">
                  <span className={`h-2 w-2 rounded-full ${overallDot}`} />
                  {overallLabel}
                </span>
              )}
            </div>
            {data && (
              <p className="text-[11.5px] text-[#5e718f] mt-0.5">
                Mediu: <b className="text-[#0d2c5c]">{data.environment}</b> · Uptime:{" "}
                <b className="text-[#0d2c5c]">{fmtUptime(data.uptime_seconds)}</b>
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => void loadHealth()}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-full border border-[#d8e2f0] bg-white px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#0d2c5c] hover:border-[#c69a3f] hover:bg-[#fffdf7] transition disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw size={12.5} className={loading ? "animate-spin text-[#c69a3f]" : "text-[#c69a3f]"} />
          Verifică acum
        </button>
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[12.5px] text-rose-700">
          Nu am putut interoga `/health/detailed`: {error}
        </div>
      ) : (
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 ${loading && !data ? "opacity-60" : ""}`}>
          {(data?.services || []).map((svc) => {
            const Icon = ICON_MAP[svc.key] || Activity;
            const dotCls =
              svc.status === "healthy"
                ? "bg-emerald-500"
                : svc.status === "degraded"
                  ? "bg-[#c69a3f]"
                  : "bg-rose-500";
            const badgeCls =
              svc.status === "healthy"
                ? "text-emerald-700 bg-emerald-50 border-emerald-200/80"
                : svc.status === "degraded"
                  ? "text-[#8a6420] bg-[#fdf6e2] border-[#e5dcc3]"
                  : "text-rose-700 bg-rose-50 border-rose-200";

            return (
              <div
                key={svc.key}
                className="rounded-2xl border border-[#e6ecf5] bg-white p-3.5 flex flex-col justify-between gap-2 shadow-[0_2px_10px_rgba(13,44,92,0.03)]"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon size={15} className="text-[#c69a3f] shrink-0" />
                    <span className="truncate text-[12.5px] font-bold text-[#0d2c5c]">
                      {svc.name}
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider shrink-0 ${badgeCls}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${dotCls}`} />
                    {svc.status === "healthy" ? "OK" : svc.status === "degraded" ? "Atenție" : "Eroare"}
                  </span>
                </div>
                <p className="text-[11.5px] text-[#5e718f] truncate" title={svc.detail}>
                  {svc.detail}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
