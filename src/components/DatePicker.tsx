import type React from "react";
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
  icon?: React.ReactNode;
  hint?: string;
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

export default function DatePicker({ label, icon, hint, value, minDate, onChange }: Props) {
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
      className={`relative flex-1 flex flex-col justify-center px-5 py-4 rounded-[14px] transition-colors duration-200 ${
        open ? "bg-[#f4f7fc]" : "hover:bg-[#f7f9fc]"
      }`}
      ref={ref}
    >
      <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.14em] uppercase text-[#0d2c5c] mb-2 select-none">
        {icon}
        {label}
      </span>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="group/date flex w-full items-baseline justify-between gap-2 bg-transparent border-none p-0 font-sans text-left leading-[1.3] cursor-pointer"
      >
        <span
          className={`text-[15px] transition-colors duration-200 ${
            value
              ? "font-medium text-[#0d2c5c]"
              : "text-[#8595aa] group-hover/date:text-[#0d2c5c]"
          }`}
        >
          {displayDate ?? "Selectează data"}
        </span>
        {hint && (
          <span className="hidden md:inline text-[10px] uppercase tracking-[0.1em] text-[#b6c2d3]">
            {hint}
          </span>
        )}
      </button>
      <span
        className={`absolute left-5 right-5 bottom-2.5 h-[2px] rounded-full bg-gradient-to-r from-[#c69a3f] to-[#e6c579] transition-transform duration-300 origin-left ${
          open ? "scale-x-100" : "scale-x-0"
        }`}
      />

      {open && (
        <div className="absolute top-[calc(100%+10px)] left-0 z-[200] bg-white border border-[#e1e8f0] rounded-[16px] shadow-[0_4px_8px_rgba(13,44,92,0.06),0_22px_60px_rgba(13,44,92,0.18)] p-5 w-[290px] origin-top animate-in fade-in slide-in-from-top-1 duration-150">
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
                      ? "bg-gradient-to-br from-[#d8ae52] to-[#b8882e] text-white font-semibold shadow-[0_4px_10px_-2px_rgba(198,154,63,0.7)]"
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
