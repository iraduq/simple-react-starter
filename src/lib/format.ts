/** Formatări comune (RON, date, procente). */

export const ron = (value?: number | null) =>
  new Intl.NumberFormat("ro-RO", { style: "currency", currency: "RON" }).format(Number(value || 0));

export const percent = (value?: number | null) => {
  const n = Number(value || 0);
  /** Backendul poate trimite 0.42 sau 42 — normalizăm la procent. */
  const pct = n > 0 && n <= 1 ? n * 100 : n;
  return `${pct.toFixed(0)}%`;
};

export const occupancyValue = (value?: number | null) => {
  const n = Number(value || 0);
  return n > 0 && n <= 1 ? n * 100 : n;
};

export const dayLabel = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("ro-RO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export const toISODate = (d: Date) => d.toISOString().slice(0, 10);

/** Nopțile dintre check-in și check-out (exclusiv check-out). */
export const nightsBetween = (checkIn: string, checkOut: string): string[] => {
  if (!checkIn || !checkOut) return [];
  const start = new Date(`${checkIn}T00:00:00`);
  const end = new Date(`${checkOut}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) return [];
  const out: string[] = [];
  const cursor = new Date(start);
  while (cursor < end) {
    out.push(toISODate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return out;
};
