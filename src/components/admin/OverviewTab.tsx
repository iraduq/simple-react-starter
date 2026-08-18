import { useEffect, useMemo, useState } from "react";
import { CalendarDays, BedDouble, TrendingUp, Users } from "lucide-react";
import {
  Card,
  SectionHeader,
  Button,
  Badge,
  statusTone,
  TableSkeleton,
  EmptyState,
  Skeleton,
} from "./ui";
import {
  get,
  post,
  list,
  money,
  dateFmt,
  errMsg,
  type Booking,
  type Room,
  type AdminUser,
} from "../../lib/admin";
import { useToast } from "../Toast";

function Kpi({
  icon: Icon,
  label,
  value,
  hint,
  loading,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  hint?: string;
  loading: boolean;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#6b7c99]">
            {label}
          </span>
          {loading ? (
            <Skeleton className="mt-3 h-8 w-24" />
          ) : (
            <p
              className="mt-2 text-[2rem] leading-none text-[#0d2c5c]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {value}
            </p>
          )}
          {hint && <span className="mt-2 block text-[11px] text-[#8595aa]">{hint}</span>}
        </div>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f4e5c8] text-[#8a6413]">
          <Icon size={18} />
        </span>
      </div>
    </Card>
  );
}

const WEEK_DAYS = ["Lu", "Ma", "Mi", "Jo", "Vi", "Sâ", "Du"];

