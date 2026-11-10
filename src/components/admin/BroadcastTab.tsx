import React, { useEffect, useState } from "react";
import {
  Radio,
  Sparkles,
  Calendar,
  Info,
  AlertTriangle,
  Send,
  Plus,
  Trash2,
  CheckCircle2,
  Eye,
  RefreshCw,
  Clock,
  Users,
  ExternalLink,
  Flame,
  Wine,
  Waves,
} from "lucide-react";
import { apiFetch } from "../../lib/api";
import { useToast } from "../Toast";

interface BroadcastItem {
  id: number;
  title: string;
  message: string;
  type: "offer" | "event" | "announcement" | "urgent" | string;
  target_audience: string;
  cta_text?: string | null;
  cta_link?: string | null;
  priority: string;
  is_active: boolean;
  expires_at?: string | null;
  created_at?: string | null;
}

const PRESET_TEMPLATES = [
  {
    name: "Cină Festivă pe Ponton",
    icon: Wine,
    title: "Cină Festivă & Muzică Live pe Ponton",
    message:
      "În această seară, începând cu ora 19:30, vă invităm la cina festivă cu platouri mediteraneene și selecție de vinuri dobrogene.",
    type: "offer",
    target_audience: "all",
    cta_text: "Rezervă Masă",
    cta_link: "/places",
    priority: "high",
  },
  {
    name: "Happy Hour Beach Bar",
    icon: Flame,
    title: "Happy Hour la Beach Bar (2+1 Gratuit)",
    message:
      "Comandă două cocktailuri Signature la barul de pe plajă între orele 16:00 și 18:00 și îl primești pe al treilea din partea casei!",
    type: "event",
    target_audience: "all",
    cta_text: "Vezi Meniul Barului",
    cta_link: "/places",
    priority: "normal",
  },
  {
    name: "Ritual Spa & Masaj",
    icon: Waves,
    title: "Sesiune Relaxantă la Imperial Spa",
    message:
      "Au mai rămas 3 sloturi libere pentru masaj suedez și aromaterapie în această după-amiază. Oaspeții beneficiază de 20% discount.",
    type: "offer",
    target_audience: "checked_in",
    cta_text: "Rezervă la Spa",
    cta_link: "/facilitati",
    priority: "normal",
  },
  {
    name: "Anunț Program Piscină",
    icon: Info,
    title: "Program Piscină Infinity & Jacuzzi",
    message:
      "Vă informăm că piscina exterioară infinity este deschisă până la ora 22:00, cu prosoape proaspete disponibile la cabana de plajă.",
    type: "announcement",
    target_audience: "all",
    cta_text: "Facilități Resort",
    cta_link: "/facilitati",
    priority: "normal",
  },
];

