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
    <section className="featured-rooms" id="camere">
      <div className="fr-header">
        <div>
          <p className="section-eyebrow">Cazare de excepție</p>
          <h2 className="section-title">Camerele Noastre</h2>
        </div>
        <div className="fr-tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`fr-tab ${activeTab === tab ? "fr-tab--active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="fr-grid">
        {filtered.map((room) => (
          <article key={room.id} className="room-card">
            <div className="room-card-img">
              <img src={room.img} alt={room.title} loading="lazy" />
              {room.badge && (
                <span className="room-badge">{room.badge}</span>
              )}
            </div>
            <div className="room-card-body">
              <div className="room-meta">
                <span className="room-location">📍 {room.location}</span>
                <div className="room-rating">
                  <Star size={13} fill="#d4a437" color="#d4a437" />
                  <span>{room.rating}</span>
                  <span className="room-reviews">({room.reviews})</span>
                </div>
              </div>
              <h3 className="room-title">{room.title}</h3>
              <div className="room-footer">
                <div className="room-price">
                  <span className="price-amount">{room.price} lei</span>
                  <span className="price-per"> / noapte</span>
                </div>
                <a href="#rezerva" className="room-btn">
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