export default function OverviewTab() {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [b, r, u] = await Promise.allSettled([
      get<unknown>("/bookings"),
      get<unknown>("/rooms"),
      get<unknown>("/users/admin/all"),
    ]);
    if (b.status === "fulfilled") setBookings(list<Booking>(b.value));
    if (r.status === "fulfilled") setRooms(list<Room>(r.value));
    if (u.status === "fulfilled") setUsers(list<AdminUser>(u.value));
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const stats = useMemo(() => {
    const active = bookings.filter((b) => b.status === "confirmed" || b.status === "pending");
    const revenue = bookings
      .filter((b) => b.status !== "cancelled")
      .reduce((s, b) => s + Number(b.total_price || 0), 0);
    const today = new Date().toISOString().split("T")[0];
    const occupiedRoomIds = new Set(
      bookings
        .filter(
          (b) =>
            b.status === "confirmed" &&
            (b.check_in || "") <= today &&
            (b.check_out || "") > today,
        )
        .map((b) => String(b.room_id)),
    );
    const occupancy = rooms.length ? Math.round((occupiedRoomIds.size / rooms.length) * 100) : 0;
    return { active: active.length, revenue, occupancy, occupied: occupiedRoomIds.size };
  }, [bookings, rooms]);

  const pending = bookings.filter((b) => b.status === "pending").slice(0, 5);

  const act = async (id: Booking["id"], kind: "confirm" | "cancel") => {
    setBusy(`${id}-${kind}`);
    try {
      await post(`/bookings/${id}/${kind}`, kind === "cancel" ? { reason: null } : undefined);
      toast(kind === "confirm" ? "Rezervare confirmată." : "Rezervare anulată.", "success");
      await load();
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setBusy(null);
    }
  };

  // week grid
  const week = useMemo(() => {
    const now = new Date();
    const dow = (now.getDay() + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - dow);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d.toISOString().split("T")[0];
    });
  }, []);

  const isBooked = (roomId: Room["id"], day: string) =>
    bookings.some(
      (b) =>
        String(b.room_id) === String(roomId) &&
        (b.status === "confirmed" || b.status === "pending") &&
        (b.check_in || "") <= day &&
        (b.check_out || "") > day,
    );

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          icon={CalendarDays}
          label="Rezervări active"
          value={String(stats.active)}
          hint={`${bookings.length} în total`}
          loading={loading}
        />
        <Kpi
          icon={TrendingUp}
          label="Venituri generate"
          value={money(stats.revenue)}
          hint="Exclus anulările"
          loading={loading}
        />
        <Kpi
          icon={BedDouble}
          label="Grad de ocupare"
          value={`${stats.occupancy}%`}
          hint={`${stats.occupied}/${rooms.length} camere ocupate azi`}
          loading={loading}
        />
        <Kpi
          icon={Users}
          label="Utilizatori"
          value={String(users.length)}
          hint="Conturi înregistrate"
          loading={loading}
        />
      </div>

      <div>
        <SectionHeader
          eyebrow="În așteptare"
          title="Rezervări recente"
          action={
            <Button variant="ghost" size="sm" onClick={() => void load()}>
              Reîmprospătează
            </Button>
          }
        />
        <Card>
          {loading ? (
            <TableSkeleton />
          ) : pending.length === 0 ? (
            <EmptyState title="Nicio rezervare în așteptare" hint="Totul este la zi." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[#eef2f7] text-[10px] uppercase tracking-[0.18em] text-[#6b7c99]">
                    <th className="px-5 py-3 font-bold">Client</th>
                    <th className="px-5 py-3 font-bold">Cameră</th>
                    <th className="px-5 py-3 font-bold">Perioadă</th>
                    <th className="px-5 py-3 font-bold">Total</th>
                    <th className="px-5 py-3 font-bold text-right">Acțiuni</th>
                  </tr>
                </thead>
                <tbody>
                  {pending.map((b) => (
                    <tr key={b.id} className="border-b border-[#f4f6f9] last:border-0">
                      <td className="px-5 py-3.5">
                        <span className="block font-semibold text-[#0d2c5c]">
                          {b.guest_name || "—"}
                        </span>
                        <span className="text-[12px] text-[#6b7c99]">{b.guest_email || "—"}</span>
                      </td>
                      <td className="px-5 py-3.5 text-[#2a3b52]">
                        {b.room_name || `#${b.room_id ?? "—"}`}
                      </td>
                      <td className="px-5 py-3.5 text-[#2a3b52]">
                        {dateFmt(b.check_in)} → {dateFmt(b.check_out)}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-[#0d2c5c]">
                        {money(b.total_price)}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="gold"
                            disabled={busy === `${b.id}-confirm`}
                            onClick={() => void act(b.id, "confirm")}
                          >
                            Confirmă
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            disabled={busy === `${b.id}-cancel`}
                            onClick={() => void act(b.id, "cancel")}
                          >
                            Anulează
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <div>
        <SectionHeader eyebrow="Săptămâna curentă" title="Disponibilitate camere" />
        <Card className="overflow-x-auto p-5">
          {loading ? (
            <TableSkeleton rows={4} />
          ) : rooms.length === 0 ? (
            <EmptyState title="Nicio cameră definită" />
          ) : (
            <table className="w-full min-w-[680px] text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-[0.18em] text-[#6b7c99]">
                  <th className="py-2 text-left font-bold">Cameră</th>
                  {week.map((d, i) => (
                    <th key={d} className="py-2 text-center font-bold">
                      {WEEK_DAYS[i]} {d.slice(8)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rooms.map((r) => (
                  <tr key={r.id}>
                    <td className="py-2 pr-4 text-[13px] font-medium text-[#0d2c5c]">{r.name}</td>
                    {week.map((d) => (
                      <td key={d} className="px-1 py-2">
                        <span
                          className={`mx-auto block h-7 rounded-lg ${
                            isBooked(r.id, d) ? "bg-[#c69a3f]" : "bg-[#eaf0f9]"
                          }`}
                          title={isBooked(r.id, d) ? "Rezervat" : "Liber"}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="mt-4 flex items-center gap-4 text-[11px] text-[#6b7c99]">
            <span className="flex items-center gap-2">
              <span className="h-3 w-5 rounded bg-[#eaf0f9]" /> Liber
            </span>
            <span className="flex items-center gap-2">
              <span className="h-3 w-5 rounded bg-[#c69a3f]" /> Rezervat
            </span>
            <Badge tone={statusTone("confirmed")}>live</Badge>
          </div>
        </Card>
      </div>
    </div>
  );
}