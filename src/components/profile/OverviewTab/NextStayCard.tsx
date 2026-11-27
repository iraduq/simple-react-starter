import { Link } from "react-router-dom";
import { Check, Building, Star, Wrench, Download, SlidersHorizontal, CalendarCheck } from "lucide-react";
import type { Booking, TabKey } from "../../../types/profile";
import { downloadBookingInvoicePdf } from "../../../lib/admin";
import { useToast } from "../../Toast";

interface NextStayCardProps {
  next: Booking | null;
  stayDays: Date[];
  goToTab: (t: TabKey) => void;
  onOpenFeedback: () => void;
  onOpenMaintenance: () => void;
}

export default function NextStayCard({
  next,
  stayDays,
  goToTab,
  onOpenFeedback,
  onOpenMaintenance,
}: NextStayCardProps) {
  const { toast } = useToast();

  const fmtDay = (d: Date) =>
    d.toLocaleDateString("ro-RO", { weekday: "short" }).replace(".", "").toUpperCase();
  const fmtDate = (d: Date) =>
    d.toLocaleDateString("ro-RO", { day: "numeric", month: "short" }).replace(".", "");

  return (
    <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-[0_10px_40px_rgba(13,44,92,0.06)] border border-[#e1e8f0]">
      {next ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[11px] font-bold tracking-[0.22em] uppercase text-[#c69a3f]">
              <span className="w-5 h-px bg-gradient-to-r from-transparent to-[#c69a3f]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#c69a3f]"></span>
              <span className="text-[#0d2c5c]">Următorul sejur confirmat</span>
              {next.booking_code && (
                <span className="text-[#6b7c99] font-normal normal-case tracking-normal">
                  • Rezervare #{next.booking_code}
                </span>
              )}
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11.5px] font-semibold flex items-center gap-1.5">
              <Check size={13} strokeWidth={2.5} />
              <span>{next.payment_status === "paid" ? "Achitat integral" : "Plată la sosire"}</span>
            </span>
          </div>

          <div className="mt-5 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div>
              <h2 className="font-['Outfit',sans-serif] text-[28px] sm:text-[34px] font-bold text-[#0d2c5c] leading-tight tracking-tight">
                {next.room?.title || "Cameră Casa Esy"}
              </h2>
              <p className="mt-1 flex items-center gap-2 text-[13px] text-[#64748b] font-['Plus_Jakarta_Sans',sans-serif]">
                <Building size={14} className="text-[#c69a3f] shrink-0" />
                <span>
                  Mamaia Resort • {Math.max(1, stayDays.length - 1)} nopți
                  {next.unit_number ? ` • Suita ${next.unit_number}` : ""}
                </span>
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                onClick={onOpenFeedback}
                className="px-4 h-11 rounded-[14px] border border-[#e1e8f0] hover:border-[#c69a3f] text-[#0d2c5c] hover:bg-[#f8fafc] text-[12.5px] font-['Plus_Jakarta_Sans',sans-serif] font-bold flex items-center gap-2 bg-white transition-colors shadow-xs cursor-pointer"
                title="Oferă o evaluare pentru sejurul dumneavoastră"
              >
                <Star size={14} className="fill-[#c69a3f] text-[#c69a3f]" />
                <span>Evaluează sejurul</span>
              </button>
              <button
                onClick={onOpenMaintenance}
                className="px-4 h-11 rounded-[14px] border border-[#e1e8f0] hover:border-[#c69a3f] text-[#0d2c5c] hover:bg-[#f8fafc] text-[12.5px] font-['Plus_Jakarta_Sans',sans-serif] font-bold flex items-center gap-2 bg-white transition-colors shadow-xs cursor-pointer"
                title="Raportează o defecțiune tehnică în cameră"
              >
                <Wrench size={14} className="text-[#c69a3f]" />
                <span>Raportează problemă</span>
              </button>
              <button
                onClick={() => {
                  downloadBookingInvoicePdf(
                    String(next.booking_code || next.id),
                    next.booking_code || String(next.id)
                  ).catch((e: any) =>
                    toast(e?.message || "Factura nu a putut fi descărcată.", "error")
                  );
                }}
                className="px-4 h-11 rounded-[14px] border border-[#e1e8f0] hover:border-[#c69a3f] text-[#0d2c5c] hover:bg-[#f8fafc] text-[12.5px] font-['Plus_Jakarta_Sans',sans-serif] font-bold flex items-center gap-2 bg-white transition-colors shadow-xs cursor-pointer"
              >
                <Download size={14} className="text-[#c69a3f]" />
                <span>Descarcă factură</span>
              </button>
              <button
                onClick={() => goToTab("reservations")}
                className="px-4 h-11 rounded-[14px] bg-[#0d2c5c] hover:bg-[#07203f] text-white text-[12.5px] font-['Plus_Jakarta_Sans',sans-serif] font-bold flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
              >
                <SlidersHorizontal size={14} className="text-[#c69a3f]" />
                <span>Detalii sejur</span>
              </button>
            </div>
          </div>

          {stayDays.length > 0 && (
            <div className="mt-6 pt-5 border-t border-[#e1e8f0]">
              <div className="flex items-center justify-between mb-3.5">
                <p className="font-['Plus_Jakarta_Sans',sans-serif] text-[11px] font-bold tracking-[0.2em] uppercase text-[#64748b] flex items-center gap-1.5">
                  <span className="w-3 h-px bg-[#c69a3f]" />
                  <span>Zilele sejurului tău:</span>
                </p>
                <Link
                  to="/facilitati"
                  className="text-[12px] font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[#0d2c5c] hover:text-[#c69a3f] hover:underline transition-colors no-underline"
                >
                  Program activități și spa →
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                {stayDays.map((d, i, arr) => {
                  const isFirst = i === 0;
                  const isLast = i === arr.length - 1 && arr.length > 1;
                  return (
                    <div
                      key={i}
                      className={`rounded-[18px] p-3.5 text-center border transition-all ${
                        isFirst
                          ? "bg-white border-[#c69a3f]/70 text-[#0d2c5c] shadow-xs"
                          : isLast
                          ? "bg-white border-[#0d2c5c]/40 text-[#0d2c5c]"
                          : "bg-[#f8fafc] border-[#e1e8f0] text-[#0d2c5c]"
                      }`}
                    >
                      <p className="font-['Plus_Jakarta_Sans',sans-serif] text-[11px] font-bold tracking-wider uppercase opacity-70">
                        {fmtDay(d)}
                      </p>
                      <p className="font-['Outfit',sans-serif] text-[22px] font-bold mt-1 text-[#0d2c5c]">
                        {fmtDate(d)}
                      </p>
                      <p className="mt-1.5 inline-block">
                        <span
                          className={`text-[10.5px] font-['Plus_Jakarta_Sans',sans-serif] font-bold px-2 py-0.5 rounded-full ${
                            isFirst
                              ? "bg-amber-50 text-[#c69a3f] border border-[#c69a3f]/40"
                              : isLast
                              ? "bg-[#0d2c5c] text-white"
                              : "bg-white text-[#64748b] border border-[#e1e8f0]"
                          }`}
                        >
                          {isFirst ? "Check-in" : isLast ? "Check-out" : "Sejur"}
                        </span>
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 py-2">
          <div>
            <div className="flex items-center gap-2 font-['Plus_Jakarta_Sans',sans-serif] text-[11px] font-bold tracking-[0.22em] uppercase text-[#0d2c5c]">
              <span className="w-5 h-px bg-[#c69a3f]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#c69a3f]"></span>
              <span>Sejururi Casa Esy</span>
            </div>
            <h2 className="font-['Outfit',sans-serif] text-[28px] sm:text-[34px] font-bold text-[#0d2c5c] mt-2 tracking-tight">
              Refugiul tău la Marea Neagră te așteaptă
            </h2>
            <p className="text-[13.5px] text-[#64748b] mt-1 max-w-[560px] leading-relaxed font-['Plus_Jakarta_Sans',sans-serif]">
              Descoperă camerele și suitele noastre de lux, beneficiază de ospitalitate caldă și priveliști superbe la malul mării.
            </p>
          </div>
          <Link
            to="/camere"
            className="px-6 h-12 rounded-[14px] bg-[#0d2c5c] hover:bg-[#07203f] text-white text-[13px] font-['Plus_Jakarta_Sans',sans-serif] font-bold flex items-center justify-center gap-2 transition-all shadow-[0_4px_16px_rgba(13,44,92,0.18)] shrink-0 no-underline"
          >
            <CalendarCheck size={16} className="text-[#c69a3f]" />
            <span>Explorează Camerele</span>
          </Link>
        </div>
      )}
    </div>
  );
}
