import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { RESORT_FACILITIES } from "../types/resortFacilities";
import ResortFacilitiesHero from "../components/facilities/ResortFacilitiesHero";
import ResortFacilityRow from "../components/facilities/ResortFacilityRow";

export default function ResortFacilities() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSlug = searchParams.get("item") || "all";
  const [selectedSlug, setSelectedSlug] = useState<string>(activeSlug);

  useEffect(() => {
    const item = searchParams.get("item");
    if (item) {
      setSelectedSlug(item);
      const el = document.getElementById(`facility-${item}`);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 120);
      }
    } else {
      setSelectedSlug("all");
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-white text-[#0d2c5c]">
      <ResortFacilitiesHero videoRef={videoRef} />
      <section className="mx-auto max-w-7xl px-5 md:px-10 py-16 md:py-24">
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-20">
          <button
            type="button"
            onClick={() => setSearchParams({})}
            className={`px-5 py-2.5 rounded-full border text-[11.5px] font-bold uppercase tracking-[0.16em] transition-all cursor-pointer ${
              selectedSlug === "all"
                ? "bg-[#0d2c5c] text-white border-[#0d2c5c] shadow-sm"
                : "bg-white border-[#e2e8f0] text-[#475569] hover:border-[#0d2c5c] hover:text-[#0d2c5c]"
            }`}
          >
            Toate Facilitățile
          </button>
          {RESORT_FACILITIES.map((f: any) => {
            const Icon = f.icon;
            const isSelected = selectedSlug === f.slug;
            return (
              <button
                key={f.slug}
                type="button"
                onClick={() => setSearchParams({ item: f.slug })}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full border text-[11.5px] font-bold uppercase tracking-[0.16em] transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#0d2c5c] text-white border-[#0d2c5c] shadow-sm"
                    : "bg-white border-[#e2e8f0] text-[#475569] hover:border-[#0d2c5c] hover:text-[#0d2c5c]"
                }`}
              >
                <Icon size={14} className={isSelected ? "text-[#e6b85c]" : "text-[#0d2c5c]"} />
                {f.title}
              </button>
            );
          })}
        </div>

        <div className="space-y-24 md:space-y-32">
          {RESORT_FACILITIES.map((f: any, index: number) => (
            <ResortFacilityRow key={f.slug} facility={f} index={index} />
          ))}
        </div>
      </section>
    </div>
  );
}
