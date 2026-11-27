import { DoorOpen, CalendarCheck, Wifi } from "lucide-react";
import { type CheckInInfo, fmtDate } from "../../types/checkin";

interface CheckInDetailsGridProps {
  info: CheckInInfo;
}

export default function CheckInDetailsGrid({ info }: CheckInDetailsGridProps) {
  return (
    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
      <div className="rounded-2xl border border-[#f1f5f9] bg-[#f8fafd] p-4">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#6b7c99] block mb-1">
          Oaspete Titular
        </span>
        <p className="font-semibold text-[#0d2c5c] text-[15px]">
          {info.guest_name || "Oaspete Vila Casa Esy"}
        </p>
      </div>

      <div className="rounded-2xl border border-[#f1f5f9] bg-[#f8fafd] p-4">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#6b7c99] block mb-1">
          Cameră & Unitate
        </span>
        <p className="font-semibold text-[#0d2c5c] text-[15px] flex items-center gap-1.5">
          <DoorOpen size={16} className="text-[#c69a3f]" />
          {info.room_name} · Cam {info.unit_number || "Alocată"}
        </p>
      </div>

      <div className="rounded-2xl border border-[#f1f5f9] bg-[#f8fafd] p-4">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#6b7c99] block mb-1">
          Perioadă Cazare
        </span>
        <p className="font-semibold text-[#0d2c5c] flex items-center gap-1.5">
          <CalendarCheck size={15} className="text-[#c69a3f]" />
          {fmtDate(info.check_in)} → {fmtDate(info.check_out)}
        </p>
      </div>

      <div className="rounded-2xl border border-[#f1f5f9] bg-[#f8fafd] p-4">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#6b7c99] block mb-1">
          Wi-Fi Oaspeți
        </span>
        <p className="font-semibold text-[#0d2c5c] flex items-center gap-1.5">
          <Wifi size={15} className="text-[#0d2c5c]" />
          CasaEsy_Guest · Pass: <span className="font-mono text-[#c69a3f]">Boutique2026</span>
        </p>
      </div>
    </div>
  );
}
