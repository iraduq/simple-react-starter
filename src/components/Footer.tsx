import { Link } from "react-router-dom";
import { ChevronsUp, Send } from "lucide-react";
import { useState } from "react";

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
      <path d="M18.9 2H22l-7.6 8.7L23.3 22h-7.1l-5.5-7.2L4.4 22H1.3l8.1-9.3L1 2h7.3l5 6.6L18.9 2zm-1.2 18h1.9L6.4 4H4.4l13.3 16z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.24 2.22.41.56.21.96.47 1.38.89.42.42.68.82.89 1.38.17.42.36 1.05.41 2.22.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.24 1.8-.41 2.22-.21.56-.47.96-.89 1.38-.42.42-.82.68-1.38.89-.42.17-1.05.36-2.22.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.24-2.22-.41-.56-.21-.96-.47-1.38-.89-.42-.42-.68-.82-.89-1.38-.17-.42-.36-1.05-.41-2.22-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.24-1.8.41-2.22.21-.56.47-.96.89-1.38.42-.42.82-.68 1.38-.89.42-.17 1.05-.36 2.22-.41 1.27-.06 1.65-.07 4.85-.07M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.31-1.46.72-2.13 1.39C1.34 2.69.93 3.36.63 4.14c-.3.76-.5 1.64-.56 2.91C.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.31.79.72 1.46 1.39 2.13.67.67 1.34 1.08 2.13 1.39.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56.79-.31 1.46-.72 2.13-1.39.67-.67 1.08-1.34 1.39-2.13.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91-.31-.79-.72-1.46-1.39-2.13C21.31 1.34 20.64.93 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0zm0 5.84A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84zm0 10.16A4 4 0 1 1 16 12a4 4 0 0 1-4 4zm6.41-10.85a1.44 1.44 0 1 1-1.44-1.44 1.44 1.44 0 0 1 1.44 1.44z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.16 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.91h-2.34V22c4.78-.78 8.44-4.94 8.44-9.94z" />
    </svg>
  );
}

function LinkedinIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.14 1.45-2.14 2.94v5.66H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
    </svg>
  );
}

const linkClass =
  "text-white/60 text-sm no-underline transition-colors duration-300 hover:text-[#c69a3f]";

