import { useRef, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Mail,
  Phone,
  ShieldCheck,
  FileText,
  Cookie,
  Scale,
  Check,
} from "lucide-react";

const LEGAL_NAV = [
  { to: "/termeni-si-conditii", label: "Termeni și condiții", icon: Scale },
  { to: "/confidentialitate", label: "Confidențialitate", icon: FileText },
  { to: "/cookies", label: "Politica Cookie", icon: Cookie },
  { to: "/gdpr", label: "Conformitate GDPR", icon: ShieldCheck },
];

export function LegalSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="py-10 first:pt-2 last:pb-2 border-b border-[#0d2c5c]/10 last:border-b-0">
      <div className="flex items-start gap-4 sm:gap-6">
        {icon && (
          <span className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0d2c5c] text-[#e6b85c] shadow-[0_10px_25px_-10px_rgba(13,44,92,0.4)]">
            {icon}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="font-['Cormorant_Garamond',serif] text-[clamp(1.65rem,3vw,2.25rem)] font-normal leading-tight text-[#0d2c5c]">
            {title}
          </h2>
          <span className="mt-2.5 flex items-center gap-2">
            <span className="h-px w-12 bg-gradient-to-r from-[#c69a3f] to-transparent" />
            <span className="h-1.5 w-1.5 rotate-45 bg-[#c69a3f]" />
          </span>
          <div className="mt-4 space-y-3.5 text-[15px] leading-[1.85] text-[#334155] font-normal [&_strong]:font-semibold [&_strong]:text-[#0d2c5c]">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

export function LegalList({ items }: { items: string[] }) {
  return (
    <ul className="m-0 mt-4 space-y-3 list-none p-0">
      {items.map((it) => (
        <li
          key={it}
          className="flex items-start gap-3 text-[14.5px] leading-[1.8] text-[#334155]"
        >
          <span className="mt-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0d2c5c]/10 text-[#0d2c5c]">
            <Check size={12} strokeWidth={2.5} />
          </span>
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}

export default function LegalPage({
  title,
  subtitle,
  lastUpdated,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  lastUpdated?: string;
  children: ReactNode;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { pathname } = useLocation();

  return (
    <div className="relative bg-white text-[#1a1a1a] min-h-screen overflow-hidden">
      {/* ── HERO IDENTIC CU ROOMS.TSX & PLACES.TSX ── */}
      <section className="relative bg-[#0d2c5c] overflow-hidden pt-28 sm:pt-36 md:pt-48 pb-28 md:pb-36 z-10">
        <div className="absolute inset-0 z-0">
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/hero-poster.jpg"
            className="h-full w-full object-cover saturate-50 contrast-110 brightness-100"
          >
            <source src="/hero-bg.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-[#0d2c5c]/70 mix-blend-color" />
          <div className="absolute inset-0 bg-[#0b2146]/40 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0d2c5c]/95 via-[#0d2c5c]/45 to-[#0d2c5c]/95" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 md:px-10 text-center">
          <p className="font-sans text-[10px] sm:text-[11px] font-bold tracking-[0.22em] uppercase text-[#c69a3f] mb-3 sm:mb-4 flex items-center justify-center gap-3">
            <span className="w-6 sm:w-8 h-px bg-[#c69a3f]/60" />
            Cadru Legal & Conformitate · Vila Casa Esy
            <span className="w-6 sm:w-8 h-px bg-[#c69a3f]/60" />
          </p>

          <h1 className="font-['Cormorant_Garamond',serif] text-[clamp(2.4rem,5vw,4.6rem)] font-normal text-white leading-[1.06] tracking-[-0.015em] mb-4 sm:mb-6 [text-shadow:0_4px_30px_rgba(0,0,0,0.35)]">
            {title}
          </h1>

          <span
            className="my-3 hidden sm:flex items-center justify-center gap-3"
            aria-hidden="true"
          >
            <span className="h-px w-14 bg-[#c69a3f]/50" />
            <span className="h-1.5 w-1.5 rotate-45 bg-[#c69a3f]" />
            <span className="h-px w-14 bg-[#c69a3f]/50" />
          </span>

          {subtitle && (
            <p className="max-w-[660px] mx-auto text-[14px] sm:text-[16.5px] text-white/90 leading-[1.65] sm:leading-[1.85] font-light">
              {subtitle}
            </p>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-20 pointer-events-none translate-y-[1px]">
          <svg
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="relative block w-full h-[50px] md:h-[80px]"
          >
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118,130.43,121.22,201.2,112.5,242.47,107.45,283.47,84.14,321.39,56.44Z"
              className="fill-white"
            />
          </svg>
        </div>
      </section>

      {/* ── CONȚINUT PRINCIPAL ÎN TEMATICA SITE-ULUI ── */}
      <section className="relative py-14 md:py-20 px-5 md:px-10 z-10 bg-white">
        <div className="max-w-4xl mx-auto">
          {/* Bară de comutare între cele 4 pagini legale + dată actualizare */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 mb-8 border-b border-[#0d2c5c]/12">
            <div className="flex flex-wrap items-center gap-2.5">
              {LEGAL_NAV.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full border text-[11.5px] font-bold uppercase tracking-[0.15em] no-underline transition-all ${
                      isActive
                        ? "bg-[#0d2c5c] text-white border-[#0d2c5c] shadow-sm"
                        : "bg-white border-[#e2e8f0] text-[#334155] hover:border-[#0d2c5c] hover:text-[#0d2c5c]"
                    }`}
                  >
                    <Icon
                      size={14}
                      className={isActive ? "text-[#e6b85c]" : "text-[#0d2c5c]"}
                    />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {lastUpdated && (
              <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748b] shrink-0">
                <ShieldCheck size={15} className="text-[#0d2c5c]" />
                <span>Actualizat: {lastUpdated}</span>
              </div>
            )}
          </div>

          {/* Secțiunile documentului — deschise, fără cutii gri */}
          <div className="divide-y divide-[#0d2c5c]/10">{children}</div>

          {/* Banner de asistență DPO în stilul AboutSection.tsx */}
          <div className="relative mt-16 overflow-hidden rounded-[30px_80px_30px_80px] bg-[#0d2c5c] px-7 py-10 sm:px-12 sm:py-12 text-center shadow-[0_25px_60px_-20px_rgba(13,44,92,0.35)]">
            <div className="relative z-10">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-[#c69a3f]">
                Asistență Juridică & DPO · Vila Casa Esy
              </p>
              <h3 className="mt-2 font-['Cormorant_Garamond',serif] text-[clamp(1.8rem,3.5vw,2.6rem)] font-normal text-white leading-tight">
                Ai întrebări privind <em className="italic text-[#c69a3f]">drepturile tale legale</em>?
              </h3>
              <p className="mx-auto mt-3 max-w-[520px] text-[14.5px] leading-relaxed text-white/80 font-light">
                Responsabilul nostru cu Protecția Datelor (DPO) și recepția Vilei Casa Esy îți stau la dispoziție pentru orice lămurire.
              </p>
              <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3.5">
                <a
                  href="mailto:privacy@casaesy.ro"
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-full bg-[#c69a3f] hover:bg-white text-[#0d2c5c] px-7 py-3.5 text-[11.5px] font-bold uppercase tracking-[0.18em] no-underline transition-colors"
                >
                  <Mail size={15} /> privacy@casaesy.ro
                </a>
                <a
                  href="tel:+40721234567"
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-full border border-white/25 hover:border-[#c69a3f] text-white hover:text-[#c69a3f] px-7 py-3.5 text-[11.5px] font-bold uppercase tracking-[0.18em] no-underline transition-colors"
                >
                  <Phone size={15} /> +40 721 234 567
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
