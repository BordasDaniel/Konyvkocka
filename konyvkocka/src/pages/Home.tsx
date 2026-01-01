import React, { useState } from 'react';
import Carousel from '../components/common/Carousel';
import Card from '../components/common/Card.tsx';
import type { CardData } from '../components/common/Card.tsx';
import Modal from '../components/common/Modal.tsx';

const Home: React.FC = () => {
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);

  const handleCardClick = (card: CardData) => {
    setSelectedCard(card);
  };

  const handleSlideClick = (slide: any) => {
    setSelectedCard({
      ...slide,
      tags: slide.tags || []
    });
  };

  return (
    <div className="home-page">
      {/* Hero Carousel */}
      <Carousel onSlideClick={handleSlideClick} />

      {/* Friss tartalmak */}
      <section className="lower-cards">
        <div className="container">
          <h3 className="mb-4">Friss tartalmak</h3>
          <div className="row">
            <Card 
              count={3} 
              category="latest" 
              onCardClick={handleCardClick}
            />
          </div>
        </div>
        <hr />
      </section>

      {/* Felkapottak */}
      <section className="lower-cards">
        <div className="container">
          <h3 className="mb-4">Felkapottak</h3>
          <div className="row">
            <Card 
              count={3} 
              category="popular" 
              onCardClick={handleCardClick}
            />
          </div>
        </div>
      </section>

      <Modal
        open={!!selectedCard}
        card={selectedCard || undefined}
        onClose={() => setSelectedCard(null)}
      />
    </div>
  );
};

export default Home;
