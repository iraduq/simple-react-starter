import { Link, NavLink } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  return (
    <header className="site-header">
      <div className="topbar">
        <span className="topbar-address">Bulevardul Mamaia, Constanța 900001</span>
        <div className="topbar-socials">
          <a href="#" aria-label="Email">✉</a>
          <a href="#" aria-label="Facebook">f</a>
          <a href="#" aria-label="Instagram">◎</a>
          <a href="#" aria-label="LinkedIn">in</a>
        </div>
      </div>

      <div className="mainbar">
        <Link to="/" className="brand">
          <span className="brand-name">BAVARIA BLU</span>
          <span className="brand-stars">★★★★</span>
          <span className="brand-tag">HOTEL AND CONFERENCE CENTRE</span>
        </Link>

        <nav className="primary-nav">
          <NavLink to="/" end>ACASĂ</NavLink>
          <NavLink to="/camere">CAMERE</NavLink>
          <NavLink to="/oferte">OFERTE</NavLink>
          <NavLink to="/restaurant">RESTAURANT</NavLink>
          <NavLink to="/contact">CONTACT</NavLink>
        </nav>

        <div className="auth-actions">
          <NavLink to="/login" className="btn-ghost">LOGIN</NavLink>
          <NavLink to="/register" className="btn-primary">REGISTER</NavLink>
        </div>
      </div>
    </header>
  );
}