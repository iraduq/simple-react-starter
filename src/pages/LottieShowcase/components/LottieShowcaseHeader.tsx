import { Link } from "react-router-dom";
import { Sparkles, RotateCcw, ArrowUpRight } from "lucide-react";

interface LottieShowcaseHeaderProps {
  onReplayAll: () => void;
}

export default function LottieShowcaseHeader({ onReplayAll }: LottieShowcaseHeaderProps) {
  return (
    <div className="pb-8 border-b border-[#e1e8f0] flex flex-col lg:flex-row lg:items-end justify-between gap-6">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-[#fdf8ec] border border-[#c69a3f]/35 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#9c7624]">
          <Sparkles size={13} className="text-[#c69a3f]" />
          Galerie Oficială Lottie · Vila Casa Esy
        </div>
        <h1 className="mt-3 font-['Outfit',sans-serif] text-[32px] sm:text-[42px] font-bold tracking-tight text-[#0d2c5c] leading-tight">
          Animații Lottie în stilul <span className="text-[#c69a3f]">Vila Casa Esy</span>
        </h1>
        <p className="mt-2 max-w-2xl text-[14.5px] text-[#64748b] leading-relaxed">
          16 animații vectoriale Bodymovin/Lottie (60 FPS) create în paleta aplicației (
          <code className="text-xs font-bold text-[#0d2c5c]">#0d2c5c</code> Royal Navy,{" "}
          <code className="text-xs font-bold text-[#c69a3f]">#c69a3f</code> Warm Gold și{" "}
          <code className="text-xs font-bold text-emerald-600">#10b981</code> Emerald), gata de previzualizare, descărcare <code className="text-xs font-bold">.json</code> și integrare în paginile cheie.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 shrink-0">
        <button
          type="button"
          onClick={onReplayAll}
          className="inline-flex items-center gap-2 rounded-full bg-[#0d2c5c] hover:bg-[#163c78] px-5 py-2.5 text-xs font-bold uppercase tracking-[0.15em] text-white transition cursor-pointer shadow-sm"
        >
          <RotateCcw size={14} className="text-[#c69a3f]" />
          Replay Toate
        </button>
        <Link
          to="/comanda/ORD-7783"
          className="inline-flex items-center gap-1.5 rounded-full border border-[#e1e8f0] bg-white hover:border-[#0d2c5c] px-5 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-[#0d2c5c] no-underline transition"
        >
          Vezi în Pagina de Comandă
          <ArrowUpRight size={14} className="text-[#c69a3f]" />
        </Link>
      </div>
    </div>
  );
}
