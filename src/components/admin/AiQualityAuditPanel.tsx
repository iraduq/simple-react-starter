import { useCallback, useEffect, useState } from "react";
import {
  ShieldCheck,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Globe,
  BookOpen,
  PlusCircle,
  MessageSquare,
} from "lucide-react";
import { get, post, errMsg, dateTimeFmt } from "../../lib/admin";
import { useToast } from "../Toast";
import { Badge, Button, Card, EmptyState, TableSkeleton, inputCls } from "./ui";

interface AuditGap {
  id: string;
  message_id: number;
  session_id: string;
  question: string;
  reply: string;
  intent: string;
  language: string;
  sentiment: string;
  issue_type: "kb_miss" | "negative_sentiment" | "escalation" | string;
  created_at?: string | null;
  suggested_rule_title: string;
  suggested_rule_text: string;
  target_field: string;
}

interface QualityAuditData {
  period_days: number;
  overall_score: number;
  grade: string;
  metrics: {
    total_sessions: number;
    total_turns: number;
    rag_hit_rate_pct: number;
    positive_neutral_pct: number;
    escalation_rate_pct: number;
    avg_latency_ms: number;
    p95_latency_ms: number;
    kb_misses_count: number;
    escalations_count: number;
    feedback_total: number;
    feedback_positive_pct: number | null;
    rag_docs_total: number;
  };
  top_intents: Array<{ intent: string; count: number; pct: number }>;
  languages: Array<{ language: string; count: number; pct: number }>;
  gaps: AuditGap[];
  recommendations: string[];
}

const TARGET_FIELD_OPTIONS = [
  { value: "custom_rules", label: "Instrucțiuni personalizate" },
  { value: "house_rules", label: "Reguli în cameră" },
  { value: "breakfast_and_dining_info", label: "Mic dejun, Restaurant & Bar" },
  { value: "local_area_tips", label: "Recomandări locale & Atracții" },
];

