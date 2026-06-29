const categories = [
  {
    title: "Plajă",
    eyebrow: "01 · Litoral",
    img: "https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop",
    desc: "Oază de liniște sub soarele blând.",
  },
  {
    title: "Sporturi Nautice",
    eyebrow: "02 · Adrenalină",
    img: "https://images.pexels.com/photos/2108845/pexels-photo-2108845.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop",
    desc: "Libertate pe valuri",
  },
  {
    title: "Spa & Relaxare",
    eyebrow: "03 · Echilibru",
    img: "https://images.pexels.com/photos/3757952/pexels-photo-3757952.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop",
    desc: "Echilibru pentru corp și minte.",
  },
  {
    title: "Gastronomie",
    eyebrow: "04 · Gust",
    img: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop",
    desc: "Arome locale reinterpretate prin tehnici fine-dining.",
  },
  {
    title: "Apusuri de Soare",
    eyebrow: "05 · Spectacol",
    img: "https://images.pexels.com/photos/1386604/pexels-photo-1386604.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop",
    desc: "Spectacol magic la asfințit",
  },
];

export default function ExperienceCategories() {
  const [plaja, nautice, spa, gastro, apus] = categories;
  return (
    <section className="exp-categories" id="descopera">
      <div className="exp-categories-inner">
        <div className="section-header">
          <p className="section-eyebrow exp-eyebrow">DESCOPERĂ · MAMAIA</p>
          <h2 className="section-title exp-title">
            Experiențe care te <em>Inspiră</em>
          </h2>
          <hr className="exp-rule" />
          <p className="exp-subtitle">
            De la plaje cu nisip fin la gastronomie rafinată — Casa Esy
            este locul de unde vacanța ta ideală la Marea Neagră începe.
          </p>
        </div>

        <div className="exp-mosaic">
          {/* 1 · Plajă — Grand Arch */}
          <article className="exp-tile exp-tile--arch">
            <img src={plaja.img} alt={plaja.title} loading="lazy" />
            <div className="exp-tile-grad exp-tile-grad--bottom" />
            <div className="exp-tile-caption exp-tile-caption--bottom">
              <span className="exp-tile-num">01</span>
              <h3>{plaja.title}</h3>
              <p>{plaja.desc}</p>
            </div>
          </article>

          {/* 2 · Sporturi Nautice — Soft rect */}
          <article className="exp-tile exp-tile--rect">
            <img src={nautice.img} alt={nautice.title} loading="lazy" />
            <div className="exp-tile-grad exp-tile-grad--solid" />
            <div className="exp-tile-caption exp-tile-caption--center">
              <h3>{nautice.title}</h3>
              <span className="exp-tile-rule" />
              <p className="exp-tile-meta">Libertate pe valuri</p>
            </div>
          </article>

          {/* 3 · Spa — Circle */}
          <article className="exp-tile exp-tile--circle">
            <img src={spa.img} alt={spa.title} loading="lazy" />
            <div className="exp-tile-grad exp-tile-grad--soft" />
            <div className="exp-tile-medallion">
              <h3>{spa.title}</h3>
              <span>Echilibru</span>
            </div>
          </article>

          {/* 4 · Gastronomie — Wave */}
          <article className="exp-tile exp-tile--wave">
            <img src={gastro.img} alt={gastro.title} loading="lazy" />
            <div className="exp-tile-grad exp-tile-grad--bottom" />
            <div className="exp-tile-caption exp-tile-caption--bottom">
              <span className="exp-tile-num">04</span>
              <h3>{gastro.title}</h3>
              <p>{gastro.desc}</p>
            </div>
          </article>

          {/* 5 · Apusuri — Inverted arch */}
          <article className="exp-tile exp-tile--arch-down">
            <img src={apus.img} alt={apus.title} loading="lazy" />
            <div className="exp-tile-grad exp-tile-grad--top" />
            <div className="exp-tile-caption exp-tile-caption--top">
              <h3>{apus.title}</h3>
              <span className="exp-tile-meta">Spectacol magic</span>
            </div>
          </article>
        </div>

        <div className="exp-footer-cta">
          <a href="#camere" className="exp-cta-link">
            <span>Vezi toate experiențele</span>
            <span className="exp-cta-arrow" aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
