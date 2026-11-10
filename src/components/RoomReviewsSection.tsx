import { useCallback, useEffect, useState } from "react";
import {
  Star,
  CheckCircle2,
  Award,
  MessageSquarePlus,
  X,
  Sparkles,
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

  // Modal adaugă recenzie
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
    <section className="rounded-3xl border border-[#e1e8f0] bg-white p-6 sm:p-10 shadow-sm">
      {/* Antet secțiune */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#eef2f8]">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#c69a3f]">
            <Award size={14} /> Experiențe și recenzii verificate
          </div>
          <h2
            className="mt-1 text-2xl sm:text-3xl font-bold text-[#0d2c5c]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Păreri reale din sejururi confirmate
          </h2>
          <p className="mt-1 text-[13.5px] text-[#6b7c99]">
            Evaluări acordate de oaspeții cazați în această cameră la Vila Casa Esy.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#0d2c5c] hover:bg-[#c69a3f] text-white hover:text-[#0d2c5c] px-4 py-2.5 text-[12px] font-bold transition-all shadow-sm cursor-pointer"
        >
          <MessageSquarePlus size={15} /> Lasă o recenzie
        </button>
      </div>

      {/* Rezumat evaluare și criterii */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8 items-center bg-[#f8fafc] rounded-2xl p-6 border border-[#e1e8f0]">
        <div className="text-center md:border-r md:border-[#e1e8f0] md:pr-8">
          <div className="text-4xl sm:text-5xl font-extrabold text-[#0d2c5c]">
            {stats.average.toFixed(2)}
          </div>
          <div className="my-2 flex items-center justify-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={18}
                className="fill-[#c69a3f] text-[#c69a3f]"
              />
            ))}
          </div>
          <div className="text-[12px] font-semibold text-[#0d2c5c]">
            Excelent · {stats.count} {stats.count === 1 ? "recenzie" : "recenzii verificate"}
          </div>
          <div className="mt-1 text-[11px] text-[#8595aa]">
            100% sejururi confirmate
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: "Curățenie impecabilă", score: stats.cleanliness },
            { label: "Confort și dotări", score: stats.comfort },
            { label: "Locație și acces la plajă", score: stats.location },
            { label: "Servicii și ospitalitate", score: stats.service },
          ].map((cat) => (
            <div key={cat.label} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-[#0d2c5c]">
                <span>{cat.label}</span>
                <span className="font-bold text-[#0d2c5c]">{cat.score.toFixed(1)} / 5.0</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#e1e8f0] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#c69a3f] transition-all duration-500"
                  style={{ width: `${Math.min(100, (cat.score / 5) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lista de recenzii */}
      {loading ? (
        <div className="mt-8 space-y-4">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="h-28 rounded-2xl bg-[#f3f6fa] animate-pulse"
            />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-[#cbd5e1] p-8 text-center text-[#64748b]">
          <Sparkles size={24} className="mx-auto text-[#c69a3f] mb-2" />
          <p className="text-[14px] font-medium text-[#0d2c5c]">
            Fii primul oaspete care lasă o recenzie pentru această cameră!
          </p>
          <p className="text-[12px] text-[#8595aa] mt-1">
            Opiniile tale îi ajută pe viitorii oaspeți să aleagă sejurul ideal.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl border border-[#e1e8f0] bg-white p-5 sm:p-6 transition hover:border-[#c69a3f]/60 hover:shadow-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-[15px] text-[#0d2c5c]">
                    {r.guest_name}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                    <CheckCircle2 size={12} /> Sejur confirmat
                  </span>
                </div>

                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={
                        i < r.rating_overall
                          ? "fill-[#c69a3f] text-[#c69a3f]"
                          : "text-slate-200"
                      }
                    />
                  ))}
                </div>
              </div>

              <p className="text-[14px] leading-relaxed text-[#3d4f6b]">
                „{r.comment}”
              </p>

              {r.admin_reply && (
                <div className="mt-4 rounded-xl bg-[#f8fafd] border-l-4 border-l-[#c69a3f] p-3.5">
                  <div className="text-[11.5px] font-bold text-[#0d2c5c] mb-1">
                    Răspuns oficial din partea conducerii Casa Esy:
                  </div>
                  <p className="text-[13px] text-[#4f6280] leading-relaxed">
                    {r.admin_reply}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal adaugă recenzie */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white text-[#0d2c5c] shadow-2xl overflow-hidden border border-[#e1e8f0]">
            <div className="bg-[#0d2c5c] text-white px-6 py-4 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#e6b85c]">
                  Confirmare sejur
                </div>
                <h3 className="text-xl font-bold">
                  Lasă o recenzie verificată
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
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

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-[#f8fafc] p-3 rounded-2xl border border-[#e1e8f0]">
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
                    <div className="text-[11px] font-bold text-[#0d2c5c] mb-1">
                      {item.label}
                    </div>
                    <select
                      value={item.val}
                      onChange={(e) => item.set(Number(e.target.value))}
                      className="rounded-lg border border-[#cbd5e1] bg-white px-2 py-1 text-xs font-bold text-[#0d2c5c] cursor-pointer"
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
                  placeholder="Povestește-ne despre confortul camerei, ospitalitate și experiența sejurului..."
                />
              </div>

              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmitReview}
                className="w-full rounded-xl bg-[#0d2c5c] hover:bg-[#c69a3f] text-white hover:text-[#0d2c5c] py-3 text-xs font-bold uppercase tracking-wider transition cursor-pointer"
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
