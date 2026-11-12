import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  KeyRound,
  CheckCircle2,
  CalendarCheck,
  DoorOpen,
  Wifi,
  Copy,
  Check,
  Home,
  RefreshCw,
  Clock,
  Sparkles,
  RotateCcw,
  AlertCircle,
} from "lucide-react";
import { API_URL } from "../lib/config";
import { apiFetch } from "../lib/api";
import { useToast } from "../components/Toast";
import SmartLockKeypad from "../components/SmartLockKeypad";

interface CheckInInfo {
  booking_id?: string;
  booking_code: string;
  guest_name: string;
  room_name: string;
  unit_number: string;
  check_in: string;
  check_out: string;
  created_at?: string | null;
  rate_plan_code?: string | null;
  total_price?: number | null;
  status: string;
  payment_status: string;
  is_checked_in: boolean;
  access_pin?: string | null;
}

export default function CheckIn() {
  const { bookingCode } = useParams<{ bookingCode: string }>();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [info, setInfo] = useState<CheckInInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [pinCopied, setPinCopied] = useState(false);
  const [showKeypadSimulator, setShowKeypadSimulator] = useState(false);
  const [checkinError, setCheckinError] = useState<string | null>(null);
  const [showRefundConfirm, setShowRefundConfirm] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const [refunding, setRefunding] = useState(false);
  const [refundError, setRefundError] = useState<string | null>(null);

  const fetchInfo = useCallback(async () => {
    if (!bookingCode) return;
    setLoading(true);
    setError(null);
    try {
      let res = await fetch(`${API_URL}/api/checkin/${bookingCode}/info`);
      if (res.status === 404) {
        res = await fetch(`${API_URL}/checkin/${bookingCode}/info`);
      }

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as Record<string, string>;
        throw new Error(data.detail || data.message || "Rezervarea nu a fost găsită.");
      }

      const data: CheckInInfo = await res.json();
      setInfo(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Nu am putut prelua detaliile rezervării.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [bookingCode]);

  useEffect(() => {
    let active = true;
    (async () => {
      if (active) {
        await fetchInfo();
      }
    })();
    return () => {
      active = false;
    };
  }, [fetchInfo]);

  const handlePerformCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingCode) return;

    setSubmitting(true);
    setCheckinError(null);
    try {
      let res = await fetch(`${API_URL}/api/checkin/${bookingCode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guest_notes: notes }),
      });

      if (res.status === 404) {
        res = await fetch(`${API_URL}/checkin/${bookingCode}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ guest_notes: notes }),
        });
      }

      const data = (await res.json().catch(() => ({}))) as Record<string, string>;
      if (!res.ok) {
        throw new Error(data.message || data.detail || "Self check-in-ul nu a putut fi efectuat.");
      }

      toast("Self check-in finalizat cu succes! Codul tău PIN este activ.", "success");
      setInfo((prev) =>
        prev
          ? {
              ...prev,
              is_checked_in: true,
              access_pin: data.access_pin,
              unit_number: data.unit_number || prev.unit_number,
            }
          : null
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Eroare la finalizarea check-in-ului.";
      setCheckinError(msg);
      toast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestRefund = async () => {
    if (!info?.booking_id) return;
    setRefunding(true);
    setRefundError(null);
    try {
      await apiFetch(`/bookings/${encodeURIComponent(info.booking_id)}/cancel`, {
        method: "POST",
        body: JSON.stringify({
          status: "cancelled",
          cancellation_reason: refundReason.trim() || "Anulare solicitată de client în termen de 30 de zile",
        }),
      });
      toast("Rezervarea a fost anulată și rambursarea a fost inițiată automat prin Stripe.", "success");
      setShowRefundConfirm(false);
      setInfo((prev) =>
        prev
          ? {
              ...prev,
              status: "cancelled",
              payment_status: prev.payment_status === "paid" ? "refunded" : prev.payment_status,
            }
          : null
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Nu am putut procesa anularea și rambursarea. Verifică dacă ești autentificat.";
      setRefundError(msg);
      toast(msg, "error");
    } finally {
      setRefunding(false);
    }
  };

  const refundMeta = (() => {
    if (!info) return { eligible: false, daysLeft: 0, reason: "" };
    if (info.status === "cancelled" || info.status === "completed" || info.is_checked_in) {
      return { eligible: false, daysLeft: 0, reason: "" };
    }
    if (info.rate_plan_code === "non_refundable") {
      return {
        eligible: false,
        daysLeft: 0,
        reason: "Această rezervare a fost efectuată cu planul Nerambursabil.",
      };
    }
    const now = new Date();
    const checkInDate = new Date(info.check_in);
    if (checkInDate < now) {
      return { eligible: false, daysLeft: 0, reason: "Data de check-in a trecut deja." };
    }
    const created = info.created_at ? new Date(info.created_at) : now;
    const daysElapsed = Math.max(0, Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)));
    const daysLeft = Math.max(0, 30 - daysElapsed);
    if (daysElapsed > 30) {
      return {
        eligible: false,
        daysLeft: 0,
        reason: `Termenul de 30 de zile de la rezervare a expirat (${daysElapsed} zile trecute).`,
      };
    }
    return { eligible: true, daysLeft, reason: "" };
  })();

  const copyPin = (pin: string) => {
    navigator.clipboard.writeText(pin);
    setPinCopied(true);
    toast(`Codul PIN ${pin} a fost copiat!`, "success");
    setTimeout(() => setPinCopied(false), 2500);
  };

  const fmtDate = (d?: string) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("ro-RO", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#f8fafd] pt-[96px] pb-16 px-4">
      <div className="mx-auto max-w-[720px]">
        {/* BRAND BADGE */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#c69a3f]/30 bg-[#c69a3f]/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#c69a3f]">
            <KeyRound size={13} /> Self Check-in Online & Cheie Digitală
          </span>
          <h1
            className="mt-3 text-[clamp(1.8rem,3.2vw,2.5rem)] text-[#0d2c5c] font-semibold leading-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Boutique Villa Casa Esy
          </h1>
          <p className="mt-2 text-[14px] text-[#6b7c99]">
            Acces securizat și cod digital de intrare fără așteptare la recepție
          </p>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-[#e1e8f0] bg-white p-12 text-center shadow-sm">
            <RefreshCw size={28} className="mx-auto animate-spin text-[#c69a3f]" />
            <p className="mt-4 text-[14px] font-medium text-[#0d2c5c]">
              Verificare rezervare #{bookingCode}…
            </p>
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 mb-4">
              <KeyRound size={26} />
            </div>
            <h2 className="text-[18px] font-bold text-[#0d2c5c]">Nu am putut efectua check-in-ul</h2>
            <p className="mt-2 text-[13.5px] text-[#6b7c99] max-w-md mx-auto">{error}</p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => void fetchInfo()}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0d2c5c] px-5 py-2.5 text-[12px] font-bold uppercase tracking-wider text-white hover:bg-[#c69a3f]"
              >
                Reîncearcă
              </button>
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-xl border border-[#e1e8f0] bg-white px-5 py-2.5 text-[12px] font-bold uppercase tracking-wider text-[#0d2c5c] hover:bg-[#f8fafd]"
              >
                <Home size={14} /> Acasă
              </Link>
            </div>
          </div>
        ) : info ? (
          <div className="space-y-6">
            {/* BOOKING CARD */}
            <div className="rounded-3xl border border-[#e1e8f0] bg-white p-6 sm:p-8 shadow-[0_10px_35px_rgba(13,44,92,0.05)]">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-[#eef2f7]">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#c69a3f]">
                    Rezervare Confirmată
                  </span>
                  <h2 className="text-[20px] font-bold text-[#0d2c5c]">
                    #{info.booking_code}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                    {info.status === "confirmed" ? "Confirmată" : info.status}
                  </span>
                  {info.is_checked_in && (
                    <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-800 flex items-center gap-1">
                      <CheckCircle2 size={12} /> Check-in Realizat
                    </span>
                  )}
                </div>
              </div>

              {/* DETAILS GRID */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
                <div className="rounded-2xl border border-[#f1f5f9] bg-[#f8fafd] p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6b7c99] block mb-1">
                    Oaspete Titular
                  </span>
                  <p className="font-semibold text-[#0d2c5c] text-[15px]">
                    {info.guest_name || "Oaspete Vila Casa Esy"}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#f1f5f9] bg-[#f8fafd] p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6b7c99] block mb-1">
                    Cameră & Unitate
                  </span>
                  <p className="font-semibold text-[#0d2c5c] text-[15px] flex items-center gap-1.5">
                    <DoorOpen size={16} className="text-[#c69a3f]" />
                    {info.room_name} · Cam {info.unit_number || "Alocată"}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#f1f5f9] bg-[#f8fafd] p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6b7c99] block mb-1">
                    Perioadă Cazare
                  </span>
                  <p className="font-semibold text-[#0d2c5c] flex items-center gap-1.5">
                    <CalendarCheck size={15} className="text-[#c69a3f]" />
                    {fmtDate(info.check_in)} → {fmtDate(info.check_out)}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#f1f5f9] bg-[#f8fafd] p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6b7c99] block mb-1">
                    Wi-Fi Oaspeți
                  </span>
                  <p className="font-semibold text-[#0d2c5c] flex items-center gap-1.5">
                    <Wifi size={15} className="text-[#0d2c5c]" />
                    CasaEsy_Guest · Pass: <span className="font-mono text-[#c69a3f]">Boutique2026</span>
                  </p>
                </div>
              </div>

              {/* DIGITAL PASS (IF CHECKED IN) */}
              {info.is_checked_in && info.access_pin ? (
                <div className="mt-8 rounded-3xl border-2 border-[#c69a3f] bg-gradient-to-br from-[#0c1523] to-[#162740] p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#c69a3f]/10 rounded-full blur-3xl pointer-events-none" />

                  <div className="flex items-center justify-between pb-4 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} className="text-[#e6b85c]" />
                      <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#e6b85c]">
                        Pass Digital Activ · Smart Lock
                      </span>
                    </div>
                    <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-0.5 text-[10.5px] font-bold uppercase tracking-widest">
                      Activ
                    </span>
                  </div>

                  <div className="mt-6 text-center">
                    <p className="text-[12px] uppercase tracking-[0.2em] text-[#9fb3cc]">
                      Codul tău PIN de deblocare ușă
                    </p>
                    <div className="mt-2 flex items-center justify-center gap-3">
                      <span className="font-mono text-[42px] sm:text-[52px] font-black tracking-[0.25em] text-[#e6b85c] drop-shadow-[0_0_15px_rgba(230,184,92,0.4)]">
                        {info.access_pin}
                      </span>
                    </div>
                    <p className="mt-1 text-[12px] text-[#9fb3cc]">
                      Tastați codul urmat de tasta <strong>#</strong> pe clanța camerei{" "}
                      <strong className="text-white">{info.unit_number}</strong>
                    </p>

                    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                      <button
                        onClick={() => copyPin(info.access_pin!)}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#c69a3f] px-5 py-2.5 text-[12px] font-bold uppercase tracking-wider text-[#0c1523] hover:bg-[#e6b85c] transition-colors"
                      >
                        {pinCopied ? <Check size={15} /> : <Copy size={15} />}
                        {pinCopied ? "Copiat!" : "Copiază Codul PIN"}
                      </button>

                      <button
                        onClick={() => setShowKeypadSimulator(!showKeypadSimulator)}
                        className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-[12px] font-bold uppercase tracking-wider text-white hover:bg-white/20 transition-colors"
                      >
                        <KeyRound size={15} />
                        {showKeypadSimulator ? "Ascunde Simulator" : "Testează Clanța Inteligentă"}
                      </button>
                    </div>
                  </div>

                  {/* KEYPAD SIMULATOR EMBEDDED */}
                  {showKeypadSimulator && (
                    <div className="mt-8 pt-8 border-t border-white/15 flex flex-col items-center animate-fadeIn">
                      <p className="text-[12px] text-[#c69a3f] font-semibold mb-4 text-center">
                        Testează codul PIN pe simulatorul digital al clanței:
                      </p>
                      <SmartLockKeypad
                        initialUnitNumber={info.unit_number || "101"}
                        units={[info.unit_number || "101"]}
                      />
                    </div>
                  )}
                </div>
              ) : (
                /* CHECKIN FORM (IF NOT CHECKED IN YET) */
                <form onSubmit={(e) => void handlePerformCheckIn(e)} className="mt-8 pt-6 border-t border-[#eef2f7]">
                  <div className="rounded-2xl border border-[#c69a3f]/40 bg-[#fdfaf5] p-5 mb-6">
                    <div className="flex items-start gap-3">
                      <Clock size={20} className="text-[#c69a3f] shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-[14px] font-bold text-[#0d2c5c]">
                          Pregătit pentru Self Check-in
                        </h4>
                        <p className="text-[12.5px] text-[#6b7c99] mt-1">
                          Confirmă check-in-ul pentru a debloca instant codul digital PIN pe care îl vei folosi
                          la clanța inteligentă a camerei tale.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#2a3b52] mb-1.5">
                        Mențiuni la sosire / Ora estimată (opțional)
                      </label>
                      <input
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Ex: Sosire în jurul orei 16:30, doresc parcare"
                        className="w-full rounded-xl border border-[#cbd5e1] bg-white px-4 py-2.5 text-[13px] text-[#0d2c5c] placeholder-[#94a3b8] focus:border-[#0d2c5c] focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#0d2c5c] py-3.5 px-6 text-[12.5px] font-bold uppercase tracking-[0.16em] text-white hover:bg-[#c69a3f] hover:text-[#0c1523] transition-all shadow-md disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <RefreshCw size={16} className="animate-spin" />
                          Generare Cod PIN…
                        </>
                      ) : (
                        <>
                          <KeyRound size={16} />
                          Finalizează Self Check-in & Obține Cheia Digitală
                        </>
                      )}
                    </button>

                    {checkinError && (
                      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[12.5px] text-amber-900 flex items-start gap-2.5">
                        <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                        <span>{checkinError}</span>
                      </div>
                    )}
                  </div>
                </form>
              )}

              {info.status === "cancelled" ? (
                <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50/70 p-5 text-[13px] text-rose-900 flex items-start gap-3">
                  <RotateCcw size={18} className="text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Rezervare anulată</p>
                    <p className="text-[12.5px] text-rose-800/90 mt-0.5">
                      {info.payment_status === "refunded"
                        ? "Suma achitată a fost rambursată automat prin Stripe pe cardul folosit la plată."
                        : "Această rezervare a fost anulată."}
                    </p>
                  </div>
                </div>
              ) : !info.is_checked_in && (refundMeta.eligible || refundMeta.reason) ? (
                <div className="mt-6 rounded-2xl border border-[#e1e8f0] bg-[#f8fafd] p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <RotateCcw size={18} className="text-[#0d2c5c] shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-[13.5px] font-bold text-[#0d2c5c]">
                          Anulare & Rambursare Automată (max. 30 zile)
                        </h4>
                        <p className="text-[12px] text-[#6b7c99] mt-0.5">
                          {refundMeta.eligible
                            ? `Poți anula rezervarea și primi banii înapoi pe card în termen de 30 de zile de la rezervare (mai ai ${refundMeta.daysLeft} ${
                                refundMeta.daysLeft === 1 ? "zi" : "zile"
                              }).`
                            : refundMeta.reason}
                        </p>
                      </div>
                    </div>

                    {refundMeta.eligible && !showRefundConfirm ? (
                      <button
                        type="button"
                        onClick={() => {
                          setRefundError(null);
                          setShowRefundConfirm(true);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-4 py-2 text-[12px] font-bold text-rose-700 hover:bg-rose-50 transition-colors"
                      >
                        <RotateCcw size={14} />
                        Anulare
                      </button>
                    ) : null}
                  </div>

                  {refundMeta.eligible && showRefundConfirm ? (
                    <div className="mt-4 pt-4 border-t border-[#e1e8f0] space-y-3">
                      <input
                        type="text"
                        value={refundReason}
                        onChange={(e) => setRefundReason(e.target.value)}
                        placeholder="Motivul anulării (opțional)"
                        className="w-full rounded-xl border border-[#cbd5e1] bg-white px-3.5 py-2 text-[12.5px] text-[#0d2c5c] placeholder-[#94a3b8] focus:border-[#0d2c5c] focus:outline-none"
                      />
                      {refundError ? (
                        <p className="text-[12px] text-rose-600 font-medium">{refundError}</p>
                      ) : null}
                      <div className="flex flex-wrap items-center gap-2.5">
                        <button
                          type="button"
                          disabled={refunding}
                          onClick={() => void handleRequestRefund()}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-[12px] font-bold text-white hover:bg-rose-700 transition-colors disabled:opacity-60"
                        >
                          {refunding ? (
                            <RefreshCw size={14} className="animate-spin" />
                          ) : (
                            <RotateCcw size={14} />
                          )}
                          {refunding ? "Se procesează anularea..." : "Confirmă anularea"}
                        </button>
                        <button
                          type="button"
                          disabled={refunding}
                          onClick={() => setShowRefundConfirm(false)}
                          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-[12px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                          Renunță
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>

            {/* NAVIGATION LINKS */}
            <div className="flex items-center justify-between text-[12.5px]">
              <Link
                to="/profile"
                className="font-semibold text-[#0d2c5c] hover:text-[#c69a3f] transition-colors"
              >
                ← Înapoi la Contul Meu
              </Link>
              <Link
                to="/"
                className="inline-flex items-center gap-1 font-semibold text-[#6b7c99] hover:text-[#0d2c5c]"
              >
                <Home size={13} /> Pagina Principală
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
