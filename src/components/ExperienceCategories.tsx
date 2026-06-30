const tiles = {
  plaja: {
    title: "Plajă",
    label: "Infinit Albastru",
    img: "https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=1200&h=1600&fit=crop",
  },
  nautice: {
    title: "Sporturi Nautice",
    label: "Adrenalină pe valuri",
    img: "https://images.pexels.com/photos/2108845/pexels-photo-2108845.jpeg?auto=compress&cs=tinysrgb&w=900&h=700&fit=crop",
  },
  gastro: {
    title: "Gastronomie",
    label: "Arome ale Mării",
    img: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=900&h=900&fit=crop",
  },
  spa: {
    title: "Spa & Infinity",
    label: "Echilibru",
    img: "https://images.pexels.com/photos/3757952/pexels-photo-3757952.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop",
  },
  apus: {
    title: "Apusuri",
    label: "Spectacol Magic",
    img: "https://images.pexels.com/photos/1386604/pexels-photo-1386604.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop",
  },
};

export default function ExperienceCategories() {
  return (
    <section className="exp-categories" id="descopera">
      {/* Sea-themed background ornaments */}
      <svg
        className="exp-bg-wave exp-bg-wave--top"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          fill="currentColor"
          d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,144C672,139,768,181,864,181.3C960,181,1056,139,1152,122.7C1248,107,1344,117,1392,122.7L1440,128L1440,0L0,0Z"
        />
      </svg>
      <svg
        className="exp-bg-blob"
        viewBox="0 0 200 200"
        aria-hidden="true"
      >
        <path
          fill="currentColor"
          d="M44.7,-76.4C58.1,-69.2,69.5,-57.4,77.3,-43.6C85.1,-29.8,89.2,-14.9,88.2,-0.6C87.2,13.7,81,27.4,72.4,39.8C63.8,52.2,52.8,63.3,39.8,70.9C26.8,78.5,13.4,82.6,-0.5,83.4C-14.4,84.2,-28.8,81.7,-42.1,74.5C-55.4,67.3,-67.6,55.4,-75.4,41.4C-83.2,27.4,-86.6,11.3,-85.4,-4.1C-84.2,-19.5,-78.4,-34.2,-68.8,-46C-59.2,-57.8,-45.8,-66.7,-32.1,-73.7C-18.4,-80.7,-4.4,-85.8,10.2,-83.4C24.8,-81,31.3,-83.6,44.7,-76.4Z"
          transform="translate(100 100)"
        />
      </svg>

      <div className="exp-categories-inner">
        <div className="exp-header">
          {/* Sun ray emblem */}
          <svg
            className="exp-sun"
            viewBox="0 0 64 64"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <circle cx="32" cy="32" r="10" />
            <path d="M32 4v8M32 52v8M4 32h8M52 32h8M12 12l5.7 5.7M46.3 46.3 52 52M52 12l-5.7 5.7M17.7 46.3 12 52" />
          </svg>
          <p className="exp-kicker">Experiențe care te Inspiră</p>
          <h2 className="exp-headline">
            Trăiește Vara la
            <br />
            <em>Intensitate Maximă</em>
          </h2>
        </div>

        <div className="exp-grid">
          {/* Plajă — large anchor */}
          <article className="exp-cell exp-cell--plaja">
            <div className="exp-cell-clip">
              <img src={tiles.plaja.img} alt={tiles.plaja.title} loading="lazy" />
              <div className="exp-cell-veil" />
            </div>
            <div className="exp-cell-caption">
              <span className="exp-cell-label">{tiles.plaja.label}</span>
              <h3>{tiles.plaja.title}</h3>
              <span className="exp-cell-rule" />
            </div>
          </article>

          {/* Sporturi Nautice — top right */}
          <article className="exp-cell exp-cell--nautice">
            <div className="exp-cell-clip">
              <img src={tiles.nautice.img} alt={tiles.nautice.title} loading="lazy" />
              <div className="exp-cell-veil" />
            </div>
            <div className="exp-cell-caption">
              <span className="exp-cell-label">{tiles.nautice.label}</span>
              <h3>{tiles.nautice.title}</h3>
            </div>
          </article>

          {/* Gastronomie — bottom left */}
          <article className="exp-cell exp-cell--gastro">
            <div className="exp-cell-clip">
              <img src={tiles.gastro.img} alt={tiles.gastro.title} loading="lazy" />
              <div className="exp-cell-veil" />
            </div>
            <div className="exp-cell-caption">
              <span className="exp-cell-label">{tiles.gastro.label}</span>
              <h3>{tiles.gastro.title}</h3>
            </div>
          </article>

          {/* Spa — middle */}
          <article className="exp-cell exp-cell--spa">
            <div className="exp-cell-clip">
              <img src={tiles.spa.img} alt={tiles.spa.title} loading="lazy" />
              <div className="exp-cell-veil" />
            </div>
            <div className="exp-cell-caption">
              <span className="exp-cell-label">{tiles.spa.label}</span>
              <h3>{tiles.spa.title}</h3>
            </div>
          </article>

          {/* Apusuri — bottom right with compass */}
          <article className="exp-cell exp-cell--apus">
            <div className="exp-cell-clip">
              <img src={tiles.apus.img} alt={tiles.apus.title} loading="lazy" />
              <div className="exp-cell-veil" />
            </div>
            <svg
              className="exp-compass"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="9" strokeWidth="0.5" />
              <path
                d="M12 3v18M3 12h18M12 7l2 5h-4l2-5zM12 17l-2-5h4l-2 5z"
                strokeWidth="1"
              />
            </svg>
            <div className="exp-cell-caption">
              <span className="exp-cell-label">{tiles.apus.label}</span>
              <h3>{tiles.apus.title}</h3>
            </div>
          </article>
        </div>

        <div className="exp-footer">
          <svg className="exp-wavelines" viewBox="0 0 100 20" fill="none" aria-hidden="true">
            <path d="M0 10 Q 12.5 0, 25 10 T 50 10 T 75 10 T 100 10" stroke="currentColor" strokeWidth="1" />
            <path d="M0 15 Q 12.5 5, 25 15 T 50 15 T 75 15 T 100 15" stroke="currentColor" strokeWidth="0.5" />
          </svg>
          <span className="exp-footer-text">Descoperă ritmul mării</span>
          <svg className="exp-wavelines" viewBox="0 0 100 20" fill="none" aria-hidden="true">
            <path d="M0 10 Q 12.5 0, 25 10 T 50 10 T 75 10 T 100 10" stroke="currentColor" strokeWidth="1" />
            <path d="M0 15 Q 12.5 5, 25 15 T 50 15 T 75 15 T 100 15" stroke="currentColor" strokeWidth="0.5" />
          </svg>
        </div>
      </div>
    </section>
  );
}
