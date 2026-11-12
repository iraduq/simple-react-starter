import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  BedDouble,
  CalendarDays,
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  Download,
  Home,
  KeyRound,
  Loader2,
  Mail,
  QrCode,
  Sparkles,
  Users,
} from "lucide-react";
import { apiFetch } from "../lib/api";
import { downloadBookingInvoicePdf } from "../lib/admin";

interface BookingConfirmationDetails {
  status?: string;
  booking_id: string;
  booking_code: string;
  room_title?: string | null;
  room_image?: string | null;
  room_size_sqm?: number | null;
  unit_number?: string | null;
  check_in?: string | null;
  check_out?: string | null;
  guests_adults?: number;
  guests_children?: number;
  rate_plan_code?: string | null;
  total_price?: number | null;
  guest_name?: string | null;
  guest_email?: string | null;
  special_requests?: string | null;
  access_pin?: string | null;
  qr_data_url?: string | null;
}

const RATE_PLAN_LABELS: Record<string, string> = {
  flexible: "Tarif Flexibil (Anulare gratuită)",
  non_refundable: "Tarif Nerambursabil",
  breakfast_included: "Mic dejun inclus",
  half_board: "Demipensiune inclusă",
};

function formatRoDate(iso?: string | null): string {
  if (!iso) return "—";
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleDateString("ro-RO", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function calcNights(checkIn?: string | null, checkOut?: string | null): number | null {
  if (!checkIn || !checkOut) return null;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  const diffDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 1;
}

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

      apiFetch<BookingConfirmationDetails>(
        `/payments/confirm-session?session_id=${encodeURIComponent(sessionId)}`,
        { method: "POST" }
      )
        .then((res) => {
          if (!active) return;
          setDetails(res);
        })
        .catch((err) => {
          if (!active) return;
          setConfirmError(err instanceof Error ? err.message : "Nu am putut confirma plata.");
        })
        .finally(() => {
          if (active) setConfirming(false);
        });

      return () => {
        active = false;
      };
    }

    if (bookingIdParam) {
      let active = true;
      setConfirming(true);
      apiFetch<{
        id: string;
        booking_code: string;
        check_in?: string;
        check_out?: string;
        guests_adults?: number;
        guests_children?: number;
        total_price?: number;
        rate_plan_code?: string;
        special_requests?: string | null;
        access_pin?: string | null;
        room?: { title?: string; size_sqm?: number; images?: { image_url: string }[] };
        room_unit?: { unit_number?: string };
      }>(`/bookings/${encodeURIComponent(bookingIdParam)}`)
        .then((b) => {
          if (!active) return;
          setDetails({
            status: "confirmed",
            booking_id: b.id,
            booking_code: b.booking_code,
            room_title: b.room?.title ?? null,
            room_image: b.room?.images?.[0]?.image_url ?? null,
            room_size_sqm: b.room?.size_sqm ?? null,
            unit_number: b.room_unit?.unit_number ?? null,
            check_in: b.check_in ?? null,
            check_out: b.check_out ?? null,
            guests_adults: b.guests_adults,
            guests_children: b.guests_children,
            rate_plan_code: b.rate_plan_code ?? null,
            total_price: b.total_price ?? null,
            special_requests: b.special_requests ?? null,
            access_pin: b.access_pin ?? null,
          });
        })
        .catch(() => {
          // Keep minimal bookingIdParam fallback if unauthenticated
        })
        .finally(() => {
          if (active) setConfirming(false);
        });

      return () => {
        active = false;
      };
    }
  }, [sessionId, bookingIdParam]);

  const bookingCode = details?.booking_code || details?.booking_id || "";
  const nights = useMemo(
    () => calcNights(details?.check_in, details?.check_out),
    [details?.check_in, details?.check_out]
  );

  const qrImageSrc = useMemo(() => {
    if (details?.qr_data_url) return details.qr_data_url;
    if (!bookingCode) return "";
    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&color=0d2c5c&data=${encodeURIComponent(
      bookingCode
    )}`;
  }, [details?.qr_data_url, bookingCode]);

  const ratePlanLabel =
    (details?.rate_plan_code && RATE_PLAN_LABELS[details.rate_plan_code]) ||
    details?.rate_plan_code ||
    "Tarif Standard";

  async function handleCopyCode() {
    if (!bookingCode) return;
    try {
      await navigator.clipboard.writeText(bookingCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2200);
    } catch {
      // Clipboard API unavailable
    }
  }

  async function handleDownloadInvoice() {
    if (!bookingCode) return;
    setDownloadingPdf(true);
    setPdfError(null);
    try {
      await downloadBookingInvoicePdf(bookingCode, bookingCode);
    } catch (err) {
      setPdfError(
        err instanceof Error ? err.message : "Nu am putut descărca factura. Încearcă din profil."
      );
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
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#c69a3f] mb-2">
            Casa Esy Hospitality
          </p>
          <h1 className="text-2xl font-bold text-[#0d2c5c] mb-2">Confirmăm rezervarea ta...</h1>
          <p className="text-sm text-slate-500">
            Verificăm plata prin Stripe, alocăm camera și generăm permisul digital QR.
          </p>
        </div>
      </div>
    );
  }

  if (confirmError) {
    return (
      <div className="min-h-screen bg-[#f8f6f1] flex items-center justify-center px-4 py-20">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-rose-200 p-8 text-center">
          <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <CreditCard className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-[#0d2c5c] mb-2">Confirmare în așteptare</h1>
          <p className="text-sm text-slate-600 mb-6">{confirmError}</p>
          <div className="flex flex-col gap-3">
            <Link
              to="/profile"
              className="w-full bg-[#0d2c5c] text-white py-3 rounded-xl font-medium hover:bg-[#143d7a] transition-colors"
            >
              Vezi rezervările mele
            </Link>
            <Link
              to="/"
              className="w-full border border-slate-200 text-slate-700 py-3 rounded-xl font-medium hover:bg-slate-50 transition-colors"
            >
              Înapoi acasă
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f6f1] pb-16">
      {/* Hero Banner */}
      <div className="bg-[#0d2c5c] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#c69a3f] blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#c69a3f] blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#c69a3f]/20 border border-[#c69a3f]/40 text-[#f3d48b] text-xs font-semibold uppercase tracking-[0.2em] mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            Plată confirmată cu succes
          </div>

          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400/60 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-950/30">
            <CheckCircle2 className="w-9 h-9 text-emerald-300" />
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold tracking-tight text-white mb-3">
            Mulțumim{details?.guest_name ? `, ${details.guest_name}` : ""}!
          </h1>
          <p className="text-slate-200 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Rezervarea ta la <span className="text-[#f3d48b] font-semibold">Casa Esy</span> este
            confirmată și garantată. Am trimis detaliile sejurului și permisul QR pe{" "}
            <span className="underline decoration-[#c69a3f]/60 underline-offset-4">
              {details?.guest_email || "adresa ta de email"}
            </span>
            .
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-6 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Room & Stay Details */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl shadow-lg shadow-[#0d2c5c]/5 border border-slate-200/80 overflow-hidden">
              {details?.room_image ? (
                <div className="relative h-56 sm:h-64 w-full overflow-hidden">
                  <img
                    src={details.room_image}
                    alt={details.room_title || "Camera rezervată"}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d2c5c]/85 via-[#0d2c5c]/25 to-transparent" />
                  <div className="absolute bottom-4 left-5 right-5 flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#c69a3f] text-[#0d2c5c] text-xs font-bold uppercase tracking-wider mb-2">
                        <BedDouble className="w-3.5 h-3.5" />
                        {details.unit_number
                          ? `Camera alocată: ${details.unit_number}`
                          : "Suită confirmată"}
                      </span>
                      <h2 className="text-2xl font-serif font-bold text-white leading-tight">
                        {details.room_title || "Camera Casa Esy"}
                      </h2>
                    </div>
                    {details.room_size_sqm ? (
                      <span className="px-3 py-1 rounded-lg bg-white/15 backdrop-blur-md text-white text-xs font-medium border border-white/20">
                        {details.room_size_sqm} m²
                      </span>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-[#0d2c5c] to-[#163e7d] px-6 py-5 text-white flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#c69a3f] text-[#0d2c5c] text-xs font-bold uppercase tracking-wider mb-2">
                      <BedDouble className="w-3.5 h-3.5" />
                      {details?.unit_number
                        ? `Camera alocată: ${details.unit_number}`
                        : "Cameră confirmată"}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-serif font-bold">
                      {details?.room_title || "Rezervare Casa Esy"}
                    </h2>
                  </div>
                </div>
              )}

              <div className="p-6 sm:p-7 space-y-6">
                {/* Check-in / Check-out Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-[#fdf8ec] border border-[#c69a3f]/25 p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#9c7624] mb-1.5">
                      <CalendarDays className="w-4 h-4" />
                      Check-in
                    </div>
                    <p className="text-base font-bold text-[#0d2c5c]">
                      {formatRoDate(details?.check_in)}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">Începând cu ora 15:00</p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                      <CalendarDays className="w-4 h-4" />
                      Check-out
                    </div>
                    <p className="text-base font-bold text-[#0d2c5c]">
                      {formatRoDate(details?.check_out)}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">Până la ora 11:00</p>
                  </div>
                </div>

                {/* Stay Summary Rows */}
                <div className="divide-y divide-slate-100 border-t border-b border-slate-100 text-sm">
                  <div className="py-3.5 flex items-center justify-between gap-4">
                    <span className="text-slate-500 flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#c69a3f]" />
                      Oaspeți & Durată
                    </span>
                    <span className="font-semibold text-[#0d2c5c] text-right">
                      {nights ? `${nights} ${nights === 1 ? "noapte" : "nopți"} • ` : ""}
                      {details?.guests_adults ?? 1}{" "}
                      {(details?.guests_adults ?? 1) === 1 ? "adult" : "adulți"}
                      {details?.guests_children
                        ? `, ${details.guests_children} ${
                            details.guests_children === 1 ? "copil" : "copii"
                          }`
                        : ""}
                    </span>
                  </div>

                  <div className="py-3.5 flex items-center justify-between gap-4">
                    <span className="text-slate-500 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#c69a3f]" />
                      Plan tarifar
                    </span>
                    <span className="font-semibold text-[#0d2c5c] text-right">{ratePlanLabel}</span>
                  </div>

                  {details?.total_price != null ? (
                    <div className="py-4 flex items-center justify-between gap-4">
                      <span className="text-slate-600 font-medium flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-emerald-600" />
                        Total achitat
                      </span>
                      <div className="flex items-center gap-2.5">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                          Plătit
                        </span>
                        <span className="text-xl font-bold text-[#0d2c5c]">
                          {Number(details.total_price).toFixed(2)} RON
                        </span>
                      </div>
                    </div>
                  ) : null}
                </div>

                {details?.special_requests ? (
                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                      Cerințe speciale înregistrate
                    </p>
                    <p className="text-sm text-slate-700 italic">"{details.special_requests}"</p>
                  </div>
                ) : null}

                {/* Next steps guide */}
                <div className="rounded-2xl bg-[#0d2c5c]/[0.03] border border-[#0d2c5c]/10 p-5">
                  <h3 className="text-sm font-bold text-[#0d2c5c] uppercase tracking-wider mb-3">
                    Ce urmează până la sosire?
                  </h3>
                  <ul className="space-y-2.5 text-sm text-slate-600">
                    <li className="flex items-start gap-2.5">
                      <Mail className="w-4 h-4 text-[#c69a3f] shrink-0 mt-0.5" />
                      <span>
                        Ai primit confirmarea pe email împreună cu factura și detaliile de acces.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <KeyRound className="w-4 h-4 text-[#c69a3f] shrink-0 mt-0.5" />
                      <span>
                        Poți completa <strong>Check-in-ul Online</strong> chiar acum pentru a primi
                        cheia instant la sosire.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <QrCode className="w-4 h-4 text-[#c69a3f] shrink-0 mt-0.5" />
                      <span>
                        Prezintă codul QR de mai alăturat la recepție pentru verificare în câteva
                        secunde.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Digital QR Pass & Actions */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white rounded-3xl shadow-xl shadow-[#0d2c5c]/10 border-t-4 border-[#c69a3f] border-x border-b border-slate-200/80 overflow-hidden">
              <div className="p-6 sm:p-7 text-center">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#c69a3f] mb-1">
                  Digital Boarding Pass
                </p>
                <h3 className="text-xl font-serif font-bold text-[#0d2c5c] mb-5">
                  Cod QR & Referință Check-in
                </h3>

                {qrImageSrc ? (
                  <div className="inline-flex p-4 rounded-2xl bg-[#fdf8ec] border border-[#c69a3f]/30 shadow-inner mb-5">
                    <img
                      src={qrImageSrc}
                      alt={`Cod QR rezervare ${bookingCode}`}
                      className="w-44 h-44 rounded-xl bg-white p-2 shadow-sm"
                    />
                  </div>
                ) : null}

                {bookingCode ? (
                  <div className="rounded-2xl bg-[#0d2c5c]/5 border border-[#0d2c5c]/10 p-4 mb-4">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-1">
                      Cod rezervare
                    </p>
                    <div className="flex items-center justify-center gap-2.5">
                      <span className="font-mono text-2xl font-extrabold tracking-widest text-[#0d2c5c]">
                        {bookingCode}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyCode}
                        title="Copiază codul rezervării"
                        className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-[#0d2c5c] hover:border-[#0d2c5c]/30 transition-colors"
                      >
                        {copiedCode ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {copiedCode ? (
                      <p className="text-xs text-emerald-600 font-medium mt-1">
                        Cod copiat în clipboard!
                      </p>
                    ) : null}
                  </div>
                ) : null}

                {details?.access_pin ? (
                  <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2.5 mb-5 flex items-center justify-between text-sm">
                    <span className="text-emerald-800 font-medium flex items-center gap-1.5">
                      <KeyRound className="w-4 h-4" />
                      PIN acces cameră
                    </span>
                    <span className="font-mono font-bold text-emerald-900 tracking-wider">
                      {details.access_pin}
                    </span>
                  </div>
                ) : null}

                {/* Primary & Secondary Actions */}
                <div className="space-y-2.5 pt-2">
                  {bookingCode ? (
                    <Link
                      to={`/checkin/${encodeURIComponent(bookingCode)}`}
                      className="w-full inline-flex items-center justify-center gap-2 bg-[#0d2c5c] text-white py-3.5 px-5 rounded-xl font-semibold hover:bg-[#143d7a] transition-colors shadow-md shadow-[#0d2c5c]/15"
                    >
                      <KeyRound className="w-4 h-4 text-[#f3d48b]" />
                      Completează Check-in Online
                    </Link>
                  ) : null}

                  {bookingCode ? (
                    <button
                      type="button"
                      onClick={handleDownloadInvoice}
                      disabled={downloadingPdf}
                      className="w-full inline-flex items-center justify-center gap-2 bg-[#fdf8ec] text-[#0d2c5c] border border-[#c69a3f]/40 py-3 px-5 rounded-xl font-semibold hover:bg-[#faefd6] transition-colors disabled:opacity-60"
                    >
                      {downloadingPdf ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4 text-[#9c7624]" />
                      )}
                      {downloadingPdf ? "Se descarcă factura..." : "Descarcă factura PDF"}
                    </button>
                  ) : null}

                  {pdfError ? (
                    <p className="text-xs text-rose-600 text-center pt-1">{pdfError}</p>
                  ) : null}

                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <Link
                      to="/profile"
                      className="inline-flex items-center justify-center gap-1.5 border border-slate-200 text-slate-700 py-2.5 px-3 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
                    >
                      Rezervările mele
                    </Link>
                    <Link
                      to="/"
                      className="inline-flex items-center justify-center gap-1.5 border border-slate-200 text-slate-700 py-2.5 px-3 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
                    >
                      <Home className="w-4 h-4" />
                      Acasă
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
