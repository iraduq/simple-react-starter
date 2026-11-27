import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle2, Home, RefreshCw, KeyRound } from "lucide-react";
import { API_URL } from "../lib/config";
import { apiFetch } from "../lib/api";
import { useToast } from "../components/Toast";
import { type CheckInInfo, calculateRefundMeta } from "../types/checkin";
import CheckInHeader from "../components/checkin/CheckInHeader";
import CheckInDetailsGrid from "../components/checkin/CheckInDetailsGrid";
import DigitalSmartLockCard from "../components/checkin/DigitalSmartLockCard";
import CheckInForm from "../components/checkin/CheckInForm";
import RefundSection from "../components/checkin/RefundSection";

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
      if (res.status === 404) res = await fetch(`${API_URL}/checkin/${bookingCode}/info`);
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as Record<string, string>;
        throw new Error(data.detail || data.message || "Rezervarea nu a fost găsită.");
      }
      const data: CheckInInfo = await res.json();
      setInfo(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Nu am putut prelua detaliile rezervării.");
    } finally {
      setLoading(false);
    }
  }, [bookingCode]);

  useEffect(() => {
    let active = true;
    (async () => { if (active) await fetchInfo(); })();
    return () => { active = false; };
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
      if (!res.ok) throw new Error(data.message || data.detail || "Self check-in-ul nu a putut fi efectuat.");
      toast("Self check-in finalizat cu succes! Codul tău PIN este activ.", "success");
      setInfo((prev: any) => prev ? { ...prev, is_checked_in: true, access_pin: data.access_pin, unit_number: data.unit_number || prev.unit_number } : null);
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
        body: JSON.stringify({ status: "cancelled", cancellation_reason: refundReason.trim() || "Anulare solicitată de client în termen de 30 de zile" }),
      });
      toast("Rezervarea a fost anulată și rambursarea a fost inițiată automat prin Stripe.", "success");
      setShowRefundConfirm(false);
      setInfo((prev: any) => prev ? { ...prev, status: "cancelled", payment_status: prev.payment_status === "paid" ? "refunded" : prev.payment_status } : null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Nu am putut procesa anularea și rambursarea. Verifică dacă ești autentificat.";
      setRefundError(msg);
      toast(msg, "error");
    } finally {
      setRefunding(false);
    }
  };

  const refundMeta = useMemo(() => calculateRefundMeta(info), [info]);

  const copyPin = (pin: string) => {
    navigator.clipboard.writeText(pin);
    setPinCopied(true);
    toast(`Codul PIN ${pin} a fost copiat!`, "success");
    setTimeout(() => setPinCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#f8fafd] pt-[96px] pb-16 px-4">
      <div className="mx-auto max-w-[720px]">
        <CheckInHeader />
        {loading ? (
          <div className="rounded-3xl border border-[#e1e8f0] bg-white p-12 text-center shadow-sm">
            <RefreshCw size={28} className="mx-auto animate-spin text-[#c69a3f]" />
            <p className="mt-4 text-[14px] font-medium text-[#0d2c5c]">Verificare rezervare #{bookingCode}…</p>
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 mb-4"><KeyRound size={26} /></div>
            <h2 className="text-[18px] font-bold text-[#0d2c5c]">Nu am putut efectua check-in-ul</h2>
            <p className="mt-2 text-[13.5px] text-[#6b7c99] max-w-md mx-auto">{error}</p>
            <div className="mt-6 flex justify-center gap-3">
              <button onClick={() => void fetchInfo()} className="inline-flex items-center gap-2 rounded-xl bg-[#0d2c5c] px-5 py-2.5 text-[12px] font-bold uppercase tracking-wider text-white hover:bg-[#c69a3f]">Reîncearcă</button>
              <Link to="/" className="inline-flex items-center gap-2 rounded-xl border border-[#e1e8f0] bg-white px-5 py-2.5 text-[12px] font-bold uppercase tracking-wider text-[#0d2c5c] hover:bg-[#f8fafd]"><Home size={14} /> Acasă</Link>
            </div>
          </div>
        ) : info ? (
          <div className="space-y-6">
            <div className="rounded-3xl border border-[#e1e8f0] bg-white p-6 sm:p-8 shadow-[0_10px_35px_rgba(13,44,92,0.05)]">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-[#eef2f7]">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#c69a3f]">Rezervare Confirmată</span>
                  <h2 className="text-[20px] font-bold text-[#0d2c5c]">#{info.booking_code}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-800">{info.status === "confirmed" ? "Confirmată" : info.status}</span>
                  {info.is_checked_in && <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-800 flex items-center gap-1"><CheckCircle2 size={12} /> Check-in Realizat</span>}
                </div>
              </div>
              <CheckInDetailsGrid info={info} />
              {info.is_checked_in && info.access_pin ? (
                <DigitalSmartLockCard accessPin={info.access_pin} unitNumber={info.unit_number} pinCopied={pinCopied} onCopyPin={copyPin} showKeypadSimulator={showKeypadSimulator} onToggleSimulator={() => setShowKeypadSimulator(!showKeypadSimulator)} />
              ) : (
                <CheckInForm notes={notes} setNotes={setNotes} submitting={submitting} checkinError={checkinError} onSubmit={(e) => void handlePerformCheckIn(e)} />
              )}
              <RefundSection info={info} refundMeta={refundMeta} showRefundConfirm={showRefundConfirm} setShowRefundConfirm={setShowRefundConfirm} refundReason={refundReason} setRefundReason={setRefundReason} refunding={refunding} refundError={refundError} setRefundError={setRefundError} onRequestRefund={handleRequestRefund} />
            </div>
            <div className="flex items-center justify-between text-[12.5px]">
              <Link to="/profile" className="font-semibold text-[#0d2c5c] hover:text-[#c69a3f] transition-colors">← Înapoi la Contul Meu</Link>
              <Link to="/" className="inline-flex items-center gap-1 font-semibold text-[#6b7c99] hover:text-[#0d2c5c]"><Home size={13} /> Pagina Principală</Link>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
