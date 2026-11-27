import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FALLBACK_IMG } from "../types";

export default function RoomCardGallery({
  images,
  alt,
  badge,
  flip,
}: {
  images: string[];
  alt: string;
  badge?: string;
  flip?: boolean;
}) {
  const [activeIdx, setActiveIdx] = useState(0);
  const mainImg = images[activeIdx] || FALLBACK_IMG;
  const thumbs = images.slice(0, 4);
  const extra = images.length - thumbs.length;

  const cornerStyle = flip
    ? "rounded-tr-[80px] rounded-bl-[80px]"
    : "rounded-tl-[80px] rounded-br-[80px]";

  return (
    <div className="relative flex flex-col gap-4">
      <div
        className={`relative h-[280px] sm:h-[320px] md:h-[390px] overflow-hidden group bg-[#0d2c5c] shadow-[0_15px_35px_-10px_rgba(13,44,92,0.15)] ${cornerStyle}`}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={mainImg}
            src={mainImg}
            alt={`${alt} – imagine ${activeIdx + 1}`}
            loading="lazy"
            onError={(e) =>
              ((e.currentTarget as HTMLImageElement).src = FALLBACK_IMG)
            }
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1000ms] ease-out group-hover:scale-105"
          />
        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />

        {badge && (
          <span
            className={`absolute top-5 z-10 rounded-full bg-white/95 backdrop-blur-md px-4 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.18em] text-[#0d2c5c] shadow-md ${
              flip ? "left-6" : "right-6"
            }`}
          >
            {badge}
          </span>
        )}

        {images.length > 1 && (
          <span
            className={`absolute bottom-6 z-10 rounded-full bg-black/60 backdrop-blur-md px-3.5 py-1 text-[11px] font-semibold tracking-wider text-white shadow ${
              flip ? "right-6" : "left-6"
            }`}
          >
            {activeIdx + 1} / {images.length}
          </span>
        )}
      </div>

      {images.length > 1 && (
        <div className="relative grid grid-cols-4 gap-3 px-1">
          {thumbs.map((src, idx) => {
            const isActive = activeIdx === idx;
            const isLast = idx === thumbs.length - 1 && extra > 0;
            return (
              <button
                type="button"
                key={src + idx}
                onClick={() => setActiveIdx(idx)}
                className={`relative h-[68px] sm:h-[76px] rounded-2xl overflow-hidden transition-all duration-300 shadow-sm ${
                  isActive
                    ? "ring-2 ring-[#0d2c5c] ring-offset-2 ring-offset-white scale-[1.02]"
                    : "opacity-70 hover:opacity-100 hover:-translate-y-0.5"
                }`}
              >
                <img
                  src={src}
                  alt={`${alt} – miniatură ${idx + 1}`}
                  loading="lazy"
                  onError={(e) =>
                    ((e.currentTarget as HTMLImageElement).src = FALLBACK_IMG)
                  }
                  className="w-full h-full object-cover"
                />
                {isLast && (
                  <span className="absolute inset-0 flex items-center justify-center bg-[#0d2c5c]/75 text-[13px] font-bold text-white backdrop-blur-[2px]">
                    +{extra}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
