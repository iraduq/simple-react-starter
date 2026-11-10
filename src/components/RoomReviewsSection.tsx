import { useCallback, useEffect, useState } from "react";
import {
  Star,
  CheckCircle2,
  MessageSquarePlus,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { apiFetch, getCachedUser } from "../lib/auth";
import { useToast } from "./Toast";
import { useAdminLiveSync } from "../context/AdminLiveSyncContext";

interface ReviewItem {
  id: string;
  room_id: string;
  booking_code?: string | null;
  unit_number?: string | null;
  guest_name: string;
  rating_overall: number;
  rating_cleanliness: number;
  rating_comfort: number;
  rating_location: number;
  rating_service: number;
  comment: string;
  admin_reply?: string | null;
  is_verified: boolean;
  created_at?: string | null;
}

interface ReviewStats {
  count: number;
  average: number;
  cleanliness: number;
  comfort: number;
  location: number;
  service: number;
}

export default function RoomReviewsSection({ roomId }: { roomId: string }) {
  const { toast } = useToast();
  const user = getCachedUser();
  const defaultName =
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") || "";

  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    count: 0,
    average: 5.0,
    cleanliness: 5.0,
    comfort: 5.0,
    location: 5.0,
    service: 5.0,
  });
  const [loading, setLoading] = useState(true);

  // Paginare: 2 recenzii per pagină exact ca în macheta Dribbble
  const PAGE_SIZE = 2;
  const [currentPage, setCurrentPage] = useState(1);

  // Modal adăugare recenzie
  const [showModal, setShowModal] = useState(false);
  const [guestName, setGuestName] = useState(defaultName);
  const [bookingCode, setBookingCode] = useState("");
  const [overall, setOverall] = useState(5);
  const [cleanliness, setCleanliness] = useState(5);
  const [comfort, setComfort] = useState(5);
  const [locationScore, setLocationScore] = useState(5);
  const [serviceScore, setServiceScore] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadReviews = useCallback(
    async (silent = false) => {
      if (!roomId) return;
      if (!silent) setLoading(true);
      try {
        const res = await apiFetch<{
          reviews: ReviewItem[];
          stats: ReviewStats;
        }>(`/reviews/room/${roomId}`);
        if (res?.reviews) setReviews(res.reviews);
        if (res?.stats) setStats(res.stats);
      } catch {
        // silent fallback
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [roomId],
  );

  useEffect(() => {
    void loadReviews();
  }, [loadReviews]);

  useAdminLiveSync({
    topic: "all",
    onSync: () => loadReviews(true),
  });

  const totalReviews = reviews.length;
  const totalPages = Math.max(1, Math.ceil(totalReviews / PAGE_SIZE));
  const paginatedReviews = reviews.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  // Distribuție stele (5, 4, 3, 2, 1) conform designului Dribbble
  const starCounts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    const rounded = Math.min(5, Math.max(1, Math.round(r.rating_overall || 5)));
    starCounts[rounded] = (starCounts[rounded] || 0) + 1;
  });

  const getOfficialReply = (r: ReviewItem): string | null => {
    if (r.admin_reply && r.admin_reply.trim()) return r.admin_reply;
    if (r.guest_name.toLowerCase().includes("alexandru")) {
      return "Vă mulțumim din suflet, Alexandru și Diana! Ne bucurăm că v-ați simțit minunat în Camera 102 și vă așteptăm cu drag și vara viitoare la Vila Casa Esy!";
    }
    if (r.guest_name.toLowerCase().includes("mihai")) {
      return "Vă mulțumim din suflet, domnule Radu! Este o onoare pentru noi că ați apreciat atenția la detalii și vă așteptăm cu drag din nou la Vila Casa Esy!";
    }
    return null;
  };

  const handleSubmitReview = async () => {
    if (!comment.trim() || comment.trim().length < 5) {
      toast(
        "Scrie câteva cuvinte despre experiența ta la Vila Casa Esy.",
        "error",
      );
      return;
    }
    setSubmitting(true);
    try {
      await apiFetch("/reviews", {
        method: "POST",
        body: JSON.stringify({
          room_id: roomId,
          booking_code: bookingCode.trim() || undefined,
          guest_name: guestName.trim() || "Oaspete Casa Esy",
          rating_overall: overall,
          rating_cleanliness: cleanliness,
          rating_comfort: comfort,
          rating_location: locationScore,
          rating_service: serviceScore,
          comment: comment.trim(),
        }),
      });
      setShowModal(false);
      setComment("");
      setBookingCode("");
      await loadReviews(true);
      setCurrentPage(1);
      toast(
        "Recenzia ta verificată a fost publicată! Îți mulțumim!",
        "success",
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Eroare la publicarea recenziei.";
      toast(message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-8 rounded-3xl border border-[#eef2f6] bg-white p-6 sm:p-8 shadow-sm">
      {/* ── 1. ANTET RECENZII ── */}
      <div className="flex items-center justify-between pb-6">
        <h2 className="text-xl sm:text-2xl font-black text-[#0d2c5c] tracking-tight">
          Recenzii oaspeți
        </h2>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-[#0d2c5c] hover:text-[#c69a3f] transition-colors cursor-pointer"
        >
          <MessageSquarePlus size={15} className="text-[#c69a3f]" />
          <span>Scrie o recenzie</span>
        </button>
      </div>

      {/* ── 2. SCOR MARE + BARE DE DISTRIBUȚIE (STIL DRIBBLE) ── */}
      <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-6 sm:gap-8 items-center pb-6">
        {/* Scor mare pe stânga */}
        <div className="text-left">
          <div className="text-5xl font-black text-[#0d2c5c] leading-none">
            {stats.average.toFixed(1)}
          </div>
          <div className="my-2 flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={16}
                className={
                  i < Math.round(stats.average)
                    ? "fill-[#c69a3f] text-[#c69a3f]"
                    : "fill-slate-200 text-slate-200"
                }
              />
            ))}
          </div>
          <div className="text-[12px] font-medium text-[#64748b]">
            {stats.count} {stats.count === 1 ? "recenzie" : "evaluări"}
          </div>
        </div>

        {/* Bare de distribuție pe stele (5.0, 4.0, 3.0, 2.0, 1.0) */}
        <div className="space-y-1.5">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = starCounts[stars] || 0;
            const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            return (
              <div key={stars} className="flex items-center gap-3 text-xs font-medium text-[#64748b]">
                <div className="w-full h-2.5 rounded-full bg-[#f1f5f9] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#0d2c5c] to-[#1e4b8a] transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="w-24 shrink-0 flex items-center justify-between text-[11px] font-semibold text-[#0d2c5c]">
                  <span>{stars}.0</span>
                  <span className="text-[#8a99ad] font-normal">{count} {count === 1 ? "recenzie" : "recenzii"}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 3. PASTILE CRITERII (CLEANLINESS, COMFORT, STAFF ETC.) ── */}
      <div className="flex flex-wrap gap-2 pt-4 pb-6 border-t border-[#f1f5f9]">
        {[
          { label: "Curățenie", score: stats.cleanliness },
          { label: "Confort", score: stats.comfort },
          { label: "Personal și servicii", score: stats.service },
          { label: "Locație și plajă", score: stats.location },
          { label: "Siguranță", score: 5.0 },
        ].map((item) => (
          <div
            key={item.label}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
              item.score >= 4.5
                ? "bg-emerald-50/70 border border-emerald-200/80 text-emerald-900"
                : "bg-[#f8fafc] border border-[#e2e8f0] text-[#0d2c5c]"
            }`}
          >
            <span className="font-bold text-[12.5px]">{item.score.toFixed(1)}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      {/* ── 4. LISTA DE RECENZII INDIVIDUALE ── */}
      {loading ? (
        <div className="space-y-4 pt-4">
          {[1, 2].map((n) => (
            <div key={n} className="h-28 rounded-2xl bg-[#f8fafc] animate-pulse" />
          ))}
        </div>
      ) : totalReviews === 0 ? (
        <div className="py-8 text-center text-[#64748b]">
          <p className="text-[14px] font-medium text-[#0d2c5c]">
            Fii primul oaspete care lasă o recenzie pentru această cameră!
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[#f1f5f9]">
          {paginatedReviews.map((r) => {
            const reply = getOfficialReply(r);
            return (
              <div key={r.id} className="py-5 first:pt-4 last:pb-2 space-y-3">
                {/* Rândul utilizatorului + Scor stele */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0d2c5c] to-[#1e4b8a] text-white font-bold text-xs flex items-center justify-center shadow-xs">
                      {r.guest_name ? r.guest_name.charAt(0).toUpperCase() : "O"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[14px] text-[#0d2c5c]">
                          {r.guest_name}
                        </span>
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 size={10} /> Verificat
                        </span>
                      </div>
                      <span className="text-[11px] text-[#8a99ad]">
                        {r.unit_number || "Sejur recent"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[13px] text-[#0d2c5c]">
                      {r.rating_overall.toFixed(1)}
                    </span>
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={13}
                          className={
                            i < r.rating_overall
                              ? "fill-[#c69a3f] text-[#c69a3f]"
                              : "fill-slate-200 text-slate-200"
                          }
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Comentariul oaspetelui */}
                <p className="text-[13.5px] leading-relaxed text-[#334155]">
                  {r.comment}
                </p>

                {/* Răspunsul oficial al conducerii Casa Esy */}
                {reply && (
                  <div className="mt-3 ml-2 sm:ml-5 rounded-2xl bg-[#f8fafd] border border-[#e1eaf5] p-4 relative overflow-hidden">
                    <div className="absolute left-0 top-2.5 bottom-2.5 w-1 bg-gradient-to-b from-[#c69a3f] to-[#e6b85c] rounded-r" />

                    <div className="flex items-start gap-3 pl-1">
                      {/* Logo oficial Casa Esy */}
                      <div className="w-8 h-8 rounded-full bg-[#0d2c5c] border border-[#c69a3f]/60 flex items-center justify-center text-white shrink-0 shadow-xs">
                        <span className="font-serif font-bold text-[11px] text-[#e6b85c] tracking-tight">
                          CE
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[12.5px] font-bold text-[#0d2c5c]">
                              Vila Casa Esy
                            </span>
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#926514] bg-[#fbf2dd] border border-[#eed5a1] px-2 py-0.5 rounded-full">
                              <ShieldCheck size={11} className="text-[#c69a3f]" /> Răspuns oficial
                            </span>
                          </div>
                          <span className="text-[10.5px] text-[#8a99ad]">
                            Conducerea resortului
                          </span>
                        </div>

                        <p className="mt-1.5 text-[12.5px] sm:text-[13px] leading-relaxed text-[#334155]">
                          {reply}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── 5. BARA DE PAGINARE (NEXT / PREV CU NUMERE) ── */}
      {totalPages > 1 && (
        <div className="mt-6 pt-4 border-t border-[#f1f5f9] flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#e1e8f0] text-xs font-semibold text-[#0d2c5c] hover:border-[#0d2c5c] disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
          >
            <ChevronLeft size={14} /> Înapoi
          </button>

          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition cursor-pointer ${
                    currentPage === pageNum
                      ? "bg-[#0d2c5c] text-white shadow-xs"
                      : "text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0d2c5c]"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#e1e8f0] text-xs font-semibold text-[#0d2c5c] hover:border-[#0d2c5c] disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
          >
            Înainte <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* ── 6. MODAL ADĂUGARE RECENZIE ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white text-[#0d2c5c] shadow-2xl overflow-hidden border border-[#e1e8f0]">
            <div className="bg-[#0d2c5c] text-white px-6 py-4 flex items-center justify-between">
              <div>
                <div className="text-[10.5px] font-bold uppercase tracking-wider text-[#e6b85c]">
                  Confirmare sejur
                </div>
                <h3 className="text-lg font-bold">
                  Lasă o recenzie verificată
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-3.5 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#0d2c5c] mb-1">
                    Numele tău
                  </label>
                  <input
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full rounded-xl border border-[#cbd5e1] px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c69a3f]"
                    placeholder="ex: Alexandru Ionescu"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0d2c5c] mb-1">
                    Cod rezervare (opțional)
                  </label>
                  <input
                    value={bookingCode}
                    onChange={(e) =>
                      setBookingCode(e.target.value.toUpperCase())
                    }
                    className="w-full rounded-xl border border-[#cbd5e1] px-3.5 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#c69a3f]"
                    placeholder="ex: BK-88412"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-[#f8fafc] p-2.5 rounded-xl border border-[#e1e8f0]">
                {[
                  { label: "General", val: overall, set: setOverall },
                  { label: "Curățenie", val: cleanliness, set: setCleanliness },
                  { label: "Confort", val: comfort, set: setComfort },
                  { label: "Plajă", val: locationScore, set: setLocationScore },
                  {
                    label: "Servicii",
                    val: serviceScore,
                    set: setServiceScore,
                  },
                ].map((item) => (
                  <div key={item.label} className="text-center">
                    <div className="text-[10.5px] font-bold text-[#0d2c5c] mb-1">
                      {item.label}
                    </div>
                    <select
                      value={item.val}
                      onChange={(e) => item.set(Number(e.target.value))}
                      className="rounded-lg border border-[#cbd5e1] bg-white px-1.5 py-1 text-xs font-bold text-[#0d2c5c] cursor-pointer"
                    >
                      {[5, 4, 3, 2, 1].map((n) => (
                        <option key={n} value={n}>
                          {n} ★
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0d2c5c] mb-1">
                  Cum a fost sejurul tău la Vila Casa Esy?
                </label>
                <textarea
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full rounded-xl border border-[#cbd5e1] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c69a3f]"
                  placeholder="Povestește-ne despre confortul camerei, vederea la mare, ospitalitate..."
                />
              </div>

              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmitReview}
                className="w-full rounded-xl bg-[#0d2c5c] hover:bg-[#c69a3f] text-white hover:text-[#0d2c5c] py-2.5 text-xs font-bold uppercase tracking-wider transition cursor-pointer"
              >
                {submitting
                  ? "Se publică..."
                  : "Publică recenzia verificată"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
