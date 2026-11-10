import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  CalendarDays,
  Check,
  ChevronLeft,
  Loader as Loader2,
  Maximize,
  ShieldCheck,
  Star,
  TicketPercent,
  Users,
} from "lucide-react";
import { apiFetch } from "../lib/api";
import { httpErrorMessage } from "../services/apiClient";
import { getRoomPricing, ratePlanFactor } from "../services/pricingService";
import {
  toUtcIso,
  getRoomCalendar,
  unavailableDates,
} from "../services/roomsService";
import DatePicker from "../components/DatePicker";
import RoomReviewsSection from "../components/RoomReviewsSection";
import { useToast } from "../components/Toast";
import { useAdminLiveSync } from "../context/AdminLiveSyncContext";
import { ron, toISODate, nightsBetween, dayLabel } from "../lib/format";
import { hasSession } from "../lib/auth";
import { WS_URL } from "../lib/config";
import {
  RATE_PLANS,
  type BookingPriceCalculation,
  type RatePlanCode,
  type RoomDetail as RoomDetailType,
} from "../types/rooms";

const inputCls =
  "w-full rounded-xl border border-[#e1e8f0] bg-white px-3.5 py-2.5 text-[14px] text-[#0d2c5c] outline-none focus:border-[#c69a3f]";
const labelCls =
  "mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#8595aa]";

