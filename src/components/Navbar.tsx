import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
// Importurile corecte pentru Lucide React:
import { Phone, Mail, ChevronDown, Globe } from "lucide-react";

export default function Navbar() {
  const [limba, setLimba] = useState("RO");
  const [dropdownDeschis, setDropdownDeschis] = useState(false);

  return (
    <header className="site-header">
      {/* 1. TOPBAR */}
      <div className="topbar">
        <div className="topbar-left">
          <a href="tel:+40740000000" className="topbar-link">
            <Phone size={13} /> +40 740 000 000
          </a>
          <a href="mailto:rezervari@casaesy.ro" className="topbar-link">
            <Mail size={13} /> rezervari@casaesy.ro
          </a>
        </div>

        <div className="topbar-right">
          <div className="topbar-socials">
            <a
              href="#"
              aria-label="TripAdvisor"
              target="_blank"
              rel="noreferrer"
            >
              {/* Am înlocuit 't' text cu o iconiță stilizată sau poți folosi text dacă dorești */}
              <span className="tripadvisor-icon">T</span>
            </a>
          </div>

          <span className="topbar-divider">|</span>

          {/* Selector de Limbă Dropdown */}
          <div
            className="lang-selector"
            onMouseLeave={() => setDropdownDeschis(false)}
          >
            <button
              className="lang-btn"
              onClick={() => setDropdownDeschis(!dropdownDeschis)}
              onMouseEnter={() => setDropdownDeschis(true)}
            >
              <Globe size={13} />
              <span>{limba}</span>
              <ChevronDown
                size={12}
                className={`arrow ${dropdownDeschis ? "open" : ""}`}
              />
            </button>

            {dropdownDeschis && (
              <ul className="lang-dropdown">
                <li
                  onClick={() => {
                    setLimba("RO");
                    setDropdownDeschis(false);
                  }}
                >
                  RO (Română)
                </li>
                <li
                  onClick={() => {
                    setLimba("EN");
                    setDropdownDeschis(false);
                  }}
                >
                  EN (English)
                </li>
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* 2. MAINBAR (Logo pe mijloc, navigare stânga-dreapta) */}
      <div className="mainbar">
        {/* Navigația Stânga */}
        <nav className="nav-wing nav-left">
          <NavLink to="/" end>
            Acasă
          </NavLink>
          <NavLink to="/camere">Camere</NavLink>
          <NavLink to="/oferte">Oferte</NavLink>
          <NavLink to="/restaurant">Restaurant</NavLink>
        </nav>

        {/* LOGO CENTRAL */}
        <Link to="/" className="brand" aria-label="Vila Casa Esy">
          <span className="brand-rule">VILA</span>
          <span className="brand-name">
            Casa <em>Esy</em>
          </span>
          <div className="brand-meta">
            <span className="brand-stars">★★★</span>
            <span className="brand-type">Hotel de trei stele</span>
            <span className="brand-dot" />
            <span className="brand-reviews">
              <b>4.887</b> recenzii
            </span>
          </div>
        </Link>

        {/* Navigația Dreapta */}
        <nav className="nav-wing nav-right">
          <NavLink to="/evenimente-corporate">Corporate</NavLink>
          <NavLink to="/evenimente-private">Private</NavLink>
          <NavLink to="/cariere">Cariere</NavLink>
          <NavLink to="/contact">Contact</NavLink>
        </nav>

        {/* Butoane de acțiune (Poziționate absolut sau mutate elegant) */}
        <div className="auth-actions">
          <NavLink to="/login" className="btn btn-ghost">
            Login
          </NavLink>
          <NavLink to="/register" className="btn btn-primary">
            Rezervă
          </NavLink>
        </div>
      </div>
    </header>
  );
}
