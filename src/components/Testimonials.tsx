import { Star, Quote } from "lucide-react";

const reviews = [
  {
    id: 1,
    name: "Maria Ionescu",
    location: "București",
    rating: 5,
    text: "O experiență absolut minunată! Camera cu vedere la mare era impecabilă, iar personalul extrem de amabil. Cu siguranță vom reveni!",
    avatar:
      "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&facepad=2",
    date: "Iunie 2025",
  },
  {
    id: 2,
    name: "Andrei Popescu",
    location: "Cluj-Napoca",
    rating: 5,
    text: "Locație fantastică, la 5 minute de mers pe jos de plajă. Mâncarea de la restaurant a fost delicioasă. Recomand cu căldură!",
    avatar:
      "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&facepad=2",
    date: "Mai 2025",
  },
  {
    id: 3,
    name: "Elena Dumitrescu",
    location: "Timișoara",
    rating: 5,
    text: "Am petrecut luna de miere la Vila Casa Esy și a fost perfect. Suita a depășit toate așteptările. Vă mulțumim pentru totul!",
    avatar:
      "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&facepad=2",
    date: "Iulie 2025",
  },
];

export default function Testimonials() {
  return (
    <section className="py-[60px] px-5 md:py-[90px] md:px-10 bg-[#f4f7fb]">
      <div className="text-center mb-[60px]">
        <p className="font-sans text-[11px] font-bold tracking-[0.18em] uppercase text-[#c69a3f] mb-3.5">
          Ce spun oaspeții noștri
        </p>
        <h2 className="font-['Cormorant_Garamond',serif] text-[clamp(2rem,4vw,3rem)] font-normal text-[#1a1a1a] leading-[1.15]">
          Experiențe Reale
        </h2>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-7">
        {reviews.map((r) => (
          <article
            key={r.id}
            className="bg-white border border-[#e1e8f0] rounded-[10px] py-8 px-7 relative transition-all duration-[250ms] hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(13,44,92,0.14)]"
          >
            <div className="text-[#e6efff] mb-4">
              <Quote size={32} strokeWidth={1} />
            </div>
            <div className="flex gap-[3px] mb-4">
              {Array.from({ length: r.rating }).map((_, i) => (
                <Star key={i} size={14} fill="#d4a437" color="#d4a437" />
              ))}
            </div>
            <p className="text-[14.5px] leading-[1.75] text-[#3c4043] mb-6 italic">
              &ldquo;{r.text}&rdquo;
            </p>
            <div className="flex items-center gap-3.5 border-t border-[#e1e8f0] pt-5">
              <img
                src={r.avatar}
                alt={r.name}
                className="w-[46px] h-[46px] rounded-full object-cover border-2 border-[#e6efff]"
              />
              <div>
                <strong className="block text-sm text-[#1a1a1a]">{r.name}</strong>
                <span className="block text-xs text-[#8595aa] mt-0.5">
                  {r.location} · {r.date}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
