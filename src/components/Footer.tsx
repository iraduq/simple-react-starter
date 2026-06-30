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

const footerLinkClass =
  "group/link relative inline-block text-white/62 text-sm no-underline transition-all duration-200 hover:text-white hover:pl-4 max-md:hover:pl-0 before:content-['—'] before:absolute before:-left-4 before:opacity-0 before:text-[#c69a3f] before:transition-all before:duration-200 hover:before:opacity-100 hover:before:left-0 max-md:before:hidden";

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
    <footer
      className="relative text-white font-sans"
      style={{
        background:
          "radial-gradient(circle at top right, rgba(198,154,63,0.06), transparent 55%), linear-gradient(180deg, #081d3f 0%, #0d2c5c 100%)",
      }}
    >
      <div
        className="flex items-center justify-center gap-[18px] pt-14 pb-2"
        aria-hidden="true"
      >
        <span className="text-[#c69a3f] text-[13px] leading-none [text-shadow:0_0_14px_rgba(198,154,63,0.55)]">
          ★
        </span>
        <span
          className="w-[90px] h-px opacity-60"
          style={{
            background:
              "linear-gradient(90deg, transparent, #c69a3f 50%, transparent)",
          }}
        />
        <span className="text-[#c69a3f] text-[13px] leading-none [text-shadow:0_0_14px_rgba(198,154,63,0.55)]">
          ★
        </span>
        <span
          className="w-[90px] h-px opacity-60"
          style={{
            background:
              "linear-gradient(90deg, transparent, #c69a3f 50%, transparent)",
          }}
        />
        <span className="text-[#c69a3f] text-[13px] leading-none [text-shadow:0_0_14px_rgba(198,154,63,0.55)]">
          ★
        </span>
      </div>

      <div className="py-10 pb-14">
        <div className="max-w-[1320px] mx-auto px-6 md:px-10 relative z-[2] grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[2.1fr_1.2fr_1.2fr_1.3fr] gap-10 xl:gap-14 max-md:text-center">
          <div>
            <Link
              to="/"
              className="flex flex-col items-start gap-0.5 mb-[22px] no-underline max-md:items-center max-md:mx-auto"
              aria-label="Vila Casa Esy"
            >
              <span className="font-['Cormorant_Garamond',serif] text-[26px] font-semibold tracking-[0.05em] text-white">
                CASA ESY
              </span>
              <span className="text-[10px] font-medium tracking-[0.25em] uppercase text-[#c69a3f]">
                HOTEL · MAMAIA
              </span>
            </Link>
            <p className="text-[14.5px] leading-[1.75] text-white/62 mb-7 max-w-[360px] max-md:mx-auto">
              Oază ta de liniște la malul Mării Negre. Oferim experiențe de
              neuitat, confort la standarde înalte și o atmosferă unde luxul
              întâlnește relaxarea.
            </p>

            <form
              className="mb-[26px] max-w-[360px] max-md:mx-auto"
              onSubmit={handleSubscribe}
            >
              <label
                htmlFor="footer-email"
                className="block text-[11.5px] font-semibold tracking-[0.08em] uppercase text-white/85 mb-2.5"
              >
                Abonează-te pentru oferte exclusive
              </label>
              <div className="flex border border-[rgba(198,154,63,0.35)] rounded-full overflow-hidden bg-white/[0.04] transition-colors duration-[250ms] focus-within:border-[#c69a3f] focus-within:bg-white/[0.07]">
                <input
                  id="footer-email"
                  type="email"
                  placeholder="adresa@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 bg-transparent border-none outline-none py-3 px-4 font-sans text-[13.5px] text-white placeholder:text-white/40"
                />
                <button
                  type="submit"
                  aria-label="Abonează-te"
                  className="flex items-center justify-center w-11 shrink-0 bg-[#c69a3f] text-[#0d2c5c] font-bold cursor-pointer border-none transition-colors duration-200 hover:bg-[#d8ad52]"
                >
                  {subscribed ? "✓" : <Send size={15} strokeWidth={2} />}
                </button>
              </div>
              {subscribed && (
                <span className="block mt-2 text-xs text-[#c69a3f]">
                  Te-ai abonat cu succes
                </span>
              )}
            </form>

            <div className="flex gap-3 max-md:justify-center">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-[38px] h-[38px] rounded-full bg-white/[0.04] text-white/70 border border-[rgba(198,154,63,0.25)] transition-all duration-300 hover:bg-[#c69a3f] hover:text-[#0d2c5c] hover:border-[#c69a3f] hover:-translate-y-[3px] hover:shadow-[0_8px_20px_rgba(198,154,63,0.3)]"
                aria-label="Instagram"
              >
                <InstagramIcon />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-[38px] h-[38px] rounded-full bg-white/[0.04] text-white/70 border border-[rgba(198,154,63,0.25)] transition-all duration-300 hover:bg-[#c69a3f] hover:text-[#0d2c5c] hover:border-[#c69a3f] hover:-translate-y-[3px] hover:shadow-[0_8px_20px_rgba(198,154,63,0.3)]"
                aria-label="Facebook"
              >
                <FacebookIcon />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-['Cormorant_Garamond',serif] text-lg font-medium text-white tracking-[0.04em] mb-[22px] relative pb-3.5 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-[26px] after:h-0.5 after:bg-[#c69a3f] after:rounded-sm max-md:after:left-1/2 max-md:after:-translate-x-1/2">
              Contact
            </h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-[17px]">
              <li className="flex items-start gap-3 text-white/62 text-sm leading-normal max-md:flex-col max-md:items-center max-md:gap-2">
                <MapPin size={18} className="text-[#c69a3f] shrink-0 mt-px" />
                <span>Bulevardul Mamaia, Constanța, România</span>
              </li>
              <li className="flex items-start gap-3 text-white/62 text-sm leading-normal max-md:flex-col max-md:items-center max-md:gap-2">
                <Phone size={18} className="text-[#c69a3f] shrink-0 mt-px" />
                <a
                  href="tel:+40700000000"
                  className="text-white/62 no-underline transition-colors duration-200 hover:text-[#c69a3f]"
                >
                  +40 700 000 000
                </a>
              </li>
              <li className="flex items-start gap-3 text-white/62 text-sm leading-normal max-md:flex-col max-md:items-center max-md:gap-2">
                <Mail size={18} className="text-[#c69a3f] shrink-0 mt-px" />
                <a
                  href="mailto:contact@casaesy.ro"
                  className="text-white/62 no-underline transition-colors duration-200 hover:text-[#c69a3f]"
                >
                  contact@casaesy.ro
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-['Cormorant_Garamond',serif] text-lg font-medium text-white tracking-[0.04em] mb-[22px] relative pb-3.5 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-[26px] after:h-0.5 after:bg-[#c69a3f] after:rounded-sm max-md:after:left-1/2 max-md:after:-translate-x-1/2">
              Explorează
            </h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-[13px]">
              <li>
                <Link to="/camere" className={footerLinkClass}>
                  Camere & Apartamente
                </Link>
              </li>
              <li>
                <Link to="/oferte" className={footerLinkClass}>
                  Oferte Speciale
                </Link>
              </li>
              <li>
                <Link to="/restaurant" className={footerLinkClass}>
                  Restaurant & Bar
                </Link>
              </li>
              <li>
                <Link to="/evenimente-private" className={footerLinkClass}>
                  Evenimente Private
                </Link>
              </li>
              <li>
                <Link to="/contact" className={footerLinkClass}>
                  Contact & Localizare
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-['Cormorant_Garamond',serif] text-lg font-medium text-white tracking-[0.04em] mb-[22px] relative pb-3.5 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-[26px] after:h-0.5 after:bg-[#c69a3f] after:rounded-sm max-md:after:left-1/2 max-md:after:-translate-x-1/2">
              Informații Legale
            </h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-[13px]">
              <li>
                <Link to="/termeni-si-conditii" className={footerLinkClass}>
                  Termeni și condiții
                </Link>
              </li>
              <li>
                <Link
                  to="/politica-de-confidentialitate"
                  className={footerLinkClass}
                >
                  Politica de confidențialitate
                </Link>
              </li>
              <li>
                <Link to="/politica-de-cookie" className={footerLinkClass}>
                  Politica de cookie
                </Link>
              </li>
              <li>
                <Link to="/termeni-facilitati" className={footerLinkClass}>
                  Termeni și condiții facilități
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="relative bg-black/18 border-y border-[rgba(198,154,63,0.18)] z-[2] before:content-[''] before:absolute before:-top-px before:left-1/2 before:-translate-x-1/2 before:w-[200px] before:h-px before:opacity-60 before:bg-[radial-gradient(circle,#c69a3f,transparent_70%)]">
        <div className="max-w-[1320px] mx-auto px-6 md:px-10 flex items-center justify-center gap-7 flex-wrap py-5">
          <div className="flex items-center gap-2 text-[13px] font-medium text-white/75 whitespace-nowrap">
            <ShieldCheck size={17} className="text-[#c69a3f] shrink-0" />
            <span>Plăți 100% Securizate</span>
          </div>
          <span className="w-px h-5 bg-white/15 shrink-0 max-md:hidden" />
          <div className="flex items-center gap-2 text-[13px] font-medium text-white/75 whitespace-nowrap">
            <BadgeCheck size={17} className="text-[#c69a3f] shrink-0" />
            <span>Rezervare Garantată</span>
          </div>
          <span className="w-px h-5 bg-white/15 shrink-0 max-md:hidden" />
          <div className="flex items-center gap-2 text-[13px] font-medium text-white/75 whitespace-nowrap">
            <img
              src="image_cc2402.png"
              alt="Metode de plată: Mastercard, Maestro, Visa"
              className="h-6 w-auto object-contain"
            />
          </div>
          <span className="w-px h-5 bg-white/15 shrink-0 max-md:hidden" />
          <div className="flex items-center gap-2.5">
            <a
              href="https://anpc.ro/ce-este-sal/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center bg-white rounded-md px-2.5 py-1.5 shadow-[0_2px_10px_rgba(0,0,0,0.25)] border border-transparent transition-all duration-200 hover:border-[#c69a3f] hover:-translate-y-0.5"
              title="Soluționarea Alternativă a Litigiilor"
            >
              <img
                src="https://reclamatii.anpc.ro/assets/images/sal.png"
                alt="ANPC SAL"
                loading="lazy"
                className="max-w-[88px] h-auto block"
              />
            </a>
            <a
              href="https://ec.europa.eu/consumers/odr"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center bg-white rounded-md px-2.5 py-1.5 shadow-[0_2px_10px_rgba(0,0,0,0.25)] border border-transparent transition-all duration-200 hover:border-[#c69a3f] hover:-translate-y-0.5"
              title="Soluționarea Online a Litigiilor"
            >
              <img
                src="https://reclamatii.anpc.ro/assets/images/sol.png"
                alt="ANPC SOL"
                loading="lazy"
                className="max-w-[88px] h-auto block"
              />
            </a>
          </div>
        </div>
      </div>

      <div className="py-[22px]">
        <div className="max-w-[1320px] mx-auto px-6 md:px-10 flex items-center justify-between flex-wrap gap-4 max-md:justify-center max-md:text-center">
          <p className="m-0 text-[12.5px] text-white/40 tracking-[0.04em]">
            © {currentYear} Vila Casa Esy — Toate drepturile rezervate
          </p>
          <button
            type="button"
            onClick={scrollToTop}
            aria-label="Înapoi sus"
            className="inline-flex items-center gap-2 bg-transparent border border-white/15 rounded-full px-4 py-2 text-[11.5px] font-semibold tracking-[0.06em] text-white/65 cursor-pointer transition-all duration-[250ms] hover:border-[#c69a3f] hover:text-[#c69a3f] hover:-translate-y-[3px]"
          >
            <span>Înapoi sus</span>
            <ArrowUp size={14} />
          </button>
        </div>
      </div>
    </footer>
  );
}
