import { Search } from "lucide-react";
import { useState } from "react";

export default function Hero() {
  const [roomType, setRoomType] = useState("Toate");
  const [nights, setNights] = useState("3 nopți");

  return (
    <section className="hero-home">
      <div className="hero-overlay"></div>

      <div className="hero-content">
        <p className="eyebrow">
          <span className="eyebrow-line"></span>
          EXPERIENȚE DE NEUITAT LA MARE
          <span className="eyebrow-line"></span>
        </p>

        <h1>
          Descoperă <em>Liniștea</em>
          <br />
          Mării Negre
        </h1>

        <p className="subtitle">
          Vila Casa Esy — refugiul tău perfect pe malul mării. Camere rafinate,
          priveliști superbe și ospitalitate caldă la fiecare pas.
        </p>

        <div className="hero-actions">
          <a href="#camere" className="btn btn-primary">
            Rezervă acum →
          </a>
          <a href="#descopera" className="btn btn-ghost">
            Serviciile noastre →
          </a>
        </div>
      </div>

      <div className="hero-search-bar">
        <div className="search-field">
          <label>Destinație</label>
          <div className="search-input-wrap">
            <Search size={15} className="search-icon-inner" />
            <input type="text" placeholder="Caută locație..." />
          </div>
        </div>
        <div className="search-divider" />
        <div className="search-field">
          <label>Tip cameră</label>
          <select value={roomType} onChange={(e) => setRoomType(e.target.value)}>
            <option>Toate</option>
            <option>Cameră Standard</option>
            <option>Cameră Deluxe</option>
            <option>Suită</option>
            <option>Apartament</option>
          </select>
        </div>
        <div className="search-divider" />
        <div className="search-field">
          <label>Durată</label>
          <select value={nights} onChange={(e) => setNights(e.target.value)}>
            <option>1 noapte</option>
            <option>2 nopți</option>
            <option>3 nopți</option>
            <option>5 nopți</option>
            <option>7 nopți</option>
          </select>
        </div>
        <button className="search-btn">
          <Search size={16} />
          Caută
        </button>
      </div>
    </section>
  );
}
