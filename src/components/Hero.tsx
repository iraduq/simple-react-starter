import { Calendar, Users, Search } from "lucide-react";
import { useState } from "react";

const today = new Date().toISOString().split("T")[0];

export default function Hero() {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");

  return (
    <section className="hero-home">
      <div className="hero-overlay" />

      <div className="hero-content">
        <p className="eyebrow">
          <span className="eyebrow-line" />
          EXPERIENȚE DE NEUITAT LA MARE
          <span className="eyebrow-line" />
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
          <label>
            <Calendar size={11} className="search-label-icon" />
            Check-in
          </label>
          <input
            type="date"
            value={checkIn}
            min={today}
            onChange={(e) => {
              setCheckIn(e.target.value);
              if (checkOut && e.target.value >= checkOut) setCheckOut("");
            }}
          />
        </div>

        <div className="search-divider" />

        <div className="search-field">
          <label>
            <Calendar size={11} className="search-label-icon" />
            Check-out
          </label>
          <input
            type="date"
            value={checkOut}
            min={checkIn || today}
            onChange={(e) => setCheckOut(e.target.value)}
          />
        </div>

        <div className="search-divider" />

        <div className="search-field search-field--narrow">
          <label>
            <Users size={11} className="search-label-icon" />
            Persoane
          </label>
          <select value={guests} onChange={(e) => setGuests(e.target.value)}>
            <option value="1">1 persoană</option>
            <option value="2">2 persoane</option>
            <option value="3">3 persoane</option>
            <option value="4">4 persoane</option>
            <option value="5">5 persoane</option>
            <option value="6">6 persoane</option>
          </select>
        </div>

        <button className="search-btn">
          <Search size={15} />
          Verifică disponibilitate
        </button>
      </div>
    </section>
  );
}
