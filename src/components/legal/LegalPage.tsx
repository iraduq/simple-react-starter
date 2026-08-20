import { Anchor, Scale, ShieldCheck, Cookie, FileText } from "lucide-react";
import { Link } from "@/lib/router-compat";

type LegalPageProps = {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  lastUpdated?: string;
};

const HERO_IMAGE =
  "https://images.pexels.com/photos/1320684/pexels-photo-1320684.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop";

export default function LegalPage({ title, subtitle, icon, children, lastUpdated }: LegalPageProps) {
  return (
    <div className="min-h-screen bg-white text-[#1a1a1a]">
      {/* HERO — acelasi tratament vizual ca pe pagina principala */}
      <section
        className="relative flex flex-col items-center justify-center min-h-[460px] md:min-h-[540px] pb-28 pt-32 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(13,44,92,0.4) 0%, rgba(13,44,92,0.85) 100%), url(${HERO_IMAGE})`,
        }}
      >
        <div
          className="absolute inset-0 z-[1]"
          style={{
            background:
              "radial-gradient(circle at center, rgba(13,44,92,0.65) 0%, rgba(13,44,92,0.3) 100%)",
          }}
        />

        <div className="relative z-[2] flex flex-col items-center text-center px-5 max-w-[820px]">
          <p className="flex items-center gap-[15px] text-[#c69a3f] font-sans text-xs font-semibold tracking-[3px] uppercase mb-5">
            <span className="inline-block w-10 h-px bg-[#c69a3f]/50" />
            <span className="inline-flex items-center gap-2">{icon} DOCUMENT LEGAL</span>
            <span className="inline-block w-10 h-px bg-[#c69a3f]/50" />
          </p>

          <h1 className="text-white font-['Cormorant_Garamond',serif] text-[clamp(2.4rem,5vw,4rem)] font-normal leading-[1.12] mb-5 [text-shadow:0_4px_20px_rgba(0,0,0,0.3)]">
            {title}
          </h1>

          <p className="max-w-[620px] mx-auto leading-[1.7] text-[1.05rem] font-light text-white/90 [text-shadow:0_2px_10px_rgba(0,0,0,0.2)]">
            {subtitle}
          </p>
        </div>

        {/* Val decorativ — identic cu restul site-ului */}
        <svg
          className="absolute -bottom-px left-0 w-full h-[80px] md:h-[120px] pointer-events-none z-[2] block"
          viewBox="0 0 1440 130"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            transform="translate(0, 130) scale(1, -1)"
            d="M0 0 L1440 0 L1440 70 C1260 100, 1080 55, 900 75 S540 110, 360 78 S120 50, 0 82 Z"
            fill="#c69a3f"
            opacity="0.35"
          />
          <path
            transform="translate(0, 130) scale(1, -1)"
            d="M0 0 L1440 0 L1440 55 C1260 90, 1080 40, 900 62 S540 100, 360 65 S120 35, 0 68 Z"
            fill="#0d2c5c"
            opacity="0.5"
          />
          <path
            transform="translate(0, 130) scale(1, -1)"
            d="M0 0 L1440 0 L1440 45 C1260 80, 1080 28, 900 52 S540 92, 360 55 S120 22, 0 58 Z"
            fill="#ffffff"
          />
        </svg>
      </section>

      {/* CONTENT */}
      <div className="max-w-[1000px] mx-auto px-6 lg:px-10 py-16 md:py-24">
        <div className="prose-none">{children}</div>

        {lastUpdated && (
          <div className="mt-14 pt-8 border-t border-[#e6ecf3] flex flex-col sm:flex-row sm:items-center gap-3 text-[13.5px] text-[#5a6b85]">
            <span className="inline-flex items-center gap-2 text-[#0d2c5c]">
              <Anchor size={16} className="text-[#c69a3f]" />
              <strong>Vila Casa Esy · Mamaia / Eforie Nord</strong>
            </span>
            <span className="hidden sm:inline text-[#c69a3f]">·</span>
            <span>
              Ultima actualizare: <strong className="text-[#0d2c5c]">{lastUpdated}</strong>
            </span>
          </div>
        )}
      </div>

      {/* CTA + navigare intre documente */}
      <section
        className="relative py-20 px-5 md:px-10 font-sans"
        style={{
          background: `linear-gradient(to right, rgba(13,44,92,0.92) 0%, rgba(13,44,92,0.98) 100%), url(${HERO_IMAGE})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <svg
          className="absolute -top-px left-0 w-full h-[80px] md:h-[120px] pointer-events-none z-[3] block"
          viewBox="0 0 1440 130"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0 0 L1440 0 L1440 70 C1260 100, 1080 55, 900 75 S540 110, 360 78 S120 50, 0 82 Z"
            fill="#c69a3f"
            opacity="0.35"
          />
          <path
            d="M0 0 L1440 0 L1440 55 C1260 90, 1080 40, 900 62 S540 100, 360 65 S120 35, 0 68 Z"
            fill="#0d2c5c"
            opacity="0.5"
          />
          <path
            d="M0 0 L1440 0 L1440 45 C1260 80, 1080 28, 900 52 S540 92, 360 55 S120 22, 0 58 Z"
            fill="#ffffff"
          />
        </svg>

        <div className="relative z-10 max-w-[1000px] mx-auto text-center pt-10">
          <p className="flex items-center justify-center gap-[15px] text-[#c69a3f] text-[11px] font-bold tracking-[0.2em] uppercase mb-4">
            <span className="inline-block w-8 h-px bg-[#c69a3f]/60" />
            AI ÎNTREBĂRI LEGALE?
            <span className="inline-block w-8 h-px bg-[#c69a3f]/60" />
          </p>
          <h2 className="font-['Cormorant_Garamond',serif] text-white text-[clamp(1.9rem,3.6vw,2.8rem)] font-normal leading-[1.15] mb-4">
            Îți răspundem în <em className="italic text-[#c69a3f]">24 de ore</em>
          </h2>
          <a
            href="mailto:privacy@casaesy.ro"
            className="inline-flex items-center justify-center px-8 py-3.5 bg-[#c69a3f] hover:bg-[#b3872f] text-white text-[14px] font-semibold tracking-wide rounded-full transition-colors shadow-[0_12px_30px_-12px_rgba(0,0,0,0.5)]"
          >
            privacy@casaesy.ro
          </a>

          <div className="mt-12 pt-8 border-t border-white/15 flex flex-wrap justify-center gap-6 md:gap-10">
            {[
              { to: "/termeni-si-conditii", label: "Termeni și condiții", icon: Scale },
              { to: "/politica-de-confidentialitate", label: "Confidențialitate", icon: ShieldCheck },
              { to: "/politica-de-cookie", label: "Cookie-uri", icon: Cookie },
              { to: "/gdpr", label: "GDPR", icon: FileText },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="group inline-flex items-center gap-2 text-[14px] font-medium text-white/85 hover:text-[#c69a3f] transition-colors"
              >
                <item.icon size={16} className="text-[#c69a3f] group-hover:scale-110 transition-transform" />
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export function LegalSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="mb-12 last:mb-0">
      <h2 className="flex items-center gap-3 text-xl md:text-[1.6rem] font-semibold text-[#0d2c5c] mb-5 font-['Cormorant_Garamond',serif]">
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-[#c69a3f]/15 to-[#c69a3f]/5 text-[#c69a3f] ring-1 ring-[#c69a3f]/20">
          {icon}
        </span>
        {title}
      </h2>
      <div className="text-[#3d4f6b] leading-[1.85] text-[15px] space-y-4">
        {children}
      </div>
    </section>
  );
}

export function LegalList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3.5 mt-4">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3.5">
          <span className="inline-flex items-center justify-center w-1.5 h-1.5 rounded-full bg-[#c69a3f] mt-2.5 shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
