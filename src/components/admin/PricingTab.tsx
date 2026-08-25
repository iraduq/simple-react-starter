import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Lock, Trash2 } from "lucide-react";
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

  // Stare pentru ziua selectată în mod detaliat (ștergere override)
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [actionModalOpen, setActionModalOpen] = useState(false);

  const [rule, setRule] = useState<RuleForm>({
    start_date: "",
    end_date: "",
    price_override: null,
    is_blocked: false,
  });
  const [ruleErr, setRuleErr] = useState<Record<string, string>>({});
  const [overrides, setOverrides] = useState<Set<string>>(new Set());

  useEffect(() => {
    setOverrides(readOverrides(selectedRoom));
  }, [selectedRoom]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await get<unknown>("/rooms");
        const all = list<Room>(data);
        setRooms(all);
        if (all.length > 0) setSelectedRoom(String(all[0].id));
      } catch (e) {
        toast(errMsg(e), "error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const monthDate = useMemo(() => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() + monthOffset);
    return d;
  }, [monthOffset]);

  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();

  const loadCalendar = async () => {
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
  };

  useEffect(() => {
    if (selectedRoom) void loadCalendar();
  }, [selectedRoom, monthOffset]);

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

    // Dacă ziua are deja override sau este blocată, deschidem meniul de acțiuni (Scoatere override / Modificare)
    if (isOverrideDay(dateStr, existing) || existing?.blocked) {
      setActionModalOpen(true);
    } else {
      // Altfel deschidem direct formularul de adăugare regulă/override
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
    });
    setRuleOpen(true);
  };

  const removeOverrideForDate = async (dateStr: string) => {
    setSaving(true);
    try {
      // Apelăm endpoint-ul de DELETE creat în backend cu data trimisă ca query param
      await del(`/rooms/${selectedRoom}/pricing-rules?date=${dateStr}`);

      const next = new Set(overrides);
      next.delete(dateStr);
      setOverrides(next);
      writeOverrides(selectedRoom, next);
      toast("Override șters. S-a revenit la prețul dinamic.", "success");
      setActionModalOpen(false);
      await loadCalendar(); // Reîncărcăm calendarul din baza de date
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setSaving(false);
    }
  };
  const submitRule = async () => {
    const errs: Record<string, string> = {};
    if (!rule.start_date) errs.start_date = "Selectează data de start.";
    if (!rule.end_date) errs.end_date = "Selectează data de sfârșit.";
    if (rule.start_date && rule.end_date && rule.start_date > rule.end_date)
      errs.end_date = "Data de sfârșit trebuie să fie după cea de start.";
    if (
      !rule.is_blocked &&
      (rule.price_override === null || rule.price_override < 0)
    )
      errs.price_override = "Introdu un preț valid sau marchează ca blocat.";
    setRuleErr(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    try {
      await post(`/rooms/${selectedRoom}/pricing-rules`, {
        start_date: rule.start_date,
        end_date: rule.end_date,
        price_override: rule.is_blocked ? null : Number(rule.price_override),
        is_blocked: rule.is_blocked,
      });
      const next = new Set(overrides);
      for (const d of eachDate(rule.start_date, rule.end_date)) next.add(d);
      setOverrides(next);
      writeOverrides(selectedRoom, next);
      toast("Regulă aplicată.", "success");
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
      <div>
        <SectionHeader eyebrow="Tarife" title="Prețuri & calendar" />
        <Card className="p-5">
          <Skeleton className="h-10 w-48" />
          <div className="mt-4 grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <SectionHeader eyebrow="Tarife" title="Prețuri & calendar" />

      {rooms.length === 0 ? (
        <Card>
          <EmptyState title="Nicio cameră" hint="Adaugă camere mai întâi." />
        </Card>
      ) : (
        <>
          <Card className="mb-5 p-4">
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
          </Card>

          <Card className="p-3 sm:p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMonthOffset((m) => m - 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e1e8f0] text-[#2a3b52] hover:border-[#0d2c5c]"
                >
                  <ChevronLeft size={16} />
                </button>
                <h3
                  className="text-[15px] font-semibold capitalize text-[#0d2c5c]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {monthName}
                </h3>
                <button
                  onClick={() => setMonthOffset((m) => m + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e1e8f0] text-[#2a3b52] hover:border-[#0d2c5c]"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[10px] text-[#4f6280] sm:text-[11px]">
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-5 rounded bg-[#eef2f7]" /> Preț
                  standard
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-5 rounded border border-[#c69a3f] bg-[#fdf6e6]" />{" "}
                  Override / Manual
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-5 rounded bg-[#0d2c5c]" /> Blocat
                </span>
              </div>
            </div>

            {calLoading ? (
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {Array.from({ length: 35 }).map((_, i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {["Lu", "Ma", "Mi", "Jo", "Vi", "Sâ", "Du"].map((d) => (
                  <div
                    key={d}
                    className="text-center text-[10px] font-bold uppercase tracking-[0.15em] text-[#4f6280]"
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
                      className={`relative flex h-[52px] flex-col items-center justify-center gap-0.5 rounded-lg border text-[10px] transition-all hover:scale-[1.03] sm:h-[60px] sm:text-[11px] ${
                        blocked
                          ? "border-[#0d2c5c] bg-[#0d2c5c] text-white"
                          : isOverride
                            ? "border-[#c69a3f] bg-[#fdf6e6] text-[#0d2c5c] font-semibold shadow-[0_6px_16px_rgba(198,154,63,0.18)]"
                            : "border-[#e1e8f0] bg-[#eef2f7] text-[#2a3b52] hover:border-[#0d2c5c]"
                      }`}
                    >
                      {/* Indicator mic pentru override */}
                      {isOverride && !blocked && (
                        <span
                          className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-[#c69a3f]"
                          title="Preț fixat manual (Override)"
                        />
                      )}
                      <span className="font-bold leading-none">{day}</span>
                      {blocked ? (
                        <Lock size={11} className="text-white/70" />
                      ) : (
                        <span
                          className={`text-[9px] font-semibold leading-none ${isOverride ? "text-[#8a6420] font-bold" : "text-[#6b7c99]"}`}
                        >
                          {money(dayPrice).replace(",\u00a0", "\u00a0")}
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

      {/* Modal de opțiuni pentru o zi (Modificare sau Ștergere Override) */}
      <Modal
        open={actionModalOpen}
        title={`Gestionare zi: ${selectedDay?.date}`}
        onClose={() => setActionModalOpen(false)}
        width="max-w-sm"
      >
        <div className="space-y-3 py-2">
          <p className="text-sm text-[#2a3b52]">
            Această zi are un preț sau o regulă specială setată. Ce dorești să
            faci?
          </p>
          <div className="flex flex-col gap-2 pt-2">
            {selectedDay?.is_override && (
              <Button
                variant="ghost"
                className="justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
                disabled={saving}
                onClick={() => void removeOverrideForDate(selectedDay.date)}
              >
                <Trash2 size={16} className="mr-2" /> Șterge override (Revenire
                la dinamic)
              </Button>
            )}
            <Button
              variant="primary"
              className="justify-start"
              onClick={() => openRule(selectedDay?.date)}
            >
              Setare altă regulă / interval nou
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de adăugare regulă nouă */}
      <Modal
        open={ruleOpen}
        title="Regulă tarifară / blocare"
        onClose={() => setRuleOpen(false)}
        width="max-w-md"
      >
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
                onChange={(e) => setRule({ ...rule, end_date: e.target.value })}
              />
            </Field>
          </div>
          <Field
            label="Preț suprascriere (RON / noapte)"
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
              placeholder={
                rule.is_blocked ? "Blocat pentru mentenanță" : "ex: 450"
              }
            />
          </Field>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={rule.is_blocked}
              onChange={(e) =>
                setRule({ ...rule, is_blocked: e.target.checked })
              }
              className="h-4 w-4 accent-[#0d2c5c]"
            />
            <span className="text-sm text-[#0d2c5c]">
              Blocochează perioada (mentenanță)
            </span>
          </label>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setRuleOpen(false)}>
            Renunță
          </Button>
          <Button disabled={saving} onClick={() => void submitRule()}>
            {saving ? "Se aplică…" : "Aplică regula"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
