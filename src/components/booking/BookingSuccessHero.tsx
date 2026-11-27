import { Sparkles, CheckCircle2 } from "lucide-react";

interface BookingSuccessHeroProps {
  guestName?: string | null;
  guestEmail?: string | null;
}

export default function BookingSuccessHero({ guestName, guestEmail }: BookingSuccessHeroProps) {
  return (
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
          Mulțumim{guestName ? `, ${guestName}` : ""}!
        </h1>
        <p className="text-slate-200 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          Rezervarea ta la <span className="text-[#f3d48b] font-semibold">Casa Esy</span> este confirmată și garantată. Am trimis detaliile sejurului și permisul QR pe{" "}
          <span className="underline decoration-[#c69a3f]/60 underline-offset-4">
            {guestEmail || "adresa ta de email"}
          </span>
          .
        </p>
      </div>
    </div>
  );
}
