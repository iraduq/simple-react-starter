import { useState, useEffect } from "react";
import {
  X,
  Star,
  Sparkles,
  Send,
  CheckCircle2,
  Sparkle,
  Smile,
  Meh,
  Frown,
  Coffee,
  UtensilsCrossed,
  Sparkles as SparkleIcon,
  HeartHandshake,
  BedDouble,
} from "lucide-react";
import { apiFetch } from "../../lib/api";
import { useToast } from "../Toast";

interface GuestFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId?: string;
  roomTitle?: string;
  bookingCode?: string;
  unitNumber?: string;
  defaultGuestName?: string;
  onSubmitted?: () => void;
}

const CRITERIA = [
  { key: "cleanliness", label: "Curățenie", icon: SparkleIcon, desc: "Igienă cameră, lenjerie, prosoape, baie" },
  { key: "staff", label: "Personal și ospitalitate", icon: HeartHandshake, desc: "Amabilitate, promptitudine recepție" },
  { key: "restaurant", label: "Restaurant și servire", icon: UtensilsCrossed, desc: "Calitate mâncare, ambianță, băuturi" },
  { key: "breakfast", label: "Micul dejun", icon: Coffee, desc: "Diversitate bufet, prospețime produse" },
  { key: "comfort", label: "Confortul camerei", icon: BedDouble, desc: "Saltea, liniște, climatizare, dotări" },
] as const;

