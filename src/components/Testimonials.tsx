import { Star, Quote } from "lucide-react";

const reviews = [
  {
    id: 1,
    name: "Maria Ionescu",
    location: "București",
    rating: 5,
    text: "O experiență absolut minunată! Camera cu vedere la mare era impecabilă, iar personalul extrem de amabil. Cu siguranță vom reveni!",
    avatar: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&facepad=2",
    date: "Iunie 2025",
  },
  {
    id: 2,
    name: "Andrei Popescu",
    location: "Cluj-Napoca",
    rating: 5,
    text: "Locație fantastică, la 5 minute de mers pe jos de plajă. Mâncarea de la restaurant a fost delicioasă. Recomand cu căldură!",
    avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&facepad=2",
    date: "Mai 2025",
  },
  {
    id: 3,
    name: "Elena Dumitrescu",
    location: "Timișoara",
    rating: 5,
    text: "Am petrecut luna de miere la Vila Casa Esy și a fost perfect. Suita a depășit toate așteptările. Vă mulțumim pentru totul!",
    avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&facepad=2",
    date: "Iulie 2025",
  },
];

export default function Testimonials() {
  return (
    <section className="testimonials">
      <div className="section-header">
        <p className="section-eyebrow">Ce spun oaspeții noștri</p>
        <h2 className="section-title">Experiențe Reale</h2>
      </div>

      <div className="testimonials-grid">
        {reviews.map((r) => (
          <article key={r.id} className="review-card">
            <div className="review-quote">
              <Quote size={32} strokeWidth={1} />
            </div>
            <div className="review-stars">
              {Array.from({ length: r.rating }).map((_, i) => (
                <Star key={i} size={14} fill="#d4a437" color="#d4a437" />
              ))}
            </div>
            <p className="review-text">"{r.text}"</p>
            <div className="review-author">
              <img src={r.avatar} alt={r.name} className="review-avatar" />
              <div>
                <strong className="review-name">{r.name}</strong>
                <span className="review-location">
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
