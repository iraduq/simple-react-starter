import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Mail, Phone } from "lucide-react";

const SEA_IMG =
  "https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=1920";

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
    <section className="mb-10 last:mb-0">
      <h2 className="flex items-start gap-3 text-[clamp(1.15rem,3.4vw,1.5rem)] leading-snug text-[#0d2c5c] font-['Cormorant_Garamond',serif] font-semibold">
        {icon && <span className="mt-1 shrink-0 text-[#c69a3f]">{icon}</span>}
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-[14.5px] leading-[1.85] text-[#3d4f6b]">
        {children}
      </div>
    </section>
  );
}

export function LegalList({ items }: { items: string[] }) {
  return (
    <ul className="m-0 list-none space-y-2.5 p-0">
      {items.map((it) => (
        <li key={it} className="flex gap-3 text-[14.5px] leading-[1.8] text-[#3d4f6b]">
          <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rotate-45 bg-[#c69a3f]" />
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}

export default function LegalPage({
  title,
  subtitle,
  icon,
  lastUpdated,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  lastUpdated?: string;
  children: ReactNode;
}) {
  return (
    <div className="bg-[#f6f8fb]">
      {/* HERO — same coastal treatment as the homepage */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${SEA_IMG})` }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(120%_100%_at_50%_0%,rgba(13,44,92,0.72)_0%,rgba(9,24,52,0.92)_100%)]" />

        <div className="relative mx-auto max-w-[1000px] px-5 pb-24 pt-14 text-center sm:px-8 sm:pb-28 sm:pt-20">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white/70 transition-colors hover:text-[#c69a3f]"
          >
            <ChevronLeft size={14} /> Înapoi acasă
          </Link>

          <p className="mt-6 flex items-center justify-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.22em] text-[#c69a3f]">
            {icon} Informații legale
          </p>

          <h1 className="mt-3 font-['Cormorant_Garamond',serif] text-[clamp(2rem,7vw,3.4rem)] font-semibold leading-[1.05] text-white">
            {title}
          </h1>

          <span className="mx-auto mt-5 flex items-center justify-center gap-2.5">
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-[#c69a3f]/70 sm:w-16" />
            <span className="h-1.5 w-1.5 rotate-45 bg-[#c69a3f]" />
            <span className="h-px w-10 bg-gradient-to-l from-transparent to-[#c69a3f]/70 sm:w-16" />
          </span>

          {subtitle && (
            <p className="mx-auto mt-5 max-w-[620px] rounded-xl bg-white/[0.07] px-4 py-3 text-[14px] leading-relaxed text-white/85 backdrop-blur-sm sm:text-[15px]">
              {subtitle}
            </p>
          )}
        </div>

        {/* wave divider */}
        <svg
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          className="relative block h-[46px] w-full sm:h-[64px]"
          aria-hidden="true"
        >
          <path
            d="M0 40c120 26 240 34 360 24s240-38 360-40 240 22 360 32 240 2 360-16v40H0z"
            fill="#f6f8fb"
          />
        </svg>
      </div>

      {/* CONTENT */}
      <div className="mx-auto max-w-[880px] px-4 pb-16 sm:px-6 lg:pb-24">
        <article className="-mt-6 rounded-2xl border border-[#e1e8f0] border-t-2 border-t-[#c69a3f] bg-white p-5 shadow-[0_18px_50px_-28px_rgba(13,44,92,0.35)] sm:p-9 lg:p-12">
          {lastUpdated && (
            <p className="mb-8 text-[11.5px] font-semibold uppercase tracking-[0.16em] text-[#8595aa]">
              Ultima actualizare: {lastUpdated}
            </p>
          )}
          {children}
        </article>

        <div className="mt-8 rounded-2xl border border-[#e1e8f0] bg-white p-6 text-center sm:p-8">
          <h3 className="font-['Cormorant_Garamond',serif] text-[22px] font-semibold text-[#0d2c5c]">
            Ai întrebări legale?
          </h3>
          <p className="mt-2 text-[14px] text-[#6b7c99]">
            Echipa Casa Esy îți răspunde în cel mai scurt timp.
          </p>
          <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="mailto:privacy@casaesy.ro"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0d2c5c] px-5 py-3 text-[11.5px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-[#c69a3f] sm:w-auto"
            >
              <Mail size={15} /> privacy@casaesy.ro
            </a>
            <a
              href="tel:+40721234567"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#e1e8f0] px-5 py-3 text-[11.5px] font-bold uppercase tracking-[0.16em] text-[#0d2c5c] transition-colors hover:border-[#c69a3f] sm:w-auto"
            >
              <Phone size={15} /> +40 721 234 567
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
