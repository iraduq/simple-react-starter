import { Award, Users, Sunset, Save as Waves } from "lucide-react";

const stats = [
  { icon: Users, value: "2,400+", label: "Oaspeți fericiți" },
  { icon: Award, value: "12", label: "Ani de experiență" },
  { icon: Sunset, value: "98%", label: "Satisfacție" },
  { icon: Waves, value: "150m", label: "Distanța până la plajă" },
];

export default function AboutSection() {
  return (
    <section className="about-section">
      <div className="about-img-col">
        <div className="about-img-main">
          <img
            src="https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg?auto=compress&cs=tinysrgb&w=700&h=900&fit=crop"
            alt="Vila Casa Esy"
          />
        </div>
        <div className="about-img-secondary">
          <img
            src="https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop"
            alt="Piscina vilei"
          />
          <div className="about-badge-floating">
            <span className="badge-years">12</span>
            <span className="badge-text">ani de<br />excelență</span>
          </div>
        </div>
      </div>

      <div className="about-text-col">
        <p className="section-eyebrow">Povestea noastră</p>
        <h2 className="section-title">
          Ospitalitate cu suflet,<br />
          <em>la malul mării</em>
        </h2>
        <p className="about-desc">
          Vila Casa Esy s-a născut dintr-o dorință simplă: să creăm un loc unde
          oaspeții să se simtă acasă, dar cu lux și rafinament. Situată la doar
          150 de metri de plajă, vila noastră oferă o evadare perfectă din
          agitația cotidiană.
        </p>
        <p className="about-desc">
          Fiecare cameră este decorată cu atenție la detalii, iar echipa noastră
          este mereu disponibilă pentru a transforma sejurul tău într-o amintire
          de neprețuit.
        </p>

        <div className="about-stats">
          {stats.map(({ icon: Icon, value, label }) => (
            <div key={label} className="stat-item">
              <div className="stat-icon">
                <Icon size={22} strokeWidth={1.5} />
              </div>
              <div>
                <strong className="stat-value">{value}</strong>
                <span className="stat-label">{label}</span>
              </div>
            </div>
          ))}
        </div>

        <a href="#camere" className="btn btn-about">
          Descoperă camerele →
        </a>
      </div>
    </section>
  );
}
