import { BedDouble, CalendarDays, Users, Sparkles, CreditCard, Mail, KeyRound, QrCode } from "lucide-react";
import { type BookingConfirmationDetails, formatRoDate } from "../../types/bookingSuccess";

interface StayDetailsCardProps {
  details: BookingConfirmationDetails | null;
  nights: number | null;
  ratePlanLabel: string;
}

export default function StayDetailsCard({ details, nights, ratePlanLabel }: StayDetailsCardProps) {
  return (
    <div className="bg-white rounded-3xl shadow-lg shadow-[#0d2c5c]/5 border border-slate-200/80 overflow-hidden">
      {details?.room_image ? (
        <div className="relative h-56 sm:h-64 w-full overflow-hidden">
          <img
            src={details.room_image}
            alt={details.room_title || "Camera rezervată"}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d2c5c]/85 via-[#0d2c5c]/25 to-transparent" />
          <div className="absolute bottom-4 left-5 right-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#c69a3f] text-[#0d2c5c] text-xs font-bold uppercase tracking-wider mb-2">
                <BedDouble className="w-3.5 h-3.5" />
                {details.unit_number ? `Camera alocată: ${details.unit_number}` : "Suită confirmată"}
              </span>
              <h2 className="text-2xl font-serif font-bold text-white leading-tight">
                {details.room_title || "Camera Casa Esy"}
              </h2>
            </div>
            {details.room_size_sqm ? (
              <span className="px-3 py-1 rounded-lg bg-white/15 backdrop-blur-md text-white text-xs font-medium border border-white/20">
                {details.room_size_sqm} m²
              </span>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-[#0d2c5c] to-[#163e7d] px-6 py-5 text-white flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#c69a3f] text-[#0d2c5c] text-xs font-bold uppercase tracking-wider mb-2">
              <BedDouble className="w-3.5 h-3.5" />
              {details?.unit_number ? `Camera alocată: ${details.unit_number}` : "Cameră confirmată"}
            </span>
            <h2 className="text-xl sm:text-2xl font-serif font-bold">
              {details?.room_title || "Rezervare Casa Esy"}
            </h2>
          </div>
        </div>
      )}

      <div className="p-6 sm:p-7 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl bg-[#fdf8ec] border border-[#c69a3f]/25 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#9c7624] mb-1.5">
              <CalendarDays className="w-4 h-4" />
              Check-in
            </div>
            <p className="text-base font-bold text-[#0d2c5c]">{formatRoDate(details?.check_in)}</p>
            <p className="text-xs text-slate-500 mt-0.5">Începând cu ora 15:00</p>
          </div>

          <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              <CalendarDays className="w-4 h-4" />
              Check-out
            </div>
            <p className="text-base font-bold text-[#0d2c5c]">{formatRoDate(details?.check_out)}</p>
            <p className="text-xs text-slate-500 mt-0.5">Până la ora 11:00</p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 border-t border-b border-slate-100 text-sm">
          <div className="py-3.5 flex items-center justify-between gap-4">
            <span className="text-slate-500 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#c69a3f]" />
              Oaspeți & Durată
            </span>
            <span className="font-semibold text-[#0d2c5c] text-right">
              {nights ? `${nights} ${nights === 1 ? "noapte" : "nopți"} • ` : ""}
              {details?.guests_adults ?? 1} {(details?.guests_adults ?? 1) === 1 ? "adult" : "adulți"}
              {details?.guests_children ? `, ${details.guests_children} ${details.guests_children === 1 ? "copil" : "copii"}` : ""}
            </span>
          </div>

          <div className="py-3.5 flex items-center justify-between gap-4">
            <span className="text-slate-500 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#c69a3f]" />
              Plan tarifar
            </span>
            <span className="font-semibold text-[#0d2c5c] text-right">{ratePlanLabel}</span>
          </div>

          {details?.total_price != null ? (
            <div className="py-4 flex items-center justify-between gap-4">
              <span className="text-slate-600 font-medium flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                Total achitat
              </span>
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                  Plătit
                </span>
                <span className="text-xl font-bold text-[#0d2c5c]">
                  {Number(details.total_price).toFixed(2)} RON
                </span>
              </div>
            </div>
          ) : null}
        </div>

        {details?.special_requests ? (
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Cerințe speciale înregistrate
            </p>
            <p className="text-sm text-slate-700 italic">"{details.special_requests}"</p>
          </div>
        ) : null}

        <div className="rounded-2xl bg-[#0d2c5c]/[0.03] border border-[#0d2c5c]/10 p-5">
          <h3 className="text-sm font-bold text-[#0d2c5c] uppercase tracking-wider mb-3">
            Ce urmează până la sosire?
          </h3>
          <ul className="space-y-2.5 text-sm text-slate-600">
            <li className="flex items-start gap-2.5">
              <Mail className="w-4 h-4 text-[#c69a3f] shrink-0 mt-0.5" />
              <span>Ai primit confirmarea pe email împreună cu factura și detaliile de acces.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <KeyRound className="w-4 h-4 text-[#c69a3f] shrink-0 mt-0.5" />
              <span>Poți completa <strong>Check-in-ul Online</strong> chiar acum pentru a primi cheia instant la sosire.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <QrCode className="w-4 h-4 text-[#c69a3f] shrink-0 mt-0.5" />
              <span>Prezintă codul QR de mai alăturat la recepție pentru verificare în câteva secunde.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
