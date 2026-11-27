import { Sparkles, Check, Copy, KeyRound } from "lucide-react";
import SmartLockKeypad from "../SmartLockKeypad";

interface DigitalSmartLockCardProps {
  accessPin: string;
  unitNumber: string;
  pinCopied: boolean;
  onCopyPin: (pin: string) => void;
  showKeypadSimulator: boolean;
  onToggleSimulator: () => void;
}

export default function DigitalSmartLockCard({
  accessPin,
  unitNumber,
  pinCopied,
  onCopyPin,
  showKeypadSimulator,
  onToggleSimulator,
}: DigitalSmartLockCardProps) {
  return (
    <div className="mt-8 rounded-3xl border-2 border-[#c69a3f] bg-gradient-to-br from-[#0c1523] to-[#162740] p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#c69a3f]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-[#e6b85c]" />
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#e6b85c]">
            Pass Digital Activ · Smart Lock
          </span>
        </div>
        <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-0.5 text-[10.5px] font-bold uppercase tracking-widest">
          Activ
        </span>
      </div>

      <div className="mt-6 text-center">
        <p className="text-[12px] uppercase tracking-[0.2em] text-[#9fb3cc]">
          Codul tău PIN de deblocare ușă
        </p>
        <div className="mt-2 flex items-center justify-center gap-3">
          <span className="font-mono text-[42px] sm:text-[52px] font-black tracking-[0.25em] text-[#e6b85c] drop-shadow-[0_0_15px_rgba(230,184,92,0.4)]">
            {accessPin}
          </span>
        </div>
        <p className="mt-1 text-[12px] text-[#9fb3cc]">
          Tastați codul urmat de tasta <strong>#</strong> pe clanța camerei{" "}
          <strong className="text-white">{unitNumber}</strong>
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => onCopyPin(accessPin)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#c69a3f] px-5 py-2.5 text-[12px] font-bold uppercase tracking-wider text-[#0c1523] hover:bg-[#e6b85c] transition-colors"
          >
            {pinCopied ? <Check size={15} /> : <Copy size={15} />}
            {pinCopied ? "Copiat!" : "Copiază Codul PIN"}
          </button>

          <button
            onClick={onToggleSimulator}
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-[12px] font-bold uppercase tracking-wider text-white hover:bg-white/20 transition-colors"
          >
            <KeyRound size={15} />
            {showKeypadSimulator ? "Ascunde Simulator" : "Testează Clanța Inteligentă"}
          </button>
        </div>
      </div>

      {showKeypadSimulator && (
        <div className="mt-8 pt-8 border-t border-white/15 flex flex-col items-center animate-fadeIn">
          <p className="text-[12px] text-[#c69a3f] font-semibold mb-4 text-center">
            Testează codul PIN pe simulatorul digital al clanței:
          </p>
          <SmartLockKeypad
            initialUnitNumber={unitNumber || "101"}
            units={[unitNumber || "101"]}
          />
        </div>
      )}
    </div>
  );
}
