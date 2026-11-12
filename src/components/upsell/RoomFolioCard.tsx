import React, { useEffect, useState } from "react";
import {
  Receipt,
  Egg,
  Utensils,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { apiFetch } from "../../lib/api";
import { useToast } from "../Toast";
import BreakfastUpsellModal from "./BreakfastUpsellModal";

export interface FolioData {
  booking_id: string;
  booking_code: string;
  room_title: string;
  unit_number: string;
  guest_name: string;
  check_in: string;
  check_out: string;
  nights: number;
  guests_adults: number;
  guests_children: number;
  accommodation: {
    total: number;
    paid: number;
    status: string;
    is_paid: boolean;
  };
  addons: Array<{
    id: number;
    category: string;
    title: string;
    unit_price: number;
    quantity: number;
    total_price: number;
    served_date?: string | null;
    status: string;
    notes?: string | null;
  }>;
  addons_total: number;
  orders: Array<{
    id: string;
    order_code: string;
    location_label: string;
    payment_method: string;
    items: Array<{ title: string; price: number; qty: number }>;
    total_amount: number;
    status: string;
    is_on_folio: boolean;
    created_at?: string | null;
  }>;
  room_service_folio_total: number;
  table_orders_total: number;
  summary: {
    total_accommodation: number;
    total_addons: number;
    total_room_charges: number;
    grand_total: number;
    total_paid: number;
    balance_due: number;
    is_settled: boolean;
  };
}

interface RoomFolioCardProps {
  bookingId: string;
  bookingCode: string;
  nightsCount?: number;
  adultsCount?: number;
}

export default function RoomFolioCard({
  bookingId,
  bookingCode,
  nightsCount = 1,
  adultsCount = 2,
}: RoomFolioCardProps) {
  const { toast } = useToast();
  const [folio, setFolio] = useState<FolioData | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [settling, setSettling] = useState(false);

  const loadFolio = async () => {
    if (!bookingId && !bookingCode) return;
    setLoading(true);
    try {
      const data = await apiFetch<FolioData>(
        `/bookings/${bookingId || bookingCode}/folio`
      );
      setFolio(data);
    } catch {
      // quiet fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFolio();
  }, [bookingId, bookingCode]);

  const handleSettle = async () => {
    setSettling(true);
    try {
      await apiFetch(`/bookings/${bookingId || bookingCode}/settle-folio`, {
        method: "POST",
        body: JSON.stringify({ payment_method: "card" }),
      });
      toast("Soldul rămas a fost achitat cu succes!", "success");
      await loadFolio();
    } catch (err: any) {
      toast(err?.message || "Eroare la achitarea soldului.", "error");
    } finally {
      setSettling(false);
    }
  };

  if (!folio && loading) {
    return (
      <div className="bg-white rounded-[24px] p-6 border border-[#e1e8f0] animate-pulse">
        <div className="h-6 w-48 bg-slate-200 rounded mb-4" />
        <div className="h-16 bg-slate-100 rounded-xl" />
      </div>
    );
  }

  if (!folio) return null;

  const isZeroBalance = folio.summary.balance_due <= 0;

  return (
    <>
      <div className="bg-white rounded-[24px] p-6 sm:p-7 border border-[#e1e8f0] shadow-[0_10px_40px_rgba(13,44,92,0.06)] relative overflow-hidden font-sans">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#e1e8f0]">
          <div>
            <div className="flex items-center gap-2 text-[10.5px] font-bold tracking-[0.2em] uppercase text-[#c69a3f] mb-1">
              <Receipt size={14} />
              <span>Nota Camerei & Situație Financiară (Room Folio)</span>
            </div>
            <h3 className="font-['Outfit',sans-serif] text-[20px] sm:text-[22px] font-bold text-[#0d2c5c]">
              Soldul Curent al Sejurului Dumneavoastră
            </h3>
            <p className="text-[12.5px] text-[#6b7c99] mt-0.5 font-['Plus_Jakarta_Sans',sans-serif]">
              Rezervare #{folio.booking_code} · {folio.room_title} (
              {folio.unit_number})
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="px-4 py-2.5 rounded-[12px] bg-[#0d2c5c] hover:bg-[#133b7a] border border-[#c69a3f]/30 text-white text-[12.5px] font-bold flex items-center gap-1.5 shadow-sm transition active:scale-95"
            >
              <Plus size={14} className="text-[#e6b85c]" />
              <span>Adaugă Mic Dejun / Suplimente</span>
            </button>
            <button
              onClick={loadFolio}
              disabled={loading}
              title="Reîmprospătează nota camerei"
              className="w-9 h-9 rounded-[12px] border border-[#e1e8f0] hover:bg-slate-50 flex items-center justify-center text-[#64748b] transition"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* 3 Columns: Cazare, Mic Dejun & Suplimente, Consumație Restaurant/Bar */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Cazare */}
          <div className="p-4 rounded-[18px] bg-[#f8fafc] border border-[#e1e8f0] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">
                  Cazare ({folio.nights} {folio.nights === 1 ? "noapte" : "nopți"})
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold border ${
                    folio.accommodation.is_paid
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : "bg-amber-50 text-amber-800 border-amber-200"
                  }`}
                >
                  {folio.accommodation.is_paid ? "Achitat" : "De plată"}
                </span>
              </div>
              <p className="font-['Outfit',sans-serif] text-[22px] font-bold text-[#0d2c5c]">
                {folio.accommodation.total.toLocaleString("ro-RO")} RON
              </p>
              <p className="text-[11.5px] text-[#64748b] mt-1">
                {folio.guests_adults} adulți
                {folio.guests_children ? ` · ${folio.guests_children} copii` : ""}
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-200 text-[11px] text-[#64748b]">
              {folio.accommodation.is_paid
                ? "Achitat integral online la rezervare"
                : "Plată datorată la check-in/check-out"}
            </div>
          </div>

          {/* 2. Mic Dejun & Suplimente Upselling */}
          <div className="p-4 rounded-[18px] bg-[#f8fafc] border border-[#e1e8f0] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0d2c5c] flex items-center gap-1.5">
                  <Egg size={13} className="text-[#c69a3f]" />
                  <span>Mic Dejun & Suplimente</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-[#fdf8ec] text-[#9c7624] border border-[#c69a3f]/35">
                  {folio.addons.length} adăugate
                </span>
              </div>
              <p className="font-['Outfit',sans-serif] text-[22px] font-bold text-[#0d2c5c]">
                {folio.addons_total.toLocaleString("ro-RO")} RON
              </p>
              {folio.addons.length === 0 ? (
                <p className="text-[11.5px] text-[#64748b] mt-1">
                  Niciun pachet de mic dejun selectat încă.
                </p>
              ) : (
                <div className="mt-1.5 space-y-1">
                  {folio.addons.map((a) => (
                    <div
                      key={a.id}
                      className="text-[11.5px] text-[#334155] flex items-center justify-between"
                    >
                      <span className="truncate max-w-[170px]">{a.title}</span>
                      <span className="font-bold text-[#0d2c5c]">
                        {a.total_price} L
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="mt-3 pt-2.5 border-t border-slate-200 text-[11px] font-bold text-[#9c7624] hover:text-[#0d2c5c] hover:underline flex items-center gap-1 text-left transition-colors"
            >
              <span>+ Adaugă opțiuni mic dejun</span>
              <ArrowRight size={11} />
            </button>
          </div>

          {/* 3. Comenzi Restaurant & Room Service pe Cameră */}
          <div className="p-4 rounded-[18px] bg-[#f8fafc] border border-[#e1e8f0] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#9c7624] flex items-center gap-1.5">
                  <Utensils size={13} className="text-[#c69a3f]" />
                  <span>Consumație Restaurant</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-[#fdf8ec] text-[#9c7624] border border-[#c69a3f]/35">
                  Room Folio
                </span>
              </div>
              <p className="font-['Outfit',sans-serif] text-[22px] font-bold text-[#0d2c5c]">
                {folio.room_service_folio_total.toLocaleString("ro-RO")} RON
              </p>
              {folio.orders.filter((o) => o.is_on_folio).length === 0 ? (
                <p className="text-[11.5px] text-[#64748b] mt-1">
                  Nicio comandă trecută pe cameră până acum.
                </p>
              ) : (
                <div className="mt-1.5 space-y-1">
                  {folio.orders
                    .filter((o) => o.is_on_folio)
                    .map((o) => (
                      <div
                        key={o.id}
                        className="text-[11.5px] text-[#334155] flex items-center justify-between"
                      >
                        <span className="truncate max-w-[170px]">
                          Comandă #{o.order_code}
                        </span>
                        <span className="font-bold text-[#0d2c5c]">
                          {o.total_amount} L
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-200 text-[11px] text-[#64748b]">
              Comenzile la masă pot fi adăugate pe cameră
            </div>
          </div>
        </div>

        {/* SOLD FINAL RĂMAS DE PLATĂ BANNER */}
        <div
          className={`mt-6 p-5 rounded-[20px] border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
            isZeroBalance
              ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
              : "bg-amber-50/80 border-amber-300 text-amber-950 shadow-sm"
          }`}
        >
          <div className="flex items-start gap-3.5">
            <div
              className={`w-11 h-11 rounded-[14px] flex items-center justify-center shrink-0 ${
                isZeroBalance
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "bg-amber-500 text-white shadow-sm"
              }`}
            >
              {isZeroBalance ? (
                <CheckCircle2 size={22} />
              ) : (
                <AlertCircle size={22} />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">
                  Situație la zi · La Check-out
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold border ${
                    isZeroBalance
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                      : "bg-amber-100 text-amber-900 border-amber-300"
                  }`}
                >
                  {isZeroBalance ? "Sold Achitat 0 RON" : "Plată la Check-out"}
                </span>
              </div>
              <h4 className="font-['Outfit',sans-serif] text-[22px] sm:text-[24px] font-extrabold leading-tight">
                {isZeroBalance ? (
                  <span className="text-emerald-800">
                    Toate serviciile sunt achitate integral ✓
                  </span>
                ) : (
                  <span className="text-amber-950">
                    Total Rămas de Plată:{" "}
                    <span className="text-[#0d2c5c]">
                      {folio.summary.balance_due.toLocaleString("ro-RO")} RON
                    </span>
                  </span>
                )}
              </h4>
              <p className="text-[12px] text-[#475569] mt-0.5 font-['Plus_Jakarta_Sans',sans-serif]">
                Total consumație generală: {folio.summary.grand_total} RON ·
                Achitat deja: {folio.summary.total_paid} RON
              </p>
            </div>
          </div>

          {!isZeroBalance && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                disabled={settling}
                onClick={handleSettle}
                className="px-5 py-2.5 rounded-[12px] bg-[#0d2c5c] hover:bg-[#071d3d] text-white text-[12.5px] font-bold flex items-center gap-2 shadow-sm transition active:scale-95 disabled:opacity-50"
              >
                <CreditCard size={15} className="text-[#c69a3f]" />
                <span>
                  {settling ? "Se procesează..." : "Achită Soldul Online (Card)"}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal for adding breakfast */}
      <BreakfastUpsellModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        bookingId={folio.booking_id}
        bookingCode={folio.booking_code}
        nightsCount={folio.nights}
        adultsCount={folio.guests_adults}
        onSuccess={loadFolio}
      />
    </>
  );
}
