import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Clock, ChevronUp, Star } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="bg-white text-[#0d2c5c] font-sans border-t border-[#0d2c5c]/10">
      {/* Accent top line */}
      <div className="h-[2px] bg-gradient-to-r from-transparent via-[#c69a3f] to-transparent" />
      {/* Main footer content */}
      <div className="max-w-[1320px] mx-auto px-6 md:px-10 lg:px-14 pt-16 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.3fr_auto_1fr_1fr_1fr] gap-y-12 gap-x-10 lg:gap-x-14">
          {/* BRAND + CONTACT */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              to="/"
              className="inline-flex flex-col items-center gap-2 mb-7 no-underline"
            >
              <span className="flex items-center gap-1.5 text-[#c69a3f]">
                <Star size={9} fill="currentColor" strokeWidth={0} />
                <Star size={9} fill="currentColor" strokeWidth={0} />
                <Star size={9} fill="currentColor" strokeWidth={0} />
              </span>
              <span className="font-['Cormorant_Garamond',serif] text-[32px] leading-none font-semibold tracking-wide mr-[-0.025em] text-[#0d2c5c]">
                CASA ESY
              </span>
              <span className="text-[10px] font-semibold tracking-[0.25em] mr-[-0.25em] uppercase text-[#0d2c5c]/60">
                HOTEL · MAMAIA
              </span>
            </Link>

            <p className="text-[14.5px] leading-[1.8] text-[#3d4f6b] max-w-[280px] font-normal mb-8">
              Refugiul tău perfect la malul Mării Negre. Camere rafinate,
              priveliști superbe și ospitalitate caldă.
            </p>

            {/* Contact info */}
            <div className="flex flex-col gap-3.5">
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 text-[#243b5e] text-[13.5px] no-underline hover:text-[#c69a3f] transition-colors"
              >
                <MapPin size={16} className="shrink-0 mt-0.5 text-[#c69a3f]" />
                <span>Strada Mării Nr. 123, Mamaia, Constanța</span>
              </a>
              <a
                href="tel:+40721234567"
                className="flex items-center gap-3 text-[#243b5e] text-[13.5px] no-underline hover:text-[#c69a3f] transition-colors"
              >
                <Phone size={16} className="shrink-0 text-[#c69a3f]" />
                <span>+40 721 234 567</span>
              </a>
              <a
                href="mailto:contact@casaesy.ro"
                className="flex items-center gap-3 text-[#243b5e] text-[13.5px] no-underline hover:text-[#c69a3f] transition-colors"
              >
                <Mail size={16} className="shrink-0 text-[#c69a3f]" />
                <span>contact@casaesy.ro</span>
              </a>
              <div className="flex items-center gap-3 text-[#243b5e] text-[13.5px]">
                <Clock size={16} className="shrink-0 text-[#c69a3f]" />
                <span>Recepție 24/7</span>
              </div>
            </div>
          </div>

          {/* Vertical divider — desktop only */}
          <div className="hidden lg:block w-px bg-[#0d2c5c]/10 self-stretch" />

          {/* NAVIGARE */}
          <div>
            <h4 className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#c69a3f] mb-6">
              Navigare
            </h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-3.5">
              {[
                { to: "/", label: "Acasă" },
                { to: "/camere", label: "Camere" },
                { to: "/disponibilitate", label: "Disponibilitate" },
                { to: "/places", label: "Locații" },
                { to: "/contact", label: "Contact" },
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-[14px] text-[#243b5e] no-underline hover:text-[#c69a3f] transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* FACILITIES */}
          <div>
            <h4 className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#c69a3f] mb-6">
              Facilități
            </h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-3.5">
              {[
                "Plajă privată",
                "Piscină infinity",
                "Spa & Wellness",
                "Restaurant & Bar",
                "Sală de fitness",
                "Parcare gratuită",
              ].map((item) => (
                <li key={item}>
                  <span className="text-[14px] text-[#243b5e]">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* LEGAL */}
          <div>
            <h4 className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#c69a3f] mb-6">
              Legal
            </h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-3.5">
              {[
                { to: "/termeni-si-conditii", label: "Termeni și condiții" },
                {
                  to: "/confidentialitate",
                  label: "Confidențialitate",
                },
                { to: "/cookies", label: "Cookie" },
                { to: "/gdpr", label: "GDPR" },
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-[14px] text-[#243b5e] no-underline hover:text-[#c69a3f] transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Back to top — desktop only, subtle, right-aligned under the grid */}
        <div className="hidden lg:flex justify-end mt-6">
          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 text-[11px] font-bold tracking-[0.14em] uppercase text-[#243b5e]/70 hover:text-[#c69a3f] transition-colors"
          >
            <span>Înapoi sus</span>
            <ChevronUp size={14} />
          </button>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#0d2c5c]/10">
        <div className="max-w-[1320px] mx-auto px-6 md:px-10 lg:px-14 py-6 flex flex-col md:flex-row items-center justify-between gap-5 text-center md:text-left">
          <p className="text-[12px] text-[#5a6b85] m-0 order-2 md:order-1">
            © {currentYear}{" "}
            <span className="text-[#0d2c5c] font-semibold">Vila Casa Esy</span>{" "}
            · Mamaia. Toate drepturile rezervate.
          </p>

          {/* Payment methods */}
          <div className="flex items-center gap-4 order-1 md:order-2">
            <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#5a6b85] hidden sm:inline">
              Plăți sigure
            </span>
            <div className="flex items-center gap-2">
              {[
                {
                  name: "Visa",
                  src: "https://raw.githubusercontent.com/aaronfagan/svg-credit-card-payment-icons/main/logo/visa.svg",
                },
                {
                  name: "Mastercard",
                  src: "https://raw.githubusercontent.com/aaronfagan/svg-credit-card-payment-icons/main/logo/mastercard.svg",
                },
                {
                  name: "PayPal",
                  src: "https://raw.githubusercontent.com/aaronfagan/svg-credit-card-payment-icons/main/logo/paypal.svg",
                },
              ].map((card) => (
                <div
                  key={card.name}
                  className="h-9 w-14 rounded-md border border-[#0d2c5c]/10 bg-white shadow-[0_1px_3px_rgba(13,44,92,0.06)] flex items-center justify-center px-2 hover:shadow-[0_2px_8px_rgba(13,44,92,0.12)] hover:-translate-y-px transition-all duration-200"
                >
                  <img
                    src={card.src}
                    alt={card.name}
                    className="max-h-5 max-w-full object-contain"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Back to top — mobile/tablet only, in the bottom bar */}
          <button
            onClick={scrollToTop}
            className="lg:hidden flex items-center gap-2 text-[11px] font-bold tracking-[0.14em] uppercase text-[#243b5e]/70 hover:text-[#c69a3f] transition-colors order-3"
          >
            <ChevronUp size={14} />
            <span>Sus</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
