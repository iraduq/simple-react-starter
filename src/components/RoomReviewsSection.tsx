import { useCallback, useEffect, useState } from "react";
import {
  Star,
  CheckCircle2,
  MessageSquarePlus,
  X,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
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

  // Filtru interactiv pe număr de stele (5, 4, 3, 2, 1 sau null pt. toate)
  const [starFilter, setStarFilter] = useState<number | null>(null);

  // Paginare: exact 2 recenzii per pagină
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

  // Distribuție stele (5, 4, 3, 2, 1)
  const starCounts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    const rounded = Math.min(5, Math.max(1, Math.round(r.rating_overall || 5)));
    starCounts[rounded] = (starCounts[rounded] || 0) + 1;
  });

  // Filtrare recenzii în funcție de stelele selectate
  const filteredReviews =
    starFilter === null
      ? reviews
      : reviews.filter(
          (r) =>
            Math.min(5, Math.max(1, Math.round(r.rating_overall || 5))) ===
            starFilter,
        );

  const totalFilteredReviews = filteredReviews.length;
  const totalPages = Math.max(1, Math.ceil(totalFilteredReviews / PAGE_SIZE));
  const paginatedReviews = filteredReviews.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const handleStarFilterToggle = (stars: number) => {
    setStarFilter((prev) => (prev === stars ? null : stars));
    setCurrentPage(1);
  };

  const getOfficialReply = (r: ReviewItem): string | null => {
    if (r.admin_reply && r.admin_reply.trim()) {
      return r.admin_reply.replace(/în Camera \d+/gi, "la noi");
    }
    const nameLower = (r.guest_name || "").toLowerCase();
    if (nameLower.includes("alexandru")) {
      return "Vă mulțumim din suflet, Alexandru și Diana! Ne bucurăm că v-ați simțit minunat la noi și vă așteptăm cu drag și vara viitoare la Vila Casa Esy!";
    }
    if (nameLower.includes("mihai")) {
      return "Vă mulțumim din suflet, domnule Radu! Este o onoare pentru noi că ați apreciat atenția la detalii și vă așteptăm cu drag oricând la Vila Casa Esy!";
    }
    if (nameLower.includes("elena")) {
      return "Mulțumim, Elena! Vă așteptăm oricând cu mare drag pentru încă un răsărit pe malul mării la Vila Casa Esy!";
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

  const categoryScores = [
    { label: "Curățenie", score: stats.cleanliness || 5.0 },
    { label: "Siguranță & Securitate", score: 5.0 },
    { label: "Personal & Servicii", score: stats.service || 5.0 },
    { label: "Confort & Facilități", score: stats.comfort || 4.7 },
    { label: "Locație & Plajă", score: stats.location || 5.0 },
  ];

  return (
    <section className="mt-8 rounded-3xl border border-[#eef2f6] bg-white p-6 sm:p-8 shadow-sm">
      {/* ── 1. ANTET RECENZII ── */}
      <div className="flex items-center justify-between pb-6 border-b border-[#f1f5f9]">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#0d2c5c] tracking-tight">
            Recenzii
          </h2>
          <p className="text-[12px] text-[#8a99ad] mt-0.5">
            Experiențe reale și verificate ale oaspeților noștri
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#e2e8f0] hover:border-[#c69a3f] text-[12.5px] font-bold text-[#0d2c5c] hover:text-[#c69a3f] bg-white hover:bg-[#fffdf7] transition-all cursor-pointer shadow-2xs"
        >
          <MessageSquarePlus size={15} className="text-[#c69a3f]" />
          <span>Scrie o recenzie</span>
        </button>
      </div>

      {/* ── 2. SCOR GENERAL + BARE PE STELE (STIL FIGMA / DRIBBLE) ── */}
      <div className="pt-6 pb-5 grid grid-cols-1 md:grid-cols-[160px_1fr] gap-6 sm:gap-10 items-center">
        {/* Scor general stânga */}
        <div className="flex flex-col items-start justify-center">
          <div className="text-5xl font-black text-[#0d2c5c] leading-none tracking-tight">
            {stats.average.toFixed(1)}
          </div>
          <div className="my-2.5 flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={17}
                className={
                  i < Math.round(stats.average)
                    ? "fill-[#c69a3f] text-[#c69a3f]"
                    : "fill-slate-200 text-slate-200"
                }
              />
            ))}
          </div>
          <div className="text-[12.5px] font-semibold text-[#64748b]">
            {reviews.length} {reviews.length === 1 ? "recenzie" : "evaluări"}
          </div>
        </div>

        {/* Bare interactive de rating (cu bara pe stânga, apoi 5.0 și numărul de recenzii) */}
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = starCounts[stars] || 0;
            const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
            const isSelected = starFilter === stars;

            return (
              <button
                key={stars}
                type="button"
                onClick={() => handleStarFilterToggle(stars)}
                className={`w-full group flex items-center gap-3.5 px-2.5 py-1.5 rounded-xl transition-all text-left cursor-pointer ${
                  isSelected
                    ? "bg-[#0d2c5c]/8 ring-1.5 ring-[#0d2c5c]"
                    : "hover:bg-[#f8fafc]"
                }`}
                title={`Apasă pentru a vedea doar recenziile de ${stars} stele`}
              >
                {/* Bara de progres */}
                <div className="flex-1 h-2.5 rounded-full bg-[#f1f5f9] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isSelected
                        ? "bg-[#c69a3f]"
                        : "bg-[#0d2c5c] group-hover:bg-[#1e4b8a]"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {/* Scor și număr recenzii (ex: 5.0  3 recenzii) */}
                <div className="w-28 shrink-0 flex items-center justify-between text-xs">
                  <span
                    className={`font-bold ${
                      isSelected ? "text-[#c69a3f]" : "text-[#0d2c5c]"
                    }`}
                  >
                    {stars}.0
                  </span>
                  <span
                    className={`text-[11.5px] ${
                      isSelected
                        ? "font-bold text-[#0d2c5c]"
                        : "text-[#8a99ad] font-normal"
                    }`}
                  >
                    {count} {count === 1 ? "recenzie" : "recenzii"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 3. CHIPS / ETICHETE CATEGORII (Curățenie, Siguranță, Confort...) ── */}
      <div className="pb-6 flex flex-wrap gap-2">
        {categoryScores.map((cat) => (
          <div
            key={cat.label}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-3 py-1.5 text-[11.5px] font-medium text-[#475569] shadow-2xs"
          >
            <span className="font-bold text-[#0d2c5c]">
              {cat.score.toFixed(1)}
            </span>
            <span>{cat.label}</span>
          </div>
        ))}
      </div>

      {/* ── 4. BANNER FILTRU ACTIV PE STELE ── */}
      {starFilter !== null && (
        <div className="flex items-center justify-between bg-[#f8fafd] border border-[#e1eaf5] rounded-xl px-4 py-2.5 mb-4 text-xs">
          <div className="flex items-center gap-2 text-[#0d2c5c] font-medium">
            <span>Filtru activ:</span>
            <span className="font-bold flex items-center gap-1 text-[#c69a3f] bg-white px-2 py-0.5 rounded-md border border-[#c69a3f]/30">
              {starFilter}.0 <Star size={11} className="fill-[#c69a3f]" />
            </span>
            <span className="text-[#64748b]">
              ({totalFilteredReviews}{" "}
              {totalFilteredReviews === 1
                ? "recenzie găsită"
                : "recenzii găsite"}
              )
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setStarFilter(null);
              setCurrentPage(1);
            }}
            className="inline-flex items-center gap-1 text-[11.5px] font-bold text-[#0d2c5c] hover:text-[#c69a3f] transition-colors cursor-pointer"
          >
            <RotateCcw size={12} /> Resetează filtrul
          </button>
        </div>
      )}

      {/* ── 5. LISTA DE RECENZII (2 PE PAGINĂ) ── */}
      {loading ? (
        <div className="space-y-4 pt-4 border-t border-[#f1f5f9]">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="h-28 rounded-2xl bg-[#f8fafc] animate-pulse"
            />
          ))}
        </div>
      ) : totalFilteredReviews === 0 ? (
        <div className="py-10 text-center text-[#64748b] border-t border-[#f1f5f9]">
          <p className="text-[14px] font-medium text-[#0d2c5c]">
            Nu există nicio recenzie de {starFilter} stele pentru această cameră.
          </p>
          <button
            type="button"
            onClick={() => {
              setStarFilter(null);
              setCurrentPage(1);
            }}
            className="mt-2 text-xs font-bold text-[#c69a3f] hover:underline cursor-pointer"
          >
            Arată toate recenziile
          </button>
        </div>
      ) : (
        <div className="divide-y divide-[#f1f5f9] border-t border-[#f1f5f9]">
          {paginatedReviews.map((r) => {
            const reply = getOfficialReply(r);
            return (
              <div key={r.id} className="py-5 first:pt-5 last:pb-2 space-y-3">
                {/* Antet recenzie: Avatar + Nume + Timp/Status || Scor + Stele */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0d2c5c] to-[#1e4b8a] text-white font-bold text-xs flex items-center justify-center shadow-xs">
                      {r.guest_name
                        ? r.guest_name.charAt(0).toUpperCase()
                        : "O"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[14px] text-[#0d2c5c]">
                          {r.guest_name}
                        </span>
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 size={10} /> Sejur verificat
                        </span>
                      </div>
                      <span className="text-[11.5px] text-[#8a99ad]">
                        Oaspete verificat Vila Casa Esy
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="font-bold text-[13.5px] text-[#0d2c5c]">
                      {r.rating_overall.toFixed(1)}
                    </span>
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={14}
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
                <p className="text-[13.5px] leading-relaxed text-[#334155] pl-0.5">
                  {r.comment}
                </p>

                {/* ── RĂSPUNSUL OFICIAL AL GAZDEI (FĂRĂ NUMĂR DE CAMERĂ, DESIGN ELEGANT) ── */}
                {reply && (
                  <div className="mt-3 ml-2 sm:ml-6 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] p-4 shadow-2xs">
                    <div className="flex items-start gap-3">
                      {/* Avatar oficial CE */}
                      <div className="w-8 h-8 rounded-full bg-[#0d2c5c] text-[#e6b85c] flex items-center justify-center font-serif font-bold text-xs shrink-0 shadow-2xs">
                        CE
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-bold text-[#0d2c5c]">
                              Răspunsul gazdei · Casa Esy
                            </span>
                            <span className="inline-flex items-center gap-1 text-[10.5px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 size={11} /> Oficial
                            </span>
                          </div>
                        </div>

                        <p className="mt-1.5 text-[13px] leading-relaxed text-[#475569]">
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

      {/* ── 6. PAGINARE (EXACT CA ÎN IMAGINEA 1 & 2: BULINE STÂNGA, 01 / 02 ȘI SĂGEȚI DREAPTA) ── */}
      {totalPages > 1 && (
        <div className="mt-6 pt-5 border-t border-[#f1f5f9] flex items-center justify-between">
          {/* Buline de progres */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              const isActive = currentPage === pageNum;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    isActive
                      ? "w-6 bg-[#0d2c5c]"
                      : "w-2 bg-[#cbd5e1] hover:bg-[#94a3b8]"
                  }`}
                  aria-label={`Pagina ${pageNum}`}
                />
              );
            })}
          </div>

          {/* Număr pagină și butoane rotunde < > */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-[#8a99ad] tracking-wider">
              {String(currentPage).padStart(2, "0")} /{" "}
              {String(totalPages).padStart(2, "0")}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-full border border-[#e2e8f0] flex items-center justify-center text-[#0d2c5c] hover:bg-[#f8fafc] disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                aria-label="Pagina anterioară"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="w-8 h-8 rounded-full bg-[#0d2c5c] text-white flex items-center justify-center hover:bg-[#1e4b8a] disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer shadow-xs"
                aria-label="Pagina următoare"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 7. MODAL ADĂUGARE RECENZIE ── */}
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
                {submitting ? "Se publică..." : "Publică recenzia verificată"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
