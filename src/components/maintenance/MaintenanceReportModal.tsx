import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  Wrench,
  Wind,
  Droplets,
  Lightbulb,
  Tv,
  Sparkles,
  CheckCircle2,
  Send,
} from "lucide-react";
import { apiFetch } from "../../lib/api";
import { useToast } from "../Toast";

interface MaintenanceReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingCode?: string;
  unitNumber?: string;
  defaultGuestName?: string;
  defaultGuestPhone?: string;
}

const CATEGORIES = [
  {
    id: "ac",
    name: "Aer Condiționat",
    desc: "Nu răcește, zgomotos sau telecomandă defectă",
    icon: Wind,
  },
  {
    id: "plumbing",
    name: "Instalații Sanitare",
    desc: "Presiune scăzută la duș, robinet sau scurgere",
    icon: Droplets,
  },
  {
    id: "electrical",
    name: "Electricitate & Becuri",
    desc: "Bec ars, priză sau întrerupător nefuncțional",
    icon: Lightbulb,
  },
  {
    id: "tv_wifi",
    name: "Smart TV & Wi-Fi",
    desc: "Semnal Wi-Fi slab, aplicații TV sau cablu",
    icon: Tv,
  },
  {
    id: "housekeeping",
    name: "Curățenie & Consumabile",
    desc: "Prosoape suplimentare, cosmetice sau curățenie",
    icon: Sparkles,
  },
  {
    id: "other",
    name: "Alte Defecțiuni",
    desc: "Ușă, seif, balcon sau mobilier",
    icon: Wrench,
  },
];