export default function RoomDetail() {
  const { roomId = "" } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const today = toISODate(new Date());

  const params =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams();

  const [room, setRoom] = useState<RoomDetailType | null>(null);
  const [loadingRoom, setLoadingRoom] = useState(true);
  const [roomError, setRoomError] = useState<string | null>(null);

  const [checkIn, setCheckIn] = useState(params.get("check_in") ?? "");
  const [checkOut, setCheckOut] = useState(params.get("check_out") ?? "");
  const [adults, setAdults] = useState(Number(params.get("adults")) || 2);
  const [children, setChildren] = useState(Number(params.get("children")) || 0);
  const [plan, setPlan] = useState<RatePlanCode>("flexible");
  const [requests, setRequests] = useState("");

  const [quote, setQuote] = useState<BookingPriceCalculation | null>(null);
  const [factor, setFactor] = useState(1);
  const [quoting, setQuoting] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    description: string;
    discount_type: string;
    discount_value: number;
    discount_amount: number;
    final_total: number;
  } | null>(null);

  const [blocked, setBlocked] = useState<Set<string>>(new Set());
  const [liveHeldInfo, setLiveHeldInfo] = useState<{
    expiresAt: string;
    checkIn: string;
    checkOut: string;
  } | null>(null);

  // Real-time live synchronization to prevent double booking and sync room state
  useAdminLiveSync({
    topic: "rooms",
    onSync: (payload) => {
      if (!payload || !roomId) return;
      if (String(payload.room_id) === String(roomId)) {
        if (payload.event === "room_held") {
          setLiveHeldInfo({
            expiresAt: payload.expires_at,
            checkIn: payload.check_in ? payload.check_in.slice(0, 10) : "",
            checkOut: payload.check_out ? payload.check_out.slice(0, 10) : "",
          });
        } else if (payload.event === "room_released") {
          setLiveHeldInfo(null);
        } else if (payload.event === "rooms_updated" || payload.event === "pricing_updated") {
          apiFetch<RoomDetailType>(`/rooms/${roomId}`).then(setRoom).catch(() => {});
        } else if (payload.event === "room_booked" || payload.event === "payment_confirmed") {
          setLiveHeldInfo(null);
          if (payload.check_in && payload.check_out) {
            const bookedDays = nightsBetween(
              payload.check_in.slice(0, 10),
              payload.check_out.slice(0, 10)
            );
            setBlocked((prev) => {
              const next = new Set(prev);
              bookedDays.forEach((d) => next.add(d));
              return next;
            });

          }
        }
      }
    },
  });

  const nightList = nightsBetween(checkIn, checkOut);
  const nights = nightList.length;
  const conflictNights = nightList.filter((d) => blocked.has(d));
  const hasConflict = conflictNights.length > 0;
  const isHeldConflict = Boolean(
    liveHeldInfo &&
    checkIn &&
    checkOut &&
    liveHeldInfo.checkIn < checkOut &&
    liveHeldInfo.checkOut > checkIn
  );

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await apiFetch<RoomDetailType>(`/rooms/${roomId}`);
        if (!active) return;
        setRoom(data);
      } catch (err) {
        if (!active) return;
        setRoomError(httpErrorMessage(err, "Nu am putut încărca camera."));
      } finally {
        if (active) setLoadingRoom(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [roomId]);

  useEffect(() => {
    if (!roomId) return;
    let active = true;
    const start = toISODate(new Date());
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 8);
    (async () => {
      try {
        const entries = await getRoomCalendar(
          roomId,
          start,
          toISODate(endDate),
        );
        if (active) setBlocked(unavailableDates(entries));
      } catch {
        if (active) setBlocked(new Set());
      }
    })();
    return () => {
      active = false;
    };
  }, [roomId]);

  const loadQuote = useCallback(async () => {
    if (!roomId || nights === 0 || hasConflict) {
      setQuote(null);
      return;
    }
    setQuoting(true);
    setQuoteError(null);
    try {
      const res = await getRoomPricing(
        roomId,
        checkIn,
        checkOut,
        plan,
        adults,
        children,
      );
      setQuote(res);
      setFactor(1);
    } catch (err) {
      setQuote(null);
      setQuoteError(httpErrorMessage(err, "Nu am putut calcula prețul."));
    } finally {
      setQuoting(false);
    }
  }, [
    roomId,
    checkIn,
    checkOut,
    nights,
    hasConflict,
    plan,
    adults,
    children,
  ]);

  useEffect(() => {
    void loadQuote();
  }, [loadQuote]);

  // Verifică dacă backend-ul a aplicat deja planul tarifar în calcul
  const backendHandledPlan =
    quote?.nightly_breakdown?.[0]?.debug_info?.rate_plan_code === plan;

  // Funcție de ajustare pe fiecare noapte dacă backend-ul nu a procesat planul
  const adjustNightPrice = useCallback(
    (baseNightPrice: number) => {
      if (backendHandledPlan) return baseNightPrice;
      if (plan === "non_refundable") {
        return Math.round(baseNightPrice * 0.9 * 100) / 100;
      }
      if (plan === "breakfast") {
        return Math.round((baseNightPrice + 35) * 100) / 100;
      }
      return baseNightPrice;
    },
    [backendHandledPlan, plan],
  );

  // Subtotal calculat dinamic cu pricing engine + planul tarifar activ
  const subtotal = useMemo(() => {
    if (!quote) return null;
    if (backendHandledPlan) return quote.subtotal;
    const computed = quote.nightly_breakdown.reduce(
      (sum, n) => sum + adjustNightPrice(n.price_per_night),
      0,
    );
    return Math.round(computed * 100) / 100;
  }, [quote, backendHandledPlan, adjustNightPrice]);

  const taxes = useMemo(() => {
    if (subtotal == null) return null;
    return Math.round(subtotal * 0.19 * 100) / 100;
  }, [subtotal]);

  const total = useMemo(() => {
    if (subtotal == null || taxes == null) return null;
    return Math.round((subtotal + taxes) * 100) / 100;
  }, [subtotal, taxes]);

  const avgNight = useMemo(() => {
    if (subtotal != null && quote && quote.nights > 0) {
      return Math.round((subtotal / quote.nights) * 100) / 100;
    }
    return null;
  }, [subtotal, quote]);

  // Prețul de bază pe noapte: dacă datele sunt alese, folosește media din motorul de prețuri; dacă nu, base_price-ul camerei
  const baseRatePerNight = useMemo(() => {
    if (quote && quote.nights > 0) {
      return quote.subtotal / quote.nights;
    }
    return room?.base_price ?? 150;
  }, [quote, room?.base_price]);

  const currentBasePrice = useMemo(() => {
    if (plan === "non_refundable") return Math.round(baseRatePerNight * 0.9);
    if (plan === "breakfast") return Math.round(baseRatePerNight + 35);
    return Math.round(baseRatePerNight);
  }, [plan, baseRatePerNight]);
  const couponDiscount =
    appliedCoupon && total != null
      ? appliedCoupon.discount_type === "percent"
        ? Math.round(total * (appliedCoupon.discount_value / 100))
        : Math.min(total, appliedCoupon.discount_value)
      : 0;
  const finalTotal = total != null ? Math.max(1, total - couponDiscount) : null;

  const handleApplyCoupon = async () => {
    if (!couponCodeInput.trim()) return;
    setValidatingCoupon(true);
    try {
      const res = await apiFetch<{
        valid: boolean;
        code: string;
        description: string;
        discount_type: string;
        discount_value: number;
        discount_amount: number;
        final_total: number;
      }>("/coupons/validate", {
        method: "POST",
        body: JSON.stringify({
          code: couponCodeInput.trim().toUpperCase(),
          subtotal: total ?? room?.base_price ?? 0,
        }),
      });
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
  const isDeal =
    subtotal != null && baseTotal != null && subtotal < baseTotal - 0.5;

  const finalize = async () => {
    if (nights === 0) {
      toast("Alege datele de check-in și check-out.", "warning");
      return;
    }
    if (hasConflict) {
      toast(
        "Perioada selectată conține zile indisponibile. Vă rugăm să alegeți alte date.",
        "error",
      );
      return;
    }
    if (!hasSession()) {
      toast("Autentifică-te pentru a finaliza rezervarea.", "warning");
      navigate("/login");
      return;
    }
    if (!total) {
      toast("Nu se poate calcula prețul total.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const stripeRes = await apiFetch<{ checkout_url: string }>(
        "/payments/create-checkout-session",
        {
          method: "POST",
          body: JSON.stringify({
            room_id: String(roomId),
            check_in: toUtcIso(checkIn),
            check_out: toUtcIso(checkOut),
            guests_adults: adults,
            guests_children: children,
            rate_plan_code: plan,
            total_price: finalTotal ?? total,
            coupon_code: appliedCoupon?.code ?? null,
            special_requests: requests.trim()
              ? requests.trim().slice(0, 500)
              : null,
          }),
        },
      );

      if (!stripeRes?.checkout_url) {
        throw new Error("Nu s-a putut genera link-ul de plată Stripe.");
      }

      window.location.href = stripeRes.checkout_url;
    } catch (err) {
      toast(
        httpErrorMessage(err, "Procesul de plată nu a putut fi inițiat."),
        "error",
      );
      setSubmitting(false);
    }
  };

  if (loadingRoom) {
    return (
      <div className="mx-auto max-w-[1100px] px-4 py-14">
        <div className="h-[280px] w-full animate-pulse rounded-2xl bg-[#eef2f8]" />
        <div className="mt-6 h-6 w-1/3 animate-pulse rounded bg-[#eef2f8]" />
        <div className="mt-3 h-4 w-2/3 animate-pulse rounded bg-[#f3f6fa]" />
      </div>
    );
  }

  if (roomError || !room) {
    return (
      <div className="mx-auto max-w-[700px] px-4 py-20 text-center">
        <p
          className="text-[16px] text-[#0d2c5c]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {roomError ?? "Camera nu a fost găsită."}
        </p>
        <Link
          to="/camere"
          className="mt-6 inline-block rounded-xl bg-[#0d2c5c] px-5 py-3 text-[11.5px] font-bold uppercase tracking-[0.14em] text-white hover:bg-[#c69a3f] hover:text-[#0d2c5c]"
        >
          Vezi toate camerele
        </Link>
      </div>
    );
  }

  const images = (room.images ?? []).map((i) => i.image_url).filter(Boolean);

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-10 lg:py-14">
      <Link
        to="/camere"
        className="inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#6b7c99] hover:text-[#0d2c5c]"
      >
        <ChevronLeft size={15} /> Înapoi la camere
      </Link>

      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <img
            src={images[0]}
            alt={room.title}
            className="h-[300px] w-full rounded-2xl object-cover sm:col-span-2"
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-1">
            {images.slice(1, 3).map((src) => (
              <img
                key={src}
                src={src}
                alt={room.title}
                className="h-[144px] w-full rounded-2xl object-cover"
                loading="lazy"
              />
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#c69a3f]">
            {room.room_type?.name}
          </p>
          <h1
            className="mt-2 text-[clamp(1.7rem,3vw,2.4rem)] leading-tight text-[#0d2c5c]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {room.title}
          </h1>

          <div className="mt-2.5 flex flex-wrap items-center gap-3">
            <a
              href="#recenzii"
              className="inline-flex items-center gap-1.5 rounded-full border border-[#e1e8f0] bg-[#f8fafc] px-3.5 py-1 text-[12px] font-semibold text-[#0d2c5c] hover:border-[#c69a3f] hover:bg-[#fff9ed] transition-colors shadow-2xs"
            >
              <Star size={13} className="fill-[#c69a3f] text-[#c69a3f]" />
              <span className="font-bold">5.00</span>
              <span className="text-[#8595aa]">·</span>
              <span className="text-[#4f6280] font-normal hover:text-[#0d2c5c]">
                recenzii verificate ale oaspeților ↓
              </span>
            </a>
          </div>

          <p className="mt-3 text-[14.5px] leading-relaxed text-[#6b7c99]">
            {room.description}
          </p>

          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              {
                Icon: Users,
                label: `${room.max_guests_adults} adulți${room.max_guests_children ? ` + ${room.max_guests_children} copii` : ""}`,
              },
              {
                Icon: Maximize,
                label: room.size_sqm ? `${room.size_sqm} m²` : "—",
              },
            ].map(({ Icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-2 rounded-xl border border-[#e1e8f0] bg-white px-2 py-4 text-center"
              >
                <Icon size={16} className="text-[#c69a3f]" />
                <span className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[#3d4f6b]">
                  {label}
                </span>
              </div>
            ))}
          </div>

          {room.facilities && room.facilities.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-2">
              {room.facilities.map((f) => (
                <li
                  key={String(f.id)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#e1e8f0] bg-[#f6f9fd] px-3 py-1.5 text-[12px] text-[#0d2c5c]"
                >
                  <Check size={12} className="text-[#c69a3f]" /> {f.name}
                </li>
              ))}
            </ul>
          )}

          <div id="recenzii">
            <RoomReviewsSection roomId={String(roomId)} />
          </div>

          {quote && quote.nightly_breakdown.length > 0 && (
            <section className="mt-9 rounded-2xl border border-[#e1e8f0] bg-white p-5">
              <h2
                className="flex items-center gap-2 text-[15px] text-[#0d2c5c]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                <CalendarDays size={16} className="text-[#c69a3f]" /> Preț
                dinamic pe nopți
              </h2>
              <p className="mt-1 text-[12px] text-[#8595aa]">
                Tarifele includ sezonalitatea, nopțile orfane și planul tarifar
                selectat.
              </p>
              <ul className="mt-4 divide-y divide-[#eef2f8]">
                {quote.nightly_breakdown.map((n) => {
                  const nightPrice = adjustNightPrice(n.price_per_night);
                  return (
                    <li
                      key={n.date}
                      className="flex items-center justify-between py-2.5 text-[13.5px]"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[#3d4f6b]">{dayLabel(n.date)}</span>
                        {plan === "breakfast" && (
                          <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                            +mic dejun
                          </span>
                        )}
                        {plan === "non_refundable" && (
                          <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                            -10%
                          </span>
                        )}
                      </div>
                      <span className="font-semibold text-[#0d2c5c]">
                        {ron(nightPrice)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </div>

        <aside className="h-fit rounded-2xl border border-[#e1e8f0] bg-white p-5 lg:sticky lg:top-24">
          <div className="flex items-end gap-2">
            <p className="text-[24px] font-bold text-[#0d2c5c]">
              {quoting ? "…" : ron(total ?? avgNight ?? currentBasePrice)}
            </p>
            <span className="pb-1 text-[12px] text-[#8595aa]">
              {total != null
                ? `total · ${nights} ${nights === 1 ? "noapte" : "nopți"}`
                : "/ noapte"}
            </span>
            {isDeal && (
              <span className="ml-auto rounded-full bg-[#f3e6c4] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#8a6516]">
                Ofertă
              </span>
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <DatePicker
              variant="field"
              label="Check-in"
              value={checkIn}
              minDate={today}
              disabledDates={blocked}
              onChange={(v) => {
                setCheckIn(v);
                if (checkOut && checkOut <= v) setCheckOut("");
              }}
            />
            <DatePicker
              variant="field"
              label="Check-out"
              value={checkOut}
              minDate={checkIn || today}
              disabledDates={blocked}
              onChange={(v) => {
                const conflicts = nightsBetween(checkIn, v).filter((d) =>
                  blocked.has(d),
                );
                if (conflicts.length > 0) {
                  toast(
                    "Perioada selectată conține zile indisponibile. Vă rugăm să alegeți alte date.",
                    "error",
                  );
                  return;
                }
                setCheckOut(v);
              }}
            />
            <label className="block">
              <span className={labelCls}>Adulți</span>
              <input
                type="number"
                min={1}
                max={room.max_guests_adults || 10}
                value={adults}
                onChange={(e) => setAdults(Number(e.target.value))}
                className={inputCls}
              />
            </label>
            <label className="block">
              <span className={labelCls}>Copii</span>
              <input
                type="number"
                min={0}
                max={room.max_guests_children || 0}
                value={children}
                onChange={(e) => setChildren(Number(e.target.value))}
                className={inputCls}
              />
            </label>
          </div>

          <div className="mt-4">
            <span className={labelCls}>Plan tarifar</span>
            <div className="flex flex-col gap-2">
              {[
                {
                  code: "flexible" as const,
                  label: "Flexibil",
                  badge: null,
                  badgeColor: "",
                  hint: "Anulare gratuită · plata la sosire",
                  priceVal: ron(Math.round(baseRatePerNight)),
                },
                {
                  code: "non_refundable" as const,
                  label: "Nerambursabil",
                  badge: "-10%",
                  badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
                  hint: "Cel mai bun preț · fără anulare",
                  priceVal: ron(Math.round(baseRatePerNight * 0.9)),
                },
                {
                  code: "breakfast" as const,
                  label: "Mic dejun inclus",
                  badge: "+35 RON",
                  badgeColor: "bg-amber-50 text-amber-900 border-amber-200",
                  hint: "Bufet suedez inclus zilnic",
                  priceVal: ron(Math.round(baseRatePerNight + 35)),
                },
              ].map((p) => {
                const isSelected = plan === p.code;
                return (
                  <button
                    key={p.code}
                    type="button"
                    onClick={() => setPlan(p.code)}
                    className={`group w-full rounded-2xl border px-3.5 py-2.5 text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? "border-[#c69a3f] bg-[#fffcf5] ring-1.5 ring-[#c69a3f]/30 shadow-xs"
                        : "border-[#e2e8f0] bg-white hover:border-[#cbd5e1] hover:bg-[#fafbfc]"
                    }`}
                  >
                    {/* Stânga: Radio dot + Titlu + Subtitlu scurt pe o singură linie */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? "border-[#c69a3f] bg-[#c69a3f]"
                            : "border-slate-300 bg-white group-hover:border-slate-400"
                        }`}
                      >
                        {isSelected && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[13px] font-bold whitespace-nowrap truncate ${
                              isSelected ? "text-[#0d2c5c]" : "text-[#1e293b]"
                            }`}
                          >
                            {p.label}
                          </span>
                          {p.badge && (
                            <span
                              className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded-md border whitespace-nowrap shrink-0 ${p.badgeColor}`}
                            >
                              {p.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#8595aa] whitespace-nowrap truncate mt-0.5">
                          {p.hint}
                        </p>
                      </div>
                    </div>

                    {/* Dreapta: Preț compact și curat pe o linie */}
                    <div className="text-right shrink-0">
                      <div
                        className={`text-[13.5px] font-black whitespace-nowrap ${
                          isSelected ? "text-[#0d2c5c]" : "text-[#334155]"
                        }`}
                      >
                        {p.priceVal}
                      </div>
                      <div className="text-[10px] text-[#8595aa] whitespace-nowrap">
                        / noapte
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

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

          <div className="mt-4">
            <span className={labelCls}>Cod Promoțional / Cupon</span>
            <div className="flex gap-2">
              <input
                value={couponCodeInput}
                onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                placeholder="Ex: VARA2026 sau ESYVIP"
                className={`${inputCls} font-mono uppercase`}
              />
              <button
                type="button"
                disabled={validatingCoupon || !couponCodeInput.trim()}
                onClick={handleApplyCoupon}
                className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-[#fdf8ec] border border-[#c69a3f] px-3.5 py-2 text-xs font-bold text-[#0d2c5c] hover:bg-[#c69a3f] transition cursor-pointer disabled:opacity-50"
              >
                <TicketPercent size={14} />
                {validatingCoupon ? "..." : "Aplică"}
              </button>
            </div>
            {appliedCoupon && (
              <div className="mt-2 flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs text-emerald-900">
                <span>
                  Cupon <strong>{appliedCoupon.code}</strong> aplicat!
                </span>
                <button
                  type="button"
                  onClick={() => setAppliedCoupon(null)}
                  className="text-rose-700 font-bold hover:underline cursor-pointer"
                >
                  Elimină
                </button>
              </div>
            )}
          </div>

          <div className="mt-4 space-y-1.5 border-t border-[#eef2f8] pt-4 text-[13.5px]">
            {quoteError && (
              <p
                role="alert"
                className="rounded-xl bg-red-50 px-3 py-2 text-[12.5px] text-red-700"
              >
                {quoteError}
              </p>
            )}
            {hasConflict && (
              <p
                role="alert"
                className="rounded-xl bg-red-50 px-3 py-2 text-[12.5px] text-red-700"
              >
                Perioada selectată conține zile indisponibile. Vă rugăm să
                alegeți alte date.
              </p>
            )}
            {isHeldConflict && (
              <div
                role="alert"
                className="flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2.5 text-[12.5px] text-amber-900"
              >
                <span className="h-2 w-2 shrink-0 rounded-full bg-amber-500 animate-pulse" />
                <span>
                  Această cameră este reținută temporar de un alt oaspete pentru finalizarea plății. Vă rugăm să așteptați câteva minute sau să alegeți altă perioadă.
                </span>
              </div>
            )}
            {nights === 0 && !quoteError && (
              <p className="text-[12.5px] text-[#8595aa]">
                Alege datele pentru a vedea prețul total.
              </p>
            )}
            {quote && subtotal != null && taxes != null && total != null && (
              <>
                <div className="flex justify-between items-center text-[#3d4f6b]">
                  <span>
                    {quote.nights} {quote.nights === 1 ? "noapte" : "nopți"} ·
                    cazare
                  </span>
                  <span>{ron(quote.subtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-[#3d4f6b]">
                  <span className="flex items-center gap-1.5">
                    <span>Plan tarifar</span>
                    <span className="text-[10.5px] font-bold text-[#0d2c5c] bg-[#f8fafc] px-2 py-0.5 rounded border border-[#e2e8f0]">
                      {plan === "flexible" && "Flexibil"}
                      {plan === "non_refundable" && "Nerambursabil"}
                      {plan === "breakfast" && "Mic dejun"}
                    </span>
                  </span>
                  <span
                    className={`text-xs font-bold ${
                      plan === "non_refundable"
                        ? "text-emerald-700"
                        : plan === "breakfast"
                        ? "text-amber-800"
                        : "text-[#3d4f6b]"
                    }`}
                  >
                    {plan === "flexible" && "Inclus"}
                    {plan === "non_refundable" && `-${ron(quote.subtotal * 0.1)} (-10%)`}
                    {plan === "breakfast" && `+${ron(35 * quote.nights)} (+35/noapte)`}
                  </span>
                </div>
                {plan !== "flexible" && (
                  <div className="flex justify-between items-center text-[#3d4f6b] text-[12px] font-medium pt-0.5 border-t border-[#f1f5f9]">
                    <span>Subtotal ajustat</span>
                    <span className="font-semibold text-[#0d2c5c]">{ron(subtotal)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#3d4f6b]">
                  <span>Taxe (TVA 19%)</span>
                  <span>{ron(taxes)}</span>
                </div>
                <div className="flex justify-between pt-2 text-[16px] font-bold text-[#0d2c5c]">
                  <span>Total</span>
                  <span>
                    {quoting ? "…" : ron(finalTotal ?? total)}
                    {couponDiscount > 0 && (
                      <span className="ml-2 text-xs font-semibold text-emerald-700">
                        (-{ron(couponDiscount)} cupon)
                      </span>
                    )}
                  </span>
                </div>
                <p className="pt-1 text-[11.5px] leading-relaxed text-[#8595aa]">
                  Preț total pentru {quote.nights}{" "}
                  {quote.nights === 1 ? "noapte" : "nopți"}, incluzând taxele și
                  reducerile aplicate (sezonalitate, weekend, nopți orfane, plan
                  tarifar).
                </p>
                {isDeal && baseTotal != null && (
                  <p className="text-[11.5px] text-[#8595aa]">
                    Preț standard{" "}
                    <span className="line-through">{ron(baseTotal)}</span>
                  </p>
                )}
              </>
            )}
          </div>

          <button
            type="button"
            onClick={finalize}
            disabled={
              submitting ||
              quoting ||
              nights === 0 ||
              hasConflict ||
              isHeldConflict ||
              !!quoteError
            }
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0d2c5c] px-5 py-3.5 text-[12px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-[#c69a3f] hover:text-[#0d2c5c] disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <ShieldCheck size={16} />
            )}
            Plătește prin Stripe
          </button>
          <p className="mt-2 text-center text-[11px] text-[#8595aa]">
            Plată securizată prin Stripe · Confirmare instantanee pe email
          </p>
          <div className="hidden" />
        </aside>
      </div>
    </div>
  );
}
