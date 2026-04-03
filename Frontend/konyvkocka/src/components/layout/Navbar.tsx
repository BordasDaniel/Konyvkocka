import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState, useRef, useEffect } from "react";
import { ApiHttpError, getNotifications } from "../../services/api";

function Navbar() {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileProfileMenuOpen, setMobileProfileMenuOpen] = useState(false);
    const [mobilePanelHeight, setMobilePanelHeight] = useState<number>(0);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef<HTMLLIElement>(null);
    const mobileMainPanelRef = useRef<HTMLUListElement>(null);
    const mobileProfilePanelRef = useRef<HTMLUListElement>(null);
    const navbarCollapseRef = useRef<HTMLDivElement>(null);
    const navbarTogglerRef = useRef<HTMLButtonElement>(null);
    const hasAdminAccess = Boolean(user && (user.isAdmin || user.isModerator));

    const mainNavItems = [
        { to: '/', label: 'Kezdőlap', icon: 'bi-house-door' },
        { to: '/kereses', label: 'Keresés', icon: 'bi-search' },
        { to: '/tamogatas', label: 'Támogatás', icon: 'bi-life-preserver' },
        { to: '/rolunk', label: 'Rólunk', icon: 'bi-people' },
        { to: '/hirek', label: 'Hírek', icon: 'bi-newspaper' },
        { to: '/ranglista', label: 'Ranglista', icon: 'bi-trophy' },
    ];

    const closeMobileProfilePanel = () => {
        setMobileProfileMenuOpen(false);
    };

    const syncMobilePanelHeight = () => {
      const targetPanel = mobileProfileMenuOpen ? mobileProfilePanelRef.current : mobileMainPanelRef.current;
      if (targetPanel) {
        setMobilePanelHeight(targetPanel.scrollHeight);
      }
    };

    const closeNavbarCollapse = () => {
        if (navbarCollapseRef.current?.classList.contains('show')) {
            navbarCollapseRef.current.classList.remove('show');
        }

        if (navbarTogglerRef.current) {
            navbarTogglerRef.current.classList.add('collapsed');
            navbarTogglerRef.current.setAttribute('aria-expanded', 'false');
        }
    };

    const handleNavigationClick = () => {
        closeMobileProfilePanel();
        closeNavbarCollapse();
    };

    const handleNavbarToggleClick = () => {
      // Bootstrap collapse animation changes layout asynchronously, so re-measure on next frames.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          syncMobilePanelHeight();
        });
      });
    };

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

    useEffect(() => {
        syncMobilePanelHeight();
        window.addEventListener('resize', syncMobilePanelHeight);

        return () => window.removeEventListener('resize', syncMobilePanelHeight);
    }, [mobileProfileMenuOpen, isAuthenticated, user?.isAdmin, user?.isModerator, user?.username]);

    useEffect(() => {
      let isMounted = true;

      const applyUnreadCount = (value: number) => {
        if (!isMounted) return;
        setUnreadCount(Math.max(0, value));
      };

      const refreshUnreadCount = async () => {
        if (!isAuthenticated) {
          applyUnreadCount(0);
          return;
        }

        try {
          const response = await getNotifications({
            unread: true,
            page: 1,
            pageSize: 1,
          });
          applyUnreadCount(response.unreadCount);
        } catch (error) {
          if (error instanceof ApiHttpError && (error.status === 401 || error.status === 403)) {
            applyUnreadCount(0);
            return;
          }

          console.error('Failed to load unread notification count:', error);
        }
      };

      const onUnreadCountChanged = (event: Event) => {
        const customEvent = event as CustomEvent<{ unreadCount?: number }>;
        const nextUnreadCount = customEvent.detail?.unreadCount;

        if (typeof nextUnreadCount === 'number') {
          applyUnreadCount(nextUnreadCount);
          return;
        }

        void refreshUnreadCount();
      };

      const onWindowFocus = () => {
        void refreshUnreadCount();
      };

      const onVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          void refreshUnreadCount();
        }
      };

      const intervalId = window.setInterval(() => {
        void refreshUnreadCount();
      }, 60000);

      void refreshUnreadCount();
      window.addEventListener('kk_notifications_unread_changed', onUnreadCountChanged as EventListener);
      window.addEventListener('focus', onWindowFocus);
      document.addEventListener('visibilitychange', onVisibilityChange);

      return () => {
        isMounted = false;
        window.clearInterval(intervalId);
        window.removeEventListener('kk_notifications_unread_changed', onUnreadCountChanged as EventListener);
        window.removeEventListener('focus', onWindowFocus);
        document.removeEventListener('visibilitychange', onVisibilityChange);
      };
    }, [isAuthenticated]);

    const handleLogout = () => {
        logout();
        setDropdownOpen(false);
        setMobileProfileMenuOpen(false);
      closeNavbarCollapse();
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
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavbar"
          ref={navbarTogglerRef}
          onClick={handleNavbarToggleClick}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Menü */}
        <div className="collapse navbar-collapse" id="mainNavbar" ref={navbarCollapseRef}>
          {/* Mobil: csúszó főmenü/profil panel */}
          <div className="mobile-menu-switcher d-lg-none" style={{ height: mobilePanelHeight ? `${mobilePanelHeight}px` : undefined }}>
            <div className={`mobile-menu-track ${mobileProfileMenuOpen ? 'show-profile' : ''}`}>
              <ul className="navbar-nav mobile-menu-panel mb-2 mb-lg-0" ref={mobileMainPanelRef}>
                {mainNavItems.map((item) => (
                  <li className="nav-item" key={item.to}>
                    <NavLink
                      to={item.to}
                      className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                      onClick={handleNavigationClick}
                    >
                      <i className={`bi ${item.icon} mobile-main-icon me-2`} aria-hidden="true"></i>
                      {item.label}
                    </NavLink>
                  </li>
                ))}

                {isAuthenticated && user ? (
                  <li className="nav-item">
                    <button
                      className="nav-link btn btn-link mobile-profile-toggle"
                      type="button"
                      onClick={() => setMobileProfileMenuOpen(true)}
                      aria-expanded={mobileProfileMenuOpen}
                    >
                      <img
                        src={user.avatar}
                        alt={user.username}
                        className="rounded-circle"
                        style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                      />
                      <span>{user.username}</span>
                      <i className="bi bi-chevron-right ms-auto"></i>
                    </button>
                  </li>
                ) : (
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/belepes" onClick={handleNavigationClick}>
                      <i className="bi bi-person-circle me-2"></i>Bejelentkezés
                    </NavLink>
                  </li>
                )}
              </ul>

              <ul className="navbar-nav mobile-menu-panel mobile-profile-panel" ref={mobileProfilePanelRef}>
                {isAuthenticated && user && (
                  <>
                    <li className="nav-item">
                      <button
                        className="nav-link btn btn-link mobile-back-btn"
                        type="button"
                        onClick={closeMobileProfilePanel}
                      >
                        <i className="bi bi-chevron-left me-2"></i>Vissza a menühöz
                      </button>
                    </li>

                    <li className="nav-item">
                      <NavLink to="/profil" className="nav-link" onClick={handleNavigationClick}>
                        <i className="bi bi-person-circle me-2"></i>Profil
                      </NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink to="/konyvtaram" className="nav-link" onClick={handleNavigationClick}>
                        <i className="bi bi-collection me-2"></i>Könyvtáram
                      </NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink to="/elozmenyeim" className="nav-link" onClick={handleNavigationClick}>
                        <i className="bi bi-clock-history me-2"></i>Előzmény
                      </NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink to="/ertesitesek" className="nav-link" onClick={handleNavigationClick}>
                        <span style={{ position: 'relative', display: 'inline-block' }}>
                          <i className="bi bi-bell-fill me-2"></i>
                          {unreadCount > 0 && <span className="navbar-notification-dot" aria-hidden="true"></span>}
                        </span>
                        Értesítések
                      </NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink to="/kihivasok" className="nav-link" onClick={handleNavigationClick}>
                        <i className="bi bi-trophy-fill me-2"></i>Kihívások
                      </NavLink>
                    </li>

                    <li><hr className="dropdown-divider" /></li>

                    <li className="nav-item">
                      <NavLink
                        to="/profil"
                        className="nav-link"
                        onClick={handleNavigationClick}
                        state={{ view: 'settings' }}
                      >
                        <i className="bi bi-gear me-2"></i>Beállítások
                      </NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink to="/vasarlas" className="nav-link" onClick={handleNavigationClick}>
                        <i className="bi bi-bag-check me-2"></i>Vásárlások
                      </NavLink>
                    </li>

                    {hasAdminAccess && (
                      <>
                        <li><hr className="dropdown-divider" /></li>
                        <li className="nav-item">
                          <NavLink to="/admin" className="nav-link" onClick={handleNavigationClick}>
                            <i className="bi bi-shield-lock me-2"></i>Admin
                          </NavLink>
                        </li>
                      </>
                    )}

                    <li><hr className="dropdown-divider" /></li>

                    <li className="nav-item">
                      <button className="nav-link btn btn-link text-danger mobile-logout" onClick={handleLogout}>
                        <i className="bi bi-box-arrow-right me-2"></i>Kijelentkezés
                      </button>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>

          {/* Desktop: bal oldali menü elemek */}
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 d-none d-lg-flex">
            {mainNavItems.map((item) => (
              <li className="nav-item" key={`desktop-${item.to}`}>
                <NavLink to={item.to} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>{item.label}</NavLink>
              </li>
            ))}
          </ul>

          {/* Desktop: jobb oldali elemek */}
          <ul className="navbar-nav d-none d-lg-flex">
            {isAuthenticated && user ? (
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
                  <li>
                    <NavLink to="/profil" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      <i className="bi bi-person-circle me-2"></i>Profil
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/konyvtaram" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      <i className="bi bi-collection me-2"></i>Könyvtáram
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/elozmenyeim" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      <i className="bi bi-clock-history me-2"></i>Előzmény
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/ertesitesek" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      <span style={{ position: 'relative', display: 'inline-block' }}>
                        <i className="bi bi-bell-fill me-2"></i>
                        {unreadCount > 0 && <span className="navbar-notification-dot" aria-hidden="true"></span>}
                      </span>
                      Értesítések
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/kihivasok" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      <i className="bi bi-trophy-fill me-2"></i>Kihívások
                    </NavLink>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <NavLink
                      to="/profil"
                      className="dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                      state={{ view: 'settings' }}
                    >
                      <i className="bi bi-gear me-2"></i>Beállítások
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/vasarlas" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      <i className="bi bi-bag-check me-2"></i>Vásárlások
                    </NavLink>
                  </li>
                  {hasAdminAccess && (
                    <>
                      <li><hr className="dropdown-divider" /></li>
                      <li>
                        <NavLink to="/admin" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                          <i className="bi bi-shield-lock me-2"></i>Admin
                        </NavLink>
                      </li>
                    </>
                  )}
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2"></i>Kijelentkezés
                    </button>
                  </li>
                </ul>
              </li>
            ) : (
              <li className="nav-item">
                <NavLink className="nav-link" to="/belepes">
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