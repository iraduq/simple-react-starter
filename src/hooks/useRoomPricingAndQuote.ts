import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../lib/api";
import { httpErrorMessage } from "../services/apiClient";
import { getRoomPricing } from "../services/pricingService";
import { toISODate } from "../lib/format";
import { hasSession } from "../lib/auth";
import { useToast } from "../components/Toast";
import type { BookingPriceCalculation, RatePlanCode, RoomDetail as RoomDetailType } from "../types/rooms";

export function useRoomPricingAndQuote(
  roomId: string,
  room: RoomDetailType | null,
  checkIn: string,
  checkOut: string,
  nights: number,
  hasConflict: boolean,
  adults: number,
  children: number,
) {
  const { toast } = useToast();
  const [plan, setPlan] = useState<RatePlanCode>("flexible");
  const [quote, setQuote] = useState<BookingPriceCalculation | null>(null);
  const [todayDynamicRate, setTodayDynamicRate] = useState<number | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [vipCoupons, setVipCoupons] = useState<Array<{ code: string; discount_value: number; status: string }>>([]);
  const [vipStayBenefit, setVipStayBenefit] = useState<any>(null);

  useEffect(() => {
    if (!hasSession()) return;
    apiFetch<any>("/loyalty/my-vouchers").then((res: any) => setVipCoupons((res?.coupons || []).filter((c: any) => c.status === "available"))).catch(() => setVipCoupons([]));
    apiFetch<any>("/loyalty/my-account").then((acc) => {
      if (acc?.tier && Number(acc?.stay_discount_percent || 0) > 0) {
        setVipStayBenefit({ tier: acc.tier, stay_discount_percent: Number(acc.stay_discount_percent), stay_discount_reason: acc.stay_discount_reason });
      } else setVipStayBenefit(null);
    }).catch(() => setVipStayBenefit(null));
  }, []);

  const loadQuote = useCallback(async () => {
    if (!roomId || nights === 0 || hasConflict) { setQuote(null); return; }
    setQuoting(true);
    setQuoteError(null);
    try {
      const res = await getRoomPricing(roomId, checkIn, checkOut, plan, adults, children);
      setQuote(res);
    } catch (err) {
      setQuote(null);
      setQuoteError(httpErrorMessage(err, "Nu am putut calcula prețul."));
    } finally {
      setQuoting(false);
    }
  }, [roomId, checkIn, checkOut, nights, hasConflict, plan, adults, children]);

  useEffect(() => { void loadQuote(); }, [loadQuote]);

  useEffect(() => {
    if (!roomId) return;
    let active = true;
    const now = new Date();
    const tom = new Date(now); tom.setDate(tom.getDate() + 1);
    getRoomPricing(roomId, toISODate(now), toISODate(tom), "flexible", adults, children)
      .then((res: any) => { if (active && res && res.nights > 0) setTodayDynamicRate(Math.round((res.subtotal / res.nights) * 100) / 100); })
      .catch(() => {});
    return () => { active = false; };
  }, [roomId, adults, children]);

  const backendHandledPlan = quote?.nightly_breakdown?.[0]?.debug_info?.rate_plan_code === plan;
  const totalGuestsCount = Math.max(1, adults + children);
  const breakfastAddonPerNight = 35 * totalGuestsCount;

  const adjustNightPrice = useCallback((base: number) => {
    if (backendHandledPlan) return base;
    if (plan === "non_refundable") return Math.round(base * 0.9 * 100) / 100;
    if (plan === "breakfast") return Math.round((base + breakfastAddonPerNight) * 100) / 100;
    return base;
  }, [backendHandledPlan, plan, breakfastAddonPerNight]);

  const subtotal = useMemo(() => {
    if (!quote) return null;
    if (backendHandledPlan) return quote.subtotal;
    return Math.round(quote.nightly_breakdown.reduce((sum: any, n: any) => sum + adjustNightPrice(n.price_per_night), 0) * 100) / 100;
  }, [quote, backendHandledPlan, adjustNightPrice]);

  const taxes = useMemo(() => (subtotal != null ? Math.round(subtotal * 0.19 * 100) / 100 : null), [subtotal]);
  const total = useMemo(() => (subtotal != null && taxes != null ? Math.round((subtotal + taxes) * 100) / 100 : null), [subtotal, taxes]);
  const avgNight = useMemo(() => (subtotal != null && quote && quote.nights > 0 ? Math.round((subtotal / quote.nights) * 100) / 100 : null), [subtotal, quote]);

  const baseRatePerNight = useMemo(() => {
    if (quote && quote.nights > 0) {
      const raw = quote.subtotal / quote.nights;
      if (backendHandledPlan) {
        if (plan === "non_refundable") return Math.round((raw / 0.9) * 100) / 100;
        if (plan === "breakfast") return Math.round((raw - breakfastAddonPerNight) * 100) / 100;
      }
      return raw;
    }
    return todayDynamicRate ?? room?.price_per_night ?? room?.base_price ?? 150;
  }, [quote, backendHandledPlan, plan, breakfastAddonPerNight, todayDynamicRate, room]);

  const currentBasePrice = useMemo(() => {
    if (plan === "non_refundable") return Math.round(baseRatePerNight * 0.9);
    if (plan === "breakfast") return Math.round(baseRatePerNight + breakfastAddonPerNight);
    return Math.round(baseRatePerNight);
  }, [plan, baseRatePerNight, breakfastAddonPerNight]);

  const vipStayDiscount = vipStayBenefit && vipStayBenefit.stay_discount_percent > 0 && total != null ? Math.round(total * (vipStayBenefit.stay_discount_percent / 100) * 100) / 100 : 0;
  const totalAfterVip = total != null ? Math.max(1, Math.round((total - vipStayDiscount) * 100) / 100) : null;
  const couponDiscount = appliedCoupon && totalAfterVip != null ? (appliedCoupon.discount_type === "percent" ? Math.round(totalAfterVip * (appliedCoupon.discount_value / 100)) : Math.min(totalAfterVip, appliedCoupon.discount_value)) : 0;
  const finalTotal = totalAfterVip != null ? Math.max(1, Math.round((totalAfterVip - couponDiscount) * 100) / 100) : null;

  const handleApplyCoupon = async (overrideCode?: string) => {
    const code = (overrideCode ?? couponCodeInput).trim().toUpperCase();
    if (!code) return;
    if (overrideCode) setCouponCodeInput(code);
    setValidatingCoupon(true);
    try {
      const res = await apiFetch<any>("/coupons/validate", { method: "POST", body: JSON.stringify({ code, subtotal: total ?? room?.base_price ?? 0 }) });
      setAppliedCoupon(res);
      toast(`Cuponul ${res.code} a fost aplicat!`, "success");
    } catch (err) {
      setAppliedCoupon(null);
      toast(httpErrorMessage(err, "Codul promoțional este invalid."), "error");
    } finally {
      setValidatingCoupon(false);
    }
  };

  const baseTotal = room && nights > 0 ? room.base_price * nights : null;
  const isDeal = subtotal != null && baseTotal != null && subtotal < baseTotal - 0.5;

  return {
    plan, setPlan, quote, quoting, quoteError, subtotal, taxes, total, avgNight,
    baseRatePerNight, currentBasePrice, breakfastAddonPerNight, totalGuestsCount,
    vipStayBenefit, vipStayDiscount, couponDiscount, finalTotal,
    couponCodeInput, setCouponCodeInput, validatingCoupon, appliedCoupon, setAppliedCoupon,
    vipCoupons, handleApplyCoupon, isDeal, baseTotal,
  };
}
