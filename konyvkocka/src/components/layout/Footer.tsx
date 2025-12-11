import { NavLink } from "react-router-dom";

function Footer() {
    return (
    <footer className="footer">
      <div className="container">
          <div className="row">
        <div className="col-md-4 mb-4 px-5">
                  <h4>KönyvKocka</h4>
                  <p>Fedezd fel a könyvek és filmek világát velünk! Nálunk megtalálod a legjobb történeteket kedvező áron.</p>
          <ul className="social-links list-unstyled">
          <li><a href="#" target="_blank"><i className="bi bi-facebook"></i> Facebook</a></li>
          <li><a href="#" target="_blank"><i className="bi bi-instagram"></i> Instagram</a></li>
          <li><a href="#" target="_blank"><i className="bi bi-discord"></i> Discord</a></li>
          </ul>
              </div>
        <div className="col-md-4 mb-4 px-5">
                  <h4>Gyors linkek</h4>
                  <ul className="footer-links">
                      <li><NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Kezdőlap</NavLink></li>
                      <li><NavLink to="/search" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Keresés</NavLink></li>
                      <li><NavLink to="/support" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Támogatás</NavLink></li>
                      <li><NavLink to="/about" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Rólunk</NavLink></li>
                  </ul>
              </div>
        <div className="col-md-4 mb-4 px-5">
                  <h4>Kapcsolat</h4>
                  <ul className="footer-links">
                      <li><i className="bi bi-envelope me-2"></i> info@konyvkocka.hu</li>
                      <li><i className="bi bi-telephone me-2"></i> +36 1 234 5678</li>
                      <li><i className="bi bi-geo-alt me-2"></i> Budapest, Magyarország</li>
                  </ul>
              </div>
          </div>
          <div className="footer-bottom text-center">
              <p className="mb-0">&copy; 2025 KönyvKocka. Minden jog fenntartva.</p>
          </div>
      </div>
    </footer>
    );
}
export default Footer;