export default function GuestFeedbackModal({
  isOpen,
  onClose,
  roomId,
  roomTitle,
  bookingCode,
  unitNumber,
  defaultGuestName = "",
  onSubmitted,
}: GuestFeedbackModalProps) {
  const { toast } = useToast();

  const [ratings, setRatings] = useState({
    cleanliness: 5,
    staff: 5,
    restaurant: 5,
    breakfast: 5,
    comfort: 5,
  });

  const [guestName, setGuestName] = useState(defaultGuestName);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Live AI Sentiment State
  const [aiPreview, setAiPreview] = useState<{
    sentiment: "positive" | "neutral" | "negative";
    score: number;
    keywords: string[];
  } | null>(null);

  useEffect(() => {
    if (defaultGuestName) setGuestName(defaultGuestName);
  }, [defaultGuestName]);

  const computedOverall = Math.round(
    (ratings.cleanliness + ratings.staff + ratings.restaurant + ratings.breakfast + ratings.comfort) / 5
  );

  // Debounced live AI Sentiment analysis preview
  useEffect(() => {
    if (!comment || comment.trim().length < 6) {
      setAiPreview(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await apiFetch<{
          sentiment: "positive" | "neutral" | "negative";
          score: number;
          keywords: string[];
        }>("/reviews/analyze", {
          method: "POST",
          body: JSON.stringify({
            comment: comment.trim(),
            ratings: [
              ratings.cleanliness,
              ratings.staff,
              ratings.comfort,
              ratings.restaurant,
              ratings.breakfast,
            ],
          }),
        });
        if (res && res.sentiment) {
          setAiPreview(res);
        }
      } catch {
        // Local heuristic fallback
        const lower = comment.toLowerCase();
        const isNeg = lower.includes("murdar") || lower.includes("zgomot") || lower.includes("stricat") || lower.includes("rau");
        setAiPreview({
          sentiment: isNeg ? "negative" : "positive",
          score: isNeg ? 0.82 : 0.96,
          keywords: isNeg ? ["Atenție: Aspecte de Verificat"] : ["Experiență Excelentă"],
        });
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [comment, ratings]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) {
      toast("Vă rugăm să introduceți numele dumneavoastră.", "warning");
      return;
    }
    if (!comment.trim() || comment.trim().length < 8) {
      toast("Vă rugăm să adăugați câteva cuvinte în comentariul sejurului.", "warning");
      return;
    }

    setSubmitting(true);
    try {
      // If no roomId passed, resolve default room
      let finalRoomId = roomId;
      if (!finalRoomId) {
        const rooms = await apiFetch<any[]>("/rooms");
        if (rooms && rooms.length > 0) {
          finalRoomId = rooms[0].id;
        }
      }

      await apiFetch("/reviews", {
        method: "POST",
        body: JSON.stringify({
          room_id: finalRoomId,
          booking_code: bookingCode || "BK-VIP",
          guest_name: guestName.trim(),
          rating_overall: computedOverall,
          rating_cleanliness: ratings.cleanliness,
          rating_comfort: ratings.comfort,
          rating_service: ratings.staff,
          rating_restaurant: ratings.restaurant,
          rating_breakfast: ratings.breakfast,
          comment: comment.trim(),
        }),
      });

      setSuccess(true);
      toast("Vă mulțumim din suflet pentru feedback-ul oferit!", "success");
      if (onSubmitted) onSubmitted();

      setTimeout(() => {
        setSuccess(false);
        setComment("");
        onClose();
      }, 2200);
    } catch (err: any) {
      toast(err?.message || "Nu am putut trimite recenzia. Reîncercați.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-[#0d2c5c] via-[#0f3469] to-[#00a896] text-white">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X size={18} />
          </button>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#e6b85c]">
            <Sparkles size={14} />
            <span>Casa Esy · Experiența oaspeților</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-['Outfit'] mt-1 text-white">
            Evaluare sejur și satisfacție
          </h2>
          <p className="text-xs text-white/80 mt-0.5">
            {roomTitle ? `${roomTitle} • ` : ""}
            {unitNumber ? `Suita ${unitNumber} • ` : ""}
            Cod rezervare: #{bookingCode || "BK-OASPETE"}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {success ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
                <CheckCircle2 size={36} />
              </div>
              <h3 className="text-xl font-bold text-[#0d2c5c]">Vă mulțumim pentru recenzie!</h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Opinia dumneavoastră a fost procesată instant de sistemul nostru AI și ne ajută să menținem standardele de 5 stele Casa Esy.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Overall Score Badge */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-teal-50 border border-amber-200/60">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#0d2c5c]">Scor general</p>
                  <p className="text-xs text-slate-500">Calculat automat din cele 5 criterii de mai jos</p>
                </div>
                <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-xl shadow-xs border border-amber-300">
                  <Star size={20} className="fill-amber-400 text-amber-400" />
                  <span className="font-['Outfit'] text-xl font-extrabold text-[#0d2c5c]">{computedOverall}.0</span>
                  <span className="text-xs text-slate-400">/ 5</span>
                </div>
              </div>

              {/* 5 Criterii de Evaluare */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Criterii de evaluare sejur
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {CRITERIA.map((crit) => {
                    const Icon = crit.icon;
                    const val = ratings[crit.key];
                    return (
                      <div
                        key={crit.key}
                        className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors flex flex-col justify-between"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="p-1.5 rounded-lg bg-teal-100/70 text-teal-800">
                              <Icon size={14} />
                            </span>
                            <div>
                              <p className="text-xs font-bold text-[#0d2c5c]">{crit.label}</p>
                              <p className="text-[10.5px] text-slate-500 leading-tight">{crit.desc}</p>
                            </div>
                          </div>
                        </div>

                        {/* Interactive Star Picker */}
                        <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-200/60">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRatings((prev) => ({ ...prev, [crit.key]: star }))}
                              className="p-1 rounded-md hover:scale-115 transition-transform cursor-pointer"
                              title={`${star} stele`}
                            >
                              <Star
                                size={18}
                                className={
                                  star <= val
                                    ? "fill-amber-400 text-amber-400"
                                    : "fill-slate-200 text-slate-300"
                                }
                              />
                            </button>
                          ))}
                          <span className="ml-auto text-xs font-bold text-[#0d2c5c]">{val} / 5</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Guest Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Nume și prenume
                </label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Ex: Alexandru Popescu"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a896]"
                  required
                />
              </div>

              {/* Comment with Live AI Sentiment Indicator */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Comentarii și impresii despre sejur
                  </label>
                  <span className="text-[11px] text-slate-400">Minim 8 caractere</span>
                </div>
                <textarea
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Descrieți pe scurt experiența dumneavoastră: ce v-a impresionat cel mai mult, calitatea serviciilor, atmosfera..."
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a896] resize-none"
                  required
                />

                {/* AI Sentiment Analysis Pill Preview */}
                {aiPreview && (
                  <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 animate-in fade-in duration-300">
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded-lg bg-[#0d2c5c] text-[#e6b85c]">
                        <Sparkles size={14} />
                      </span>
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#0d2c5c]">
                          Analiză sentiment:{" "}
                        </span>
                        {aiPreview.sentiment === "positive" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                            <Smile size={12} /> Pozitiv ({Math.round(aiPreview.score * 100)}%)
                          </span>
                        )}
                        {aiPreview.sentiment === "neutral" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                            <Meh size={12} /> Neutru ({Math.round(aiPreview.score * 100)}%)
                          </span>
                        )}
                        {aiPreview.sentiment === "negative" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                            <Frown size={12} /> Reclamație / Atenție ({Math.round(aiPreview.score * 100)}%)
                          </span>
                        )}
                      </div>
                    </div>

                    {aiPreview.keywords.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1">
                        {aiPreview.keywords.map((kw, idx) => (
                          <span
                            key={idx}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
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
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#0d2c5c] to-[#00a896] hover:brightness-110 text-white text-sm font-bold flex items-center gap-2 shadow-md transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Send size={15} />
                  <span>{submitting ? "Se trimite..." : "Trimite recenzia"}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
