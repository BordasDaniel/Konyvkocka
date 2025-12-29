import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const PageTitle = () => {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    let title = 'KönyvKocka';

    switch (path) {
      case '/':
        title = 'Kezdőlap | KönyvKocka';
        break;
      case '/about':
        title = 'Rólunk | KönyvKocka';
        break;
      case '/login':
        title = 'Bejelentkezés | KönyvKocka';
        break;
      case '/search':
        title = 'Keresés | KönyvKocka';
        break;
      case '/news':
        title = 'Hírek | KönyvKocka';
        break;
      case '/library':
        title = 'Könyvtáram | KönyvKocka';
        break;
      case '/favorites':
        title = 'Kedvencek | KönyvKocka';
        break;
      case '/notifications':
        title = 'Értesítések | KönyvKocka';
        break;
      case '/challenges':
        title = 'Kihívások | KönyvKocka';
        break;
      case '/support':
        title = 'Támogatás | KönyvKocka';
        break;
      case '/pay':
        title = 'Fizetés | KönyvKocka';
        break;
      case '/reader':
        title = 'Olvasó | KönyvKocka';
        break;
      case '/watch':
        title = 'Videók | KönyvKocka';
        break;
      case '/user':
        title = 'Profil | KönyvKocka';
        break;
      case '/reset-password':
        title = 'Jelszó visszaállítás | KönyvKocka';
        break;
      default:
        // Handle dynamic routes or 404 if needed, though 404 is usually handled by the route matching
        if (path !== '/') {
             title = 'KönyvKocka';
        }
        break;
    }

    document.title = title;
  }, [location]);

  return null;
};

export default PageTitle;
