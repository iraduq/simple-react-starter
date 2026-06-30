import { Award, Users, Sunset, Save as Waves } from "lucide-react";

const stats = [
  { icon: Users, value: "2,400+", label: "Oaspeți fericiți" },
  { icon: Award, value: "12", label: "Ani de experiență" },
  { icon: Sunset, value: "98%", label: "Satisfacție" },
  { icon: Waves, value: "150m", label: "Distanța până la plajă" },
];

export default function AboutSection() {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center py-[60px] px-6 lg:py-[100px] lg:px-20 bg-[#f4f7fb]">
      <div className="relative flex gap-5">
        <div className="flex-1 rounded-[10px] overflow-hidden shadow-[0_10px_40px_rgba(13,44,92,0.14)]">
          <img
            src="https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg?auto=compress&cs=tinysrgb&w=700&h=900&fit=crop"
            alt="Vila Casa Esy"
            className="w-full h-[320px] lg:h-[480px] object-cover block"
          />
        </div>
        <div className="hidden lg:block w-[200px] shrink-0 rounded-[10px] overflow-hidden shadow-[0_10px_40px_rgba(13,44,92,0.14)] relative self-end">
          <img
            src="https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop"
            alt="Piscina vilei"
            className="w-full h-[280px] object-cover block"
          />
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-[#1e4d8c] text-white rounded-[10px] px-5 py-3.5 text-center shadow-[0_8px_24px_rgba(13,44,92,0.3)] whitespace-nowrap">
            <span className="block font-['Cormorant_Garamond',serif] text-4xl font-semibold leading-none text-[#c69a3f]">
              12
            </span>
            <span className="text-[11px] tracking-[0.1em] uppercase opacity-85 leading-snug">
              ani de
              <br />
              excelență
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col">
        <p className="font-sans text-[11px] font-bold tracking-[0.18em] uppercase text-[#c69a3f] mb-2.5 text-left">
          Povestea noastră
        </p>
        <h2 className="font-['Cormorant_Garamond',serif] text-[clamp(2rem,4vw,3rem)] font-normal text-[#1a1a1a] mb-7 leading-[1.15] text-left">
          Ospitalitate cu suflet,
          <br />
          <em className="italic text-[#1e4d8c]">la malul mării</em>
        </h2>
        <p className="text-[#3c4043] leading-[1.8] text-[15px] mb-4">
          Vila Casa Esy s-a născut dintr-o dorință simplă: să creăm un loc unde
          oaspeții să se simtă acasă, dar cu lux și rafinament. Situată la doar
          150 de metri de plajă, vila noastră oferă o evadare perfectă din
          agitația cotidiană.
        </p>
        <p className="text-[#3c4043] leading-[1.8] text-[15px] mb-4">
          Fiecare cameră este decorată cu atenție la detalii, iar echipa noastră
          este mereu disponibilă pentru a transforma sejurul tău într-o amintire
          de neprețuit.
        </p>

        <div className="grid grid-cols-2 gap-5 my-8">
          {stats.map(({ icon: Icon, value, label }) => (
            <div
              key={label}
              className="flex items-center gap-3.5 p-4 bg-white rounded-[10px] border border-[#e1e8f0]"
            >
              <div className="w-11 h-11 rounded-[10px] bg-[#e6efff] text-[#1e4d8c] flex items-center justify-center shrink-0">
                <Icon size={22} strokeWidth={1.5} />
              </div>
              <div>
                <strong className="block font-['Cormorant_Garamond',serif] text-[22px] font-semibold text-[#0d2c5c] leading-none">
                  {value}
                </strong>
                <span className="block text-[11.5px] text-[#8595aa] mt-0.5 uppercase tracking-[0.08em]">
                  {label}
                </span>
              </div>
            </div>
          ))}
        </div>

        <a
          href="#camere"
          className="inline-flex items-center gap-2 self-start px-9 py-3.5 bg-[#1e4d8c] text-white rounded text-[13px] font-semibold tracking-[0.1em] uppercase transition-all duration-200 hover:bg-[#0d2c5c] hover:-translate-y-0.5"
        >
          Descoperă camerele →
        </a>
      </div>
    </section>
  );
}
