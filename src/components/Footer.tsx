import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Clock, ChevronUp } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="bg-[#0d2c5c] text-white font-sans">
      {/* Main footer content */}
      <div className="max-w-[1320px] mx-auto px-6 md:px-10 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr_1fr] gap-10 md:gap-8">
          {/* BRAND + CONTACT */}
          <div>
            <Link
              to="/"
              className="inline-flex flex-col items-start gap-1 mb-6 no-underline"
            >
              <span className="text-xs tracking-[0.3em] text-[#c69a3f]">★ ★ ★</span>
              <span className="font-['Cormorant_Garamond',serif] text-[26px] font-semibold tracking-wide text-white">
                CASA ESY
              </span>
              <span className="text-[9px] font-medium tracking-[0.25em] uppercase text-white/50">
                HOTEL · MAMAIA
              </span>
            </Link>

            <p className="text-[14px] leading-[1.75] text-white/60 max-w-[300px] font-light mb-8">
              Refugiul tău perfect la malul Mării Negre. Camere rafinate,
              priveliști superbe și ospitalitate caldă.
            </p>

            {/* Contact info */}
            <div className="flex flex-col gap-3">
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 text-white/70 text-[13px] no-underline hover:text-[#c69a3f] transition-colors"
              >
                <MapPin size={16} className="shrink-0 mt-0.5 text-[#c69a3f]" />
                <span>Strada Mării Nr. 123, Mamaia, Constanța</span>
              </a>
              <a
                href="tel:+40721234567"
                className="flex items-center gap-3 text-white/70 text-[13px] no-underline hover:text-[#c69a3f] transition-colors"
              >
                <Phone size={16} className="shrink-0 text-[#c69a3f]" />
                <span>+40 721 234 567</span>
              </a>
              <a
                href="mailto:contact@casaesy.ro"
                className="flex items-center gap-3 text-white/70 text-[13px] no-underline hover:text-[#c69a3f] transition-colors"
              >
                <Mail size={16} className="shrink-0 text-[#c69a3f]" />
                <span>contact@casaesy.ro</span>
              </a>
              <div className="flex items-center gap-3 text-white/70 text-[13px]">
                <Clock size={16} className="shrink-0 text-[#c69a3f]" />
                <span>Recepție 24/7</span>
              </div>
            </div>
          </div>

          {/* NAVIGARE */}
          <div>
            <h4 className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#c69a3f] mb-5">
              Navigare
            </h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-3">
              {[
                { to: "/", label: "Acasă" },
                { to: "/camere", label: "Camere" },
                { to: "/oferte", label: "Oferte" },
                { to: "/restaurant", label: "Restaurant" },
                { to: "/evenimente-private", label: "Evenimente" },
                { to: "/contact", label: "Contact" },
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-[14px] text-white/60 no-underline hover:text-[#c69a3f] transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* FACILITIES */}
          <div>
            <h4 className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#c69a3f] mb-5">
              Facilități
            </h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-3">
              {[
                "Plajă privată",
                "Piscină infinity",
                "Spa & Wellness",
                "Restaurant & Bar",
                "Sală de fitness",
                "Parcare gratuită",
              ].map((item) => (
                <li key={item}>
                  <span className="text-[14px] text-white/60">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* LEGAL */}
          <div>
            <h4 className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#c69a3f] mb-5">
              Legal
            </h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-3">
              {[
                { to: "/termeni-si-conditii", label: "Termeni și condiții" },
                { to: "/politica-de-confidentialitate", label: "Confidențialitate" },
                { to: "/politica-de-cookie", label: "Cookie" },
                { to: "/gdpr", label: "GDPR" },
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-[14px] text-white/60 no-underline hover:text-[#c69a3f] transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social + Back to top */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mt-12 pt-8 border-t border-white/10">
          {/* Social icons */}
          <div className="flex items-center gap-4">
            {["facebook", "instagram", "tripadvisor"].map((platform) => (
              <a
                key={platform}
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={platform}
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-[#c69a3f] hover:border-[#c69a3f] transition-all"
              >
                {platform === "facebook" && (
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.16 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.91h-2.34V22c4.78-.78 8.44-4.94 8.44-9.94z" />
                  </svg>
                )}
                {platform === "instagram" && (
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.24 2.22.41.56.21.96.47 1.38.89.42.42.68.82.89 1.38.17.42.36 1.05.41 2.22.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.24 1.8-.41 2.22-.21.56-.47.96-.89 1.38-.42.42-.82.68-1.38.89-.42.17-1.05.36-2.22.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.24-2.22-.41-.56-.21-.96-.47-1.38-.89-.42-.42-.68-.82-.89-1.38-.17-.42-.36-1.05-.41-2.22-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.24-1.8.41-2.22.21-.56.47-.96.89-1.38.42-.42.82-.68 1.38-.89.42-.17 1.05-.36 2.22-.41 1.27-.06 1.65-.07 4.85-.07M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.31-1.46.72-2.13 1.39C1.34 2.69.93 3.36.63 4.14c-.3.76-.5 1.64-.56 2.91C.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.31.79.72 1.46 1.39 2.13.67.67 1.34 1.08 2.13 1.39.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56.79-.31 1.46-.72 2.13-1.39.67-.67 1.08-1.34 1.39-2.13.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91-.31-.79-.72-1.46-1.39-2.13C21.31 1.34 20.64.93 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0zm0 5.84A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84zm0 10.16A4 4 0 1 1 16 12a4 4 0 0 1-4 4zm6.41-10.85a1.44 1.44 0 1 1-1.44-1.44 1.44 1.44 0 0 1 1.44 1.44z" />
                  </svg>
                )}
                {platform === "tripadvisor" && (
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M12.006 4.295c-2.67 0-5.512.773-7.783 2.543H.936l1.35 2.176A5.49 5.49 0 0 0 .295 12.5a5.5 5.5 0 0 0 9.898 3.317l1.807 2.721 1.807-2.721A5.5 5.5 0 0 0 23.707 12.5c0-2.07-1.18-3.87-2.9-4.77l1.35-2.175h-3.287c-2.271-1.77-5.113-2.543-7.784-2.543zm0 1.5c2.227 0 4.603.614 6.52 2.013l.156.125h2.332l-.621 1.001a5.48 5.48 0 0 0-2.66-.689 5.49 5.49 0 0 0-4.766 2.76l-.96 1.445-.96-1.445a5.49 5.49 0 0 0-4.766-2.76c-.93 0-1.807.232-2.573.64l-.602-.97h2.332l.156-.125c1.917-1.399 4.293-2.013 6.52-2.013zM5.793 9.5a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm12.414 0a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm-12.414 1.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zm12.414 0a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z" />
                  </svg>
                )}
              </a>
            ))}
          </div>

          {/* Back to top */}
          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 text-[11px] font-bold tracking-[0.14em] uppercase text-white/60 hover:text-[#c69a3f] transition-colors"
          >
            <ChevronUp size={14} />
            <span>Înapoi sus</span>
          </button>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-[#c69a3f] py-3">
        <p className="text-center text-[11px] font-semibold tracking-[0.04em] text-[#0d2c5c] m-0">
          Copyright © {currentYear} Vila Casa Esy · Mamaia. Toate drepturile rezervate.
        </p>
      </div>
    </footer>
  );
}
