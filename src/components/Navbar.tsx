import { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { ChevronDown, Globe, UserRound, X } from "lucide-react";

const LANGS = [
  { code: "RO", label: "Română" },
  { code: "EN", label: "English" },
  { code: "DE", label: "Deutsch" },
];

export default function Navbar() {
  const [lang, setLang] = useState("RO");
  const [langOpen, setLangOpen] = useState(false);
  const [acctOpen, setAcctOpen] = useState(false);
  const [promoDismissed, setPromoDismissed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const langRef = useRef<HTMLDivElement>(null);
  const acctRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node))
        setLangOpen(false);
      if (acctRef.current && !acctRef.current.contains(e.target as Node))
        setAcctOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const copyCode = () => {
    navigator.clipboard.writeText("CASAESY15");
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <>
      {!promoDismissed && (
        <div className="promo-strip">
          <span className="promo-strip-text">
            Ofertă specială — cod&nbsp;
            <button
              className={`promo-code-btn${copied ? " is-copied" : ""}`}
              onClick={copyCode}
              title="Apasă pentru a copia"
            >
              {copied ? "COPIAT ✓" : "CASAESY15"}
            </button>
            &nbsp;pentru <strong>15% reducere</strong> la rezervare directă
          </span>
          <button
            className="promo-close"
            onClick={() => setPromoDismissed(true)}
            aria-label="Închide"
          >
            <X size={12} strokeWidth={2.5} />
          </button>
        </div>
      )}

      <header className={`site-header${scrolled ? " is-scrolled" : ""}`}>
        <div className="mainbar">
          {/* LOGO */}
          <Link to="/" className="brand" aria-label="Vila Casa Esy">
            <span className="brand-name">CASA ESY</span>
            <span className="brand-stars" aria-label="3 stele">
              ★ ★ ★
            </span>
            <span className="brand-sub">HOTEL · MAMAIA</span>
          </Link>

          {/* NAV LINKS */}
          <nav className="main-nav">
            <NavLink to="/" end>Acasă</NavLink>
            <NavLink to="/camere">Camere</NavLink>
            <NavLink to="/oferte">Oferte</NavLink>
            <NavLink to="/restaurant">Restaurant</NavLink>
            <NavLink to="/evenimente-private">Evenimente</NavLink>
            <NavLink to="/contact">Contact</NavLink>
          </nav>

          {/* TOOLS + CTA */}
          <div className="nav-tools">
            <div className="lang-selector" ref={langRef}>
              <button
                className="tool-btn"
                onClick={() => { setLangOpen((v) => !v); setAcctOpen(false); }}
                aria-haspopup="true"
                aria-expanded={langOpen}
                aria-label="Schimbă limba"
              >
                <Globe size={15} strokeWidth={1.8} />
                <span className="tool-btn-label">{lang}</span>
                <ChevronDown
                  size={11}
                  className={`arrow${langOpen ? " open" : ""}`}
                />
              </button>
              {langOpen && (
                <ul className="dropdown-menu" role="menu">
                  {LANGS.map((l) => (
                    <li
                      key={l.code}
                      role="menuitem"
                      className={l.code === lang ? "is-active" : ""}
                      onClick={() => { setLang(l.code); setLangOpen(false); }}
                    >
                      <span className="d-code">{l.code}</span>
                      <span className="d-label">{l.label}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="acct-selector" ref={acctRef}>
              <button
                className="tool-btn tool-btn--icon"
                onClick={() => { setAcctOpen((v) => !v); setLangOpen(false); }}
                aria-haspopup="true"
                aria-expanded={acctOpen}
                aria-label="Cont utilizator"
              >
                <UserRound size={17} strokeWidth={1.8} />
              </button>
              {acctOpen && (
                <div className="dropdown-card" role="menu">
                  <p className="dc-title">Bun venit la Casa Esy</p>
                  <p className="dc-sub">
                    Intră în cont pentru a-ți gestiona rezervările.
                  </p>
                  <Link
                    to="/login"
                    className="dc-btn dc-btn--primary"
                    onClick={() => setAcctOpen(false)}
                  >
                    Intră în cont
                  </Link>
                  <Link
                    to="/register"
                    className="dc-btn dc-btn--ghost"
                    onClick={() => setAcctOpen(false)}
                  >
                    Creează cont nou
                  </Link>
                </div>
              )}
            </div>

            <Link to="/register" className="cta-btn">
              Rezervă Acum
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
