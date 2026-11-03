import { useCallback, useEffect, useState } from "react";
import { useToast } from "../Toast";
import { httpErrorMessage } from "../../services/apiClient";
import {
  getBusinessCompare,
  getConversionFunnel,
  getMonthlyReport,
} from "../../services/analyticsService";
import type {
  BusinessComparison,
  FunnelAttribution,
  MonthlyBusinessReport,
} from "../../types/analytics";
import { SectionHeader } from "./ui";
import AnalyticsPeriodPicker from "../analytics/AnalyticsPeriodPicker";
import KpiSummaryGrid from "../analytics/KpiSummaryGrid";
import AiBriefCards from "../analytics/AiBriefCards";
import AnalyticsCharts from "../analytics/AnalyticsCharts";
import ConversionFunnelCard from "../analytics/ConversionFunnelCard";
import PricingForecastCard from "../analytics/PricingForecastCard";

type Tab = "overview" | "funnel" | "forecast";
const TABS: { key: Tab; label: string }[] = [
  { key: "overview", label: "Prezentare Generală" },
  { key: "funnel", label: "Pâlnie Conversie AI" },
  { key: "forecast", label: "Prognoză & Prețuri" },
];

export default function AnalyticsTab() {
  const { toast } = useToast();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [tab, setTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<MonthlyBusinessReport | null>(null);
  const [compare, setCompare] = useState<BusinessComparison | null>(null);
  const [funnel, setFunnel] = useState<FunnelAttribution | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [r, c, f] = await Promise.allSettled([
      getMonthlyReport(year, month),
      getBusinessCompare(year, month),
      getConversionFunnel(year, month),
    ]);

    setReport(r.status === "fulfilled" ? r.value : null);
    setCompare(c.status === "fulfilled" ? c.value : null);
    setFunnel(f.status === "fulfilled" ? f.value : null);

    const failed = [r, c, f].find((x) => x.status === "rejected") as
      | PromiseRejectedResult
      | undefined;
    if (failed) {
      toast(
        httpErrorMessage(failed.reason, "Serverul de analize nu răspunde."),
        "error",
      );
    }
    setLoading(false);
  }, [year, month, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="w-full space-y-6">
      <SectionHeader
        eyebrow="Business Intelligence & AI"
        title="Analize & Rapoarte Performanță"
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
      {tab === "funnel" && (
        <ConversionFunnelCard data={funnel} loading={loading} />
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
