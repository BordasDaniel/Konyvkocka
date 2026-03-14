import React, { useMemo, useState, useEffect } from 'react';
import Card, { mockCards } from '../components/common/Card.tsx';
import type { CardData } from '../components/common/Card.tsx';
import Modal from '../components/common/Modal.tsx';

// "Könyvtáram" oldal a keresés oldal felépítésével
const Library: React.FC = () => {
  const [query, setQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);
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

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return mockCards;
    return mockCards.filter((c) => c.title.toLowerCase().includes(q));
  }, [query]);

  const totalPages = Math.max(1, Math.ceil(results.length / pageSize));
  const pagedResults = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return results.slice(start, start + pageSize);
  }, [results, currentPage]);

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
            {results.length === 0 ? (
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
                    onCardClick={(c) => setSelectedCard(c)}
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
