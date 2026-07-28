import { MapPin, Phone, Clock, Navigation } from "lucide-react";

export default function LocationContact() {
  return (
    <section id="contact" className="relative py-20 md:py-28 overflow-hidden">
      {/* 1. Divider de Sus (Valul Organic de Trecere de la Alb la Albastru) */}
      <div className="absolute top-0 left-0 right-0 w-full overflow-hidden leading-none z-10">
        <svg
          className="relative block w-full h-[40px] md:h-[60px]"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0 C150,90 350,-40 500,40 C650,120 900,20 1200,60 L1200,0 L0,0 Z"
            fill="#ffffff"
          />
        </svg>
      </div>

      {/* 2. Fundalul Albastru Inchis specific brandului (#0d2c5c) */}
      <div className="bg-[#0d2c5c] text-white pt-16 pb-20 px-5 md:px-10 relative isolate">
        <div className="max-w-[1280px] mx-auto">
          {/* Header Secțiune */}
          <div className="relative text-center mb-14 md:mb-16">
            <p className="font-sans text-[11px] font-bold tracking-[0.2em] uppercase text-[#c69a3f] mb-3">
              UNDE NE GĂSEȘTI · EFORIE NORD
            </p>
            <h2 className="font-['Cormorant_Garamond',serif] text-[clamp(2.5rem,5vw,3.8rem)] font-normal text-white leading-[1.15]">
              Liniștea Mării,{" "}
              <em className="italic text-[#c69a3f]">Aproape de Tine</em>
            </h2>
            <span
              className="block w-14 h-0.5 mx-auto mt-4 border-0"
              style={{
                background: "linear-gradient(90deg, #c69a3f, transparent)",
              }}
            />
          </div>

          {/* Grid Principal: Card Stânga + Hartă Dreapta */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10 items-stretch">
            {/* Card Stânga: Detalii Contact */}
            <div className="lg:col-span-5 bg-[#092248] border border-white/10 rounded-[28px] p-8 md:p-10 flex flex-col justify-between shadow-2xl relative overflow-hidden">
              <div>
                <span className="text-[#c69a3f] text-[11px] font-bold tracking-[0.25em] uppercase block mb-3">
                  CASA ESY
                </span>
                <h3 className="font-['Cormorant_Garamond',serif] text-2xl md:text-3xl font-normal leading-tight mb-8 text-white">
                  Refugiul tău la doar 150m de valuri
                </h3>

                {/* Listă Informații cu Iconițe Auriu */}
                <div className="space-y-6 text-sm text-white/80 font-light">
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-[#c69a3f]">
                      <MapPin size={16} />
                    </div>
                    <div>
                      <strong className="block text-white font-medium text-sm mb-0.5">
                        Adresă
                      </strong>
                      <p className="text-white/70 text-xs md:text-sm m-0 leading-relaxed">
                        Strada Tudor Vladimirescu nr. 22, Eforie Nord, Constanța
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-[#c69a3f]">
                      <Phone size={16} />
                    </div>
                    <div>
                      <strong className="block text-white font-medium text-sm mb-0.5">
                        Rezervări Telefonice
                      </strong>
                      <a
                        href="tel:+40700000000"
                        className="text-white/70 hover:text-[#c69a3f] transition-colors text-xs md:text-sm block m-0"
                      >
                        +40 (7xx) xxx xxx
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-[#c69a3f]">
                      <Clock size={16} />
                    </div>
                    <div>
                      <strong className="block text-white font-medium text-sm mb-0.5">
                        Check-in / Check-out
                      </strong>
                      <p className="text-white/70 text-xs md:text-sm m-0">
                        Check-in: de la 14:00 · Check-out: până la 11:00
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Butonul Auriu exact ca cel din Hero / Header */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <a
                  href="https://www.google.com/maps/search/casa+esy+eforie+nord"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full group inline-flex items-center justify-center gap-3 px-6 py-3.5 bg-[#c69a3f] hover:bg-[#b58b35] text-white text-xs font-bold tracking-[0.2em] uppercase rounded-full transition-all duration-300 shadow-md"
                >
                  <Navigation size={15} />
                  <span>Deschide în GPS</span>
                </a>
              </div>
            </div>

            {/* Hartă Dreapta cu Colțuri Rotunjite */}
            <div className="lg:col-span-7 relative min-h-[380px] lg:min-h-full rounded-[28px] overflow-hidden border border-white/10 shadow-2xl group">
              <iframe
                title="Locație Casa Esy Eforie Nord"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2864.847528343111!2d28.632115!3d44.062104!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40bae1f73b8dfdd9%3A0x62a8397a0641b61!2sCasa%20Esy!5e0!3m2!1sro!2sro!4v1700000000000!5m2!1sro!2sro"
                width="100%"
                height="100%"
                className="absolute inset-0 w-full h-full border-0 contrast-[1.05]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />

              {/* Badge Floating */}
              <div className="absolute top-5 left-5 z-10 bg-[#0d2c5c]/90 backdrop-blur-md px-4 py-2.5 rounded-full border border-white/20 flex items-center gap-2.5 pointer-events-none shadow-lg">
                <span className="w-2 h-2 rounded-full bg-[#c69a3f] animate-pulse" />
                <span className="text-[11px] font-bold text-white tracking-widest uppercase">
                  150m de Plajă
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Divider de Jos (Valul Organic de Trecere înapoi la Alb / Footer) */}
      <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-10 rotate-180">
        <svg
          className="relative block w-full h-[40px] md:h-[60px]"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0 C150,90 350,-40 500,40 C650,120 900,20 1200,60 L1200,0 L0,0 Z"
            fill="#ffffff"
          />
        </svg>
      </div>
    </section>
  );
}
