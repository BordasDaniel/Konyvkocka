import React, { useMemo, useState, useEffect } from 'react';
import Card from '../components/common/Card.tsx';
import type { CardData } from '../components/common/Card.tsx';
import Modal from '../components/common/Modal.tsx';
import {
  ApiHttpError,
  buildContentKey,
  getContentDetail,
  getLibrary,
  parseContentKey,
  toContentImageSrc,
  type ContentDetailResponse,
  type LibraryItemResponse,
} from '../services/api';

const mapLibraryItemToCard = (item: LibraryItemResponse): CardData => ({
  id: buildContentKey(item.contentType, item.id),
  img: toContentImageSrc(item.cover),
  title: item.title,
  tags: item.tags ?? [],
  rating: Number(item.userRating ?? item.rating ?? 0),
  desc: '',
  type: item.contentType === 'MOVIE' ? 'movie' : item.contentType === 'SERIES' ? 'series' : 'book',
});

const mapDetailToCard = (detail: ContentDetailResponse): CardData => ({
  id: buildContentKey(detail.type, detail.id),
  img: toContentImageSrc(detail.img),
  title: detail.title,
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

// "Könyvtáram" oldal a keresés oldal felépítésével
const Library: React.FC = () => {
  const [query, setQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);
  const [libraryItems, setLibraryItems] = useState<CardData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    if (filterOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [filterOpen]);

  useEffect(() => {
    let isMounted = true;

    const loadLibrary = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getLibrary({ q: query.trim() || undefined });
        if (!isMounted) return;
        setLibraryItems(response.results.map(mapLibraryItemToCard));
      } catch (loadError) {
        if (!isMounted) return;

        console.error('Failed to load library:', loadError);
        if (loadError instanceof ApiHttpError && loadError.status === 401) {
          setError('A könyvtár megtekintéséhez be kell jelentkezned.');
        } else {
          setError('A könyvtár betöltése sikertelen.');
        }
        setLibraryItems([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void loadLibrary();

    return () => {
      isMounted = false;
    };
  }, [query]);

  const totalPages = Math.max(1, Math.ceil(libraryItems.length / pageSize));
  const pagedResults = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return libraryItems.slice(start, start + pageSize);
  }, [libraryItems, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const toggleFilter = () => setFilterOpen((v) => !v);
  const closeFilter = () => setFilterOpen(false);
  const resetFilters = () => {
    // TODO: ide kerül majd a valós szűrés
    closeFilter();
  };

  const handleCardClick = async (card: CardData) => {
    const parsed = parseContentKey(card.id);
    if (!parsed) {
      setSelectedCard(card);
      return;
    }

    setSelectedCard({ ...card, desc: 'Részletek betöltése...' });

    try {
      const details = await getContentDetail(parsed.type, parsed.id);
      setSelectedCard(mapDetailToCard(details));
    } catch (detailError) {
      console.error('Detail load failed:', detailError);
      setSelectedCard({ ...card, desc: card.desc || 'A részletek betöltése sikertelen.' });
    }
  };

  const jumpToTopNow = () => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    const scrollingRoot = document.scrollingElement as HTMLElement | null;
    if (scrollingRoot) scrollingRoot.scrollTop = 0;
  };

  const changePage = (page: number) => {
    jumpToTopNow();
    setCurrentPage(Math.min(totalPages, Math.max(1, page)));
  };

  const paginationRange = useMemo(() => {
    const delta = 2;
    const start = Math.max(1, currentPage - delta);
    const end = Math.min(totalPages, currentPage + delta);
    return Array.from({ length: end - start + 1 }, (_, idx) => start + idx);
  }, [currentPage, totalPages]);

  return (
    <div className="search-page library-page"> {/* reuse search layout styling with minor tweaks */}
      <div id="filterBackdrop" className={`filter-backdrop ${filterOpen ? 'active' : ''}`} onClick={closeFilter}></div>

      <section className="search-hero py-5">
        <div className="container pt-5">
          <div className="row justify-content-center mb-3">
            <div className="col-lg-8 col-md-10 text-center">
              <h1 className="text-uppercase fw-bold" style={{ color: 'var(--h1Text)' }}>Könyvtáram</h1>
              <p className="text-light mb-0">Minden könyved, filmed és sorozatod egy helyen. Keresés, szűrés, gyors elérés.</p>
            </div>
          </div>

          <div className="row justify-content-center">
            <div className="col-lg-8 col-md-10">
              <div className="search-wrap position-relative">
                <button
                  id="filterToggle"
                  className="btn-filter position-absolute"
                  aria-expanded={filterOpen}
                  aria-controls="filterPanel"
                  aria-label="Szűrők megnyitása"
                  onClick={toggleFilter}
                >
                  <i className="bi bi-funnel"></i>
                </button>

                <div
                  id="filterPanel"
                  className={`filter-panel ${filterOpen ? '' : 'd-none'}`}
                  role="dialog"
                  aria-modal="false"
                  aria-hidden={!filterOpen}
                >
                  <div className="filter-panel-header d-flex justify-content-between align-items-center px-3 py-2">
                    <h5 className="m-0">Szűrők</h5>
                    <button id="filterClose" className="filter-close btn-close" aria-label="Bezár" onClick={closeFilter}></button>
                  </div>
                  <div className="filter-inner p-3">
                    <div className="filter-grid">
                      <div className="filter-group">
                        <h6>Státusz</h6>
                        {['Olvasás/Nézés alatt', 'Befejezve', 'Szünetel', 'Félbehagyva', 'Tervezett', 'Archivált'].map((label, idx) => (
                          <div className="form-check" key={idx}>
                            <input className="form-check-input" type="checkbox" id={`status_${idx}`} />
                            <label className="form-check-label" htmlFor={`status_${idx}`}>{label}</label>
                          </div>
                        ))}
                      </div>

                      <div className="filter-group">
                        <h6>Típusok</h6>
                        {['Könyv', 'Film', 'Sorozat', 'Audiobook', 'eBook'].map((label, idx) => (
                          <div className="form-check" key={idx}>
                            <input className="form-check-input" type="checkbox" id={`type_${idx}`} />
                            <label className="form-check-label" htmlFor={`type_${idx}`}>{label}</label>
                          </div>
                        ))}
                      </div>

                      <div className="filter-group filter-genres">
                        <h6>Műfajok</h6>
                        <div className="genres-columns">
                          {['Akció','Kaland','Krimi','Dráma','Vígjáték','Romantikus','Sci-fi','Fantasy','Horror','Thriller','Családi','Történelmi','Életrajzi','Dokumentum','Mese'].map((label, idx) => (
                            <div className="form-check" key={idx}>
                              <input className="form-check-input" type="checkbox" id={`genre_${idx}`} />
                              <label className="form-check-label" htmlFor={`genre_${idx}`}>{label}</label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="filter-group">
                        <h6>Rendezés</h6>
                        {['Legutóbb hozzáadott', 'Befejezési dátum', 'Értékelés', 'Időtartam'].map((label, idx) => (
                          <div className="form-check" key={idx}>
                            <input className="form-check-input" type="checkbox" id={`sort_${idx}`} />
                            <label className="form-check-label" htmlFor={`sort_${idx}`}>{label}</label>
                          </div>
                        ))}
                      </div>

                      <div className="filter-group">
                        <h6>Formátum / Jelölők</h6>
                        {['Felolvasott', 'Feliratos', 'Eredeti nyelv', 'Offline elérhető', 'Kedvenc'].map((label, idx) => (
                          <div className="form-check" key={idx}>
                            <input className="form-check-input" type="checkbox" id={`flag_${idx}`} />
                            <label className="form-check-label" htmlFor={`flag_${idx}`}>{label}</label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="filter-panel-footer px-3 py-2">
                      <button id="filterApply" className="btn btn-primary btn-sm" onClick={closeFilter}>Alkalmaz</button>
                      <button id="filterReset" className="btn btn-secondary btn-sm reset" onClick={resetFilters}>Alaphelyzet</button>
                    </div>
                  </div>
                </div>

                <input
                  type="search"
                  className="form-control search-input rounded-pill"
                  placeholder="Keresés a könyvtárban..."
                  aria-label="Keresés"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="search-results my-2">
        <div className="container-fluid px-4">
          <div className="results-grid">
            {isLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Betöltés...</span>
                </div>
              </div>
            ) : error ? (
              <div className="alert alert-warning" role="alert">
                {error}
              </div>
            ) : libraryItems.length === 0 ? (
              <div className="empty-state text-center">
                <div>
                  <p className="empty-title mb-2">Nincsenek találatok a könyvtárban.</p>
                  <p className="empty-subtitle mb-0">Adj hozzá tartalmat vagy kezdj keresni.</p>
                </div>
              </div>
            ) : (
              <>
                <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5">
                  <Card
                    data={pagedResults}
                    count={pagedResults.length}
                    category="library"
                    showMoreCard={false}
                    onCardClick={handleCardClick}
                    gridClass="col mb-4"
                  />
                </div>

                {totalPages > 1 && (
                  <nav className="kk-pagination-wrap" aria-label="Könyvtár találatok lapozása">
                    <ul className="pagination kk-pagination justify-content-center mb-0">
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => changePage(currentPage - 1)}>Előző</button>
                      </li>

                      {paginationRange.map((page) => (
                        <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                          <button className="page-link" onClick={() => changePage(page)}>{page}</button>
                        </li>
                      ))}

                      <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => changePage(currentPage + 1)}>Következő</button>
                      </li>
                    </ul>
                  </nav>
                )}
              </>
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

export default Library;