const socialLinks = [
  { Icon: XIcon, label: "X" },
  { Icon: LinkedinIcon, label: "LinkedIn" },
  { Icon: InstagramIcon, label: "Instagram" },
  { Icon: FacebookIcon, label: "Facebook" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail("");
    setTimeout(() => setSubscribed(false), 3500);
  };

  return (
    <footer
      className="relative text-white font-sans overflow-hidden rounded-t-[28px] bg-cover bg-center"
      style={{
        backgroundImage:
          "linear-gradient(180deg, rgba(13,44,92,0.55) 0%, rgba(13,44,92,0.88) 55%, #0d2c5c 100%), url(https://images.pexels.com/photos/1320684/pexels-photo-1320684.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop)",
        backgroundPosition: "center 30%",
      }}
    >
      {/* accent turcoaz discret, punte spre Hero */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(circle at 50% 0%, rgba(94,201,196,0.12) 0%, transparent 55%)",
        }}
      />

      <div className="relative z-[2] max-w-[1320px] mx-auto px-6 md:px-10 pt-16 pb-12">
        {/* eyebrow, ca in Hero */}
        <div className="flex items-center justify-center gap-[15px] mb-14">
          <span className="inline-block w-10 h-px bg-[#5ec9c4]/50" />
          <p className="text-[#5ec9c4] font-sans text-xs font-semibold tracking-[3px] uppercase">
            Vila Casa Esy · Mamaia
          </p>
          <span className="inline-block w-10 h-px bg-[#5ec9c4]/50" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1.6fr_1fr_1fr] gap-12 md:gap-10">
          {/* LOGO + DESCRIERE + NEWSLETTER + SOCIAL */}
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-2.5 mb-6 no-underline"
              aria-label="Vila Casa Esy"
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2 L22 20 H2 Z"
                  stroke="#c69a3f"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
                <path d="M12 9 L17 20 H7 Z" fill="#c69a3f" />
              </svg>
              <span className="font-['Cormorant_Garamond',serif] text-[22px] tracking-[0.08em] uppercase text-white">
                Casa Esy
              </span>
            </Link>

            <p className="text-[14px] leading-[1.75] text-white/70 max-w-[340px] font-light mb-7">
              Oază ta de liniște la malul Mării Negre. Camere rafinate,
              priveliști superbe și ospitalitate caldă la fiecare pas.
            </p>

            {/* NEWSLETTER — glass, ca search bar-ul din Hero */}
            <form onSubmit={handleSubscribe} className="mb-8 max-w-[360px]">
              <label
                htmlFor="footer-email"
                className="block text-[10.5px] font-bold tracking-[0.14em] uppercase text-white/80 mb-2.5"
              >
                Abonează-te pentru oferte exclusive
              </label>
              <div className="flex bg-white/10 backdrop-blur-md border border-white/25 rounded-full overflow-hidden transition-colors duration-300 focus-within:border-[#c69a3f] focus-within:bg-white/[0.16]">
                <input
                  id="footer-email"
                  type="email"
                  placeholder="adresa@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 bg-transparent border-none outline-none py-3 px-5 font-sans text-[13.5px] text-white placeholder:text-white/50"
                />
                <button
                  type="submit"
                  aria-label="Abonează-te"
                  className="flex items-center justify-center w-11 shrink-0 bg-[#c69a3f] text-[#0d2c5c] font-bold cursor-pointer border-none transition-all duration-300 hover:bg-[#d8ad52]"
                >
                  {subscribed ? "✓" : <Send size={15} strokeWidth={2} />}
                </button>
              </div>
              {subscribed && (
                <span className="block mt-2 text-xs text-[#5ec9c4] tracking-wide">
                  Te-ai abonat cu succes
                </span>
              )}
            </form>

            <div className="flex gap-3 mb-9">
              {socialLinks.map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 backdrop-blur-md border border-white/25 text-white/80 transition-all duration-300 hover:border-[#c69a3f] hover:text-[#c69a3f] hover:bg-white/[0.16]"
                >
                  <Icon />
                </a>
              ))}
            </div>

            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/25 rounded-full pl-4 pr-5 py-2 text-[10.5px] font-bold tracking-[0.14em] uppercase text-white/85 transition-all duration-300 hover:border-[#c69a3f] hover:text-[#c69a3f]"
            >
              <ChevronsUp size={13} />
              Înapoi sus
            </button>
          </div>

          {/* SITE MAP */}
          <div>
            <h4 className="text-[11px] font-bold tracking-[0.16em] uppercase text-[#c69a3f] mb-6">
              Site Map
            </h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-4">
              <li>
                <Link
                  to="/"
                  className="text-white text-sm no-underline underline-offset-4 decoration-[#c69a3f]/70 decoration-1"
                >
                  Homepage
                </Link>
              </li>
              <li>
                <Link to="/camere" className={linkClass}>
                  Camere & Apartamente
                </Link>
              </li>
              <li>
                <Link to="/oferte" className={linkClass}>
                  Oferte Speciale
                </Link>
              </li>
              <li>
                <Link to="/restaurant" className={linkClass}>
                  Restaurant & Bar
                </Link>
              </li>
              <li>
                <Link to="/evenimente-private" className={linkClass}>
                  Evenimente Private
                </Link>
              </li>
              <li>
                <Link to="/contact" className={linkClass}>
                  Contact & Localizare
                </Link>
              </li>
            </ul>
          </div>

          {/* LEGAL */}
          <div>
            <h4 className="text-[11px] font-bold tracking-[0.16em] uppercase text-[#c69a3f] mb-6">
              Legal
            </h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-4">
              <li>
                <Link to="/termeni-si-conditii" className={linkClass}>
                  Termeni și condiții
                </Link>
              </li>
              <li>
                <Link to="/politica-de-confidentialitate" className={linkClass}>
                  Politica de confidențialitate
                </Link>
              </li>
              <li>
                <Link to="/politica-de-cookie" className={linkClass}>
                  Politica de cookie
                </Link>
              </li>
              <li>
                <Link to="/termeni-facilitati" className={linkClass}>
                  Termeni facilități
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* BARA AURIE */}
      <div className="relative z-[2] bg-[#c69a3f] py-3">
        <p className="text-center text-[11px] font-semibold tracking-[0.04em] text-[#0d2c5c] m-0">
          Copyright © {currentYear} Vila Casa Esy. Toate drepturile rezervate.
        </p>
      </div>
    </footer>
  );
}
