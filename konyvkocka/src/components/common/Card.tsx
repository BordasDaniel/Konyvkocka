import React, { useState, useEffect } from 'react';

export interface CardData {
  id: string;
  img: string;
  title: string;
  tags: string[];
  rating: number;
  desc: string;
  trailer?: string;
  episodes?: string[];
  reader?: string;
  type?: 'movie' | 'book' | 'series';
}

interface CardProps {
  count?: number;
  category?: string; // 'latest', 'popular', 'horror', etc.
  onCardClick?: (card: CardData) => void;
  showMoreCard?: boolean; // Ha true, megjelenik a "Továbbiak" kártya
  data?: CardData[]; // Ha átadod, ezt használja a mock/fetch helyett
  gridClass?: string; // Bootstrap grid classes for the card wrapper
}

// Mock data - később API-ból fog jönni
export const mockCards: CardData[] = [
  {
    id: '1',
    img: 'https://upload.wikimedia.org/wikipedia/en/1/18/Inception_OST.jpg',
    title: 'Eredet',
    tags: ['Sci-fi', 'Thriller'],
    rating: 3.2,
    desc: 'Christopher Nolan elmetbending thrillere, a főhős az álmok világában próbál információkat szerezni.',
    trailer: 'https://www.youtube.com/embed/YoHD9XEInc0',
    episodes: ['1: Teljes film'],
    type: 'movie'
  },
  {
    id: '2',
    img: 'https://m.media-amazon.com/images/M/MV5BYzdjMDAxZGItMjI2My00ODA1LTlkNzItOWFjMDU5ZDJlYWY3XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg',
    title: 'Interstellar',
    tags: ['Sci-fi', 'Dráma'],
    rating: 4.3,
    desc: 'Egy csoport asztronauta átutazik egy féreglyukon, hogy új otthont találjon az emberiség számára.',
    trailer: 'https://www.youtube.com/embed/zSWdZVtXT7E',
    episodes: ['1: Teljes film'],
    reader: '/watch',
    type: 'movie'
  },
  {
    id: '3',
    img: 'https://books.google.hu/books/publisher/content?id=B4zqEAAAQBAJ&hl=hu&pg=PA1&img=1&zoom=3&bul=1&sig=ACfU3U0ZEhTqEsyQ00i0Dg2e8n0r7s5xiw&w=1280',
    title: 'A kis herceg',
    tags: ['Gyerek', 'Klasszikus'],
    rating: 2.0,
    desc: 'Antoine de Saint-Exupéry időtlen klasszikusa a barátságról, szeretetről és az élet nagy kérdéseiről.',
    trailer: 'https://www.youtube.com/embed/5rOiW8yX5Z0',
    episodes: ['Olvasás'],
    reader: '/reader',
    type: 'book'
  },
  {
    id: '4',
    img: 'https://images.justwatch.com/poster/176669762/s718/a-gyuruk-ura-a-gyuru-szovetsege.jpg',
    title: 'A Gyűrűk Ura',
    tags: ['Fantasy', 'Kaland'],
    rating: 5.0,
    desc: 'J.R.R. Tolkien fantasy remekműve, amely egy gyűrű elpusztításának epikus kalandját meséli el.',
    trailer: 'https://www.youtube.com/embed/V75dMMIW2B4',
    episodes: ['1: Teljes film'],
    type: 'movie'
  },
  {
    id: '5',
    img: 'https://marvin.bline.hu/product_images/1376/B251773.JPG',
    title: '1984',
    tags: ['Dystopia', 'Sci-fi'],
    rating: 2.1,
    desc: 'George Orwell disztópikus regénye egy totalitárius társadalomról, ahol a Nagy Testvér mindenkit figyel.',
    trailer: '',
    episodes: ['1: Az ébredés', '2: A Nagy Testvér', '3: A tiltott napló', '4: A végső ellenállás'],
    type: 'book'
  },
  {
    id: '6',
    img: 'https://upload.wikimedia.org/wikipedia/en/1/1c/The_Grand_Budapest_Hotel.png',
    title: 'A Grand Budapest Hotel',
    tags: ['Komédia', 'Dráma'],
    rating: 4.0,
    desc: 'Wes Anderson színes és szórakoztató filmje egy legendás concierge és fiatal portás barátságáról.',
    trailer: 'https://www.youtube.com/embed/1Fg5iWmQjwk',
    episodes: ['1: Teljes film'],
    type: 'movie'
  }
];

const Card: React.FC<CardProps> = ({ 
  count = 3, 
  category = 'latest', 
  onCardClick, 
  showMoreCard = true, 
  data,
  gridClass = "col-xl-3 col-lg-4 col-md-6 mb-4"
}) => {
  const [cards, setCards] = useState<CardData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // Ha kapunk adatot propból, azt használjuk
    if (data && data.length) {
      setCards(data.slice(0, count));
      return;
    }
    fetchCards();
  }, [count, category, data]);

  const fetchCards = async () => {
    if (data && data.length) {
      setCards(data.slice(0, count));
      return;
    }
    setLoading(true);
    
    try {
      // TODO: API call when backend is ready
      // const response = await fetch(`/api/cards?count=${count}&category=${category}`);
      // const data = await response.json();
      // setCards(data);

      // Mock data for now
      let filteredCards = [...mockCards];
      
      // Filter by category (később az API fogja kezelni)
      if (category === 'popular') {
        filteredCards = mockCards.filter(c => c.rating >= 4);
      } else if (category === 'latest') {
        filteredCards = mockCards.slice(0, 3);
      }
      
      setCards(filteredCards.slice(0, count));
    } catch (error) {
      console.error('Error fetching cards:', error);
      setCards(mockCards.slice(0, count));
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <i 
          key={i} 
          className={`bi bi-star-fill ${i <= Math.round(rating) ? 'filled' : ''}`}
        ></i>
      );
    }
    return stars;
  };

  const handleCardClick = (card: CardData) => {
    if (onCardClick) {
      onCardClick(card);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Betöltés...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {cards.map((card) => (
        <div key={card.id} className={gridClass}>
          <div className="card">
            <img src={card.img} className="card-img-top" alt={`${card.title} borító`} />
            <div className="card-body">
              <h5 className="card-title">{card.title}</h5>
              <div className="card-meta">
                <div className="tags">
                  {card.tags.map((tag, idx) => (
                    <span key={idx}>{tag}</span>
                  ))}
                </div>
                <div className="card-rating">
                  <div className="card-stars">
                    {renderStars(card.rating)}
                  </div>
                  <div className="rating-num">{card.rating.toFixed(1)}</div>
                </div>
              </div>
              <button 
                className="btn view-btn"
                data-img={card.img}
                data-title={card.title}
                data-tags={card.tags.join(',')}
                data-desc={card.desc}
                data-trailer={card.trailer}
                data-episodes={JSON.stringify(card.episodes)}
                data-reader={card.reader}
                onClick={() => handleCardClick(card)}
              >
                Megtekintés
              </button>
            </div>
          </div>
        </div>
      ))}
      
      {/* "Továbbiak" card */}
        {showMoreCard && (
          <div className={gridClass}>
            <div className="card">
              <img src="/assets/img/carousel.jpg" className="card-img-top card-img-blur" alt="További tartalmak" />
              <div className="card-body">
                <h5 className="card-title">Továbbiak</h5>
                <p className="card-text">Fedezd fel további ajánlatainkat és kategóriáinkat a teljes kínálatért.</p>
                <button className="btn view-btn" onClick={() => window.location.href = '/search'}>
                  Érdekel
                </button>
              </div>
            </div>
          </div>
        )}
    </>
  );
};

export default Card;
