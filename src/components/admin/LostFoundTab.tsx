import React, { useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PackageSearch,
  PackageCheck,
  Truck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Archive,
  Tag,
  Plus,
  Search,
  Filter,
  Camera,
  Printer,
  MoreVertical,
  ExternalLink,
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Sparkles,
  Trash2,
  Eye,
} from "lucide-react";
import {
  Card,
  SectionHeader,
  Button,
  Badge,
  Modal,
  Field,
  SearchBox,
  TableSkeleton,
  EmptyState,
  inputCls,
} from "./ui";
import { get, post, patch, del, list, errMsg, API_URL } from "../../lib/admin";
import { useToast } from "../Toast";
import { useAdminLiveSync, LiveSyncBadge } from "../../context/AdminLiveSyncContext";

export type LostFoundCategory =
  | "electronice"
  | "bijuterii"
  | "haine"
  | "acte_bani"
  | "altele";

export type LostFoundStatus =
  | "in_custody"
  | "claimed"
  | "shipped_courier"
  | "disposed";

export interface LostFoundItem {
  id: string;
  item_name: string;
  category: LostFoundCategory;
  room_unit_number: string;
  description?: string | null;
  found_date: string;
  found_by_name: string;
  photo_url?: string | null;
  status: LostFoundStatus;
  guest_name?: string | null;
  guest_phone?: string | null;
  guest_email?: string | null;
  booking_id?: string | null;
  storage_location: string;
  courier_company?: string | null;
  courier_tracking_number?: string | null;
  delivery_address?: string | null;
  claimed_date?: string | null;
  claimed_by_name?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

interface Stats {
  total: number;
  in_custody: number;
  claimed: number;
  shipped: number;
  disposed: number;
  over_30_days: number;
}

const CATEGORY_LABELS: Record<LostFoundCategory, { label: string; icon: string }> = {
  electronice: { label: "Electronice & Gadgeturi", icon: "📱" },
  bijuterii: { label: "Bijuterii & Valori", icon: "💍" },
  haine: { label: "Îmbrăcăminte & Accesorii", icon: "🧥" },
  acte_bani: { label: "Documente & Portofele", icon: "👛" },
  altele: { label: "Alte Obiecte", icon: "📦" },
};

const COURIER_COMPANIES = ["Fan Courier", "Sameday", "DPD", "Cargus", "DHL"];

export default function LostFoundTab() {
  const { toast } = useToast();

  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    in_custody: 0,
    claimed: 0,
    shipped: 0,
    disposed: 0,
    over_30_days: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [shipModalItem, setShipModalItem] = useState<LostFoundItem | null>(null);
  const [claimModalItem, setClaimModalItem] = useState<LostFoundItem | null>(null);
  const [labelModalItem, setLabelModalItem] = useState<LostFoundItem | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Create Form State
  const [form, setForm] = useState({
    item_name: "",
    category: "altele" as LostFoundCategory,
    room_unit_number: "",
    description: "",
    found_by_name: "Personal Housekeeping",
    storage_location: "Seif Recepție",
    photo_url: "",
    guest_name: "",
    guest_phone: "",
    guest_email: "",
    notes: "",
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Smart Guest Suggestion
  const [suggestedGuest, setSuggestedGuest] = useState<{
    found: boolean;
    guest_name?: string;
    guest_email?: string;
    guest_phone?: string;
    booking_code?: string;
  } | null>(null);
  const [loadingGuest, setLoadingGuest] = useState(false);

  // Shipping Form State
  const [shipForm, setShipForm] = useState({
    courier_company: "Fan Courier",
    courier_tracking_number: "",
    delivery_address: "",
  });

  // Claim Form State
  const [claimantName, setClaimantName] = useState("");

  // Data loading
  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [itemsRes, statsRes] = await Promise.all([
        get<LostFoundItem[]>("/lost-found"),
        get<Stats>("/lost-found/stats"),
      ]);
      setItems(itemsRes || []);
      setStats(statsRes || {
        total: 0,
        in_custody: 0,
        claimed: 0,
        shipped: 0,
        disposed: 0,
        over_30_days: 0,
      });
    } catch (err) {
      if (!silent) toast(errMsg(err), "error");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [toast]);

  // Live WebSocket sync
  const { isSyncing, connectionStatus } = useAdminLiveSync({
    topic: "all",
    onSync: () => loadData(true),
  });

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Auto-detect guest when unit number changes
  const checkGuestForUnit = async (unitNum: string) => {
    const trimmed = unitNum.trim();
    if (!trimmed) {
      setSuggestedGuest(null);
      return;
    }
    setLoadingGuest(true);
    try {
      const res = await get<{
        found: boolean;
        guest_name?: string;
        guest_email?: string;
        guest_phone?: string;
        booking_code?: string;
      }>(`/lost-found/suggest-guest?unit_number=${encodeURIComponent(trimmed)}`);
      if (res && res.found) {
        setSuggestedGuest(res);
      } else {
        setSuggestedGuest(null);
      }
    } catch {
      setSuggestedGuest(null);
    } finally {
      setLoadingGuest(false);
    }
  };

  const applySuggestedGuest = () => {
    if (!suggestedGuest) return;
    setForm((prev) => ({
      ...prev,
      guest_name: suggestedGuest.guest_name || prev.guest_name,
      guest_email: suggestedGuest.guest_email || prev.guest_email,
      guest_phone: suggestedGuest.guest_phone || prev.guest_phone,
    }));
    toast("Datele oaspetelui au fost asociate cu succes!", "success");
  };

  // Upload Photo
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const apiBase = API_URL.replace(/\/$/, "");
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${apiBase}/lost-found/upload-photo`, {
        method: "POST",
        credentials: "include",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Upload-ul imaginii a eșuat");
      const data = await res.json();
      setForm((prev) => ({ ...prev, photo_url: `${apiBase}${data.photo_url}` }));
      toast("Fotografia a fost optimizată și încărcată.", "success");
    } catch (err) {
      toast(errMsg(err), "error");
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Create Item Submission
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.item_name.trim() || !form.room_unit_number.trim()) {
      toast("Numele obiectului și numărul camerei sunt obligatorii.", "error");
      return;
    }

    setSubmitting(true);
    try {
      await post("/lost-found", form);
      toast(`Obiectul '${form.item_name}' a fost înregistrat în registru.`, "success");
      setCreateModalOpen(false);
      setForm({
        item_name: "",
        category: "altele",
        room_unit_number: "",
        description: "",
        found_by_name: "Personal Housekeeping",
        storage_location: "Seif Recepție",
        photo_url: "",
        guest_name: "",
        guest_phone: "",
        guest_email: "",
        notes: "",
      });
      setSuggestedGuest(null);
      await loadData();
    } catch (err) {
      toast(errMsg(err), "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Ship Item
  const handleShipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shipModalItem) return;
    if (!shipForm.courier_tracking_number.trim()) {
      toast("Numărul AWB este obligatoriu.", "error");
      return;
    }

    try {
      await patch(`/lost-found/${shipModalItem.id}`, {
        status: "shipped_courier",
        courier_company: shipForm.courier_company,
        courier_tracking_number: shipForm.courier_tracking_number.trim(),
        delivery_address: shipForm.delivery_address.trim(),
      });
      toast(`Obiectul a fost marcat ca expediat cu AWB: ${shipForm.courier_tracking_number}`, "success");
      setShipModalItem(null);
      await loadData();
    } catch (err) {
      toast(errMsg(err), "error");
    }
  };

  // Claim Item
  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimModalItem) return;

    try {
      await patch(`/lost-found/${claimModalItem.id}`, {
        status: "claimed",
        claimed_by_name: claimantName.trim() || claimModalItem.guest_name || "Oaspete titular",
      });
      toast("Obiectul a fost marcat ca revendicat și predat.", "success");
      setClaimModalItem(null);
      setClaimantName("");
      await loadData();
    } catch (err) {
      toast(errMsg(err), "error");
    }
  };

  // Mark Disposed
  const handleMarkDisposed = async (item: LostFoundItem) => {
    if (!window.confirm(`Ești sigur că vrei să casezi/donezi obiectul '${item.item_name}' (păstrat peste perioada legală)?`)) {
      return;
    }
    try {
      await patch(`/lost-found/${item.id}`, { status: "disposed" });
      toast("Obiectul a fost marcat ca donat / casat conform legii.", "success");
      await loadData();
    } catch (err) {
      toast(errMsg(err), "error");
    }
  };

  // Delete Item
  const handleDeleteItem = async (item: LostFoundItem) => {
    if (!window.confirm(`Ștergi definitiv înregistrarea pentru '${item.item_name}'?`)) return;
    try {
      await del(`/lost-found/${item.id}`);
      toast("Înregistrare ștearsă din registru.", "success");
      await loadData();
    } catch (err) {
      toast(errMsg(err), "error");
    }
  };

  // Filtered Items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchQuery =
        !query.trim() ||
        item.item_name.toLowerCase().includes(query.toLowerCase()) ||
        item.room_unit_number.toLowerCase().includes(query.toLowerCase()) ||
        (item.guest_name && item.guest_name.toLowerCase().includes(query.toLowerCase())) ||
        (item.courier_tracking_number && item.courier_tracking_number.toLowerCase().includes(query.toLowerCase()));

      const matchStatus = statusFilter === "all" || item.status === statusFilter;
      const matchCategory = categoryFilter === "all" || item.category === categoryFilter;

      return matchQuery && matchStatus && matchCategory;
    });
  }, [items, query, statusFilter, categoryFilter]);

  const statusBadge = (item: LostFoundItem) => {
    switch (item.status) {
      case "in_custody":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            În custodie
          </span>
        );
      case "claimed":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
            <CheckCircle2 size={12} className="text-emerald-600" />
            Revendicat
          </span>
        );
      case "shipped_courier":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-300 bg-sky-50 px-2.5 py-0.5 text-[11px] font-semibold text-sky-800">
            <Truck size={12} className="text-sky-600" />
            Trimis curier
          </span>
        );
      case "disposed":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-slate-50 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
            <Archive size={12} />
            Casat / Donat
          </span>
        );
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* ── HEADER ── */}
      <SectionHeader
        eyebrow="Curățenie și recepție"
        title="Obiecte pierdute și găsite"
        description="Evidența obiectelor uitate de oaspeți în camere: tichete rapide de la cameriste, predare la recepție și expediere prin curier cu AWB."
        action={
          <div className="flex items-center gap-3">
            <LiveSyncBadge isSyncing={isSyncing} status={connectionStatus} />
            <button
              onClick={() => {
                setForm({
                  item_name: "",
                  category: "altele",
                  room_unit_number: "",
                  description: "",
                  found_by_name: "Personal Housekeeping",
                  storage_location: "Seif Recepție",
                  photo_url: "",
                  guest_name: "",
                  guest_phone: "",
                  guest_email: "",
                  notes: "",
                });
                setSuggestedGuest(null);
                setCreateModalOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-full bg-[#0d2c5c] px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white shadow-md transition-all hover:bg-[#07203f] cursor-pointer"
            >
              <Plus size={14} /> Adaugă Obiect Găsit
            </button>
          </div>
        }
      />

      {/* ── TOP KPI CARDS ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <Card className="p-4 sm:p-5 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between text-[#6b7c99]">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em]">
              În Custodie Activă
            </span>
            <Archive size={16} className="text-amber-500" />
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-bold font-sans tracking-tight text-[#0d2c5c]">
            {stats.in_custody}
          </p>
          <span className="text-[11px] text-[#6b7c99]">Păstrate în seif / dulap</span>
        </Card>

        <Card className="p-4 sm:p-5 border-l-4 border-l-sky-500">
          <div className="flex items-center justify-between text-[#6b7c99]">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em]">
              Expediate Curier
            </span>
            <Truck size={16} className="text-sky-500" />
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-bold font-sans tracking-tight text-[#0d2c5c]">
            {stats.shipped}
          </p>
          <span className="text-[11px] text-[#6b7c99]">Trimise cu număr AWB</span>
        </Card>

        <Card className="p-4 sm:p-5 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between text-[#6b7c99]">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em]">
              Revendicate
            </span>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-bold font-sans tracking-tight text-[#0d2c5c]">
            {stats.claimed}
          </p>
          <span className="text-[11px] text-[#6b7c99]">Predate personal oaspeților</span>
        </Card>

        <Card className={`p-4 sm:p-5 border-l-4 ${stats.over_30_days > 0 ? "border-l-red-500 bg-red-50/20" : "border-l-slate-400"}`}>
          <div className="flex items-center justify-between text-[#6b7c99]">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em]">
              Peste 30 Zile (Legal)
            </span>
            <AlertTriangle size={16} className={stats.over_30_days > 0 ? "text-red-500" : "text-slate-400"} />
          </div>
          <p className={`mt-2 text-2xl sm:text-3xl font-bold font-sans tracking-tight ${stats.over_30_days > 0 ? "text-red-600" : "text-[#0d2c5c]"}`}>
            {stats.over_30_days}
          </p>
          <span className="text-[11px] text-[#6b7c99]">Eligibile pentru donare / casare</span>
        </Card>
      </div>

      {/* ── FILTERS & SEARCH ── */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#e1e8f0] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:max-w-xs">
          <SearchBox
            value={query}
            onChange={setQuery}
            placeholder="Caută obiect, cameră, oaspete, AWB…"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-[#e1e8f0] bg-[#f8fafd] px-3 py-2 text-xs font-semibold text-[#0d2c5c] outline-none focus:border-[#c69a3f]"
          >
            <option value="all">Toate statusurile</option>
            <option value="in_custody">În custodie</option>
            <option value="claimed">Revendicate</option>
            <option value="shipped_courier">Expediate curier</option>
            <option value="disposed">Casate / Donate</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-[#e1e8f0] bg-[#f8fafd] px-3 py-2 text-xs font-semibold text-[#0d2c5c] outline-none focus:border-[#c69a3f]"
          >
            <option value="all">Toate categoriile</option>
            <option value="electronice">📱 Electronice</option>
            <option value="bijuterii">💍 Bijuterii & Valori</option>
            <option value="haine">🧥 Îmbrăcăminte</option>
            <option value="acte_bani">👛 Documente & Bani</option>
            <option value="altele">📦 Altele</option>
          </select>
        </div>
      </div>

      {/* ── ITEMS LIST TABLE / CARDS ── */}
      {loading ? (
        <Card className="p-6 bg-white">
          <TableSkeleton rows={5} />
        </Card>
      ) : filteredItems.length === 0 ? (
        <Card className="p-10 bg-white">
          <EmptyState
            title="Niciun obiect găsit"
            hint={
              query || statusFilter !== "all"
                ? "Niciun obiect nu corespunde filtrelor selectate."
                : "Registrul este gol. Folosește butonul de sus pentru a înregistra un obiect uitat."
            }
          />
        </Card>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#e1e8f0] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[#e1e8f0] bg-[#f8fafd] text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#6b7c99]">
                  <th className="py-3.5 pl-6 pr-3">Obiect & Foto</th>
                  <th className="px-3 py-3.5">Cameră / Dată</th>
                  <th className="px-3 py-3.5">Locație Seif</th>
                  <th className="px-3 py-3.5">Oaspete Asociat</th>
                  <th className="px-3 py-3.5">Status</th>
                  <th className="py-3.5 pl-3 pr-6 text-right">Acțiuni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eef2f7]">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-[#fbfcfe] transition-colors">
                    {/* Item Details & Thumbnail */}
                    <td className="py-4 pl-6 pr-3">
                      <div className="flex items-center gap-3">
                        {item.photo_url ? (
                          <button
                            onClick={() => setPhotoPreview(item.photo_url || null)}
                            className="group relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-[#e1e8f0] bg-slate-100 cursor-pointer"
                          >
                            <img
                              src={item.photo_url}
                              alt={item.item_name}
                              className="h-full w-full object-cover transition-transform group-hover:scale-110"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Eye size={14} className="text-white" />
                            </div>
                          </button>
                        ) : (
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#e1e8f0] bg-[#f4f6f9] text-xl">
                            {CATEGORY_LABELS[item.category]?.icon || "📦"}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-[#0d2c5c] text-[13.5px]">
                            {item.item_name}
                          </p>
                          <span className="text-[11px] text-[#6b7c99]">
                            {CATEGORY_LABELS[item.category]?.label || item.category}
                          </span>
                          {item.description && (
                            <p className="mt-0.5 line-clamp-1 max-w-xs text-[11px] text-[#8595aa]">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Room & Date */}
                    <td className="px-3 py-4">
                      <span className="inline-flex items-center gap-1 rounded-lg bg-[#0d2c5c]/5 px-2 py-0.5 text-xs font-bold text-[#0d2c5c]">
                        Camera {item.room_unit_number}
                      </span>
                      <p className="mt-1 text-[11px] text-[#6b7c99]">
                        {new Date(item.found_date).toLocaleDateString("ro-RO", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                      <span className="text-[10px] text-[#8595aa]">Găsit: {item.found_by_name}</span>
                    </td>

                    {/* Storage */}
                    <td className="px-3 py-4">
                      <div className="flex items-center gap-1.5 text-[12px] text-[#2a3b52] font-medium">
                        <MapPin size={13} className="text-[#c69a3f] shrink-0" />
                        <span>{item.storage_location}</span>
                      </div>
                      {item.courier_tracking_number && (
                        <div className="mt-1.5 flex items-center gap-1 text-[11px] text-sky-700">
                          <Truck size={12} className="shrink-0" />
                          <span className="font-mono font-semibold">
                            {item.courier_company}: {item.courier_tracking_number}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Guest */}
                    <td className="px-3 py-4">
                      {item.guest_name ? (
                        <div className="space-y-0.5">
                          <p className="font-semibold text-[#0d2c5c] text-[12.5px] flex items-center gap-1">
                            <User size={12} className="text-[#6b7c99]" />
                            {item.guest_name}
                          </p>
                          {item.guest_phone && (
                            <p className="text-[11px] text-[#6b7c99] flex items-center gap-1">
                              <Phone size={11} />
                              {item.guest_phone}
                            </p>
                          )}
                          {item.guest_email && (
                            <p className="text-[11px] text-[#6b7c99] flex items-center gap-1">
                              <Mail size={11} />
                              {item.guest_email}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11.5px] text-[#94a3b8] italic">Neidentificat</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-3 py-4">
                      {statusBadge(item)}
                    </td>

                    {/* Actions Menu */}
                    <td className="py-4 pl-3 pr-6 text-right">
                      <div className="relative inline-block text-left">
                        <button
                          onClick={() => setActiveMenuId(activeMenuId === item.id ? null : item.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e1e8f0] bg-white text-[#6b7c99] hover:bg-[#f8fafd] hover:text-[#0d2c5c] transition-colors cursor-pointer"
                        >
                          <MoreVertical size={14} />
                        </button>

                        {activeMenuId === item.id && (
                          <div className="absolute right-0 z-20 mt-1 w-52 rounded-xl border border-[#e1e8f0] bg-white p-1.5 shadow-xl">
                            {item.status === "in_custody" && (
                              <>
                                <button
                                  onClick={() => {
                                    setClaimModalItem(item);
                                    setActiveMenuId(null);
                                  }}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-emerald-700 hover:bg-emerald-50 cursor-pointer"
                                >
                                  <CheckCircle2 size={13} /> Predat la Recepție
                                </button>
                                <button
                                  onClick={() => {
                                    setShipModalItem(item);
                                    setActiveMenuId(null);
                                  }}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-sky-700 hover:bg-sky-50 cursor-pointer"
                                >
                                  <Truck size={13} /> Expediază prin Curier
                                </button>
                                <button
                                  onClick={() => {
                                    void handleMarkDisposed(item);
                                    setActiveMenuId(null);
                                  }}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                                >
                                  <Archive size={13} /> Casează / Donează
                                </button>
                              </>
                            )}

                            <button
                              onClick={() => {
                                setLabelModalItem(item);
                                setActiveMenuId(null);
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-[#0d2c5c] hover:bg-[#f4f6f9] cursor-pointer"
                            >
                              <Printer size={13} /> Etichetă Cutie Depozit
                            </button>

                            <div className="my-1 border-t border-[#eef2f7]" />

                            <button
                              onClick={() => {
                                void handleDeleteItem(item);
                                setActiveMenuId(null);
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 cursor-pointer"
                            >
                              <Trash2 size={13} /> Șterge Înregistrarea
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── MODAL: ÎNREGISTRARE OBIECT GĂSIT ── */}
      {createModalOpen && (
        <Modal
          open={createModalOpen}
          title="Înregistrare Obiect Uitat în Cameră"
          onClose={() => setCreateModalOpen(false)}
        >
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <Field label="Denumire Obiect *">
              <input
                type="text"
                required
                className={inputCls}
                value={form.item_name}
                onChange={(e) => setForm({ ...form, item_name: e.target.value })}
                placeholder="Ex: Brățară argintie, Geacă bărbați Zara..."
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Număr Cameră / Unitate *">
                <input
                  type="text"
                  required
                  className={inputCls}
                  value={form.room_unit_number}
                  onChange={(e) => {
                    const val = e.target.value;
                    setForm({ ...form, room_unit_number: val });
                    void checkGuestForUnit(val);
                  }}
                  placeholder="Ex: 101, 102, 203..."
                />
              </Field>

              <Field label="Categorie Bun">
                <select
                  className={inputCls}
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as LostFoundCategory })}
                >
                  <option value="electronice">📱 Electronice & Gadgeturi</option>
                  <option value="bijuterii">💍 Bijuterii & Valori</option>
                  <option value="haine">🧥 Îmbrăcăminte & Accesorii</option>
                  <option value="acte_bani">👛 Documente & Bani</option>
                  <option value="altele">📦 Altele</option>
                </select>
              </Field>
            </div>

            {/* Smart Guest Match Alert Banner */}
            {suggestedGuest && suggestedGuest.found && (
              <div className="rounded-xl border border-[#c69a3f]/40 bg-[#fdf8ec] p-3 text-xs text-[#8a6420]">
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <Sparkles size={14} className="text-[#c69a3f]" />
                  <span>Oaspete identificat recent în această cameră:</span>
                </div>
                <p className="text-[#0d2c5c] font-semibold text-[13px]">
                  {suggestedGuest.guest_name} ({suggestedGuest.guest_phone || suggestedGuest.guest_email || "fără contact"})
                </p>
                <button
                  type="button"
                  onClick={applySuggestedGuest}
                  className="mt-2 inline-flex items-center gap-1 rounded-lg bg-[#0d2c5c] px-3 py-1 text-[11px] font-bold text-white hover:bg-[#07203f] cursor-pointer"
                >
                  Asociază automat datele oaspetelui
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Locație Depozitare Fizică">
                <input
                  type="text"
                  className={inputCls}
                  value={form.storage_location}
                  onChange={(e) => setForm({ ...form, storage_location: e.target.value })}
                  placeholder="Ex: Seif Recepție, Cutia 3..."
                />
              </Field>

              <Field label="Găsit de (Cameristă / Staff)">
                <input
                  type="text"
                  className={inputCls}
                  value={form.found_by_name}
                  onChange={(e) => setForm({ ...form, found_by_name: e.target.value })}
                  placeholder="Ex: Elena (Housekeeping)"
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label="Nume Oaspete (Opțional)">
                <input
                  type="text"
                  className={inputCls}
                  value={form.guest_name}
                  onChange={(e) => setForm({ ...form, guest_name: e.target.value })}
                  placeholder="Nume Prenume"
                />
              </Field>
              <Field label="Telefon Oaspete">
                <input
                  type="text"
                  className={inputCls}
                  value={form.guest_phone}
                  onChange={(e) => setForm({ ...form, guest_phone: e.target.value })}
                  placeholder="+40 7..."
                />
              </Field>
              <Field label="Email Oaspete">
                <input
                  type="email"
                  className={inputCls}
                  value={form.guest_email}
                  onChange={(e) => setForm({ ...form, guest_email: e.target.value })}
                  placeholder="oaspete@email.ro"
                />
              </Field>
            </div>

            <Field label="Fotografie Obiect">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 rounded-xl border border-dashed border-[#0d2c5c]/30 bg-[#f8fafd] px-4 py-2.5 text-xs font-semibold text-[#0d2c5c] hover:bg-[#eef2f7] cursor-pointer transition-colors">
                  <Camera size={15} />
                  <span>{uploadingPhoto ? "Se încarcă..." : "Încarcă Fotografie Obiect"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => void handlePhotoUpload(e)}
                    disabled={uploadingPhoto}
                  />
                </label>
                {form.photo_url && (
                  <span className="text-[11px] font-semibold text-emerald-600">
                    ✓ Fotografie atașată
                  </span>
                )}
              </div>
            </Field>

            <Field label="Descriere & Detalii suplimentare">
              <textarea
                className={`${inputCls} h-20 resize-none`}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Ex: Găsit sub pat, pe covor, lângă noptiera stângă..."
              />
            </Field>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#eef2f7]">
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="rounded-xl border border-[#e1e8f0] px-4 py-2.5 text-xs font-semibold text-[#6b7c99] hover:bg-[#f8fafd]"
              >
                Anulează
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-[#0d2c5c] px-6 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-white hover:bg-[#07203f] disabled:opacity-50 cursor-pointer shadow-md"
              >
                {submitting ? "Se salvează..." : "Salvează în Registru"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── MODAL: EXPEDIERE PRIN CURIER (AWB) ── */}
      {shipModalItem && (
        <Modal
          open={!!shipModalItem}
          title={`Expediere prin Curier: ${shipModalItem?.item_name || ""}`}
          onClose={() => setShipModalItem(null)}
        >
          <form onSubmit={handleShipSubmit} className="space-y-4">
            <div className="rounded-xl bg-[#f8fafd] border border-[#e1e8f0] p-3 text-xs text-[#2a3b52]">
              <p>
                <strong>Camera:</strong> {shipModalItem.room_unit_number} ·{" "}
                <strong>Oaspete:</strong> {shipModalItem.guest_name || "Nespecificat"}
              </p>
            </div>

            <Field label="Companie Curierat *">
              <select
                className={inputCls}
                value={shipForm.courier_company}
                onChange={(e) => setShipForm({ ...shipForm, courier_company: e.target.value })}
              >
                {COURIER_COMPANIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>

            <Field label="Număr AWB (Tracking Code) *">
              <input
                type="text"
                required
                className={inputCls}
                value={shipForm.courier_tracking_number}
                onChange={(e) => setShipForm({ ...shipForm, courier_tracking_number: e.target.value })}
                placeholder="Ex: FAN-918274628"
              />
            </Field>

            <Field label="Adresă Livrare Oaspete">
              <textarea
                className={`${inputCls} h-20 resize-none`}
                value={shipForm.delivery_address}
                onChange={(e) => setShipForm({ ...shipForm, delivery_address: e.target.value })}
                placeholder="Str. ..., Nr. ..., Oraș, Județ..."
              />
            </Field>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#eef2f7]">
              <button
                type="button"
                onClick={() => setShipModalItem(null)}
                className="rounded-xl border border-[#e1e8f0] px-4 py-2.5 text-xs font-semibold text-[#6b7c99] hover:bg-[#f8fafd]"
              >
                Anulează
              </button>
              <button
                type="submit"
                className="rounded-xl bg-sky-600 px-6 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-white hover:bg-sky-700 cursor-pointer shadow-md"
              >
                Confirmă Expedierea
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── MODAL: PREDARE LA RECEPȚIE (CLAIM) ── */}
      {claimModalItem && (
        <Modal
          open={!!claimModalItem}
          title="Predare Obiect Revendicat"
          onClose={() => setClaimModalItem(null)}
        >
          <form onSubmit={handleClaimSubmit} className="space-y-4">
            <p className="text-xs text-[#6b7c99]">
              Confirmă predarea bunului <strong>{claimModalItem.item_name}</strong> găsit în camera {claimModalItem.room_unit_number}.
            </p>

            <Field label="Nume persoană care a ridicat bunul *">
              <input
                type="text"
                className={inputCls}
                value={claimantName}
                onChange={(e) => setClaimantName(e.target.value)}
                placeholder={claimModalItem.guest_name || "Nume complet titular..."}
              />
            </Field>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#eef2f7]">
              <button
                type="button"
                onClick={() => setClaimModalItem(null)}
                className="rounded-xl border border-[#e1e8f0] px-4 py-2.5 text-xs font-semibold text-[#6b7c99] hover:bg-[#f8fafd]"
              >
                Anulează
              </button>
              <button
                type="submit"
                className="rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-white hover:bg-emerald-700 cursor-pointer shadow-md"
              >
                Confirmă Predarea Oaspetelui
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── MODAL: ETICHETĂ PRINTABILĂ PENTRU CUTIE DEPOZIT ── */}
      {labelModalItem && (
        <Modal
          open={!!labelModalItem}
          title="Etichetă Printabilă Cutie / Plic Depozit"
          onClose={() => setLabelModalItem(null)}
        >
          <div className="space-y-4">
            <div id="printable-label" className="rounded-2xl border-2 border-dashed border-[#0d2c5c] p-6 bg-white text-[#0d2c5c]">
              <div className="flex items-center justify-between border-b border-[#0d2c5c]/20 pb-3">
                <div>
                  <h3 className="font-['Cormorant_Garamond',serif] text-xl font-bold uppercase tracking-wider text-[#0d2c5c]">
                    Vila Casa Esy
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#c69a3f]">
                    Registru Lost & Found
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xs font-bold">ID: #{labelModalItem.id.slice(0, 8)}</span>
                </div>
              </div>

              <div className="my-4 space-y-2 text-xs">
                <p>
                  <strong>Obiect:</strong> <span className="text-sm font-bold">{labelModalItem.item_name}</span>
                </p>
                <p>
                  <strong>Camera:</strong> <span className="font-bold">Camera {labelModalItem.room_unit_number}</span>
                </p>
                <p>
                  <strong>Data Găsirii:</strong> {new Date(labelModalItem.found_date).toLocaleString("ro-RO")}
                </p>
                <p>
                  <strong>Locație Seif:</strong> {labelModalItem.storage_location}
                </p>
                {labelModalItem.guest_name && (
                  <p>
                    <strong>Oaspete Identificat:</strong> {labelModalItem.guest_name} ({labelModalItem.guest_phone || "—"})
                  </p>
                )}
              </div>

              <div className="border-t border-[#0d2c5c]/20 pt-3 text-center text-[10px] text-[#6b7c99]">
                Păstrare conform art. 238 Cod Civil (depozit hotelier)
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setLabelModalItem(null)}
                className="rounded-xl border border-[#e1e8f0] px-4 py-2 text-xs font-semibold text-[#6b7c99]"
              >
                Închide
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0d2c5c] px-5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow hover:bg-[#07203f] cursor-pointer"
              >
                <Printer size={13} /> Printează Eticheta
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── MODAL: PREVIEW ZOOM FOTOGRAFIE ── */}
      {photoPreview && (
        <div
          onClick={() => setPhotoPreview(null)}
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm cursor-zoom-out"
        >
          <div className="relative max-h-[90vh] max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <button
              onClick={() => setPhotoPreview(null)}
              className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black"
            >
              <X size={16} />
            </button>
            <img src={photoPreview} alt="Zoom Obiect" className="max-h-[85vh] w-auto object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
