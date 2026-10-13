import { apiFetch } from "../lib/api";
import type {
  MonthlyBusinessReport,
  BusinessComparison,
  FunnelAttribution,
  PricingForecast,
} from "../types/analytics";

export const getMonthlyReport = (y: number, m: number) =>
  apiFetch<MonthlyBusinessReport>(
    `/api/chat/admin/reports/business-monthly?year=${y}&month=${m}`,
  );

export const getBusinessCompare = (y: number, m: number) =>
  apiFetch<BusinessComparison>(
    `/api/chat/admin/analytics/business-compare?year=${y}&month=${m}`,
  );

export const getConversionFunnel = (y: number, m: number) =>
  apiFetch<FunnelAttribution>(
    `/api/chat/admin/analytics/conversion-funnel?year=${y}&month=${m}`,
  );

export const getPricingForecast = (y: number, m: number) =>
  apiFetch<PricingForecast>(
    `/api/chat/admin/reports/pricing-forecast?target_year=${y}&target_month=${m}`,
  );
