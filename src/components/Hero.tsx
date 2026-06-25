import { ChevronDown } from "lucide-react";

export default function Hero() {
  return (
    <section className="hero-home">
      {/* Overlay-ul cinematic - protejează textul, dar lasă poza să respire */}
      <div className="hero-overlay"></div>

      <div className="hero-content">
        <p className="eyebrow">
          <span className="eyebrow-line"></span>
          BUN VENIT LA
          <span className="eyebrow-line"></span>
        </p>

        <h1>
          Vila Casa <em>Esy</em>
        </h1>

        <p className="subtitle">
          Ospitalitate caldă, camere rafinate și o experiență de neuitat —
          pentru oaspeții care prețuiesc detaliile.
        </p>

        <div className="hero-actions">
          <a href="#camere" className="btn btn-primary">
            Rezervă acum
          </a>
          <a href="#descopera" className="btn btn-ghost">
            Descoperă <ChevronDown size={16} className="btn-icon" />
          </a>
        </div>
      </div>
    </section>
  );
}
