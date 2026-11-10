import React, { useEffect, useState } from "react";
import {
  X,
  Sparkles,
  Egg,
  Utensils,
  Wine,
  Clock,
  Check,
  Plus,
  Minus,
  Calendar,
  Users,
  ShieldCheck,
} from "lucide-react";
import { apiFetch } from "../../lib/api";
import { useToast } from "../Toast";

export interface UpsellCatalogItem {
  id: string;
  title: string;
  category: string;
  price: number;
  per_unit: string;
  badge: string;
  badge_color: string;
  icon: string;
  description: string;
  highlight: string;
}

interface BreakfastUpsellModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  bookingCode: string;
  nightsCount?: number;
  adultsCount?: number;
  onSuccess?: () => void;
}

export default function BreakfastUpsellModal({
  isOpen,
  onClose,
  bookingId,
  bookingCode,
  nightsCount = 1,
  adultsCount = 2,
  onSuccess,
}: BreakfastUpsellModalProps) {
  const { toast } = useToast();
  const [catalog, setCatalog] = useState<UpsellCatalogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string>("breakfast_buffet");
  const [persons, setPersons] = useState<number>(Math.max(1, adultsCount));
  const [days, setDays] = useState<number>(Math.max(1, nightsCount));
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    apiFetch<UpsellCatalogItem[]>("/upsell/catalog")
      .then((data) => {
        if (Array.isArray(data)) setCatalog(data);
      })
      .catch(() => {
        // quiet fallback
      })
      .finally(() => setLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const currentItem = catalog.find((c) => c.id === selectedId) || catalog[0];
  const isPerDay = currentItem?.per_unit?.includes("zi");
  const isPerPerson = currentItem?.per_unit?.includes("persoană");

  const computedQuantity = isPerDay && isPerPerson
    ? persons * days
    : isPerPerson
      ? persons
      : 1;

  const totalPrice = currentItem ? currentItem.price * computedQuantity : 0;

  const handleAddAddon = async () => {
    if (!currentItem) return;
    setSubmitting(true);
    try {
      await apiFetch(`/bookings/${bookingId || bookingCode}/addons`, {
        method: "POST",
        body: JSON.stringify({
          category: currentItem.category,
          title: currentItem.title,
          unit_price: currentItem.price,
          quantity: computedQuantity,
          notes: notes.trim() || undefined,
        }),
      });

      toast(`«${currentItem.title}» a fost adăugat cu succes pe nota camerei!`, "success");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toast(err?.message || "Eroare la adăugarea pachetului.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Egg":
        return Egg;
      case "Utensils":
        return Utensils;
      case "Wine":
        return Wine;
      case "Clock":
        return Clock;
      case "Sparkles":
      default:
        return Sparkles;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-[28px] max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-[#e1e8f0]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#e1e8f0] flex items-center justify-between bg-gradient-to-r from-[#0d2c5c] to-[#071d3d] text-white">
          <div>
            <div className="flex items-center gap-2 text-[10.5px] font-bold tracking-[0.22em] uppercase text-[#c69a3f] mb-1">
              <Sparkles size={13} />
              <span>Upselling & Personalizare Sejur</span>
            </div>
            <h3 className="font-['Cormorant_Garamond',serif] text-[24px] sm:text-[28px] font-semibold leading-tight text-white">
              Adaugă Mic Dejun & Pachete Suplimentare
            </h3>
            <p className="text-[12px] text-white/70 mt-0.5">
              Rezervare #{bookingCode} · Se aplică direct pe nota camerei
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X size={17} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 font-sans">
          {/* Catalog Selection Cards */}
          <div>
            <p className="text-[11px] font-bold tracking-wider uppercase text-[#64748b] mb-3">
              1. Alege Pachetul Dorit:
            </p>
            <div className="space-y-2.5">
              {catalog.map((item) => {
                const isSelected = item.id === selectedId;
                const IconComponent = getIcon(item.icon);
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    className={`p-4 rounded-[18px] border transition-all cursor-pointer flex items-start gap-3.5 ${
                      isSelected
                        ? "border-[#00a896] bg-[#f0fdfa] shadow-sm ring-2 ring-[#00a896]/20"
                        : "border-[#e1e8f0] bg-white hover:border-[#0284c7] hover:bg-[#f8fafc]"
                    }`}
                  >
                    <div
                      className={`w-11 h-11 rounded-[14px] flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? "bg-[#00a896] text-white shadow-sm"
                          : "bg-[#f1f5f9] text-[#0d2c5c]"
                      }`}
                    >
                      <IconComponent size={20} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-['Outfit',sans-serif] text-[15px] font-bold text-[#0d2c5c]">
                            {item.title}
                          </h4>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${item.badge_color}`}
                          >
                            {item.badge}
                          </span>
                        </div>
                        <span className="font-['Outfit',sans-serif] text-[15px] font-extrabold text-[#00a896]">
                          {item.price} RON{" "}
                          <span className="text-[11px] font-normal text-[#64748b]">
                            / {item.per_unit}
                          </span>
                        </span>
                      </div>

                      <p className="text-[12.5px] text-[#475569] leading-relaxed">
                        {item.description}
                      </p>
                      <p className="text-[11.5px] text-[#0284c7] font-semibold mt-1 flex items-center gap-1.5">
                        <ShieldCheck size={13} />
                        <span>{item.highlight}</span>
                      </p>
                    </div>

                    <div className="pt-1">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                          isSelected
                            ? "border-[#00a896] bg-[#00a896] text-white"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {isSelected && <Check size={12} strokeWidth={3} />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Configurator Persons & Days if applicable */}
          {currentItem && (
            <div className="p-4 rounded-[20px] bg-[#f8fafc] border border-[#e1e8f0] space-y-4">
              <p className="text-[11px] font-bold tracking-wider uppercase text-[#64748b]">
                2. Configurare Număr Persoane & Zile:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {isPerPerson && (
                  <div className="bg-white p-3.5 rounded-[14px] border border-[#e1e8f0] flex items-center justify-between">
                    <div>
                      <p className="text-[12px] font-bold text-[#0d2c5c] flex items-center gap-1.5">
                        <Users size={14} className="text-[#00a896]" />
                        <span>Număr Persoane:</span>
                      </p>
                      <p className="text-[11px] text-[#64748b]">Adulți / Copii</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPersons((p) => Math.max(1, p - 1))}
                        className="w-8 h-8 rounded-lg border border-[#e1e8f0] bg-white hover:bg-slate-50 flex items-center justify-center text-[#0d2c5c]"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center font-bold text-[14px] text-[#0d2c5c]">
                        {persons}
                      </span>
                      <button
                        type="button"
                        onClick={() => setPersons((p) => p + 1)}
                        className="w-8 h-8 rounded-lg border border-[#e1e8f0] bg-white hover:bg-slate-50 flex items-center justify-center text-[#0d2c5c]"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {isPerDay && (
                  <div className="bg-white p-3.5 rounded-[14px] border border-[#e1e8f0] flex items-center justify-between">
                    <div>
                      <p className="text-[12px] font-bold text-[#0d2c5c] flex items-center gap-1.5">
                        <Calendar size={14} className="text-[#0284c7]" />
                        <span>Zile de Mic Dejun:</span>
                      </p>
                      <p className="text-[11px] text-[#64748b]">
                        Din cele {nightsCount} nopți
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setDays((d) => Math.max(1, d - 1))}
                        className="w-8 h-8 rounded-lg border border-[#e1e8f0] bg-white hover:bg-slate-50 flex items-center justify-center text-[#0d2c5c]"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center font-bold text-[14px] text-[#0d2c5c]">
                        {days}
                      </span>
                      <button
                        type="button"
                        onClick={() => setDays((d) => d + 1)}
                        className="w-8 h-8 rounded-lg border border-[#e1e8f0] bg-white hover:bg-slate-50 flex items-center justify-center text-[#0d2c5c]"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#64748b] mb-1">
                  Mențiuni speciale / Preferințe servire (opțional):
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: preferăm cafea decofeinizată, servire la ora 09:00..."
                  className="w-full px-3.5 py-2 rounded-[12px] border border-[#e1e8f0] text-[12.5px] text-[#0d2c5c] focus:border-[#00a896] outline-none bg-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer with Price Summary and Action */}
        <div className="px-6 py-4 bg-[#f8fafc] border-t border-[#e1e8f0] flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
          <div>
            <span className="text-[11px] font-semibold text-[#64748b] block">
              Total de adăugat pe nota camerei:
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-['Outfit',sans-serif] text-[26px] font-bold text-[#0d2c5c] leading-none">
                {totalPrice.toLocaleString("ro-RO")} RON
              </span>
              <span className="text-[12px] text-[#64748b]">
                ({computedQuantity} {computedQuantity === 1 ? "porție" : "porții"} total)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-[12px] border border-[#e1e8f0] text-[#64748b] text-[12.5px] font-bold hover:bg-white transition"
            >
              Anulează
            </button>
            <button
              type="button"
              disabled={submitting || !currentItem}
              onClick={handleAddAddon}
              className="px-6 py-2.5 rounded-[12px] bg-gradient-to-r from-[#00a896] to-[#0284c7] hover:brightness-105 text-white text-[13px] font-bold shadow-[0_8px_20px_rgba(0,168,150,0.3)] transition active:scale-95 disabled:opacity-50"
            >
              {submitting ? "Se adaugă..." : "Adaugă pe Nota Camerei"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
