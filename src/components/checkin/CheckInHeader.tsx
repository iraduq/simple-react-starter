import { KeyRound } from "lucide-react";

export default function CheckInHeader() {
  return (
    <div className="text-center mb-8">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#c69a3f]/30 bg-[#c69a3f]/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#c69a3f]">
        <KeyRound size={13} /> Self Check-in Online & Cheie Digitală
      </span>
      <h1
        className="mt-3 text-[clamp(1.8rem,3.2vw,2.5rem)] text-[#0d2c5c] font-semibold leading-tight"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Boutique Villa Casa Esy
      </h1>
      <p className="mt-2 text-[14px] text-[#6b7c99]">
        Acces securizat și cod digital de intrare fără așteptare la recepție
      </p>
    </div>
  );
}
