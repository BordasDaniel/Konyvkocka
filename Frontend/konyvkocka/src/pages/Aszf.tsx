import { Link } from 'react-router-dom';

function Aszf(): React.JSX.Element {
  return (
    <main className="mt-5 aszf-page">
      <div className="container-fluid px-4 py-5">
        <h1 className="mb-4 text-center display-6 fw-bold text-decoration-underline aszf-title">
          <i className="bi bi-file-earmark-text me-2"></i>
          Általános Szerződési Feltételek (ÁSZF)
        </h1>

        <div className="row gx-5">
          <div className="col-12">
            <div className="about-panel aszf-panel">
              <p className="about-lead mb-4">
                Jelen dokumentum a KönyvKocka digitális szolgáltatásainak használatára vonatkozó általános szerződési feltételeket tartalmazza.
                A platform használatával a felhasználó kijelenti, hogy az ÁSZF-ben foglalt rendelkezéseket megismerte, megértette,
                és magára nézve kötelezőnek fogadja el. Az ÁSZF célja, hogy átlátható keretet adjon a szolgáltatás használatának,
                valamint egyértelműen rögzítse a felek jogait és kötelezettségeit.
              </p>

              <section className="aszf-section">
                <h2 className="about-sub">1. Szolgáltató adatai</h2>
                <ul className="aszf-list">
                  <li>Szolgáltató neve: KönyvKocka</li>
                  <li>Kapcsolat: info@konyvkocka.hu</li>
                  <li>Szolgáltatás helye: Magyarország</li>
                  <li>A szolgáltató elektronikus úton tart kapcsolatot a felhasználókkal.</li>
                </ul>
              </section>

              <section className="aszf-section">
                <h2 className="about-sub">2. A szolgáltatás tárgya és jellege</h2>
                <p>
                  A KönyvKocka online platformja digitális tartalmak (könyvek, filmek, sorozatok) elérését biztosítja.
                  A szolgáltatás része lehet ingyenesen használható funkció, valamint előfizetéshez kötött prémium funkció.
                  A platform egyes elemei régió, csomagszint, technikai kompatibilitás vagy jogi korlátozás miatt eltérő módon
                  lehetnek elérhetők.
                </p>
              </section>

              <section className="aszf-section">
                <h2 className="about-sub">3. Felhasználói fiók és hozzáférés</h2>
                <ul className="aszf-list">
                  <li>A regisztráció során megadott adatok valósága és pontossága a felhasználó felelőssége.</li>
                  <li>A jelszó és hozzáférési adatok biztonságos kezelése a felhasználó kötelezettsége.</li>
                  <li>A fiókkal végzett tevékenységekért a fiók tulajdonosa felel.</li>
                  <li>A szolgáltató jogosult a fiókhoz kapcsolódó visszaélések esetén korlátozó intézkedést alkalmazni.</li>
                </ul>
              </section>

              <section className="aszf-section">
                <h2 className="about-sub">4. Előfizetés, díjak és fizetés</h2>
                <ul className="aszf-list">
                  <li>Az előfizetési csomagok díját, időtartamát és tartalmát a fizetési oldalon feltüntetett adatok tartalmazzák.</li>
                  <li>A prémium hozzáférés a sikeres fizetési visszaigazolást követően aktiválódik.</li>
                  <li>A fizetési tranzakciók külső fizetési szolgáltató közreműködésével történnek.</li>
                  <li>Visszatérítésre és kompenzációra egyedi ügyintézés alapján kerülhet sor.</li>
                </ul>
              </section>

              <section className="aszf-section">
                <h2 className="about-sub">5. Tiltott magatartások</h2>
                <ul className="aszf-list">
                  <li>Tilos a tartalmak jogosulatlan másolása, terjesztése, továbbértékesítése vagy automatizált letöltése.</li>
                  <li>Tilos a szolgáltatás működésének zavarása, túlterhelése, illetve a biztonsági mechanizmusok megkerülésére tett kísérlet.</li>
                  <li>Tilos jogsértő, zaklató, gyűlöletkeltő vagy megtévesztő tartalmak közzététele.</li>
                  <li>Spam, automata bot-használat és visszaélésszerű tömeges műveletvégzés nem megengedett.</li>
                </ul>
              </section>

              <section className="aszf-section">
                <h2 className="about-sub">6. Felelősségkorlátozás</h2>
                <p>
                  A szolgáltató a szolgáltatás folyamatos elérhetőségére törekszik, azonban nem vállal felelősséget olyan
                  üzemszünetért vagy hibáért, amely külső szolgáltató, hálózati hiba, karbantartás, vis maior vagy
                  előre nem látható technikai esemény következménye.
                </p>
              </section>

              <section className="aszf-section">
                <h2 className="about-sub">7. Adatkezelés és adatvédelem</h2>
                <p>
                  A felhasználók személyes adatainak kezelése a hatályos adatvédelmi jogszabályoknak megfelelően történik.
                  Az adatkezelés jogalapját, célját, időtartamát, valamint a felhasználói jogérvényesítés módját külön
                  adatkezelési tájékoztató tartalmazza.
                </p>
              </section>

              <section className="aszf-section">
                <h2 className="about-sub">8. Szerzői jogok és felhasználási korlátok</h2>
                <p>
                  A platformon megjelenített tartalmak és arculati elemek szerzői jogi védelem alatt állnak.
                  A felhasználó kizárólag személyes, nem kereskedelmi célra jogosult a szolgáltatás használatára,
                  a tartalmak üzletszerű vagy engedély nélküli felhasználása tilos.
                </p>
              </section>

              <section className="aszf-section">
                <h2 className="about-sub">9. Az ÁSZF módosítása és hatálya</h2>
                <p>
                  A szolgáltató fenntartja a jogot az ÁSZF egyoldalú módosítására. A módosított rendelkezések a közzététel
                  időpontjától hatályosak, és a platform további használatával a felhasználó azokat elfogadja.
                  Lényeges változás esetén a szolgáltató külön, jól látható formában is tájékoztatást ad.
                </p>
              </section>

              <section className="aszf-section">
                <h2 className="about-sub">10. Vegyes és záró rendelkezések</h2>
                <p>
                  A jelen ÁSZF-ben nem szabályozott kérdésekben a vonatkozó magyar jogszabályok, különösen a Polgári
                  Törvénykönyv és az elektronikus kereskedelmi szolgáltatásra vonatkozó előírások az irányadók.
                  A felek vitás kérdéseiket elsődlegesen békés úton rendezik.
                </p>
              </section>

              <div className="aszf-footer-actions">
                <Link to="/rolunk" className="btn fw-bold">Vissza a Rólunk oldalra</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Aszf;
