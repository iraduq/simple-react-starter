import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Home } from "lucide-react";

export default function BookingSuccess() {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("booking_id");
  const sessionId = searchParams.get("session_id");

  return (
    <div className="mx-auto max-w-[600px] px-4 py-20 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
        <CheckCircle2 size={36} />
      </div>
      <h1
        className="mt-4 text-[24px] font-bold text-[#0d2c5c]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Plată reușită!
      </h1>
      <p className="mt-2 text-[14.5px] text-[#6b7c99]">
        Rezervarea ta a fost confirmată cu succes. Am trimis detaliile și codul
        QR pe adresa ta de email.
      </p>

      {bookingId && (
        <p className="mt-4 text-[12px] text-[#8595aa]">
          ID Rezervare:{" "}
          <span className="font-mono font-semibold">{bookingId}</span>
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
