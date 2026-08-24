import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Lock, TrendingUp } from "lucide-react";
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
import { get, post, list, money, errMsg, type Room } from "../../lib/admin";
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
  const [rule, setRule] = useState<RuleForm>({
    start_date: "",
    end_date: "",
    price_override: null,
    is_blocked: false,
  });
  const [ruleErr, setRuleErr] = useState<Record<string, string>>({});

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

      // Verificăm exact structura obiectelor venite din API în consolă
      console.log("Calendar API Response:", data);

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

  const getDay = (day: number): CalendarDay | null => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return calendar.find((c) => c.date === dateStr) || null;
  };

  const openRule = (startDate?: string) => {
    setRuleErr({});
    setRule({
      start_date: startDate || "",
      end_date: startDate || "",
      price_override: null,
      is_blocked: false,
    });
    setRuleOpen(true);
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
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e5e5e5] text-[#525252] hover:border-[#111111]"
                >
                  <ChevronLeft size={16} />
                </button>
                <h3
                  className="text-[15px] font-semibold capitalize text-[#111111]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {monthName}
                </h3>
                <button
                  onClick={() => setMonthOffset((m) => m + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e5e5e5] text-[#525252] hover:border-[#111111]"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[10px] text-[#6b6b6b] sm:text-[11px]">
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-5 rounded bg-[#ededed]" /> Preț
                  standard
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-5 rounded bg-[#ededed]/50 border border-[#737373]/50" />{" "}
                  Preț custom
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-5 rounded bg-[#111111]" />{" "}
                  Blocat
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
                    className="text-center text-[10px] font-bold uppercase tracking-[0.15em] text-[#6b6b6b]"
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
                  const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const blocked = cal?.blocked || cal?.available === false;

                  // Calcul corectat pentru prețuri
                  const rawPrice =
                    cal?.price ?? cal?.price_override ?? cal?.custom_price;
                  const isCustom =
                    rawPrice != null && Number(rawPrice) !== Number(basePrice);
                  const dayPrice =
                    rawPrice != null
                      ? Number(rawPrice)
                      : Number(basePrice || 0);

                  return (
                    <button
                      key={day}
                      onClick={() => openRule(dateStr)}
                      className={`flex h-[52px] flex-col items-center justify-center gap-0.5 rounded-lg border text-[10px] transition-all hover:scale-[1.03] sm:h-[60px] sm:text-[11px] ${
                        blocked
                          ? "border-[#111111] bg-[#111111] text-white"
                          : isCustom
                            ? "border-[#737373]/50 bg-[#ededed]/50 text-[#111111]"
                            : "border-[#e5e5e5] bg-[#ededed] text-[#525252] hover:border-[#111111]"
                      }`}
                    >
                      <span className="font-bold leading-none">{day}</span>
                      {blocked ? (
                        <Lock size={11} className="text-white/70" />
                      ) : (
                        <span
                          className={`text-[9px] font-semibold leading-none ${isCustom ? "text-[#404040]" : "text-[#8a8a8a]"}`}
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
              className="h-4 w-4 accent-[#111111]"
            />
            <span className="text-sm text-[#111111]">
              Blochează perioada (mentenanță)
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
