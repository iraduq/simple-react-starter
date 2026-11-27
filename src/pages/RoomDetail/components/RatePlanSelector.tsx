import { ron } from "../../../lib/format";
import type { RatePlanCode } from "../../../types/rooms";

interface RatePlanSelectorProps {
  plan: RatePlanCode;
  setPlan: (plan: RatePlanCode) => void;
  baseRatePerNight: number;
  breakfastAddonPerNight: number;
  totalGuestsCount: number;
}

export default function RatePlanSelector({
  plan,
  setPlan,
  baseRatePerNight,
  breakfastAddonPerNight,
  totalGuestsCount,
}: RatePlanSelectorProps) {
  const plans = [
    {
      code: "flexible" as const,
      label: "Flexibil",
      badge: null,
      badgeColor: "",
      hint: "Anulare și rambursare automată în 30 zile",
      priceVal: ron(Math.round(baseRatePerNight)),
    },
    {
      code: "non_refundable" as const,
      label: "Nerambursabil",
      badge: "-10%",
      badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
      hint: "Fără anulare sau rambursare",
      priceVal: ron(Math.round(baseRatePerNight * 0.9)),
    },
    {
      code: "breakfast" as const,
      label: "Mic dejun inclus",
      badge: "+35 RON / persoană",
      badgeColor: "bg-amber-50 text-amber-900 border-amber-200",
      hint: `Bufet suedez (${totalGuestsCount} ${totalGuestsCount === 1 ? "persoană" : "persoane"} × 35 RON / persoană)`,
      priceVal: ron(Math.round(baseRatePerNight + breakfastAddonPerNight)),
    },
  ];

  return (
    <div className="mt-4">
      <span className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#8595aa]">
        Plan tarifar
      </span>
      <div className="flex flex-col gap-2">
        {plans.map((p) => {
          const isSelected = plan === p.code;
          return (
            <button
              key={p.code}
              type="button"
              onClick={() => setPlan(p.code)}
              className={`group w-full rounded-2xl border px-3.5 py-2.5 text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                isSelected
                  ? "border-[#c69a3f] bg-[#fffcf5] ring-1.5 ring-[#c69a3f]/30 shadow-xs"
                  : "border-[#e2e8f0] bg-white hover:border-[#cbd5e1] hover:bg-[#fafbfc]"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? "border-[#c69a3f] bg-[#c69a3f]"
                      : "border-slate-300 bg-white group-hover:border-slate-400"
                  }`}
                >
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[13px] font-bold whitespace-nowrap truncate ${
                        isSelected ? "text-[#0d2c5c]" : "text-[#1e293b]"
                      }`}
                    >
                      {p.label}
                    </span>
                    {p.badge && (
                      <span
                        className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded-md border whitespace-nowrap shrink-0 ${p.badgeColor}`}
                      >
                        {p.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#8595aa] whitespace-nowrap truncate mt-0.5">
                    {p.hint}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div
                  className={`text-[13.5px] font-black whitespace-nowrap ${
                    isSelected ? "text-[#0d2c5c]" : "text-[#334155]"
                  }`}
                >
                  {p.priceVal}
                </div>
                <div className="text-[10px] text-[#8595aa] whitespace-nowrap">
                  / noapte
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
