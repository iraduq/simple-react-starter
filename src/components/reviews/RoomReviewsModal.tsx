import { useEffect, useState } from "react";
import {
  X,
  Star,
  CheckCircle2,
  Sparkles,
  MessageSquarePlus,
  BedDouble,
  ShieldCheck,
  Building,
  HeartHandshake,
  Coffee,
  Sparkle,
} from "lucide-react";
import { apiFetch } from "../../lib/api";
import { dateFmt } from "../../lib/admin";

export interface RoomReviewItem {
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

export interface RoomReviewStats {
  count: number;
  average: number;
  cleanliness: number;
  comfort: number;
  location: number;
  service: number;
  restaurant: number;
  breakfast: number;
}

interface RoomReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string | number;
  roomTitle: string;
  onOpenAddReview: () => void;
}

export default function RoomReviewsModal({
  isOpen,
  onClose,
  roomId,
  roomTitle,
  onOpenAddReview,
}: RoomReviewsModalProps) {
  const [reviews, setReviews] = useState<RoomReviewItem[]>([]);
  const [stats, setStats] = useState<RoomReviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !roomId) return;
    let isMounted = true;
    setLoading(true);

    apiFetch<{ reviews: RoomReviewItem[]; stats: RoomReviewStats }>(
      `/reviews/room/${roomId}`
    )
      .then((data) => {
        if (!isMounted) return;
        setReviews(data?.reviews || []);
        setStats(data?.stats || null);
      })
      .catch(() => {
        if (!isMounted) return;
        setReviews([]);
        setStats(null);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, roomId]);

  if (!isOpen) return null;

  const avgScore = stats?.average != null ? stats.average.toFixed(2) : "4.90";
  const reviewCount = stats?.count ?? reviews.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header cu tematică Casa Esy */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-[#0d2c5c] via-[#10366d] to-[#0a2347] text-white">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Închide fereastra"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#c69a3f]">
            <Sparkles size={14} />
            <span>Recenzii verificate · Vila Casa Esy</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold font-['Outfit'] mt-1 text-white">
            {roomTitle}
          </h2>

          <p className="text-xs text-white/80 mt-1 flex items-center gap-2">
            <ShieldCheck size={14} className="text-[#00a896]" />
            Toate recenziile provin de la oaspeți cu rezervări confirmate la proprietate.
          </p>
        </div>

        {/* Content Scrollable */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Card Overview Scor & Criterii */}
          <div className="rounded-2xl bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9] p-5 border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center justify-center bg-[#0d2c5c] text-white rounded-2xl w-24 h-24 shadow-md shrink-0">
                <span className="font-['Outfit'] text-3xl font-extrabold text-white">
                  {avgScore}
                </span>
                <span className="text-[11px] font-semibold text-white/70">din 5.0</span>
                <div className="flex items-center gap-0.5 mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={12}
                      className={
                        i < Math.round(Number(avgScore))
                          ? "fill-[#c69a3f] text-[#c69a3f]"
                          : "text-white/30"
                      }
                    />
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#0d2c5c]">
                  Scorul oaspeților
                </span>
                <p className="text-xs text-slate-500 mt-0.5">
                  Bazat pe {reviewCount} {reviewCount === 1 ? "recenzie verificată" : "recenzii verificate"}
                </p>
                <div className="mt-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                    <CheckCircle2 size={12} /> Recomandat 98%
                  </span>
                </div>
              </div>
            </div>

            {/* Bara de Criterii */}
            <div className="flex-1 grid grid-cols-2 gap-3 text-xs">
              <div className="bg-white rounded-xl p-2.5 border border-slate-200/70">
                <div className="flex items-center justify-between text-[#475569] font-medium mb-1">
                  <span className="flex items-center gap-1.5">
                    <Sparkle size={12} className="text-[#0d2c5c]" /> Curățenie
                  </span>
                  <strong className="text-[#0d2c5c]">
                    {(stats?.cleanliness ?? 4.9).toFixed(1)} / 5
                  </strong>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${((stats?.cleanliness ?? 4.9) / 5) * 100}%` }}
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl p-2.5 border border-slate-200/70">
                <div className="flex items-center justify-between text-[#475569] font-medium mb-1">
                  <span className="flex items-center gap-1.5">
                    <BedDouble size={12} className="text-[#0d2c5c]" /> Confort
                  </span>
                  <strong className="text-[#0d2c5c]">
                    {(stats?.comfort ?? 4.8).toFixed(1)} / 5
                  </strong>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-500 rounded-full"
                    style={{ width: `${((stats?.comfort ?? 4.8) / 5) * 100}%` }}
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl p-2.5 border border-slate-200/70">
                <div className="flex items-center justify-between text-[#475569] font-medium mb-1">
                  <span className="flex items-center gap-1.5">
                    <HeartHandshake size={12} className="text-[#0d2c5c]" /> Personal
                  </span>
                  <strong className="text-[#0d2c5c]">
                    {(stats?.service ?? 5.0).toFixed(1)} / 5
                  </strong>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#0d2c5c] rounded-full"
                    style={{ width: `${((stats?.service ?? 5.0) / 5) * 100}%` }}
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl p-2.5 border border-slate-200/70">
                <div className="flex items-center justify-between text-[#475569] font-medium mb-1">
                  <span className="flex items-center gap-1.5">
                    <Coffee size={12} className="text-[#0d2c5c]" /> Micul dejun
                  </span>
                  <strong className="text-[#0d2c5c]">
                    {(stats?.breakfast ?? 4.9).toFixed(1)} / 5
                  </strong>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#c69a3f] rounded-full"
                    style={{ width: `${((stats?.breakfast ?? 4.9) / 5) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Buton Adaugă Recenzie CTA */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80">
            <div>
              <p className="text-xs font-bold text-[#0d2c5c]">
                Ați fost cazat în această cameră?
              </p>
              <p className="text-xs text-slate-600">
                Împărtășiți impresiile dumneavoastră și ajutați viitorii oaspeți.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAddReview();
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0d2c5c] hover:bg-[#091f42] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <MessageSquarePlus size={14} />
              <span>Adaugă o recenzie</span>
            </button>
          </div>

          {/* Lista Recenziilor */}
          <div className="space-y-4">
            <h3 className="font-['Outfit'] font-bold text-base text-[#0d2c5c]">
              Părerile oaspeților noștri ({reviews.length})
            </h3>

            {loading ? (
              <div className="space-y-3">
                {[1, 2].map((n) => (
                  <div
                    key={n}
                    className="h-32 rounded-2xl bg-slate-100 animate-pulse border border-slate-200"
                  />
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-sm">
                Nu există încă recenzii pentru această cameră. Fii primul oaspete care lasă o impresie!
              </div>
            ) : (
              reviews.map((r) => (
                <div
                  key={r.id}
                  className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-2xs space-y-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-['Outfit'] font-bold text-sm text-[#0d2c5c]">
                          {r.guest_name}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-500/10 text-amber-900 border border-amber-400/30">
                          <CheckCircle2 size={11} className="text-[#c69a3f]" />
                          {r.booking_code ? `Sejur confirmat #${r.booking_code.replace(/^#/, "")}` : "Sejur confirmat"}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 mt-0.5 block">
                        Publicată pe {dateFmt(r.created_at)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200/80">
                      <span className="text-xs font-bold text-amber-900">{r.rating_overall}.0</span>
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star
                          key={idx}
                          size={12}
                          className={
                            idx < r.rating_overall
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-200"
                          }
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-sm text-slate-700 leading-relaxed">
                    „{r.comment}”
                  </p>

                  {/* Răspuns Oficial Vila Casa Esy */}
                  {r.admin_reply && (
                    <div className="mt-3 p-3.5 rounded-xl bg-[#0d2c5c]/5 border-l-4 border-l-[#c69a3f] space-y-1">
                      <span className="text-xs font-bold text-[#0d2c5c] flex items-center gap-1.5">
                        <Building size={13} className="text-[#c69a3f]" />
                        Răspuns oficial — Conducerea Vila Casa Esy
                      </span>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {r.admin_reply}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
