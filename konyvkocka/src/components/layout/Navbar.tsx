import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState, useRef, useEffect } from "react";

function Navbar() {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLLIElement>(null);

    // Dropdown bezárása kattintásra kívül
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        setDropdownOpen(false);
        navigate('/');
    };

    return (
    <nav className="navbar navbar-expand-lg navbar-dark navbar-custom fixed-top">
      <div className="container-fluid">
        {/* Logo */}
        <div className="navbar-brand-container">
          <img src="https://img.pikbest.com/origin/09/26/29/82YpIkbEsTegM.png!sw800" alt="Logo" className="navbar-logo" />
              <NavLink to="/" className="navbar-brand">KönyvKocka</NavLink>
        </div>

        {/* Hamburger menu */}
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavbar">
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Menü */}
        <div className="collapse navbar-collapse" id="mainNavbar">
          {/* Bal oldali menü elemek */}
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Kezdőlap</NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/search" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Keresés</NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/support" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Támogatás</NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/about" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Rólunk</NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/news" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Hírek</NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/leaderboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Ranglista</NavLink>
            </li>
          </ul>

          {/* Jobb oldali elemek */}
          <ul className="navbar-nav">
            {isAuthenticated && user ? (
              // Bejelentkezett felhasználó - dropdown menü
              <li className="nav-item dropdown" ref={dropdownRef}>
                <button
                  className="nav-link dropdown-toggle d-flex align-items-center gap-2 btn btn-link"
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  aria-expanded={dropdownOpen}
                  style={{ border: 'none', background: 'transparent' }}
                >
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="rounded-circle"
                    style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                  />
                  <span>{user.username}</span>
                  {user.isSubscriber && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="16"
                      height="16"
                      style={{ color: 'var(--secondary)' }}
                    >
                      <path fill="currentColor" d="M2 17l2-7 4 4 5-9 5 9 4-4 2 7H2z" />
                    </svg>
                  )}
                </button>
                <ul className={`dropdown-menu dropdown-menu-end dropdown-menu-dark ${dropdownOpen ? 'show' : ''}`}>
                  {/* Profil */}
                  <li>
                    <NavLink
                      to="/user"
                      className="dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <i className="bi bi-person-circle me-2"></i>Profil
                    </NavLink>
                  </li>
                  {/* Könyvtáram */}
                  <li>
                    <NavLink
                      to="/library"
                      className="dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <i className="bi bi-collection me-2"></i>Könyvtáram
                    </NavLink>
                  </li>
                  {/* Előzmények */}
                  <li>
                    <NavLink
                      to="/history"
                      className="dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <i className="bi bi-clock-history me-2"></i>Előzmény
                    </NavLink>
                  </li>
                  {/* Értesítések (badge-el) */}
                  <li>
                    <NavLink
                      to="/notifications"
                      className="dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <span style={{ position: 'relative', display: 'inline-block' }}>
                        <i className="bi bi-bell-fill me-2"></i>
                        <span className="navbar-notification-dot"></span>
                      </span>
                      Értesítések
                    </NavLink>
                  </li>
                  {/* Kihívások */}
                  <li>
                    <NavLink
                      to="/challenges"
                      className="dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <i className="bi bi-trophy-fill me-2"></i>Kihívások
                    </NavLink>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  {/* Beállítások */}
                  <li>
                    <NavLink
                      to="/user"
                      className="dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                      state={{ view: 'settings' }}
                    >
                      <i className="bi bi-gear me-2"></i>Beállítások
                    </NavLink>
                  </li>
                  {/* Vásárlások */}
                  <li>
                    <NavLink
                      to="/subscription"
                      className="dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <i className="bi bi-bag-check me-2"></i>Vásárlások
                    </NavLink>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  {/* Kijelentkezés (piros) */}
                  <li>
                    <button
                      className="dropdown-item text-danger"
                      onClick={handleLogout}
                    >
                      <i className="bi bi-box-arrow-right me-2"></i>Kijelentkezés
                    </button>
                  </li>
                </ul>
              </li>
            ) : (
              // Nem bejelentkezett - bejelentkezés link
              <li className="nav-item">
                <NavLink className="nav-link" to="/login">
                  <i className="bi bi-person-circle"></i> Bejelentkezés
                </NavLink>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
    );
}

export default Navbar;