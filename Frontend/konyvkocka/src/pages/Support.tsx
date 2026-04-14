import { useState } from 'react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface FAQCategory {
  id: string;
  title: string;
  icon?: string;
  items: FAQItem[];
}

const FAQ_CATEGORIES: FAQCategory[] = [
  {
    id: 'subscription',
    title: 'Előfizetés és számlázás',
    icon: 'bi-credit-card',
    items: [
      {
        id: 'subscription-what',
        question: 'Mire jó az előfizetés?',
        answer: 'Az előfizetés extra előnyöket ad: több tartalom, jobb minőségű lejátszás, kényelmi funkciók (pl. könyvjelző/előzmények), valamint gyorsabb ügyfélszolgálati válaszidő (csomagtól függően).'
      },
      {
        id: 'subscription-buy',
        question: 'Hogyan vásárolhatok előfizetést?',
        answer: 'Lépj a Profil / Vásárlások (Előfizetés) menüpontra, válaszd ki a csomagot, majd kövesd a fizetési lépéseket. A sikeres fizetés után az előnyök azonnal aktiválódnak.'
      },
      {
        id: 'subscription-trial',
        question: 'Van-e ingyenes próbaidőszak?',
        answer: 'Időszakos promóciókban lehet próbaidőszak. Ha van aktív próba, azt a Vásárlások oldalon látod. A próba lejárta előtt bármikor lemondható.'
      },
      {
        id: 'subscription-cancel',
        question: 'Hogyan mondhatom le az előfizetésem?',
        answer: 'Profil → Vásárlások/Előfizetés alatt tudod lemondani. A lemondás jellemzően a következő számlázási ciklustól lép életbe.'
      },
      {
        id: 'subscription-change',
        question: 'Csomagot tudok váltani (alap → prémium)?',
        answer: 'Igen, a Vásárlások oldalon csomagváltásra is van lehetőség. A váltás részlete (azonnali vs. következő ciklus) a csomagbeállításoknál látható.'
      },
      {
        id: 'subscription-invoice',
        question: 'Hol találom a számláimat / fizetési előzményeimet?',
        answer: 'Profil → Vásárlások részben jelennek meg a fizetési események. Ha valami hiányzik, írd meg az időpontot és a felhasználónevet a támogatásnak.'
      },
      {
        id: 'subscription-payment-fail',
        question: 'Sikertelen a fizetés. Mit tegyek?',
        answer: 'Ellenőrizd a kártya/PayPal adatokat, az internetkapcsolatot, majd próbáld újra. Ha ismétlődik, próbálj másik fizetési módot, vagy jelezd nekünk a pontos hibával.'
      },
      {
        id: 'subscription-refund',
        question: 'Kérhetek visszatérítést?',
        answer: 'Visszatérítés a konkrét esettől függ (pl. duplázott terhelés). Írd meg a rendelés/fizetés adatait és kivizsgáljuk.'
      }
    ]
  },
  {
    id: 'account',
    title: 'Fiók és biztonság',
    icon: 'bi-shield-lock',
    items: [
      {
        id: 'account-register',
        question: 'Hogyan hozhatok létre fiókot?',
        answer: 'A Bejelentkezés oldalon válaszd a regisztrációt, add meg az adataidat, majd erősítsd meg a fiókot a megadott módon (ha szükséges).'
      },
      {
        id: 'account-reset',
        question: 'Elfelejtettem a jelszavam. Mit tegyek?',
        answer: 'Használd a Jelszó visszaállítás funkciót. Ha az email nem érkezik meg, ellenőrizd a spam/promóciók mappát is.'
      },
      {
        id: 'account-email',
        question: 'Meg tudom változtatni az email címem?',
        answer: 'A beállításoknál (Profil) tudod módosítani, ha a funkció elérhető. Ha nem látod, írj a támogatásnak és segítünk.'
      },
      {
        id: 'account-logout',
        question: 'Miért léptet ki néha a rendszer?',
        answer: 'Biztonsági okból a munkamenet lejárhat, vagy a böngésző törölheti a sütiket. Próbáld meg engedélyezni a sütiket, és ellenőrizd, hogy nincs-e privát mód.'
      },
      {
        id: 'account-2fa',
        question: 'Van kétlépcsős azonosítás (2FA)?',
        answer: 'Ha a fiókod biztonsági beállításaiban elérhető, ott tudod bekapcsolni. Ha jelenleg nem látod, a funkció még fejlesztés alatt lehet.'
      },
      {
        id: 'account-delete',
        question: 'Hogyan törölhetem a fiókom?',
        answer: 'A fióktörlés opció a beállításoknál található, ha engedélyezve van. Előfizetés esetén előbb érdemes lemondani, majd törölni a fiókot.'
      }
    ]
  },
  {
    id: 'watching',
    title: 'Videók és lejátszás',
    icon: 'bi-play-circle',
    items: [
      {
        id: 'watch-quality',
        question: 'Hogyan állíthatom a videó minőségét?',
        answer: 'A lejátszó beállításaiban (fogaskerék/menü) választható, ha az adott tartalom több minőségben elérhető.'
      },
      {
        id: 'watch-buffer',
        question: 'Akadozik a lejátszás (bufferel). Mit nézzek meg?',
        answer: 'Próbáld csökkenteni a minőséget, zárj be más letöltéseket, és frissítsd az oldalt. Wi‑Fi helyett, ha lehet, használj stabilabb kapcsolatot.'
      },
      {
        id: 'watch-no-sound',
        question: 'Nincs hang a videón.',
        answer: 'Ellenőrizd, nincs-e lenémítva a player/böngésző, és hogy a rendszerhangerő rendben van-e. Próbálj másik böngészőt is.'
      },
      {
        id: 'watch-subtitles',
        question: 'Van felirat?',
        answer: 'Ha az adott tartalomhoz elérhető felirat, a lejátszó felirat menüjében tudod ki/be kapcsolni.'
      },
      {
        id: 'watch-device',
        question: 'Melyik böngésző ajánlott?',
        answer: 'Általában a legfrissebb Chrome/Edge/Firefox verziók működnek a legstabilabban. Ha gond van, frissítsd a böngészőt és kapcsold ki a blokkoló bővítményeket tesztre.'
      },
      {
        id: 'watch-cast',
        question: 'Tudok TV-re küldeni (cast)?',
        answer: 'Ha a lejátszó támogatja, a cast ikon jelenik meg. Ha nem látod, a funkció lehet, hogy még nincs bekapcsolva az adott platformon.'
      }
    ]
  },
  {
    id: 'reading',
    title: 'Olvasás és könyvtár',
    icon: 'bi-book',
    items: [
      {
        id: 'reading-open',
        question: 'Hogyan nyitom meg a könyveket az olvasóban?',
        answer: 'A könyv részleteinél válaszd az Olvasás opciót. Ez megnyitja az olvasót, ahol lapozni és nagyítani is tudsz.'
      },
      {
        id: 'reading-zoom',
        question: 'Nem jól látszik a szöveg. Van zoom/nagyítás?',
        answer: 'Igen: az olvasóban nagyítás/kicsinyítés funkció elérhető (eszköztől függően gombokkal vagy görgővel).'
      },
      {
        id: 'reading-progress',
        question: 'Megjegyzi, hol tartottam?',
        answer: 'Az előzmények és a könyvjelzők segítenek, hogy folytathasd később. Ha nem mentődik, ellenőrizd a sütik/tárhely engedélyeit.'
      },
      {
        id: 'library-missing',
        question: 'Nem találom a könyvtáramban a tartalmat.',
        answer: 'Ellenőrizd, ugyanazzal a fiókkal vagy-e belépve. Ha előfizetéshez kötött a tartalom, nézd meg a csomag státuszát is.'
      },
      {
        id: 'reading-offline',
        question: 'Van offline olvasás/letöltés?',
        answer: 'Ha az adott csomag és platform támogatja, megjelenik a letöltés opció. Asztali böngészőben ez korlátozott lehet.'
      }
    ]
  },
  {
    id: 'search',
    title: 'Keresés, ajánlások és OST',
    icon: 'bi-search',
    items: [
      {
        id: 'search-basic',
        question: 'Hogyan működik a keresés?',
        answer: 'Kereshetsz címre, címkére/műfajra, és egyes tartalmaknál extra metaadatokra. Minél pontosabb a kifejezés, annál jobb a találat.'
      },
      {
        id: 'search-noresults',
        question: 'Miért nincs találat egy ismert címre?',
        answer: 'Lehet, hogy a tartalom még nincs a katalógusban, vagy más címen szerepel. Próbáld rövidebb kulcsszóval, illetve műfaj címkével.'
      },
      {
        id: 'ost-what',
        question: 'Hogyan működik az OST (filmzene) keresés?',
        answer: 'A keresőben a filmhez kapcsolódó zenékre is rá tudsz keresni. A találatokat előnézetben megnézheted/meghallgathatod az elérhető források szerint.'
      },
      {
        id: 'ost-youtubemusic',
        question: 'Mit jelent a YouTube Music integráció?',
        answer: 'Ha elérhető és be van állítva, a találatokat könnyebben meg tudod nyitni YouTube Music-ban, vagy lejátszási listába rendezni (a pontos működés a beállításoktól függ).'
      },
      {
        id: 'recommendations',
        question: 'Hogyan kapok jobb ajánlásokat?',
        answer: 'Használj értékelést (ha elérhető) és nézz/olvass több tartalmat. Az előzmények segítenek a személyre szabásban.'
      }
    ]
  },
  {
    id: 'troubleshooting',
    title: 'Technikai hibák és hibaelhárítás',
    icon: 'bi-tools',
    items: [
      {
        id: 'tech-clear',
        question: 'Mit tegyek, ha valami nem tölt be?',
        answer: 'Frissítsd az oldalt, majd próbáld meg inkognitó/privát módban. Ha ott jó, egy bővítmény vagy cache okozhatja.'
      },
      {
        id: 'tech-cache',
        question: 'Hogyan ürítsem a gyorsítótárat (cache)?',
        answer: 'Böngésző beállítások → Adatvédelem → Böngészési adatok törlése. Ez sok megjelenítési és betöltési hibát megold.'
      },
      {
        id: 'tech-images',
        question: 'Nem látszanak képek/borítók.',
        answer: 'Ellenőrizd, hogy a reklámblokkoló vagy privacy bővítmények nem tiltják-e a képek forrását. Próbáld ideiglenesen kikapcsolni és frissíteni.'
      },
      {
        id: 'tech-mobile',
        question: 'Mobilon szétesik a layout.',
        answer: 'Frissítsd a böngészőt, és próbáld meg másik böngészővel is (pl. Chrome/Edge). Ha tudsz, küldj képernyőképet és készülék típust.'
      },
      {
        id: 'tech-errors',
        question: 'Hibát ír ki a rendszer (piros üzenet / konzol hiba). Mit küldjek be?',
        answer: 'Küldd el: mit csináltál, milyen oldalon történt, milyen böngésző/verzió, és ha tudod, a hiba szövegét/képernyőképet.'
      }
    ]
  },
  {
    id: 'contact',
    title: 'Kapcsolat és támogatás',
    icon: 'bi-headset',
    items: [
      {
        id: 'contact-how',
        question: 'Hogyan érhetem el az ügyfélszolgálatot?',
        answer: 'A Támogatás oldalon lévő csatornákon keresztül, vagy a megadott kapcsolati felületen. Írd le röviden a problémát és a fiókneved.'
      },
      {
        id: 'contact-response',
        question: 'Mennyi idő alatt válaszoltok?',
        answer: 'A válaszidő a terheléstől és az előfizetés típusától is függhet. Igyekszünk minél hamarabb reagálni.'
      },
      {
        id: 'contact-data',
        question: 'Milyen adatokat ne küldjek el?',
        answer: 'Jelszót és teljes bankkártya adatokat soha ne küldj. Ha fizetési gond van, elég a tranzakció időpontja és azonosítója (ha van).'
      },
      {
        id: 'contact-bug',
        question: 'Hogyan jelentsek hibát a leghatékonyabban?',
        answer: 'Add meg a lépéseket (1-2-3), a várható vs. tényleges eredményt, és csatolj képernyőképet. Így gyorsabban tudjuk reprodukálni.'
      }
    ]
  }
];

