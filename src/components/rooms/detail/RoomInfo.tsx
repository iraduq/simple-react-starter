import { Check, Maximize, Star, Users } from "lucide-react";
import type { RoomDetail as RoomDetailType } from "../../../types/rooms";
import RoomReviewsSection from "../../../components/RoomReviewsSection";

interface RoomInfoProps {
  room: RoomDetailType;
  roomId: string;
}

export default function RoomInfo({ room, roomId }: RoomInfoProps) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#c69a3f]">
        {room.room_type?.name}
      </p>
      <h1
        className="mt-2 text-[clamp(1.7rem,3vw,2.4rem)] leading-tight text-[#0d2c5c]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {room.title}
      </h1>

      <div className="mt-2.5 flex flex-wrap items-center gap-3">
        <a
          href="#recenzii"
          className="inline-flex items-center gap-1.5 rounded-full border border-[#e1e8f0] bg-[#f8fafc] px-3.5 py-1 text-[12px] font-semibold text-[#0d2c5c] hover:border-[#c69a3f] hover:bg-[#fff9ed] transition-colors shadow-2xs"
        >
          <Star size={13} className="fill-[#c69a3f] text-[#c69a3f]" />
          <span className="font-bold">5.00</span>
          <span className="text-[#8595aa]">·</span>
          <span className="text-[#4f6280] font-normal hover:text-[#0d2c5c]">
            recenzii verificate ale oaspeților ↓
          </span>
        </a>
      </div>

      <p className="mt-3 text-[14.5px] leading-relaxed text-[#6b7c99]">
        {room.description}
      </p>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {[
          {
            Icon: Users,
            label: `${room.max_guests_adults} adulți${room.max_guests_children ? ` + ${room.max_guests_children} copii` : ""}`,
          },
          {
            Icon: Maximize,
            label: room.size_sqm ? `${room.size_sqm} m²` : "—",
          },
        ].map(({ Icon, label }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-2 rounded-xl border border-[#e1e8f0] bg-white px-2 py-4 text-center"
          >
            <Icon size={16} className="text-[#c69a3f]" />
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[#3d4f6b]">
              {label}
            </span>
          </div>
        ))}
      </div>

      {room.facilities && room.facilities.length > 0 && (
        <ul className="mt-6 flex flex-wrap gap-2">
          {room.facilities.map((f) => (
            <li
              key={String(f.id)}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#e1e8f0] bg-[#f6f9fd] px-3 py-1.5 text-[12px] text-[#0d2c5c]"
            >
              <Check size={12} className="text-[#c69a3f]" /> {f.name}
            </li>
          ))}
        </ul>
      )}

      <div id="recenzii">
        <RoomReviewsSection roomId={String(roomId)} />
      </div>
    </div>
  );
}
