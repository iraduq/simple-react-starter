import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { apiFetch } from "../lib/api";
import { httpErrorMessage } from "../services/apiClient";
import { toUtcIso, getRoomCalendar, unavailableDates } from "../services/roomsService";
import { trackAnalyticsEvent, useCookieConsent } from "../components/CookieConsentBanner";
import { useToast } from "../components/Toast";
import { useAdminLiveSync } from "../context/AdminLiveSyncContext";
import { toISODate, nightsBetween } from "../lib/format";
import { hasSession } from "../lib/auth";
import type { RoomDetail as RoomDetailType } from "../types/rooms";

import RoomGallery from "./RoomDetail/components/RoomGallery";
import RoomInfo from "./RoomDetail/components/RoomInfo";
import BookingSidebar from "./RoomDetail/components/BookingSidebar";
import { useRoomPricingAndQuote } from "./RoomDetail/hooks/useRoomPricingAndQuote";

export default function RoomDetail() {
  const { roomId = "" } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const today = toISODate(new Date());
  const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();

  const [room, setRoom] = useState<RoomDetailType | null>(null);
  const [loadingRoom, setLoadingRoom] = useState(true);
  const [roomError, setRoomError] = useState<string | null>(null);
  const [checkIn, setCheckIn] = useState(params.get("check_in") ?? "");
  const [checkOut, setCheckOut] = useState(params.get("check_out") ?? "");
  const [adults, setAdults] = useState(Number(params.get("adults")) || 2);
  const [children, setChildren] = useState(Number(params.get("children")) || 0);
  const [requests, setRequests] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [blocked, setBlocked] = useState<Set<string>>(new Set());
  const [liveHeldInfo, setLiveHeldInfo] = useState<{ expiresAt: string; checkIn: string; checkOut: string } | null>(null);
  const ownCheckoutRef = useRef(false);
  const ownCheckoutTsRef = useRef(0);

  const cookieConsent = useCookieConsent();
  useEffect(() => { if (roomId) trackAnalyticsEvent("room_view", { slug: roomId }); }, [roomId]);

  const nightList = nightsBetween(checkIn, checkOut);
  const nights = nightList.length;
  const conflictNights = nightList.filter((d) => blocked.has(d));
  const hasConflict = conflictNights.length > 0;
  const isHeldConflict = Boolean(liveHeldInfo && checkIn && checkOut && liveHeldInfo.checkIn < checkOut && liveHeldInfo.checkOut > checkIn);

  const pricing = useRoomPricingAndQuote(roomId, room, checkIn, checkOut, nights, hasConflict, adults, children);

  useAdminLiveSync({
    topic: "rooms",
    onSync: (payload) => {
      if (!payload || !roomId || String(payload.room_id) !== String(roomId)) return;
      const isOwn = ownCheckoutRef.current || Date.now() - ownCheckoutTsRef.current < 15000;
      if (payload.event === "room_held" && !isOwn) {
        setLiveHeldInfo({ expiresAt: payload.expires_at, checkIn: payload.check_in?.slice(0, 10) || "", checkOut: payload.check_out?.slice(0, 10) || "" });
      } else if (payload.event === "room_released") {
        setLiveHeldInfo(null);
      } else if (payload.event === "rooms_updated" || payload.event === "pricing_updated") {
        apiFetch<RoomDetailType>(`/rooms/${roomId}`).then(setRoom).catch(() => {});
      } else if ((payload.event === "room_booked" || payload.event === "payment_confirmed") && !isOwn) {
        setLiveHeldInfo(null);
        if (payload.check_in && payload.check_out) {
          const bookedDays = nightsBetween(payload.check_in.slice(0, 10), payload.check_out.slice(0, 10));
          setBlocked((prev) => new Set([...prev, ...bookedDays]));
        }
      }
    },
  });

  useEffect(() => {
    let active = true;
    apiFetch<RoomDetailType>(`/rooms/${roomId}`)
      .then((d) => { if (active) setRoom(d); })
      .catch((err) => { if (active) setRoomError(httpErrorMessage(err, "Nu am putut încărca camera.")); })
      .finally(() => { if (active) setLoadingRoom(false); });
    return () => { active = false; };
  }, [roomId]);

  useEffect(() => {
    if (!roomId) return;
    let active = true;
    const start = toISODate(new Date());
    const endDate = new Date(); endDate.setMonth(endDate.getMonth() + 8);
    getRoomCalendar(roomId, start, toISODate(endDate))
      .then((e) => { if (active) setBlocked(unavailableDates(e)); })
      .catch(() => { if (active) setBlocked(new Set()); });
    return () => { active = false; };
  }, [roomId]);

  const finalize = async () => {
    if (nights === 0) { toast("Alege datele de check-in și check-out.", "warning"); return; }
    if (hasConflict) { toast("Perioada conține zile indisponibile.", "error"); return; }
    if (!hasSession()) { toast("Autentifică-te pentru a finaliza rezervarea.", "warning"); navigate("/login"); return; }
    if (!pricing.total) { toast("Nu se poate calcula prețul total.", "error"); return; }
    ownCheckoutRef.current = true;
    ownCheckoutTsRef.current = Date.now();
    setSubmitting(true);
    try {
      const stripeRes = await apiFetch<{ checkout_url: string }>("/payments/create-checkout-session", {
        method: "POST",
        body: JSON.stringify({
          room_id: String(roomId), check_in: toUtcIso(checkIn), check_out: toUtcIso(checkOut),
          guests_adults: adults, guests_children: children, rate_plan_code: pricing.plan,
          total_price: pricing.finalTotal ?? pricing.total, coupon_code: pricing.appliedCoupon?.code ?? null,
          special_requests: requests.trim() ? requests.trim().slice(0, 500) : null,
        }),
      });
      if (!stripeRes?.checkout_url) throw new Error("Nu s-a putut genera link-ul de plată Stripe.");
      window.location.href = stripeRes.checkout_url;
    } catch (err) {
      ownCheckoutRef.current = false;
      ownCheckoutTsRef.current = 0;
      toast(httpErrorMessage(err, "Procesul de plată nu a putut fi inițiat."), "error");
      setSubmitting(false);
    }
  };

  if (loadingRoom) {
    return (
      <div className="mx-auto max-w-[1100px] px-4 py-14">
        <div className="h-[280px] w-full animate-pulse rounded-2xl bg-[#eef2f8]" />
        <div className="mt-6 h-6 w-1/3 animate-pulse rounded bg-[#eef2f8]" />
      </div>
    );
  }

  if (roomError || !room) {
    return (
      <div className="mx-auto max-w-[700px] px-4 py-20 text-center">
        <p className="text-[16px] text-[#0d2c5c]" style={{ fontFamily: "var(--font-display)" }}>{roomError ?? "Camera nu a fost găsită."}</p>
        <Link to="/camere" className="mt-6 inline-block rounded-xl bg-[#0d2c5c] px-5 py-3 text-[11.5px] font-bold uppercase tracking-[0.14em] text-white hover:bg-[#c69a3f] hover:text-[#0d2c5c]">Vezi toate camerele</Link>
      </div>
    );
  }

  const images = (room.images ?? []).map((i) => i.image_url).filter(Boolean);

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-10 lg:py-14">
      <Link to="/camere" className="inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#6b7c99] hover:text-[#0d2c5c]"><ChevronLeft size={15} /> Înapoi la camere</Link>
      <RoomGallery images={images} title={room.title} />
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
        <RoomInfo room={room} roomId={String(roomId)} />
        <BookingSidebar
          room={room} today={today} checkIn={checkIn} setCheckIn={setCheckIn} checkOut={checkOut} setCheckOut={setCheckOut}
          blocked={blocked} adults={adults} setAdults={setAdults} children={children} setChildren={setChildren} plan={pricing.plan}
          setPlan={pricing.setPlan} requests={requests} setRequests={setRequests} couponCodeInput={pricing.couponCodeInput} setCouponCodeInput={pricing.setCouponCodeInput}
          validatingCoupon={pricing.validatingCoupon} onApplyCoupon={pricing.handleApplyCoupon} vipCoupons={pricing.vipCoupons} cookieConsentMarketing={cookieConsent?.marketing}
          appliedCoupon={pricing.appliedCoupon} onRemoveCoupon={() => pricing.setAppliedCoupon(null)} quote={pricing.quote} quoteError={pricing.quoteError}
          quoting={pricing.quoting} submitting={submitting} subtotal={pricing.subtotal} taxes={pricing.taxes} total={pricing.total} finalTotal={pricing.finalTotal}
          avgNight={pricing.avgNight} currentBasePrice={pricing.currentBasePrice} baseRatePerNight={pricing.baseRatePerNight} breakfastAddonPerNight={pricing.breakfastAddonPerNight}
          totalGuestsCount={pricing.totalGuestsCount} vipStayBenefit={pricing.vipStayBenefit} vipStayDiscount={pricing.vipStayDiscount} couponDiscount={pricing.couponDiscount}
          baseTotal={pricing.baseTotal} isDeal={pricing.isDeal} hasConflict={hasConflict} isHeldConflict={isHeldConflict} nights={nights}
          onFinalize={finalize} onConflictToast={() => toast("Perioada selectată conține zile indisponibile.", "error")}
        />
      </div>
    </div>
  );
}
