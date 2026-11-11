import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Star,
  Sparkles,
  Send,
  CheckCircle2,
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
import { fetchSession, getCachedUser } from "../../lib/auth";
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

function resolveCachedFullName(): string {
  const user = getCachedUser();
  if (!user) return "";
  return [user.first_name, user.last_name].filter(Boolean).join(" ").trim();
}

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

  const [guestName, setGuestName] = useState(() => defaultGuestName.trim() || resolveCachedFullName());
  const [autoFilledFromAccount, setAutoFilledFromAccount] = useState(() => Boolean(defaultGuestName.trim() || resolveCachedFullName()));
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [aiPreview, setAiPreview] = useState<{
    sentiment: "positive" | "neutral" | "negative";
    score: number;
    keywords: string[];
  } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;

    const applyResolvedName = (name: string) => {
      if (!active || !name) return;
      setGuestName((prev) => (prev.trim() ? prev : name));
      setAutoFilledFromAccount(true);
    };

    const propName = defaultGuestName.trim();
    if (propName) {
      setGuestName(propName);
      setAutoFilledFromAccount(true);
      return;
    }

    const cached = resolveCachedFullName();
    if (cached) {
      applyResolvedName(cached);
    } else {
      void fetchSession().then((sessionUser) => {
        if (!active || !sessionUser) return;
        const full = [sessionUser.first_name, sessionUser.last_name].filter(Boolean).join(" ").trim();
        if (full) {
          applyResolvedName(full);
        }
      });
    }

    return () => {
      active = false;
    };
  }, [isOpen, defaultGuestName]);

  const computedOverall =
    Math.round(
      ((ratings.cleanliness + ratings.staff + ratings.restaurant + ratings.breakfast + ratings.comfort) / 5) * 10,
    ) / 10;

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
      let finalRoomId = roomId;
      if (!finalRoomId) {
        const rooms = await apiFetch<{ id: string }[]>("/rooms");
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
          rating_overall: Math.round(computedOverall),
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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Nu am putut trimite recenzia. Reîncercați.";
      toast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-[#07203f]/55 backdrop-blur-md">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div
        className="relative z-10 w-full max-w-2xl max-h-[calc(100vh-3rem)] flex flex-col rounded-[28px] bg-white shadow-[0_30px_80px_rgba(7,32,63,0.35)] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header stil Casa Esy cu val organic & cercuri decorative */}
        <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-[#0d2c5c] via-[#123a72] to-[#07203f] px-6 sm:px-7 pt-5 pb-9">
          <svg viewBox="0 0 120 120" fill="none" className="pointer-events-none absolute -right-6 -top-8 h-36 w-36 text-white/10">
            <circle cx="60" cy="60" r="22" stroke="currentColor" strokeWidth="1.2" />
            <circle cx="60" cy="60" r="36" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 5" />
            <circle cx="60" cy="60" r="50" stroke="currentColor" strokeWidth="0.6" />
          </svg>
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#e6b85c]">
                Vila Casa Esy · Experiența oaspeților
              </span>
              <h2
                className="mt-1 text-[22px] sm:text-[25px] font-bold leading-tight !text-white tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Evaluare sejur și satisfacție
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20 cursor-pointer"
              aria-label="Închide"
            >
              ✕
            </button>
          </div>
          <svg viewBox="0 0 400 24" preserveAspectRatio="none" className="absolute bottom-0 left-0 h-6 w-full text-white">
            <path d="M0 24 V12 Q50 0 100 12 T200 12 T300 12 T400 12 V24 Z" fill="currentColor" />
          </svg>
        </div>

        {/* Subtitlu curat sub val */}
        {(roomTitle || bookingCode) && (
          <div className="px-6 sm:px-7 pt-1.5 text-xs font-medium text-[#6b7c99] shrink-0">
            {[roomTitle, unitNumber ? `Suita ${unitNumber}` : null, bookingCode ? `Cod rezervare #${bookingCode}` : null]
              .filter(Boolean)
              .join(" • ")}
          </div>
        )}

        {/* Conținut scrollabil */}
        <form id="guest-feedback-form" onSubmit={handleSubmit} className="overflow-y-auto px-6 sm:px-7 pb-6 pt-3 text-[#2a3b52] space-y-5">
          {success ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shadow-xs">
                <CheckCircle2 size={34} />
              </div>
              <h3 className="text-xl font-bold text-[#0d2c5c]" style={{ fontFamily: "var(--font-display)" }}>
                Vă mulțumim pentru recenzie!
              </h3>
              <p className="text-sm text-[#6b7c99] max-w-md mx-auto">
                Opinia dumneavoastră a fost publicată și ne ajută să menținem standardele de 5 stele Vila Casa Esy.
              </p>
            </div>
          ) : (
            <>
              {/* Scor General */}
              <div className="flex items-center justify-between p-4 rounded-2xl border border-[#e6ebf2] bg-[#f8fafd]">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0d2c5c]">Scor general</p>
                  <p className="text-xs text-[#6b7c99] mt-0.5">Calculat automat din cele 5 criterii de mai jos</p>
                </div>
                <div className="flex items-center gap-1.5 bg-white px-3.5 py-1.5 rounded-xl border border-[#e8d9b5] shadow-2xs">
                  <Star size={18} className="fill-[#c69a3f] text-[#c69a3f]" />
                  <span className="text-lg font-black text-[#0d2c5c] tabular-nums">{computedOverall.toFixed(1)}</span>
                  <span className="text-xs text-[#8a99ad] font-medium">/ 5</span>
                </div>
              </div>

              {/* 5 Criterii de Evaluare */}
              <div className="space-y-2.5">
                <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#6b7c99]">
                  Criterii de evaluare sejur
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {CRITERIA.map((crit, idx) => {
                    const Icon = crit.icon;
                    const val = ratings[crit.key];
                    const isLastFull = idx === CRITERIA.length - 1;
                    return (
                      <div
                        key={crit.key}
                        className={`p-3.5 rounded-2xl border border-[#e6ebf2] bg-[#f8fafd] hover:border-[#cfd9e6] transition-colors flex flex-col justify-between ${
                          isLastFull ? "sm:col-span-2 sm:flex-row sm:items-center sm:gap-4" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-8 h-8 rounded-xl bg-[#0d2c5c]/6 text-[#0d2c5c] flex items-center justify-center shrink-0">
                            <Icon size={15} />
                          </span>
                          <div>
                            <p className="text-xs font-bold text-[#0d2c5c]">{crit.label}</p>
                            <p className="text-[10.5px] text-[#6b7c99] leading-tight mt-0.5">{crit.desc}</p>
                          </div>
                        </div>

                        <div
                          className={`flex items-center gap-1 ${
                            isLastFull
                              ? "mt-2.5 pt-2 border-t border-[#e6ebf2] sm:mt-0 sm:pt-0 sm:border-t-0 shrink-0"
                              : "mt-2.5 pt-2 border-t border-[#e6ebf2]"
                          }`}
                        >
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRatings((prev) => ({ ...prev, [crit.key]: star }))}
                              className="p-1 rounded-md hover:scale-110 transition-transform cursor-pointer"
                              title={`${star} stele`}
                            >
                              <Star
                                size={17}
                                className={
                                  star <= val
                                    ? "fill-[#c69a3f] text-[#c69a3f]"
                                    : "fill-[#e2e8f0] text-[#cbd5e1]"
                                }
                              />
                            </button>
                          ))}
                          <span className="ml-auto sm:ml-2 text-xs font-bold text-[#0d2c5c] tabular-nums">{val} / 5</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Nume și prenume (completat automat din cont) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#6b7c99]">
                    Nume și prenume
                  </label>
                  {autoFilledFromAccount && guestName.trim() && (
                    <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      <CheckCircle2 size={10} /> Completat automat din cont
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => {
                    setGuestName(e.target.value);
                    setAutoFilledFromAccount(false);
                  }}
                  placeholder="Ex: Alexandru Popescu"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#dce4ef] bg-[#f8fafd] focus:bg-white text-sm font-semibold text-[#0d2c5c] focus:outline-none focus:border-[#0d2c5c] focus:ring-2 focus:ring-[#0d2c5c]/15 transition-all"
                  required
                />
              </div>

              {/* Comentarii și analiză AI */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#6b7c99]">
                    Comentarii și impresii despre sejur
                  </label>
                  <span className="text-[11px] text-[#8a99ad]">Minim 8 caractere</span>
                </div>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Descrieți pe scurt experiența dumneavoastră: ce v-a impresionat cel mai mult, calitatea serviciilor, atmosfera..."
                  className="w-full px-4 py-3 rounded-2xl border border-[#dce4ef] bg-[#f8fafd] focus:bg-white text-sm text-[#0d2c5c] focus:outline-none focus:border-[#0d2c5c] focus:ring-2 focus:ring-[#0d2c5c]/15 resize-none transition-all"
                  required
                />

                {aiPreview && (
                  <div className="mt-2.5 p-3 rounded-xl bg-[#f8fafd] border border-[#e6ebf2] flex flex-col sm:flex-row sm:items-center justify-between gap-2 animate-in fade-in duration-300">
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded-lg bg-[#0d2c5c] text-[#e6b85c]">
                        <Sparkles size={13} />
                      </span>
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#0d2c5c]">
                          Analiză sentiment:{" "}
                        </span>
                        {aiPreview.sentiment === "positive" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Smile size={12} /> Pozitiv ({Math.round(aiPreview.score * 100)}%)
                          </span>
                        )}
                        {aiPreview.sentiment === "neutral" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <Meh size={12} /> Neutru ({Math.round(aiPreview.score * 100)}%)
                          </span>
                        )}
                        {aiPreview.sentiment === "negative" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
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
                            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                              kw.startsWith("Atenție")
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : "bg-white text-[#0d2c5c] border-[#dce4ef]"
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
            </>
          )}
        </form>

        {/* Footer în stilul Casa Esy (butoane rotunjite & curate) */}
        {!success && (
          <div className="flex items-center justify-end gap-2.5 border-t border-[#eef2f7] bg-[#f8fafd] px-6 sm:px-7 py-4 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-[#dce4ef] bg-white px-5 py-2.5 text-[11.5px] font-bold uppercase tracking-[0.14em] text-[#0d2c5c] hover:bg-[#f1f5f9] transition-colors cursor-pointer"
            >
              Anulează
            </button>
            <button
              type="submit"
              form="guest-feedback-form"
              disabled={submitting}
              className="rounded-full bg-[#0d2c5c] hover:bg-[#133b7a] px-6 py-2.5 text-[11.5px] font-bold uppercase tracking-[0.14em] text-white flex items-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              <Send size={13} />
              <span>{submitting ? "Se trimite..." : "Trimite recenzia"}</span>
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
