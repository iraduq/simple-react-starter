export default function CTABanner() {
  return (
    <section className="cta-banner">
      <div className="cta-overlay" />
      <div className="cta-content">
        <p className="section-eyebrow" style={{ color: "var(--color-accent)" }}>
          Ofertă specială
        </p>
        <h2 className="cta-title">
          Rezervă acum și economisește <em>15%</em>
        </h2>
        <p className="cta-sub">
          Folosește codul <strong>CASAESY15</strong> la rezervarea directă și
          bucură-te de reducere. Ofertă valabilă pentru sejururi în sezon.
        </p>
        <div className="cta-actions">
          <a href="/login" className="btn btn-primary">
            Rezervă acum →
          </a>
          <a href="/contact" className="btn btn-ghost">
            Contactează-ne
          </a>
        </div>
      </div>
    </section>
  );
}
