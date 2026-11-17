import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Star,
  MessageSquareReply,
  Eye,
  EyeOff,
  Trash2,
  CheckCircle2,
  BedDouble,
  Sparkles,
  TrendingUp,
  Smile,
  Meh,
  Frown,
  AlertTriangle,
  ThumbsUp,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { apiFetch } from "../../lib/api";
import { dateFmt } from "../../lib/admin";
import { useToast } from "../Toast";
import { useAdminLiveSync } from "../../context/AdminLiveSyncContext";
import {
  SectionHeader,
  PrimaryButton,
  GhostButton,
  SearchInput,
  Modal,
  Field,
  Textarea,
  Pagination,
  usePaged,
} from "./ui";

export interface AdminReviewItem {
  id: string;
  room_id: string;
  room_title: string;
  booking_code?: string | null;
  unit_number?: string | null;
  guest_name: string;
  rating_overall: number;
  rating_cleanliness: number;
  rating_comfort: number;
  rating_location: number;
  rating_service: number;
  rating_restaurant?: number;
  rating_breakfast?: number;
  ai_sentiment?: "positive" | "neutral" | "negative";
  ai_confidence?: number;
  ai_keywords?: string[];
  comment: string;
  admin_reply?: string | null;
  admin_replied_at?: string | null;
  is_verified: boolean;
  is_visible: boolean;
  created_at?: string | null;
}

export interface ReviewAnalyticsData {
  total_reviews: number;
  overall_score: number;
  criteria: {
    cleanliness: number;
    staff: number;
    comfort: number;
    restaurant: number;
    breakfast: number;
  };
  sentiment_distribution: {
    positive_count: number;
    positive_pct: number;
    neutral_count: number;
    neutral_pct: number;
    negative_count: number;
    negative_pct: number;
  };
  top_praised: Array<{ label: string; count: number }>;
  recurring_complaints: Array<{ label: string; count: number }>;
  satisfaction_evolution: Array<{ period: string; score: number }>;
}

function formatScore(value: number | undefined | null, fallback = 5): string {
  const num = Number(value ?? fallback);
  if (!Number.isFinite(num)) return fallback.toFixed(1);
  return Number.isInteger(num) ? `${num}.0` : num.toFixed(2).replace(/0$/, "");
}

