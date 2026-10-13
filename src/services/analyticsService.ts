import { apiFetch } from "../lib/api";
import type {
  MonthlyBusinessReport,
  BusinessComparison,
  FunnelAttribution,
  PricingForecast,
} from "../types/analytics";

// apiFetch attaches the Bearer token from storage and prefixes API_URL (which already maps to /api).
export const getMonthlyReport = (y: number, m: number) =>
  apiFetch<MonthlyBusinessReport>(`/chat/admin/reports/business-monthly?year=${y}&month=${m}`);

export const getBusinessCompare = (y: number, m: number) =>
  apiFetch<BusinessComparison>(`/chat/admin/analytics/business-compare?year=${y}&month=${m}`);

export const getConversionFunnel = (y: number, m: number) =>
  apiFetch<FunnelAttribution>(`/chat/admin/analytics/conversion-funnel?year=${y}&month=${m}`);

export const getPricingForecast = (y: number, m: number) =>
  apiFetch<PricingForecast>(
    `/chat/admin/reports/pricing-forecast?target_year=${y}&target_month=${m}`,
  );
