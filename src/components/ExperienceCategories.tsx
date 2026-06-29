const categories = [
  {
    title: "Plajă",
    img: "https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop",
    desc: "Nisip fin, ape cristaline",
  },
  {
    title: "Sporturi Nautice",
    img: "https://images.pexels.com/photos/2108845/pexels-photo-2108845.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop",
    desc: "Adrenalină pe valuri",
  },
  {
    title: "Spa & Relaxare",
    img: "https://images.pexels.com/photos/3757952/pexels-photo-3757952.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop",
    desc: "Liniște pentru corp și minte",
  },
  {
    title: "Gastronomie",
    img: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop",
    desc: "Savori locale și internaționale",
  },
  {
    title: "Apusuri de Soare",
    img: "https://images.pexels.com/photos/1386604/pexels-photo-1386604.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop",
    desc: "Momente magice la asfințit",
  },
];

export default function ExperienceCategories() {
  return (
    <section className="exp-categories" id="descopera">
      <div className="exp-categories-inner">
        <div className="section-header">
          <p className="section-eyebrow exp-eyebrow">DESCOPERĂ · MAMAIA</p>
          <h2 className="section-title exp-title">
            Trăiește <em>Vara</em> la Intensitate Maximă
          </h2>
          <p className="exp-subtitle">
            De la plaje cu nisip fin până la gastronomie rafinată — Casa Esy
            este punctul tău de plecare spre cele mai frumoase experiențe ale Mării Negre.
          </p>
        </div>

        <div className="exp-cards-track">
          {categories.map((cat, i) => (
            <div
              key={cat.title}
              className={`exp-card${i === 2 ? " exp-card--center" : ""}`}
            >
              <div className="exp-card-img-wrap">
                <img src={cat.img} alt={cat.title} loading="lazy" />
                <div className="exp-card-overlay" />
              </div>
              <div className="exp-card-label">
                <span className="exp-card-title">{cat.title}</span>
                <span className="exp-card-desc">{cat.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