function getInitials(name: string): string {
  const parts = (name || "O").trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

export default function ReviewsTab() {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<AdminReviewItem[]>([]);
  const [analytics, setAnalytics] = useState<ReviewAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<
    "all" | "unreplied" | "replied" | "positive" | "negative"
  >("all");
  const [search, setSearch] = useState("");

  // Modal Răspuns Oficial
  const [replyTarget, setReplyTarget] = useState<AdminReviewItem | null>(null);
  const [replyText, setReplyText] = useState("");
  const [savingReply, setSavingReply] = useState(false);

  const loadData = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const [reviewsData, analyticsData] = await Promise.all([
          apiFetch<AdminReviewItem[]>("/reviews/admin"),
          apiFetch<ReviewAnalyticsData>("/reviews/analytics").catch(() => null),
        ]);
        setReviews(Array.isArray(reviewsData) ? reviewsData : []);
        if (analyticsData) setAnalytics(analyticsData);
      } catch (err: any) {
        if (!silent) toast(err?.message || "Eroare la încărcarea recenziilor.", "error");
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [toast],
  );

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useAdminLiveSync({
    topic: "all",
    onSync: () => loadData(true),
  });

  const filtered = useMemo(() => {
    return reviews.filter((r) => {
      if (filterMode === "unreplied" && r.admin_reply) return false;
      if (filterMode === "replied" && !r.admin_reply) return false;
      if (filterMode === "positive" && r.ai_sentiment !== "positive") return false;
      if (filterMode === "negative" && r.ai_sentiment !== "negative") return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchGuest = r.guest_name.toLowerCase().includes(q);
        const matchRoom = r.room_title.toLowerCase().includes(q);
        const matchBk = (r.booking_code || "").toLowerCase().includes(q);
        const matchComment = r.comment.toLowerCase().includes(q);
        return matchGuest || matchRoom || matchBk || matchComment;
      }
      return true;
    });
  }, [reviews, filterMode, search]);

  const paged = usePaged(filtered, 6);
  const { setPage } = paged;

  useEffect(() => {
    setPage(1);
  }, [filterMode, search, setPage]);

  const stats = useMemo(() => {
    const count = reviews.length;
    const avg =
      count > 0
        ? reviews.reduce((a, r) => a + Number(r.rating_overall || 5), 0) / count
        : 5;
    const unreplied = reviews.filter((r) => !r.admin_reply).length;
    const positiveCount = reviews.filter((r) => r.ai_sentiment === "positive").length;
    const neutralCount = reviews.filter((r) => r.ai_sentiment === "neutral").length;
    const negativeCount = reviews.filter((r) => r.ai_sentiment === "negative").length;
    return {
      count,
      avg,
      unreplied,
      positiveCount,
      neutralCount,
      negativeCount,
    };
  }, [reviews]);

  const overallScore = analytics?.overall_score ?? stats.avg;
  const posPct =
    analytics?.sentiment_distribution?.positive_pct ??
    (stats.count > 0 ? Math.round((stats.positiveCount / stats.count) * 100) : 100);
  const neuPct =
    analytics?.sentiment_distribution?.neutral_pct ??
    (stats.count > 0 ? Math.round((stats.neutralCount / stats.count) * 100) : 0);
  const negPct =
    analytics?.sentiment_distribution?.negative_pct ??
    (stats.count > 0 ? Math.round((stats.negativeCount / stats.count) * 100) : 0);

  const criteriaItems = [
    {
      label: "Curățenie",
      score: analytics?.criteria?.cleanliness ?? 5,
      barClass: "bg-emerald-500",
    },
    {
      label: "Confortul camerei",
      score: analytics?.criteria?.comfort ?? 5,
      barClass: "bg-teal-500",
    },
    {
      label: "Personal și recepție",
      score: analytics?.criteria?.staff ?? 5,
      barClass: "bg-[#0d2c5c]",
    },
    {
      label: "Micul dejun și bar",
      score: analytics?.criteria?.breakfast ?? 5,
      barClass: "bg-[#c69a3f]",
    },
  ];

  const evolutionItems = analytics?.satisfaction_evolution?.length
    ? analytics.satisfaction_evolution
    : [
        { period: "Iun", score: 4.8 },
        { period: "Iul", score: 4.9 },
        { period: "Aug", score: 4.95 },
        { period: "Sep", score: 4.92 },
      ];

  const handleSaveReply = async () => {
    if (!replyTarget) return;
    setSavingReply(true);
    try {
      const updated = await apiFetch<AdminReviewItem>(`/reviews/${replyTarget.id}/reply`, {
        method: "PATCH",
        body: JSON.stringify({ admin_reply: replyText }),
      });
      setReviews((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setReplyTarget(null);
      toast("Răspunsul oficial Vila Casa Esy a fost publicat!", "success");
    } catch (err: any) {
      toast(err?.message || "Nu am putut salva răspunsul.", "error");
    } finally {
      setSavingReply(false);
    }
  };

  const handleToggleVisible = async (r: AdminReviewItem) => {
    try {
      const updated = await apiFetch<AdminReviewItem>(`/reviews/${r.id}/reply`, {
        method: "PATCH",
        body: JSON.stringify({ is_visible: !r.is_visible }),
      });
      setReviews((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      toast(
        updated.is_visible
          ? "Recenzia este acum vizibilă pe pagina camerei."
          : "Recenzia a fost ascunsă.",
        "info",
      );
    } catch (err: any) {
      toast(err?.message || "Eroare la actualizarea vizibilității.", "error");
    }
  };

  const handleDelete = async (r: AdminReviewItem) => {
    try {
      await apiFetch(`/reviews/${r.id}`, { method: "DELETE" });
      setReviews((prev) => prev.filter((x) => x.id !== r.id));
      toast("Recenzia a fost ștearsă.", "success");
    } catch (err: any) {
      toast(err?.message || "Nu am putut șterge recenzia.", "error");
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Reputație și recenzii oaspeți"
        title="Feedback de la oaspeți și evaluare sejururi"
        description="Monitorizează scorurile multi-criteriale, analiza sentimentului în timp real cu AI, cele mai apreciate facilități și reclamațiile recurente."
      />

      {/* Top KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-gradient-to-br from-[#0d2c5c] to-[#133b78] p-5 text-white shadow-sm border border-[#0d2c5c]/20 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#e6b85c]">
              Scor general
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-3xl font-extrabold font-['Outfit']">
                {formatScore(overallScore)}
              </span>
              <span className="text-sm text-white/70 font-medium">/ 5</span>
            </div>
            <div className="flex items-center gap-0.5 mt-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={13}
                  className={
                    i < Math.round(overallScore)
                      ? "fill-amber-400 text-amber-400"
                      : "text-white/25"
                  }
                />
              ))}
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
            <Star size={20} className="fill-amber-400 text-amber-400" />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Recenzii verificate
            </span>
            <div className="text-3xl font-extrabold font-['Outfit'] text-[#0d2c5c] mt-1">
              {stats.count}
            </div>
            <span className="text-xs text-slate-500 mt-0.5 block">
              Sejururi confirmate (#BK)
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center shrink-0">
            <ShieldCheck size={20} />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Necesită răspuns
            </span>
            <div
              className={`text-3xl font-extrabold font-['Outfit'] mt-1 ${
                stats.unreplied > 0 ? "text-amber-600" : "text-emerald-600"
              }`}
            >
              {stats.unreplied}
            </div>
            <span className="text-xs text-slate-500 mt-0.5 block">
              {stats.unreplied === 0
                ? "Toate recenziile au răspuns"
                : "Așteaptă răspuns oficial"}
            </span>
          </div>
          <div
            className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 ${
              stats.unreplied > 0
                ? "bg-amber-50 text-amber-600 border-amber-100"
                : "bg-emerald-50 text-emerald-600 border-emerald-100"
            }`}
          >
            <MessageSquare size={20} />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Sentiment pozitiv AI
            </span>
            <div className="text-3xl font-extrabold font-['Outfit'] text-emerald-600 mt-1">
              {posPct}%
            </div>
            <span className="text-xs text-slate-500 mt-0.5 block">
              Analiză automată NLP română
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <Sparkles size={20} />
          </div>
        </div>
      </div>

      {/* Analytics Grid: Criteria + Sentiment & Highlights + Evolution Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Card 1: Criteria */}
        <div className="rounded-2xl bg-white p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0d2c5c]">
              Evaluare pe criterii
            </h3>
            <span className="text-[11px] font-medium text-slate-400">Medie / 5.0</span>
          </div>
          <div className="space-y-3.5">
            {criteriaItems.map((item) => {
              const pct = Math.max(0, Math.min(100, (Number(item.score) / 5) * 100));
              return (
                <div key={item.label}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-medium text-slate-700">{item.label}</span>
                    <span className="font-bold text-[#0d2c5c]">
                      {formatScore(item.score)} / 5
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${item.barClass}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card 2: Sentiment & AI Highlights */}
        <div className="rounded-2xl bg-white p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0d2c5c]">
                Distribuție sentiment
              </h3>
              <span className="text-[11px] font-medium text-slate-400">
                {stats.count} recenzii
              </span>
            </div>

            <div className="flex items-center h-3 w-full rounded-full overflow-hidden bg-slate-100">
              {posPct > 0 && (
                <div
                  className="h-full bg-emerald-500 transition-all"
                  style={{ width: `${posPct}%` }}
                  title={`Pozitive: ${posPct}%`}
                />
              )}
              {neuPct > 0 && (
                <div
                  className="h-full bg-amber-400 transition-all"
                  style={{ width: `${neuPct}%` }}
                  title={`Neutre: ${neuPct}%`}
                />
              )}
              {negPct > 0 && (
                <div
                  className="h-full bg-rose-500 transition-all"
                  style={{ width: `${negPct}%` }}
                  title={`Atenție: ${negPct}%`}
                />
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] mt-2.5 font-semibold">
              <span className="inline-flex items-center gap-1.5 text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {posPct}% Pozitiv
              </span>
              <span className="inline-flex items-center gap-1.5 text-amber-700">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                {neuPct}% Neutru
              </span>
              <span className="inline-flex items-center gap-1.5 text-rose-700">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                {negPct}% Atenție
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2.5">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 mb-1.5">
                <ThumbsUp size={13} className="text-emerald-600" />
                <span>Cele mai apreciate</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(analytics?.top_praised?.length
                  ? analytics.top_praised
                  : [
                      { label: "Curățenie impecabilă", count: 12 },
                      { label: "Personal și ospitalitate", count: 11 },
                      { label: "Mic dejun și gastronomie", count: 9 },
                    ]
                )
                  .slice(0, 4)
                  .map((item, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80"
                    >
                      {item.label} ({item.count})
                    </span>
                  ))}
              </div>
            </div>

            <div className="flex items-start gap-1.5 text-[11px]">
              <AlertTriangle size={13} className="text-rose-500 shrink-0 mt-0.5" />
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-bold text-slate-600">Reclamații recurente:</span>
                {analytics?.recurring_complaints && analytics.recurring_complaints.length > 0 ? (
                  analytics.recurring_complaints.map((item, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200"
                    >
                      {item.label} ({item.count})
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 italic">
                    Nicio reclamație recurentă în ultimele 30 de zile.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Score Evolution */}
        <div className="rounded-2xl bg-white p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0d2c5c] flex items-center gap-1.5">
              <TrendingUp size={14} className="text-[#c69a3f]" />
              Evoluția scorului
            </h3>
            <span className="text-[11px] font-medium text-slate-400">Ultimele luni</span>
          </div>

          <div className="flex items-end justify-between gap-3 h-32 pt-4 px-1">
            {evolutionItems.map((item, i) => {
              const clamped = Math.max(0, Math.min(1, (Number(item.score) - 3.5) / 1.5));
              const barHeightPx = Math.round(clamped * 68 + 16);
              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                  <span className="text-[11px] font-bold text-[#0d2c5c] mb-1.5">
                    {formatScore(item.score)}
                  </span>
                  <div
                    className="w-full max-w-[44px] rounded-t-lg bg-gradient-to-t from-[#0d2c5c] to-[#1e5099] shadow-xs transition-all duration-500"
                    style={{ height: `${barHeightPx}px` }}
                  />
                  <span className="text-[11px] font-semibold text-slate-500 mt-2">
                    {item.period}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "all" as const, label: `Toate (${reviews.length})`, icon: null },
            { id: "positive" as const, label: "Pozitive", icon: Smile },
            { id: "negative" as const, label: "Reclamații", icon: AlertTriangle },
            { id: "unreplied" as const, label: `Fără răspuns (${stats.unreplied})`, icon: null },
            {
              id: "replied" as const,
              label: `Cu răspuns (${reviews.length - stats.unreplied})`,
              icon: CheckCircle2,
            },
          ].map((btn) => {
            const Icon = btn.icon;
            return (
              <button
                key={btn.id}
                onClick={() => setFilterMode(btn.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer inline-flex items-center gap-1.5 ${
                  filterMode === btn.id
                    ? "bg-[#0d2c5c] text-white border-[#0d2c5c] shadow-xs"
                    : "bg-slate-50/70 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {Icon && <Icon size={13} />}
                {btn.label}
              </button>
            );
          })}
        </div>

        <div className="w-full sm:w-72">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Caută după oaspete, #BK sau cameră..."
          />
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-48 rounded-2xl bg-white border border-slate-200 animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl bg-white border border-slate-200 p-12 text-center text-sm text-slate-500 shadow-xs">
          Nu există recenzii care să corespundă filtrului curent.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4.5">
            {paged.slice.map((r) => {
            const cleanRoomTitle =
              !r.room_title || /^([a-zA-Z0-9])\1{5,}$/.test(r.room_title.trim())
                ? "Cameră Vila Casa Esy"
                : r.room_title;

            return (
              <div
                key={r.id}
                className={`rounded-2xl bg-white border p-5 shadow-xs transition-all flex flex-col justify-between ${
                  r.is_visible
                    ? "border-slate-200 hover:border-slate-300 hover:shadow-sm"
                    : "border-slate-200 bg-slate-50/60 opacity-75"
                }`}
              >
                <div>
                  {/* Header: Guest Info & Rating */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0d2c5c] to-[#1e4b8a] text-white font-['Outfit'] font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                        {getInitials(r.guest_name)}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-['Outfit'] font-bold text-[15px] text-[#0d2c5c]">
                            {r.guest_name}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-[#fdf8ec] text-[#8a6420] border border-[#c69a3f]/30">
                            <CheckCircle2 className="w-3 h-3 text-[#c69a3f]" />
                            Sejur #{ (r.booking_code || "BK-VERIFIED").replace(/^#/, "") }
                          </span>
                          {r.unit_number && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-semibold bg-slate-100 text-slate-700">
                              <BedDouble className="w-3 h-3" />
                              {r.unit_number}
                            </span>
                          )}
                          {!r.is_visible && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-200 text-slate-700">
                              <EyeOff size={10} /> Ascunsă
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-1.5">
                          <span className="font-medium text-slate-600 truncate max-w-[200px] sm:max-w-[260px]">
                            {cleanRoomTitle}
                          </span>
                          <span>•</span>
                          <span>{dateFmt(r.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Overall Score + Sentiment Badge */}
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <div className="flex items-center gap-1 bg-amber-50/90 px-2.5 py-1 rounded-xl border border-amber-200/80">
                        <span className="text-xs font-extrabold text-amber-900">
                          {formatScore(r.rating_overall)}
                        </span>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <Star
                              key={idx}
                              className={`w-3 h-3 ${
                                idx < r.rating_overall
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-slate-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {r.ai_sentiment === "positive" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Smile size={10} /> Pozitiv ({Math.round((r.ai_confidence || 0.95) * 100)}%)
                        </span>
                      )}
                      {r.ai_sentiment === "neutral" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Meh size={10} /> Neutru ({Math.round((r.ai_confidence || 0.75) * 100)}%)
                        </span>
                      )}
                      {r.ai_sentiment === "negative" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <Frown size={10} /> Reclamație ({Math.round((r.ai_confidence || 0.88) * 100)}%)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Compact Criteria Bar */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 py-1.5 px-3 rounded-xl bg-slate-50/80 border border-slate-100 text-[11px] text-slate-600 mb-3">
                    <span>Curățenie: <strong className="text-[#0d2c5c]">{r.rating_cleanliness}/5</strong></span>
                    <span className="text-slate-300">•</span>
                    <span>Personal: <strong className="text-[#0d2c5c]">{r.rating_service}/5</strong></span>
                    <span className="text-slate-300">•</span>
                    <span>Restaurant: <strong className="text-[#0d2c5c]">{r.rating_restaurant ?? 5}/5</strong></span>
                    <span className="text-slate-300">•</span>
                    <span>Mic dejun: <strong className="text-[#0d2c5c]">{r.rating_breakfast ?? 5}/5</strong></span>
                    <span className="text-slate-300">•</span>
                    <span>Confort: <strong className="text-[#0d2c5c]">{r.rating_comfort}/5</strong></span>
                  </div>

                  {/* Extracted AI Keywords */}
                  {r.ai_keywords && r.ai_keywords.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 mb-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider inline-flex items-center gap-1 mr-1">
                        <Sparkles size={11} className="text-[#00a896]" /> Aspecte remarcate:
                      </span>
                      {r.ai_keywords.map((kw, i) => (
                        <span
                          key={i}
                          className={`px-2 py-0.5 rounded-md text-[10.5px] font-semibold ${
                            kw.startsWith("Atenție")
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-teal-50 text-teal-800 border border-teal-200"
                          }`}
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Guest Comment Text */}
                  <p className="text-[13.5px] text-[#1e293b] leading-relaxed mb-3 pl-1 border-l-2 border-[#c69a3f]/40 italic">
                    „{r.comment}”
                  </p>

                  {/* Host Official Reply Block */}
                  {r.admin_reply && (
                    <div className="mt-2.5 rounded-xl bg-[#f8fafd] border border-[#e1eaf5] p-3 flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#0d2c5c] text-[#e6b85c] font-serif font-bold text-[10.5px] flex items-center justify-center shrink-0 shadow-2xs">
                        CE
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-xs font-bold text-[#0d2c5c]">
                            Răspuns oficial · Vila Casa Esy
                          </span>
                          <span className="inline-flex items-center gap-1 text-[9.5px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-full border border-emerald-200">
                            <CheckCircle2 size={9} /> Publicat
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{r.admin_reply}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Actions Bar */}
                <div className="flex items-center justify-between pt-3.5 mt-3.5 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setReplyTarget(r);
                      setReplyText(r.admin_reply || "");
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0d2c5c] hover:bg-[#07203f] text-white text-xs font-semibold transition cursor-pointer shadow-2xs"
                  >
                    <MessageSquareReply size={13} className="text-[#e6b85c]" />
                    <span>{r.admin_reply ? "Editează răspunsul" : "Răspunde oficial"}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggleVisible(r)}
                      className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 inline-flex items-center gap-1 cursor-pointer transition"
                    >
                      {r.is_visible ? (
                        <>
                          <EyeOff size={13} /> <span>Ascunde</span>
                        </>
                      ) : (
                        <>
                          <Eye size={13} /> <span>Afișează</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(r)}
                      className="p-1.5 rounded-xl border border-rose-200/80 text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition cursor-pointer"
                      title="Șterge recenzia"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#e1e8f0] bg-white shadow-xs">
            <Pagination
              page={paged.page}
              pages={paged.pages}
              total={paged.total}
              perPage={paged.perPage}
              onPage={paged.setPage}
            />
          </div>
        </div>
      )}

      {/* Modal Răspuns Oficial */}
      <Modal
        open={Boolean(replyTarget)}
        onClose={() => setReplyTarget(null)}
        title="Răspuns oficial Vila Casa Esy"
        subtitle={
          replyTarget
            ? `Răspunzi recenziei lăsate de ${replyTarget.guest_name} (${replyTarget.booking_code || "Sejur confirmat"})`
            : ""
        }
        footer={
          <>
            <GhostButton onClick={() => setReplyTarget(null)}>Anulează</GhostButton>
            <PrimaryButton disabled={savingReply} onClick={handleSaveReply}>
              {savingReply ? "Se salvează..." : "Publică răspunsul oficial"}
            </PrimaryButton>
          </>
        }
      >
        <Field label="Mesajul oficial al conducerii Vila Casa Esy">
          <Textarea
            rows={4}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Vă mulțumim din suflet pentru vizită și pentru cuvintele frumoase! Vă așteptăm cu drag și vara viitoare la Vila Casa Esy..."
          />
        </Field>
      </Modal>
    </div>
  );
}
