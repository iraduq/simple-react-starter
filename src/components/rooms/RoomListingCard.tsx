import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Star, Users, Maximize, ArrowRight } from "lucide-react";
import { ron } from "../../lib/format";
import type { DisplayRoom } from "../../types/roomsPage";
import { amenityIcon } from "../../types/roomsPage";
import RoomCardGallery from "./RoomCardGallery";

interface RoomListingCardProps {
  room: DisplayRoom;
  index: number;
  searched: boolean;
  nights: number;
  bookingQuery: string;
  reviewsSummary: Record<string, { average: number; count: number }>;
  onOpenReviews: (room: DisplayRoom) => void;
  onOpenFeedback: (room: DisplayRoom) => void;
}

export default function RoomListingCard({
  room,
  index,
  searched,
  nights,
  bookingQuery,
  reviewsSummary,
  onOpenReviews,
  onOpenFeedback,
}: RoomListingCardProps) {
  const total = searched ? (room.total ?? room.price * nights) : null;
  const flip = index % 2 === 1;

  const cardCornerStyle = flip
    ? "rounded-[36px] rounded-tr-[90px] rounded-bl-[90px]"
    : "rounded-[36px] rounded-tl-[90px] rounded-br-[90px]";

  return (
    <motion.article
      layout
      initial={false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`relative overflow-hidden bg-white/95 backdrop-blur border border-[#e2e8f0] shadow-[0_15px_40px_-15px_rgba(13,44,92,0.08)] hover:shadow-[0_25px_60px_-15px_rgba(13,44,92,0.14)] transition-all duration-500 p-6 md:p-10 ${cardCornerStyle}`}
    >
      <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Galerie foto */}
        <div className={`relative z-10 lg:col-span-7 ${flip ? "lg:order-2" : ""}`}>
          <RoomCardGallery images={room.images} alt={room.title} badge={room.badge} flip={flip} />
        </div>

        {/* Detalii cameră & preț */}
        <div className={`relative z-10 lg:col-span-5 flex flex-col justify-between h-full ${flip ? "lg:order-1" : ""}`}>
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-2.5 font-sans text-[11px] font-bold tracking-[0.2em] uppercase text-[#c69a3f]">
                <span className="h-px w-6 bg-[#c69a3f]/60" />
                {room.category}
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-[#0d2c5c] bg-[#f8fafc] border border-[#e2e8f0] px-3 py-1 rounded-full">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                Disponibil
              </span>
            </div>

            <h3 className="font-['Cormorant_Garamond',serif] text-[clamp(2rem,2.8vw,2.8rem)] font-normal leading-[1.1] text-[#0d2c5c] mb-2.5">
              {room.title}
            </h3>

            {/* Rating & Recenzii Oaspeți */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <button
                type="button"
                onClick={() => onOpenReviews(room)}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50/90 hover:bg-amber-100/90 border border-amber-200/90 text-[#0d2c5c] text-[12px] font-semibold transition cursor-pointer shadow-2xs group"
                title="Vezi toate recenziile"
              >
                <div className="flex items-center gap-1">
                  <Star size={13} className="fill-[#c69a3f] text-[#c69a3f]" />
                  <span className="font-bold text-[#0d2c5c]">
                    {reviewsSummary[String(room.id)]?.average
                      ? reviewsSummary[String(room.id)].average.toFixed(2)
                      : "4.90"}{" "}
                    / 5
                  </span>
                </div>
                <span className="text-[#94a3b8] font-normal">•</span>
                <span className="text-[#475569] font-medium group-hover:text-[#0d2c5c] underline-offset-2 group-hover:underline">
                  {reviewsSummary[String(room.id)]?.count ?? 3}{" "}
                  {(reviewsSummary[String(room.id)]?.count ?? 3) === 1 ? "recenzie" : "recenzii"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onOpenFeedback(room)}
                className="text-[11.5px] font-semibold text-[#00a896] hover:text-[#0d2c5c] hover:underline underline-offset-2 transition cursor-pointer"
              >
                + Lasă o recenzie
              </button>
            </div>

            {room.description && (
              <p className="font-sans text-[14.5px] leading-[1.75] font-normal text-[#475569] mb-6 line-clamp-3">
                {room.description}
              </p>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#f8fafc] border border-[#f1f5f9]">
                <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#0d2c5c]">
                  <Users size={16} strokeWidth={1.8} />
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold tracking-wider text-[#94a3b8]">Capacitate</span>
                  <span className="text-[13px] font-semibold text-[#0d2c5c]">Max {room.guests} oaspeți</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#f8fafc] border border-[#f1f5f9]">
                <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#0d2c5c]">
                  <Maximize size={16} strokeWidth={1.8} />
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold tracking-wider text-[#94a3b8]">Suprafață</span>
                  <span className="text-[13px] font-semibold text-[#0d2c5c]">{room.size}</span>
                </div>
              </div>
            </div>

            {room.amenities.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {room.amenities.slice(0, 4).map((a: any) => {
                  const Icon = amenityIcon(a);
                  return (
                    <span
                      key={a}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#e2e8f0] bg-[#f8fafc] px-3.5 py-1.5 text-[12px] font-medium text-[#475569]"
                    >
                      <Icon size={13} strokeWidth={1.8} className="text-[#0d2c5c]" />
                      {a}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Panou Preț & Butoane */}
          <div className="relative overflow-hidden rounded-3xl bg-[#0d2c5c] p-5 sm:p-6 shadow-[0_15px_35px_-10px_rgba(13,44,92,0.3)]">
            <div className="relative flex items-end justify-between gap-4 flex-wrap">
              <div>
                <span className="block font-sans text-[10px] font-bold tracking-[0.2em] uppercase text-white/60 mb-1">
                  {total != null ? `Total ${nights} ${nights === 1 ? "noapte" : "nopți"}` : "Tarif de la"}
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-sans text-[24px] sm:text-[26px] font-semibold tracking-normal text-white">
                    {total != null ? ron(total) : `${Math.round(room.price)} lei`}
                  </span>
                  <span className="text-[11px] font-light text-white/60 tracking-wider uppercase">
                    {total != null ? `(${ron(room.price)}/noapte)` : "/ noapte"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to={`/camere/${room.id}${bookingQuery}`}
                  className="inline-flex items-center rounded-2xl border border-white/25 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.15em] text-white transition-all hover:border-white hover:bg-white/10"
                >
                  Detalii
                </Link>
                <Link
                  to={`/camere/${room.id}${bookingQuery}`}
                  className="group/btn inline-flex items-center gap-2 rounded-2xl bg-[#c69a3f] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.15em] text-white transition-all hover:bg-[#d8ab50] shadow-md shadow-black/20"
                >
                  Rezervă
                  <ArrowRight size={14} className="transition-transform group-hover/btn:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
