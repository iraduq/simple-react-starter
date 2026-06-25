import { Link, NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="site-header">
      <div className="topbar">
        <div className="topbar-left">
          <span>✆ +40 740 000 000</span>
          <span>✉ rezervari@casaesy.ro</span>
        </div>
        <div className="topbar-socials">
          <a href="#" aria-label="Facebook">f</a>
          <a href="#" aria-label="Instagram">◎</a>
          <a href="#" aria-label="TripAdvisor">t</a>
        </div>
      </div>

      <div className="mainbar">
        <nav className="primary-nav">
          <NavLink to="/" end>Acasă</NavLink>
          <NavLink to="/camere">Camere</NavLink>
          <NavLink to="/oferte">Oferte</NavLink>
          <NavLink to="/contact">Contact</NavLink>
        </nav>

        <Link to="/" className="brand" aria-label="Vila Casa Esy">
          <span className="brand-rule">VILA</span>
          <span className="brand-name">Casa <em>Esy</em></span>
          <span className="brand-meta">
            <span className="brand-stars">★★★</span>
            <span>Hotel de trei stele</span>
            <span className="brand-dot" />
            <span className="brand-reviews"><b>4.887</b> recenzii</span>
          </span>
        </Link>

        <div className="auth-actions">
          <NavLink to="/login" className="btn btn-ghost">Login</NavLink>
          <NavLink to="/register" className="btn btn-primary">Register</NavLink>
        </div>
      </div>
    </header>
  );
}