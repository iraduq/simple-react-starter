import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Loader2, MapPin } from "lucide-react";
import ActiveOrderBanner from "../components/orders/ActiveOrderBanner";
import { hasCookieConsent, PREF_PLACES_FILTER_KEY } from "../components/CookieConsentBanner";
import type { MenuCategory, Place } from "../types/places";
import { getFullMenu, listPlaces, menuForPlace, placeDescription } from "../services/placesService";
import PlacesHero from "../components/places/PlacesHero";
import PlacesFilterBar from "../components/places/PlacesFilterBar";
import PlaceRowItem from "../components/places/PlaceRowItem";
import PlaceSlideOverModal from "../components/places/PlaceSlideOverModal";

export default function Places() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [menu, setMenu] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState<Place | null>(null);

  const [category, setCategory] = useState(() => {
    if (hasCookieConsent("preferences")) {
      return localStorage.getItem(PREF_PLACES_FILTER_KEY) || "toate";
    }
    return "toate";
  });

  useEffect(() => {
    if (!hasCookieConsent("preferences")) return;
    try {
      localStorage.setItem(PREF_PLACES_FILTER_KEY, category);
    } catch {}
  }, [category]);

  const reloadPlaces = () => {
    Promise.allSettled([listPlaces(), getFullMenu()]).then(([p, m]) => {
      if (p.status === "fulfilled") {
        const cleanPlaces = (p.value || []).filter((item) => !/sezlong|șezlong/i.test(item.title || ""));
        setPlaces(cleanPlaces);
      }
      if (m.status === "fulfilled") setMenu(m.value);
      setLoading(false);
    });
  };

  useEffect(() => {
    reloadPlaces();
    const onLiveSync = () => reloadPlaces();
    window.addEventListener("live-places-sync", onLiveSync);
    return () => window.removeEventListener("live-places-sync", onLiveSync);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (open) {
      document.body.dataset.placeModalOpen = "true";
    } else {
      delete document.body.dataset.placeModalOpen;
    }
    window.dispatchEvent(new CustomEvent("place-modal-toggle", { detail: Boolean(open) }));
    return () => {
      document.body.style.overflow = "";
      delete document.body.dataset.placeModalOpen;
      window.dispatchEvent(new CustomEvent("place-modal-toggle", { detail: false }));
    };
  }, [open]);

  const filtered = useMemo(() => {
    let list = places;
    if (category !== "toate") {
      list = list.filter((p) => p.category?.toLowerCase() === category);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          placeDescription(p).toLowerCase().includes(q) ||
          p.badge?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [places, category, searchQuery]);

  const getPlaceItemsCount = (p: Place) =>
    menuForPlace(menu, p).reduce((s, c) => s + (c.items?.length ?? 0), 0);

  return (
    <div className="relative bg-white text-[#1a1a1a] overflow-hidden min-h-screen">
      <PlacesHero videoRef={videoRef} />
      <section className="relative py-16 md:py-24 px-5 md:px-10 z-10 bg-transparent">
        <div className="relative z-10 max-w-7xl mx-auto">
          <PlacesFilterBar
            category={category}
            setCategory={setCategory}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
          <ActiveOrderBanner />
          {loading ? (
            <div className="flex flex-col items-center justify-center py-28 text-[#c69a3f]">
              <Loader2 size={36} className="mb-4 animate-spin" />
              <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#0d2c5c]">
                Se încarcă locațiile Vila Casa Esy…
              </span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center max-w-xl mx-auto">
              <MapPin size={34} strokeWidth={1.5} className="mx-auto mb-5 text-[#94a3b8]" />
              <p className="font-['Cormorant_Garamond',serif] text-[30px] text-[#0d2c5c] mb-3">Nicio locație găsită</p>
              <p className="text-[15px] text-[#64748b] font-light">Încearcă un alt termen de căutare sau afișează toate categoriile.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#0d2c5c]/10">
              {filtered.map((p, idx) => (
                <PlaceRowItem
                  key={p.id}
                  place={p}
                  index={idx}
                  itemsCount={getPlaceItemsCount(p)}
                  onOpen={setOpen}
                />
              ))}
            </div>
          )}
        </div>
      </section>
      <AnimatePresence>
        {open && <PlaceSlideOverModal open={open} menu={menu} onClose={() => setOpen(null)} />}
      </AnimatePresence>
    </div>
  );
}