export default function AiQualityAuditPanel({
  onOpenSession,
  onConfigUpdated,
}: {
  onOpenSession?: (sessionId: string) => void;
  onConfigUpdated?: () => void;
}) {
  const { toast } = useToast();
  const [days, setDays] = useState<number>(30);
  const [data, setData] = useState<QualityAuditData | null>(null);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [appliedIds, setAppliedIds] = useState<Record<string, boolean>>({});
  const [drafts, setDrafts] = useState<
    Record<string, { title: string; text: string; target_field: string }>
  >({});

  const loadAudit = useCallback(
    async (period = days) => {
      setLoading(true);
      try {
        const res = await get<QualityAuditData>(
          `/api/chat/admin/quality-audit?days=${period}`,
        );
        setData(res);
        const initialDrafts: Record<
          string,
          { title: string; text: string; target_field: string }
        > = {};
        for (const g of res.gaps || []) {
          initialDrafts[g.id] = {
            title: g.suggested_rule_title,
            text: g.suggested_rule_text,
            target_field: g.target_field || "custom_rules",
          };
        }
        setDrafts(initialDrafts);
      } catch (e) {
        toast(errMsg(e), "error");
      } finally {
        setLoading(false);
      }
    },
    [days, toast],
  );

  useEffect(() => {
    void loadAudit(days);
  }, [days, loadAudit]);

  const handleApplySuggestion = async (gap: AuditGap) => {
    const draft = drafts[gap.id] || {
      title: gap.suggested_rule_title,
      text: gap.suggested_rule_text,
      target_field: gap.target_field || "custom_rules",
    };
    if (!draft.text.trim()) {
      toast("Completează textul regulii înainte de a o aplica.", "error");
      return;
    }
    setApplyingId(gap.id);
    try {
      await post("/api/chat/admin/quality-audit/apply-suggestion", {
        target_field: draft.target_field,
        rule_title: draft.title.trim() || "Regulă nouă Concierge",
        rule_text: draft.text.trim(),
      });
      setAppliedIds((prev) => ({ ...prev, [gap.id]: true }));
      toast("Regula a fost adăugată în Creierul AI Esy și este activă imediat!", "success");
      onConfigUpdated?.();
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setApplyingId(null);
    }
  };

  if (loading && !data) {
    return (
      <Card className="p-6">
        <TableSkeleton rows={5} />
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="p-6">
        <EmptyState
          title="Auditul de calitate AI nu a putut fi încărcat"
          hint="Încearcă să reîmprospătezi datele."
        />
      </Card>
    );
  }

  const score = data.overall_score;
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (score / 100) * circumference;
  const scoreStroke =
    score >= 86 ? "#059669" : score >= 70 ? "#c69a3f" : "#dc2626";

  return (
    <div className="space-y-6">
      {/* Hero Quality Audit Card */}
      <div className="relative overflow-hidden rounded-[24px] border border-[#e5dcc3] bg-gradient-to-br from-white via-[#fcfdff] to-[#fdfaf3] p-6 sm:p-7 shadow-[0_16px_42px_rgba(13,44,92,0.07)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[3px]"
          style={{
            background:
              "linear-gradient(90deg, #0d2c5c 0%, #3b82f6 35%, #8b5cf6 65%, #c69a3f 100%)",
          }}
        />

        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#e8eef6]">
          <div className="flex items-start gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0d2c5c] via-[#1e4380] to-[#4f46e5] shadow-[0_8px_22px_rgba(13,44,92,0.22)] ring-2 ring-[#e5dcc3]/80">
              <ShieldCheck size={22} className="text-[#f5d588]" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-[21px] font-bold tracking-tight text-[#0d2c5c] font-['Outfit',sans-serif]">
                  AI Quality Audit · Conversații Esy &amp; Auto-Învățare RAG
                </h3>
                <Badge tone="gold">Calificativ {data.grade}</Badge>
              </div>
              <p className="text-[13px] text-[#5e718f] mt-0.5">
                Evaluează automat calitatea răspunsurilor, detectează întrebările fără acoperire în RAG și propune reguli gata de aplicat cu 1 click.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDays(d)}
                className={`rounded-full px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider transition cursor-pointer ${
                  days === d
                    ? "bg-[#0d2c5c] text-[#f5d588] shadow-xs"
                    : "border border-[#d8e2f0] bg-white text-[#5e718f] hover:border-[#c69a3f] hover:text-[#0d2c5c]"
                }`}
              >
                {d} zile
              </button>
            ))}
            <Button variant="ghost" onClick={() => void loadAudit(days)} disabled={loading}>
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              Reanalizează
            </Button>
          </div>
        </div>

        {/* Score Gauge + 4 KPI Cards */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          <div className="lg:col-span-3 flex items-center gap-4 rounded-2xl border border-[#e5dcc3] bg-white p-4 shadow-xs">
            <div className="relative h-24 w-24 shrink-0">
              <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke="#eef2f7"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke={scoreStroke}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeOffset}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[24px] font-extrabold text-[#0d2c5c] leading-none">
                  {score}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#8a6420] mt-0.5">
                  / 100
                </span>
              </div>
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#6b7c99]">
                Scor Calitate AI
              </div>
              <div className="text-[16px] font-bold text-[#0d2c5c] mt-0.5">
                {score >= 90
                  ? "Excelent"
                  : score >= 78
                    ? "Foarte bun"
                    : "Necesită atenție"}
              </div>
              <div className="text-[11.5px] text-[#5e718f] mt-1">
                {data.metrics.total_turns} replici · {data.metrics.total_sessions} sesiuni
              </div>
            </div>
          </div>

          <div className="lg:col-span-9 grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="rounded-2xl border border-[#e1e8f0] bg-white p-4">
              <div className="text-[10.5px] font-bold uppercase tracking-wider text-[#6b7c99] flex items-center gap-1.5">
                <BookOpen size={13} className="text-[#c69a3f]" /> Acoperire RAG
              </div>
              <div className="text-[22px] font-bold text-[#0d2c5c] mt-1.5">
                {data.metrics.rag_hit_rate_pct}%
              </div>
              <div className="text-[11px] text-[#5e718f] mt-0.5">
                {data.metrics.rag_docs_total} doc. verificate · {data.metrics.kb_misses_count} lacune
              </div>
            </div>

            <div className="rounded-2xl border border-[#e1e8f0] bg-white p-4">
              <div className="text-[10.5px] font-bold uppercase tracking-wider text-[#6b7c99] flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-600" /> Sentiment OK
              </div>
              <div className="text-[22px] font-bold text-emerald-700 mt-1.5">
                {data.metrics.positive_neutral_pct}%
              </div>
              <div className="text-[11px] text-[#5e718f] mt-0.5">
                Escaladări: {data.metrics.escalation_rate_pct}%
              </div>
            </div>

            <div className="rounded-2xl border border-[#e1e8f0] bg-white p-4">
              <div className="text-[10.5px] font-bold uppercase tracking-wider text-[#6b7c99] flex items-center gap-1.5">
                <Clock size={13} className="text-[#2f6fd6]" /> Latență Medie
              </div>
              <div className="text-[22px] font-bold text-[#0d2c5c] mt-1.5">
                {data.metrics.avg_latency_ms} ms
              </div>
              <div className="text-[11px] text-[#5e718f] mt-0.5">
                P95: {data.metrics.p95_latency_ms} ms
              </div>
            </div>

            <div className="rounded-2xl border border-[#e1e8f0] bg-white p-4">
              <div className="text-[10.5px] font-bold uppercase tracking-wider text-[#6b7c99] flex items-center gap-1.5">
                <Globe size={13} className="text-[#c69a3f]" /> Limbi Active
              </div>
              <div className="text-[22px] font-bold text-[#0d2c5c] mt-1.5">
                {data.languages.length || 1}
              </div>
              <div className="text-[11px] text-[#5e718f] mt-0.5 truncate">
                {data.languages.map((l) => l.language).join(", ") || "RO"}
              </div>
            </div>
          </div>
        </div>

        {/* Recomandări AI */}
        {data.recommendations.length > 0 && (
          <div className="mt-5 rounded-2xl border border-[#e5dcc3] bg-[#fdfaf2] p-4 space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#9a7222] flex items-center gap-1.5">
              <Sparkles size={13} /> Recomandări Executive AI
            </div>
            <ul className="space-y-1.5 text-[13px] text-[#0d2c5c]">
              {data.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#c69a3f] shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Distribuție Intenții & Limbi */}
      {(data.top_intents.length > 0 || data.languages.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-5 space-y-3.5">
            <div className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#0d2c5c]">
              Top Intenții Oaspeți
            </div>
            {data.top_intents.length === 0 ? (
              <p className="text-[12.5px] text-[#6b7c99]">Încă nu există date suficiente.</p>
            ) : (
              <div className="space-y-2.5">
                {data.top_intents.map((it) => (
                  <div key={it.intent} className="space-y-1">
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="font-semibold text-[#0d2c5c]">{it.intent}</span>
                      <span className="text-[#5e718f] font-medium">
                        {it.count} ({it.pct}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-[#eef2f7] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#0d2c5c] to-[#c69a3f]"
                        style={{ width: `${Math.max(4, it.pct)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-5 space-y-3.5">
            <div className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#0d2c5c]">
              Distribuție Limbi Conversații
            </div>
            {data.languages.length === 0 ? (
              <p className="text-[12.5px] text-[#6b7c99]">Încă nu există date suficiente.</p>
            ) : (
              <div className="space-y-2.5">
                {data.languages.map((lg) => (
                  <div key={lg.language} className="space-y-1">
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="font-semibold text-[#0d2c5c]">{lg.language}</span>
                      <span className="text-[#5e718f] font-medium">
                        {lg.count} ({lg.pct}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-[#eef2f7] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#c69a3f] to-[#e6b85c]"
                        style={{ width: `${Math.max(4, lg.pct)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Lacune RAG & Propuneri de Auto-Învățare 1-Click */}
      <Card className="p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#e8eef6]">
          <div>
            <h4 className="text-[17px] font-bold text-[#0d2c5c] flex items-center gap-2 font-['Outfit',sans-serif]">
              <AlertTriangle size={17} className="text-[#c69a3f]" />
              Lacune RAG Detectate &amp; Propuneri de Auto-Învățare ({data.gaps.length})
            </h4>
            <p className="text-[12.5px] text-[#5e718f] mt-0.5">
              Revizuiește regula propusă de AI pentru fiecare întrebare cu probleme și apasă „Adaugă în Creierul AI” — Esy o va folosi instant în conversațiile viitoare.
            </p>
          </div>
        </div>

        {data.gaps.length === 0 ? (
          <EmptyState
            title="Zero lacune RAG detectate în această perioadă"
            hint="Esy a răspuns complet și pozitiv la toate întrebările oaspeților!"
          />
        ) : (
          <div className="space-y-4">
            {data.gaps.map((gap) => {
              const draft = drafts[gap.id] || {
                title: gap.suggested_rule_title,
                text: gap.suggested_rule_text,
                target_field: gap.target_field || "custom_rules",
              };
              const isApplied = Boolean(appliedIds[gap.id]);

              return (
                <div
                  key={gap.id}
                  className="rounded-2xl border border-[#e5dcc3] bg-gradient-to-br from-white to-[#fdfaf3] p-5 space-y-3.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {gap.issue_type === "kb_miss" ? (
                        <Badge tone="gold">Lipsă în RAG (KB Miss)</Badge>
                      ) : gap.issue_type === "negative_sentiment" ? (
                        <Badge tone="red">Sentiment Negativ</Badge>
                      ) : (
                        <Badge tone="navy">Escaladare</Badge>
                      )}
                      <Badge tone="navy">{gap.intent}</Badge>
                      <span className="text-[11px] font-semibold text-[#5e718f]">
                        {gap.language}
                        {gap.created_at ? ` · ${dateTimeFmt(gap.created_at)}` : ""}
                      </span>
                    </div>
                    {onOpenSession && (
                      <button
                        type="button"
                        onClick={() => onOpenSession(gap.session_id)}
                        className="inline-flex items-center gap-1 text-[11.5px] font-bold text-[#0d2c5c] hover:text-[#c69a3f] cursor-pointer"
                      >
                        <MessageSquare size={12} /> Vezi conversația →
                      </button>
                    )}
                  </div>

                  <div className="rounded-xl border border-[#e1e8f0] bg-white p-3.5 space-y-1.5">
                    <div className="text-[12.5px] font-bold text-[#0d2c5c]">
                      Întrebare oaspete: „{gap.question}”
                    </div>
                    <div className="text-[12px] text-[#5e718f] line-clamp-2">
                      Răspuns anterior Esy: {gap.reply}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    <div className="md:col-span-7">
                      <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#6b7c99] block mb-1">
                        Titlu regulă propusă
                      </label>
                      <input
                        value={draft.title}
                        onChange={(e) =>
                          setDrafts((p) => ({
                            ...p,
                            [gap.id]: { ...draft, title: e.target.value },
                          }))
                        }
                        className={`${inputCls} text-[13px]`}
                      />
                    </div>
                    <div className="md:col-span-5">
                      <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#6b7c99] block mb-1">
                        Secțiune în Creierul AI
                      </label>
                      <select
                        value={draft.target_field}
                        onChange={(e) =>
                          setDrafts((p) => ({
                            ...p,
                            [gap.id]: { ...draft, target_field: e.target.value },
                          }))
                        }
                        className={`${inputCls} text-[13px]`}
                      >
                        {TARGET_FIELD_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-12">
                      <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#6b7c99] block mb-1">
                        Text regulă / răspuns oficial (editabil)
                      </label>
                      <textarea
                        rows={2}
                        value={draft.text}
                        onChange={(e) =>
                          setDrafts((p) => ({
                            ...p,
                            [gap.id]: { ...draft, text: e.target.value },
                          }))
                        }
                        className={`${inputCls} text-[13px] resize-y`}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end">
                    {isApplied ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 text-[12px] font-bold text-emerald-700">
                        <CheckCircle2 size={14} /> Adăugat în Creierul AI
                      </span>
                    ) : (
                      <Button
                        variant="gold"
                        onClick={() => void handleApplySuggestion(gap)}
                        disabled={applyingId === gap.id}
                      >
                        <PlusCircle size={14} />
                        {applyingId === gap.id
                          ? "Se aplică..."
                          : "Adaugă în Creierul AI (1-click)"}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
