import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="brand">
          <Link to="/">
            <span className="brand-wordmark">IntervAI</span>
          </Link>
        </div>
        <nav className="nav-links">
          <Link to="/" aria-current={location.pathname === "/" ? "page" : undefined}>
            Practice
          </Link>
          <Link to="/setup" aria-current={location.pathname === "/setup" ? "page" : undefined}>
            Dashboard
          </Link>
        </nav>
        <div className="navbar-actions">
          <Link className="button button-primary" to="/setup">
            Start Interview
          </Link>
          <span className="material-symbols-outlined" style={{ color: "#475569", cursor: "pointer" }}>
            account_circle
          </span>
        </div>
      </div>
    </header>
  );
}
