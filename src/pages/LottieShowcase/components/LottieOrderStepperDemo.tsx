import { Play, Pause } from "lucide-react";
import CasaEsyLottie from "../../../components/lottie/CasaEsyLottie";
import { ROOM_SERVICE_STEPS } from "../types";

interface LottieOrderStepperDemoProps {
  activeStepIdx: number;
  setActiveStepIdx: (idx: number) => void;
  autoCycle: boolean;
  setAutoCycle: (auto: boolean | ((prev: boolean) => boolean)) => void;
  speed: number;
  globalReplayKey: number;
}

export default function LottieOrderStepperDemo({
  activeStepIdx,
  setActiveStepIdx,
  autoCycle,
  setAutoCycle,
  speed,
  globalReplayKey,
}: LottieOrderStepperDemoProps) {
  const progressPct = (activeStepIdx / (ROOM_SERVICE_STEPS.length - 1)) * 100;

  return (
    <div className="mt-9 rounded-[26px] border border-[#e1e8f0] bg-white p-6 sm:p-10 shadow-[0_12px_45px_rgba(13,44,92,0.06)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-7 border-b border-[#e1e8f0]">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#c69a3f]">
            <span className="h-2 w-2 rounded-full bg-[#c69a3f]" />
            Demo Interactiv Live · Room Service Stepper
          </div>
          <h2 className="mt-1 font-['Outfit',sans-serif] text-2xl sm:text-3xl font-bold text-[#0d2c5c]">
            Progresul Comenzii cu Iconițe Lottie Animate
          </h2>
          <p className="text-xs sm:text-sm text-[#64748b] mt-0.5">
            Dă click pe oricare dintre cei 4 pași de mai jos sau lasă simularea automată să parcurgă fluxul comenzii.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setAutoCycle((v) => !v)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] border transition cursor-pointer ${
              autoCycle
                ? "bg-[#0d2c5c] text-white border-[#0d2c5c]"
                : "bg-white text-[#0d2c5c] border-[#e1e8f0] hover:border-[#0d2c5c]"
            }`}
          >
            {autoCycle ? (
              <>
                <Pause size={13} className="text-[#c69a3f]" />
                Auto-Demo Pornit
              </>
            ) : (
              <>
                <Play size={13} className="text-[#c69a3f]" />
                Pornește Auto-Demo
              </>
            )}
          </button>
        </div>
      </div>

      <div className="mt-10 relative">
        <div
          className="hidden sm:block absolute top-11 left-[12.5%] right-[12.5%] h-[2.5px] rounded-full bg-[#e6ecf5]"
          aria-hidden="true"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#0d2c5c] via-[#c69a3f] to-[#10b981] transition-all duration-700"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 sm:gap-4 relative z-10">
          {ROOM_SERVICE_STEPS.map((step, idx) => {
            const isCurrent = idx === activeStepIdx;
            const isDone = idx < activeStepIdx;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => {
                  setAutoCycle(false);
                  setActiveStepIdx(idx);
                }}
                className="group flex sm:flex-col items-center sm:text-center gap-4 sm:gap-3.5 bg-transparent border-0 p-2 rounded-2xl hover:bg-[#f8fafc] transition cursor-pointer text-left sm:text-center"
              >
                <div
                  className={`relative w-[88px] h-[88px] rounded-full flex items-center justify-center transition-all duration-500 shrink-0 ${
                    isCurrent
                      ? "bg-white ring-4 ring-[#c69a3f]/35 shadow-[0_14px_34px_-10px_rgba(13,44,92,0.35)] scale-105"
                      : isDone
                        ? "bg-white ring-2 ring-[#0d2c5c]/20 opacity-95"
                        : "bg-[#f8fafc] border border-[#e1e8f0] opacity-75 group-hover:opacity-100"
                  }`}
                >
                  <CasaEsyLottie
                    id={step.id}
                    size={78}
                    speed={speed}
                    playKey={`${globalReplayKey}-${activeStepIdx === idx ? "active" : "idle"}`}
                  />
                </div>

                <div>
                  <div
                    className={`text-[11px] font-bold uppercase tracking-[0.22em] ${
                      isCurrent
                        ? "text-[#c69a3f]"
                        : isDone
                          ? "text-emerald-600"
                          : "text-[#94a3b8]"
                    }`}
                  >
                    {step.num}
                  </div>
                  <div
                    className={`font-['Outfit',sans-serif] text-[19px] font-bold leading-tight mt-0.5 ${
                      isCurrent || isDone ? "text-[#0d2c5c]" : "text-[#94a3b8]"
                    }`}
                  >
                    {step.title}
                  </div>
                  <div className="text-xs text-[#64748b] mt-1">
                    {step.subtitle}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
