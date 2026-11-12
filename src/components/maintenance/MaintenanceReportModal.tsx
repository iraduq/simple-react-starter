import React, { useState } from "react";
import {
  X,
  Wrench,
  Wind,
  Droplets,
  Lightbulb,
  Tv,
  Sparkles,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Send,
  User,
  Phone,
  ShieldCheck,
  ChevronRight,
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
    color: "from-sky-500 to-blue-600",
  },
  {
    id: "plumbing",
    name: "Instalații Sanitare",
    desc: "Presiune scăzută la duș, robinet sau scurgere",
    icon: Droplets,
    color: "from-cyan-500 to-teal-600",
  },
  {
    id: "electrical",
    name: "Electricitate & Becuri",
    desc: "Bec ars, priză sau întrerupător nefuncțional",
    icon: Lightbulb,
    color: "from-amber-500 to-orange-600",
  },
  {
    id: "tv_wifi",
    name: "Smart TV & Wi-Fi",
    desc: "Semnal Wi-Fi slab, aplicații TV sau cablu",
    icon: Tv,
    color: "from-indigo-500 to-purple-600",
  },
  {
    id: "housekeeping",
    name: "Curățenie & Consumabile",
    desc: "Prosoape suplimentare, cosmetice sau curățenie",
    icon: Sparkles,
    color: "from-emerald-500 to-teal-700",
  },
  {
    id: "other",
    name: "Alte Defecțiuni",
    desc: "Ușă, seif, balcon sau mobilier",
    icon: Wrench,
    color: "from-slate-600 to-slate-800",
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
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [roomUnit, setRoomUnit] = useState(unitNumber || "Camera mea");
  const [guestName, setGuestName] = useState(defaultGuestName);
  const [guestPhone, setGuestPhone] = useState(defaultGuestPhone);
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
    const finalTitle = title.trim() || `Problemă ${catObj?.name || "Cameră"}`;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-[28px] max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-[#e1e8f0]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#c69a3f]/30 flex items-center justify-between bg-[#0d2c5c] text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-[#c69a3f]/15 flex items-center justify-center border border-[#c69a3f]/40 text-[#f3d48b]">
              <Wrench size={20} />
            </div>
            <div>
              <h3 className="font-['Outfit',sans-serif] text-[18px] sm:text-[20px] font-bold text-white leading-tight">
                Asistență Tehnică & Mentenanță
              </h3>
              <p className="text-[12px] text-slate-200/80">
                Raportează o problemă în cameră · Echipa Casa Esy intervine rapid
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#c69a3f]/30 text-white flex items-center justify-center transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 font-sans bg-[#fcfbf8]">
          {submittedTicket ? (
            /* ── TICKET CONFIRMED / LIVE TRACKER ── */
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 size={32} />
              </div>

              <div>
                <span className="px-3 py-1 rounded-full bg-[#fdf8ec] text-[#9c7624] border border-[#c69a3f]/40 text-[11px] font-mono font-bold tracking-wider">
                  Cod Tichet: #{submittedTicket.ticket_code}
                </span>
                <h4 className="font-['Outfit',sans-serif] text-[22px] font-bold text-[#0d2c5c] mt-2">
                  Solicitarea a fost transmisă departamentului!
                </h4>
                <p className="text-[13px] text-[#64748b] mt-1 max-w-md mx-auto">
                  Echipa de intervenție <strong>{submittedTicket.department === "mentenanta" ? "Mentenanță" : submittedTicket.department === "housekeeping" ? "Housekeeping" : "IT & Tehnic"}</strong> a primit notificarea ta.
                </p>
              </div>

              {/* Progress Steps */}
              <div className="p-4 rounded-[18px] bg-white border border-[#e1e8f0] text-left space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">
                  Urmărire În Timp Real:
                </p>

                <div className="space-y-2.5">
                  <div className="flex items-center gap-3 text-[12.5px] font-semibold text-emerald-700">
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">✓</span>
                    <span>1. Solicitare înregistrată în sistem</span>
                  </div>
                  <div className="flex items-center gap-3 text-[12.5px] font-semibold text-[#0d2c5c]">
                    <span className="w-5 h-5 rounded-full bg-[#c69a3f] text-[#0d2c5c] flex items-center justify-center text-[10px] font-bold animate-pulse">2</span>
                    <span>2. Alocare tehnician de serviciu (SLA: {submittedTicket.sla_minutes} min)</span>
                  </div>
                  <div className="flex items-center gap-3 text-[12.5px] text-[#94a3b8]">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-[10px] font-bold">3</span>
                    <span>3. Remediere la cameră & verificare</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-[12px] bg-[#0d2c5c] text-white text-[13px] font-bold hover:bg-[#143d7a] transition shadow-sm"
              >
                Am înțeles, mulțumesc
              </button>
            </div>
          ) : (
            /* ── INCIDENT REPORT FORM ── */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0d2c5c]/70 mb-2 font-['Plus_Jakarta_Sans',sans-serif]">
                  1. Alege Categoria Defecțiunii:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`p-3 rounded-[16px] border text-left transition flex flex-col justify-between ${
                          isSelected
                            ? "border-[#c69a3f] bg-[#fdf8ec] ring-2 ring-[#c69a3f]/25 shadow-xs"
                            : "border-[#e1e8f0] bg-white hover:border-[#c69a3f]/60 hover:bg-[#fdfaf4]"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-[10px] flex items-center justify-center mb-2 ${
                            isSelected
                              ? "bg-[#0d2c5c] text-[#f3d48b]"
                              : "bg-[#f8fafd] text-[#0d2c5c]"
                          }`}
                        >
                          <Icon size={16} />
                        </div>
                        <div>
                          <p className="font-['Outfit',sans-serif] text-[13px] font-bold text-[#0d2c5c] leading-tight">
                            {cat.name}
                          </p>
                          <p className="text-[10px] text-[#64748b] mt-0.5 line-clamp-1">
                            {cat.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Descriere */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0d2c5c]/70 mb-1 font-['Plus_Jakarta_Sans',sans-serif]">
                  2. Detaliază Problema Întâmpinată:
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Aerul condiționat face zgomot sau apa caldă nu are presiune..."
                  className="w-full px-3.5 py-2.5 rounded-[12px] border border-[#e1e8f0] bg-white focus:border-[#c69a3f] focus:ring-2 focus:ring-[#c69a3f]/15 text-[13px] text-[#0d2c5c] outline-none transition"
                />
              </div>

              {/* Urgență & Cameră */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0d2c5c]/70 mb-1 font-['Plus_Jakarta_Sans',sans-serif]">
                    Nivel de Urgență:
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 rounded-[12px] border border-[#e1e8f0] bg-white focus:border-[#c69a3f] text-[12.5px] font-bold text-[#0d2c5c] outline-none"
                  >
                    <option value="normal">Normal (Rezolvare în max 2 ore)</option>
                    <option value="high">Ridicată (Rezolvare în max 1 oră)</option>
                    <option value="urgent">Urgentă (Intervenție în max 30 min)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0d2c5c]/70 mb-1 font-['Plus_Jakarta_Sans',sans-serif]">
                    Număr Cameră / Suită:
                  </label>
                  <input
                    type="text"
                    required
                    value={roomUnit}
                    onChange={(e) => setRoomUnit(e.target.value)}
                    placeholder="Ex: Camera 204"
                    className="w-full px-3 py-2 rounded-[12px] border border-[#e1e8f0] bg-white focus:border-[#c69a3f] text-[12.5px] text-[#0d2c5c] font-bold outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-12 rounded-[14px] bg-[#0d2c5c] hover:bg-[#143d7a] border border-[#c69a3f]/30 text-white font-['Outfit',sans-serif] text-[15px] font-bold flex items-center justify-center gap-2 shadow-[0_8px_25px_rgba(13,44,92,0.22)] transition active:scale-95 disabled:opacity-50"
                >
                  <Send size={15} className="text-[#f3d48b]" />
                  <span>{submitting ? "Se transmite..." : "Trimite Solicitarea către Echipă"}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
