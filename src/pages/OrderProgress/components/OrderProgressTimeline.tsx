import { BedDouble, Clock, XCircle } from "lucide-react";
import CasaEsyLottie from "../../../components/lottie/CasaEsyLottie";
import { STEPS } from "../types";

interface OrderProgressTimelineProps {
  loc: { primary: string; secondary: string | null };
  orderTime: string;
  isCancelled: boolean;
  activeStep: (typeof STEPS)[number];
  currentStepIdx: number;
  progressPct: number;
}

export default function OrderProgressTimeline({
  loc,
  orderTime,
  isCancelled,
  activeStep,
  currentStepIdx,
  progressPct,
}: OrderProgressTimelineProps) {
  return (
    <div className="rounded-[24px] border border-[#e1e8f0] bg-white p-6 sm:p-8 shadow-[0_10px_40px_rgba(13,44,92,0.06)]">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#e1e8f0]">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#0d2c5c] flex items-center justify-center text-[#c69a3f] shadow-sm shrink-0">
            <BedDouble size={22} />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#64748b]">
              Destinație Livrare Room Service
            </div>
            <div className="font-['Outfit',sans-serif] text-[22px] sm:text-[26px] font-bold leading-tight text-[#0d2c5c]">
              {loc.primary}
              {loc.secondary && (
                <span className="text-[#64748b] font-medium text-base sm:text-lg">
                  {" "}· {loc.secondary}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {orderTime && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f8fafc] border border-[#e1e8f0] px-3.5 py-1.5 text-xs font-semibold text-[#475569]">
              <Clock size={13} className="text-[#c69a3f]" />
              Plasată la {orderTime}
            </span>
          )}
          {!isCancelled && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0d2c5c] px-4 py-1.5 text-xs font-bold text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-[#c69a3f]" />
              {activeStep.title}
            </span>
          )}
        </div>
      </div>

      {isCancelled ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50/70 p-5 flex items-center gap-4 text-red-900">
          <XCircle size={24} className="text-red-600 shrink-0" />
          <div>
            <div className="font-['Outfit',sans-serif] text-lg font-bold">
              Comandă Anulată
            </div>
            <p className="text-sm text-red-800/80 mt-0.5">
              Această comandă a fost anulată. Punctele VIP utilizate (dacă au existat) au fost returnate automat în contul tău.
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-8">
          <div className="relative">
            <div
              className="hidden sm:block absolute top-9 left-[12.5%] right-[12.5%] h-[3px] rounded-full bg-[#eef2f7]"
              aria-hidden="true"
            >
              <div
                className="h-full rounded-full bg-[#0d2c5c] transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-3 relative z-10">
              {STEPS.map((step, idx) => {
                const Icon = step.icon;
                const done = idx < currentStepIdx;
                const isCurrent = idx === currentStepIdx;

                return (
                  <div key={step.key} className="flex sm:flex-col items-center sm:text-center gap-4 sm:gap-3">
                    <div
                      className={`relative w-[72px] h-[72px] rounded-full flex items-center justify-center transition-all duration-500 shrink-0 ${
                        isCurrent
                          ? "bg-white ring-4 ring-[#c69a3f]/35 shadow-[0_12px_28px_-10px_rgba(13,44,92,0.4)]"
                          : done
                            ? "bg-white ring-2 ring-emerald-500/30 shadow-xs"
                            : "bg-[#f8fafc] text-[#94a3b8] border border-[#dce4f0]"
                      }`}
                    >
                      {isCurrent || done ? (
                        <CasaEsyLottie id={step.lottieId} size={64} loop={isCurrent} autoplay />
                      ) : (
                        <Icon size={22} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div
                        className={`text-[10.5px] font-bold uppercase tracking-[0.18em] ${
                          isCurrent ? "text-[#c69a3f]" : done ? "text-emerald-600" : "text-[#94a3b8]"
                        }`}
                      >
                        Pasul 0{idx + 1}
                      </div>
                      <div
                        className={`font-['Outfit',sans-serif] text-[17px] font-bold leading-tight mt-0.5 ${
                          isCurrent || done ? "text-[#0d2c5c]" : "text-[#94a3b8]"
                        }`}
                      >
                        {step.title}
                      </div>
                      <div className="text-xs text-[#64748b] mt-0.5">{step.subtitle}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
