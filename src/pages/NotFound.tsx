import { Link } from "react-router-dom";
import { ArrowLeft, BedDouble, Compass, PhoneCall } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative min-h-[82vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#faf8f3] via-white to-[#f6f8fc] px-6 py-20">
      {/* Motive marine discrete în fundal — exact în stilul Casa Esy */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-[#c69a3f]/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-[#0d2c5c]/8 blur-3xl"
      />

      <div className="relative z-10 w-full max-w-2xl rounded-[28px] border border-[#e5dcc3] bg-white/95 p-8 sm:p-12 text-center shadow-[0_24px_64px_rgba(13,44,92,0.08)]">
        {/* Bandă aurie fină sus */}
        <div
          aria-hidden="true"
          className="absolute inset-x-10 top-0 h-[3px] rounded-b-full bg-gradient-to-r from-transparent via-[#c69a3f] to-transparent"
        />

        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0d2c5c] text-[#f5d588] shadow-[0_12px_28px_rgba(13,44,92,0.22)] ring-4 ring-[#fdf6e2]">
          <Compass size={30} strokeWidth={1.6} />
        </div>

        <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-[#9a7222]">
          Vila Casa Esy · Eforie Nord
        </p>

        <div
          className="mt-2 text-[76px] sm:text-[92px] font-semibold leading-none tracking-tight text-[#c69a3f]"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          404
        </div>

        <h1
          className="mt-3 text-[28px] sm:text-[34px] font-semibold text-[#0d2c5c] leading-tight"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          Această pagină nu a fost găsită
        </h1>

        <p className="mx-auto mt-3 max-w-md text-[14.5px] leading-relaxed text-[#5e718f]">
          Se pare că adresa pe care o cauți a fost mutată sau nu există. Te poți întoarce la pagina principală sau poți explora camerele noastre de la malul mării.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full bg-[#0d2c5c] px-6 py-3 text-[12px] font-bold uppercase tracking-[0.14em] text-[#f5d588] shadow-[0_10px_24px_rgba(13,44,92,0.20)] transition hover:bg-[#163c78] no-underline"
          >
            <ArrowLeft size={15} />
            Înapoi Acasă
          </Link>

          <Link
            to="/camere"
            className="inline-flex items-center gap-2 rounded-full border border-[#d8e1ee] bg-white px-6 py-3 text-[12px] font-bold uppercase tracking-[0.14em] text-[#0d2c5c] transition hover:border-[#c69a3f] hover:bg-[#fffdf7] no-underline"
          >
            <BedDouble size={15} className="text-[#c69a3f]" />
            Vezi Camerele
          </Link>

          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-full border border-[#e5dcc3] bg-[#fdfaf2] px-5 py-3 text-[12px] font-bold uppercase tracking-[0.14em] text-[#8a6420] transition hover:border-[#c69a3f] no-underline"
          >
            <PhoneCall size={14} />
            Contact
          </Link>
        </div>
      </div>
    </div>
  );
}
