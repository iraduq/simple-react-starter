import { motion } from "framer-motion";
import { X } from "lucide-react";
import type { Place, MenuCategory } from "../../../types/places";
import { placeDescription, placeImage, menuForPlace } from "../../../services/placesService";
import PlaceMenu from "../../../components/PlaceMenu";
import { getCategoryMeta } from "../types";

interface PlaceSlideOverModalProps {
  open: Place;
  menu: MenuCategory[];
  onClose: () => void;
}

export default function PlaceSlideOverModal({ open, menu, onClose }: PlaceSlideOverModalProps) {
  const m = getCategoryMeta(open.category);

  return (
    <motion.div
      className="fixed inset-0 z-[600] flex justify-end bg-[#07203f]/65 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.aside
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 260 }}
        onClick={(e) => e.stopPropagation()}
        className="h-full w-full max-w-3xl overflow-y-auto bg-white shadow-2xl"
      >
        <div className="relative h-60 bg-[#0d2c5c] sm:h-68 overflow-hidden">
          <img
            src={placeImage(open) || m.fallback}
            alt={open.title}
            className="h-full w-full object-cover opacity-55"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d2c5c] via-[#0d2c5c]/40 to-transparent" />
          <button
            type="button"
            onClick={onClose}
            aria-label="Închide"
            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/15 text-white backdrop-blur-md transition-colors hover:bg-white hover:text-[#0d2c5c] cursor-pointer"
          >
            <X size={18} />
          </button>
          <div className="absolute bottom-8 left-6 right-6 sm:left-8 sm:right-8">
            <span className="inline-flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.22em] text-[#e6b85c]">
              <span className="h-px w-6 bg-[#e6b85c]" />
              {m.label}
            </span>
            <h2 className="mt-1 font-['Cormorant_Garamond',serif] text-[36px] sm:text-[42px] leading-tight text-white">
              {open.title}
            </h2>
          </div>
          <svg viewBox="0 0 400 24" preserveAspectRatio="none" className="absolute bottom-0 left-0 h-5 w-full text-white">
            <path d="M0 24 V12 Q50 0 100 12 T200 12 T300 12 T400 12 V24 Z" fill="currentColor" />
          </svg>
        </div>

        <div className="p-6 sm:p-8">
          <p className="mb-8 text-[15px] leading-relaxed text-[#475569]">
            {placeDescription(open)}
          </p>
          <PlaceMenu
            categories={menuForPlace(menu, open)}
            onOrderRedirect={onClose}
          />
        </div>
      </motion.aside>
    </motion.div>
  );
}
