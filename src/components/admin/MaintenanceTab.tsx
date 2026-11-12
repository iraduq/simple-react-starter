import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Wrench,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  UserCheck,
  Phone,
  Droplets,
  Wind,
  Lightbulb,
  Tv,
  Sparkles,
  Check,
  Plus,
  Trash2,
  Users,
  Pencil,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import { apiFetch } from "../../lib/api";
import { useToast } from "../Toast";
import { useAdminLiveSync } from "../../context/AdminLiveSyncContext";
import {
  SectionHeader,
  Card,
  PrimaryButton,
  GhostButton,
  SearchInput,
  Modal,
  Field,
  TextInput,
  Select,
  Textarea,
  Badge,
  Pagination,
  usePaged,
  TableSkeleton,
  EmptyState,
} from "./ui";

interface TicketData {
  id: number;
  ticket_code: string;
  booking_id?: string | null;
  unit_number: string;
  guest_name: string;
  guest_phone?: string | null;
  guest_email?: string | null;
  category: string;
  title: string;
  description: string;
  priority: string;
  department: string;
  status: string;
  sla_minutes: number;
  elapsed_minutes: number;
  resolution_duration_minutes?: number | null;
  is_overdue: boolean;
  assigned_to?: string | null;
  resolution_notes?: string | null;
  resolved_at?: string | null;
  created_at?: string | null;
}

interface MaintenanceStats {
  total_tickets: number;
  open_tickets: number;
  in_progress_tickets: number;
  resolved_tickets: number;
  urgent_tickets: number;
  avg_resolution_minutes: number;
  sla_compliance_percent: number;
}

interface TechnicianItem {
  id: number;
  name: string;
  specialty: string;
  department: "mentenanta" | "tehnic_it" | "housekeeping" | string;
  phone?: string | null;
  is_active: boolean;
  label: string;
}

const DEPT_LABELS: Record<string, string> = {
  mentenanta: "Mentenanță tehnică",
  tehnic_it: "IT și rețea",
  housekeeping: "Curățenie și menaj",
};

