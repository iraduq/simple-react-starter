import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getHousekeepingUnits, updateUnitHousekeeping, type HousekeepingUnit } from "../services/housekeepingService";
import { fetchSession, type SessionUser } from "../lib/auth";
import { apiFetch } from "../lib/api";
import { useToast } from "../components/Toast";
import { useAdminLiveSync } from "../context/AdminLiveSyncContext";
import { usePaged } from "../components/admin/ui";
import MaintenanceTab from "../components/admin/MaintenanceTab";
import LostFoundTab from "../components/admin/LostFoundTab";
import BreakfastTab from "../components/admin/BreakfastTab";

import { isHousekeepingStaff, unitId, roomTitle, unitNumber, extractFloor, normalizedCleanState, ROLE_TITLES, type PortalSection } from "../types/housekeeping";
import { SunRing, Wave, Shell } from "../components/housekeeping/DecorativeShapes";
import HousekeepingNav from "../components/housekeeping/HousekeepingNav";
import HousekeepingRoomsView from "../components/housekeeping/HousekeepingRoomsView";
import MaintenanceTicketModal, { type TicketFormState } from "../components/housekeeping/MaintenanceTicketModal";
import LostFoundModal, { type LostFormState } from "../components/housekeeping/LostFoundModal";

export default function Housekeeping({ embedded = false }: { embedded?: boolean }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sessionUser, setSessionUser] = useState<SessionUser>(null);
  const [section, setSection] = useState<PortalSection>("rooms");
  const [units, setUnits] = useState<HousekeepingUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [floorFilter, setFloorFilter] = useState<number | "all">("all");

  const [ticketUnit, setTicketUnit] = useState<HousekeepingUnit | null>(null);
  const [ticketForm, setTicketForm] = useState<TicketFormState>({
    category: "instalatii", priority: "normal", title: "", description: "", setMaintenanceStatus: true,
  });
  const [submittingTicket, setSubmittingTicket] = useState(false);

  const [lostUnit, setLostUnit] = useState<HousekeepingUnit | null>(null);
  const [lostForm, setLostForm] = useState<LostFormState>({
    item_name: "", category: "altele", storage_location: "Seif Recepție", description: "", guest_name: "", guest_email: "", guest_phone: "", booking_id: "",
  });
  const [submittingLost, setSubmittingLost] = useState(false);

  const loadUnits = useCallback(async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      const data = await getHousekeepingUnits();
      setUnits(Array.isArray(data) ? data : []);
    } catch (err: any) {
      if (!silent) toast(err?.message || "Nu am putut încărca lista camerelor.", "error");
    } finally {
      if (!silent) setRefreshing(false);
    }
  }, [toast]);

  const { isSyncing, connectionStatus } = useAdminLiveSync({ topic: "units", onSync: () => { void loadUnits(true); } });

  useEffect(() => {
    let active = true;
    (async () => {
      const s = await fetchSession(true);
      if (!active) return;
      if (!s || !isHousekeepingStaff(s)) { navigate(s ? "/" : "/login", { replace: true }); return; }
      setSessionUser(s);
      await loadUnits(true);
      if (active) setLoading(false);
    })();
    return () => { active = false; };
  }, [navigate, loadUnits]);

  const handleStatusChange = async (u: HousekeepingUnit, payload: any, successText: string) => {
    const id = unitId(u);
    if (!id) return;
    setUpdatingId(id);
    try {
      await updateUnitHousekeeping(id, payload);
      toast(`Camera ${unitNumber(u)} (${roomTitle(u)}): ${successText}`, "success");
      await loadUnits(true);
    } catch (err: any) {
      toast(err?.message || "Nu am putut actualiza statusul camerei.", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const submitMaintenanceTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketUnit || !ticketForm.title.trim() || !ticketForm.description.trim()) { toast("Completează titlul și descrierea defecțiunii.", "warning"); return; }
    setSubmittingTicket(true);
    try {
      const staffName = [sessionUser?.first_name, sessionUser?.last_name].filter(Boolean).join(" ") || sessionUser?.email || "Personal Housekeeping";
      await apiFetch("/admin/maintenance/tickets", {
        method: "POST",
        body: JSON.stringify({ unit_number: unitNumber(ticketUnit), guest_name: staffName, category: ticketForm.category, priority: ticketForm.priority, title: ticketForm.title.trim(), description: ticketForm.description.trim() }),
      });
      if (ticketForm.setMaintenanceStatus && unitId(ticketUnit)) await updateUnitHousekeeping(unitId(ticketUnit), { status: "maintenance" });
      toast(`Tichet tehnic înregistrat pentru camera ${unitNumber(ticketUnit)}!`, "success");
      setTicketUnit(null);
      await loadUnits(true);
    } catch (err: any) {
      toast(err?.message || "Nu am putut înregistra tichetul.", "error");
    } finally {
      setSubmittingTicket(false);
    }
  };

  const openLostFoundModal = async (u: HousekeepingUnit) => {
    setLostUnit(u);
    setLostForm({ item_name: "", category: "altele", storage_location: "Seif Recepție", description: "", guest_name: u.guest_name || "", guest_email: "", guest_phone: "", booking_id: "" });
    try {
      const s = await apiFetch<any>(`/lost-found/suggest-guest?unit_number=${encodeURIComponent(unitNumber(u))}`);
      if (s?.found) setLostForm((prev: any) => ({ ...prev, guest_name: s.guest_name || prev.guest_name, guest_email: s.guest_email || "", guest_phone: s.guest_phone || "", booking_id: s.booking_id || "" }));
    } catch {}
  };

  const submitLostFound = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lostUnit || !lostForm.item_name.trim()) { toast("Introdu denumirea obiectului găsit.", "warning"); return; }
    setSubmittingLost(true);
    try {
      const staffName = [sessionUser?.first_name, sessionUser?.last_name].filter(Boolean).join(" ") || sessionUser?.email || "Personal Housekeeping";
      await apiFetch("/lost-found", {
        method: "POST",
        body: JSON.stringify({ item_name: lostForm.item_name.trim(), category: lostForm.category, room_unit_number: unitNumber(lostUnit), storage_location: lostForm.storage_location.trim() || "Seif Recepție", description: lostForm.description.trim() || null, found_by_name: staffName, guest_name: lostForm.guest_name.trim() || null, guest_email: lostForm.guest_email.trim() || null, guest_phone: lostForm.guest_phone.trim() || null, booking_id: lostForm.booking_id || null }),
      });
      toast(`Obiectul "${lostForm.item_name}" din camera ${unitNumber(lostUnit)} a fost înregistrat.`, "success");
      setLostUnit(null);
    } catch (err: any) {
      toast(err?.message || "Nu am putut înregistra obiectul găsit.", "error");
    } finally {
      setSubmittingLost(false);
    }
  };

  const floors = useMemo(() => Array.from(new Set(units.map(extractFloor))).sort((a, b) => a - b), [units]);
  const counts = useMemo(() => {
    let clean = 0, dirty = 0, inspecting = 0, maintenance = 0, checkoutToday = 0, openTickets = 0;
    units.forEach((u: any) => {
      const st = normalizedCleanState(u);
      if (st === "clean") clean++; else if (st === "inspecting") inspecting++; else if (st === "maintenance") maintenance++; else dirty++;
      if (u.occupancy_state === "checkout_today") checkoutToday++;
      openTickets += u.open_tickets_count || 0;
    });
    return { all: units.length, clean, dirty, inspecting, maintenance, checkoutToday, openTickets };
  }, [units]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return units.filter((u: any) => {
      if (floorFilter !== "all" && extractFloor(u) !== floorFilter) return false;
      const state = normalizedCleanState(u);
      if (filter === "checkout_today" && u.occupancy_state !== "checkout_today") return false;
      if (filter !== "all" && filter !== "checkout_today" && state !== filter) return false;
      if (!q) return true;
      return roomTitle(u).toLowerCase().includes(q) || unitNumber(u).toLowerCase().includes(q) || (u.guest_name || "").toLowerCase().includes(q) || (u.notes || "").toLowerCase().includes(q);
    });
  }, [units, search, filter, floorFilter]);

  const paged = usePaged(filtered, 12);
  const roleCopy = ROLE_TITLES[(sessionUser?.role || "menajera").toLowerCase().trim()] || ROLE_TITLES.menajera;

  const roomsContent = (
    <>
      <HousekeepingRoomsView
        roleCopy={roleCopy} isSyncing={isSyncing} connectionStatus={connectionStatus}
        loadUnits={loadUnits} refreshing={refreshing} loading={loading} counts={counts} floors={floors}
        filter={filter} setFilter={setFilter} search={search} setSearch={setSearch} floorFilter={floorFilter}
        setFloorFilter={setFloorFilter} filtered={filtered} paged={paged} updatingId={updatingId}
        handleStatusChange={handleStatusChange}
        onOpenMaintenanceModal={(u: any) => { setTicketUnit(u); setTicketForm({ category: "instalatii", priority: "normal", title: "", description: "", setMaintenanceStatus: true }); }}
        onOpenLostFoundModal={(u: any) => void openLostFoundModal(u)}
      />
      <MaintenanceTicketModal unit={ticketUnit} form={ticketForm} setForm={setTicketForm} submitting={submittingTicket} onClose={() => setTicketUnit(null)} onSubmit={(e) => void submitMaintenanceTicket(e)} />
      <LostFoundModal unit={lostUnit} form={lostForm} setForm={setLostForm} submitting={submittingLost} onClose={() => setLostUnit(null)} onSubmit={(e) => void submitLostFound(e)} />
    </>
  );

  if (embedded) return roomsContent;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f9f7f2] pt-[68px] sm:pt-20">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-[16%] left-[5%] opacity-[0.04] hidden xl:block"><SunRing className="h-56 w-56 text-[#0d2c5c]" /></div>
        <div className="absolute top-[52%] right-[3%] opacity-[0.045] hidden lg:block"><Shell className="h-44 w-44 text-[#c69a3f]" /></div>
        <div className="absolute bottom-[10%] left-[22%] opacity-[0.045] hidden md:block"><Wave className="h-14 w-56 text-[#0d2c5c]" /></div>
      </div>
      <HousekeepingNav sessionUser={sessionUser} roleCopy={roleCopy} section={section} setSection={setSection} />
      <div className="relative z-10 mx-auto max-w-[1380px] px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        {section === "rooms" && roomsContent}
        {section === "maintenance" && <MaintenanceTab />}
        {section === "lost_found" && <LostFoundTab />}
        {section === "breakfast" && <BreakfastTab />}
      </div>
    </div>
  );
}
