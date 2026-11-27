import { Link } from "react-router-dom";
import { Clock, Check, ArrowRight } from "lucide-react";
import { type ResortFacilityItem } from "../../types/resortFacilities";

interface ResortFacilityRowProps {
  facility: ResortFacilityItem;
  index: number;
}

export default function ResortFacilityRow({ facility, index }: ResortFacilityRowProps) {
  const reversed = index % 2 === 1;
  const organicRadius = reversed
    ? "rounded-[90px_30px_90px_30px]"
    : "rounded-[30px_90px_30px_90px]";

  return (
    <div id={`facility-${facility.slug}`} className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
      <div className={`relative lg:col-span-6 ${reversed ? "lg:order-2" : ""}`}>
        <div
          className={`hidden sm:block absolute -bottom-5 ${
            reversed ? "-left-5" : "-right-5"
          } w-[92%] h-[92%] bg-[#fdf8ec] border border-[#c69a3f]/30 ${organicRadius} -z-10`}
        />

        <div
          className={`absolute -top-6 ${
            reversed ? "right-6" : "left-6"
          } z-20 w-16 h-16 rounded-full bg-[#0d2c5c] text-[#e6b85c] border-4 border-white shadow-[0_12px_30px_rgba(13,44,92,0.25)] flex items-center justify-center font-['Cormorant_Garamond',serif] text-2xl italic`}
        >
          0{index + 1}
        </div>

        <div
          className={`relative h-[340px] sm:h-[440px] w-full overflow-hidden bg-[#0d2c5c] shadow-[0_25px_60px_-20px_rgba(13,44,92,0.3)] ${organicRadius}`}
        >
          <img
            src={facility.image}
            alt={facility.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-[1200ms] hover:scale-105"
          />
        </div>
      </div>

      <div className={`lg:col-span-6 flex flex-col items-start ${reversed ? "lg:order-1" : ""}`}>
        <p className="font-sans text-[11px] font-bold tracking-[0.22em] uppercase text-[#c69a3f] mb-3 flex items-center gap-3">
          <span className="w-10 h-px bg-[#c69a3f]" />
          {facility.eyebrow}
        </p>

        <h2 className="font-['Cormorant_Garamond',serif] text-[clamp(2.3rem,4vw,3.6rem)] font-normal leading-[1.06] text-[#0d2c5c] mb-4">
          {facility.title}
        </h2>

        <div className="flex flex-wrap items-center gap-y-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#0d2c5c] py-3.5 border-y border-[#0d2c5c]/12 w-full mb-5">
          <span className="inline-flex items-center gap-1.5">
            <Clock size={14} className="text-[#c69a3f]" />
            {facility.schedule}
          </span>
          <span className="mx-3 text-[#c69a3f]">·</span>
          <span>{facility.accessLabel}</span>
        </div>

        <p className="text-[15.5px] leading-[1.85] text-[#334155] font-light mb-6">
          {facility.summary}
        </p>

        <ul className="space-y-2.5 mb-8">
          {facility.highlights.map((h: any) => (
            <li key={h} className="flex items-start gap-3 text-[14.5px] text-[#1e293b]">
              <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0d2c5c]/10 text-[#0d2c5c]">
                <Check size={12} strokeWidth={2.5} />
              </span>
              <span>{h}</span>
            </li>
          ))}
        </ul>

        <Link
          to={facility.ctaLink}
          className="group inline-flex items-center gap-4 bg-[#0d2c5c] hover:bg-[#c69a3f] text-white hover:text-[#0d2c5c] text-[11.5px] tracking-[0.2em] uppercase font-bold py-4 px-8 rounded-full transition-all duration-300 shadow-[0_12px_30px_-10px_rgba(13,44,92,0.35)] no-underline"
        >
          <span>{facility.ctaLabel}</span>
          <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
