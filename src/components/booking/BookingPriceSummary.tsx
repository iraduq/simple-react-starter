import { ron, dayLabel } from "../../lib/format";
import { ratePlanLabel } from "../../types/bookings";
import type { PricingNight } from "../../types/pricing";

/**
 * Rezumatul rezervării — afișează exact prețurile primite de la
 * GET /api/pricing/calculate (o cerere per noapte). Nicio regulă de pricing
 * nu este recalculată în frontend.
 */
export default function BookingPriceSummary({
  nights,
  planCode,
  loading,
  error,
}: {
  nights: PricingNight[];
  planCode: string;
  loading?: boolean;
  error?: string | null;
}) {
  const subtotal = nights.reduce((sum, n) => sum + Number(n.price || 0), 0);

  return (
    <section
      aria-label="Rezumat rezervare"
      className="rounded-2xl border border-[#e1e8f0] bg-[#f9fbfe] p-5"
    >
      <h3
        className="text-[17px] text-[#0d2c5c]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Rezumat rezervare
      </h3>

      {loading ? (
        <div className="mt-4 space-y-2" aria-busy="true">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-4 w-full animate-pulse rounded bg-[#eef2f7]" />
          ))}
        </div>
      ) : error ? (
        <p className="mt-4 text-[13px] text-red-600">{error}</p>
      ) : nights.length === 0 ? (
        <p className="mt-4 text-[13px] text-[#8595aa]">
          Alege datele sejurului pentru a vedea tarifele pe nopți.
        </p>
      ) : (
        <>
          <ul className="mt-4 space-y-1.5">
            {nights.map((n) => (
              <li key={n.date} className="flex items-center justify-between text-[13.5px]">
                <span className="text-[#3d4f6b]">{dayLabel(n.date)}</span>
                <span className="font-semibold tabular-nums text-[#0d2c5c]">{ron(n.price)}</span>
              </li>
            ))}
          </ul>

          <div className="my-4 border-t border-dashed border-[#d8e2ef]" />

          <dl className="space-y-1.5 text-[13.5px]">
            <div className="flex items-center justify-between">
              <dt className="text-[#3d4f6b]">Plan tarifar</dt>
              <dd className="font-medium text-[#0d2c5c]">{ratePlanLabel(planCode)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-[#3d4f6b]">
                Nopți <span className="text-[#8595aa]">({nights.length})</span>
              </dt>
              <dd className="text-[#0d2c5c]">{ron(subtotal / (nights.length || 1))} / noapte mediu</dd>
            </div>
            <div className="flex items-center justify-between pt-2 text-[15px]">
              <dt className="font-semibold text-[#0d2c5c]">Subtotal</dt>
              <dd className="font-bold tabular-nums text-[#0d2c5c]">{ron(subtotal)}</dd>
            </div>
          </dl>
        </>
      )}
    </section>
  );
}
