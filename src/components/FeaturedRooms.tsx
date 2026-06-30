import { useState } from "react";
import { Star } from "lucide-react";

const tabs = ["Toate", "Standard", "Deluxe", "Suită", "Apartament"];

const rooms = [
  {
    id: 1,
    category: "Deluxe",
    title: "Cameră Deluxe Vista Mare",
    location: "Etaj 3 – vedere panoramică",
    price: 320,
    rating: 4.9,
    reviews: 48,
    img: "https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=700&h=500&fit=crop",
    badge: "Cel mai ales",
  },
  {
    id: 2,
    category: "Suită",
    title: "Suită Prezidențială",
    location: "Etaj 5 – terasă privată",
    price: 680,
    rating: 5.0,
    reviews: 31,
    img: "https://images.pexels.com/photos/1743229/pexels-photo-1743229.jpeg?auto=compress&cs=tinysrgb&w=700&h=500&fit=crop",
    badge: "Premium",
  },
  {
    id: 3,
    category: "Standard",
    title: "Cameră Standard Confort",
    location: "Etaj 1–2 – grădină",
    price: 180,
    rating: 4.7,
    reviews: 62,
    img: "https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=700&h=500&fit=crop",
    badge: null,
  },
  {
    id: 4,
    category: "Apartament",
    title: "Apartament Familial",
    location: "Etaj 2 – zonă liniștită",
    price: 490,
    rating: 4.8,
    reviews: 27,
    img: "https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=700&h=500&fit=crop",
    badge: "Recomandat familii",
  },
  {
    id: 5,
    category: "Deluxe",
    title: "Cameră Deluxe Grădină",
    location: "Parter – acces direct",
    price: 290,
    rating: 4.8,
    reviews: 39,
    img: "https://images.pexels.com/photos/279746/pexels-photo-279746.jpeg?auto=compress&cs=tinysrgb&w=700&h=500&fit=crop",
    badge: null,
  },
  {
    id: 6,
    category: "Suită",
    title: "Suită Junior Mare",
    location: "Etaj 4 – panoramă",
    price: 520,
    rating: 4.9,
    reviews: 22,
    img: "https://images.pexels.com/photos/1329711/pexels-photo-1329711.jpeg?auto=compress&cs=tinysrgb&w=700&h=500&fit=crop",
    badge: "Nou",
  },
];

export default function FeaturedRooms() {
  const [activeTab, setActiveTab] = useState("Toate");

  const filtered =
    activeTab === "Toate"
      ? rooms
      : rooms.filter((r) => r.category === activeTab);

  return (
    <section id="camere" className="py-[60px] px-5 md:py-[90px] md:px-10 bg-white">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 flex-wrap">
        <div>
          <p className="font-sans text-[11px] font-bold tracking-[0.18em] uppercase text-[#c69a3f] mb-3.5">
            Cazare de excepție
          </p>
          <h2 className="font-['Cormorant_Garamond',serif] text-[clamp(2rem,4vw,3rem)] font-normal text-[#1a1a1a] leading-[1.15]">
            Camerele Noastre
          </h2>
        </div>
        <div className="flex gap-2 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`px-5 py-2 rounded-full border text-[12.5px] font-semibold cursor-pointer transition-all duration-200 ${
                activeTab === tab
                  ? "bg-[#1e4d8c] text-white border-[#1e4d8c]"
                  : "border-[#e1e8f0] text-[#3c4043] bg-transparent hover:border-[#1e4d8c] hover:text-[#1e4d8c] hover:bg-[#e6efff]"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(290px,1fr))] gap-7">
        {filtered.map((room) => (
          <article
            key={room.id}
            className="group bg-white rounded-[10px] border border-[#e1e8f0] overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_10px_40px_rgba(13,44,92,0.14)]"
          >
            <div className="relative h-[200px] overflow-hidden">
              <img
                src={room.img}
                alt={room.title}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.06]"
              />
              {room.badge && (
                <span className="absolute top-3.5 left-3.5 bg-[#1e4d8c] text-white text-[10.5px] font-bold tracking-[0.08em] px-3 py-1 rounded-full uppercase">
                  {room.badge}
                </span>
              )}
            </div>
            <div className="p-5 pb-[22px]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[#8595aa]">📍 {room.location}</span>
                <div className="flex items-center gap-1 text-[12.5px] font-semibold text-[#1a1a1a]">
                  <Star size={13} fill="#d4a437" color="#d4a437" />
                  <span>{room.rating}</span>
                  <span className="font-normal text-[#8595aa]">
                    ({room.reviews})
                  </span>
                </div>
              </div>
              <h3 className="font-['Cormorant_Garamond',serif] text-lg font-medium text-[#1a1a1a] mb-4 leading-snug">
                {room.title}
              </h3>
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-0.5">
                  <span className="text-xl font-bold text-[#0d2c5c]">
                    {room.price} lei
                  </span>
                  <span className="text-xs text-[#8595aa]"> / noapte</span>
                </div>
                <a
                  href="#rezerva"
                  className="inline-block px-[22px] py-2.5 bg-[#c69a3f] text-[#1a1a1a] text-xs font-bold tracking-[0.06em] rounded uppercase transition-all duration-200 hover:bg-[#1e4d8c] hover:text-white hover:-translate-y-px"
                >
                  Rezervă
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
