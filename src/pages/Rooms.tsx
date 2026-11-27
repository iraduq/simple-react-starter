import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ImageOff, CalendarX } from "lucide-react";
import { hasCookieConsent, PREF_ROOMS_FILTER_KEY } from "../components/CookieConsentBanner";
import { nightsBetween } from "../lib/format";
import RoomReviewsModal from "../components/reviews/RoomReviewsModal";
import GuestFeedbackModal from "../components/reviews/GuestFeedbackModal";

import { REVEAL_DELAY, type DisplayRoom } from "./Rooms/types";
import FloatingDecor from "./Rooms/components/FloatingDecor";
import RoomsHero from "./Rooms/components/RoomsHero";
import RoomsFilterTabs from "./Rooms/components/RoomsFilterTabs";
import RoomListingCard from "./Rooms/components/RoomListingCard";
import RoomSkeleton from "./Rooms/components/RoomSkeleton";
import { useRoomsData } from "./Rooms/hooks/useRoomsData";

export default function Rooms() {
  const [params] = useSearchParams();
  const checkIn = params.get("check_in") ?? "";
  const checkOut = params.get("check_out") ?? "";
  const adults = Number(params.get("adults")) || 2;
  const children = Number(params.get("children")) || 0;

  const [revealed, setRevealed] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [activeTab, setActiveTab] = useState(() => (hasCookieConsent("preferences") ? localStorage.getItem(PREF_ROOMS_FILTER_KEY) || "Toate" : "Toate"));

  useEffect(() => {
    if (hasCookieConsent("preferences")) {
      try { localStorage.setItem(PREF_ROOMS_FILTER_KEY, activeTab); } catch {}
    }
  }, [activeTab]);

  const [selectedRoomForReviews, setSelectedRoomForReviews] = useState<DisplayRoom | null>(null);
  const [selectedRoomForFeedback, setSelectedRoomForFeedback] = useState<DisplayRoom | null>(null);

  const {
    allRooms,
    results,
    searched,
    loading,
    searching,
    error,
    reviewsSummary,
    loadReviewsSummary,
    clearSearch,
  } = useRoomsData(checkIn, checkOut, adults, children, setActiveTab);

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), REVEAL_DELAY);
    return () => clearTimeout(t);
  }, []);

  const nights = searched ? nightsBetween(searched.in, searched.out).length : 0;
  const source = results ?? allRooms;
  const categories = ["Toate", ...Array.from(new Set(source.map((r) => r.category)))];
  const filtered = activeTab === "Toate" ? source : source.filter((r) => r.category === activeTab);
  const bookingQuery = searched ? `?check_in=${searched.in}&check_out=${searched.out}&adults=${adults}&children=${children}` : "";

  return (
    <div className="relative bg-white text-[#1a1a1a] overflow-hidden">
      <FloatingDecor />
      <RoomsHero revealed={revealed} videoRef={videoRef} />

      <section ref={listRef} className="relative scroll-mt-24 py-16 md:py-24 px-5 md:px-10 z-10 bg-transparent">
        <div className="relative z-10 max-w-7xl mx-auto">
          <RoomsFilterTabs
            searched={searched} nights={nights} clearSearch={clearSearch} categories={categories}
            activeTab={activeTab} setActiveTab={setActiveTab} loading={loading} error={error}
          />

          {error ? (
            <div className="py-20 text-center">
              <ImageOff size={32} className="mx-auto mb-4 text-[#94a3b8]" />
              <p className="text-[16px] font-semibold text-[#0d2c5c]">Nu am putut încărca camerele</p>
              <p className="text-[14px] text-[#94a3b8]">{error}</p>
            </div>
          ) : loading || searching ? (
            <div className="flex flex-col gap-10">
              {Array.from({ length: 2 }).map((_, i) => <RoomSkeleton key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-[32px] border border-[#e2e8f0] bg-white p-12 md:p-16 text-center max-w-2xl mx-auto shadow-sm">
              <CalendarX size={34} strokeWidth={1.5} className="mx-auto mb-5 text-[#94a3b8]" />
              <p className="font-['Cormorant_Garamond',serif] text-[30px] text-[#0d2c5c] mb-3">Nicio cameră liberă</p>
              <p className="text-[15px] text-[#64748b] font-light">Încearcă alte date sau alt număr de oaspeți.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-14 md:gap-16">
              <AnimatePresence mode="popLayout" initial={false}>
                {filtered.map((room, idx) => (
                  <RoomListingCard
                    key={room.id} room={room} index={idx} searched={Boolean(searched)} nights={nights}
                    bookingQuery={bookingQuery} reviewsSummary={reviewsSummary}
                    onOpenReviews={setSelectedRoomForReviews} onOpenFeedback={setSelectedRoomForFeedback}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>

      {selectedRoomForReviews && (
        <RoomReviewsModal
          isOpen={Boolean(selectedRoomForReviews)} onClose={() => setSelectedRoomForReviews(null)}
          roomId={selectedRoomForReviews.id} roomTitle={selectedRoomForReviews.title}
          onOpenAddReview={() => { setSelectedRoomForFeedback(selectedRoomForReviews); setSelectedRoomForReviews(null); }}
        />
      )}
      {selectedRoomForFeedback && (
        <GuestFeedbackModal
          isOpen={Boolean(selectedRoomForFeedback)} onClose={() => setSelectedRoomForFeedback(null)}
          roomId={String(selectedRoomForFeedback.id)} roomTitle={selectedRoomForFeedback.title}
          onSubmitted={() => { void loadReviewsSummary(); }}
        />
      )}
    </div>
  );
}
