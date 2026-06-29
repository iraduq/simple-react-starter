import { Search, Users } from "lucide-react";
import { useState } from "react";
import DatePicker from "./DatePicker";

const today = new Date().toISOString().split("T")[0];

export default function Hero() {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);

  const handleCheckIn = (val: string) => {
    setCheckIn(val);
    if (checkOut && val >= checkOut) setCheckOut("");
  };

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
        <DatePicker
          label="Check-in"
          value={checkIn}
          minDate={today}
          onChange={handleCheckIn}
        />

        <div className="search-divider" />

        <DatePicker
          label="Check-out"
          value={checkOut}
          minDate={checkIn || today}
          onChange={setCheckOut}
        />

        <div className="search-divider" />

        <div className="search-field-persons">
          <span className="dp-label">
            <Users size={11} className="search-label-icon" />
            Persoane
          </span>
          <div className="persons-row">
            <button
              type="button"
              className="persons-btn"
              disabled={guests <= 1}
              onClick={() => setGuests((g) => Math.max(1, g - 1))}
            >
              −
            </button>
            <span className="persons-value">
              {guests} {guests === 1 ? "persoană" : "persoane"}
            </span>
            <button
              type="button"
              className="persons-btn"
              disabled={guests >= 6}
              onClick={() => setGuests((g) => Math.min(6, g + 1))}
            >
              +
            </button>
          </div>
        </div>

        <button className="search-btn" type="button">
          <Search size={15} />
          Verifică disponibilitate
        </button>
      </div>
    </section>
  );
}
