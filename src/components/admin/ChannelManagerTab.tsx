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
          tag: "Vacanțe și apartamente",
        };
      case "expedia":
      default:
        return {
          name: "Expedia Partner",
          badgeBg: "bg-[#002244] text-[#ffc600]",
          border: "border-[#ffc600]/40 hover:border-[#ffc600]",
          iconBg: "bg-[#002244]",
          accentColor: "#002244",
          tag: "Segment internațional",
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
                  Sincronizare iCal live
                </span>
                <button
                  type="button"
                  onClick={() => copyIcal(c.ical_export_url)}
                  className="inline-flex items-center gap-1.5 text-[11.5px] font-bold text-[#0284c7] hover:underline"
                >
                  <Copy size={12} />
                  <span>Copiază link iCal</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── SIMULATOR SINCRONIZARE REZERVARE EXTERNĂ ── */}
      <div className="p-6 sm:p-8 rounded-[24px] bg-white border border-[#e1e8f0] shadow-[0_10px_35px_rgba(13,44,92,0.06)] relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0d2c5c] via-[#c69a3f] to-[#0d2c5c]" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fdf8ed] border border-[#c69a3f]/30 text-[10.5px] font-bold tracking-[0.2em] uppercase text-[#a67c2e] mb-3">
              <Zap size={13} className="text-[#c69a3f]" />
              <span>Simulator Webhook &amp; Sincronizare OTA</span>
            </div>
            <h3 className="font-['Outfit',sans-serif] text-[22px] sm:text-[26px] font-bold text-[#0d2c5c] leading-tight">
              Simulare rezervare din canale externe
            </h3>
            <p className="mt-2 text-[13.5px] text-[#5b6e8d] leading-relaxed font-['Plus_Jakarta_Sans',sans-serif]">
              Testează fără un cont comercial activ pe Booking/Airbnb cum primește sistemul o rezervare externă: alocă automat prima unitate fizică liberă (fără suprapuneri), aplică adaosul canalului și actualizează instant prin WebSocket diagrama de ocupare.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              {[
                {
                  key: "booking.com",
                  label: "Booking.com",
                  active: "bg-[#003580] text-white border-[#003580] shadow-md",
                  idle: "bg-[#f8fafd] text-[#0d2c5c] border-[#dce4f0] hover:border-[#003580]/40",
                },
                {
                  key: "airbnb",
                  label: "Airbnb",
                  active: "bg-[#FF385C] text-white border-[#FF385C] shadow-md",
                  idle: "bg-[#f8fafd] text-[#0d2c5c] border-[#dce4f0] hover:border-[#FF385C]/40",
                },
                {
                  key: "expedia",
                  label: "Expedia",
                  active: "bg-[#c69a3f] text-white border-[#c69a3f] shadow-md",
                  idle: "bg-[#f8fafd] text-[#0d2c5c] border-[#dce4f0] hover:border-[#c69a3f]/50",
                },
              ].map((btn) => (
                <button
                  key={btn.key}
                  type="button"
                  onClick={() => setSelectedChannel(btn.key)}
                  className={`px-4 py-2 rounded-full border text-[12px] font-bold uppercase tracking-wider transition cursor-pointer ${
                    selectedChannel === btn.key ? btn.active : btn.idle
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Formular configurare & Buton acțiune */}
          <div className="w-full lg:max-w-md bg-[#f8fafd] p-5 rounded-[20px] border border-[#e1e8f0] space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#64748b] mb-1.5 font-['Plus_Jakarta_Sans',sans-serif]">
                Cameră țintă
              </label>
              <select
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-[12px] bg-white border border-[#dce4f0] text-[#0d2c5c] text-[13px] font-medium outline-none focus:border-[#0d2c5c]"
              >
                <option value="">Alocare automată (prima cameră liberă)</option>
                {parity.map((r) => (
                  <option key={r.room_id} value={r.room_id}>
                    {r.room_title} ({r.direct_price} RON/noapte)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#64748b] mb-1.5 font-['Plus_Jakarta_Sans',sans-serif]">
                Oaspete de test
              </label>
              <select
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-[12px] bg-white border border-[#dce4f0] text-[#0d2c5c] text-[13px] font-medium outline-none focus:border-[#0d2c5c]"
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
              className="w-full h-11 rounded-[12px] bg-[#0d2c5c] hover:bg-[#163d7a] text-white font-['Outfit',sans-serif] text-[14px] font-bold flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(13,44,92,0.18)] transition active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              <Zap size={15} className="text-[#f59e0b]" />
              <span>
                {simulating
                  ? "Se generează rezervarea..."
                  : `Trimite rezervare de test (${selectedChannel})`}
              </span>
            </button>
          </div>
        </div>

        {/* FEEDBACK REZERVAT LIVE PREVIEW */}
        {lastSimulated && (
          <div className="mt-6 pt-5 border-t border-[#e1e8f0] bg-emerald-50/70 p-4 rounded-[16px] border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center shrink-0">
                <Check size={20} />
              </div>
              <div>
                <p className="font-bold text-[14px] text-[#0d2c5c]">
                  Rezervare confirmată: #{lastSimulated.booking_code} (Ref. {lastSimulated.external_reference})
                </p>
                <p className="text-[12.5px] text-[#475569]">
                  {lastSimulated.guest_name} · {lastSimulated.room_title} (Camera {lastSimulated.unit_number}) · {lastSimulated.nights} nopți · {lastSimulated.total_price} RON
                </p>
              </div>
            </div>

            {onNavigateToTapeChart && (
              <button
                type="button"
                onClick={onNavigateToTapeChart}
                className="px-4 py-2 rounded-[10px] bg-white border border-[#dce4f0] text-[#0d2c5c] text-[12px] font-bold hover:bg-[#f8fafd] transition shrink-0 flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span>Deschide diagrama de ocupare</span>
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
              <span>Analiză de paritate și avantaj rezervare directă</span>
            </div>
            <h3 className="font-['Outfit',sans-serif] text-[20px] font-bold text-[#0d2c5c]">
              Matrice de paritate tarifară (Direct vs. OTA)
            </h3>
          </div>
          <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-800 border border-sky-200 text-[11.5px] font-bold flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-[#0284c7]" />
            <span>Garanția celui mai bun tarif pe site-ul oficial</span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#e1e8f0] text-[11px] font-bold uppercase tracking-wider text-[#64748b]">
                <th className="py-3 px-3">Cameră / suită</th>
                <th className="py-3 px-3 text-[#0d2c5c]">Tarif direct (Casa Esy)</th>
                <th className="py-3 px-3 text-[#003580]">Booking.com (+15%)</th>
                <th className="py-3 px-3 text-[#FF385C]">Airbnb (+18%)</th>
                <th className="py-3 px-3 text-[#002244]">Expedia (+18%)</th>
                <th className="py-3 px-3 text-right text-emerald-700">Economie rezervare directă</th>
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
          Jurnal de sincronizare și activitate channel manager ({logs.length})
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
