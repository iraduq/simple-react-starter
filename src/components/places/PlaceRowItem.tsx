import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { Place } from "../../types/places";
import { placeDescription, placeImage } from "../../services/placesService";
import { getCategoryMeta } from "../../types/placesCategory";

interface PlaceRowItemProps {
  place: Place;
  index: number;
  itemsCount: number;
  onOpen: (p: Place) => void;
}

export default function PlaceRowItem({ place, index, itemsCount, onOpen }: PlaceRowItemProps) {
  const m = getCategoryMeta(place.category);
  const flip = index % 2 === 1;
  const Icon = m.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center py-14 first:pt-0 last:pb-0"
    >
      <div className={`relative lg:col-span-5 ${flip ? "lg:order-2" : ""}`}>
        <div
          onClick={() => onOpen(place)}
          className="group relative h-[260px] sm:h-[340px] w-full overflow-hidden rounded-2xl bg-[#0d2c5c] cursor-pointer shadow-[0_20px_50px_-24px_rgba(13,44,92,0.35)]"
        >
          <img
            src={placeImage(place) || m.fallback}
            alt={place.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-[900ms] group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#071833]/55 via-transparent to-transparent" />
          {place.badge && (
            <span className="absolute bottom-5 left-5 rounded-full bg-white/92 backdrop-blur-md px-4 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.2em] text-[#0d2c5c]">
              {place.badge}
            </span>
          )}
        </div>
      </div>

      <div className={`lg:col-span-7 flex flex-col items-start ${flip ? "lg:order-1" : ""}`}>
        <p className="font-sans text-[11px] font-bold tracking-[0.22em] uppercase text-[#c69a3f] mb-3 flex items-center gap-3">
          <Icon size={14} strokeWidth={2} />
          {m.label}
        </p>
        <h3 className="font-['Cormorant_Garamond',serif] text-[clamp(2rem,3.4vw,3rem)] font-normal leading-[1.08] tracking-[-0.01em] text-[#0d2c5c] mb-4">
          {place.title}
        </h3>
        <p className="font-sans text-[#475569] leading-[1.8] text-[15px] font-light mb-6 max-w-xl">
          {placeDescription(place) ||
            "Experimentează servicii de înaltă clasă, ingrediente proaspete și livrare direct în camera ta activă pe toată durata sejurului."}
        </p>

        <div className="flex flex-wrap items-center gap-x-8 gap-y-2 mb-7 text-[12px] font-semibold uppercase tracking-[0.16em] text-[#0d2c5c]/70">
          <span className="flex items-center gap-2">
            <span className="h-1 w-1 rotate-45 bg-[#c69a3f]" />
            {itemsCount > 0 ? `${itemsCount} preparate în meniu` : "Meniu live"}
          </span>
          <span className="flex items-center gap-2">
            <span className="h-1 w-1 rotate-45 bg-[#c69a3f]" />
            Room service în cameră
          </span>
        </div>

        <button
          type="button"
          onClick={() => onOpen(place)}
          className="group inline-flex items-center gap-3 bg-[#0d2c5c] hover:bg-[#c69a3f] text-white hover:text-[#0d2c5c] text-[11.5px] tracking-[0.2em] uppercase font-bold py-3.5 px-7 rounded-full transition-all duration-300 shadow-[0_12px_30px_-12px_rgba(13,44,92,0.4)] cursor-pointer"
        >
          <span>Deschide Meniul & Comandă</span>
          <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
        </button>
      </div>
    </motion.div>
  );
}
