import React, { useEffect, useState } from 'react';
import Carousel from '../components/common/Carousel';
import Card from '../components/common/Card.tsx';
import type { CardData } from '../components/common/Card.tsx';
import Modal from '../components/common/Modal.tsx';
import {
  buildContentKey,
  getContentDetail,
  getHomePage,
  parseContentKey,
  toContentImageSrc,
  type ContentDetailResponse,
  type HomeCardResponse,
  type HomeCarouselResponse,
} from '../services/api';

const mapHomeCardToUi = (item: HomeCardResponse): CardData => ({
  id: buildContentKey(item.type, item.id),
  img: toContentImageSrc(item.img),
  title: item.title,
  tags: item.tags ?? [],
  rating: Number(item.rating ?? 0),
  desc: '',
  type: item.type === 'movie' ? 'movie' : item.type === 'series' ? 'series' : 'book',
});

const mapHomeCarouselToUi = (item: HomeCarouselResponse) => ({
  id: buildContentKey(item.type, item.id),
  img: toContentImageSrc(item.img),
  title: item.title,
  tags: item.tags ?? [],
  desc: item.description,
  type: item.type,
});

const mapDetailToCard = (detail: ContentDetailResponse): CardData => ({
  id: buildContentKey(detail.type, detail.id),
  img: toContentImageSrc(detail.img),
  title: detail.title,
  ageRating: detail.ageRating
    ? { name: detail.ageRating.name, minAge: detail.ageRating.minAge }
    : undefined,
  tags: detail.tags ?? [],
  rating: Number(detail.rating ?? 0),
  desc: detail.description,
  trailer: detail.trailerUrl ?? undefined,
  episodes:
    detail.episodes?.map((episode) => `S${episode.seasonNum}E${episode.episodeNum} - ${episode.title}`) ??
    (detail.watchUrl ? ['Megnyitás'] : []),
  reader: detail.type === 'movie' || detail.type === 'series' ? '/nezes' : '/olvaso',
  type: detail.type === 'movie' ? 'movie' : detail.type === 'series' ? 'series' : 'book',
});

const Home: React.FC = () => {
  const [latestCards, setLatestCards] = useState<CardData[]>([]);
  const [hotCards, setHotCards] = useState<CardData[]>([]);
  const [carouselSlides, setCarouselSlides] = useState<Array<{ id: string; img: string; title: string; tags: string[]; desc: string }>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);

  useEffect(() => {
    const loadHomeData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const home = await getHomePage();
        setLatestCards(home.fresh.map(mapHomeCardToUi));
        setHotCards(home.hot.map(mapHomeCardToUi));
        setCarouselSlides(home.carousel.map(mapHomeCarouselToUi));
      } catch (loadError) {
        console.error('Failed to load home content:', loadError);
        setError('A főoldali tartalmak betöltése sikertelen.');
      } finally {
        setIsLoading(false);
      }
    };

    void loadHomeData();
  }, []);

  const openDetails = async (contentKey: string, fallbackCard: CardData) => {
    const parsed = parseContentKey(contentKey);

    if (!parsed) {
      setSelectedCard({
        ...fallbackCard,
        desc: fallbackCard.desc || 'A részletek nem tölthetők be.',
      });
      return;
    }

    setSelectedCard({
      ...fallbackCard,
      desc: fallbackCard.desc || 'Részletek betöltése...',
    });

    try {
      const details = await getContentDetail(parsed.type, parsed.id);
      setSelectedCard(mapDetailToCard(details));
    } catch (detailError) {
      console.error('Failed to load content details:', detailError);
      setSelectedCard({
        ...fallbackCard,
        desc: fallbackCard.desc || 'A részletek betöltése sikertelen.',
      });
    }
  };

  const handleCardClick = (card: CardData) => {
    void openDetails(card.id, card);
  };

  const handleSlideClick = (slide: { id: string; title: string; img: string; tags?: string[]; desc?: string }) => {
    const fallbackCard: CardData = {
      id: slide.id,
      title: slide.title,
      img: slide.img,
      tags: slide.tags ?? [],
      desc: slide.desc ?? '',
      rating: 0,
      type: parseContentKey(slide.id)?.type ?? 'movie',
    };

    void openDetails(slide.id, fallbackCard);
  };

  return (
    <div className="home-page">
      {/* Hero Carousel */}
      <Carousel slides={carouselSlides} onSlideClick={handleSlideClick} />

      {error && (
        <div className="container pt-4">
          <div className="alert alert-warning mb-0" role="alert">
            {error}
          </div>
        </div>
      )}

      {/* Friss tartalmak */}
      <section className="lower-cards">
        <div className="container">
          <h3 className="mb-4">Friss tartalmak</h3>
          <div className="row">
            <Card
              data={latestCards}
              count={latestCards.length}
              category="latest"
              onCardClick={handleCardClick}
              showMoreCard={latestCards.length > 0 && !isLoading}
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
              data={hotCards}
              count={hotCards.length}
              category="popular"
              onCardClick={handleCardClick}
              showMoreCard={hotCards.length > 0 && !isLoading}
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
