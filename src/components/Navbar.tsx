import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { ChevronDown, Ticket } from "lucide-react";

export default function Navbar() {
  const [limba, setLimba] = useState("RO");
  const [dropdownDeschis, setDropdownDeschis] = useState(false);

  return (
    <>
      {/* TOPBAR PENTRU OFERTE - ULTRA PREMIUM */}
      <div className="promo-topbar">
        <div className="promo-content">
          <span className="promo-text">
            Folosește codul promoțional
            <span className="promo-code">
              <Ticket size={14} className="code-icon" strokeWidth={1.5} />
              CASAESY15
            </span>
            și primești{" "}
            <strong className="promo-highlight">15% reducere</strong> la
            rezervările directe.
          </span>
        </div>
      </div>

      {/* HEADER-UL TĂU EXISTENT */}
      <header className="site-header">
        <div className="mainbar">
          {/* Partea Stângă */}
          <nav className="nav-wing nav-left">
            <NavLink to="/" end>
              Acasă
            </NavLink>
            <NavLink to="/camere">Camere</NavLink>
            <NavLink to="/oferte">Oferte</NavLink>
            <NavLink to="/evenimente-corporate">Corporate</NavLink>
          </nav>

          {/* LOGO */}
          <Link to="/" className="brand" aria-label="Vila Casa Esy">
            <span className="brand-rule">VILA</span>
            <span className="brand-name">
              Casa <em>Esy</em>
            </span>
            <div className="brand-meta">
              <span className="brand-stars">★★★</span>
              <span className="brand-type">3 STELE</span>
            </div>
          </Link>

          {/* Partea Dreaptă */}
          <nav className="nav-wing nav-right">
            <NavLink to="/evenimente-private">Private</NavLink>
            <NavLink to="/restaurant">Restaurant</NavLink>
            <NavLink to="/cariere">Cariere</NavLink>
            <NavLink to="/contact">Contact</NavLink>

            {/* Selector Limba */}
            <div
              className="lang-selector-inline"
              onMouseLeave={() => setDropdownDeschis(false)}
              onMouseEnter={() => setDropdownDeschis(true)}
            >
              <button
                className="lang-btn-inline"
                onClick={() => setDropdownDeschis(!dropdownDeschis)}
              >
                <span>{limba}</span>
                <ChevronDown
                  size={12}
                  className={`arrow ${dropdownDeschis ? "open" : ""}`}
                />
              </button>

              {dropdownDeschis && (
                <ul className="lang-dropdown-menu">
                  <li
                    onClick={() => {
                      setLimba("RO");
                      setDropdownDeschis(false);
                    }}
                  >
                    RO
                  </li>
                  <li
                    onClick={() => {
                      setLimba("EN");
                      setDropdownDeschis(false);
                    }}
                  >
                    EN
                  </li>
                </ul>
              )}
            </div>
          </nav>
        </div>
      </header>
    </>
  );
}
