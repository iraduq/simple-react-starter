import { useState, useMemo } from "react";
import { Download, Printer, Search, Calendar, BedDouble, Users, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Card, Badge } from "../admin/ui";
import { formatRon, formatNum, MONTHS } from "./shared";

export interface LedgerBooking {
  id: string | number;
  booking_code?: string;
  guest_name?: string;
  user_name?: string;
  guest_email?: string;
  user_email?: string;
  room_name?: string;
  room_title?: string;
  check_in?: string;
  check_out?: string;
  total_price?: number;
  guests_adults?: number;
  guests_children?: number;
  status?: string;
}

export default function MonthlyBookingLedger({
  year,
  month,
  bookings,
  loading,
}: {
  year: number;
  month: number;
  bookings: LedgerBooking[];
  loading: boolean;
}) {
  const [search, setSearch] = useState("");

  const monthLabel = `${MONTHS[month - 1]} ${year}`;

  const monthBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (!b.check_in) return false;
      const d = new Date(b.check_in);
      return d.getFullYear() === year && d.getMonth() + 1 === month;
    });
  }, [bookings, year, month]);

  const filtered = useMemo(() => {
    if (!search.trim()) return monthBookings;
    const q = search.toLowerCase();
    return monthBookings.filter((b) => {
      const code = (b.booking_code || "").toLowerCase();
      const guest = (b.guest_name || b.user_name || "").toLowerCase();
      const email = (b.guest_email || b.user_email || "").toLowerCase();
      const room = (b.room_name || b.room_title || "").toLowerCase();
      return code.includes(q) || guest.includes(q) || email.includes(q) || room.includes(q);
    });
  }, [monthBookings, search]);

  const totalRevenue = useMemo(() => {
    return monthBookings
      .filter((b) => b.status !== "cancelled")
      .reduce((sum, b) => sum + (Number(b.total_price) || 0), 0);
  }, [monthBookings]);

  const totalNights = useMemo(() => {
    return monthBookings
      .filter((b) => b.status !== "cancelled")
      .reduce((sum, b) => {
        if (!b.check_in || !b.check_out) return sum + 1;
        const diff = Math.max(1, Math.round((+new Date(b.check_out) - +new Date(b.check_in)) / 864e5));
        return sum + diff;
      }, 0);
  }, [monthBookings]);

  const handleExportCsv = () => {
    if (monthBookings.length === 0) return;
    const headers = [
      "Cod Rezervare",
      "Nume Oaspete",
      "Email",
      "Camera",
      "Check-in",
      "Check-out",
      "Nopti",
      "Adulti",
      "Copii",
      "Total RON",
      "Status",
    ];

    const rows = monthBookings.map((b) => {
      const nights =
        b.check_in && b.check_out
          ? Math.max(1, Math.round((+new Date(b.check_out) - +new Date(b.check_in)) / 864e5))
          : 1;
      return [
        `"${b.booking_code || `BK-${b.id}`}"`,
        `"${b.guest_name || b.user_name || "Oaspete Anonim"}"`,
        `"${b.guest_email || b.user_email || ""}"`,
        `"${b.room_name || b.room_title || "Camera Standard"}"`,
        `"${b.check_in ? b.check_in.slice(0, 10) : ""}"`,
        `"${b.check_out ? b.check_out.slice(0, 10) : ""}"`,
        nights,
        b.guests_adults || 1,
        b.guests_children || 0,
        Number(b.total_price || 0).toFixed(2),
        `"${b.status || "confirmed"}"`,
      ].join(",");
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Raport_Sejururi_Casa_Esy_${year}_${String(month).padStart(2, "0")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Card className="p-6 font-['Plus_Jakarta_Sans',sans-serif] border border-[#e1e8f0] shadow-sm">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#e1e8f0]">
        <div>
          <h3 className="font-['Outfit',sans-serif] text-[22px] font-bold text-[#0d2c5c]">
            Registru Financiar & Detaliu Sejururi
          </h3>
          <p className="text-[12.5px] text-[#6b7c99] mt-0.5">
            Toate sejururile înregistrate pentru <strong className="text-[#0d2c5c]">{monthLabel}</strong> cu calculul încasărilor aferente.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            disabled={monthBookings.length === 0}
            className="px-3.5 py-2 rounded-xl bg-[#0d2c5c] hover:bg-[#07203f] disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            title="Descarcă fișier CSV pentru evidență contabilă"
          >
            <Download size={14} className="text-[#c69a3f]" />
            Exportă CSV Contabilitate
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#e1e8f0] text-[#0d2c5c] text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            title="Tipărește raportul sau salvează ca PDF"
          >
            <Printer size={14} className="text-[#0d2c5c]" />
            Tipărește Raport
          </button>
        </div>
      </div>

      {/* Monthly Mini Ledger Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-5 p-4 rounded-2xl bg-gradient-to-r from-[#fdfbf7] via-white to-[#f5f8fc] border border-[#e1e8f0]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0d2c5c]/10 text-[#0d2c5c] flex items-center justify-center font-bold">
            <Calendar size={18} className="text-[#0d2c5c]" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#6b7c99]">Sejururi Lunare</div>
            <div className="font-['Outfit',sans-serif] text-[18px] font-bold text-[#0d2c5c]">
              {formatNum(monthBookings.length)} rezervări
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#c69a3f]/15 text-[#8a6420] flex items-center justify-center font-bold">
            <BedDouble size={18} className="text-[#c69a3f]" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#6b7c99]">Nopți Cazare Realizate</div>
            <div className="font-['Outfit',sans-serif] text-[18px] font-bold text-[#0d2c5c]">
              {formatNum(totalNights)} nopți
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <CheckCircle2 size={18} className="text-emerald-600" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#6b7c99]">Total Încasări Sejururi</div>
            <div className="font-['Outfit',sans-serif] text-[18px] font-bold text-[#0d2c5c]">
              {formatRon(totalRevenue)}
            </div>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={15} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Caută după oaspete, email, cameră sau #BK..."
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-[#e1e8f0] text-xs font-medium text-[#0d2c5c] focus:outline-none focus:border-[#0d2c5c] shadow-xs"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-2 py-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center text-[#6b7c99] text-xs border border-dashed border-[#e1e8f0] rounded-2xl">
          {monthBookings.length === 0
            ? `Nu există nicio rezervare înregistrată pentru ${monthLabel}.`
            : "Nicio rezervare nu corespunde căutării tale."}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#e1e8f0]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8fafc] text-[#4f6280] font-bold uppercase tracking-wider text-[10.5px] border-b border-[#e1e8f0]">
              <tr>
                <th className="py-3 px-3.5">Cod Sejur</th>
                <th className="py-3 px-3.5">Oaspete</th>
                <th className="py-3 px-3.5">Cameră Solicitată</th>
                <th className="py-3 px-3.5">Perioadă Cazare</th>
                <th className="py-3 px-3.5 text-center">Nopți</th>
                <th className="py-3 px-3.5 text-center">Oaspeți</th>
                <th className="py-3 px-3.5 text-right">Valoare Încasată</th>
                <th className="py-3 px-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e1e8f0] text-[#1e293b]">
              {filtered.map((b) => {
                const nightsCount =
                  b.check_in && b.check_out
                    ? Math.max(1, Math.round((+new Date(b.check_out) - +new Date(b.check_in)) / 864e5))
                    : 1;
                const guestName = b.guest_name || b.user_name || "Oaspete Anonim";
                const guestEmail = b.guest_email || b.user_email || "—";
                const roomTitle = b.room_name || b.room_title || "Cameră Standard";
                const code = b.booking_code || `BK-${b.id}`;

                return (
                  <tr key={b.id} className="hover:bg-[#f8fafd] transition-colors">
                    <td className="py-3 px-3.5 font-['Outfit',sans-serif] font-bold text-[#0d2c5c]">
                      {code}
                    </td>
                    <td className="py-3 px-3.5">
                      <div className="font-semibold text-[#0d2c5c]">{guestName}</div>
                      <div className="text-[11px] text-[#6b7c99]">{guestEmail}</div>
                    </td>
                    <td className="py-3 px-3.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#f0f4fa] text-[#0d2c5c] font-semibold text-[11px]">
                        <BedDouble size={13} className="text-[#c69a3f]" />
                        {roomTitle}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-[#4f6280]">
                      <div className="font-medium text-[#0d2c5c]">
                        {b.check_in?.slice(0, 10)} → {b.check_out?.slice(0, 10)}
                      </div>
                    </td>
                    <td className="py-3 px-3.5 text-center font-bold text-[#0d2c5c]">
                      {nightsCount}
                    </td>
                    <td className="py-3 px-3.5 text-center text-[#4f6280]">
                      <span className="inline-flex items-center gap-1">
                        <Users size={12} className="text-[#94a3b8]" />
                        {(b.guests_adults || 1) + (b.guests_children || 0)}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-right font-['Outfit',sans-serif] font-bold text-[13.5px] text-[#0d2c5c]">
                      {formatRon(b.total_price)}
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      {b.status === "confirmed" && (
                        <Badge tone="green">Confirmată</Badge>
                      )}
                      {b.status === "completed" && (
                        <Badge tone="navy">Finalizată</Badge>
                      )}
                      {b.status === "pending" && (
                        <Badge tone="gold">În Așteptare</Badge>
                      )}
                      {b.status === "cancelled" && (
                        <Badge tone="red">Anulată</Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
