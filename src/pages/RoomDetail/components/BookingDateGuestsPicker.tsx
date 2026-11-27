import DatePicker from "../../../components/DatePicker";
import { nightsBetween } from "../../../lib/format";
import type { RoomDetail as RoomDetailType } from "../../../types/rooms";

interface BookingDateGuestsPickerProps {
  room: RoomDetailType;
  today: string;
  checkIn: string;
  setCheckIn: (d: string) => void;
  checkOut: string;
  setCheckOut: (d: string) => void;
  blocked: Set<string>;
  adults: number;
  setAdults: (n: number) => void;
  children: number;
  setChildren: (n: number) => void;
  onConflictToast: () => void;
}

export default function BookingDateGuestsPicker({
  room,
  today,
  checkIn,
  setCheckIn,
  checkOut,
  setCheckOut,
  blocked,
  adults,
  setAdults,
  children,
  setChildren,
  onConflictToast,
}: BookingDateGuestsPickerProps) {
  const inputCls =
    "w-full rounded-xl border border-[#e1e8f0] bg-white px-3.5 py-2.5 text-[14px] text-[#0d2c5c] outline-none focus:border-[#c69a3f]";
  const labelCls =
    "mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#8595aa]";

  return (
    <div className="mt-4 grid grid-cols-2 gap-3">
      <DatePicker
        variant="field"
        label="Check-in"
        value={checkIn}
        minDate={today}
        disabledDates={blocked}
        onChange={(v) => {
          setCheckIn(v);
          if (checkOut && checkOut <= v) setCheckOut("");
        }}
      />
      <DatePicker
        variant="field"
        label="Check-out"
        value={checkOut}
        minDate={checkIn || today}
        disabledDates={blocked}
        onChange={(v) => {
          const conflicts = nightsBetween(checkIn, v).filter((d) => blocked.has(d));
          if (conflicts.length > 0) {
            onConflictToast();
            return;
          }
          setCheckOut(v);
        }}
      />
      <label className="block">
        <span className={labelCls}>Adulți</span>
        <input
          type="number"
          min={1}
          max={room.max_guests_adults || 10}
          value={adults}
          onChange={(e) => setAdults(Number(e.target.value))}
          className={inputCls}
        />
      </label>
      <label className="block">
        <span className={labelCls}>Copii</span>
        <input
          type="number"
          min={0}
          max={room.max_guests_children || 0}
          value={children}
          onChange={(e) => setChildren(Number(e.target.value))}
          className={inputCls}
        />
      </label>
    </div>
  );
}
