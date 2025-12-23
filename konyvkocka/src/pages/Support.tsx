import { useState } from 'react';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    id: 1,
    question: 'Mire jó az előfizetés?',
    answer: 'Az előfizetésünk több előnyt biztosít: hirdetésmentes lejátszás, korlátlan időtartamú hozzáférés a tartalmakhoz, HD/4K opciók, OST (filmzenék) és zenei keresés, YouTube Music integráció, offline letöltés filmekhez és könyvekhez, valamint elsőbbségi ügyfélszolgálat.'
  },
  {
    id: 2,
    question: 'Hogyan működik az OST (filmzene) keresés és a YouTube Music integráció?',
    answer: 'A keresőnk lehetővé teszi, hogy filmekhez tartozó soundtrackeket (OST) és zenéket találj. A találatokat előnézetben meghallgathatod, és ha YouTube Music integrációd be van állítva, közvetlenül hozzáadhatod őket a lejátszási listáidhoz vagy megnyithatod YouTube Music-ban.'
  },
  {
    id: 3,
    question: 'Hogyan vásárolhatok előfizetést?',
    answer: 'Előfizetés vásárlásához hozz létre fiókot, lépj be, majd a Profil / Előfizetés menüpont alatt válaszd ki a csomagot. Többféle csomag közül választhatsz (alap, prémium), fizethetsz bankkártyával vagy PayPallal. A fizetés biztonságos, és a számlázás a kiválasztott ciklus szerint történik.'
  },
  {
    id: 4,
    question: 'Van-e ingyenes próbaidőszak?',
    answer: 'Időszakos promóciók keretében gyakran kínálunk 7 vagy 14 napos ingyenes próbaidőszakot. A próbaidőszak alatt teljes funkcionalitás elérhető. A próba automatikusan fizetős előfizetésre vált, ha nem mondod le a próba lejárta előtt.'
  },
  {
    id: 5,
    question: 'Hogyan törölhetem vagy módosíthatom az előfizetésem?',
    answer: 'Az előfizetés módosítása vagy lemondása a Profil → Előfizetés menüpontban érhető el. A lemondás a következő számlázási ciklustól lép érvénybe; használt napokra visszatérítés általában nem jár. Ha segítségre van szükséged, fordulj ügyfélszolgálatunkhoz.'
  }
];

export default function Support() {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const toggleItem = (id: number) => {
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

  const isOpen = (id: number) => openItems.has(id);

  return (
    <main className="py-5 mt-5">
      <div className="container py-5">
        <h1 className="mb-4 text-center display-6 fw-bold text-decoration-underline">
          Gyakran ismételt kérdések
        </h1>
        <section className="faq-list">
          {FAQ_DATA.map(item => (
            <article key={item.id} className="faq-item">
              <button
                className={`faq-question ${isOpen(item.id) ? 'open' : ''}`}
                aria-expanded={isOpen(item.id)}
                onClick={() => toggleItem(item.id)}
              >
                <span>{item.question}</span>
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
        </section>
      </div>
    </main>
  );
}