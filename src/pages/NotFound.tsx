import { Link, useLocation } from "react-router-dom";
import { AlertTriangle, ArrowLeft, BedDouble, PhoneCall } from "lucide-react";

export default function NotFound() {
  const { pathname } = useLocation();

  return (
    <div className="relative min-h-[82vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#faf8f3] via-white to-[#fdf6f6] px-6 py-20">
      {/* Accente ambientale discrete: crimson + auriu + navy */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-[#b91c1c]/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-[#c69a3f]/12 blur-3xl"
      />

      <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-[28px] border border-[#ebd7d9] bg-white/95 p-8 sm:p-12 text-center shadow-[0_24px_64px_rgba(140,29,44,0.09)]">
        {/* Bandă superioară Navy → Roșu Bordeaux → Auriu */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-[3.5px]"
          style={{
            background:
              "linear-gradient(90deg, #0d2c5c 0%, #a62639 50%, #c69a3f 100%)",
          }}
        />

        {/* Emblemă roșu bordeaux luxury */}
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8c1d2c] to-[#be123c] text-white shadow-[0_12px_28px_rgba(166,38,57,0.28)] ring-4 ring-rose-50">
          <AlertTriangle size={28} strokeWidth={1.8} />
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50/90 px-3.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.2em] text-[#9f1239]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#be123c] animate-pulse" />
          Eroare 404 · Pagină inexistentă
        </span>

        <div
          className="mt-3 text-[82px] sm:text-[98px] font-semibold leading-none tracking-tight bg-clip-text text-transparent"
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            backgroundImage: "linear-gradient(135deg, #8c1d2c 0%, #be123c 55%, #c69a3f 100%)",
          }}
        >
          404
        </div>

        {/* Separator editorial Casa Esy */}
        <div className="mx-auto my-3 flex items-center justify-center gap-3">
          <span className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#c69a3f]" />
          <span className="h-1.5 w-1.5 rotate-45 bg-[#a62639]" />
          <span className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#c69a3f]" />
        </div>

        <h1
          className="text-[28px] sm:text-[34px] font-semibold text-[#0d2c5c] leading-tight"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          Această pagină nu a fost găsită
        </h1>

        <p className="mx-auto mt-3 max-w-md text-[14.5px] leading-relaxed text-[#5e718f]">
          Adresa solicitată nu există sau a fost mutată. Te poți întoarce în siguranță la pagina principală sau poți explora camerele Vilei Casa Esy.
        </p>

        {pathname && pathname !== "/" && (
          <div className="mt-4 inline-flex items-center rounded-lg border border-rose-200/80 bg-rose-50/60 px-3 py-1 font-mono text-[12px] text-[#9f1239]">
            {pathname}
          </div>
        )}

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
            className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50/50 px-5 py-3 text-[12px] font-bold uppercase tracking-[0.14em] text-[#9f1239] transition hover:border-[#be123c] hover:bg-rose-50 no-underline"
          >
            <PhoneCall size={14} />
            Contact
          </Link>
        </div>
      </div>
    </div>
  );
}
