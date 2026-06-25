const categories = [
  {
    title: "Plaje",
    img: "https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop",
    desc: "Nisip fin și ape cristaline",
  },
  {
    title: "Sporturi nautice",
    img: "https://images.pexels.com/photos/2108845/pexels-photo-2108845.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop",
    desc: "Adrenalină pe valuri",
  },
  {
    title: "Relaxare & Spa",
    img: "https://images.pexels.com/photos/3757952/pexels-photo-3757952.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop",
    desc: "Liniște totală pentru minte și corp",
  },
  {
    title: "Gastronomie",
    img: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop",
    desc: "Savori locale și internaționale",
  },
  {
    title: "Apusuri de soare",
    img: "https://images.pexels.com/photos/1386604/pexels-photo-1386604.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop",
    desc: "Momente magice la asfințit",
  },
];

export default function ExperienceCategories() {
  return (
    <section className="exp-categories" id="descopera">
      <div className="section-header">
        <p className="section-eyebrow">Locul perfect pentru tine</p>
        <h2 className="section-title">Categorii de Experiențe</h2>
      </div>

      <div className="exp-cards-track">
        {categories.map((cat, i) => (
          <div
            key={cat.title}
            className={`exp-card ${i === 2 ? "exp-card--center" : ""}`}
          >
            <div className="exp-card-img-wrap">
              <img src={cat.img} alt={cat.title} loading="lazy" />
              <div className="exp-card-overlay" />
            </div>
            <div className="exp-card-label">
              <span className="exp-card-title">{cat.title}</span>
              <a href="#camere" className="exp-card-link">
                Descoperă →
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="exp-dots">
        {categories.map((_, i) => (
          <span key={i} className={`dot ${i === 0 ? "dot--active" : ""}`} />
        ))}
      </div>
    </section>
  );
}
