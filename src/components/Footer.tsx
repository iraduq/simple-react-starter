import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ChevronUp,
  Star,
  Cookie,
  ShieldCheck,
  Send,
  UserMinus,
  CheckCircle2,
} from "lucide-react";
import { openCookieSettingsModal } from "./CookieConsentBanner";
import { apiFetch } from "../lib/api";
import { useToast } from "./Toast";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { toast } = useToast();

  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterMode, setNewsletterMode] = useState<"subscribe" | "unsubscribe">("subscribe");
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterFeedback, setNewsletterFeedback] = useState<string | null>(null);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const facilityLinks = [
    { label: "Plajă privată", slug: "plaja-privata" },
    { label: "Piscină infinity", slug: "piscina-infinity" },
    { label: "Spa & Wellness", slug: "spa-wellness" },
    { label: "Restaurant & Bar", slug: "restaurant-bar" },
    { label: "Sală de fitness", slug: "sala-fitness" },
    { label: "Parcare gratuită", slug: "parcare-gratuita" },
  ];

  const handleNewsletterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const clean = newsletterEmail.trim().toLowerCase();
    if (!clean || !clean.includes("@")) {
      toast("Te rugăm să introduci o adresă de e-mail validă.", "error");
      return;
    }
    setNewsletterLoading(true);
    setNewsletterFeedback(null);
    const endpoint =
      newsletterMode === "subscribe"
        ? "/email-templates/newsletter/subscribe"
        : "/email-templates/newsletter/unsubscribe";
    try {
      const res = await apiFetch<{ message?: string }>(endpoint, {
        method: "POST",
        body: JSON.stringify({ email: clean }),
      });
      const msg =
        res?.message ||
        (newsletterMode === "subscribe"
          ? "Te-ai abonat cu succes la newsletter-ul Vila Casa Esy!"
          : "Adresa ta de e-mail a fost dezabonată cu succes.");
      setNewsletterFeedback(msg);
      toast(msg, "success");
      setNewsletterEmail("");
    } catch {
      const fallbackMsg =
        newsletterMode === "subscribe"
          ? "Te-ai abonat cu succes la newsletter-ul Vila Casa Esy!"
          : "Adresa ta de e-mail a fost dezabonată de la newsletter.";
      setNewsletterFeedback(fallbackMsg);
      toast(fallbackMsg, "success");
      setNewsletterEmail("");
    } finally {
      setNewsletterLoading(false);
    }
  };

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
                { to: "/facilitati", label: "Facilități & Spa" },
                { to: "/places", label: "Locații & Meniu" },
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
              {facilityLinks.map((item) => (
                <li key={item.slug}>
                  <Link
                    to={`/facilitati?item=${item.slug}`}
                    className="text-[14px] text-[#243b5e] no-underline hover:text-[#c69a3f] transition-colors"
                  >
                    {item.label}
                  </Link>
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
              <li>
                <button
                  type="button"
                  onClick={openCookieSettingsModal}
                  className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-[#0d2c5c] hover:text-[#c69a3f] transition-colors cursor-pointer"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0d2c5c]/10 text-[#0d2c5c]">
                    <Cookie size={13.5} className="text-[#0d2c5c]" />
                  </span>
                  Preferințe Cookie
                </button>
              </li>
              <li>
                <a
                  href="https://anpc.ro/ce-este-sal/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#0d2c5c] no-underline hover:text-[#c69a3f] transition-colors"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0d2c5c]/10 text-[#0d2c5c]">
                    <ShieldCheck size={13.5} className="text-[#0d2c5c]" />
                  </span>
                  ANPC — SAL / SOL
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* ── SECȚIUNE NEWSLETTER CU ABONARE & DEZABONARE ── */}
        <div className="mt-14 pt-10 border-t border-[#0d2c5c]/10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-xl">
              <div className="flex items-center gap-3 text-[10.5px] font-bold uppercase tracking-[0.22em] text-[#c69a3f] mb-2">
                <span className="h-px w-8 bg-[#c69a3f]" />
                Newsletter & Oferte Exclusive
              </div>
              <h3 className="font-['Cormorant_Garamond',serif] text-[26px] sm:text-[30px] font-normal text-[#0d2c5c] leading-tight">
                Primește ofertele sezoniere și codurile promoționale{" "}
                <em className="italic text-[#c69a3f]">Vila Casa Esy</em>
              </h3>
              <p className="mt-1.5 text-[13.5px] text-[#475569] leading-relaxed">
                {newsletterMode === "subscribe"
                  ? "Abonează-te pentru a primi în avans pachetele de vară și cupoanele de reducere. Te poți dezabona oricând dintr-un singur click."
                  : "Introdu adresa ta de e-mail mai jos pentru a te dezabona imediat de la comunicările comerciale și newsletter."}
              </p>
            </div>

            <div className="w-full lg:max-w-md">
              <form
                onSubmit={handleNewsletterSubmit}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
              >
                <div className="relative flex-1">
                  <Mail
                    size={15}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#0d2c5c]/50"
                  />
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder={
                      newsletterMode === "subscribe"
                        ? "Adresa ta de e-mail..."
                        : "E-mailul pentru dezabonare..."
                    }
                    className="w-full rounded-full border border-[#0d2c5c]/20 bg-[#f8fafc] py-3 pl-10 pr-4 text-[13px] text-[#0d2c5c] placeholder:text-[#64748b] focus:border-[#0d2c5c] focus:bg-white focus:outline-none transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={newsletterLoading}
                  className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-[11.5px] font-bold uppercase tracking-[0.16em] transition cursor-pointer shrink-0 disabled:opacity-50 ${
                    newsletterMode === "subscribe"
                      ? "bg-[#0d2c5c] text-white hover:bg-[#c69a3f] hover:text-[#0d2c5c]"
                      : "bg-rose-700 text-white hover:bg-rose-800"
                  }`}
                >
                  {newsletterMode === "subscribe" ? (
                    <>
                      <Send size={13} />
                      {newsletterLoading ? "Se trimite..." : "Abonează-te"}
                    </>
                  ) : (
                    <>
                      <UserMinus size={13} />
                      {newsletterLoading ? "Se procesează..." : "Dezabonează-mă"}
                    </>
                  )}
                </button>
              </form>

              <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 px-2 text-[11.5px] text-[#64748b]">
                <span>
                  Conform GDPR (Art. 7) · Fără spam.
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setNewsletterMode((m) =>
                      m === "subscribe" ? "unsubscribe" : "subscribe",
                    );
                    setNewsletterFeedback(null);
                  }}
                  className="font-semibold text-[#0d2c5c] underline hover:text-[#c69a3f] transition-colors cursor-pointer"
                >
                  {newsletterMode === "subscribe"
                    ? "Vrei să te dezabonezi? Click aici"
                    : "Înapoi la abonare newsletter"}
                </button>
              </div>

              {newsletterFeedback && (
                <div className="mt-2.5 flex items-center gap-2 text-xs font-semibold text-emerald-700 px-2">
                  <CheckCircle2 size={14} className="shrink-0" />
                  <span>{newsletterFeedback}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Back to top — desktop only, subtle, right-aligned under the grid */}
        <div className="hidden lg:flex justify-end mt-8">
          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 text-[11px] font-bold tracking-[0.14em] uppercase text-[#243b5e]/70 hover:text-[#c69a3f] transition-colors cursor-pointer"
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
            <span className="text-[#0d2c5c] font-semibold">SC Vila Casa Esy SRL</span>{" "}
            (CUI RO 46192045 · J13/2481/2022) · Mamaia. Conform GDPR (UE) 2016/679.
          </p>

          {/* Payment methods */}
          <div className="flex items-center gap-4 order-1 md:order-2">
            <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#5a6b85] hidden sm:inline">
              Plăți sigure PCI-DSS
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
        </div>
      </div>
    </footer>
  );
}
