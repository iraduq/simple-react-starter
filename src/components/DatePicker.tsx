import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const MONTHS = [
  "Ianuarie",
  "Februarie",
  "Martie",
  "Aprilie",
  "Mai",
  "Iunie",
  "Iulie",
  "August",
  "Septembrie",
  "Octombrie",
  "Noiembrie",
  "Decembrie",
];
const DAYS_SHORT = ["Lu", "Ma", "Mi", "Jo", "Vi", "Sâ", "Du"];

interface Props {
  label: string;
  value: string;
  minDate?: string;
  onChange: (val: string) => void;
}

function isoToDate(iso: string) {
  return new Date(iso + "T00:00:00");
}

function toIso(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export default function DatePicker({ label, value, minDate, onChange }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const base = value ? isoToDate(value) : new Date();
  const [viewYear, setViewYear] = useState(base.getFullYear());
  const [viewMonth, setViewMonth] = useState(base.getMonth());

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const displayDate = value
    ? isoToDate(value).toLocaleDateString("ro-RO", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  const firstDayDow = new Date(viewYear, viewMonth, 1).getDay();
  const offset = firstDayDow === 0 ? 6 : firstDayDow - 1;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const dayIso = (d: number) => toIso(viewYear, viewMonth, d);
  const isDisabled = (d: number) => !!minDate && dayIso(d) < minDate;
  const isSelected = (d: number) => !!value && dayIso(d) === value;
  const isToday = (d: number) =>
    dayIso(d) === new Date().toISOString().split("T")[0];

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  };

  const pick = (d: number) => {
    if (isDisabled(d)) return;
    onChange(dayIso(d));
    setOpen(false);
  };

  return (
    <div
      className="relative flex-1 flex flex-col justify-center px-6 py-4.5"
      ref={ref}
    >
      <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.14em] uppercase text-[#1a1a1a] mb-1.5 select-none">
        {label}
      </span>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`bg-transparent border-none p-0 font-sans text-sm text-left w-full leading-[1.3] transition-colors duration-150 ${
          open
            ? "text-[#0d2c5c]"
            : value
              ? "text-[#1a1a1a] font-medium"
              : "text-[#8595aa]"
        }`}
      >
        {displayDate ?? (
          <span className="text-[#8595aa] font-normal">Selectează data</span>
        )}
      </button>

      {open && (
        <div className="absolute top-[calc(100%+12px)] left-0 z-[200] bg-white border border-[#e1e8f0] rounded-[14px] shadow-[0_4px_8px_rgba(13,44,92,0.06),0_16px_48px_rgba(13,44,92,0.14)] p-5 w-[280px]">
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={prevMonth}
              className="bg-transparent border-none cursor-pointer p-[5px] rounded-lg text-[#3c4043] flex items-center transition-colors duration-150 hover:bg-[#e6efff] hover:text-[#0d2c5c]"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="text-[13.5px] font-semibold text-[#1a1a1a]">
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="bg-transparent border-none cursor-pointer p-[5px] rounded-lg text-[#3c4043] flex items-center transition-colors duration-150 hover:bg-[#e6efff] hover:text-[#0d2c5c]"
            >
              <ChevronRight size={15} />
            </button>
          </div>

          <div className="grid grid-cols-7 mb-1.5">
            {DAYS_SHORT.map((d) => (
              <span
                key={d}
                className="text-center text-[9.5px] font-bold tracking-wide text-[#8595aa] py-1"
              >
                {d}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((day, i) =>
              day === null ? (
                <span key={`empty-${i}`} />
              ) : (
                <button
                  type="button"
                  key={day}
                  disabled={isDisabled(day)}
                  onClick={() => pick(day)}
                  className={`mx-auto w-[34px] h-[34px] rounded-full bg-transparent border-none font-sans text-[12.5px] flex items-center justify-center transition-colors duration-150 ${
                    isSelected(day)
                      ? "bg-[#c69a3f] text-white font-semibold"
                      : isDisabled(day)
                        ? "text-[#d0d7e3] cursor-not-allowed"
                        : isToday(day)
                          ? "text-[#1e4d8c] font-bold hover:bg-[#f3e6c4] hover:text-[#0d2c5c]"
                          : "text-[#1a1a1a] hover:bg-[#f3e6c4] hover:text-[#0d2c5c]"
                  }`}
                >
                  {day}
                </button>
              ),
            )}
          </div>
        </div>
      )}
    </div>
  );
}
