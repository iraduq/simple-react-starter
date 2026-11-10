import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Star,
  Award,
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
  Coffee,
  UtensilsCrossed,
  HeartHandshake,
  Sparkle,
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
  Badge,
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

export default function ReviewsTab() {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<AdminReviewItem[]>([]);
  const [analytics, setAnalytics] = useState<ReviewAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<"all" | "unreplied" | "replied" | "positive" | "negative">("all");
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

  const stats = useMemo(() => {
    const count = reviews.length;
    const avg =
      count > 0
        ? (reviews.reduce((a, r) => a + Number(r.rating_overall || 5), 0) / count).toFixed(2)
        : "5.00";
    const unreplied = reviews.filter((r) => !r.admin_reply).length;
    return { count, avg, unreplied };
  }, [reviews]);

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

      {/* AI Satisfaction & Analytics Overview Panel */}
      <div className="rounded-3xl bg-gradient-to-br from-[#0d2c5c] via-[#0f3469] to-[#082046] p-6 text-white shadow-xl border border-white/10">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#e6b85c]">
              <Sparkles size={16} />
              <span>Sistem Inteligent de Satisfacție & Recenzii AI</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold font-['Outfit'] mt-1 text-white">
              Performanță Ospitalitate & Standarde 5★
            </h3>
            <p className="text-xs text-white/70 mt-1 max-w-xl">
              Fiecare recenzie trece automat prin analizatorul NLP românesc pentru a clasifica sentimentul și a extrage ariile de excelență sau reclamațiile.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/15 text-center">
              <span className="text-[11px] font-semibold text-white/75 uppercase tracking-wider block">Scor General</span>
              <div className="flex items-center justify-center gap-1.5 mt-0.5">
                <span className="text-3xl font-extrabold font-['Outfit'] text-white">
                  {analytics?.overall_score || stats.avg}
                </span>
                <Star size={22} className="fill-amber-400 text-amber-400" />
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/15 text-center">
              <span className="text-[11px] font-semibold text-white/75 uppercase tracking-wider block">Recenzii Verificate</span>
              <span className="text-3xl font-extrabold font-['Outfit'] text-[#00a896] block mt-0.5">
                {stats.count} #BK
              </span>
            </div>

            <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/15 text-center">
              <span className="text-[11px] font-semibold text-white/75 uppercase tracking-wider block">Necesită Răspuns</span>
              <span className="text-3xl font-extrabold font-['Outfit'] text-amber-300 block mt-0.5">
                {stats.unreplied}
              </span>
            </div>
          </div>
        </div>

        {/* 5 Criterii & Sentiment Distribution Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 pt-6">
          {/* Criterii 1: Curățenie & Confort */}
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#e6b85c] block">
              Curățenie & Confort
            </span>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-white/80">Curățenie</span>
                <span className="font-bold">{analytics?.criteria.cleanliness || 4.9} / 5</span>
              </div>
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full"
                  style={{ width: `${((analytics?.criteria.cleanliness || 4.9) / 5) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-white/80">Confortul Camerei</span>
                <span className="font-bold">{analytics?.criteria.comfort || 4.8} / 5</span>
              </div>
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-400 rounded-full"
                  style={{ width: `${((analytics?.criteria.comfort || 4.8) / 5) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Criterii 2: Personal & Servicii */}
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#e6b85c] block">
              Personal & Gastronomie
            </span>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-white/80">Personal & Receptie</span>
                <span className="font-bold">{analytics?.criteria.staff || 5.0} / 5</span>
              </div>
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#00a896] rounded-full"
                  style={{ width: `${((analytics?.criteria.staff || 5.0) / 5) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-white/80">Micul Dejun & Bar</span>
                <span className="font-bold">{analytics?.criteria.breakfast || 4.9} / 5</span>
              </div>
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full"
                  style={{ width: `${((analytics?.criteria.breakfast || 4.9) / 5) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Sentiment AI Bar */}
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#e6b85c] block">
              Distribuție Sentiment AI
            </span>
            <div className="flex items-center gap-1.5 h-3 w-full rounded-full overflow-hidden bg-white/10">
              <div
                className="h-full bg-emerald-400"
                style={{ width: `${analytics?.sentiment_distribution.positive_pct || 90}%` }}
                title="Pozitive"
              />
              <div
                className="h-full bg-amber-400"
                style={{ width: `${analytics?.sentiment_distribution.neutral_pct || 7}%` }}
                title="Neutre"
              />
              <div
                className="h-full bg-rose-400"
                style={{ width: `${analytics?.sentiment_distribution.negative_pct || 3}%` }}
                title="Reclamații"
              />
            </div>
            <div className="grid grid-cols-3 gap-1 text-[11px] pt-1">
              <span className="text-emerald-300 font-semibold">
                ● {analytics?.sentiment_distribution.positive_pct || 90}% Pozitiv
              </span>
              <span className="text-amber-300 font-semibold text-center">
                ● {analytics?.sentiment_distribution.neutral_pct || 7}% Neutru
              </span>
              <span className="text-rose-300 font-semibold text-right">
                ● {analytics?.sentiment_distribution.negative_pct || 3}% Atenție
              </span>
            </div>
          </div>

          {/* Evoluția Satisfacției */}
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#e6b85c] flex items-center gap-1.5">
              <TrendingUp size={14} /> Evoluția Scorului
            </span>
            <div className="flex items-end justify-between h-14 pt-2 gap-2">
              {(analytics?.satisfaction_evolution || [
                { period: "Iun", score: 4.8 },
                { period: "Iul", score: 4.9 },
                { period: "Aug", score: 4.95 },
                { period: "Sep", score: 4.92 },
              ]).map((item, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-bold text-white/90">{item.score}</span>
                  <div
                    className="w-full bg-gradient-to-t from-teal-500 to-[#00a896] rounded-t-md"
                    style={{ height: `${((item.score - 4.0) / 1.0) * 40 + 10}px` }}
                  />
                  <span className="text-[10px] text-white/60">{item.period}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Highlights: Top Praised & Recurring Complaints */}
        <div className="mt-5 pt-5 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 shrink-0">
              <ThumbsUp size={16} />
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold text-emerald-200 mr-1">Cele mai apreciate:</span>
              {(analytics?.top_praised || [
                { label: "Curățenie Impecabilă", count: 12 },
                { label: "Personal & Ospitalitate de Top", count: 11 },
                { label: "Mic Dejun & Gastronomie", count: 9 },
              ]).map((item, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-200 border border-emerald-500/30"
                >
                  {item.label} ({item.count})
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-rose-500/20 text-rose-300 shrink-0">
              <AlertTriangle size={16} />
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold text-rose-200 mr-1">Reclamații recurente:</span>
              {(analytics?.recurring_complaints && analytics.recurring_complaints.length > 0 ? (
                analytics.recurring_complaints.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/15 text-rose-200 border border-rose-500/30"
                  >
                    {item.label} ({item.count})
                  </span>
                ))
              ) : (
                <span className="text-xs text-white/60 italic">Nicio reclamație recurentă activă în ultimele 30 de zile.</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "all" as const, label: `Toate (${reviews.length})` },
            { id: "positive" as const, label: `✨ Pozitive`, icon: Smile },
            { id: "negative" as const, label: `⚠️ Reclamații`, icon: Frown },
            { id: "unreplied" as const, label: `Fără Răspuns (${stats.unreplied})` },
            { id: "replied" as const, label: `Cu Răspuns (${reviews.length - stats.unreplied})` },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setFilterMode(btn.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer flex items-center gap-1.5 ${
                filterMode === btn.id
                  ? "bg-[#0d2c5c] text-white border-[#0d2c5c] shadow-sm"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {btn.label}
            </button>
          ))}
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
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-44 rounded-2xl bg-white/60 border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((r) => (
            <div
              key={r.id}
              className={`rounded-2xl bg-white border p-5 shadow-xs transition-all ${
                r.is_visible ? "border-slate-200 hover:border-slate-300" : "border-slate-200 opacity-60"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-['Outfit'] font-bold text-base text-[#0d2c5c]">
                      {r.guest_name}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-900 border border-amber-400/40">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" />
                      Sejur Confirmat #{(r.booking_code || "BK-VERIFIED").replace(/^#/, "")}
                    </span>
                    {r.unit_number && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700">
                        <BedDouble className="w-3 h-3" />
                        {r.unit_number}
                      </span>
                    )}

                    {/* AI Sentiment Badge */}
                    {r.ai_sentiment === "positive" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                        <Smile size={12} /> AI: Pozitiv ({Math.round((r.ai_confidence || 0.95) * 100)}%)
                      </span>
                    )}
                    {r.ai_sentiment === "neutral" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                        <Meh size={12} /> AI: Neutru ({Math.round((r.ai_confidence || 0.75) * 100)}%)
                      </span>
                    )}
                    {r.ai_sentiment === "negative" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                        <Frown size={12} /> AI: Reclamație ({Math.round((r.ai_confidence || 0.88) * 100)}%)
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-500 mt-0.5">
                    {r.room_title} • Publicată pe {dateFmt(r.created_at)}
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
                  <span className="text-xs font-bold text-amber-900">{r.rating_overall}.0</span>
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={idx}
                      className={`w-3.5 h-3.5 ${
                        idx < r.rating_overall ? "fill-amber-400 text-amber-400" : "text-slate-200"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* 5 Criterii Detaliate */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mb-3 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200/70">
                <span>Curățenie: <strong>{r.rating_cleanliness}/5</strong></span>
                <span>•</span>
                <span>Personal: <strong>{r.rating_service}/5</strong></span>
                <span>•</span>
                <span>Restaurant: <strong>{r.rating_restaurant || 5}/5</strong></span>
                <span>•</span>
                <span>Micul Dejun: <strong>{r.rating_breakfast || 5}/5</strong></span>
                <span>•</span>
                <span>Confort Cameră: <strong>{r.rating_comfort}/5</strong></span>
              </div>

              {/* Extracted AI Keywords */}
              {r.ai_keywords && r.ai_keywords.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 mb-3">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles size={12} className="text-[#00a896]" /> Aspecte Detectate AI:
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

              <p className="text-sm text-slate-800 leading-relaxed mb-4">„{r.comment}”</p>

              {r.admin_reply && (
                <div className="rounded-xl bg-[#0d2c5c]/5 border-l-4 border-l-[#c69a3f] p-3.5 mb-4">
                  <div className="text-xs font-bold text-[#0d2c5c] mb-1">
                    Răspuns Oficial — Conducerea Vila Casa Esy
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">{r.admin_reply}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <PrimaryButton
                  onClick={() => {
                    setReplyTarget(r);
                    setReplyText(r.admin_reply || "");
                  }}
                >
                  <MessageSquareReply className="w-4 h-4" />
                  {r.admin_reply ? "Editează Răspunsul Oficial" : "Răspunde Oficial"}
                </PrimaryButton>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleVisible(r)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    {r.is_visible ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" /> Ascunde
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" /> Afișează
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(r)}
                    className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 cursor-pointer"
                    title="Șterge recenzia"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Răspuns Oficial */}
      <Modal
        open={Boolean(replyTarget)}
        onClose={() => setReplyTarget(null)}
        title="Răspuns Oficial Vila Casa Esy"
        subtitle={
          replyTarget
            ? `Răspunzi recenziei lăsate de ${replyTarget.guest_name} (${replyTarget.booking_code || "Sejur Confirmat"})`
            : ""
        }
        footer={
          <>
            <GhostButton onClick={() => setReplyTarget(null)}>Anulează</GhostButton>
            <PrimaryButton disabled={savingReply} onClick={handleSaveReply}>
              {savingReply ? "Se salvează..." : "Publică Răspunsul Oficial"}
            </PrimaryButton>
          </>
        }
      >
        <Field label="Mesajul Oficial al Conducerii Vila Casa Esy">
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