export default function MaintenanceReportModal({
  isOpen,
  onClose,
  bookingCode,
  unitNumber,
  defaultGuestName = "",
  defaultGuestPhone = "",
}: MaintenanceReportModalProps) {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState("ac");
  const [priority, setPriority] = useState("normal");
  const [description, setDescription] = useState("");
  const [roomUnit, setRoomUnit] = useState(unitNumber || "Camera mea");
  const [guestName] = useState(defaultGuestName);
  const [guestPhone] = useState(defaultGuestPhone);
  const [submitting, setSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      toast("Te rugăm să descrii problema pe scurt.", "error");
      return;
    }

    const catObj = CATEGORIES.find((c) => c.id === selectedCategory);
    const finalTitle = `Problemă ${catObj?.name || "Cameră"}`;

    setSubmitting(true);
    try {
      const res = await apiFetch<any>("/maintenance/report", {
        method: "POST",
        body: JSON.stringify({
          unit_number: roomUnit.trim(),
          booking_code: bookingCode || undefined,
          guest_name: guestName.trim() || "Oaspete Casa Esy",
          guest_phone: guestPhone.trim() || undefined,
          category: selectedCategory,
          title: finalTitle,
          description: description.trim(),
          priority,
        }),
      });

      setSubmittedTicket(res);
      toast(`Tichetul #${res.ticket_code} a fost înregistrat. Un tehnician a fost notificat!`, "success");
    } catch (err: any) {
      toast(err?.message || "Eroare la trimiterea solicitării.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const subtitleParts = [
    unitNumber ? `Camera / Suita ${unitNumber}` : null,
    bookingCode ? `Cod rezervare #${bookingCode}` : null,
    !unitNumber && !bookingCode ? "Echipa noastră intervine în cel mai scurt timp" : null,
  ].filter(Boolean);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-[#07203f]/55 backdrop-blur-md">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div
        className="relative z-10 w-full max-w-2xl max-h-[calc(100vh-3rem)] flex flex-col rounded-[28px] bg-white shadow-[0_30px_80px_rgba(7,32,63,0.35)] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header stil Casa Esy cu val organic & cercuri decorative */}
        <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-[#0d2c5c] via-[#123a72] to-[#07203f] px-6 sm:px-7 pt-5 pb-9">
          <svg
            viewBox="0 0 120 120"
            fill="none"
            className="pointer-events-none absolute -right-6 -top-8 h-36 w-36 text-white/10"
          >
            <circle cx="60" cy="60" r="22" stroke="currentColor" strokeWidth="1.2" />
            <circle cx="60" cy="60" r="36" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 5" />
            <circle cx="60" cy="60" r="50" stroke="currentColor" strokeWidth="0.6" />
          </svg>
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#e6b85c]">
                Vila Casa Esy · Asistență și mentenanță
              </span>
              <h2
                className="mt-1 text-[22px] sm:text-[25px] font-bold leading-tight !text-white tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Asistență tehnică în cameră
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20 cursor-pointer"
              aria-label="Închide"
            >
              ✕
            </button>
          </div>
          <svg
            viewBox="0 0 400 24"
            preserveAspectRatio="none"
            className="absolute bottom-0 left-0 h-6 w-full text-white"
          >
            <path d="M0 24 V12 Q50 0 100 12 T200 12 T300 12 T400 12 V24 Z" fill="currentColor" />
          </svg>
        </div>

        {/* Subtitlu curat sub val */}
        {subtitleParts.length > 0 && (
          <div className="px-6 sm:px-7 pt-1.5 text-xs font-medium text-[#6b7c99] shrink-0">
            {subtitleParts.join(" • ")}
          </div>
        )}

        {/* Conținut scrollabil */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-7 py-5 space-y-5">
          {submittedTicket ? (
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 size={32} />
              </div>

              <div>
                <span className="px-3 py-1 rounded-full bg-[#fdf8ec] text-[#9c7624] border border-[#c69a3f]/40 text-[11px] font-mono font-bold tracking-wider">
                  Cod Tichet: #{submittedTicket.ticket_code}
                </span>
                <h4
                  className="text-[22px] font-bold text-[#0d2c5c] mt-2"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Solicitarea a fost transmisă echipei
                </h4>
                <p className="text-[13px] text-[#6b7c99] mt-1 max-w-md mx-auto">
                  Departamentul{" "}
                  <strong>
                    {submittedTicket.department === "mentenanta"
                      ? "Mentenanță"
                      : submittedTicket.department === "housekeeping"
                        ? "Housekeeping"
                        : "IT & Tehnic"}
                  </strong>{" "}
                  a primit notificarea dumneavoastră.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#f8fafd] border border-[#dce4ef] text-left space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#6b7c99]">
                  Urmărire în timp real
                </p>

                <div className="space-y-2.5">
                  <div className="flex items-center gap-3 text-[12.5px] font-semibold text-emerald-700">
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">
                      ✓
                    </span>
                    <span>1. Solicitare înregistrată în sistem</span>
                  </div>
                  <div className="flex items-center gap-3 text-[12.5px] font-semibold text-[#0d2c5c]">
                    <span className="w-5 h-5 rounded-full bg-[#c69a3f] text-[#0d2c5c] flex items-center justify-center text-[10px] font-bold animate-pulse">
                      2
                    </span>
                    <span>2. Alocare tehnician de serviciu (SLA: {submittedTicket.sla_minutes} min)</span>
                  </div>
                  <div className="flex items-center gap-3 text-[12.5px] text-[#8a99ad]">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-[10px] font-bold">
                      3
                    </span>
                    <span>3. Remediere la cameră & verificare</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-full bg-[#0d2c5c] hover:bg-[#133b7a] px-7 py-2.5 text-[11.5px] font-bold uppercase tracking-[0.14em] text-white transition shadow-sm cursor-pointer"
              >
                Am înțeles
              </button>
            </div>
          ) : (
            <form id="maintenance-report-form" onSubmit={handleSubmit} className="space-y-5">
              {/* Categorii */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#6b7c99] mb-2.5">
                  Categoria defecțiunii
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                          isSelected
                            ? "border-[#c69a3f] bg-[#fdfaf2] ring-2 ring-[#c69a3f]/20 shadow-xs"
                            : "border-[#dce4ef] bg-[#f8fafd] hover:bg-white hover:border-[#c69a3f]/50"
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? "bg-[#0d2c5c] text-[#e6b85c]"
                              : "bg-white border border-[#dce4ef] text-[#0d2c5c]"
                          }`}
                        >
                          <Icon size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13.5px] font-bold text-[#0d2c5c] leading-tight">
                            {cat.name}
                          </p>
                          <p className="text-[11px] text-[#6b7c99] mt-0.5 line-clamp-1">
                            {cat.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Urgență & Cameră */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#6b7c99] mb-1.5">
                    Nivel de urgență
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#dce4ef] bg-[#f8fafd] focus:bg-white text-sm font-semibold text-[#0d2c5c] focus:outline-none focus:border-[#0d2c5c] focus:ring-2 focus:ring-[#0d2c5c]/15 transition-all"
                  >
                    <option value="normal">Normal (Rezolvare în max 2 ore)</option>
                    <option value="high">Ridicată (Rezolvare în max 1 oră)</option>
                    <option value="urgent">Urgentă (Intervenție în max 30 min)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#6b7c99] mb-1.5">
                    Număr cameră / suită
                  </label>
                  <input
                    type="text"
                    required
                    value={roomUnit}
                    onChange={(e) => setRoomUnit(e.target.value)}
                    placeholder="Ex: Camera 204"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#dce4ef] bg-[#f8fafd] focus:bg-white text-sm font-semibold text-[#0d2c5c] focus:outline-none focus:border-[#0d2c5c] focus:ring-2 focus:ring-[#0d2c5c]/15 transition-all"
                  />
                </div>
              </div>

              {/* Descriere */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#6b7c99]">
                    Detaliază problema întâmpinată
                  </label>
                  <span className="text-[11px] text-[#8a99ad]">Intervenție prioritară</span>
                </div>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descrieți pe scurt problema: ex. aerul condiționat face zgomot, presiune scăzută la apă caldă..."
                  className="w-full px-4 py-3 rounded-2xl border border-[#dce4ef] bg-[#f8fafd] focus:bg-white text-sm text-[#0d2c5c] focus:outline-none focus:border-[#0d2c5c] focus:ring-2 focus:ring-[#0d2c5c]/15 resize-none transition-all"
                />
              </div>
            </form>
          )}
        </div>

        {/* Footer în stilul Casa Esy */}
        {!submittedTicket && (
          <div className="flex items-center justify-end gap-2.5 border-t border-[#eef2f7] bg-[#f8fafd] px-6 sm:px-7 py-4 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-[#dce4ef] bg-white px-5 py-2.5 text-[11.5px] font-bold uppercase tracking-[0.14em] text-[#0d2c5c] hover:bg-[#f1f5f9] transition-colors cursor-pointer"
            >
              Anulează
            </button>
            <button
              type="submit"
              form="maintenance-report-form"
              disabled={submitting}
              className="rounded-full bg-[#0d2c5c] hover:bg-[#133b7a] px-6 py-2.5 text-[11.5px] font-bold uppercase tracking-[0.14em] text-white flex items-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              <Send size={13} />
              <span>{submitting ? "Se transmite..." : "Trimite solicitarea"}</span>
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
