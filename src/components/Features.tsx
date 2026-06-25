import { Save as Waves, UtensilsCrossed, PartyPopper, Wifi, Car, Dumbbell } from "lucide-react";

const items = [
  {
    icon: Waves,
    title: "Piscină & Plajă",
    desc: "Piscină exterioară cu vedere la mare și acces direct la plajă privată.",
  },
  {
    icon: UtensilsCrossed,
    title: "Restaurant Gourmet",
    desc: "Bucătărie internațională și preparate locale gătite cu ingrediente proaspete.",
  },
  {
    icon: PartyPopper,
    title: "Evenimente",
    desc: "Săli moderne pentru conferințe, nunți și evenimente private memorabile.",
  },
  {
    icon: Wifi,
    title: "WiFi Premium",
    desc: "Conexiune de mare viteză în toate camerele și spațiile comune.",
  },
  {
    icon: Car,
    title: "Parcare Gratuită",
    desc: "Parcare supravegheată video, inclusă în prețul sejurului.",
  },
  {
    icon: Dumbbell,
    title: "Fitness & Wellness",
    desc: "Sală de fitness echipată modern și servicii de masaj la cerere.",
  },
];

export default function Features() {
  return (
    <section id="descopera-facilitati" className="features">
      <div className="section-header" style={{ marginBottom: "48px" }}>
        <p className="section-eyebrow">Tot ce ai nevoie</p>
        <h2 className="section-title">Facilitățile Noastre</h2>
      </div>
      <div className="features-grid">
        {items.map(({ icon: Icon, title, desc }) => (
          <article key={title} className="feature-card">
            <div className="feature-icon">
              <Icon size={26} strokeWidth={1.5} />
            </div>
            <h3>{title}</h3>
            <p>{desc}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
