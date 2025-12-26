import { Link } from "react-router-dom";

function About(): React.JSX.Element {
    return (
        <>
        <main className="mt-5">
    <div className="container-fluid px-4 py-5">
    <h1 className="mb-4 text-center display-6 fw-bold text-decoration-underline">Rólunk</h1>

    <div className="row gx-5">
      <div className="col-md-12">
        <div className="about-panel">
          <section className="mb-4">
            <h2 className="about-title">Mi vagyunk a KönyvKocka</h2>
            <p className="about-lead">A KönyvKocka egy modern streaming szolgáltatás, ahol filmeket és könyveket találsz egy helyen. Célunk, hogy a felhasználók számára egyszerű, gyors és minőségi hozzáférést biztosítsunk kedvenc tartalmaikhoz legyen szó mozifilmekről, soundtrackekről vagy e-könyvekről.</p>
          </section>

          <section className="mb-4">
            <h3 className="about-sub">Küldetésünk</h3>
            <p>Arra törekszünk, hogy a szórakoztatás és az olvasás találkozzon: innovatív keresést, testreszabott ajánlásokat és előfizetéses csomagokat kínálunk. Előfizetőink reklámmentes élményt, offline elérést és különleges tartalmi kiegészítőket kapnak.</p>
          </section>

          <section className="mb-4">
            <h3 className="about-sub">Csapatunk</h3>
            <p>Fejlesztők, tartalomkurátorok és ügyfélszolgálati szakemberek dolgoznak a platformon, hogy megbízható és folyamatosan fejlődő szolgáltatást biztosítsunk. Szívesen halljuk a visszajelzéseket írj nekünk az <a href="mailto:info@konyvkocka.hu" style={{color: "var(--link)"}}>info@konyvkocka.hu</a> címre.</p>
          </section>
        </div>
      </div>
    </div>

  </div>
</main>

  <section className="container-fluid px-4">
    <div className="pricing-row">
      <div className="pricing-card">
        <div>
          <h4>Ingyenes</h4>
          <p>Próbáld ki a KönyvKockát ingyen: korlátozott tartalom, hirdetések és alapfunkciók. Könyvolvasás és néhány korlátozott film elérhető.</p>
          <ul className="pricing-features">
            <li>Korlátozott film- és könyv hozzáférés</li>
            <li>Hirdetések megjelenítése</li>
            <li>Nincs offline letöltés</li>
            <li>Alap keresési funkció</li>
          </ul>
        </div>
        <div className="pricing-cta">
          <button className="btn fw-bold" disabled>Regisztráció szükséges</button>
        </div>
      </div>

      <div className="pricing-card">
        <div>
          <h4>Előfizetés (Prémium)</h4>
          <p>Teljes hozzáférés: hirdetésmentes lejátszás, korlátlan idő, OST keresés, YouTube Music integráció, offline letöltés és extra exkluzív tartalmak.</p>
          <ul className="pricing-features">
            <li>Hirdetésmentes élmény</li>
            <li>Korlátlan film- és könyv hozzáférés</li>
            <li>Offline letöltés</li>
            <li>OST és zene keresés</li>
            <li>Exkluzív tartalmak</li>
            <li>Egyéb applikációs integrációk</li>
            <li>Egyéb felhasználói előnyök mint például részletesebb adatok</li>
            <li>Továbbiak...</li>
          </ul>
        </div>
        <div className="pricing-cta">
          <Link to="/pay" className="btn fw-bold">Előfizetek</Link>
        </div>
      </div>
    </div>
  </section>
</>
    )
}

export default About;