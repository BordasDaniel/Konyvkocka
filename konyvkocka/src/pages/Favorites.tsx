import React, { useMemo, useState } from 'react';
import Card, { mockCards } from '../components/common/Card.tsx';
import type { CardData } from '../components/common/Card.tsx';
import Modal from '../components/common/Modal.tsx';

const Favorites: React.FC = () => {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'book' | 'movie' | 'series'>('all');
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);

  // Mock: later this will fetch actual favorites from API
  const favoriteItems = mockCards.slice(0, 8); // simulate some favorites

  const results = useMemo(() => {
    let filtered = favoriteItems;

    // Filter by type
    if (activeFilter !== 'all') {
      filtered = filtered.filter(_item => {
        // Mock type detection based on tags or other properties
        // In real implementation, each card would have a 'type' field
        return true; // placeholder
      });
    }

    // Filter by search query
    const q = query.trim().toLowerCase();
    if (q) {
      filtered = filtered.filter((c) => {
        const haystack = `${c.title} ${c.desc} ${(c.tags || []).join(' ')}`.toLowerCase();
        return haystack.includes(q);
      });
    }

    return filtered;
  }, [query, activeFilter, favoriteItems]);

  return (
    <div className="search-page favorites-page">
      <section className="search-hero py-5">
        <div className="container p-5">
          {/* Title and description */}
          <div className="row justify-content-center mb-3">
            <div className="col-lg-10 col-md-12 text-center">
              <h1 className="text-uppercase fw-bold" style={{ color: 'var(--h1Text)' }}>
                <i className="bi bi-heart-fill me-3" style={{ color: 'var(--secondary)' }}></i>
                Kedvencek
              </h1>
              <p className="text-light mb-0">
                Az általad megjelölt kedvenc könyvek, filmek és sorozatok gyűjteménye. Könnyen megtalálod őket itt.
              </p>
            </div>
          </div>

          {/* Filter buttons */}
          <div className="row justify-content-center mb-4">
            <div className="col-lg-8 col-md-10">
              <div className="d-flex justify-content-center gap-2 flex-wrap">
                <button
                  className={`btn btn-sm ${activeFilter === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setActiveFilter('all')}
                  style={{
                    borderRadius: '999px',
                    padding: '0.4rem 1rem',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    fontSize: '0.85rem'
                  }}
                >
                  <i className="bi bi-grid-fill me-1"></i>Összes
                </button>
                <button
                  className={`btn btn-sm ${activeFilter === 'book' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setActiveFilter('book')}
                  style={{
                    borderRadius: '999px',
                    padding: '0.4rem 1rem',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    fontSize: '0.85rem'
                  }}
                >
                  <i className="bi bi-book-fill me-1"></i>Könyvek
                </button>
                <button
                  className={`btn btn-sm ${activeFilter === 'movie' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setActiveFilter('movie')}
                  style={{
                    borderRadius: '999px',
                    padding: '0.4rem 1rem',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    fontSize: '0.85rem'
                  }}
                >
                  <i className="bi bi-camera-reels-fill me-1"></i>Filmek
                </button>
                <button
                  className={`btn btn-sm ${activeFilter === 'series' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setActiveFilter('series')}
                  style={{
                    borderRadius: '999px',
                    padding: '0.4rem 1rem',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    fontSize: '0.85rem'
                  }}
                >
                  <i className="bi bi-film me-1"></i>Sorozatok
                </button>
              </div>
            </div>
          </div>

          {/* Search bar */}
          <div className="row justify-content-center">
            <div className="col-lg-8 col-md-10">
              <input
                type="search"
                className="form-control search-input rounded-pill"
                placeholder="Keresés a kedvencek között..."
                aria-label="Keresés"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{
                  paddingLeft: '2rem',
                  marginTop: '0'
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="search-results my-2">
        <div className="container-fluid px-4">
          <div className="results-grid">
            {results.length === 0 ? (
              <div className="empty-state text-center">
                <div>
                  <i className="bi bi-heart" style={{ fontSize: '3rem', color: 'var(--secondary)', opacity: 0.5, marginBottom: '1rem' }}></i>
                  <p className="empty-title mb-2">
                    {favoriteItems.length === 0 
                      ? 'Még nincsenek kedvenceid.' 
                      : 'Nincsenek találatok a keresési feltételeknek megfelelően.'}
                  </p>
                  <p className="empty-subtitle mb-0">
                    {favoriteItems.length === 0
                      ? 'Jelölj meg tartalmakat kedvencként, hogy itt megjelenjenek.'
                      : 'Próbálj meg más keresési kifejezést vagy szűrőt.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5">
                <Card
                  data={results}
                  count={results.length}
                  category="favorites"
                  showMoreCard={false}
                  onCardClick={(c) => setSelectedCard(c)}
                  gridClass="col mb-4"
                />
              </div>
            )}
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

export default Favorites;
