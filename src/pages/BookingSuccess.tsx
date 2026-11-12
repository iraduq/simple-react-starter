import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Home, Loader2 } from "lucide-react";
import { apiFetch } from "../lib/api";

export default function BookingSuccess() {
  const [searchParams] = useSearchParams();
  const bookingIdParam = searchParams.get("booking_id");
  const sessionId = searchParams.get("session_id");

  const [bookingCode, setBookingCode] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(bookingIdParam);
  const [confirming, setConfirming] = useState<boolean>(Boolean(sessionId));
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const calledRef = useRef(false);

  useEffect(() => {
    if (!sessionId || calledRef.current) return;
    calledRef.current = true;
    setConfirming(true);
    apiFetch<{ status: string; booking_id: string; booking_code: string }>(
      `/payments/confirm-session?session_id=${encodeURIComponent(sessionId)}`,
      { method: "POST" }
    )
      .then((res) => {
        if (res?.booking_id) setBookingId(res.booking_id);
        if (res?.booking_code) setBookingCode(res.booking_code);
      })
      .catch((err: any) => {
        setConfirmError(
          err?.message || "Plata a fost înregistrată, dar confirmarea automată este în curs."
        );
      })
      .finally(() => setConfirming(false));
  }, [sessionId]);

  return (
    <div className="mx-auto max-w-[600px] px-4 py-20 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
        {confirming ? (
          <Loader2 size={32} className="animate-spin text-[#0d2c5c]" />
        ) : (
          <CheckCircle2 size={36} />
        )}
      </div>
      <h1
        className="mt-4 text-[24px] font-bold text-[#0d2c5c]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {confirming ? "Se confirmă rezervarea…" : "Plată reușită!"}
      </h1>
      <p className="mt-2 text-[14.5px] text-[#6b7c99]">
        {confirming
          ? "Finalizăm înregistrarea plății și generăm codul tău de acces…"
          : confirmError
            ? confirmError
            : "Rezervarea ta a fost confirmată cu succes. Am trimis detaliile și codul QR pe adresa ta de email."}
      </p>

      {(bookingCode || bookingId) && (
        <p className="mt-4 text-[12px] text-[#8595aa]">
          {bookingCode ? "Cod rezervare: " : "ID Rezervare: "}
          <span className="font-mono font-semibold text-[#0d2c5c]">
            {bookingCode || bookingId}
          </span>
        </p>
      )}

      <div className="mt-8 flex justify-center gap-4">
        <Link
          to="/profile?tab=reservations"
          className="inline-flex items-center gap-2 rounded-xl bg-[#0d2c5c] px-5 py-3 text-[12px] font-bold uppercase tracking-[0.14em] text-white hover:bg-[#c69a3f]"
        >
          Vezi rezervările mele
        </Link>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl border border-[#e1e8f0] bg-white px-5 py-3 text-[12px] font-bold uppercase tracking-[0.14em] text-[#0d2c5c] hover:bg-[#f6f9fd]"
        >
          <Home size={15} /> Acasă
        </Link>
      </div>
    </div>
  );
}
