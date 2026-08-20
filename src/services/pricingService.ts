import { apiFetch } from "../lib/api";
import { list } from "../lib/admin";
import { qs } from "./apiClient";
import type {
  PricingCalculateParams,
  PricingDashboard,
  PricingDashboardRow,
  PricingNight,
  PricingOverrideHistoryItem,
  PricingOverridePayload,
} from "../types/pricing";

const num = (o: Record<string, unknown>, keys: string[]): number | null => {
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "number") return v;
    if (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v))) return Number(v);
  }
  return null;
};

/**
 * GET /api/pricing/calculate — prețul pentru O noapte.
 * Nu recalculăm nimic în frontend: doar normalizăm forma răspunsului.
 */
export async function calculateNight(params: PricingCalculateParams): Promise<PricingNight> {
  const raw = await apiFetch<unknown>(
    `/api/pricing/calculate${qs({
      room_type_id: params.room_type_id,
      date: params.date,
      booking_date: params.booking_date,
      length_of_stay: params.length_of_stay,
      plan_code: params.plan_code,
      adults: params.adults,
      extra_guests: params.extra_guests,
    })}`,
  );
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const price = num(o, ["final_price", "price", "total_price", "amount", "nightly_price", "value"]);
  return {
    date: typeof o["date"] === "string" ? (o["date"] as string) : params.date,
    price: price ?? 0,
    currency: (o["currency"] as string | undefined) ?? "RON",
    plan_code: (o["plan_code"] as string | undefined) ?? params.plan_code,
    source: (o["source"] as string | undefined) ?? null,
    min_stay: num(o, ["min_stay", "min_los"]),
    closed_to_arrival: Boolean(o["closed_to_arrival"] ?? o["cta"]),
    closed_to_departure: Boolean(o["closed_to_departure"] ?? o["ctd"]),
    raw,
  };
}

/** Un apel per noapte, în paralel. */
export const calculateStay = (nightsParams: PricingCalculateParams[]) =>
  Promise.all(nightsParams.map(calculateNight));

/** GET /api/pricing/dashboard */
export async function pricingDashboard(date: string): Promise<PricingDashboard> {
  const raw = await apiFetch<unknown>(`/api/pricing/dashboard${qs({ date })}`);
  const o = (raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {}) as Record<string, unknown>;
  const rows = list<PricingDashboardRow>(
    Array.isArray(raw) ? raw : (o["rows"] ?? o["room_types"] ?? o["items"] ?? o["data"] ?? []),
  );
  const overrides = list<PricingOverrideHistoryItem>(
    o["overrides"] ?? o["override_history"] ?? o["history"] ?? [],
  );
  return { date: (o["date"] as string | undefined) ?? date, rows, overrides };
}

/** POST /api/pricing/override */
export const createOverride = (payload: PricingOverridePayload) =>
  apiFetch<unknown>("/api/pricing/override", { method: "POST", body: JSON.stringify(payload) });
