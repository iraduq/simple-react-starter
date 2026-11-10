import { useCallback, useEffect, useState } from "react";
import { useToast } from "../Toast";
import { httpErrorMessage } from "../../services/apiClient";
import { apiFetch } from "../../lib/api";
import {
  getBusinessCompare,
  getMonthlyReport,
} from "../../services/analyticsService";
import type {
  BusinessComparison,
  MonthlyBusinessReport,
} from "../../types/analytics";
import { SectionHeader } from "./ui";
import AnalyticsPeriodPicker from "../analytics/AnalyticsPeriodPicker";
import KpiSummaryGrid from "../analytics/KpiSummaryGrid";
import AiBriefCards from "../analytics/AiBriefCards";
import AnalyticsCharts from "../analytics/AnalyticsCharts";
import MonthlyBookingLedger, { type LedgerBooking } from "../analytics/MonthlyBookingLedger";
import PricingForecastCard from "../analytics/PricingForecastCard";
import { useAdminLiveSync } from "../../context/AdminLiveSyncContext";

type Tab = "overview" | "ledger" | "forecast";
const TABS: { key: Tab; label: string }[] = [
  { key: "overview", label: "Tablou general și indicatori hotelieri" },
  { key: "ledger", label: "Registru și detaliu sejururi lunare" },
  { key: "forecast", label: "Prognoză sezonieră și tarife" },
];

export default function AnalyticsTab() {
  useAdminLiveSync({
    topic: "analytics",
    onSync: () => void load(true),
  });
  const { toast } = useToast();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [tab, setTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<MonthlyBusinessReport | null>(null);
  const [compare, setCompare] = useState<BusinessComparison | null>(null);
  const [bookings, setBookings] = useState<LedgerBooking[]>([]);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    const [r, c, b] = await Promise.allSettled([
      getMonthlyReport(year, month),
      getBusinessCompare(year, month),
      apiFetch<LedgerBooking[]>("/bookings"),
    ]);

    setReport(r.status === "fulfilled" ? r.value : null);
    setCompare(c.status === "fulfilled" ? c.value : null);
    setBookings(b.status === "fulfilled" && Array.isArray(b.value) ? b.value : []);

    const failed = [r, c, b].find((x) => x.status === "rejected") as
      | PromiseRejectedResult
      | undefined;
    if (failed) {
      toast(
        httpErrorMessage(failed.reason, "Serverul de analize nu răspunde."),
        "error",
      );
    }
    if (!silent) setLoading(false);
  }, [year, month, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="w-full space-y-6 font-['Plus_Jakarta_Sans',sans-serif]">
      <SectionHeader
        eyebrow="Gestiune și performanță financiară"
        title="Rapoarte și indicatori de performanță"
        description="Indicatori financiari cheie (ADR, RevPAR, grad de ocupare), sinteze executive de performanță și registrul contabil detaliat al sejururilor."
        action={
          <AnalyticsPeriodPicker
            year={year}
            month={month}
            loading={loading}
            onChange={(y, m) => {
              setYear(y);
              setMonth(m);
            }}
            onRefresh={load}
          />
        }
      />

      <div className="flex flex-wrap gap-2 border-b border-[#e1e8f0]">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`-mb-px border-b-2 px-4 py-3 text-[12px] font-bold uppercase tracking-[0.14em] transition-colors cursor-pointer ${
              tab === t.key
                ? "border-[#c69a3f] text-[#0d2c5c]"
                : "border-transparent text-[#6b7c99] hover:text-[#0d2c5c]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="space-y-6">
          <KpiSummaryGrid
            report={report}
            compare={compare}
            loading={loading}
            year={year}
            month={month}
          />
          <AiBriefCards
            brief={report?.ai_strategic_brief}
            narrative={compare?.ai_growth_narrative}
            loading={loading}
          />
          <AnalyticsCharts
            report={report}
            compare={compare}
            loading={loading}
          />
        </div>
      )}
      {tab === "ledger" && (
        <MonthlyBookingLedger
          year={year}
          month={month}
          bookings={bookings}
          loading={loading}
        />
      )}
      {tab === "forecast" && (
        <PricingForecastCard
          key={`${year}-${month}`}
          baseYear={year}
          baseMonth={month}
        />
      )}
    </div>
  );
}
