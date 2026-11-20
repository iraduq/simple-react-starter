import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, BedDouble, PhoneCall } from "lucide-react";

export default function NotFound() {
  const { pathname } = useLocation();

  return (
    <div className="min-h-[82vh] flex flex-col bg-[#faf8f3]">
      {/* Hero full-width cu valul curbat signature Vila Casa Esy + accent roșu bordeaux */}
      <section
        className="relative overflow-hidden pt-32 pb-24 px-6 text-center text-white"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(185,28,28,0.42) 0%, rgba(13,44,92,0.96) 58%, #0a1f44 100%)",
        }}
      >
        <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#f5d588]/90">
          — Eroare 404 · Vila Casa Esy —
        </p>

        <div
          className="mt-4 text-[104px] sm:text-[148px] font-semibold leading-none tracking-tight text-white"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          4<span className="text-[#ef4444]">0</span>4
        </div>

        <h1
          className="mt-3 text-[32px] sm:text-[46px] font-medium text-white leading-tight max-w-3xl mx-auto"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          Pagina căutată nu a fost găsită
        </h1>

        {/* Valul curbat signature Casa Esy */}
        <svg
          viewBox="0 0 1440 72"
          fill="none"
          preserveAspectRatio="none"
          className="pointer-events-none absolute bottom-0 left-0 right-0 w-full h-10 sm:h-14"
          aria-hidden="true"
        >
          <path
            d="M0,36 C360,78 1080,-6 1440,36 L1440,72 L0,72 Z"
            fill="#faf8f3"
          />
        </svg>
      </section>

      {/* Zonă deschisă pe toată pagina — fără carduri și fără borduri */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-14 sm:py-20 text-center">
        <p className="max-w-xl text-[15.5px] sm:text-[16.5px] leading-relaxed text-[#4f6280]">
          Adresa pe care ai accesat-o nu există sau a fost mutată. Poți reveni la pagina principală sau poți explora camerele și facilitățile noastre din Eforie Nord.
        </p>

        {pathname && pathname !== "/" && (
          <p className="mt-4 text-[13px] font-mono font-semibold text-[#b91c1c]">
            Rută inexistentă: {pathname}
          </p>
        )}

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3.5">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full bg-[#0d2c5c] px-7 py-3.5 text-[12px] font-bold uppercase tracking-[0.15em] text-[#f5d588] shadow-[0_10px_26px_rgba(13,44,92,0.18)] transition hover:bg-[#163c78] no-underline"
          >
            <ArrowLeft size={15} />
            Înapoi Acasă
          </Link>

          <Link
            to="/camere"
            className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-[12px] font-bold uppercase tracking-[0.15em] text-[#0d2c5c] shadow-[0_4px_16px_rgba(13,44,92,0.06)] transition hover:bg-[#fffdf7] no-underline"
          >
            <BedDouble size={15} className="text-[#c69a3f]" />
            Vezi Camerele
          </Link>

          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-full bg-[#b91c1c] px-6 py-3.5 text-[12px] font-bold uppercase tracking-[0.15em] text-white shadow-[0_8px_22px_rgba(185,28,28,0.22)] transition hover:bg-[#991b1b] no-underline"
          >
            <PhoneCall size={14} />
            Contact Recepție
          </Link>
        </div>
      </section>
    </div>
  );
}
