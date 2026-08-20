import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Mail, Phone, ShieldCheck } from "lucide-react";

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
    <section className="group relative mb-9 border-b border-dashed border-[#e6ecf4] pb-9 last:mb-0 last:border-0 last:pb-0">
      <div className="flex items-start gap-3.5 sm:gap-4">
        {icon && (
          <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[#ecdcb8] bg-gradient-to-br from-[#fdf7ea] to-[#f6ecd6] text-[#b8862a] shadow-[0_6px_16px_-10px_rgba(198,154,63,0.8)] transition-transform duration-300 group-hover:-translate-y-0.5 sm:h-11 sm:w-11">
            {icon}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="font-['Cormorant_Garamond',serif] text-[clamp(1.2rem,3.4vw,1.6rem)] font-semibold leading-snug text-[#0d2c5c]">
            {title}
          </h2>
          <span className="mt-2.5 flex items-center gap-2">
            <span className="h-px w-8 bg-gradient-to-r from-[#c69a3f] to-transparent" />
            <span className="h-1 w-1 rotate-45 bg-[#c69a3f]/70" />
          </span>
          <div className="mt-3.5 space-y-3 text-[14.5px] leading-[1.85] text-[#3d4f6b] [&_strong]:text-[#0d2c5c]">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

export function LegalList({ items }: { items: string[] }) {
  return (
    <ul className="m-0 list-none space-y-2 p-0">
      {items.map((it) => (
        <li
          key={it}
          className="flex gap-3 rounded-lg border border-transparent bg-[#f8fafc] px-3.5 py-2.5 text-[14.5px] leading-[1.8] text-[#3d4f6b] transition-colors hover:border-[#ecdcb8] hover:bg-[#fdf9f0]"
        >
          <span className="mt-[10px] h-1.5 w-1.5 shrink-0 rotate-45 bg-[#c69a3f]" />
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
        <div className="absolute inset-0 bg-[radial-gradient(120%_100%_at_50%_0%,rgba(13,44,92,0.72)_0%,rgba(9,24,52,0.94)_100%)]" />

        <div className="relative mx-auto max-w-[1000px] px-5 pb-24 pt-14 text-center sm:px-8 sm:pb-32 sm:pt-20">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white/70 transition-colors hover:text-[#c69a3f]"
          >
            <ChevronLeft size={14} /> Înapoi acasă
          </Link>

          <p className="mt-6 flex items-center justify-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.22em] text-[#c69a3f]">
            {icon} Informații legale
          </p>

          <h1 className="mt-3 font-['Cormorant_Garamond',serif] text-[clamp(2rem,7vw,3.5rem)] font-semibold leading-[1.05] text-white">
            {title}
          </h1>

          <span className="mx-auto mt-5 flex items-center justify-center gap-2.5">
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-[#c69a3f]/70 sm:w-20" />
            <span className="h-1.5 w-1.5 rotate-45 bg-[#c69a3f]" />
            <span className="h-px w-10 bg-gradient-to-l from-transparent to-[#c69a3f]/70 sm:w-20" />
          </span>

          {subtitle && (
            <p className="mx-auto mt-5 max-w-[620px] rounded-2xl border border-white/10 bg-white/[0.07] px-5 py-4 text-[14px] italic leading-relaxed text-white/85 backdrop-blur-md sm:text-[15px]">
              {subtitle}
            </p>
          )}
        </div>

        {/* wave divider */}
        <svg
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          className="relative block h-[46px] w-full sm:h-[70px]"
          aria-hidden="true"
        >
          <path
            d="M0 40c120 26 240 34 360 24s240-38 360-40 240 22 360 32 240 2 360-16v40H0z"
            fill="#f6f8fb"
          />
        </svg>
      </div>

      {/* CONTENT */}
      <div className="mx-auto max-w-[900px] px-4 pb-16 sm:px-6 lg:pb-24">
        <article className="relative -mt-10 overflow-hidden rounded-[22px] border border-[#e1e8f0] bg-white p-5 shadow-[0_30px_70px_-40px_rgba(13,44,92,0.45)] sm:p-9 lg:p-12">
          <span className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#c69a3f]/0 via-[#c69a3f] to-[#c69a3f]/0" />

          {lastUpdated && (
            <div className="mb-8 flex flex-wrap items-center gap-2.5 border-b border-[#eef2f7] pb-6">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#ecdcb8] bg-[#fdf9f0] px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#b8862a]">
                <ShieldCheck size={13} /> Document oficial
              </span>
              <span className="text-[11.5px] font-semibold uppercase tracking-[0.16em] text-[#8595aa]">
                Ultima actualizare: {lastUpdated}
              </span>
            </div>
          )}
          {children}
        </article>

        <div className="relative mt-8 overflow-hidden rounded-[22px] border border-[#0d2c5c]/20 bg-[#0d2c5c] p-7 text-center sm:p-9">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-[0.18]"
            style={{ backgroundImage: `url(${SEA_IMG})` }}
          />
          <div className="relative">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-[#c69a3f]">
              Suport · Casa Esy
            </p>
            <h3 className="mt-2 font-['Cormorant_Garamond',serif] text-[clamp(1.4rem,4vw,1.9rem)] font-semibold text-white">
              Ai întrebări despre acest document?
            </h3>
            <span className="mx-auto mt-4 flex items-center justify-center gap-2.5">
              <span className="h-px w-10 bg-gradient-to-r from-transparent to-[#c69a3f]/70" />
              <span className="h-1.5 w-1.5 rotate-45 bg-[#c69a3f]" />
              <span className="h-px w-10 bg-gradient-to-l from-transparent to-[#c69a3f]/70" />
            </span>
            <p className="mx-auto mt-4 max-w-[440px] text-[14px] leading-relaxed text-white/75">
              Echipa noastră îți răspunde în cel mai scurt timp, în fiecare zi a săptămânii.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="mailto:privacy@casaesy.ro"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#d8ae55] to-[#b8862a] px-5 py-3 text-[11.5px] font-bold uppercase tracking-[0.16em] text-[#0d2c5c] shadow-[0_14px_30px_-16px_rgba(198,154,63,0.9)] transition-transform hover:-translate-y-0.5 sm:w-auto"
              >
                <Mail size={15} /> privacy@casaesy.ro
              </a>
              <a
                href="tel:+40721234567"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/25 px-5 py-3 text-[11.5px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:border-[#c69a3f] hover:text-[#c69a3f] sm:w-auto"
              >
                <Phone size={15} /> +40 721 234 567
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
