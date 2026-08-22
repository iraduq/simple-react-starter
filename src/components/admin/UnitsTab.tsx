import { useEffect, useMemo, useState } from "react";
import { Plus, DoorOpen, Search, BedDouble, Trash2 } from "lucide-react";
import { Badge, TableSkeleton, EmptyState } from "./ui";
import {
  get,
  post,
  patch,
  del,
  list,
  errMsg,
  type Room,
  type RoomUnit,
} from "../../lib/admin";
import { useToast } from "../Toast";

const roomLabel = (r: Room) =>
  (r.name as string) || (r as any).title || `Cameră #${r.id}`;

export default function UnitsTab() {
  const { toast } = useToast();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [units, setUnits] = useState<RoomUnit[]>([]);
  const [unitsLoading, setUnitsLoading] = useState(false);
  const [unitName, setUnitName] = useState("");
  const [adding, setAdding] = useState(false);
  const [query, setQuery] = useState("");

  const loadRooms = async () => {
    setLoading(true);
    try {
      const data = await get<unknown>("/rooms");
      const rs = list<Room>(data);
      setRooms(rs);
      if (rs.length && selectedId === null) setSelectedId(rs[0].id);
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setLoading(false);
    }
  };

  const loadUnits = async (roomId: string | number) => {
    setUnitsLoading(true);
    try {
      const room = await get<Room>(`/rooms/${roomId}`);
      setUnits(room?.units || []);
    } catch (e) {
      toast(errMsg(e), "error");
      setUnits([]);
    } finally {
      setUnitsLoading(false);
    }
  };

  useEffect(() => {
    void loadRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedId !== null) void loadUnits(selectedId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const selectedRoom = useMemo(
    () => rooms.find((r) => String(r.id) === String(selectedId)) || null,
    [rooms, selectedId],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rooms;
    return rooms.filter((r) => roomLabel(r).toLowerCase().includes(q));
  }, [rooms, query]);

  const addUnit = async () => {
    if (!selectedId || !unitName.trim()) return;
    setAdding(true);
    try {
      await post(`/rooms/${selectedId}/units`, { name: unitName.trim() });
      toast("Unitate adăugată.", "success");
      setUnitName("");
      await loadUnits(selectedId);
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setAdding(false);
    }
  };

  const toggleUnit = async (u: RoomUnit) => {
    if (!selectedId) return;
    const newActive = u.is_active === false;
    try {
      await patch(`/rooms/${selectedId}/units/${u.id}`, {
        is_active: newActive,
      });
      toast(
        newActive ? "Unitate activată." : "Unitate pusă în mentenanță.",
        "success",
      );
      await loadUnits(selectedId);
    } catch (e) {
      toast(errMsg(e), "error");
    }
  };

  const removeUnit = async (u: RoomUnit) => {
    if (!selectedId) return;
    try {
      await del(`/rooms/${selectedId}/units/${u.id}`);
      toast("Unitate ștearsă.", "success");
      await loadUnits(selectedId);
    } catch (e) {
      toast(errMsg(e), "error");
    }
  };

  const activeCount = units.filter((u) => u.is_active !== false).length;

  return (
    <div>
      <div className="mb-6">
        <span className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.22em] text-[#8595aa]">
          <span className="h-px w-8 bg-[#c69a3f]" /> Inventar
        </span>
        <h2
          className="mt-2 text-[30px] font-semibold text-[#0d2c5c]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Unități fizice
        </h2>
        <p className="mt-1 text-[13px] text-[#6b7c99]">
          Alege o cameră din listă și gestionează unitățile care pot fi
          rezervate pentru ea.
        </p>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : rooms.length === 0 ? (
        <EmptyState
          title="Nicio cameră"
          hint="Adaugă mai întâi camere din tabul „Camere & unități”."
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
          {/* Room selector */}
          <div className="rounded-2xl border border-[#e1e8f0] bg-white p-3">
            <div className="relative mb-3">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8595aa]"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Caută cameră…"
                className="w-full rounded-xl border border-[#e1e8f0] bg-[#f7f9fc] py-2.5 pl-9 pr-3 text-[13px] text-[#0d2c5c] outline-none focus:border-[#c69a3f] focus:bg-white"
              />
            </div>
            <div className="max-h-[520px] space-y-1 overflow-y-auto">
              {filtered.map((r) => {
                const active = String(r.id) === String(selectedId);
                return (
                  <button
                    key={r.id}
                    onClick={() => setSelectedId(r.id)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[13px] font-semibold transition-all ${
                      active
                        ? "bg-[#0d2c5c] text-white shadow-[0_4px_14px_rgba(13,44,92,0.18)]"
                        : "text-[#4f6280] hover:bg-[#f4f7fb] hover:text-[#0d2c5c]"
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                        active
                          ? "bg-white/10 text-[#c69a3f]"
                          : "bg-[#f4f7fb] text-[#0d2c5c]"
                      }`}
                    >
                      <BedDouble size={14} strokeWidth={1.75} />
                    </span>
                    <span className="truncate">{roomLabel(r)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Units panel */}
          <div className="rounded-2xl border border-[#e1e8f0] bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eef2f7] px-5 py-4">
              <div>
                <p
                  className="text-[17px] font-semibold text-[#0d2c5c]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {selectedRoom ? roomLabel(selectedRoom) : "—"}
                </p>
                <p className="text-[12px] text-[#6b7c99]">
                  {units.length} unități · {activeCount} active
                </p>
              </div>
              <Badge tone={activeCount > 0 ? "green" : "red"}>
                {activeCount > 0 ? "Disponibilă" : "Fără unități active"}
              </Badge>
            </div>

            <div className="px-5 py-5">
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  value={unitName}
                  onChange={(e) => setUnitName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void addUnit();
                  }}
                  placeholder="ex: Camera 101 — Etaj 1"
                  className="w-full rounded-xl border border-[#e1e8f0] bg-[#f7f9fc] px-4 py-3 text-[14px] text-[#0d2c5c] outline-none focus:border-[#c69a3f] focus:bg-white"
                />
                <button
                  disabled={adding || !unitName.trim()}
                  onClick={() => void addUnit()}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0d2c5c] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-white transition-all hover:bg-[#123a76] disabled:opacity-50"
                >
                  <Plus size={14} /> Adaugă unitate
                </button>
              </div>

              {unitsLoading ? (
                <div className="mt-5">
                  <TableSkeleton />
                </div>
              ) : units.length === 0 ? (
                <div className="mt-5 rounded-xl border border-dashed border-[#e1e8f0] bg-[#f9fbfe] py-10 text-center">
                  <DoorOpen
                    size={24}
                    className="mx-auto mb-2 text-[#8595aa]"
                    strokeWidth={1.5}
                  />
                  <p className="text-[13px] text-[#6b7c99]">
                    Nicio unitate pentru această cameră.
                  </p>
                </div>
              ) : (
                <div className="mt-5 space-y-2">
                  {units.map((u, i) => (
                    <div
                      key={u.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e1e8f0] bg-white px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f4f7fb] text-[12px] font-bold text-[#0d2c5c]">
                          {i + 1}
                        </span>
                        <div>
                          <p className="text-[14px] font-semibold text-[#0d2c5c]">
                            {u.name ||
                              u.code ||
                              (u as any).unit_number ||
                              `Unitate ${i + 1}`}
                          </p>
                          <p className="text-[12px] text-[#6b7c99]">
                            {u.is_active === false
                              ? "În mentenanță"
                              : "Activă, gata de oaspeți"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => void toggleUnit(u)}
                          className={`rounded-full border px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] transition-all ${
                            u.is_active === false
                              ? "border-[#e1e8f0] text-[#0d2c5c] hover:bg-[#f4f7fb]"
                              : "border-red-200 text-red-600 hover:bg-red-50"
                          }`}
                        >
                          {u.is_active === false ? "Activează" : "Oprește"}
                        </button>
                        <button
                          onClick={() => void removeUnit(u)}
                          title="Șterge unitatea"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-red-200 text-red-600 transition-all hover:bg-red-50"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
