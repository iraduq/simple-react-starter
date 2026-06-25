export default function Home() {
  return (
    <main className="home">
      <section className="hero-home">
        <div className="hero-content">
          <p className="eyebrow">BUN VENIT LA</p>
          <h1>Vila Casa <em>Esy</em></h1>
          <p className="subtitle">
            Ospitalitate caldă, camere rafinate și o experiență de neuitat — pentru oaspeții care prețuiesc detaliile.
          </p>
          <div className="hero-actions">
            <a href="#camere" className="btn btn-primary">Rezervă acum</a>
            <a href="#descopera" className="btn btn-ghost">Descoperă</a>
          </div>
        </div>
      </section>

      <section id="descopera" className="features">
        <article>
          <h3>Camere</h3>
          <p>Confort de trei stele cu atenție la fiecare detaliu.</p>
        </article>
        <article>
          <h3>Restaurant</h3>
          <p>Bucătărie internațională și preparate locale, gătite cu pasiune.</p>
        </article>
        <article>
          <h3>Evenimente</h3>
          <p>Săli moderne pentru conferințe, nunți și evenimente private.</p>
        </article>
      </section>
    </main>
  );
}