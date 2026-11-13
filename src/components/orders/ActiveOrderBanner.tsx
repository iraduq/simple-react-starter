import React from "react";
import { Link } from "react-router-dom";
import {
  ChefHat,
  Clock,
  Bike,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  BedDouble,
  Receipt,
} from "lucide-react";
import { useActiveRoomServiceOrder, type ActiveOrderData } from "../../hooks/useActiveRoomServiceOrder";

const STATUS_CONFIG: Record<
  string,
  {
    stepIndex: number;
    title: string;
    subtitle: string;
    badgeCls: string;
    icon: typeof ChefHat;
    accentColor: string;
  }
> = {
  new: {
    stepIndex: 1,
    title: "Comandă Înregistrată",
    subtitle: "Recepționată în sistem · Așteaptă preluarea în bucătărie",
    badgeCls: "bg-[#0d2c5c]/10 text-[#0d2c5c] border-[#0d2c5c]/20",
    icon: Clock,
    accentColor: "#0d2c5c",
  },
  preparing: {
    stepIndex: 2,
    title: "În Preparare în Bucătărie",
    subtitle: "Se gătește proaspăt acum de către bucătar",
    badgeCls: "bg-[#fdf8ec] text-[#8a6420] border-[#c69a3f]/35",
    icon: ChefHat,
    accentColor: "#c69a3f",
  },
  delivering: {
    stepIndex: 3,
    title: "În Drum spre Cameră",
    subtitle: "Personalul de servire transportă comanda spre camera ta",
    badgeCls: "bg-[#0d2c5c]/10 text-[#0d2c5c] border-[#0d2c5c]/20",
    icon: Bike,
    accentColor: "#0d2c5c",
  },
  delivered: {
    stepIndex: 4,
    title: "Livrată în Cameră",
    subtitle: "Predată cu succes oaspetelui · Poftă bună!",
    badgeCls: "bg-emerald-50 text-emerald-800 border-emerald-200",
    icon: CheckCircle2,
    accentColor: "#059669",
  },
};

export default function ActiveOrderBanner() {
  const { activeOrder } = useActiveRoomServiceOrder();

  if (!activeOrder) return null;

  const config = STATUS_CONFIG[activeOrder.status] || STATUS_CONFIG.new;
  const Icon = config.icon;

  return (
    <div className="mb-8 rounded-[24px] bg-white border border-[#e1e8f0] shadow-[0_12px_36px_rgba(13,44,92,0.06)] overflow-hidden">
      {/* Accent top stripe */}
      <div
        className="h-1.5 w-full transition-all duration-500"
        style={{ backgroundColor: config.accentColor }}
      />

      <div className="p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Left Info Column */}
          <div className="flex items-start gap-4 min-w-0">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                activeOrder.status === "delivered"
                  ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                  : activeOrder.status === "preparing"
                    ? "bg-[#fdf8ec] text-[#8a6420] border-[#c69a3f]/35"
                    : "bg-[#0d2c5c]/5 text-[#0d2c5c] border-[#0d2c5c]/10"
              }`}
            >
              <Icon size={24} />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="font-['Outfit',sans-serif] text-xs font-extrabold text-[#0d2c5c] bg-[#0d2c5c]/8 px-2.5 py-0.5 rounded-lg border border-[#0d2c5c]/15">
                  #{activeOrder.order_code}
                </span>

                <span className="inline-flex items-center gap-1.5 text-xs text-[#64748b] font-medium">
                  <BedDouble size={13} className="text-[#c69a3f]" />
                  {activeOrder.location_label}
                </span>

                {activeOrder.booking_code && (
                  <span className="text-[11px] font-mono font-bold text-[#8a6420] bg-[#fdf8ec] px-2 py-0.5 rounded border border-[#c69a3f]/30">
                    #{activeOrder.booking_code.replace(/^#/, "")}
                  </span>
                )}

                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live WebSockets
                </span>
              </div>

              <h3 className="font-['Outfit',sans-serif] text-lg sm:text-xl font-bold text-[#0d2c5c] leading-snug">
                {config.title}
              </h3>
              <p className="text-xs sm:text-[13px] text-[#64748b] mt-0.5">
                {config.subtitle}
              </p>
            </div>
          </div>

          {/* Right Progress Stepper + CTA */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:shrink-0">
            {/* 4 Steps Stepper */}
            <div className="bg-[#f8fafd] border border-[#e1e8f0] px-4 py-2.5 rounded-xl flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748b] mr-1">
                Pasul {config.stepIndex} din 4
              </span>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4].map((step) => {
                  const isDone = step <= config.stepIndex;
                  const isCurrent = step === config.stepIndex;
                  return (
                    <div
                      key={step}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        isCurrent
                          ? activeOrder.status === "delivered"
                            ? "w-7 bg-emerald-600 ring-2 ring-emerald-200"
                            : "w-7 bg-[#c69a3f] ring-2 ring-[#c69a3f]/25"
                          : isDone
                            ? "w-4 bg-[#0d2c5c]"
                            : "w-4 bg-slate-200"
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            <Link
              to={`/comanda/${activeOrder.order_code}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0d2c5c] hover:bg-[#07203f] text-white text-xs font-bold uppercase tracking-wider transition-all no-underline shadow-xs hover:shadow-sm"
            >
              <span>Vezi Progresul Live</span>
              <ArrowRight size={13} className="text-[#e6b85c]" />
            </Link>
          </div>
        </div>

        {/* Short items summary if available */}
        {activeOrder.items && activeOrder.items.length > 0 && (
          <div className="mt-3.5 pt-3 border-t border-[#f1f5f9] flex flex-wrap items-center justify-between gap-2 text-xs text-[#64748b]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-[#0d2c5c]">Preparate comandate:</span>
              {activeOrder.items.map((it, i) => (
                <span
                  key={i}
                  className="bg-slate-50 border border-slate-200/80 px-2 py-0.5 rounded text-[11.5px] text-[#334155]"
                >
                  <strong className="text-[#0d2c5c]">{it.qty}×</strong> {it.title}
                </span>
              ))}
            </div>

            <div className="font-['Outfit',sans-serif] font-bold text-[#0d2c5c] text-sm">
              Total: {Number(activeOrder.total_amount || 0).toFixed(2)} RON
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
