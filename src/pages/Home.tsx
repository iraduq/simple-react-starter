import "./Home.css";

export default function Home() {
  return (
    <main className="home">
      <section className="hero-home">
        <div className="hero-content">
          <p className="eyebrow">BUN VENIT LA</p>
          <h1>Bavaria Blu</h1>
          <p className="subtitle">
            Eleganță pe malul Mării Negre — camere rafinate, gastronomie de
            autor și spații pentru evenimente memorabile.
          </p>
          <div className="hero-actions">
            <a href="#camere" className="cta-primary">REZERVĂ ACUM</a>
            <a href="#descopera" className="cta-ghost">DESCOPERĂ</a>
          </div>
        </div>
      </section>

      <section id="descopera" className="features">
        <article>
          <h3>CAMERE</h3>
          <p>Confort de patru stele cu vedere spectaculoasă către Mamaia.</p>
        </article>
        <article>
          <h3>RESTAURANT</h3>
          <p>Bucătărie internațională și preparate locale, gătite cu pasiune.</p>
        </article>
        <article>
          <h3>EVENIMENTE</h3>
          <p>Săli moderne pentru conferințe, nunți și evenimente private.</p>
        </article>
      </section>
    </main>
  );
}