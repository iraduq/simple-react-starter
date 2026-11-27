import { ron } from "../../../lib/format";
import type { BookingPriceCalculation, RatePlanCode, RoomDetail as RoomDetailType } from "../../../types/rooms";
import BookingDateGuestsPicker from "./BookingDateGuestsPicker";
import RatePlanSelector from "./RatePlanSelector";
import CouponSection from "./CouponSection";
import PriceBreakdown from "./PriceBreakdown";

interface BookingSidebarProps {
  room: RoomDetailType;
  today: string;
  checkIn: string;
  setCheckIn: (d: string) => void;
  checkOut: string;
  setCheckOut: (d: string) => void;
  blocked: Set<string>;
  adults: number;
  setAdults: (n: number) => void;
  children: number;
  setChildren: (n: number) => void;
  plan: RatePlanCode;
  setPlan: (p: RatePlanCode) => void;
  requests: string;
  setRequests: (r: string) => void;
  couponCodeInput: string;
  setCouponCodeInput: (c: string) => void;
  validatingCoupon: boolean;
  onApplyCoupon: (override?: string) => Promise<void>;
  vipCoupons: Array<{ code: string; discount_value: number; status: string }>;
  cookieConsentMarketing?: boolean;
  appliedCoupon: any;
  onRemoveCoupon: () => void;
  quote: BookingPriceCalculation | null;
  quoteError: string | null;
  quoting: boolean;
  submitting: boolean;
  subtotal: number | null;
  taxes: number | null;
  total: number | null;
  finalTotal: number | null;
  avgNight: number | null;
  currentBasePrice: number;
  baseRatePerNight: number;
  breakfastAddonPerNight: number;
  totalGuestsCount: number;
  vipStayBenefit: any;
  vipStayDiscount: number;
  couponDiscount: number;
  baseTotal: number | null;
  isDeal: boolean;
  hasConflict: boolean;
  isHeldConflict: boolean;
  nights: number;
  onFinalize: () => void;
  onConflictToast: () => void;
}

export default function BookingSidebar({
  room,
  today,
  checkIn,
  setCheckIn,
  checkOut,
  setCheckOut,
  blocked,
  adults,
  setAdults,
  children,
  setChildren,
  plan,
  setPlan,
  requests,
  setRequests,
  couponCodeInput,
  setCouponCodeInput,
  validatingCoupon,
  onApplyCoupon,
  vipCoupons,
  cookieConsentMarketing,
  appliedCoupon,
  onRemoveCoupon,
  quote,
  quoteError,
  quoting,
  submitting,
  subtotal,
  taxes,
  total,
  finalTotal,
  avgNight,
  currentBasePrice,
  baseRatePerNight,
  breakfastAddonPerNight,
  totalGuestsCount,
  vipStayBenefit,
  vipStayDiscount,
  couponDiscount,
  baseTotal,
  isDeal,
  hasConflict,
  isHeldConflict,
  nights,
  onFinalize,
  onConflictToast,
}: BookingSidebarProps) {
  const inputCls =
    "w-full rounded-xl border border-[#e1e8f0] bg-white px-3.5 py-2.5 text-[14px] text-[#0d2c5c] outline-none focus:border-[#c69a3f]";
  const labelCls =
    "mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#8595aa]";

  return (
    <aside className="h-fit rounded-2xl border border-[#e1e8f0] bg-white p-5 lg:sticky lg:top-24 shadow-sm">
      <div className="flex items-end gap-2">
        <p className="text-[24px] font-bold text-[#0d2c5c]">
          {quoting ? "…" : ron(total ?? avgNight ?? currentBasePrice)}
        </p>
        <span className="pb-1 text-[12px] text-[#8595aa]">
          {total != null ? `total · ${nights} ${nights === 1 ? "noapte" : "nopți"}` : "/ noapte"}
        </span>
        {isDeal && (
          <span className="ml-auto rounded-full bg-[#f3e6c4] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#8a6516]">
            Ofertă
          </span>
        )}
      </div>

      <BookingDateGuestsPicker
        room={room}
        today={today}
        checkIn={checkIn}
        setCheckIn={setCheckIn}
        checkOut={checkOut}
        setCheckOut={setCheckOut}
        blocked={blocked}
        adults={adults}
        setAdults={setAdults}
        children={children}
        setChildren={setChildren}
        onConflictToast={onConflictToast}
      />

      <RatePlanSelector
        plan={plan}
        setPlan={setPlan}
        baseRatePerNight={baseRatePerNight}
        breakfastAddonPerNight={breakfastAddonPerNight}
        totalGuestsCount={totalGuestsCount}
      />

      <label className="mt-4 block">
        <span className={labelCls}>Cerințe speciale (opțional)</span>
        <textarea
          value={requests}
          maxLength={500}
          rows={3}
          onChange={(e) => setRequests(e.target.value)}
          className={`${inputCls} resize-none`}
          placeholder="Ex: cameră la etaj superior, sosire târzie…"
        />
      </label>

      <CouponSection
        couponCodeInput={couponCodeInput}
        setCouponCodeInput={setCouponCodeInput}
        validatingCoupon={validatingCoupon}
        onApplyCoupon={onApplyCoupon}
        vipCoupons={vipCoupons}
        cookieConsentMarketing={cookieConsentMarketing}
        appliedCoupon={appliedCoupon}
        onRemoveCoupon={onRemoveCoupon}
      />

      <PriceBreakdown
        quoteError={quoteError}
        hasConflict={hasConflict}
        isHeldConflict={isHeldConflict}
        nights={nights}
        quote={quote}
        subtotal={subtotal}
        taxes={taxes}
        total={total}
        finalTotal={finalTotal}
        baseRatePerNight={baseRatePerNight}
        plan={plan}
        breakfastAddonPerNight={breakfastAddonPerNight}
        totalGuestsCount={totalGuestsCount}
        vipStayBenefit={vipStayBenefit}
        vipStayDiscount={vipStayDiscount}
        couponDiscount={couponDiscount}
        quoting={quoting}
        submitting={submitting}
        baseTotal={baseTotal}
        isDeal={isDeal}
        onFinalize={onFinalize}
      />
    </aside>
  );
}
