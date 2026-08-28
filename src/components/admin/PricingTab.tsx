import { useEffect, useMemo, useState, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Lock,
  Trash2,
  X,
  Calendar,
  DollarSign,
  Sliders,
} from "lucide-react";
import {
  Card,
  SectionHeader,
  Button,
  EmptyState,
  Modal,
  Field,
  inputCls,
  Skeleton,
} from "./ui";
import {
  get,
  post,
  list,
  money,
  errMsg,
  type Room,
  del,
} from "../../lib/admin";
import { useToast } from "../Toast";

type CalendarDay = {
  date: string;
  price?: number | null;
  price_override?: number | null;
  custom_price?: number | null;
  rate?: number | null;
  available?: boolean | null;
  is_available?: boolean | null;
  blocked?: boolean | null;
  is_blocked?: boolean | null;
  min_stay?: number | null;
  is_override?: boolean | null;
};

const ovKey = (roomId: string) => `casaesy_price_overrides_${roomId}`;

const readOverrides = (roomId: string): Set<string> => {
  if (!roomId) return new Set();
  try {
    const raw = localStorage.getItem(ovKey(roomId));
    const arr = raw ? (JSON.parse(raw) as string[]) : [];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
};

const writeOverrides = (roomId: string, set: Set<string>) => {
  try {
    localStorage.setItem(ovKey(roomId), JSON.stringify([...set]));
  } catch {
    /* storage indisponibil */
  }
};

const eachDate = (start: string, end: string) => {
  const out: string[] = [];
  const d = new Date(`${start}T00:00:00Z`);
  const last = new Date(`${end}T00:00:00Z`);
  while (d <= last) {
    out.push(d.toISOString().slice(0, 10));
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return out;
};

const roomLabel = (r: Room) =>
  r.name || r.title || `Cameră ${String(r.id).slice(0, 6)}`;

type RuleForm = {
  start_date: string;
  end_date: string;
  price_override: number | null;
  is_blocked: boolean;
  closed_to_arrival: boolean;
  closed_to_departure: boolean;
  min_stay: number | null;
};

export default function PricingTab() {
  const { toast } = useToast();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [calendar, setCalendar] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [calLoading, setCalLoading] = useState(false);
  const [monthOffset, setMonthOffset] = useState(0);
  const [ruleOpen, setRuleOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [actionModalOpen, setActionModalOpen] = useState(false);

  const [rule, setRule] = useState<RuleForm>({
    start_date: "",
    end_date: "",
    price_override: null,
    is_blocked: false,
    closed_to_arrival: false,
    closed_to_departure: false,
    min_stay: null,
  });
  const [ruleErr, setRuleErr] = useState<Record<string, string>>({});
  const [overrides, setOverrides] = useState<Set<string>>(new Set());

  useEffect(() => {
    setOverrides(readOverrides(selectedRoom));
  }, [selectedRoom]);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const data = await get<unknown>("/rooms");
        if (!active) return;
        const all = list<Room>(data);
        setRooms(all);
        if (all.length > 0) setSelectedRoom(String(all[0].id));
      } catch (e) {
        if (!active) return;
        toast(errMsg(e), "error");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [toast]);

  const monthDate = useMemo(() => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() + monthOffset);
    return d;
  }, [monthOffset]);

  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();

  const loadCalendar = useCallback(async () => {
    if (!selectedRoom) return;
    setCalLoading(true);
    try {
      const pad = (n: number) => String(n).padStart(2, "0");
      const firstDay = `${year}-${pad(month + 1)}-01`;
      const lastDay = `${year}-${pad(month + 1)}-${pad(new Date(year, month + 1, 0).getDate())}`;
      const data = await get<unknown>(
        `/rooms/${selectedRoom}/calendar?start_date=${firstDay}&end_date=${lastDay}`,
      );

      const raw =
        data &&
        typeof data === "object" &&
        Array.isArray((data as { entries?: unknown }).entries)
          ? (data as { entries: CalendarDay[] }).entries
          : list<CalendarDay>(data);

      setCalendar(
        raw.map((d) => {
          const resolvedPrice =
            d.price_override ?? d.custom_price ?? d.price ?? d.rate ?? null;
          return {
            ...d,
            date: String(d.date).slice(0, 10),
            price: resolvedPrice != null ? Number(resolvedPrice) : null,
            available: d.available ?? d.is_available,
            blocked: d.blocked ?? d.is_blocked,
            is_override: Boolean(d.is_override),
          };
        }),
      );
    } catch (e) {
      toast(errMsg(e), "error");
      setCalendar([]);
    } finally {
      setCalLoading(false);
    }
  }, [selectedRoom, year, month, toast]);

  useEffect(() => {
    if (selectedRoom) void loadCalendar();
  }, [selectedRoom, monthOffset, loadCalendar]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;

  const roomBase = rooms.find((r) => String(r.id) === selectedRoom)?.base_price;

  const isOverrideDay = (dateStr: string, cal: CalendarDay | null) => {
    if (!cal) return overrides.has(dateStr);
    if (cal.is_override) return true;
    if (overrides.has(dateStr)) return true;
    if (cal.price_override != null || cal.custom_price != null) return true;
    if (cal.price != null && roomBase != null)
      return Number(cal.price) !== Number(roomBase);
    return false;
  };

  const getDay = (day: number): CalendarDay | null => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return calendar.find((c) => c.date === dateStr) || null;
  };

  const handleDayClick = (dayNum: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
    const existing = getDay(dayNum);

    setSelectedDay({
      ...existing,
      date: dateStr,
      is_override: isOverrideDay(dateStr, existing),
    });

    if (isOverrideDay(dateStr, existing) || existing?.blocked) {
      setActionModalOpen(true);
    } else {
      openRule(dateStr);
    }
  };

  const openRule = (startDate?: string) => {
    setActionModalOpen(false);
    setRuleErr({});
    setRule({
      start_date: startDate || "",
      end_date: startDate || "",
      price_override: null,
      is_blocked: false,
      closed_to_arrival: false,
      closed_to_departure: false,
      min_stay: null,
    });
    setRuleOpen(true);
  };

  const removeOverrideForDate = async (dateStr: string) => {
    setSaving(true);
    try {
      await del(`/rooms/${selectedRoom}/pricing-rules?date=${dateStr}`);
      const next = new Set(overrides);
      next.delete(dateStr);
      setOverrides(next);
      writeOverrides(selectedRoom, next);
      toast("Regulă ștersă cu succes.", "success");
      setActionModalOpen(false);
      await loadCalendar();
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setSaving(false);
    }
  };

  const submitRule = async () => {
    const errs: Record<string, string> = {};
    if (!rule.start_date) errs.start_date = "Obligatoriu";
    if (!rule.end_date) errs.end_date = "Obligatoriu";
    if (rule.start_date && rule.end_date && rule.start_date > rule.end_date)
      errs.end_date = "Invalid";

    if (
      !rule.is_blocked &&
      !rule.closed_to_arrival &&
      !rule.closed_to_departure &&
      rule.min_stay === null &&
      (rule.price_override === null || rule.price_override < 0)
    ) {
      errs.general = "Introduceți o regulă validă.";
    }

    setRuleErr(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    try {
      await post(`/rooms/${selectedRoom}/pricing-rules`, {
        start_date: rule.start_date,
        end_date: rule.end_date,
        price_override: rule.is_blocked
          ? null
          : rule.price_override !== null
            ? Number(rule.price_override)
            : null,
        is_blocked: rule.is_blocked,
        closed_to_arrival: rule.closed_to_arrival,
        closed_to_departure: rule.closed_to_departure,
        min_stay: rule.min_stay !== null ? Number(rule.min_stay) : 1,
      });
      const next = new Set(overrides);
      for (const d of eachDate(rule.start_date, rule.end_date)) next.add(d);
      setOverrides(next);
      writeOverrides(selectedRoom, next);
      toast("Regulă salvată.", "success");
      setRuleOpen(false);
      await loadCalendar();
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setSaving(false);
    }
  };

  const monthName = monthDate.toLocaleDateString("ro-RO", {
    month: "long",
    year: "numeric",
  });
  const basePrice = rooms.find(
    (r) => String(r.id) === selectedRoom,
  )?.base_price;

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-white text-black p-4 sm:p-8 space-y-8">
        <div className="max-w-7xl mx-auto space-y-8 pb-10 bg-white">
          <SectionHeader eyebrow="Tarife" title="Prețuri & calendar" />
          <Card className="p-5 bg-white border border-black/10 rounded-2xl">
            <Skeleton className="h-10 w-48 bg-black/5" />
            <div className="mt-4 grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }).map((_, i) => (
                <Skeleton key={i} className="h-16 bg-black/5" />
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white text-black p-4 sm:p-8 space-y-8">
      <div className="max-w-7xl mx-auto space-y-8 pb-10 bg-white">
        <SectionHeader eyebrow="Tarife" title="Prețuri & calendar" />

        {rooms.length === 0 ? (
          <Card className="bg-white border border-black/10 rounded-2xl">
            <EmptyState title="Nicio cameră" hint="Adaugă camere mai întâi." />
          </Card>
        ) : (
          <>
            <Card className="mb-5 p-4 bg-white border border-black/10 rounded-2xl shadow-sm">
              <Field label="Selectează cameră">
                <select
                  className={inputCls}
                  value={selectedRoom}
                  onChange={(e) => setSelectedRoom(e.target.value)}
                >
                  {rooms.map((r) => (
                    <option key={r.id} value={String(r.id)}>
                      {roomLabel(r)}
                    </option>
                  ))}
                </select>
              </Field>
              {basePrice != null && (
                <p className="mt-3 text-[12px] text-black/60">
                  Tarif de bază:{" "}
                  <span className="font-semibold text-black">
                    {money(Number(basePrice))}
                  </span>{" "}
                  / noapte
                </p>
              )}
            </Card>

            <Card className="p-4 sm:p-6 bg-white border border-black/10 rounded-2xl shadow-sm">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setMonthOffset((m) => m - 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-black/10 bg-white text-black transition-all hover:bg-black/5"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <h3
                    className="text-[16px] font-semibold capitalize text-black"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {monthName}
                  </h3>
                  <button
                    onClick={() => setMonthOffset((m) => m + 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-black/10 bg-white text-black transition-all hover:bg-black/5"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] font-medium text-black/60">
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-5 rounded bg-white border border-black/10" />{" "}
                    Standard
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-5 rounded border border-amber-400 bg-amber-50" />{" "}
                    Modificat
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-5 rounded bg-black" /> Blocat
                  </span>
                </div>
              </div>

              {calLoading ? (
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 35 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 bg-black/5 rounded-xl" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-2">
                  {["Lu", "Ma", "Mi", "Jo", "Vi", "Sâ", "Du"].map((d) => (
                    <div
                      key={d}
                      className="text-center text-[10px] font-bold uppercase tracking-[0.15em] text-black/40 py-2"
                    >
                      {d}
                    </div>
                  ))}
                  {Array.from({ length: firstWeekday }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const cal = getDay(day);
                    const blocked = cal?.blocked || cal?.available === false;
                    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    const isOverride = isOverrideDay(dateStr, cal);

                    const rawPrice =
                      cal?.price ?? cal?.price_override ?? cal?.custom_price;
                    const dayPrice =
                      rawPrice != null
                        ? Number(rawPrice)
                        : Number(basePrice || 0);

                    return (
                      <button
                        key={day}
                        onClick={() => handleDayClick(day)}
                        className={`relative flex h-[50px] flex-col items-center justify-center gap-0.5 rounded-lg border px-0.5 transition-all hover:scale-[1.02] sm:h-[66px] sm:gap-1 sm:rounded-xl ${
                          blocked
                            ? "border-black bg-black text-white shadow-sm"
                            : isOverride
                              ? "border-amber-300 bg-amber-50/70 text-black font-semibold shadow-sm ring-1 ring-amber-300/50"
                              : "border-black/10 bg-white text-black hover:border-black/30 hover:bg-black/[0.02]"
                        }`}
                      >
                        {isOverride && !blocked && (
                          <span
                            className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-amber-500 sm:top-1.5 sm:right-1.5"
                            title="Modificat manual"
                          />
                        )}
                        <span className="text-[11px] font-bold leading-none sm:text-[12px]">
                          {day}
                        </span>
                        {blocked ? (
                          <Lock
                            size={11}
                            className="text-white/70 mt-0.5 sm:size-[12px]"
                          />
                        ) : (
                          <span
                            className={`w-full truncate text-center text-[8.5px] font-semibold leading-none tabular-nums sm:text-[10px] ${isOverride ? "text-amber-800 font-bold" : "text-black/60"}`}
                          >
                            {Math.round(dayPrice)}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </Card>
          </>
        )}

        {actionModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
            onClick={() => setActionModalOpen(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl border border-black/10 bg-white p-6 shadow-xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-black/5 pb-3">
                <h4 className="text-base font-semibold text-black">
                  Ziua: {selectedDay?.date}
                </h4>
                <button
                  onClick={() => setActionModalOpen(false)}
                  className="rounded-lg p-1 text-black/40 transition-colors hover:bg-black/5 hover:text-black"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-sm text-black/70">
                Această zi are o regulă sau un preț personalizat.
              </p>

              <div className="flex flex-col gap-2 pt-1">
                {selectedDay?.is_override && (
                  <button
                    disabled={saving}
                    onClick={() => void removeOverrideForDate(selectedDay.date)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-2.5 text-xs font-semibold text-red-600 transition-all hover:bg-red-100 disabled:opacity-50"
                  >
                    <Trash2 size={14} /> Resetează prețul
                  </button>
                )}
                <button
                  onClick={() => openRule(selectedDay?.date)}
                  className="flex w-full items-center justify-center rounded-xl bg-black py-2.5 text-xs font-semibold text-white transition-all hover:bg-neutral-800"
                >
                  Editează regula
                </button>
              </div>
            </div>
          </div>
        )}

        {ruleOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
            onClick={() => setRuleOpen(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl border border-black/10 bg-white p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-black/5 pb-3">
                <h3 className="text-base font-semibold text-black">
                  Setează regulă preț & restricții
                </h3>
                <button
                  onClick={() => setRuleOpen(false)}
                  className="rounded-lg p-1 text-black/40 transition-colors hover:bg-black/5 hover:text-black"
                >
                  <X size={18} />
                </button>
              </div>

              {ruleErr.general && (
                <div className="rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600 border border-red-100">
                  {ruleErr.general}
                </div>
              )}

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Data start" error={ruleErr.start_date}>
                    <input
                      type="date"
                      className={inputCls}
                      value={rule.start_date}
                      onChange={(e) =>
                        setRule({ ...rule, start_date: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="Data sfârșit" error={ruleErr.end_date}>
                    <input
                      type="date"
                      className={inputCls}
                      value={rule.end_date}
                      onChange={(e) =>
                        setRule({ ...rule, end_date: e.target.value })
                      }
                    />
                  </Field>
                </div>

                <Field
                  label="Preț nou (RON / noapte)"
                  error={ruleErr.price_override}
                >
                  <input
                    type="number"
                    min={0}
                    className={inputCls}
                    value={rule.price_override ?? ""}
                    onChange={(e) =>
                      setRule({
                        ...rule,
                        price_override:
                          e.target.value === "" ? null : Number(e.target.value),
                      })
                    }
                    disabled={rule.is_blocked}
                    placeholder={rule.is_blocked ? "Blocat" : "ex: 450"}
                  />
                </Field>

                <Field label="Ședere minimă (nopți)" error={ruleErr.min_stay}>
                  <input
                    type="number"
                    min={1}
                    className={inputCls}
                    value={rule.min_stay ?? ""}
                    onChange={(e) =>
                      setRule({
                        ...rule,
                        min_stay:
                          e.target.value === "" ? null : Number(e.target.value),
                      })
                    }
                    placeholder="ex: 2"
                  />
                </Field>

                <div className="space-y-2 pt-1">
                  <label className="flex items-center gap-2.5 cursor-pointer text-sm text-black">
                    <input
                      type="checkbox"
                      checked={rule.is_blocked}
                      onChange={(e) =>
                        setRule({ ...rule, is_blocked: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-black/20 accent-black"
                    />
                    Blochează camera (Indisponibil)
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer text-sm text-black">
                    <input
                      type="checkbox"
                      checked={rule.closed_to_arrival}
                      onChange={(e) =>
                        setRule({
                          ...rule,
                          closed_to_arrival: e.target.checked,
                        })
                      }
                      className="h-4 w-4 rounded border-black/20 accent-black"
                    />
                    Fără Check-in în aceste zile (CTA)
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer text-sm text-black">
                    <input
                      type="checkbox"
                      checked={rule.closed_to_departure}
                      onChange={(e) =>
                        setRule({
                          ...rule,
                          closed_to_departure: e.target.checked,
                        })
                      }
                      className="h-4 w-4 rounded border-black/20 accent-black"
                    />
                    Fără Check-out în aceste zile (CTD)
                  </label>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2 border-t border-black/5 pt-4">
                <button
                  onClick={() => setRuleOpen(false)}
                  className="rounded-xl border border-black/10 px-4 py-2 text-xs font-semibold text-black transition-all hover:bg-black/5"
                >
                  Anulează
                </button>
                <button
                  disabled={saving}
                  onClick={() => void submitRule()}
                  className="rounded-xl bg-black px-5 py-2 text-xs font-semibold text-white transition-all hover:bg-neutral-800 disabled:opacity-60"
                >
                  {saving ? "Se aplică…" : "Salvează"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