export default function BroadcastTab() {
  const { toast } = useToast();
  const [broadcasts, setBroadcasts] = useState<BroadcastItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<string>("offer");
  const [targetAudience, setTargetAudience] = useState("all");
  const [priority, setPriority] = useState("normal");
  const [ctaText, setCtaText] = useState("");
  const [ctaLink, setCtaLink] = useState("");
  const [durationHours, setDurationHours] = useState("24");

  const loadBroadcasts = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<BroadcastItem[]>("/admin/broadcasts");
      setBroadcasts(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast(err?.message || "Nu s-au putut încărca notificările.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBroadcasts();
  }, []);

  const handleApplyPreset = (p: (typeof PRESET_TEMPLATES)[0]) => {
    setTitle(p.title);
    setMessage(p.message);
    setType(p.type);
    setTargetAudience(p.target_audience);
    setCtaText(p.cta_text);
    setCtaLink(p.cta_link);
    setPriority(p.priority);
    toast(`Șablonul «${p.name}» a fost încărcat în formular.`, "success");
  };

  const handleCreateBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast("Titlul și mesajul sunt obligatorii.", "error");
      return;
    }

    setSubmitting(true);
    try {
      let expires_at: string | null = null;
      if (durationHours !== "never") {
        const h = parseInt(durationHours, 10);
        if (!isNaN(h) && h > 0) {
          const exp = new Date(Date.now() + h * 3600 * 1000);
          expires_at = exp.toISOString();
        }
      }

      const payload = {
        title: title.trim(),
        message: message.trim(),
        type,
        target_audience: targetAudience,
        priority,
        cta_text: ctaText.trim() || null,
        cta_link: ctaLink.trim() || null,
        is_active: true,
        expires_at,
      };

      const res = await apiFetch<BroadcastItem>("/admin/broadcasts", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      toast("Notificarea a fost transmisă live tuturor oaspeților!", "success");
      setBroadcasts((prev) => [res, ...prev.filter((b) => b.id !== res.id)]);

      // Reset form
      setTitle("");
      setMessage("");
      setCtaText("");
      setCtaLink("");
    } catch (err: any) {
      toast(err?.message || "Eroare la crearea notificării.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id: number) => {
    try {
      const updated = await apiFetch<BroadcastItem>(
        `/admin/broadcasts/${id}/toggle`,
        { method: "PATCH" }
      );
      setBroadcasts((prev) =>
        prev.map((b) => (b.id === id ? { ...b, is_active: updated.is_active } : b))
      );
      toast(
        updated.is_active
          ? "Notificarea a fost reactivată live."
          : "Notificarea a fost dezactivată.",
        "success"
      );
    } catch (err: any) {
      toast(err?.message || "Eroare la comutarea statusului.", "error");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Sigur doriți să ștergeți definitiv această notificare?")) return;
    try {
      await apiFetch(`/admin/broadcasts/${id}`, { method: "DELETE" });
      setBroadcasts((prev) => prev.filter((b) => b.id !== id));
      toast("Notificarea a fost ștearsă.", "success");
    } catch (err: any) {
      toast(err?.message || "Eroare la ștergerea notificării.", "error");
    }
  };

  const getTypeBadge = (t: string) => {
    switch (t) {
      case "urgent":
        return {
          bg: "bg-red-50 text-red-700 border-red-200",
          icon: AlertTriangle,
          label: "Urgență",
        };
      case "event":
        return {
          bg: "bg-teal-50 text-teal-700 border-teal-200",
          icon: Calendar,
          label: "Eveniment",
        };
      case "announcement":
        return {
          bg: "bg-sky-50 text-sky-700 border-sky-200",
          icon: Info,
          label: "Anunț",
        };
      case "offer":
      default:
        return {
          bg: "bg-amber-50 text-amber-800 border-amber-200",
          icon: Sparkles,
          label: "Ofertă",
        };
    }
  };

  const activeCount = broadcasts.filter((b) => b.is_active).length;

  return (
    <div className="space-y-8 font-sans">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#0d2c5c]/10">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] uppercase text-[#c69a3f] mb-1">
            <Radio size={14} className="text-[#00a896] animate-pulse" />
            <span>Marketing Oaspeți & Alerte Live</span>
          </div>
          <h2 className="font-['Cormorant_Garamond',serif] text-[28px] sm:text-[34px] font-semibold text-[#0d2c5c] leading-tight">
            Centru de Notificări Push & Broadcast
          </h2>
          <p className="text-[13.5px] text-[#64748b] mt-0.5 max-w-2xl font-['Plus_Jakarta_Sans',sans-serif]">
            Trimite oferte speciale, invitații la evenimente sau anunțuri importante. Notificările apar instant pe ecranele oaspeților prin conexiune WebSocket în timp real.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[12px] font-['Plus_Jakarta_Sans',sans-serif] font-bold flex items-center gap-2 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{activeCount} alerte active live</span>
          </div>
          <button
            onClick={loadBroadcasts}
            disabled={loading}
            className="w-10 h-10 rounded-full border border-[#0d2c5c]/15 hover:border-[#0d2c5c] flex items-center justify-center text-[#0d2c5c] hover:bg-[#0d2c5c]/5 transition"
            title="Reîmprospătează"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* ── PRESETURI RAPIDE ── */}
      <div>
        <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-[#64748b] mb-3 font-['Plus_Jakarta_Sans',sans-serif]">
          Șabloane Rapide de Marketing (Apasă pentru pre-completare):
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRESET_TEMPLATES.map((p) => {
            const Icon = p.icon;
            return (
              <button
                key={p.name}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className="group p-3.5 rounded-[16px] border border-[#e1e8f0] bg-white hover:border-[#00a896] hover:shadow-md transition text-left flex items-start gap-3"
              >
                <div className="w-9 h-9 rounded-[12px] bg-[#f0f9ff] text-[#0284c7] group-hover:bg-[#00a896] group-hover:text-white flex items-center justify-center shrink-0 transition-colors shadow-xs">
                  <Icon size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-bold text-[#0d2c5c] truncate group-hover:text-[#00a896] transition-colors font-['Plus_Jakarta_Sans',sans-serif]">
                    {p.name}
                  </p>
                  <p className="text-[11px] text-[#64748b] truncate mt-0.5">
                    {p.type === "offer" ? "Ofertă Restaurant/Spa" : "Eveniment Resort"}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── GRID: COMPOSER FORM + LIVE PREVIEW ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-8 items-start">
        {/* COMPOSER CARD */}
        <div className="bg-white rounded-[24px] p-6 sm:p-7 border border-[#e1e8f0] shadow-[0_10px_35px_rgba(13,44,92,0.06)]">
          <div className="flex items-center gap-2 mb-5">
            <Send size={16} className="text-[#00a896]" />
            <h3 className="font-['Outfit',sans-serif] text-[18px] font-bold text-[#0d2c5c]">
              Compune Notificare Broadcast
            </h3>
          </div>

          <form onSubmit={handleCreateBroadcast} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold tracking-wider uppercase text-[#64748b] mb-1.5 font-['Plus_Jakarta_Sans',sans-serif]">
                Titlu Alertă *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Cină Festivă & Muzică Live pe Ponton"
                className="w-full px-4 py-2.5 rounded-[12px] border border-[#e1e8f0] focus:border-[#00a896] focus:outline-none text-[13.5px] text-[#0d2c5c] font-['Plus_Jakarta_Sans',sans-serif]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold tracking-wider uppercase text-[#64748b] mb-1.5 font-['Plus_Jakarta_Sans',sans-serif]">
                Mesaj Detaliat *
              </label>
              <textarea
                required
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Descrieți oferta sau anunțul pe scurt pentru oaspeți..."
                className="w-full px-4 py-2.5 rounded-[12px] border border-[#e1e8f0] focus:border-[#00a896] focus:outline-none text-[13.5px] text-[#0d2c5c] font-['Plus_Jakarta_Sans',sans-serif]"
              />
            </div>

            {/* Tip & Public Țintă */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold tracking-wider uppercase text-[#64748b] mb-1.5 font-['Plus_Jakarta_Sans',sans-serif]">
                  Tip Notificare
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-[12px] border border-[#e1e8f0] focus:border-[#00a896] focus:outline-none text-[13px] text-[#0d2c5c] font-['Plus_Jakarta_Sans',sans-serif] bg-white"
                >
                  <option value="offer">✨ Ofertă Specială (Auriu)</option>
                  <option value="event">🎉 Eveniment Hotel (Turcoaz)</option>
                  <option value="announcement">ℹ️ Anunț Important (Azur)</option>
                  <option value="urgent">🚨 Urgență / Mentenanță (Roșu)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold tracking-wider uppercase text-[#64748b] mb-1.5 font-['Plus_Jakarta_Sans',sans-serif]">
                  Public Țintă
                </label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-[12px] border border-[#e1e8f0] focus:border-[#00a896] focus:outline-none text-[13px] text-[#0d2c5c] font-['Plus_Jakarta_Sans',sans-serif] bg-white"
                >
                  <option value="all">Toți vizitatorii & oaspeții</option>
                  <option value="checked_in">Doar oaspeții cazați în prezent</option>
                  <option value="vip">Oaspeți VIP / Membri Club</option>
                </select>
              </div>
            </div>

            {/* Buton CTA Opțional */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold tracking-wider uppercase text-[#64748b] mb-1.5 font-['Plus_Jakarta_Sans',sans-serif]">
                  Text Buton Acțiune (CTA)
                </label>
                <input
                  type="text"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  placeholder="Ex: Rezervă Masă"
                  className="w-full px-4 py-2.5 rounded-[12px] border border-[#e1e8f0] focus:border-[#00a896] focus:outline-none text-[13px] text-[#0d2c5c] font-['Plus_Jakarta_Sans',sans-serif]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold tracking-wider uppercase text-[#64748b] mb-1.5 font-['Plus_Jakarta_Sans',sans-serif]">
                  Link Destinație CTA
                </label>
                <input
                  type="text"
                  value={ctaLink}
                  onChange={(e) => setCtaLink(e.target.value)}
                  placeholder="Ex: /places sau /facilitati"
                  className="w-full px-4 py-2.5 rounded-[12px] border border-[#e1e8f0] focus:border-[#00a896] focus:outline-none text-[13px] text-[#0d2c5c] font-['Plus_Jakarta_Sans',sans-serif]"
                />
              </div>
            </div>

            {/* Durată / Expirare */}
            <div>
              <label className="block text-[11px] font-bold tracking-wider uppercase text-[#64748b] mb-1.5 font-['Plus_Jakarta_Sans',sans-serif]">
                Valabilitate Notificare
              </label>
              <select
                value={durationHours}
                onChange={(e) => setDurationHours(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-[12px] border border-[#e1e8f0] focus:border-[#00a896] focus:outline-none text-[13px] text-[#0d2c5c] font-['Plus_Jakarta_Sans',sans-serif] bg-white"
              >
                <option value="2">2 ore (eveniment rapid / promoție fulger)</option>
                <option value="6">6 ore (după-amiază / seară)</option>
                <option value="24">24 ore (o zi întreagă)</option>
                <option value="48">48 ore (weekend)</option>
                <option value="never">Fără expirare automată (activă până la dezactivare)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 h-12 rounded-[14px] bg-gradient-to-r from-[#00a896] to-[#0284c7] hover:brightness-105 text-white text-[13.5px] font-['Plus_Jakarta_Sans',sans-serif] font-bold flex items-center justify-center gap-2 shadow-[0_8px_25px_rgba(0,168,150,0.3)] transition active:scale-[0.99] disabled:opacity-50"
            >
              <Send size={15} />
              <span>{submitting ? "Se transmite..." : "Transmite Acum Live către Oaspeți"}</span>
            </button>
          </form>
        </div>

        {/* LIVE INTERACTIVE PREVIEW */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Eye size={16} className="text-[#c69a3f]" />
            <h3 className="font-['Outfit',sans-serif] text-[18px] font-bold text-[#0d2c5c]">
              Previzualizare în Timp Real pe Ecranul Oaspetelui
            </h3>
          </div>
          <p className="text-[12.5px] text-[#64748b] font-['Plus_Jakarta_Sans',sans-serif]">
            Așa va apărea alerta instant în colțul din dreapta-jos pe telefoanele și laptopurile oaspeților cazați:
          </p>

          <div className="p-6 rounded-[24px] bg-slate-900/90 border border-slate-700/60 shadow-2xl relative overflow-hidden">
            <div className="absolute top-3 right-3 text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
              Guest Screen Preview
            </div>

            {/* The mock alert card */}
            <div className="mt-4 rounded-[20px] bg-[#0a1d3a] border border-[#c69a3f]/40 p-5 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#c69a3f] to-[#f59e0b]" />

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/15 shrink-0 text-[#e6be65]">
                  <Sparkles size={18} />
                </div>
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#c69a3f]/15 border border-[#c69a3f]/30 text-[#e6be65] flex items-center gap-1.5">
                      <Radio size={11} className="animate-pulse" />
                      {type === "urgent"
                        ? "NOTIFICARE URGENTĂ"
                        : type === "event"
                          ? "EVENIMENT HOTEL"
                          : type === "announcement"
                            ? "ANUNȚ IMPORTANT"
                            : "OFERTĂ SPECIALĂ"}
                    </span>
                  </div>
                  <h4 className="font-['Outfit',sans-serif] text-[15px] font-bold text-white leading-snug">
                    {title || "Titlul notificării tale va apărea aici"}
                  </h4>
                  <p className="mt-1 text-[12.5px] text-white/80 font-['Plus_Jakarta_Sans',sans-serif] leading-relaxed line-clamp-3">
                    {message || "Mesajul detaliat cu invitația la restaurant, oferta la bar sau anunțul recepției va fi afișat elegant."}
                  </p>
                  {ctaText && (
                    <div className="mt-3">
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[10px] bg-gradient-to-r from-[#c69a3f] to-[#f59e0b] text-white text-[11.5px] font-bold shadow-sm">
                        <span>{ctaText}</span>
                        <span>→</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Conexiune WebSocket Live Activă
              </span>
              <span>Casa Esy Digital Guest Portal</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── TABELUL CU NOTIFICĂRI EMISE ── */}
      <div className="bg-white rounded-[24px] border border-[#e1e8f0] p-6 shadow-[0_10px_35px_rgba(13,44,92,0.06)]">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Radio size={16} className="text-[#0d2c5c]" />
            <h3 className="font-['Outfit',sans-serif] text-[18px] font-bold text-[#0d2c5c]">
              Jurnal Broadcast & Alerte ({broadcasts.length})
            </h3>
          </div>
        </div>

        {broadcasts.length === 0 ? (
          <div className="py-12 text-center text-[#64748b]">
            <Radio size={36} className="mx-auto text-slate-300 mb-3" />
            <p className="font-semibold text-[14px]">Nu există notificări transmise încă.</p>
            <p className="text-[12.5px] mt-1">Folosește formularul de mai sus pentru a trimite primul anunț live către oaspeți.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#e1e8f0] text-[11px] font-bold uppercase tracking-wider text-[#64748b]">
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Tip</th>
                  <th className="py-3 px-3">Titlu & Mesaj</th>
                  <th className="py-3 px-3">Audiență / CTA</th>
                  <th className="py-3 px-3">Data emiterii</th>
                  <th className="py-3 px-3 text-right">Acțiuni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e1e8f0] text-[13px]">
                {broadcasts.map((b) => {
                  const badge = getTypeBadge(b.type);
                  const Icon = badge.icon;
                  return (
                    <tr key={b.id} className="hover:bg-[#f8fafc] transition-colors">
                      <td className="py-3.5 px-3">
                        <button
                          type="button"
                          onClick={() => handleToggle(b.id)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition ${
                            b.is_active
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : "bg-slate-100 text-slate-500 border-slate-200"
                          }`}
                          title="Apasă pentru activare / dezactivare"
                        >
                          {b.is_active ? "● Activ Live" : "Inactiv"}
                        </button>
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badge.bg}`}
                        >
                          <Icon size={12} />
                          <span>{badge.label}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-3 max-w-xs">
                        <p className="font-bold text-[#0d2c5c] font-['Plus_Jakarta_Sans',sans-serif]">
                          {b.title}
                        </p>
                        <p className="text-[12px] text-[#64748b] truncate mt-0.5">
                          {b.message}
                        </p>
                      </td>
                      <td className="py-3.5 px-3">
                        <p className="text-[12px] text-[#0d2c5c] font-semibold">
                          {b.target_audience === "checked_in"
                            ? "Doar oaspeți cazați"
                            : b.target_audience === "vip"
                              ? "Membri VIP"
                              : "Toți vizitatorii"}
                        </p>
                        {b.cta_text && (
                          <span className="text-[11px] text-[#00a896] font-semibold mt-0.5 flex items-center gap-1">
                            <span>{b.cta_text}</span>
                            <span>({b.cta_link})</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-[12px] text-[#64748b] whitespace-nowrap">
                        {b.created_at
                          ? new Date(b.created_at).toLocaleString("ro-RO", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggle(b.id)}
                            className="text-[12px] font-semibold text-[#0284c7] hover:underline"
                          >
                            {b.is_active ? "Oprește" : "Pornește"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(b.id)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition"
                            title="Șterge definitiv"
                          >
                            <Trash2 size={14} />
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
    </div>
  );
}
