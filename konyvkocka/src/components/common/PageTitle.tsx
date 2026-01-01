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
      case '/rolunk':
        title = 'Rólunk | KönyvKocka';
        break;
      case '/belepes':
        title = 'Bejelentkezés | KönyvKocka';
        break;
      case '/kereses':
        title = 'Keresés | KönyvKocka';
        break;
      case '/hirek':
        title = 'Hírek | KönyvKocka';
        break;
      case '/konyvtaram':
        title = 'Könyvtáram | KönyvKocka';
        break;
      case '/elozmenyeim':
        title = 'Előzmények | KönyvKocka';
        break;
      case '/ertesitesek':
        title = 'Értesítések | KönyvKocka';
        break;
      case '/kihivasok':
        title = 'Kihívások | KönyvKocka';
        break;
      case '/tamogatas':
        title = 'Támogatás | KönyvKocka';
        break;
      case '/fizetes':
        title = 'Fizetés | KönyvKocka';
        break;
      case '/vasarlas':
        title = 'Vásárlások | KönyvKocka';
        break;
      case '/ranglista':
        title = 'Ranglista | KönyvKocka';
        break;
      case '/olvaso':
        title = 'Olvasó | KönyvKocka';
        break;
      case '/nezes':
        title = 'Videók | KönyvKocka';
        break;
      case '/profil':
        title = 'Profil | KönyvKocka';
        break;
      case '/jelszo-visszaallitas':
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