export default function MaintenanceTab() {
  const { toast } = useToast();

  const [subView, setSubView] = useState<"tickets" | "technicians">("tickets");

  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [technicians, setTechnicians] = useState<TechnicianItem[]>([]);
  const [stats, setStats] = useState<MaintenanceStats | null>(null);
  const [loading, setLoading] = useState(false);

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [techSearch, setTechSearch] = useState("");

  const [resolvingTicket, setResolvingTicket] = useState<TicketData | null>(null);
  const [resolutionNote, setResolutionNote] = useState("");
  const [submittingNote, setSubmittingNote] = useState(false);

  const [editTicketTarget, setEditTicketTarget] = useState<TicketData | null>(null);
  const [editAssignedTo, setEditAssignedTo] = useState("");
  const [editDepartment, setEditDepartment] = useState("mentenanta");
  const [editPriority, setEditPriority] = useState("normal");
  const [editStatus, setEditStatus] = useState("open");
  const [editResolutionNotes, setEditResolutionNotes] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const [deleteTicketTarget, setDeleteTicketTarget] = useState<TicketData | null>(null);
  const [deletingTicket, setDeletingTicket] = useState(false);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newUnitNumber, setNewUnitNumber] = useState("");
  const [newCategory, setNewCategory] = useState("ac");
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPriority, setNewPriority] = useState("normal");
  const [newGuestName, setNewGuestName] = useState("Recepție / Administrație Casa Esy");
  const [newGuestPhone, setNewGuestPhone] = useState("");
  const [newAssignedTo, setNewAssignedTo] = useState("");
  const [creatingTicket, setCreatingTicket] = useState(false);

  const [techModalOpen, setTechModalOpen] = useState(false);
  const [editingTech, setEditingTech] = useState<TechnicianItem | null>(null);
  const [techName, setTechName] = useState("");
  const [techSpecialty, setTechSpecialty] = useState("");
  const [techDept, setTechDept] = useState<"mentenanta" | "tehnic_it" | "housekeeping">("mentenanta");
  const [techPhone, setTechPhone] = useState("");
  const [techActive, setTechActive] = useState(true);
  const [savingTech, setSavingTech] = useState(false);
  const [deleteTechTarget, setDeleteTechTarget] = useState<TechnicianItem | null>(null);
  const [deletingTech, setDeletingTech] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [tData, sData, techData] = await Promise.all([
        apiFetch<TicketData[]>("/admin/maintenance/tickets"),
        apiFetch<MaintenanceStats>("/admin/maintenance/stats"),
        apiFetch<TechnicianItem[]>("/admin/maintenance/technicians"),
      ]);
      setTickets(Array.isArray(tData) ? tData : []);
      setStats(sData);
      setTechnicians(Array.isArray(techData) ? techData : []);
    } catch (err: any) {
      toast(err?.message || "Eroare la încărcarea datelor de mentenanță.", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useAdminLiveSync({
    topic: "all",
    onSync: (payload) => {
      if (payload?.event?.startsWith("maintenance_")) {
        void loadData();
      }
    },
  });

  const activeTechnicians = useMemo(
    () => technicians.filter((t) => t.is_active),
    [technicians]
  );

  const handleCreateTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) {
      toast("Vă rugăm introduceți titlul și descrierea defecțiunii.", "error");
      return;
    }
    setCreatingTicket(true);
    try {
      const payload = {
        unit_number: newUnitNumber.trim() || "Recepție / Resort",
        category: newCategory,
        title: newTitle.trim(),
        description: newDescription.trim(),
        priority: newPriority,
        guest_name: newGuestName.trim() || "Recepție Casa Esy",
        guest_phone: newGuestPhone.trim() || null,
        assigned_to: newAssignedTo.trim() || null,
      };
      const res = await apiFetch<TicketData>("/admin/maintenance/tickets", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      toast(`Tichetul #${res.ticket_code || "NOU"} a fost înregistrat cu succes!`, "success");
      setCreateModalOpen(false);
      setNewTitle("");
      setNewDescription("");
      setNewUnitNumber("");
      setNewGuestPhone("");
      setNewAssignedTo("");
      await loadData();
    } catch (err: any) {
      toast(err?.message || "Eroare la crearea tichetului.", "error");
    } finally {
      setCreatingTicket(false);
    }
  };

  const handleUpdateTicket = async (
    id: number,
    updates: {
      status?: string;
      priority?: string;
      department?: string;
      assigned_to?: string;
      resolution_notes?: string;
    }
  ) => {
    try {
      const res = await apiFetch<TicketData>(`/admin/maintenance/tickets/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      });
      setTickets((prev) => prev.map((t) => (t.id === id ? res : t)));
      toast(`Tichetul #${res.ticket_code} a fost actualizat.`, "success");
      const updatedStats = await apiFetch<MaintenanceStats>("/admin/maintenance/stats");
      setStats(updatedStats);
    } catch (err: any) {
      toast(err?.message || "Eroare la actualizarea tichetului.", "error");
    }
  };

  const openEditTicketModal = (ticket: TicketData) => {
    setEditTicketTarget(ticket);
    setEditAssignedTo(ticket.assigned_to || "");
    setEditDepartment(ticket.department || "mentenanta");
    setEditPriority(ticket.priority || "normal");
    setEditStatus(ticket.status || "open");
    setEditResolutionNotes(ticket.resolution_notes || "");
  };

  const handleEditTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTicketTarget) return;
    setSavingEdit(true);
    try {
      await handleUpdateTicket(editTicketTarget.id, {
        assigned_to: editAssignedTo,
        department: editDepartment,
        priority: editPriority,
        status: editStatus,
        resolution_notes: editResolutionNotes,
      });
      setEditTicketTarget(null);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingTicket) return;
    setSubmittingNote(true);
    try {
      await handleUpdateTicket(resolvingTicket.id, {
        status: "resolved",
        resolution_notes: resolutionNote,
      });
      setResolvingTicket(null);
      setResolutionNote("");
    } finally {
      setSubmittingNote(false);
    }
  };

  const confirmDeleteTicket = async () => {
    if (!deleteTicketTarget) return;
    setDeletingTicket(true);
    try {
      await apiFetch(`/admin/maintenance/tickets/${deleteTicketTarget.id}`, {
        method: "DELETE",
      });
      toast(`Tichetul #${deleteTicketTarget.ticket_code} a fost șters.`, "success");
      setDeleteTicketTarget(null);
      await loadData();
    } catch (err: any) {
      toast(err?.message || "Eroare la ștergerea tichetului.", "error");
    } finally {
      setDeletingTicket(false);
    }
  };

  const openCreateTechnicianModal = () => {
    setEditingTech(null);
    setTechName("");
    setTechSpecialty("");
    setTechDept("mentenanta");
    setTechPhone("");
    setTechActive(true);
    setTechModalOpen(true);
  };

  const openEditTechnicianModal = (tech: TechnicianItem) => {
    setEditingTech(tech);
    setTechName(tech.name);
    setTechSpecialty(tech.specialty);
    setTechDept(
      (tech.department as "mentenanta" | "tehnic_it" | "housekeeping") || "mentenanta"
    );
    setTechPhone(tech.phone || "");
    setTechActive(tech.is_active);
    setTechModalOpen(true);
  };

  const handleSaveTechnician = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!techName.trim()) {
      toast("Numele tehnicianului este obligatoriu.", "error");
      return;
    }
    setSavingTech(true);
    try {
      if (editingTech) {
        await apiFetch<TechnicianItem>(`/admin/maintenance/technicians/${editingTech.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            name: techName.trim(),
            specialty: techSpecialty.trim() || "Mentenanță generală",
            department: techDept,
            phone: techPhone.trim() || null,
            is_active: techActive,
          }),
        });
        toast(`Tehnicianul ${techName.trim()} a fost actualizat.`, "success");
      } else {
        const created = await apiFetch<TechnicianItem>("/admin/maintenance/technicians", {
          method: "POST",
          body: JSON.stringify({
            name: techName.trim(),
            specialty: techSpecialty.trim() || "Mentenanță generală",
            department: techDept,
            phone: techPhone.trim() || null,
            is_active: techActive,
          }),
        });
        toast(`Tehnicianul ${created.name} a fost adăugat în echipă.`, "success");
        if (createModalOpen) {
          setNewAssignedTo(created.label);
        }
      }
      setTechModalOpen(false);
      await loadData();
    } catch (err: any) {
      toast(err?.message || "Eroare la salvarea tehnicianului.", "error");
    } finally {
      setSavingTech(false);
    }
  };

  const handleToggleTechActive = async (tech: TechnicianItem) => {
    try {
      await apiFetch<TechnicianItem>(`/admin/maintenance/technicians/${tech.id}`, {
        method: "PATCH",
        body: JSON.stringify({ is_active: !tech.is_active }),
      });
      toast(
        !tech.is_active
          ? `${tech.name} este acum activ pentru atribuire.`
          : `${tech.name} a fost marcat indisponibil.`,
        "success"
      );
      await loadData();
    } catch (err: any) {
      toast(err?.message || "Eroare la actualizarea stării.", "error");
    }
  };

  const confirmDeleteTechnician = async () => {
    if (!deleteTechTarget) return;
    setDeletingTech(true);
    try {
      await apiFetch(`/admin/maintenance/technicians/${deleteTechTarget.id}`, {
        method: "DELETE",
      });
      toast(`Tehnicianul ${deleteTechTarget.name} a fost eliminat.`, "success");
      setDeleteTechTarget(null);
      await loadData();
    } catch (err: any) {
      toast(err?.message || "Eroare la ștergerea tehnicianului.", "error");
    } finally {
      setDeletingTech(false);
    }
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (deptFilter !== "all" && t.department !== deptFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const match =
          t.ticket_code.toLowerCase().includes(q) ||
          t.unit_number.toLowerCase().includes(q) ||
          t.guest_name.toLowerCase().includes(q) ||
          t.title.toLowerCase().includes(q) ||
          (t.assigned_to || "").toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [tickets, statusFilter, deptFilter, search]);

  const filteredTechnicians = useMemo(() => {
    const q = techSearch.trim().toLowerCase();
    if (!q) return technicians;
    return technicians.filter(
      (tech) =>
        tech.name.toLowerCase().includes(q) ||
        tech.specialty.toLowerCase().includes(q) ||
        (DEPT_LABELS[tech.department] || tech.department).toLowerCase().includes(q) ||
        (tech.phone || "").toLowerCase().includes(q)
    );
  }, [technicians, techSearch]);

  const ticketsPaged = usePaged(filteredTickets, 8);
  const techPaged = usePaged(filteredTechnicians, 9);

  const getPriorityTone = (p: string): "red" | "gold" | "navy" | "muted" => {
    switch (p) {
      case "urgent":
        return "red";
      case "high":
        return "gold";
      case "normal":
        return "navy";
      default:
        return "muted";
    }
  };

  const getStatusTone = (s: string): "green" | "navy" | "gold" => {
    switch (s) {
      case "resolved":
        return "green";
      case "in_progress":
        return "navy";
      default:
        return "gold";
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "ac":
        return Wind;
      case "plumbing":
        return Droplets;
      case "electrical":
        return Lightbulb;
      case "tv_wifi":
        return Tv;
      case "housekeeping":
        return Sparkles;
      default:
        return Wrench;
    }
  };

  const initials = (name: string) =>
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() || "")
      .join("") || "TH";

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Operațiuni Hoteliere și Tehnice"
        title="Mentenanță și tichete de service"
        description="Gestionarea defecțiunilor raportate, alocarea dinamică către echipa de tehnicieni Casa Esy și monitorizarea timpilor de intervenție SLA."
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <GhostButton size="sm" onClick={() => void loadData()} disabled={loading}>
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              Reîncarcă
            </GhostButton>
            {subView === "technicians" ? (
              <PrimaryButton size="sm" onClick={openCreateTechnicianModal}>
                <UserPlus size={14} />
                Adaugă tehnician
              </PrimaryButton>
            ) : (
              <PrimaryButton
                size="sm"
                onClick={() => {
                  setNewAssignedTo("");
                  setCreateModalOpen(true);
                }}
              >
                <Plus size={14} />
                Tichet nou
              </PrimaryButton>
            )}
          </div>
        }
      />

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-[#e1e8f0] bg-white overflow-hidden shadow-[0_8px_28px_rgba(13,44,92,0.04)]">
            <div className="h-1 w-full bg-gradient-to-r from-[#c69a3f] to-[#e6b85c]" />
            <div className="p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#fdf8ec] border border-[#c69a3f]/30 text-[#8a6420] flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <p className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#6b7c99]">
                  Tichete Active
                </p>
                <p className="font-['Outfit',sans-serif] text-[26px] font-bold text-[#0d2c5c] leading-none mt-1">
                  {stats.open_tickets + stats.in_progress_tickets}
                </p>
                <p className="text-[11px] font-semibold text-[#8a6420] mt-1">
                  {stats.urgent_tickets} urgente de rezolvat
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#e1e8f0] bg-white overflow-hidden shadow-[0_8px_28px_rgba(13,44,92,0.04)]">
            <div className="h-1 w-full bg-gradient-to-r from-emerald-600 to-teal-500" />
            <div className="p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#e6f2ea] text-[#1f6b45] flex items-center justify-center shrink-0">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <p className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#6b7c99]">
                  Rezolvate cu Succes
                </p>
                <p className="font-['Outfit',sans-serif] text-[26px] font-bold text-[#1f6b45] leading-none mt-1">
                  {stats.resolved_tickets}
                </p>
                <p className="text-[11px] text-[#6b7c99] mt-1">
                  Din {stats.total_tickets} tichete totale
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#e1e8f0] bg-white overflow-hidden shadow-[0_8px_28px_rgba(13,44,92,0.04)]">
            <div className="h-1 w-full bg-gradient-to-r from-[#0d2c5c] to-[#1e4b8f]" />
            <div className="p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#eef2f7] text-[#0d2c5c] flex items-center justify-center shrink-0">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#6b7c99]">
                  Timp Mediu Remediere
                </p>
                <p className="font-['Outfit',sans-serif] text-[26px] font-bold text-[#0d2c5c] leading-none mt-1">
                  {stats.avg_resolution_minutes} min
                </p>
                <p className="text-[11px] font-semibold text-[#0d2c5c] mt-1">
                  Target SLA &lt; 60 min
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#e1e8f0] bg-white overflow-hidden shadow-[0_8px_28px_rgba(13,44,92,0.04)]">
            <div className="h-1 w-full bg-gradient-to-r from-[#0d2c5c] via-[#c69a3f] to-[#0d2c5c]" />
            <div className="p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#0d2c5c] text-[#e6b85c] flex items-center justify-center shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#6b7c99]">
                  Conformitate SLA & Echipă
                </p>
                <p className="font-['Outfit',sans-serif] text-[26px] font-bold text-[#0d2c5c] leading-none mt-1">
                  {stats.sla_compliance_percent}%
                </p>
                <p className="text-[11px] font-semibold text-[#8a6420] mt-1">
                  {activeTechnicians.length} tehnicieni activi
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-2xl border border-[#e1e8f0] bg-white p-1.5 shadow-xs">
          <button
            type="button"
            onClick={() => setSubView("tickets")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              subView === "tickets"
                ? "bg-[#0d2c5c] text-white shadow-[0_6px_16px_rgba(13,44,92,0.2)]"
                : "text-[#4f6280] hover:text-[#0d2c5c]"
            }`}
          >
            <Wrench size={14} className={subView === "tickets" ? "text-[#e6b85c]" : ""} />
            <span>Tichete de incident ({tickets.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setSubView("technicians")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              subView === "technicians"
                ? "bg-[#0d2c5c] text-white shadow-[0_6px_16px_rgba(13,44,92,0.2)]"
                : "text-[#4f6280] hover:text-[#0d2c5c]"
            }`}
          >
            <Users size={14} className={subView === "technicians" ? "text-[#e6b85c]" : ""} />
            <span>Echipă & Tehnicieni ({technicians.length})</span>
          </button>
        </div>

        {subView === "tickets" && (
          <button
            type="button"
            onClick={() => setSubView("technicians")}
            className="text-xs font-bold text-[#8a6420] hover:text-[#0d2c5c] inline-flex items-center gap-1.5 cursor-pointer"
          >
            <UserPlus size={14} />
            Gestionează lista de tehnicieni →
          </button>
        )}
      </div>

      {subView === "tickets" ? (
        <Card className="overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-[#eef2f7] bg-[#f8fafd]/70 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex flex-wrap items-center gap-2">
              {[
                { key: "all", label: "Toate" },
                { key: "open", label: "Deschise" },
                { key: "in_progress", label: "În lucru" },
                { key: "resolved", label: "Rezolvate" },
              ].map((f) => {
                const active = statusFilter === f.key;
                return (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setStatusFilter(f.key)}
                    className={`rounded-full px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] transition cursor-pointer ${
                      active
                        ? "bg-[#0d2c5c] text-white shadow-xs"
                        : "bg-white border border-[#e1e8f0] text-[#4f6280] hover:border-[#0d2c5c] hover:text-[#0d2c5c]"
                    }`}
                  >
                    {f.label}
                  </button>
                );
              })}

              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="rounded-full border border-[#e1e8f0] bg-white px-3.5 py-1.5 text-[11.5px] font-semibold text-[#0d2c5c] outline-none focus:border-[#c69a3f] cursor-pointer"
              >
                <option value="all">Toate departamentele</option>
                <option value="mentenanta">Mentenanță tehnică</option>
                <option value="tehnic_it">IT și rețea</option>
                <option value="housekeeping">Curățenie și menaj</option>
              </select>
            </div>

            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Caută tichet, cameră, tehnician..."
            />
          </div>

          {loading ? (
            <TableSkeleton rows={6} />
          ) : filteredTickets.length === 0 ? (
            <EmptyState
              title="Niciun tichet găsit"
              hint="Ajustează filtrele de stare sau înregistrează un tichet nou de mentenanță."
            />
          ) : (
            <>
              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[960px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#eef2f7] bg-[#0d2c5c]/[0.025] text-[10px] font-bold uppercase tracking-[0.18em] text-[#6b7c99]">
                      <th className="py-3.5 px-5">Tichet</th>
                      <th className="py-3.5 px-4">Cameră / Oaspete</th>
                      <th className="py-3.5 px-4">Defecțiune</th>
                      <th className="py-3.5 px-4">Departament & Tehnician</th>
                      <th className="py-3.5 px-4">Prioritate & SLA</th>
                      <th className="py-3.5 px-4">Stare</th>
                      <th className="py-3.5 px-5 text-right">Acțiuni</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eef2f7]">
                    {ticketsPaged.slice.map((t) => {
                      const Icon = getCategoryIcon(t.category);
                      return (
                        <tr key={t.id} className="transition-colors hover:bg-[#f8fafd]">
                          <td className="py-4 px-5 align-top">
                            <span className="inline-block rounded-lg bg-[#eef2f7] px-2.5 py-1 font-mono text-[11.5px] font-bold text-[#0d2c5c]">
                              #{t.ticket_code}
                            </span>
                            <div className="mt-1.5 text-[11px] font-medium text-[#6b7c99]">
                              {t.created_at
                                ? new Date(t.created_at).toLocaleTimeString("ro-RO", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "—"}
                            </div>
                          </td>

                          <td className="py-4 px-4 align-top">
                            <div className="font-bold text-[#0d2c5c]">{t.unit_number}</div>
                            <div className="text-[12px] text-[#6b7c99] mt-0.5">{t.guest_name}</div>
                          </td>

                          <td className="py-4 px-4 max-w-xs align-top">
                            <div className="flex items-center gap-1.5 font-bold text-[#0d2c5c] text-[13px]">
                              <Icon size={14} className="text-[#c69a3f] shrink-0" />
                              <span className="truncate">{t.title}</span>
                            </div>
                            <p className="mt-1 text-[12px] text-[#4f6280] line-clamp-2 leading-relaxed">
                              {t.description}
                            </p>
                            {t.resolution_notes && (
                              <p className="mt-2 rounded-xl border border-[#1f6b45]/20 bg-[#e6f2ea] px-2.5 py-1 text-[11px] font-semibold text-[#1f6b45]">
                                ✓ {t.resolution_notes}
                              </p>
                            )}
                          </td>

                          <td className="py-4 px-4 align-top">
                            <span className="block text-[12px] font-bold text-[#0d2c5c]">
                              {DEPT_LABELS[t.department] || "Mentenanță tehnică"}
                            </span>
                            <div className="mt-1.5">
                              {t.assigned_to ? (
                                <span className="inline-flex items-center gap-1 rounded-lg border border-[#c69a3f]/30 bg-[#fdf8ec] px-2.5 py-0.5 text-[11px] font-semibold text-[#8a6420]">
                                  <UserCheck size={12} />
                                  {t.assigned_to}
                                </span>
                              ) : (
                                <span className="text-[11.5px] italic text-amber-700 font-medium">
                                  Nealocat
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-4 px-4 align-top">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <Badge tone={getPriorityTone(t.priority)}>{t.priority}</Badge>
                              {t.is_overdue && <Badge tone="red">SLA Depășit</Badge>}
                            </div>
                            <div className="mt-1.5 text-[11px] font-medium text-[#6b7c99]">
                              Target {t.sla_minutes} min · trecut {t.elapsed_minutes} min
                            </div>
                          </td>

                          <td className="py-4 px-4 align-top">
                            <select
                              value={t.status}
                              onChange={(e) => {
                                const nextStatus = e.target.value;
                                if (nextStatus === "resolved" && !t.resolution_notes) {
                                  setResolvingTicket(t);
                                  setResolutionNote("");
                                  return;
                                }
                                void handleUpdateTicket(t.id, { status: nextStatus });
                              }}
                              aria-label={`Stare tichet #${t.ticket_code}`}
                              className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider outline-none cursor-pointer transition ${
                                t.status === "resolved"
                                  ? "border-[#1f6b45]/25 bg-[#e6f2ea] text-[#1f6b45]"
                                  : t.status === "in_progress"
                                    ? "border-[#0d2c5c]/20 bg-[#eef3fb] text-[#0d2c5c]"
                                    : "border-[#c69a3f]/35 bg-[#fdf8ec] text-[#8a6420]"
                              }`}
                            >
                              <option value="open">Deschis</option>
                              <option value="in_progress">În lucru</option>
                              <option value="resolved">Rezolvat</option>
                            </select>
                          </td>

                          <td className="py-4 px-5 text-right align-top">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => openEditTicketModal(t)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#e1e8f0] bg-white text-[#0d2c5c] hover:border-[#c69a3f] hover:bg-[#fdf8ec] transition cursor-pointer"
                                title="Editează tichet / Atribuie tehnician"
                              >
                                <Pencil size={13} />
                              </button>

                              <button
                                type="button"
                                onClick={() => setDeleteTicketTarget(t)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-rose-200 bg-rose-50/60 text-rose-700 hover:bg-rose-100 transition cursor-pointer"
                                title="Șterge tichet"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <Pagination
                page={ticketsPaged.page}
                pages={ticketsPaged.pages}
                total={ticketsPaged.total}
                perPage={ticketsPaged.perPage}
                onPage={ticketsPaged.setPage}
              />
            </>
          )}
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-[#eef2f7] bg-[#f8fafd]/70 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h3 className="font-['Outfit',sans-serif] text-base font-bold text-[#0d2c5c]">
                Echipa de intervenție și mentenanță
              </h3>
              <p className="text-xs text-[#6b7c99]">
                Tehnicienii activi apar automat în dropdown-ul „Atribuire tehnician” la crearea și preluarea tichetelor.
              </p>
            </div>
            <SearchInput
              value={techSearch}
              onChange={setTechSearch}
              placeholder="Caută tehnician sau specializare..."
            />
          </div>

          {filteredTechnicians.length === 0 ? (
            <EmptyState
              title="Niciun tehnician configurat"
              hint="Adaugă membrii echipei tehnice folosind butonul «Adaugă tehnician»."
            />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
                {techPaged.slice.map((tech) => (
                  <div
                    key={tech.id}
                    className={`rounded-2xl border p-5 transition-all flex flex-col justify-between gap-4 ${
                      tech.is_active
                        ? "border-[#e1e8f0] bg-white shadow-[0_6px_22px_rgba(13,44,92,0.04)]"
                        : "border-[#e1e8f0] bg-[#f8fafc] opacity-75"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0d2c5c] text-sm font-bold text-[#e6b85c]">
                          {initials(tech.name)}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-['Outfit',sans-serif] font-bold text-[15px] text-[#0d2c5c] truncate">
                            {tech.name}
                          </h4>
                          <p className="text-xs font-medium text-[#8a6420] truncate">
                            {tech.specialty}
                          </p>
                        </div>
                      </div>
                      <Badge tone={tech.is_active ? "green" : "muted"}>
                        {tech.is_active ? "Activ" : "Indisponibil"}
                      </Badge>
                    </div>

                    <div className="space-y-1.5 text-xs text-[#4f6280]">
                      <div className="flex items-center justify-between">
                        <span className="text-[#6b7c99]">Departament:</span>
                        <span className="font-semibold text-[#0d2c5c]">
                          {DEPT_LABELS[tech.department] || tech.department}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#6b7c99]">Telefon:</span>
                        <span className="inline-flex items-center gap-1 font-mono font-semibold text-[#0d2c5c]">
                          <Phone size={11} className="text-[#c69a3f]" />
                          {tech.phone || "Nesetat"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 border-t border-[#eef2f7] pt-3">
                      <button
                        type="button"
                        onClick={() => void handleToggleTechActive(tech)}
                        className="rounded-lg border border-[#e1e8f0] bg-[#f8fafd] px-2.5 py-1.5 text-[11px] font-semibold text-[#0d2c5c] hover:border-[#0d2c5c] cursor-pointer"
                      >
                        {tech.is_active ? "Marchează indisponibil" : "Activează"}
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditTechnicianModal(tech)}
                          title="Editează tehnician"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#e1e8f0] bg-white text-[#0d2c5c] hover:border-[#0d2c5c] cursor-pointer"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTechTarget(tech)}
                          title="Șterge tehnician"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 bg-rose-50/70 text-rose-700 hover:bg-rose-100 cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Pagination
                page={techPaged.page}
                pages={techPaged.pages}
                total={techPaged.total}
                perPage={techPaged.perPage}
                onPage={techPaged.setPage}
              />
            </>
          )}
        </Card>
      )}

      <Modal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Tichet nou de mentenanță"
        subtitle="Înregistrare incident tehnic și alocare către un tehnician"
        width="max-w-2xl"
        footer={
          <>
            <GhostButton onClick={() => setCreateModalOpen(false)}>Anulează</GhostButton>
            <PrimaryButton
              type="button"
              disabled={creatingTicket}
              onClick={() => {
                const form = document.getElementById("create-maintenance-form") as HTMLFormElement | null;
                form?.requestSubmit();
              }}
            >
              <Plus size={14} />
              {creatingTicket ? "Se înregistrează..." : "Înregistrează tichetul"}
            </PrimaryButton>
          </>
        }
      >
        <form id="create-maintenance-form" onSubmit={handleCreateTicketSubmit} className="space-y-4 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Cameră sau zonă resort *">
              <TextInput
                required
                value={newUnitNumber}
                onChange={(e) => setNewUnitNumber(e.target.value)}
                placeholder="Ex: Camera 204 sau zona piscinei"
              />
            </Field>

            <Field label="Categorie defecțiune *">
              <Select value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
                <option value="ac">Climatizare și aer condiționat</option>
                <option value="plumbing">Instalații sanitare și apă</option>
                <option value="electrical">Electricitate și iluminat</option>
                <option value="tv_wifi">Smart TV, rețea și Wi-Fi</option>
                <option value="housekeeping">Curățenie și consumabile</option>
                <option value="other">Alte solicitări tehnice</option>
              </Select>
            </Field>
          </div>

          <Field label="Titlu incident sau defecțiune *">
            <TextInput
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Ex: Presiune scăzută la apa caldă în cabina de duș"
            />
          </Field>

          <Field label="Descriere detaliată a problemei *">
            <Textarea
              required
              rows={3}
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Descrie simptomele defecțiunii, detalii de acces sau instrucțiuni utile..."
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Prioritate incident">
              <Select value={newPriority} onChange={(e) => setNewPriority(e.target.value)}>
                <option value="urgent">Urgentă (intervenție în 30 min)</option>
                <option value="high">Ridicată (intervenție în 60 min)</option>
                <option value="normal">Normală (rezolvare în 2 ore)</option>
                <option value="low">Scăzută (pe parcursul zilei)</option>
              </Select>
            </Field>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6b7c99] ml-0.5">
                  Atribuire tehnician
                </span>
                <button
                  type="button"
                  onClick={openCreateTechnicianModal}
                  className="text-[11px] font-bold text-[#8a6420] hover:text-[#0d2c5c] cursor-pointer"
                >
                  + Tehnician nou
                </button>
              </div>
              <Select value={newAssignedTo} onChange={(e) => setNewAssignedTo(e.target.value)}>
                <option value="">Nealocat (va fi preluat ulterior)</option>
                {activeTechnicians.map((tech) => (
                  <option key={tech.id} value={tech.label}>
                    {tech.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Persoană raportoare">
              <TextInput
                value={newGuestName}
                onChange={(e) => setNewGuestName(e.target.value)}
                placeholder="Ex: Nume oaspete sau recepție"
              />
            </Field>

            <Field label="Telefon de contact (opțional)">
              <TextInput
                type="tel"
                value={newGuestPhone}
                onChange={(e) => setNewGuestPhone(e.target.value)}
                placeholder="+40 7XX XXX XXX"
              />
            </Field>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(editTicketTarget)}
        onClose={() => setEditTicketTarget(null)}
        title={`Editează tichet · #${editTicketTarget?.ticket_code || ""}`}
        subtitle={editTicketTarget ? `${editTicketTarget.unit_number} — ${editTicketTarget.title}` : undefined}
      >
        <form onSubmit={handleEditTicketSubmit} className="space-y-4 pt-1">
          <Field label="Tehnician atribuit">
            <Select value={editAssignedTo} onChange={(e) => setEditAssignedTo(e.target.value)}>
              <option value="">Nealocat (lasă tichetul liber)</option>
              {activeTechnicians.map((tech) => (
                <option key={tech.id} value={tech.label}>
                  {tech.label} — {DEPT_LABELS[tech.department] || tech.department}
                </option>
              ))}
            </Select>
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="Departament">
              <Select value={editDepartment} onChange={(e) => setEditDepartment(e.target.value)}>
                <option value="mentenanta">Mentenanță tehnică</option>
                <option value="tehnic_it">IT și rețea</option>
                <option value="housekeeping">Curățenie și menaj</option>
              </Select>
            </Field>

            <Field label="Prioritate">
              <Select value={editPriority} onChange={(e) => setEditPriority(e.target.value)}>
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </Select>
            </Field>

            <Field label="Stare">
              <Select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
                <option value="open">Deschis</option>
                <option value="in_progress">În lucru</option>
                <option value="resolved">Rezolvat</option>
              </Select>
            </Field>
          </div>

          <Field label="Notă de remediere / observații">
            <Textarea
              rows={3}
              value={editResolutionNotes}
              onChange={(e) => setEditResolutionNotes(e.target.value)}
              placeholder="Detalii intervenție sau notă tehnică..."
            />
          </Field>

          {activeTechnicians.length === 0 && (
            <p className="rounded-xl border border-[#c69a3f]/40 bg-[#fdf8ec] px-3.5 py-2.5 text-xs text-[#8a6420]">
              Nu ai tehnicieni activi în listă. Adaugă un tehnician mai jos sau din tab-ul „Echipă & Tehnicieni”.
            </p>
          )}

          <div className="flex items-center justify-between gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setEditTicketTarget(null);
                setSubView("technicians");
                openCreateTechnicianModal();
              }}
              className="text-xs font-bold text-[#8a6420] hover:text-[#0d2c5c] cursor-pointer"
            >
              + Adaugă tehnician nou
            </button>

            <div className="flex items-center gap-2">
              <GhostButton onClick={() => setEditTicketTarget(null)}>Anulează</GhostButton>
              <PrimaryButton type="submit" disabled={savingEdit}>
                {savingEdit ? "Se salvează..." : "Salvează modificările"}
              </PrimaryButton>
            </div>
          </div>
        </form>
      </Modal>

      <Modal
        open={techModalOpen}
        onClose={() => setTechModalOpen(false)}
        title={editingTech ? `Editează tehnician: ${editingTech.name}` : "Adaugă tehnician nou"}
        subtitle="Tehnicienii activi pot fi atribuiți imediat la orice tichet"
      >
        <form onSubmit={handleSaveTechnician} className="space-y-4 pt-1">
          <Field label="Nume complet *">
            <TextInput
              required
              value={techName}
              onChange={(e) => setTechName(e.target.value)}
              placeholder="Ex: Marius Ionescu"
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Specializare / Rol *">
              <TextInput
                value={techSpecialty}
                onChange={(e) => setTechSpecialty(e.target.value)}
                placeholder="Ex: Instalații & HVAC"
              />
            </Field>

            <Field label="Departament">
              <Select
                value={techDept}
                onChange={(e) =>
                  setTechDept(
                    e.target.value as "mentenanta" | "tehnic_it" | "housekeeping"
                  )
                }
              >
                <option value="mentenanta">Mentenanță tehnică</option>
                <option value="tehnic_it">IT și rețea</option>
                <option value="housekeeping">Curățenie și menaj</option>
              </Select>
            </Field>
          </div>

          <Field label="Telefon de contact">
            <TextInput
              type="tel"
              value={techPhone}
              onChange={(e) => setTechPhone(e.target.value)}
              placeholder="+40 7XX XXX XXX"
            />
          </Field>

          <label className="flex items-center gap-2.5 text-xs text-[#2a3b52] cursor-pointer">
            <input
              type="checkbox"
              checked={techActive}
              onChange={(e) => setTechActive(e.target.checked)}
              className="h-4 w-4 rounded border-[#cbd5e1] accent-[#0d2c5c]"
            />
            <span>Tehnician activ (disponibil pentru atribuire)</span>
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <GhostButton onClick={() => setTechModalOpen(false)}>Anulează</GhostButton>
            <PrimaryButton type="submit" disabled={savingTech}>
              {savingTech ? "Se salvează..." : "Salvează tehnician"}
            </PrimaryButton>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(resolvingTicket)}
        onClose={() => setResolvingTicket(null)}
        title={`Finalizează tichet #${resolvingTicket?.ticket_code || ""}`}
        subtitle="Introdu nota tehnică de remediere pentru arhiva de mentenanță"
      >
        <form onSubmit={handleResolveSubmit} className="space-y-4 pt-1">
          <Field label="Notă tehnică de remediere *">
            <Textarea
              required
              rows={4}
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              placeholder="Ex: Înlocuit garnitură și baterie duș, verificat presiune cald/rece. Testat OK."
            />
          </Field>
          <div className="flex justify-end gap-2">
            <GhostButton onClick={() => setResolvingTicket(null)}>Anulează</GhostButton>
            <PrimaryButton type="submit" disabled={submittingNote}>
              <Check size={14} />
              {submittingNote ? "Se salvează..." : "Marchează rezolvat"}
            </PrimaryButton>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(deleteTicketTarget)}
        onClose={() => setDeleteTicketTarget(null)}
        title="Confirmare ștergere tichet"
      >
        <div className="space-y-4 pt-1">
          <p className="text-sm text-[#2a3b52]">
            Sigur dorești să ștergi tichetul{" "}
            <code className="rounded bg-[#eef2f7] px-2 py-0.5 font-mono font-bold text-[#0d2c5c]">
              #{deleteTicketTarget?.ticket_code}
            </code>{" "}
            ({deleteTicketTarget?.title})?
          </p>
          <div className="flex justify-end gap-2">
            <GhostButton onClick={() => setDeleteTicketTarget(null)}>Renunță</GhostButton>
            <button
              type="button"
              disabled={deletingTicket}
              onClick={() => void confirmDeleteTicket()}
              className="rounded-full bg-rose-700 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white hover:bg-rose-800 disabled:opacity-50 cursor-pointer"
            >
              {deletingTicket ? "Se șterge..." : "Șterge definitiv"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        open={Boolean(deleteTechTarget)}
        onClose={() => setDeleteTechTarget(null)}
        title="Confirmare eliminare tehnician"
      >
        <div className="space-y-4 pt-1">
          <p className="text-sm text-[#2a3b52]">
            Sigur dorești să elimini tehnicianul{" "}
            <strong className="text-[#0d2c5c]">{deleteTechTarget?.name}</strong> din lista echipei?
          </p>
          <div className="flex justify-end gap-2">
            <GhostButton onClick={() => setDeleteTechTarget(null)}>Renunță</GhostButton>
            <button
              type="button"
              disabled={deletingTech}
              onClick={() => void confirmDeleteTechnician()}
              className="rounded-full bg-rose-700 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white hover:bg-rose-800 disabled:opacity-50 cursor-pointer"
            >
              {deletingTech ? "Se elimină..." : "Elimină"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
