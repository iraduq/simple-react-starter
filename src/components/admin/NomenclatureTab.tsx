import { useEffect, useState, useMemo } from "react";
import * as LucideIcons from "lucide-react";
import {
  Plus,
  Trash2,
  Pencil,
  Search,
  Check,
  LayoutGrid,
  List,
  Sparkles,
  Bed,
  CheckCircle2,
  Hotel,
  Tag,
  ShieldCheck,
  ChevronRight,
  Info,
  type LucideIcon,
} from "lucide-react";
import {
  Card,
  SectionHeader,
  Button,
  Badge,
  Modal,
  Field,
  inputCls,
  TableSkeleton,
} from "./ui";
import { get, post, patch, del, list, errMsg, type Room } from "../../lib/admin";
import { useToast } from "../Toast";
import { useAdminLiveSync, LiveSyncBadge } from "../../context/AdminLiveSyncContext";

/* ─────────────── ICON ALIASES & NORMALIZATION ─────────────── */
const LEGACY_ALIASES: Record<string, string> = {
  wifi: "Wifi",
  internet: "Wifi",
  air: "Wind",
  wind: "Wind",
  ac: "Wind",
  bath: "Bath",
  shower: "ShowerHead",
  tv: "Tv",
  television: "Tv",
  drink: "Wine",
  wine: "Wine",
  minibar: "Wine",
  safe: "ShieldCheck",
  phone: "Phone",
  telephone: "Phone",
  hairdryer: "Sparkles",
  soap: "Sparkles",
  garden: "Trees",
  trees: "Trees",
  coffee: "Coffee",
  parking: "Car",
  car: "Car",
  kitchen: "Utensils",
  fireplace: "Flame",
  balcony: "Sun",
  terrace: "Sun",
  sea: "Waves",
  waves: "Waves",
  gym: "Dumbbell",
  fitness: "Dumbbell",
  key: "KeyRound",
  bed: "Bed",
  sound: "Volume2",
};

const ICON_LIBRARY: { name: string; icon: LucideIcon }[] = Object.entries(
  LucideIcons as unknown as Record<string, unknown>,
)
  .filter(
    ([k, v]) =>
      /^[A-Z][A-Za-z0-9]*$/.test(k) &&
      !k.endsWith("Icon") &&
      !["Icon", "LucideIcon", "createLucideIcon"].includes(k) &&
      (typeof v === "function" ||
        (typeof v === "object" && v !== null && "render" in (v as object))),
  )
  .map(([k, v]) => ({ name: k, icon: v as LucideIcon }));

const ICON_BY_NAME = new Map(
  ICON_LIBRARY.map((i) => [i.name.toLowerCase(), i]),
);

function resolveIcon(name?: string | null): { name: string; icon: LucideIcon } | null {
  if (!name) return null;
  let raw = name.trim();
  // Strip common prefixes like 'Lucide'
  if (raw.startsWith("Lucide") && raw.length > 6) {
    raw = raw.substring(6);
  }
  const clean = raw.toLowerCase().replace(/[\s_-]+/g, "");
  const alias = LEGACY_ALIASES[clean] || LEGACY_ALIASES[raw.toLowerCase()];
  const lookupKey = (alias ?? raw).replace(/[\s_-]+/g, "").toLowerCase();

  return ICON_BY_NAME.get(lookupKey) ?? null;
}

