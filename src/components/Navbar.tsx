import { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { ChevronDown, UserRound, Globe, Sparkles } from "lucide-react";

const LANGS = [
  { code: "RO", label: "Română" },
  { code: "EN", label: "English" },
  { code: "DE", label: "Deutsch" },
];

export default function Navbar() {
  const [lang, setLang] = useState("RO");
  const [langOpen, setLangOpen] = useState(false);
  const [acctOpen, setAcctOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const acctRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node))
        setLangOpen(false);
      if (acctRef.current && !acctRef.current.contains(e.target as Node))
        setAcctOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <>
      {/* ── PROMO STRIP ── */}
      <div className="promo-strip" role="banner">
        <div className="promo-strip-inner">
          <Sparkles size={14} strokeWidth={2} className="promo-icon" />
          <span className="promo-text">
            Ofertă limitată — folosește codul
            <code className="promo-code">CASAESY15</code>
            pentru <strong>15% reducere</strong> la rezervare directă
          </span>
          <Link to="/register" className="promo-strip-cta">
            Rezervă acum <span aria-hidden>→</span>
          </Link>
        </div>
      </div>

      {/* ── TOP INFO BAR ── */}
      <div className="info-bar">
        <div className="info-bar-inner">
          <a href="tel:+40700000000" className="info-item">
            <Phone size={13} strokeWidth={2} />
            <span>+40 700 000 000</span>
          </a>
          <span className="info-bar-dot">Recepție 24/7 · Mamaia Nord</span>
        </div>
      </div>

      {/* ── MAIN NAVBAR ── */}
      <header className="site-header">
        <div className="mainbar">
          {/* LEFT */}
          <nav className="nav-side nav-side--left">
            <NavLink to="/" end>Acasă</NavLink>
            <NavLink to="/camere">Camere</NavLink>
            <NavLink to="/oferte">Oferte</NavLink>
            <NavLink to="/restaurant">Restaurant</NavLink>
          </nav>

          {/* CENTER */}
          <Link to="/" className="brand" aria-label="Vila Casa Esy">
            <span className="brand-rule">VILA</span>
            <span className="brand-name">
              Casa <em>Esy</em>
            </span>
            <span className="brand-meta">
              <span className="brand-stars" aria-hidden>★★★</span>
              <span>Hotel 3 stele · Mamaia</span>
            </span>
          </Link>

          {/* RIGHT */}
          <div className="nav-side nav-side--right">
            <nav className="nav-side-links">
              <NavLink to="/evenimente-private">Evenimente</NavLink>
              <NavLink to="/contact">Contact</NavLink>
            </nav>

            <div className="nav-tools">
              {/* Language */}
              <div className="lang-selector" ref={langRef}>
                <button
                  className="icon-btn"
                  onClick={() => { setLangOpen(v => !v); setAcctOpen(false); }}
                  aria-haspopup="true"
                  aria-expanded={langOpen}
                  aria-label="Schimbă limba"
                >
                  <Globe size={16} strokeWidth={1.8} />
                  <span className="icon-btn-label">{lang}</span>
                  <ChevronDown size={12} className={`arrow ${langOpen ? "open" : ""}`} />
                </button>
                {langOpen && (
                  <ul className="menu-pop" role="menu">
                    {LANGS.map(l => (
                      <li
                        key={l.code}
                        role="menuitem"
                        className={l.code === lang ? "is-active" : ""}
                        onClick={() => { setLang(l.code); setLangOpen(false); }}
                      >
                        <span className="menu-code">{l.code}</span>
                        <span className="menu-label">{l.label}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Account */}
              <div className="acct-selector" ref={acctRef}>
                <button
                  className="icon-btn icon-btn--circle"
                  onClick={() => { setAcctOpen(v => !v); setLangOpen(false); }}
                  aria-haspopup="true"
                  aria-expanded={acctOpen}
                  aria-label="Cont utilizator"
                >
                  <UserRound size={18} strokeWidth={1.8} />
                </button>
                {acctOpen && (
                  <div className="menu-pop menu-pop--card" role="menu">
                    <div className="acct-head">
                      <p className="acct-title">Bun venit la Casa Esy</p>
                      <p className="acct-sub">Intră în cont pentru a-ți gestiona rezervările.</p>
                    </div>
                    <Link to="/login" className="acct-btn acct-btn--primary" onClick={() => setAcctOpen(false)}>
                      Intră în cont
                    </Link>
                    <Link to="/register" className="acct-btn acct-btn--ghost" onClick={() => setAcctOpen(false)}>
                      Creează cont nou
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}