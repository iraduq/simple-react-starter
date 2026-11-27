import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CreditCard, Loader2 } from "lucide-react";
import { apiFetch } from "../lib/api";
import { downloadBookingInvoicePdf } from "../lib/admin";
import { type BookingConfirmationDetails, RATE_PLAN_LABELS, calcNights } from "./BookingSuccess/types";
import BookingSuccessHero from "./BookingSuccess/components/BookingSuccessHero";
import StayDetailsCard from "./BookingSuccess/components/StayDetailsCard";
import DigitalPassCard from "./BookingSuccess/components/DigitalPassCard";

export default function BookingSuccess() {
  const [searchParams] = useSearchParams();
  const bookingIdParam = searchParams.get("booking_id");
  const sessionId = searchParams.get("session_id");

  const [details, setDetails] = useState<BookingConfirmationDetails | null>(
    bookingIdParam ? { booking_id: bookingIdParam, booking_code: bookingIdParam } : null
  );
  const [confirming, setConfirming] = useState<boolean>(Boolean(sessionId || bookingIdParam));
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const confirmedSessionRef = useRef<string | null>(null);

  useEffect(() => {
    if (sessionId) {
      if (confirmedSessionRef.current === sessionId) return;
      confirmedSessionRef.current = sessionId;
      let active = true;
      setConfirming(true);
      setConfirmError(null);

      apiFetch<BookingConfirmationDetails>(`/payments/confirm-session?session_id=${encodeURIComponent(sessionId)}`, { method: "POST" })
        .then((res) => { if (active) setDetails(res); })
        .catch((err) => { if (active) setConfirmError(err instanceof Error ? err.message : "Nu am putut confirma plata."); })
        .finally(() => { if (active) setConfirming(false); });

      return () => { active = false; };
    }

    if (bookingIdParam) {
      let active = true;
      setConfirming(true);
      apiFetch<{
        id: string; booking_code: string; check_in?: string; check_out?: string;
        guests_adults?: number; guests_children?: number; total_price?: number;
        rate_plan_code?: string; special_requests?: string | null; access_pin?: string | null;
        room?: { title?: string; size_sqm?: number; images?: { image_url: string }[] };
        room_unit?: { unit_number?: string };
      }>(`/bookings/${encodeURIComponent(bookingIdParam)}`)
        .then((b) => {
          if (!active) return;
          setDetails({
            status: "confirmed", booking_id: b.id, booking_code: b.booking_code,
            room_title: b.room?.title ?? null, room_image: b.room?.images?.[0]?.image_url ?? null,
            room_size_sqm: b.room?.size_sqm ?? null, unit_number: b.room_unit?.unit_number ?? null,
            check_in: b.check_in ?? null, check_out: b.check_out ?? null,
            guests_adults: b.guests_adults, guests_children: b.guests_children,
            rate_plan_code: b.rate_plan_code ?? null, total_price: b.total_price ?? null,
            special_requests: b.special_requests ?? null, access_pin: b.access_pin ?? null,
          });
        })
        .catch(() => {})
        .finally(() => { if (active) setConfirming(false); });

      return () => { active = false; };
    }
  }, [sessionId, bookingIdParam]);

  const bookingCode = details?.booking_code || details?.booking_id || "";
  const nights = useMemo(() => calcNights(details?.check_in, details?.check_out), [details?.check_in, details?.check_out]);
  const qrImageSrc = useMemo(() => {
    if (details?.qr_data_url) return details.qr_data_url;
    if (!bookingCode) return "";
    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&color=0d2c5c&data=${encodeURIComponent(bookingCode)}`;
  }, [details?.qr_data_url, bookingCode]);

  const ratePlanLabel = (details?.rate_plan_code && RATE_PLAN_LABELS[details.rate_plan_code]) || details?.rate_plan_code || "Tarif Standard";

  async function handleCopyCode() {
    if (!bookingCode) return;
    try {
      await navigator.clipboard.writeText(bookingCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2200);
    } catch {}
  }

  async function handleDownloadInvoice() {
    if (!bookingCode) return;
    setDownloadingPdf(true);
    setPdfError(null);
    try {
      await downloadBookingInvoicePdf(bookingCode, bookingCode);
    } catch (err) {
      setPdfError(err instanceof Error ? err.message : "Nu am putut descărca factura. Încearcă din profil.");
    } finally {
      setDownloadingPdf(false);
    }
  }

  if (confirming) {
    return (
      <div className="min-h-screen bg-[#f8f6f1] flex items-center justify-center px-4 py-20">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-[#c69a3f]/25 p-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#0d2c5c]/5 border border-[#0d2c5c]/10 flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-8 h-8 text-[#0d2c5c] animate-spin" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#c69a3f] mb-2">Casa Esy Hospitality</p>
          <h1 className="text-2xl font-bold text-[#0d2c5c] mb-2">Confirmăm rezervarea ta...</h1>
          <p className="text-sm text-slate-500">Verificăm plata prin Stripe, alocăm camera și generăm permisul digital QR.</p>
        </div>
      </div>
    );
  }

  if (confirmError) {
    return (
      <div className="min-h-screen bg-[#f8f6f1] flex items-center justify-center px-4 py-20">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-rose-200 p-8 text-center">
          <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-5"><CreditCard className="w-7 h-7" /></div>
          <h1 className="text-2xl font-bold text-[#0d2c5c] mb-2">Confirmare în așteptare</h1>
          <p className="text-sm text-slate-600 mb-6">{confirmError}</p>
          <div className="flex flex-col gap-3">
            <Link to="/profile" className="w-full bg-[#0d2c5c] text-white py-3 rounded-xl font-medium hover:bg-[#143d7a] transition-colors">Vezi rezervările mele</Link>
            <Link to="/" className="w-full border border-slate-200 text-slate-700 py-3 rounded-xl font-medium hover:bg-slate-50 transition-colors">Înapoi acasă</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f6f1] pb-16">
      <BookingSuccessHero guestName={details?.guest_name} guestEmail={details?.guest_email} />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-6 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 space-y-6">
            <StayDetailsCard details={details} nights={nights} ratePlanLabel={ratePlanLabel} />
          </div>
          <div className="lg:col-span-5 space-y-5">
            <DigitalPassCard bookingCode={bookingCode} qrImageSrc={qrImageSrc} accessPin={details?.access_pin} copiedCode={copiedCode} onCopyCode={handleCopyCode} downloadingPdf={downloadingPdf} pdfError={pdfError} onDownloadInvoice={handleDownloadInvoice} />
          </div>
        </div>
      </div>
    </div>
  );
}
