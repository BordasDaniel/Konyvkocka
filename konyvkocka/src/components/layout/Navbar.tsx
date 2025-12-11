import {  NavLink} from "react-router-dom";


function Navbar()
{
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
          </ul>

          {/* Jobb oldali elemek */}
          <ul className="navbar-nav">

            <li className="nav-item">
                <NavLink className="nav-link" to="/login"><i className="bi bi-person-circle"></i>Bejelentkezés</NavLink>
            </li>
      
          </ul>
        </div>
      </div>
    </nav>

    )
};

export default Navbar;