import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const MONTHS = [
  "Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie",
  "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie",
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
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
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
  const isToday = (d: number) => dayIso(d) === new Date().toISOString().split("T")[0];

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const pick = (d: number) => {
    if (isDisabled(d)) return;
    onChange(dayIso(d));
    setOpen(false);
  };

  return (
    <div className="dp-root" ref={ref}>
      <span className="dp-label">{label}</span>
      <button
        type="button"
        className={`dp-trigger${open ? " dp-trigger--open" : ""}${value ? " dp-trigger--filled" : ""}`}
        onClick={() => setOpen((v) => !v)}
      >
        {displayDate ?? <span className="dp-placeholder">Selectează data</span>}
      </button>

      {open && (
        <div className="dp-popover">
          <div className="dp-header">
            <button type="button" className="dp-nav-btn" onClick={prevMonth}>
              <ChevronLeft size={15} />
            </button>
            <span className="dp-month-label">
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button type="button" className="dp-nav-btn" onClick={nextMonth}>
              <ChevronRight size={15} />
            </button>
          </div>

          <div className="dp-day-names">
            {DAYS_SHORT.map((d) => (
              <span key={d} className="dp-day-name">{d}</span>
            ))}
          </div>

          <div className="dp-grid">
            {cells.map((day, i) =>
              day === null ? (
                <span key={`empty-${i}`} />
              ) : (
                <button
                  type="button"
                  key={day}
                  disabled={isDisabled(day)}
                  className={[
                    "dp-day",
                    isSelected(day) ? "dp-day--selected" : "",
                    isDisabled(day) ? "dp-day--disabled" : "",
                    isToday(day) && !isSelected(day) ? "dp-day--today" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => pick(day)}
                >
                  {day}
                </button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
