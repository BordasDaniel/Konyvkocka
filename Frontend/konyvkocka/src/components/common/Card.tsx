import React, { useState } from 'react';
import showMoreCardImage from '../../assets/img/carousel.jpg';
import { CONTENT_FALLBACK_IMAGE } from '../../services/api';

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
  category?: string;
  onCardClick?: (card: CardData) => void;
  showMoreCard?: boolean;
  data?: CardData[];
  gridClass?: string;
}

const Card: React.FC<CardProps> = ({ 
  count = 3, 
  category = 'latest', 
  onCardClick, 
  showMoreCard = true, 
  data,
  gridClass = "col-xl-3 col-lg-4 col-md-6 mb-4"
}) => {
  void category;
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const cards = data?.slice(0, count) ?? [];

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

  const handleImageLoad = (cardId: string) => {
    setLoadedImages((prev) => ({ ...prev, [cardId]: true }));
  };

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>, cardId: string) => {
    const img = event.currentTarget;
    if (img.dataset.fallbackApplied === 'true') return;
    img.dataset.fallbackApplied = 'true';
    img.src = CONTENT_FALLBACK_IMAGE;
    setLoadedImages((prev) => ({ ...prev, [cardId]: true }));
  };

  return (
    <>
      {cards.map((card) => (
        <div key={card.id} className={gridClass}>
          <div className="card">
            <img
              src={card.img}
              className={`card-img-top ${loadedImages[card.id] ? 'is-loaded' : 'is-loading'}`}
              alt={`${card.title} borító`}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              onLoad={() => handleImageLoad(card.id)}
              onError={(event) => handleImageError(event, card.id)}
            />
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
              <img src={showMoreCardImage} className="card-img-top card-img-blur" alt="További tartalmak" />
              <div className="card-body">
                <h5 className="card-title">Továbbiak</h5>
                <p className="card-text">Fedezd fel további ajánlatainkat és kategóriáinkat a teljes kínálatért.</p>
                <button className="btn view-btn" onClick={() => window.location.href = '#/kereses'}>
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
