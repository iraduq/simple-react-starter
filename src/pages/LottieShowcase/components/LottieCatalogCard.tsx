import { Link } from "react-router-dom";
import { RotateCcw, Download, Check, Copy, ArrowUpRight } from "lucide-react";
import CasaEsyLottie from "../../../components/lottie/CasaEsyLottie";
import { type CasaEsyLottieMeta } from "../../../components/lottie/casaEsyLottieData";
import { type StageBg } from "../types";

interface LottieCatalogCardProps {
  item: CasaEsyLottieMeta;
  speed: number;
  stageBg: StageBg;
  cardKey: string;
  isCopied: boolean;
  onReplayCard: (id: string) => void;
  onDownloadJson: (item: CasaEsyLottieMeta) => void;
  onCopySnippet: (item: CasaEsyLottieMeta) => void;
}

export default function LottieCatalogCard({
  item,
  speed,
  stageBg,
  cardKey,
  isCopied,
  onReplayCard,
  onDownloadJson,
  onCopySnippet,
}: LottieCatalogCardProps) {
  const stageBgClass =
    stageBg === "navy"
      ? "bg-[#0d2c5c] border-[#163c78]"
      : stageBg === "slate"
        ? "bg-[#f8fafc] border-[#e1e8f0]"
        : "bg-white border-[#e1e8f0]";

  return (
    <div className="flex flex-col justify-between rounded-[24px] border border-[#e1e8f0] bg-white p-6 shadow-[0_10px_35px_rgba(13,44,92,0.05)] hover:border-[#c69a3f]/60 hover:shadow-[0_16px_45px_rgba(13,44,92,0.09)] transition-all">
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f8fafc] border border-[#e1e8f0] px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#0d2c5c]">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: item.accentColor }} />
            #{item.stepNumber} · {item.categoryLabel}
          </span>
          <button
            type="button"
            onClick={() => onReplayCard(item.id)}
            title="Reia animația"
            className="w-8 h-8 rounded-full border border-[#e1e8f0] bg-white hover:border-[#0d2c5c] text-[#0d2c5c] flex items-center justify-center transition cursor-pointer"
          >
            <RotateCcw size={13} />
          </button>
        </div>

        <div className={`mt-4 h-44 rounded-2xl border flex items-center justify-center transition-colors ${stageBgClass}`}>
          <CasaEsyLottie id={item.id} size={128} speed={speed} playKey={cardKey} />
        </div>

        <div className="mt-4">
          <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#c69a3f]">{item.subtitle}</div>
          <h3 className="mt-0.5 font-['Outfit',sans-serif] text-xl font-bold text-[#0d2c5c]">{item.title}</h3>
          <p className="mt-2 text-xs text-[#64748b] leading-relaxed">{item.description}</p>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-[#e1e8f0] space-y-3">
        <div className="rounded-xl bg-[#f8fafc] border border-[#e1e8f0] px-3 py-2">
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#64748b]">Unde merită integrat:</div>
          <div className="text-xs font-bold text-[#0d2c5c] mt-0.5 leading-snug">{item.whereToUse}</div>
          <Link
            to={
              item.routeExample === "/comanda/:orderCode"
                ? "/comanda/ORD-7783"
                : item.routeExample === "/checkin/:bookingCode"
                  ? "/checkin/ESY-DEMO"
                  : item.routeExample
            }
            className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-[#c69a3f] hover:text-[#0d2c5c] no-underline"
          >
            <span>{item.routeExample}</span>
            <ArrowUpRight size={12} />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onDownloadJson(item)}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#e1e8f0] bg-white hover:border-[#0d2c5c] px-3 py-2 text-[11px] font-bold text-[#0d2c5c] transition cursor-pointer"
          >
            <Download size={13} className="text-[#c69a3f]" />
            JSON Lottie
          </button>
          <button
            type="button"
            onClick={() => onCopySnippet(item)}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0d2c5c] hover:bg-[#163c78] px-3 py-2 text-[11px] font-bold text-white transition cursor-pointer"
          >
            {isCopied ? (
              <>
                <Check size={13} className="text-emerald-400" /> Copiat
              </>
            ) : (
              <>
                <Copy size={13} className="text-[#c69a3f]" /> Cod React
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
