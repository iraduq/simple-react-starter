import React, { useEffect, useState } from "react";
import {
  Wrench,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  User,
  Phone,
  Droplets,
  Wind,
  Lightbulb,
  Tv,
  Sparkles,
  Search,
  Filter,
  Check,
  Plus,
  Trash2,
} from "lucide-react";
import { apiFetch } from "../../lib/api";
import { useToast } from "../Toast";

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

export default function MaintenanceTab() {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [stats, setStats] = useState<MaintenanceStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  // Assign staff modal/dialog state
  const [resolvingId, setResolvingId] = useState<number | null>(null);
  const [resolutionNote, setResolutionNote] = useState("");
  const [submittingNote, setSubmittingNote] = useState(false);

  // Admin create ticket modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newUnitNumber, setNewUnitNumber] = useState("");
  const [newCategory, setNewCategory] = useState("ac");
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPriority, setNewPriority] = useState("normal");
  const [newGuestName, setNewGuestName] = useState("Recepție / Administrație Casa Esy");
  const [newGuestPhone, setNewGuestPhone] = useState("");
  const [newAssignedTo, setNewAssignedTo] = useState("Echipa Tehnică de Gardă");
  const [creatingTicket, setCreatingTicket] = useState(false);

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
      await loadData();
    } catch (err: any) {
      toast(err?.message || "Eroare la crearea tichetului.", "error");
    } finally {
      setCreatingTicket(false);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [tData, sData] = await Promise.all([
        apiFetch<TicketData[]>("/admin/maintenance/tickets"),
        apiFetch<MaintenanceStats>("/admin/maintenance/stats"),
      ]);
      setTickets(Array.isArray(tData) ? tData : []);
      setStats(sData);
    } catch (err: any) {
      toast(err?.message || "Eroare la încărcarea tichetelor.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (
    id: number,
    newStatus: string,
    assigned?: string,
    notes?: string
  ) => {
    try {
      const res = await apiFetch<TicketData>(`/admin/maintenance/tickets/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: newStatus,
          assigned_to: assigned,
          resolution_notes: notes,
        }),
      });

      setTickets((prev) => prev.map((t) => (t.id === id ? res : t)));
      toast(`Tichetul #${res.ticket_code} a fost actualizat la «${newStatus}».`, "success");
      const updatedStats = await apiFetch<MaintenanceStats>("/admin/maintenance/stats");
      setStats(updatedStats);
    } catch (err: any) {
      toast(err?.message || "Eroare la actualizarea tichetului.", "error");
    }
  };

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingId) return;
    setSubmittingNote(true);
    try {
      await handleUpdateStatus(resolvingId, "resolved", undefined, resolutionNote);
      setResolvingId(null);
      setResolutionNote("");
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Sigur doriți să ștergeți acest tichet?")) return;
    try {
      await apiFetch(`/admin/maintenance/tickets/${id}`, { method: "DELETE" });
      setTickets((prev) => prev.filter((t) => t.id !== id));
      toast("Tichetul a fost șters.", "success");
    } catch (err: any) {
      toast(err?.message || "Eroare la ștergerea tichetului.", "error");
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (deptFilter !== "all" && t.department !== deptFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        t.ticket_code.toLowerCase().includes(q) ||
        t.unit_number.toLowerCase().includes(q) ||
        t.guest_name.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case "urgent":
        return "bg-red-50 text-red-800 border-red-200";
      case "high":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "normal":
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case "resolved":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "in_progress":
        return "bg-sky-50 text-sky-800 border-sky-200";
      case "open":
      default:
        return "bg-amber-50 text-amber-800 border-amber-200";
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

  return (
    <div className="space-y-8 font-sans">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#0d2c5c]/10">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] uppercase text-[#c69a3f] mb-1">
            <Wrench size={14} className="text-[#c69a3f]" />
            <span>Operațiuni Hoteliere & SLA Mentenanță</span>
          </div>
          <h2 className="font-['Outfit',sans-serif] text-[28px] sm:text-[34px] font-bold text-[#0d2c5c] leading-tight">
            Mentenanță & Incident Management
          </h2>
          <p className="text-[13.5px] text-[#64748b] mt-0.5 max-w-2xl font-['Plus_Jakarta_Sans',sans-serif]">
            Urmărirea în timp real a defecțiunilor semnalate de turiști, atribuirea către echipe tehnice și contorizarea timpului de remediere conform SLA.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2.5 rounded-[14px] bg-[#0d2c5c] hover:bg-[#07203f] text-white text-[13px] font-['Plus_Jakarta_Sans',sans-serif] font-bold flex items-center gap-2 shadow-[0_4px_16px_rgba(13,44,92,0.18)] transition active:scale-[0.99]"
          >
            <Plus size={16} className="text-[#c69a3f]" />
            <span>Tichet Nou Mentenanță</span>
          </button>
          <button
            onClick={loadData}
            disabled={loading}
            className="w-10 h-10 rounded-full border border-[#0d2c5c]/15 hover:border-[#0d2c5c] flex items-center justify-center text-[#0d2c5c] hover:bg-[#0d2c5c]/5 transition"
            title="Reîmprospătează tichetele"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* ── METRICI SLA & INDICATORI ── */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-[22px] bg-white border border-[#e1e8f0] shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-[14px] bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <AlertTriangle size={22} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">
                Tichete Active
              </p>
              <p className="font-['Outfit',sans-serif] text-[26px] font-bold text-[#0d2c5c] leading-none mt-1">
                {stats.open_tickets + stats.in_progress_tickets}
              </p>
              <p className="text-[11px] text-amber-700 font-semibold mt-1">
                {stats.urgent_tickets} urgente de rezolvat
              </p>
            </div>
          </div>

          <div className="p-5 rounded-[22px] bg-white border border-[#e1e8f0] shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-[14px] bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">
                Rezolvate cu Succes
              </p>
              <p className="font-['Outfit',sans-serif] text-[26px] font-bold text-emerald-700 leading-none mt-1">
                {stats.resolved_tickets}
              </p>
              <p className="text-[11px] text-[#64748b] mt-1">
                Din {stats.total_tickets} tichete totale
              </p>
            </div>
          </div>

          <div className="p-5 rounded-[22px] bg-white border border-[#e1e8f0] shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-[14px] bg-[#0d2c5c]/10 text-[#0d2c5c] flex items-center justify-center shrink-0">
              <Clock size={22} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">
                Timp Mediu Remediere
              </p>
              <p className="font-['Outfit',sans-serif] text-[26px] font-bold text-[#0d2c5c] leading-none mt-1">
                {stats.avg_resolution_minutes} min
              </p>
              <p className="text-[11px] text-[#0d2c5c] font-semibold mt-1">
                Target SLA &lt; 60 min
              </p>
            </div>
          </div>

          <div className="p-5 rounded-[22px] bg-white border border-[#e1e8f0] shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-[14px] bg-amber-50 text-[#c69a3f] flex items-center justify-center shrink-0">
              <Sparkles size={22} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">
                Conformitate SLA
              </p>
              <p className="font-['Outfit',sans-serif] text-[26px] font-bold text-[#c69a3f] leading-none mt-1">
                {stats.sla_compliance_percent}%
              </p>
              <p className="text-[11px] text-[#c69a3f] font-semibold mt-1">
                Standard hotel 5 stele
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── FILTRE & CĂUTARE ── */}
      <div className="bg-white p-4 rounded-[20px] border border-[#e1e8f0] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748b] mr-1 flex items-center gap-1">
            <Filter size={13} /> Status:
          </span>
          {[
            { key: "all", label: "Toate" },
            { key: "open", label: "Deschise" },
            { key: "in_progress", label: "În Lucru" },
            { key: "resolved", label: "Rezolvate" },
          ].map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setStatusFilter(f.key)}
              className={`px-3 py-1.5 rounded-[10px] text-[12px] font-bold transition ${
                statusFilter === f.key
                  ? "bg-[#0d2c5c] text-white shadow-xs"
                  : "bg-slate-100 text-[#64748b] hover:bg-slate-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Caută cameră, oaspete, tichet..."
              className="pl-8 pr-3 py-1.5 rounded-[10px] border border-[#e1e8f0] text-[12.5px] text-[#0d2c5c] focus:border-[#c69a3f] outline-none w-56 font-['Plus_Jakarta_Sans',sans-serif]"
            />
          </div>
        </div>
      </div>

      {/* ── TABEL TICHETE MENTENANȚĂ ── */}
      <div className="bg-white rounded-[24px] border border-[#e1e8f0] p-6 shadow-[0_10px_35px_rgba(13,44,92,0.06)]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-['Outfit',sans-serif] text-[18px] font-bold text-[#0d2c5c]">
            Listă Tichete Incident ({filteredTickets.length})
          </h3>
        </div>

        {filteredTickets.length === 0 ? (
          <div className="py-12 text-center text-[#64748b]">
            <CheckCircle2 size={36} className="mx-auto text-emerald-400 mb-3" />
            <p className="font-semibold text-[14px]">Niciun incident înregistrat pentru filtrele selectate.</p>
            <p className="text-[12px] mt-0.5">Toate solicitările din camere sunt rezolvate la zi.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#e1e8f0] text-[11px] font-bold uppercase tracking-wider text-[#64748b]">
                  <th className="py-3 px-3">Tichet & Dată</th>
                  <th className="py-3 px-3">Cameră & Oaspete</th>
                  <th className="py-3 px-3">Defecțiune</th>
                  <th className="py-3 px-3">Departament / Tehnician</th>
                  <th className="py-3 px-3">Prioritate & SLA</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Acțiuni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e1e8f0] text-[13px]">
                {filteredTickets.map((t) => {
                  const Icon = getCategoryIcon(t.category);
                  return (
                    <tr key={t.id} className="hover:bg-[#f8fafc] transition-colors">
                      <td className="py-3.5 px-3">
                        <span className="font-mono font-bold text-[12px] text-[#0d2c5c]">
                          #{t.ticket_code}
                        </span>
                        <p className="text-[11px] text-[#64748b] mt-0.5">
                          {t.created_at
                            ? new Date(t.created_at).toLocaleTimeString("ro-RO", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "—"}
                        </p>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="font-bold text-[#0d2c5c]">
                          {t.unit_number}
                        </span>
                        <p className="text-[11.5px] text-[#64748b] mt-0.5">
                          {t.guest_name}
                        </p>
                      </td>

                      <td className="py-3.5 px-3 max-w-xs">
                        <div className="flex items-center gap-1.5 font-bold text-[#0d2c5c] text-[13px]">
                          <Icon size={14} className="text-[#c69a3f] shrink-0" />
                          <span className="truncate">{t.title}</span>
                        </div>
                        <p className="text-[11.5px] text-[#64748b] line-clamp-2 mt-0.5">
                          {t.description}
                        </p>
                        {t.resolution_notes && (
                          <p className="text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded mt-1 font-semibold">
                            ✓ {t.resolution_notes}
                          </p>
                        )}
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="text-[12px] font-bold text-[#0d2c5c] block">
                          {t.department === "mentenanta"
                            ? "Mentenanță Tehnică"
                            : t.department === "housekeeping"
                              ? "Housekeeping"
                              : "IT & Rețea"}
                        </span>
                        <span className="text-[11.5px] text-[#64748b]">
                          {t.assigned_to || (
                            <span className="text-amber-700 italic">Nealocat</span>
                          )}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold border uppercase tracking-wider ${getPriorityBadge(
                              t.priority
                            )}`}
                          >
                            {t.priority}
                          </span>
                          {t.is_overdue && (
                            <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-800 text-[10px] font-bold">
                              SLA Depășit
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-[#64748b] mt-1 block">
                          Target SLA: {t.sla_minutes} min (trecut: {t.elapsed_minutes} min)
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wider ${getStatusBadge(
                            t.status
                          )}`}
                        >
                          {t.status === "resolved"
                            ? "Rezolvat ✓"
                            : t.status === "in_progress"
                              ? "În Lucru"
                              : "Deschis"}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {t.status === "open" && (
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateStatus(
                                  t.id,
                                  "in_progress",
                                  "Echipa Tehnică de Gardă"
                                )
                              }
                              className="px-2.5 py-1 rounded-[8px] bg-[#0d2c5c]/10 hover:bg-[#0d2c5c]/20 text-[#0d2c5c] text-[11.5px] font-bold transition"
                            >
                              Preia în Lucru
                            </button>
                          )}

                          {t.status !== "resolved" && (
                            <button
                              type="button"
                              onClick={() => {
                                setResolvingId(t.id);
                                setResolutionNote("");
                              }}
                              className="px-2.5 py-1 rounded-[8px] bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11.5px] font-bold transition"
                            >
                              Rezolvă
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDelete(t.id)}
                            className="p-1 rounded text-red-500 hover:bg-red-50 transition"
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
        )}
      </div>

      {/* ── MODAL CREARE TICHET MENTENANȚĂ (ADMIN) ── */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] max-w-lg w-full p-6 sm:p-7 border border-[#e1e8f0] shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#e1e8f0]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-[12px] bg-amber-50 text-[#c69a3f] border border-[#c69a3f]/30 flex items-center justify-center">
                  <Wrench size={18} />
                </div>
                <div>
                  <h4 className="font-['Outfit',sans-serif] text-[18px] font-bold text-[#0d2c5c]">
                    Tichet Nou de Mentenanță
                  </h4>
                  <p className="text-[11.5px] text-[#64748b] font-['Plus_Jakarta_Sans',sans-serif]">
                    Înregistrare incident tehnic direct din panoul de administrare
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTicketSubmit} className="space-y-4 font-['Plus_Jakarta_Sans',sans-serif]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#64748b] mb-1">
                    Cameră / Locație Resort *
                  </label>
                  <input
                    type="text"
                    required
                    value={newUnitNumber}
                    onChange={(e) => setNewUnitNumber(e.target.value)}
                    placeholder="Ex: Camera 204 sau Piscină"
                    className="w-full px-3.5 py-2.5 rounded-[12px] border border-[#e1e8f0] focus:border-[#c69a3f] text-[13px] text-[#0d2c5c] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#64748b] mb-1">
                    Categorie Defecțiune *
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-[12px] border border-[#e1e8f0] focus:border-[#c69a3f] text-[13px] text-[#0d2c5c] outline-none bg-white"
                  >
                    <option value="ac">❄️ Climatizare / Aer Condiționat</option>
                    <option value="plumbing">🚰 Instalații Sanitare & Apă</option>
                    <option value="electrical">💡 Electricitate & Iluminat</option>
                    <option value="tv_wifi">📶 Smart TV, Rețea & Wi-Fi</option>
                    <option value="housekeeping">✨ Housekeeping / Consumabile</option>
                    <option value="other">🔧 Alte Solicitări Tehnice</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#64748b] mb-1">
                  Titlu Incident / Defecțiune *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Presiune slabă apă caldă la cabina de duș"
                  className="w-full px-3.5 py-2.5 rounded-[12px] border border-[#e1e8f0] focus:border-[#c69a3f] text-[13px] text-[#0d2c5c] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#64748b] mb-1">
                  Descriere Detaliată a Problemei *
                </label>
                <textarea
                  required
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Descrieți simptomele defecțiunii, instrucțiuni de acces sau orice detalii relevante pentru echipă..."
                  className="w-full px-3.5 py-2.5 rounded-[12px] border border-[#e1e8f0] focus:border-[#c69a3f] text-[13px] text-[#0d2c5c] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#64748b] mb-1">
                    Prioritate Incident
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-[12px] border border-[#e1e8f0] focus:border-[#c69a3f] text-[13px] text-[#0d2c5c] outline-none bg-white"
                  >
                    <option value="urgent">🚨 Urgentă (SLA 30 min)</option>
                    <option value="high">⚠️ Ridicată (SLA 60 min)</option>
                    <option value="normal">⏱️ Normală (SLA 120 min)</option>
                    <option value="low">☕ Scăzută (SLA 240 min)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#64748b] mb-1">
                    Atribuire Tehnician
                  </label>
                  <select
                    value={newAssignedTo}
                    onChange={(e) => setNewAssignedTo(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-[12px] border border-[#e1e8f0] focus:border-[#c69a3f] text-[13px] text-[#0d2c5c] outline-none bg-white"
                  >
                    <option value="Echipa Tehnică de Gardă">Echipa Tehnică de Gardă</option>
                    <option value="Ion Popescu (Instalații)">Ion Popescu (Instalații)</option>
                    <option value="Adrian Nistor (Electrician)">Adrian Nistor (Electrician)</option>
                    <option value="Vlad Enache (IT & Rețea)">Vlad Enache (IT & Rețea)</option>
                    <option value="Housekeeping Șef Tură">Housekeeping Șef Tură</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#64748b] mb-1">
                    Raportor / Oaspete
                  </label>
                  <input
                    type="text"
                    value={newGuestName}
                    onChange={(e) => setNewGuestName(e.target.value)}
                    placeholder="Nume oaspete sau Recepție"
                    className="w-full px-3.5 py-2.5 rounded-[12px] border border-[#e1e8f0] focus:border-[#c69a3f] text-[13px] text-[#0d2c5c] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#64748b] mb-1">
                    Telefon Contact (opțional)
                  </label>
                  <input
                    type="tel"
                    value={newGuestPhone}
                    onChange={(e) => setNewGuestPhone(e.target.value)}
                    placeholder="+40 7XX XXX XXX"
                    className="w-full px-3.5 py-2.5 rounded-[12px] border border-[#e1e8f0] focus:border-[#c69a3f] text-[13px] text-[#0d2c5c] outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#e1e8f0]">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-[12px] border border-[#e1e8f0] text-[#64748b] hover:bg-slate-50 text-[12.5px] font-bold transition"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  disabled={creatingTicket}
                  className="px-5 py-2.5 rounded-[12px] bg-[#0d2c5c] hover:bg-[#07203f] text-white text-[13px] font-bold flex items-center gap-2 shadow-sm transition active:scale-[0.99] disabled:opacity-50"
                >
                  <Plus size={15} className="text-[#c69a3f]" />
                  <span>{creatingTicket ? "Se înregistrează..." : "Înregistrează Tichetul"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL REZOLVARE TICHET CU NOTĂ TEHNICĂ ── */}
      {resolvingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] max-w-md w-full p-6 border border-[#e1e8f0] shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-['Outfit',sans-serif] text-[18px] font-bold text-[#0d2c5c]">
                Finalizează Tichet de Mentenanță
              </h4>
              <button
                onClick={() => setResolvingId(null)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleResolveSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#64748b] mb-1">
                  Notă Tehnică Remediere:
                </label>
                <textarea
                  required
                  rows={3}
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="Ex: Înlocuit garnitură și baterie duș, verificat presiune cald/rece. Testat OK."
                  className="w-full px-3 py-2 rounded-[12px] border border-[#e1e8f0] text-[13px] text-[#0d2c5c] outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResolvingId(null)}
                  className="px-4 py-2 rounded-[10px] border border-[#e1e8f0] text-[#64748b] text-[12px] font-bold"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  disabled={submittingNote}
                  className="px-5 py-2 rounded-[10px] bg-emerald-600 hover:bg-emerald-700 text-white text-[12.5px] font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Check size={14} />
                  <span>{submittingNote ? "Se salvează..." : "Marchează Rezolvat"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
