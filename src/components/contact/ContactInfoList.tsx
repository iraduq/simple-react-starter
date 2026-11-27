import { MapPin, Phone, Mail, Clock } from "lucide-react";

export const CONTACT_INFO = [
  {
    icon: MapPin,
    title: "Locație",
    lines: ["Str. Faleză Nord, Eforie Nord", "Constanța, România"],
  },
  {
    icon: Phone,
    title: "Telefon",
    lines: ["+40 7XX XXX XXX"],
  },
  {
    icon: Mail,
    title: "Email",
    lines: ["contact@casaesy.ro"],
  },
  {
    icon: Clock,
    title: "Recepție",
    lines: ["Non-stop, 24/7"],
  },
];

export default function ContactInfoList() {
  return (
    <div className="lg:col-span-2 flex flex-col gap-4 order-2 lg:order-1">
      <div className="mb-2">
        <p className="font-sans text-[11px] font-bold tracking-[0.22em] uppercase text-[#c69a3f] mb-2 flex items-center gap-3">
          <span className="h-px w-8 bg-gradient-to-r from-[#c69a3f] to-transparent" />
          Informații directe
        </p>
        <h2 className="font-['Cormorant_Garamond',serif] text-[2.2rem] font-normal leading-tight text-[#0d2c5c]">
          Suntem mereu <em className="italic text-[#c69a3f]">aproape</em>
        </h2>
      </div>

      {CONTACT_INFO.map(({ icon: Icon, title, lines }) => (
        <div
          key={title}
          className="group flex items-start gap-4 p-5 rounded-[22px] border border-[#e2e8f0] bg-white/95 backdrop-blur-sm shadow-[0_8px_24px_rgba(13,44,92,0.04)] transition-all duration-300 hover:border-[#c69a3f] hover:shadow-[0_14px_34px_rgba(13,44,92,0.09)] hover:-translate-y-0.5"
        >
          <div className="shrink-0 w-12 h-12 rounded-2xl bg-[#0d2c5c]/5 border border-[#c69a3f]/35 flex items-center justify-center text-[#c69a3f] group-hover:bg-[#0d2c5c] group-hover:text-[#e6b85c] group-hover:border-[#0d2c5c] transition-all duration-300">
            <Icon size={20} strokeWidth={1.75} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-['Cormorant_Garamond',serif] text-[1.45rem] text-[#0d2c5c] mb-1 font-semibold leading-snug">
              {title}
            </h3>
            <div className="space-y-0.5">
              {lines.map((l) => (
                <p key={l} className="text-[14px] text-[#475569] font-normal leading-relaxed">
                  {l}
                </p>
              ))}
            </div>
          </div>
        </div>
      ))}

      <div className="mt-1 p-5 rounded-[22px] bg-[#0d2c5c] text-white shadow-[0_14px_34px_rgba(13,44,92,0.16)] border border-[#c69a3f]/30">
        <p className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-[#e6b85c] mb-1.5">
          Răspuns rapid
        </p>
        <p className="text-[13.5px] text-white/90 leading-[1.75]">
          Îți răspundem de obicei în mai puțin de{" "}
          <span className="text-[#e6b85c] font-bold">24 de ore</span>. Pentru urgențe sau solicitări imediate, ne poți suna direct la recepție.
        </p>
      </div>
    </div>
  );
}
