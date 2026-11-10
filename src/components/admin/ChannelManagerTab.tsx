import React, { useEffect, useState } from "react";
import {
  Globe,
  RefreshCw,
  Zap,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  DollarSign,
  TrendingUp,
  Building2,
  Calendar,
  Layers,
  Sparkles,
  ShieldCheck,
  Check,
} from "lucide-react";
import { apiFetch } from "../../lib/api";
import { useToast } from "../Toast";

interface ChannelData {
  id: number;
  channel_name: string;
  display_name: string;
  status: string;
  commission_rate: number;
  rate_markup_percent: number;
  ical_export_url?: string | null;
  ical_import_url?: string | null;
  last_sync_at?: string | null;
  total_bookings_imported: number;
  total_revenue_imported: number;
}

interface ParityRow {
  room_id: string;
  room_title: string;
  capacity: number;
  direct_price: number;
  booking_price: number;
  booking_markup: number;
  airbnb_price: number;
  airbnb_markup: number;
  expedia_price: number;
  expedia_markup: number;
  direct_savings: number;
}

interface SyncLog {
  id: number;
  channel_name: string;
  event_type: string;
  details: string;
  status: string;
  created_at?: string | null;
}

interface SimulatedBookingResult {
  booking_id: string;
  booking_code: string;
  channel: string;
  external_reference: string;
  room_title: string;
  unit_number: string;
  guest_name: string;
  check_in: string;
  check_out: string;
  nights: number;
  total_price: number;
  status: string;
}