export default function Support() {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState<string>(FAQ_CATEGORIES[0].id);

  const toggleItem = (id: string) => {
    setOpenItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const isOpen = (id: string) => openItems.has(id);

  const currentCategory = FAQ_CATEGORIES.find(c => c.id === activeCategory) || FAQ_CATEGORIES[0];

  return (
    <main className="py-5 mt-5">
      <div className="container py-5">
        <h1 className="mb-4 text-center display-6 fw-bold text-decoration-underline">
          <i className="bi bi-question-circle me-2"></i>
          Gyakran ismételt kérdések
        </h1>

        {/* Kategória szűrők - kapszulák */}
        <div className="faq-filters">
          {FAQ_CATEGORIES.map(category => (
            <button
              key={category.id}
              className={`btn btn-sm btn-action ${activeCategory === category.id ? 'active' : ''}`}
              type="button"
              onClick={() => {
                setActiveCategory(category.id);
                setOpenItems(new Set());
              }}
            >
              {category.icon && <i className={`bi ${category.icon} me-1`}></i>}
              {category.title}
            </button>
          ))}
        </div>

        {/* Aktív kategória kérdései */}
        <section className="faq-category">
          <h2 className="faq-category-title">
            {currentCategory.icon && <i className={`bi ${currentCategory.icon} me-2`}></i>}
            {currentCategory.title}
            <span className="faq-count">{currentCategory.items.length} kérdés</span>
          </h2>

          <div className="faq-list">
            {currentCategory.items.map((item, index) => (
              <article 
                key={item.id} 
                className="faq-item"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <button
                  className={`faq-question ${isOpen(item.id) ? 'open' : ''}`}
                  aria-expanded={isOpen(item.id)}
                  onClick={() => toggleItem(item.id)}
                >
                  <span className="faq-q-text">
                    <span className="faq-number">{index + 1}.</span>
                    {item.question}
                  </span>
                  <i className="bi bi-chevron-down ms-2 faq-caret"></i>
                </button>
                <div
                  className="faq-answer"
                  style={{
                    maxHeight: isOpen(item.id) ? '1000px' : undefined
                  }}
                >
                  <div className="inner">
                    <p>{item.answer}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Segítség panel */}
        <div className="faq-help-panel">
          <div className="faq-help-content">
            <i className="bi bi-envelope-paper"></i>
            <div>
              <h4>Nem találod a választ?</h4>
              <p>Írj nekünk az <a href="mailto:info@konyvkocka.hu">info@konyvkocka.hu</a> címre és segítünk!</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}