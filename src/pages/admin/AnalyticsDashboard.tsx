import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { fetchSession } from "../../lib/auth";
import { useToast } from "../../components/Toast";
import { httpErrorMessage } from "../../services/apiClient";
import { getBusinessCompare, getConversionFunnel, getMonthlyReport } from "../../services/analyticsService";
import type { BusinessComparison, FunnelAttribution, MonthlyBusinessReport } from "../../types/analytics";
import { SectionHeader } from "../../components/admin/ui";
import AnalyticsPeriodPicker from "../../components/analytics/AnalyticsPeriodPicker";
import KpiSummaryGrid from "../../components/analytics/KpiSummaryGrid";
import AiBriefCards from "../../components/analytics/AiBriefCards";
import AnalyticsCharts from "../../components/analytics/AnalyticsCharts";
import ConversionFunnelCard from "../../components/analytics/ConversionFunnelCard";
import PricingForecastCard from "../../components/analytics/PricingForecastCard";

type Tab = "overview" | "funnel" | "forecast";
const TABS: { key: Tab; label: string }[] = [
  { key: "overview", label: "Prezentare Generală" },
  { key: "funnel", label: "Pâlnie Conversie AI" },
  { key: "forecast", label: "Prognoză & Prețuri" },
];

export default function AnalyticsDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [tab, setTab] = useState<Tab>("overview");
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<MonthlyBusinessReport | null>(null);
  const [compare, setCompare] = useState<BusinessComparison | null>(null);
  const [funnel, setFunnel] = useState<FunnelAttribution | null>(null);

  useEffect(() => {
    void fetchSession(true).then((s) => {
      if (!s || s.role !== "admin") navigate("/", { replace: true });
      else setAuthorized(true);
    });
  }, [navigate]);

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
    const failed = [r, c, f].find((x) => x.status === "rejected") as PromiseRejectedResult | undefined;
    if (failed) toast(httpErrorMessage(failed.reason, "Serverul de analize nu răspunde."), "error");
    setLoading(false);
  }, [year, month, toast]);

  useEffect(() => { if (authorized) void load(); }, [authorized, load]);

  if (!authorized)
    return <div className="flex min-h-screen items-center justify-center text-sm uppercase tracking-[0.2em] text-[#6b7c99]">Se încarcă…</div>;

  return (
    <div className="min-h-screen bg-white px-3 pb-12 pt-[96px] sm:px-6 lg:px-8 lg:pt-[120px]">
      <div className="mx-auto max-w-[1200px] space-y-6">
        <Link to="/admin" className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.14em] text-[#4f6280] hover:text-[#0d2c5c]">
          <ArrowLeft size={14} /> Înapoi la panou
        </Link>
        <SectionHeader
          eyebrow="Business Intelligence"
          title="Analize & Rapoarte AI"
          action={<AnalyticsPeriodPicker year={year} month={month} loading={loading} onChange={(y, m) => { setYear(y); setMonth(m); }} onRefresh={load} />}
        />
        <div className="flex flex-wrap gap-2 border-b border-[#e1e8f0]">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`-mb-px border-b-2 px-4 py-3 text-[12px] font-bold uppercase tracking-[0.14em] transition-colors ${
                tab === t.key ? "border-[#c69a3f] text-[#0d2c5c]" : "border-transparent text-[#6b7c99] hover:text-[#0d2c5c]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <div className="space-y-6">
            <KpiSummaryGrid report={report} compare={compare} loading={loading} />
            <AiBriefCards brief={report?.ai_strategic_brief} narrative={compare?.ai_growth_narrative} loading={loading} />
            <AnalyticsCharts report={report} compare={compare} loading={loading} />
          </div>
        )}
        {tab === "funnel" && <ConversionFunnelCard data={funnel} loading={loading} />}
        {tab === "forecast" && <PricingForecastCard key={`${year}-${month}`} baseYear={year} baseMonth={month} />}
      </div>
    </div>
  );
}
