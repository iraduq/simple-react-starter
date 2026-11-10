import { useCallback, useEffect, useState } from "react";
import {
  Star,
  CheckCircle2,
  MessageSquarePlus,
  X,
  ChevronLeft,
  ChevronRight,
  Quote,
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

  // Paginare carusel: 1 recenzie per card editorial
  const [currentIndex, setCurrentIndex] = useState(0);

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
  const currentReview = totalReviews > 0 ? reviews[currentIndex] : null;

  useEffect(() => {
    if (currentIndex >= totalReviews && totalReviews > 0) {
      setCurrentIndex(0);
    }
  }, [totalReviews, currentIndex]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : totalReviews - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < totalReviews - 1 ? prev + 1 : 0));
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
      setCurrentIndex(0);
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
    <section className="mt-8 rounded-2xl border border-[#e1e8f0] bg-white p-6 shadow-xs">
      {/* Antet discret și aerisit pe fundal alb curat */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#eef2f8]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-full border border-[#e1e8f0] bg-[#f8fafd] px-3 py-1">
            <Star size={13} className="fill-[#c69a3f] text-[#c69a3f]" />
            <span className="text-[13px] font-bold text-[#0d2c5c]">
              {stats.average.toFixed(2)}
            </span>
          </div>
          <div>
            <span className="text-[12px] font-semibold text-[#0d2c5c]">
              {stats.count} {stats.count === 1 ? "recenzie verificată" : "recenzii verificate"}
            </span>
            <div className="text-[11px] text-[#8a99ad] hidden sm:block">
              Curățenie {stats.cleanliness.toFixed(1)} · Confort {stats.comfort.toFixed(1)} · Locație {stats.location.toFixed(1)}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#0d2c5c] hover:text-[#c69a3f] transition-colors cursor-pointer"
        >
          <MessageSquarePlus size={13} className="text-[#c69a3f]" />
          <span>Scrie o recenzie</span>
        </button>
      </div>

      {/* Corpul recenziei */}
      {loading ? (
        <div className="py-7 space-y-3">
          <div className="h-4 w-3/4 rounded-full bg-[#f1f5f9] animate-pulse" />
          <div className="h-4 w-1/2 rounded-full bg-[#f1f5f9] animate-pulse" />
          <div className="h-8 w-1/3 rounded-full bg-[#f1f5f9] animate-pulse mt-4" />
        </div>
      ) : !currentReview ? (
        <div className="py-7 text-center text-[#64748b]">
          <p className="text-[14px] font-medium text-[#0d2c5c]">
            Fii primul oaspete care lasă o impresie despre această cameră!
          </p>
          <p className="text-[12px] text-[#8a99ad] mt-1">
            Opiniile tale îi ghidează pe viitorii oaspeți în alegerea vacanței perfecte.
          </p>
        </div>
      ) : (
        <div className="py-5">
          {/* Textul recenziei */}
          <blockquote className="text-[14.5px] sm:text-[15.5px] text-[#1e293b] leading-relaxed italic min-h-[56px]">
            „{currentReview.comment}”
          </blockquote>

          {/* Răspuns oficial Casa Esy (dacă există) */}
          {currentReview.admin_reply && (
            <div className="mt-3.5 rounded-xl bg-[#f8fafd] border-l-2 border-l-[#c69a3f] p-3 text-[12.5px]">
              <span className="font-bold text-[#0d2c5c]">Răspunsul gazdei Casa Esy: </span>
              <span className="text-[#52637a] italic">{currentReview.admin_reply}</span>
            </div>
          )}

          {/* Profil oaspete și evaluare */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#f1f5f9]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#0d2c5c] text-white font-bold text-[12px] flex items-center justify-center shadow-xs">
                {currentReview.guest_name ? currentReview.guest_name.charAt(0).toUpperCase() : "O"}
              </div>
              <div>
                <span className="text-[13px] font-bold text-[#0d2c5c] block leading-none">
                  {currentReview.guest_name}
                </span>
                <span className="inline-flex items-center gap-1 text-[10.5px] font-medium text-emerald-700 mt-0.5">
                  <CheckCircle2 size={11} /> Sejur verificat
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={13}
                  className={
                    i < currentReview.rating_overall
                      ? "fill-[#c69a3f] text-[#c69a3f]"
                      : "text-slate-200"
                  }
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bară de navigare carusel (Next / Prev) */}
      {totalReviews > 1 && (
        <div className="pt-3 border-t border-[#f1f5f9] flex items-center justify-between">
          {/* Indicatoare puncte (Dots) */}
          <div className="flex items-center gap-1.5">
            {reviews.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Mergi la recenzia ${idx + 1}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  currentIndex === idx
                    ? "w-5 h-1.5 bg-[#0d2c5c]"
                    : "w-1.5 h-1.5 bg-[#cbd5e1] hover:bg-[#0d2c5c]/60"
                }`}
              />
            ))}
          </div>

          {/* Numărător și butoane Next / Prev */}
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-mono text-[#8a99ad]">
              0{currentIndex + 1} / 0{totalReviews}
            </span>

            <div className="inline-flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Recenzia anterioară"
                className="w-7 h-7 rounded-full border border-[#e1e8f0] bg-white hover:border-[#0d2c5c] text-[#0d2c5c] flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
              >
                <ChevronLeft size={13} />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Recenzia următoare"
                className="w-7 h-7 rounded-full bg-[#0d2c5c] hover:bg-[#1a417c] text-white flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
              >
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal adăugare recenzie */}
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
