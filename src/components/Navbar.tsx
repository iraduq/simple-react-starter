import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { ChevronDown, Phone, Mail, Tag } from "lucide-react";

export default function Navbar() {
  const [lang, setLang] = useState("RO");
  const [langOpen, setLangOpen] = useState(false);

  return (
    <>
      {/* ── PROMO STRIP ── */}
      <div className="promo-strip">
        <Tag size={13} strokeWidth={2} />
        <span>
          Cod promoțional&nbsp;
          <strong>CASAESY15</strong>
          &nbsp;— 15% reducere la rezervare directă
        </span>
        <a href="/register" className="promo-strip-cta">
          Rezervă acum
        </a>
      </div>

      {/* ── TOP INFO BAR ── */}
      <div className="info-bar">
        <div className="info-bar-inner">
          <div className="info-bar-left">
            <a href="tel:+40700000000" className="info-item">
              <Phone size={13} strokeWidth={2} />
              +40 700 000 000
            </a>
            <span className="info-sep">|</span>
            <a href="mailto:contact@casaesy.ro" className="info-item">
              <Mail size={13} strokeWidth={2} />
              contact@casaesy.ro
            </a>
          </div>
          <div className="info-bar-right">
            <Link to="/login" className="info-auth">
              Intră în cont
            </Link>
            <span className="info-sep">|</span>
            <Link to="/register" className="info-auth info-auth--highlight">
              Creează cont
            </Link>
          </div>
        </div>
      </div>

      {/* ── MAIN NAVBAR ── */}
      <header className="site-header">
        <div className="mainbar">
          <nav className="nav-wing">
            <NavLink to="/" end>
              Acasă
            </NavLink>
            <NavLink to="/camere">Camere</NavLink>
            <NavLink to="/oferte">Oferte</NavLink>
            <NavLink to="/restaurant">Restaurant</NavLink>
          </nav>

          <Link to="/" className="brand" aria-label="Vila Casa Esy">
            <span className="brand-rule">VILA</span>
            <span className="brand-name">
              Casa <em>Esy</em>
            </span>
            <div className="brand-meta">
              <span className="brand-stars">★★★</span>
              <span>3 STELE</span>
            </div>
          </Link>

          <div className="nav-wing nav-right-group">
            <nav className="nav-links-right">
              <NavLink to="/evenimente-private">Evenimente</NavLink>
              <NavLink to="/contact">Contact</NavLink>
              <NavLink to="/cariere">Cariere</NavLink>
            </nav>

            {/* Language */}
            <div
              className="lang-selector-inline"
              onMouseEnter={() => setLangOpen(true)}
              onMouseLeave={() => setLangOpen(false)}
            >
              <button
                className="lang-btn-inline"
                onClick={() => setLangOpen(!langOpen)}
              >
                {lang}
                <ChevronDown
                  size={11}
                  className={`arrow ${langOpen ? "open" : ""}`}
                />
              </button>
              {langOpen && (
                <ul className="lang-dropdown-menu">
                  {["RO", "EN"].map((l) => (
                    <li
                      key={l}
                      onClick={() => {
                        setLang(l);
                        setLangOpen(false);
                      }}
                    >
                      {l}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* CTA */}
            <Link to="/register" className="nav-cta">
              Rezervă acum
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