export default function ChannelManagerTab({
  onNavigateToTapeChart,
}: {
  onNavigateToTapeChart?: () => void;
}) {
  const { toast } = useToast();
  const [channels, setChannels] = useState<ChannelData[]>([]);
  const [parity, setParity] = useState<ParityRow[]>([]);
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncingAll, setSyncingAll] = useState(false);

  // Simulation Form State
  const [selectedChannel, setSelectedChannel] = useState<string>("booking.com");
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");
  const [guestName, setGuestName] = useState<string>("Hans Müller (Germania)");
  const [simulating, setSimulating] = useState(false);
  const [lastSimulated, setLastSimulated] = useState<SimulatedBookingResult | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [chData, parData, logData] = await Promise.all([
        apiFetch<ChannelData[]>("/admin/channel-manager/channels"),
        apiFetch<ParityRow[]>("/admin/channel-manager/parity"),
        apiFetch<SyncLog[]>("/admin/channel-manager/logs"),
      ]);
      setChannels(Array.isArray(chData) ? chData : []);
      setParity(Array.isArray(parData) ? parData : []);
      setLogs(Array.isArray(logData) ? logData : []);
    } catch (err: any) {
      toast(err?.message || "Eroare la încărcarea datelor Channel Manager.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSyncNow = async () => {
    setSyncingAll(true);
    try {
      await apiFetch("/admin/channel-manager/sync-now", { method: "POST" });
      toast("Sincronizare live completă cu Booking.com, Airbnb și Expedia efectuată!", "success");
      await loadData();
    } catch (err: any) {
      toast(err?.message || "Eroare la sincronizare.", "error");
    } finally {
      setSyncingAll(false);
    }
  };

  const handleSimulate = async () => {
    setSimulating(true);
    try {
      const result = await apiFetch<SimulatedBookingResult>(
        "/admin/channel-manager/simulate-booking",
        {
          method: "POST",
          body: JSON.stringify({
            channel: selectedChannel,
            room_id: selectedRoomId || undefined,
            guest_name: guestName || undefined,
          }),
        }
      );
      setLastSimulated(result);
      toast(
        `Rezervarea ${result.channel.toUpperCase()} #${result.booking_code} (${result.external_reference}) a fost injectată în PMS Tape Chart!`,
        "success"
      );
      await loadData();
    } catch (err: any) {
      toast(err?.message || "Eroare la simularea rezervării.", "error");
    } finally {
      setSimulating(false);
    }
  };

  const copyIcal = (url?: string | null) => {
    if (!url) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      toast("Link-ul feed-ului iCal a fost copiat în clipboard!", "success");
    }
  };

  const getChannelStyle = (channelName: string) => {
    switch (channelName) {
      case "booking.com":
        return {
          name: "Booking.com",
          badgeBg: "bg-[#003580] text-white",
          border: "border-[#003580]/30 hover:border-[#003580]",
          iconBg: "bg-[#003580]",
          accentColor: "#003580",
          tag: "OTA #1 Global",
        };
      case "airbnb":
        return {
          name: "Airbnb",
          badgeBg: "bg-[#FF385C] text-white",
          border: "border-[#FF385C]/30 hover:border-[#FF385C]",
          iconBg: "bg-[#FF385C]",
          accentColor: "#FF385C",
          tag: "Vacanțe & Apartamente",
        };
      case "expedia":
      default:
        return {
          name: "Expedia Partner",
          badgeBg: "bg-[#002244] text-[#ffc600]",
          border: "border-[#ffc600]/40 hover:border-[#ffc600]",
          iconBg: "bg-[#002244]",
          accentColor: "#002244",
          tag: "Corporate & SUA",
        };
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#0d2c5c]/10">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] uppercase text-[#c69a3f] mb-1">
            <Globe size={14} className="text-[#c69a3f] animate-pulse" />
            <span>Distribuție canale externe și sincronizare OTA</span>
          </div>
          <h2 className="font-['Outfit',sans-serif] text-[28px] sm:text-[34px] font-bold text-[#0d2c5c] leading-tight">
            Sincronizare channel manager (Booking.com și Airbnb)
          </h2>
          <p className="text-[13.5px] text-[#64748b] mt-0.5 max-w-2xl font-['Plus_Jakarta_Sans',sans-serif]">
            Sincronizare bidirecțională de tarife și disponibilitate. Simulează primirea unei rezervări externe în timp real pentru a vedea blocarea automată a camerei în PMS.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleSyncNow}
            disabled={syncingAll}
            className="px-5 py-2.5 rounded-[14px] bg-[#0d2c5c] hover:bg-[#07203f] text-white text-[12.5px] font-bold flex items-center gap-2 shadow-[0_4px_16px_rgba(13,44,92,0.18)] transition active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw size={14} className={syncingAll ? "animate-spin" : ""} />
            <span>{syncingAll ? "Se sincronizează..." : "Sincronizează canalele acum"}</span>
          </button>
        </div>
      </div>

      {/* ── CANALE OTA ACTIVE CARDS ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {channels.map((c) => {
          const style = getChannelStyle(c.channel_name);
          return (
            <div
              key={c.id}
              className={`p-6 rounded-[24px] bg-white border ${style.border} shadow-[0_10px_35px_rgba(13,44,92,0.06)] transition-all flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`px-3 py-1 rounded-[10px] text-[12px] font-extrabold uppercase tracking-wider ${style.badgeBg} shadow-xs`}
                    >
                      {style.name}
                    </span>
                    <span className="text-[11px] font-bold text-[#64748b]">
                      {style.tag}
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10.5px] font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Conectat</span>
                  </span>
                </div>

                <div className="space-y-2 mt-4 font-['Plus_Jakarta_Sans',sans-serif]">
                  <div className="flex items-center justify-between text-[12.5px]">
                    <span className="text-[#64748b]">Comision OTA:</span>
                    <span className="font-bold text-[#0d2c5c]">{c.commission_rate}%</span>
                  </div>
                  <div className="flex items-center justify-between text-[12.5px]">
                    <span className="text-[#64748b]">Adaos tarifar (Markup):</span>
                    <span className="font-bold text-[#00a896]">+{c.rate_markup_percent}%</span>
                  </div>
                  <div className="flex items-center justify-between text-[12.5px]">
                    <span className="text-[#64748b]">Rezervări preluate:</span>
                    <span className="font-bold text-[#0d2c5c]">{c.total_bookings_imported}</span>
                  </div>
                  <div className="flex items-center justify-between text-[12.5px]">
                    <span className="text-[#64748b]">Venit brut importat:</span>
                    <span className="font-bold text-[#d97706]">
                      {c.total_revenue_imported.toLocaleString("ro-RO")} RON
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-[#e1e8f0] flex items-center justify-between">
                <span className="text-[11px] text-[#64748b] truncate max-w-[170px]">
                  Feed iCal Live
                </span>
                <button
                  type="button"
                  onClick={() => copyIcal(c.ical_export_url)}
                  className="inline-flex items-center gap-1.5 text-[11.5px] font-bold text-[#0284c7] hover:underline"
                >
                  <Copy size={12} />
                  <span>Copiază Link iCal</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── THE WOW FEATURE: SIMULATOR REZERVARE LIVE DE PE BOOKING / AIRBNB ── */}
      <div className="p-6 sm:p-8 rounded-[28px] bg-gradient-to-tr from-[#071d3d] via-[#0d2c5c] to-[#0b2853] text-white shadow-2xl border border-[#00a896]/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#00a896]/15 blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 text-[10.5px] font-bold tracking-[0.25em] uppercase text-[#c69a3f] mb-2">
              <Zap size={14} className="text-[#c69a3f] animate-pulse" />
              <span>Funcție Live Demo · Efect WOW pentru Prezentare</span>
            </div>
            <h3 className="font-['Cormorant_Garamond',serif] text-[28px] sm:text-[34px] font-normal leading-tight">
              Simulează o Rezervare Nouă de pe <em className="italic text-[#c69a3f]">Canalele OTA</em>
            </h3>
            <p className="mt-2 text-[13.5px] text-white/80 leading-relaxed font-['Plus_Jakarta_Sans',sans-serif]">
              Apasă butonul de mai jos pentru a declanșa o simulare de webhook. Sistemul va genera instant o rezervare externă, va atribui o cameră fizică, va calcula prețul cu markup și va actualiza în timp real <strong>Diagrama de Ocupare (Tape Chart)</strong>.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              {[
                { key: "booking.com", label: "Booking.com", col: "bg-[#003580] hover:bg-[#002244]" },
                { key: "airbnb", label: "Airbnb", col: "bg-[#FF385C] hover:bg-[#e0314f]" },
                { key: "expedia", label: "Expedia", col: "bg-[#ffc600] text-[#002244] hover:bg-[#e6b200]" },
              ].map((btn) => (
                <button
                  key={btn.key}
                  type="button"
                  onClick={() => setSelectedChannel(btn.key)}
                  className={`px-4 py-2 rounded-[12px] text-[12px] font-extrabold uppercase tracking-wider transition shadow-sm ${
                    selectedChannel === btn.key
                      ? "ring-2 ring-white scale-105 " + btn.col
                      : "bg-white/10 text-white/80 hover:bg-white/20"
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Formular configurare & Buton acțiune */}
          <div className="w-full lg:max-w-md bg-white/10 backdrop-blur-md p-5 rounded-[22px] border border-white/15 space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-white/70 mb-1 font-['Plus_Jakarta_Sans',sans-serif]">
                Cameră Țintă:
              </label>
              <select
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-[12px] bg-slate-900/80 border border-white/20 text-white text-[13px] outline-none"
              >
                <option value="">Alege automat prima cameră disponibilă</option>
                {parity.map((r) => (
                  <option key={r.room_id} value={r.room_id}>
                    {r.room_title} ({r.direct_price} RON/noapte)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-white/70 mb-1 font-['Plus_Jakarta_Sans',sans-serif]">
                Oaspete Străin Simulat:
              </label>
              <select
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-[12px] bg-slate-900/80 border border-white/20 text-white text-[13px] outline-none"
              >
                <option value="Hans Müller (Germania)">🇩🇪 Hans Müller (Germania)</option>
                <option value="Sophie Laurent (Franța)">🇫🇷 Sophie Laurent (Franța)</option>
                <option value="John Smith (Marea Britanie)">🇬🇧 John Smith (Marea Britanie)</option>
                <option value="Matteo Rossi (Italia)">🇮🇹 Matteo Rossi (Italia)</option>
                <option value="Alexander Lindqvist (Suedia)">🇸🇪 Alexander Lindqvist (Suedia)</option>
              </select>
            </div>

            <button
              type="button"
              disabled={simulating}
              onClick={handleSimulate}
              className="w-full h-12 rounded-[14px] bg-gradient-to-r from-[#c69a3f] to-[#f59e0b] hover:brightness-105 text-[#0d2c5c] font-['Outfit',sans-serif] text-[15px] font-extrabold flex items-center justify-center gap-2 shadow-[0_8px_25px_rgba(198,154,63,0.35)] transition active:scale-95 disabled:opacity-50"
            >
              <Zap size={16} />
              <span>
                {simulating
                  ? "Se generează rezervarea..."
                  : `Injectează Rezervare Live de pe ${selectedChannel.toUpperCase()}`}
              </span>
            </button>
          </div>
        </div>

        {/* FEEDBACK REZERVAT LIVE PREVIEW */}
        {lastSimulated && (
          <div className="mt-6 pt-5 border-t border-white/15 bg-white/5 p-4 rounded-[18px] flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 flex items-center justify-center shrink-0">
                <Check size={20} />
              </div>
              <div>
                <p className="font-bold text-[14px] text-white">
                  Rezervare Confirmată: #{lastSimulated.booking_code} (Ref. {lastSimulated.external_reference})
                </p>
                <p className="text-[12px] text-white/70">
                  {lastSimulated.guest_name} · {lastSimulated.room_title} (Camera {lastSimulated.unit_number}) · {lastSimulated.nights} nopți · {lastSimulated.total_price} RON
                </p>
              </div>
            </div>

            {onNavigateToTapeChart && (
              <button
                type="button"
                onClick={onNavigateToTapeChart}
                className="px-4 py-2 rounded-[12px] bg-white text-[#0d2c5c] text-[12px] font-bold hover:bg-slate-100 transition shrink-0 flex items-center gap-1.5 shadow-sm"
              >
                <span>Deschide Tape Chart (Diagramă PMS)</span>
                <ArrowRight size={13} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── TABEL PARITATE TARIFARĂ (RATE PARITY MATRIX) ── */}
      <div className="p-6 sm:p-7 rounded-[24px] bg-white border border-[#e1e8f0] shadow-[0_10px_35px_rgba(13,44,92,0.06)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] uppercase text-[#c69a3f] mb-1">
              <DollarSign size={14} />
              <span>Analiză Paritate & Avantaj Rezervare Directă</span>
            </div>
            <h3 className="font-['Outfit',sans-serif] text-[20px] font-bold text-[#0d2c5c]">
              Matrice de Paritate Tarifară (Direct vs. OTA)
            </h3>
          </div>
          <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-800 border border-sky-200 text-[11.5px] font-bold flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-[#0284c7]" />
            <span>Best Rate Guarantee pe site-ul oficial</span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#e1e8f0] text-[11px] font-bold uppercase tracking-wider text-[#64748b]">
                <th className="py-3 px-3">Cameră / Suită</th>
                <th className="py-3 px-3 text-[#0d2c5c]">Tarif Direct (Casa Esy)</th>
                <th className="py-3 px-3 text-[#003580]">Booking.com (+15%)</th>
                <th className="py-3 px-3 text-[#FF385C]">Airbnb (+18%)</th>
                <th className="py-3 px-3 text-[#002244]">Expedia (+18%)</th>
                <th className="py-3 px-3 text-right text-emerald-700">Economie Rezervare Directă</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e1e8f0] text-[13px]">
              {parity.map((row) => (
                <tr key={row.room_id} className="hover:bg-[#f8fafc] transition-colors">
                  <td className="py-3.5 px-3">
                    <p className="font-bold text-[#0d2c5c] font-['Plus_Jakarta_Sans',sans-serif]">
                      {row.room_title}
                    </p>
                    <span className="text-[11px] text-[#64748b]">Capacitate: {row.capacity} pers.</span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-extrabold text-[13.5px]">
                      {row.direct_price} RON
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-[#003580]">
                    {row.booking_price} RON
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-[#FF385C]">
                    {row.airbnb_price} RON
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-[#002244]">
                    {row.expedia_price} RON
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-extrabold text-[12px]">
                      -{row.direct_savings} RON / noapte
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── JURNAL ACTIVITATE SINCRONIZARE LIVE ── */}
      <div className="p-6 rounded-[24px] bg-white border border-[#e1e8f0] shadow-[0_10px_35px_rgba(13,44,92,0.06)]">
        <h3 className="font-['Outfit',sans-serif] text-[18px] font-bold text-[#0d2c5c] mb-4">
          Jurnal Sincronizări & Activitate Channel Manager ({logs.length})
        </h3>
        <div className="space-y-2.5 max-h-72 overflow-y-auto">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-[14px] bg-[#f8fafc] border border-[#e1e8f0] flex items-center justify-between gap-3 text-[12.5px]"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="font-bold text-[#0d2c5c] uppercase text-[11px] tracking-wider">
                  [{log.channel_name}]
                </span>
                <span className="text-[#334155]">{log.details}</span>
              </div>
              <span className="text-[11px] text-[#64748b] shrink-0">
                {log.created_at ? new Date(log.created_at).toLocaleTimeString("ro-RO") : "Acum"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
