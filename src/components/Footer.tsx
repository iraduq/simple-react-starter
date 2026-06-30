import { Link } from "react-router-dom";
import {
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  BadgeCheck,
  ArrowUp,
  Send,
} from "lucide-react";
import { useState } from "react";

// --- Iconițe Custom SVG ---
function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.24 2.22.41.56.21.96.47 1.38.89.42.42.68.82.89 1.38.17.42.36 1.05.41 2.22.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.24 1.8-.41 2.22-.21.56-.47.96-.89 1.38-.42.42-.82.68-1.38.89-.42.17-1.05.36-2.22.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.24-2.22-.41-.56-.21-.96-.47-1.38-.89-.42-.42-.68-.82-.89-1.38-.17-.42-.36-1.05-.41-2.22-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.24-1.8.41-2.22.21-.56.47-.96.89-1.38.42-.42.82-.68 1.38-.89.42-.17 1.05-.36 2.22-.41 1.27-.06 1.65-.07 4.85-.07M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.31-1.46.72-2.13 1.39C1.34 2.69.93 3.36.63 4.14c-.3.76-.5 1.64-.56 2.91C.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.31.79.72 1.46 1.39 2.13.67.67 1.34 1.08 2.13 1.39.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56.79-.31 1.46-.72 2.13-1.39.67-.67 1.08-1.34 1.39-2.13.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91-.31-.79-.72-1.46-1.39-2.13C21.31 1.34 20.64.93 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0zm0 5.84A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84zm0 10.16A4 4 0 1 1 16 12a4 4 0 0 1-4 4zm6.41-10.85a1.44 1.44 0 1 1-1.44-1.44 1.44 1.44 0 0 1 1.44 1.44z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.16 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.91h-2.34V22c4.78-.78 8.44-4.94 8.44-9.94z" />
    </svg>
  );
}
// ----------------------------

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail("");
    setTimeout(() => setSubscribed(false), 3500);
  };

  return (
    <footer className="site-footer">
      {/* Linia de orizont — semnătura vizuală */}
      <div className="footer-horizon" aria-hidden="true">
        <span className="horizon-star">★</span>
        <span className="horizon-line" />
        <span className="horizon-star">★</span>
        <span className="horizon-line" />
        <span className="horizon-star">★</span>
      </div>

      <div className="footer-top">
        <div className="footer-container footer-grid">
          {/* Coloana 1: Brand & Newsletter */}
          <div className="footer-col footer-col-brand">
            <Link
              to="/"
              className="brand footer-brand"
              aria-label="Vila Casa Esy"
            >
              <span className="brand-name">CASA ESY</span>
              <span className="brand-sub">HOTEL · MAMAIA</span>
            </Link>
            <p className="footer-desc">
              Oază ta de liniște la malul Mării Negre. Oferim experiențe de
              neuitat, confort la standarde înalte și o atmosferă unde luxul
              întâlnește relaxarea.
            </p>

            <form className="footer-newsletter" onSubmit={handleSubscribe}>
              <label htmlFor="footer-email" className="newsletter-label">
                Abonează-te pentru oferte exclusive
              </label>
              <div className="newsletter-row">
                <input
                  id="footer-email"
                  type="email"
                  placeholder="adresa@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit" aria-label="Abonează-te">
                  {subscribed ? "✓" : <Send size={15} strokeWidth={2} />}
                </button>
              </div>
              {subscribed && (
                <span className="newsletter-confirm">
                  Te-ai abonat cu succes
                </span>
              )}
            </form>

            <div className="footer-social">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                aria-label="Instagram"
              >
                <InstagramIcon />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                aria-label="Facebook"
              >
                <FacebookIcon />
              </a>
            </div>
          </div>

          {/* Coloana 2: Contact */}
          <div className="footer-col">
            <h4 className="footer-heading">Contact</h4>
            <ul className="footer-contact-list">
              <li>
                <MapPin size={18} className="contact-icon" />
                <span>Bulevardul Mamaia, Constanța, România</span>
              </li>
              <li>
                <Phone size={18} className="contact-icon" />
                <a href="tel:+40700000000">+40 700 000 000</a>
              </li>
              <li>
                <Mail size={18} className="contact-icon" />
                <a href="mailto:contact@casaesy.ro">contact@casaesy.ro</a>
              </li>
            </ul>
          </div>

          {/* Coloana 3: Linkuri Rapide */}
          <div className="footer-col">
            <h4 className="footer-heading">Explorează</h4>
            <ul className="footer-links">
              <li>
                <Link to="/camere">Camere & Apartamente</Link>
              </li>
              <li>
                <Link to="/oferte">Oferte Speciale</Link>
              </li>
              <li>
                <Link to="/restaurant">Restaurant & Bar</Link>
              </li>
              <li>
                <Link to="/evenimente-private">Evenimente Private</Link>
              </li>
              <li>
                <Link to="/contact">Contact & Localizare</Link>
              </li>
            </ul>
          </div>

          {/* Coloana 4: Legal */}
          <div className="footer-col">
            <h4 className="footer-heading">Informații Legale</h4>
            <ul className="footer-links">
              <li>
                <Link to="/termeni-si-conditii">Termeni și condiții</Link>
              </li>
              <li>
                <Link to="/politica-de-confidentialitate">
                  Politica de confidențialitate
                </Link>
              </li>
              <li>
                <Link to="/politica-de-cookie">Politica de cookie</Link>
              </li>
              <li>
                <Link to="/termeni-facilitati">
                  Termeni și condiții facilități
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* TRUST BAR */}
      <div className="footer-trust-bar">
        <div className="footer-container trust-bar-inner">
          <div className="trust-item">
            <ShieldCheck size={17} />
            <span>Plăți 100% Securizate</span>
          </div>
          <span className="trust-divider" />
          <div className="trust-item">
            <BadgeCheck size={17} />
            <span>Rezervare Garantată</span>
          </div>
          <span className="trust-divider" />

          {/* Imaginea pentru metodele de plată */}
          <div className="trust-item">
            <img
              src="image_cc2402.png"
              alt="Metode de plată: Mastercard, Maestro, Visa"
              style={{ height: "24px", width: "auto", objectFit: "contain" }}
            />
          </div>
          <span className="trust-divider" />

          <div className="anpc-badge-group">
            {/* 1. Placheta ANPC - SAL (Soluționarea Alternativă a Litigiilor) */}
            <a
              href="https://anpc.ro/ce-este-sal/"
              target="_blank"
              rel="noopener noreferrer"
              className="anpc-badge-card"
              title="Soluționarea Alternativă a Litigiilor"
            >
              <img
                src="https://reclamatii.anpc.ro/assets/images/sal.png"
                alt="ANPC SAL"
                loading="lazy"
              />
            </a>

            {/* 2. Placheta ANPC - SOL (Soluționarea Online a Litigiilor) */}
            <a
              href="https://ec.europa.eu/consumers/odr"
              target="_blank"
              rel="noopener noreferrer"
              className="anpc-badge-card"
              title="Soluționarea Online a Litigiilor"
            >
              <img
                src="https://reclamatii.anpc.ro/assets/images/sol.png"
                alt="ANPC SOL"
                loading="lazy"
              />
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-container footer-bottom-inner">
          <p className="copyright">
            © {currentYear} Vila Casa Esy — Toate drepturile rezervate
          </p>
          <button
            className="back-to-top"
            onClick={scrollToTop}
            aria-label="Înapoi sus"
          >
            <span>Înapoi sus</span>
            <ArrowUp size={14} />
          </button>
        </div>
      </div>
    </footer>
  );
}
