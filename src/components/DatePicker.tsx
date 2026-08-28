import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  label: React.ReactNode; // ← era: string
  value: string;
  minDate?: string;
  disabledDates?: Set<string>;
  variant?: "bar" | "field";
  onChange: (val: string) => void;
}

function isoToDate(iso: string) {
  return new Date(iso + "T00:00:00");
}

function toIso(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

const CALENDAR_HEIGHT = 340;

export default function DatePicker({
  label,
  value,
  minDate,
  disabledDates,
  variant = "bar",
  onChange,
}: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const base = value ? isoToDate(value) : new Date();
  const [viewYear, setViewYear] = useState(base.getFullYear());
  const [viewMonth, setViewMonth] = useState(base.getMonth());

  const measurePosition = () => {
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (!rect) return;
    const width = Math.min(280, window.innerWidth - 32);
    let left = rect.left + rect.width / 2 - width / 2;
    left = Math.max(12, Math.min(left, window.innerWidth - width - 12));

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    let top: number;
    if (spaceBelow < CALENDAR_HEIGHT + 10 && spaceAbove > spaceBelow) {
      top = rect.top - CALENDAR_HEIGHT - 10;
    } else {
      top = rect.bottom + 10;
    }

    setPos({ top, left });
  };

  useLayoutEffect(() => {
    if (open) measurePosition();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onResize = () => measurePosition();
    const onScroll = () => setOpen(false);
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const insideTrigger = wrapperRef.current?.contains(target);
      const insideCalendar = portalRef.current?.contains(target);
      if (!insideTrigger && !insideCalendar) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
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
  const isDisabled = (d: number) =>
    (!!minDate && dayIso(d) < minDate) || !!disabledDates?.has(dayIso(d));
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

  const calendar = (
    <div
      ref={portalRef}
      style={{ top: pos.top, left: pos.left }}
      className="fixed z-[9999] w-[min(280px,calc(100vw-32px))] bg-white border border-[#e1e8f0] rounded-[16px] shadow-[0_8px_20px_rgba(13,44,92,0.08),0_24px_60px_rgba(13,44,92,0.16)] p-5"
    >
      {/* Mic vârf indicator către trigger */}
      <span
        aria-hidden="true"
        className="absolute -top-[7px] left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white border-l border-t border-[#e1e8f0] rotate-45"
      />

      <div className="relative flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={prevMonth}
          className="bg-transparent border-none cursor-pointer p-[6px] rounded-lg text-[#3c4043] flex items-center transition-colors duration-150 hover:bg-[#f3e6c4] hover:text-[#0d2c5c]"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-[14px] font-semibold text-[#1a1a1a]">
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="bg-transparent border-none cursor-pointer p-[6px] rounded-lg text-[#3c4043] flex items-center transition-colors duration-150 hover:bg-[#f3e6c4] hover:text-[#0d2c5c]"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-2">
        {DAYS_SHORT.map((d) => (
          <span
            key={d}
            className="text-center text-[10px] font-bold tracking-wide text-[#8595aa] py-1"
          >
            {d}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) =>
          day === null ? (
            <span key={`empty-${i}`} />
          ) : (
            <button
              type="button"
              key={day}
              disabled={isDisabled(day)}
              onClick={() => pick(day)}
              className={`mx-auto w-[34px] h-[34px] rounded-full bg-transparent border-none font-sans text-[13px] flex items-center justify-center transition-colors duration-150 ${
                isSelected(day)
                  ? "bg-gradient-to-br from-[#c69a3f] to-[#b3862f] text-white font-semibold shadow-[0_4px_10px_rgba(198,154,63,0.35)]"
                  : isDisabled(day)
                    ? "text-[#d0d7e3] cursor-not-allowed"
                    : isToday(day)
                      ? "text-[#0d2c5c] font-bold ring-1 ring-[#c69a3f]/60 hover:bg-[#f3e6c4] hover:text-[#0d2c5c]"
                      : "text-[#1a1a1a] hover:bg-[#f3e6c4] hover:text-[#0d2c5c]"
              }`}
            >
              {day}
            </button>
          ),
        )}
      </div>
    </div>
  );

  return (
    <div
      className={
        variant === "field"
          ? "relative flex flex-col"
          : "relative flex-1 flex flex-col justify-center px-6 py-4.5"
      }
      ref={wrapperRef}
    >
      <span
        className={
          variant === "field"
            ? "mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#8595aa] select-none"
            : "flex items-center gap-1.5 text-[10px] font-bold tracking-[0.14em] uppercase text-[#1a1a1a] mb-1.5 select-none"
        }
      >
        {label}
      </span>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`font-sans text-left w-full leading-[1.3] transition-colors duration-150 ${
          variant === "field"
            ? "rounded-xl border border-[#e1e8f0] bg-white px-3.5 py-2.5 text-[14px] hover:border-[#c69a3f]"
            : "bg-transparent border-none p-0 text-sm"
        } ${
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

      {open && createPortal(calendar, document.body)}
    </div>
  );
}