function FacilityIconBadge({
  name,
  size = "md",
}: {
  name?: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const entry = resolveIcon(name);
  const IconComp = entry?.icon ?? Sparkles;

  const sizeClasses = {
    sm: "h-8 w-8 rounded-lg",
    md: "h-11 w-11 rounded-2xl",
    lg: "h-14 w-14 rounded-2xl",
  }[size];

  const iconSizes = {
    sm: 15,
    md: 20,
    lg: 26,
  }[size];

  return (
    <div
      className={`flex shrink-0 items-center justify-center bg-gradient-to-br from-[#fdf8ec] via-[#fbf2e0] to-[#f4e2bc] text-[#c69a3f] border border-[#ecd9b2] shadow-xs transition-transform group-hover:scale-105 ${sizeClasses}`}
    >
      <IconComp size={iconSizes} />
    </div>
  );
}

/* ─────────────── CATEGORY CLASSIFICATION ─────────────── */
function getCategoryInfo(name: string, icon?: string | null) {
  const text = `${name || ""} ${icon || ""}`.toLowerCase();
  if (
    text.includes("wifi") ||
    text.includes("internet") ||
    text.includes("tv") ||
    text.includes("telefon") ||
    text.includes("smart") ||
    text.includes("ecran")
  ) {
    return {
      key: "tech",
      label: "Tehnologie & Media",
      badgeCls: "bg-blue-50 text-blue-700 border-blue-200",
      dotCls: "bg-blue-500",
    };
  }
  if (
    text.includes("aer") ||
    text.includes("clima") ||
    text.includes("ventil") ||
    text.includes("wind") ||
    text.includes("incalz") ||
    text.includes("caldura")
  ) {
    return {
      key: "comfort",
      label: "Climatizare & Confort",
      badgeCls: "bg-teal-50 text-teal-700 border-teal-200",
      dotCls: "bg-teal-500",
    };
  }
  if (
    text.includes("baie") ||
    text.includes("dus") ||
    text.includes("cada") ||
    text.includes("uscator") ||
    text.includes("toalet") ||
    text.includes("sampon") ||
    text.includes("sapun") ||
    text.includes("cosmetic")
  ) {
    return {
      key: "wellness",
      label: "Baie & Wellness",
      badgeCls: "bg-purple-50 text-purple-700 border-purple-200",
      dotCls: "bg-purple-500",
    };
  }
  if (
    text.includes("minibar") ||
    text.includes("frigider") ||
    text.includes("cafea") ||
    text.includes("bar") ||
    text.includes("vin") ||
    text.includes("bautur") ||
    text.includes("drink")
  ) {
    return {
      key: "drinks",
      label: "Băuturi & Mini-bar",
      badgeCls: "bg-amber-50 text-amber-800 border-amber-200",
      dotCls: "bg-amber-500",
    };
  }
  if (
    text.includes("vedere") ||
    text.includes("gradin") ||
    text.includes("balcon") ||
    text.includes("terasa") ||
    text.includes("mare") ||
    text.includes("munte") ||
    text.includes("plaja")
  ) {
    return {
      key: "view",
      label: "Vedere & Exterior",
      badgeCls: "bg-emerald-50 text-emerald-700 border-emerald-200",
      dotCls: "bg-emerald-500",
    };
  }
  if (
    text.includes("seif") ||
    text.includes("parcare") ||
    text.includes("cheie") ||
    text.includes("secur")
  ) {
    return {
      key: "security",
      label: "Securitate & Servicii",
      badgeCls: "bg-indigo-50 text-indigo-700 border-indigo-200",
      dotCls: "bg-indigo-500",
    };
  }
  return {
    key: "general",
    label: "Dotare Cameră",
    badgeCls: "bg-slate-50 text-slate-700 border-slate-200",
    dotCls: "bg-slate-400",
  };
}

/* ─────────────── POPULAR HOTEL ICONS (QUICK PICKER) ─────────────── */
const POPULAR_HOTEL_ICONS: { label: string; icon: string }[] = [
  { label: "Wi-Fi", icon: "Wifi" },
  { label: "Aer Condiționat", icon: "Wind" },
  { label: "Smart TV", icon: "Tv" },
  { label: "Minibar", icon: "Wine" },
  { label: "Seif", icon: "ShieldCheck" },
  { label: "Espressor", icon: "Coffee" },
  { label: "Baie Privată", icon: "Bath" },
  { label: "Vedere Grădină", icon: "Trees" },
  { label: "Cosmetice", icon: "Sparkles" },
  { label: "Telefon", icon: "Phone" },
  { label: "Parcare", icon: "Car" },
  { label: "Bucătărie", icon: "Utensils" },
  { label: "Șemineu", icon: "Flame" },
  { label: "Smart Lock", icon: "KeyRound" },
  { label: "Vedere Mare", icon: "Waves" },
  { label: "Terasă", icon: "Sun" },
];

/* ─────────────── PREDEFINED FACILITY SUGGESTIONS ─────────────── */
const FACILITY_SUGGESTIONS = [
  {
    name: "Wi-Fi Gratuit de Mare Viteză",
    icon: "Wifi",
    desc: "Internet wireless fibră optică nelimitat în cameră și pe terasă",
  },
  {
    name: "Aer Condiționat Digital",
    icon: "Wind",
    desc: "Climatizare individuală silențioasă cu telecomandă și control precis",
  },
  {
    name: "Smart TV 4K Ultra HD",
    icon: "Tv",
    desc: "Televizor plat cu aplicații de streaming Netflix, YouTube și canale HD",
  },
  {
    name: "Minibar Artizanal",
    icon: "Wine",
    desc: "Selecție de băuturi răcoritoare, sucuri naturale și vinuri alese",
  },
  {
    name: "Seif Electronic pentru Laptop",
    icon: "ShieldCheck",
    desc: "Seif digital securizat cu cifru electronic pentru obiecte de valoare",
  },
  {
    name: "Cosmetice Hoteliere Bio",
    icon: "Sparkles",
    desc: "Set de baie artizanal: șampon organic, gel de duș și loțiune hidratantă",
  },
  {
    name: "Uscător de Păr Profesional",
    icon: "Sparkles",
    desc: "Uscător de păr de înaltă performanță inclus în fiecare baie",
  },
  {
    name: "Aparat Cafea Nespresso",
    icon: "Coffee",
    desc: "Espressor de cafea cu set de capsule oferite din partea casei",
  },
  {
    name: "Balcon Privat cu Vedere",
    icon: "Sun",
    desc: "Balcon privat mobilat cu măsuță și scaune pentru relaxare în aer liber",
  },
];

/* ─────────────── MODERN ICON PICKER COMPONENT ─────────────── */
function IconPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().replace(/[\s_-]+/g, "").trim();
    const base = q
      ? ICON_LIBRARY.filter((i) => i.name.toLowerCase().includes(q))
      : ICON_LIBRARY;
    return base.slice(0, 96);
  }, [query]);

  const selected = resolveIcon(value);

  return (
    <div className="space-y-3">
      {/* QUICK PRESETS ROW */}
      <div>
        <span className="block text-[11px] font-bold uppercase tracking-wider text-[#6b7c99] mb-1.5">
          Selectare Rapidă (Cele mai populare dotări hoteliere)
        </span>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
          {POPULAR_HOTEL_ICONS.map((p) => {
            const isPicked =
              value.toLowerCase() === p.icon.toLowerCase() ||
              value.toLowerCase() === p.label.toLowerCase();
            const IconComp = resolveIcon(p.icon)?.icon ?? Sparkles;

            return (
              <button
                type="button"
                key={p.icon}
                onClick={() => onChange(p.icon)}
                className={`flex flex-col items-center justify-center gap-1 rounded-xl p-2 text-center transition-all ${
                  isPicked
                    ? "bg-[#0d2c5c] text-white shadow-sm ring-2 ring-[#c69a3f]"
                    : "border border-[#e1e8f0] bg-[#f8fafd] text-[#0d2c5c] hover:bg-white hover:border-[#cbd5e1]"
                }`}
                title={p.label}
              >
                <IconComp size={16} />
                <span className="text-[10px] font-semibold truncate w-full">
                  {p.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* FULL ICON PICKER DROPDOWN / SEARCH */}
      <div className="relative">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className={`${inputCls} flex cursor-pointer items-center justify-between hover:border-[#0d2c5c]`}
        >
          {selected ? (
            <div className="flex items-center gap-2">
              {(() => {
                const Comp = selected.icon;
                return (
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#fdf8ec] text-[#c69a3f]">
                    <Comp size={14} />
                  </span>
                );
              })()}
              <span className="text-sm font-semibold text-[#0d2c5c]">
                {selected.name}
              </span>
            </div>
          ) : (
            <span className="text-sm text-[#6b7c99]">
              Caută o altă iconiță (ex: wifi, tv, coffee, sun)…
            </span>
          )}
          <span className="text-xs font-semibold text-[#0d2c5c] underline">
            {isOpen ? "Închide" : "Explorează toate iconițele"}
          </span>
        </div>

        {isOpen && (
          <div className="absolute z-50 mt-1.5 w-full overflow-hidden rounded-2xl border border-[#cbd5e1] bg-white shadow-2xl">
            <div className="border-b border-[#e1e8f0] p-2.5 bg-[#f8fafd]">
              <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-1.5 border border-[#cbd5e1]">
                <Search size={14} className="text-[#6b7c99]" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`Caută în ${ICON_LIBRARY.length} de iconițe Lucide…`}
                  className="w-full bg-transparent text-xs text-[#0d2c5c] outline-none"
                />
              </div>
            </div>

            <div className="grid max-h-56 grid-cols-4 sm:grid-cols-6 gap-1.5 overflow-y-auto p-2">
              {filtered.map((item) => {
                const IconComp = item.icon;
                const isSelected = value.toLowerCase() === item.name.toLowerCase();
                return (
                  <button
                    type="button"
                    key={item.name}
                    title={item.name}
                    onClick={() => {
                      onChange(item.name);
                      setIsOpen(false);
                    }}
                    className={`flex flex-col items-center gap-1 rounded-xl p-2 text-[10px] transition-colors ${
                      isSelected
                        ? "bg-[#0d2c5c] text-white"
                        : "text-[#2a3b52] hover:bg-[#f4f6f9]"
                    }`}
                  >
                    <IconComp size={16} />
                    <span className="w-full truncate text-center">
                      {item.name}
                    </span>
                    {isSelected && <Check size={10} />}
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <span className="col-span-full p-4 text-center text-xs text-[#6b7c99]">
                  Nicio iconiță găsită pentru căutarea ta.
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────── MAIN NOMENCLATURE TAB ─────────────── */
export default function NomenclatureTab() {
  const { isSyncing, connectionStatus } = useAdminLiveSync({
    topic: "nomenclature",
    onSync: () => void loadData(true),
  });
  const { toast } = useToast();

  const [items, setItems] = useState<any[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  // View Mode: grid or list
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Filter & Search
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Modal State
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [form, setForm] = useState<{
    name: string;
    icon: string;
    description: string;
  }>({
    name: "",
    icon: "",
    description: "",
  });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [facs, fetchedRooms] = await Promise.all([
        get<unknown>("/rooms/facilities"),
        get<unknown>("/rooms"),
      ]);
      setItems(list<any>(facs));
      setRooms(Array.isArray(fetchedRooms) ? (fetchedRooms as Room[]) : []);
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  // Filtered facilities
  const filtered = useMemo(() => {
    return items.filter((it) => {
      const q = query.toLowerCase().trim();
      const cat = getCategoryInfo(it.name, it.icon);

      if (categoryFilter !== "all" && cat.key !== categoryFilter) {
        return false;
      }

      if (!q) return true;
      return (
        it.name?.toLowerCase().includes(q) ||
        it.description?.toLowerCase().includes(q) ||
        cat.label.toLowerCase().includes(q)
      );
    });
  }, [items, query, categoryFilter]);

  // Stats calculation
  const stats = useMemo(() => {
    const total = items.length;
    let assignedCount = 0;

    items.forEach((item) => {
      const isAssigned = rooms.some((r) =>
        r.facilities?.some((f: { id: number | string }) => f.id === item.id),
      );
      if (isAssigned) assignedCount++;
    });

    const techCount = items.filter(
      (i) => getCategoryInfo(i.name, i.icon).key === "tech",
    ).length;
    const comfortCount = items.filter((i) => {
      const k = getCategoryInfo(i.name, i.icon).key;
      return k === "comfort" || k === "wellness";
    }).length;

    return { total, assignedCount, techCount, comfortCount };
  }, [items, rooms]);

  const openCreate = () => {
    setEditTarget(null);
    setForm({
      name: "",
      icon: "Wifi",
      description: "",
    });
    setFormOpen(true);
  };

  const openEdit = (item: any) => {
    setEditTarget(item);
    setForm({
      name: item.name || "",
      icon: item.icon || "Wifi",
      description: item.description || "",
    });
    setFormOpen(true);
  };

  const handleApplySuggestion = (s: { name: string; icon: string; desc: string }) => {
    setForm({
      name: s.name,
      icon: s.icon,
      description: s.desc,
    });
  };

  const submit = async () => {
    if (!form.name.trim()) {
      toast("Numele facilității este obligatoriu.", "error");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        icon: form.icon.trim() || null,
        description: form.description.trim() || null,
      };

      if (editTarget) {
        await patch(`/rooms/facilities/${editTarget.id}`, payload);
        toast(`Facilitatea "${payload.name}" a fost actualizată.`, "success");
      } else {
        await post("/rooms/facilities", payload);
        toast(`Facilitatea "${payload.name}" a fost adăugată cu succes.`, "success");
      }

      setFormOpen(false);
      await loadData();
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await del(`/rooms/facilities/${deleteTarget.id}`);
      toast(`Facilitatea "${deleteTarget.name}" a fost ștearsă.`, "success");
      setDeleteTarget(null);
      await loadData();
    } catch (e) {
      toast(errMsg(e), "error");
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* SECTION HEADER WITH LIVE BADGE */}
      <SectionHeader
        eyebrow="Configurări hotel & dotări"
        title="Nomenclator și Facilități Camere"
        action={
          <div className="flex items-center gap-3">
            <LiveSyncBadge isSyncing={isSyncing} status={connectionStatus} />
            <Button variant="gold" size="sm" onClick={openCreate}>
              <Plus size={15} /> Adaugă Facilitate
            </Button>
          </div>
        }
      />

      {/* TOP KPI OVERVIEW CARDS */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="p-4 sm:p-5">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#6b7c99]">
            Total Dotări Înregistrate
          </span>
          <p className="mt-1.5 text-2xl sm:text-3xl font-bold font-sans tracking-tight tabular-nums text-[#0d2c5c]">
            {stats.total}
          </p>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-[#6b7c99]">
            <Tag size={13} className="text-[#c69a3f]" /> Facilități disponibile
          </div>
        </Card>

        <Card className="p-4 sm:p-5">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">
            Atribuite în Camere
          </span>
          <p className="mt-1.5 text-2xl sm:text-3xl font-bold font-sans tracking-tight tabular-nums text-emerald-700">
            {stats.assignedCount} <span className="text-xs font-normal text-emerald-600">/ {stats.total}</span>
          </p>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-600">
            <CheckCircle2 size={13} /> Active pe website & rezervări
          </div>
        </Card>

        <Card className="p-4 sm:p-5">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700">
            Tehnologie & Conectivitate
          </span>
          <p className="mt-1.5 text-2xl sm:text-3xl font-bold font-sans tracking-tight tabular-nums text-blue-700">
            {stats.techCount}
          </p>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-blue-600">
            <Sparkles size={13} /> Wi-Fi, TV, Seif, Clanțe Smart
          </div>
        </Card>

        <Card className="p-4 sm:p-5">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#0d2c5c]">
            Confort & Wellness
          </span>
          <p className="mt-1.5 text-2xl sm:text-3xl font-bold font-sans tracking-tight tabular-nums text-[#0d2c5c]">
            {stats.comfortCount}
          </p>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-[#6b7c99]">
            <Hotel size={13} className="text-[#c69a3f]" /> Climatizare, baie & relaxare
          </div>
        </Card>
      </div>

      {/* TOOLBAR: SEARCH, CATEGORIES & VIEW SWITCHER */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#e1e8f0] bg-white p-3 shadow-xs lg:flex-row lg:items-center lg:justify-between">
        {/* SEARCH BOX */}
        <div className="relative flex-1 max-w-md">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Caută facilitate (ex: Wi-Fi, Aer condiționat, Minibar)..."
            className="w-full rounded-xl border border-[#cbd5e1] bg-[#f8fafd] py-2 pl-9 pr-8 text-[12.5px] text-[#0d2c5c] placeholder-[#94a3b8] focus:border-[#0d2c5c] focus:bg-white focus:outline-none transition-colors"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#0d2c5c]"
            >
              ×
            </button>
          )}
        </div>

        {/* CATEGORY FILTER PILLS */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-[#f8fafd] border border-[#e1e8f0] rounded-xl text-[11px] font-bold">
          {[
            { key: "all", label: `Toate (${items.length})` },
            { key: "tech", label: "Tehnologie" },
            { key: "comfort", label: "Climatizare" },
            { key: "wellness", label: "Baie & Wellness" },
            { key: "drinks", label: "Mini-bar" },
            { key: "view", label: "Vedere & Terasă" },
          ].map((cat) => (
            <button
              key={cat.key}
              onClick={() => setCategoryFilter(cat.key)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                categoryFilter === cat.key
                  ? "bg-[#0d2c5c] text-white shadow-xs"
                  : "text-[#6b7c99] hover:text-[#0d2c5c]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* VIEW MODE TOGGLE */}
        <div className="flex items-center gap-1 rounded-xl border border-[#e1e8f0] bg-[#f8fafd] p-1 shrink-0 self-end lg:self-auto">
          <button
            onClick={() => setViewMode("grid")}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
              viewMode === "grid"
                ? "bg-[#0d2c5c] text-white shadow-xs"
                : "text-[#6b7c99] hover:text-[#0d2c5c]"
            }`}
            title="Vizualizare carduri premium"
          >
            <LayoutGrid size={14} />
            <span className="hidden sm:inline">Carduri</span>
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
              viewMode === "table"
                ? "bg-[#0d2c5c] text-white shadow-xs"
                : "text-[#6b7c99] hover:text-[#0d2c5c]"
            }`}
            title="Vizualizare tabel detaliat"
          >
            <List size={14} />
            <span className="hidden sm:inline">Tabel</span>
          </button>
        </div>
      </div>

      {/* CONTENT: LOADING / EMPTY / GRID / TABLE */}
      {loading ? (
        <Card className="p-6">
          <TableSkeleton rows={5} />
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fdf8ec] text-[#c69a3f] border border-[#f4e5c8] mb-3">
            <Sparkles size={24} />
          </div>
          <h3 className="text-base font-bold text-[#0d2c5c]">
            Nicio facilitate găsită
          </h3>
          <p className="mt-1 text-xs text-[#6b7c99] max-w-sm mx-auto">
            {query
              ? `Nicio dotare nu corespunde căutării "${query}". Încearcă un alt termen.`
              : "Nu există facilități configurate în această categorie."}
          </p>
          <Button variant="gold" size="sm" className="mt-4" onClick={openCreate}>
            <Plus size={14} /> Adaugă Prima Facilitate
          </Button>
        </Card>
      ) : viewMode === "grid" ? (
        /* ─────────────── LUXURY GRID VIEW ─────────────── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => {
            const cat = getCategoryInfo(item.name, item.icon);
            const assignedRooms = rooms.filter((r) =>
              r.facilities?.some((f: { id: number | string }) => f.id === item.id),
            );
            const allRoomsAssigned =
              rooms.length > 0 && assignedRooms.length === rooms.length;

            return (
              <div
                key={item.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-[#e1e8f0] bg-white p-5 shadow-xs hover:border-[#c69a3f]/60 hover:shadow-md transition-all duration-200"
              >
                <div>
                  {/* TOP ROW: ICON & ACTIONS */}
                  <div className="flex items-start justify-between gap-3 mb-3.5">
                    <FacilityIconBadge name={item.icon} size="md" />

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(item)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e1e8f0] text-[#0d2c5c] hover:bg-[#f8fafd] hover:border-[#0d2c5c] transition-colors"
                        title="Editează facilitatea"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(item)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e1e8f0] text-[#b91c1c] hover:bg-rose-50 hover:border-[#b91c1c] transition-colors"
                        title="Șterge facilitatea"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* TITLE & CATEGORY */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-[15px] font-bold text-[#0d2c5c] leading-snug">
                        {item.name}
                      </h4>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${cat.badgeCls}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${cat.dotCls}`} />
                      {cat.label}
                    </span>
                  </div>

                  {/* DESCRIPTION */}
                  <p className="mt-2.5 text-[12.5px] leading-relaxed text-[#556987] line-clamp-2">
                    {item.description || (
                      <span className="italic text-[#94a3b8]">
                        Fără descriere detaliată
                      </span>
                    )}
                  </p>
                </div>

                {/* BOTTOM FOOTER: ROOM COVERAGE */}
                <div className="mt-4 pt-3 border-t border-[#f1f5f9] flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5 text-[#6b7c99]">
                    <Bed size={13} className="text-[#c69a3f]" />
                    {allRoomsAssigned ? (
                      <span className="font-semibold text-emerald-700">
                        Inclusă în toate camerele ({rooms.length})
                      </span>
                    ) : assignedRooms.length > 0 ? (
                      <span>
                        Inclusă în <strong>{assignedRooms.length}</strong> tipuri de camere
                      </span>
                    ) : (
                      <span className="italic text-[#94a3b8]">
                        Neatribuită încă
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] font-mono text-[#94a3b8]">
                    #{item.id}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ─────────────── REFINED TABLE VIEW ─────────────── */
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12.5px]">
              <thead>
                <tr className="border-b border-[#e1e8f0] bg-[#f8fafd] text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#6b7c99]">
                  <th className="py-3 px-5">Dotare & Iconiță</th>
                  <th className="py-3 px-4">Categorie</th>
                  <th className="py-3 px-4">Descriere</th>
                  <th className="py-3 px-4">Acoperire Camere</th>
                  <th className="py-3 px-5 text-right">Acțiuni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9]">
                {filtered.map((item) => {
                  const cat = getCategoryInfo(item.name, item.icon);
                  const assignedRooms = rooms.filter((r) =>
                    r.facilities?.some((f: { id: number | string }) => f.id === item.id),
                  );
                  const allRoomsAssigned =
                    rooms.length > 0 && assignedRooms.length === rooms.length;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-[#f8fafd] transition-colors"
                    >
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <FacilityIconBadge name={item.icon} size="sm" />
                          <span className="font-bold text-[#0d2c5c] text-[13.5px]">
                            {item.name}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wider ${cat.badgeCls}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${cat.dotCls}`} />
                          {cat.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-[#475569] max-w-xs truncate">
                        {item.description || (
                          <span className="italic text-[#94a3b8]">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-[#475569]">
                        {allRoomsAssigned ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            Toate camerele ({rooms.length})
                          </span>
                        ) : assignedRooms.length > 0 ? (
                          <span className="text-[11px] font-medium text-[#0d2c5c]">
                            {assignedRooms.length} tipuri de camere
                          </span>
                        ) : (
                          <span className="text-[11px] italic text-[#94a3b8]">
                            Neatribuită
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(item)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#e1e8f0] text-[#0d2c5c] hover:bg-white hover:border-[#0d2c5c] transition-colors"
                            title="Editează"
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(item)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#e1e8f0] text-[#b91c1c] hover:bg-rose-50 hover:border-[#b91c1c] transition-colors"
                            title="Șterge"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ─────────────── MODAL CREARE / EDITARE ─────────────── */}
      <Modal
        open={formOpen}
        title={
          editTarget
            ? `Editează Facilitatea: ${editTarget.name}`
            : "Adaugă o Facilitate Nouă"
        }
        onClose={() => setFormOpen(false)}
      >
        <div className="space-y-4">
          {/* LIVE PREVIEW CARD */}
          <div className="rounded-2xl border border-[#c69a3f]/40 bg-gradient-to-r from-[#fdfbf7] to-[#f7f2e7] p-3.5">
            <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#c69a3f] mb-2">
              Previzualizare Live în Interfața Oaspeților
            </span>
            <div className="flex items-center gap-3">
              <FacilityIconBadge name={form.icon} size="md" />
              <div>
                <h5 className="text-[14px] font-bold text-[#0d2c5c]">
                  {form.name.trim() || "Numele facilității..."}
                </h5>
                <p className="text-[11.5px] text-[#6b7c99] line-clamp-1">
                  {form.description.trim() || "Descrierea va apărea aici..."}
                </p>
              </div>
            </div>
          </div>

          {/* PREDEFINED HOTEL SUGGESTION CHIPS (ONLY ON CREATE) */}
          {!editTarget && (
            <div>
              <span className="block text-[10.5px] font-bold uppercase tracking-wider text-[#6b7c99] mb-1.5">
                Preseturi Rapide Casa Esy (Click pentru completare automată):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {FACILITY_SUGGESTIONS.map((s) => (
                  <button
                    type="button"
                    key={s.name}
                    onClick={() => handleApplySuggestion(s)}
                    className="rounded-lg border border-[#e1e8f0] bg-white px-2.5 py-1 text-[11px] font-medium text-[#0d2c5c] hover:border-[#c69a3f] hover:bg-[#fdf8ec] transition-colors"
                  >
                    + {s.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* NAME FIELD */}
          <Field label="Nume Facilitate">
            <input
              className={inputCls}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="ex: Wi-Fi Gratuit de Mare Viteză, Aer Condiționat, Minibar"
            />
          </Field>

          {/* ICON PICKER */}
          <Field label="Iconiță Vizuală Hoteliere">
            <IconPicker
              value={form.icon}
              onChange={(val) => setForm({ ...form, icon: val })}
            />
          </Field>

          {/* DESCRIPTION FIELD */}
          <Field label="Descriere Oaspeți (opțional)">
            <textarea
              className={`${inputCls} min-h-[75px] resize-y`}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Descrie pe scurt beneficiul pentru oaspete (ex: Internet wireless nelimitat în cameră și balcon)..."
            />
          </Field>
        </div>

        <div className="mt-6 flex justify-end gap-2 border-t border-[#eef2f7] pt-4">
          <Button variant="ghost" onClick={() => setFormOpen(false)}>
            Renunță
          </Button>
          <Button disabled={saving} onClick={() => void submit()}>
            {saving
              ? "Se salvează…"
              : editTarget
              ? "Salvează Modificările"
              : "Adaugă Facilitatea"}
          </Button>
        </div>
      </Modal>

      {/* ─────────────── MODAL CONFIRMARE ȘTERGERE ─────────────── */}
      <Modal
        open={Boolean(deleteTarget)}
        title="Confirmare Ștergere Facilitate"
        onClose={() => setDeleteTarget(null)}
      >
        <div className="space-y-3">
          <p className="text-[13px] text-[#2a3b52]">
            Ești sigur că dorești să elimini facilitatea{" "}
            <strong className="text-[#0d2c5c]">{deleteTarget?.name}</strong> din
            nomenclator?
          </p>
          <p className="text-[11.5px] text-[#6b7c99]">
            Această acțiune o va deconecta automat de la toate camerele în care
            era afișată.
          </p>
        </div>
        <div className="mt-5 flex justify-end gap-2 border-t border-[#eef2f7] pt-4">
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
            Anulează
          </Button>
          <Button variant="danger" onClick={() => void handleDelete()}>
            Șterge definitiv
          </Button>
        </div>
      </Modal>
    </div>
  );
}
