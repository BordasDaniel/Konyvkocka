import React, { useMemo, useState, useEffect } from 'react';
import Card from '../components/common/Card.tsx';
import type { CardData } from '../components/common/Card.tsx';
import Modal from '../components/common/Modal.tsx';
import {
  ApiHttpError,
  buildContentKey,
  getContentAgeRatings,
  getContentDetail,
  getContentTags,
  getLibrary,
  parseContentKey,
  toContentImageSrc,
  type ContentAgeRatingResponse,
  type ContentDetailResponse,
  type ContentTagResponse,
  type LibraryItemResponse,
} from '../services/api';

const STATUS_OPTIONS = [
  { value: 'WATCHING', label: 'Olvasás/Nézés alatt' },
  { value: 'COMPLETED', label: 'Befejezve' },
  { value: 'PAUSED', label: 'Szünetel' },
  { value: 'DROPPED', label: 'Félbehagyva' },
  { value: 'PLANNED', label: 'Tervezett' },
  { value: 'ARCHIVED', label: 'Archivált' },
] as const;

const CONTENT_TYPE_OPTIONS = [
  { value: 'book', label: 'Könyv' },
  { value: 'audiobook', label: 'Audiobook' },
  { value: 'ebook', label: 'eBook' },
  { value: 'movie', label: 'Film' },
  { value: 'series', label: 'Sorozat' },
] as const;

const SORT_OPTIONS = [
  { value: 'lastAdded', label: 'Legutóbb hozzáadott' },
  { value: 'completedDate', label: 'Befejezési dátum' },
  { value: 'rating', label: 'Értékelés' },
] as const;

type SortByValue = (typeof SORT_OPTIONS)[number]['value'];
type FavoriteFilterValue = 'all' | 'true' | 'false';

interface LibraryFilters {
  statuses: string[];
  ageRatingIds: number[];
  tagIds: number[];
  contentTypes: string[];
  sortBy: SortByValue;
  favorite: FavoriteFilterValue;
}

const createDefaultFilters = (): LibraryFilters => ({
  statuses: [],
  ageRatingIds: [],
  tagIds: [],
  contentTypes: [],
  sortBy: 'lastAdded',
  favorite: 'all',
});

const cloneFilters = (filters: LibraryFilters): LibraryFilters => ({
  statuses: [...filters.statuses],
  ageRatingIds: [...filters.ageRatingIds],
  tagIds: [...filters.tagIds],
  contentTypes: [...filters.contentTypes],
  sortBy: filters.sortBy,
  favorite: filters.favorite,
});

const toggleStringValue = (items: string[], value: string): string[] =>
  items.includes(value) ? items.filter((item) => item !== value) : [...items, value];

const toggleNumberValue = (items: number[], value: number): number[] =>
  items.includes(value) ? items.filter((item) => item !== value) : [...items, value];

const mapLibraryItemToCard = (item: LibraryItemResponse): CardData => ({
  id: buildContentKey(item.contentType, item.id),
  img: toContentImageSrc(item.cover),
  title: item.title,
  tags: (item.tags ?? []).slice(0, 2),
  rating: Number(item.userRating ?? item.rating ?? 0),
  desc: '',
  type: item.contentType === 'MOVIE' ? 'movie' : item.contentType === 'SERIES' ? 'series' : 'book',
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

// "Könyvtáram" oldal a keresés oldal felépítésével
const Library: React.FC = () => {
  const [query, setQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<LibraryFilters>(() => createDefaultFilters());
  const [draftFilters, setDraftFilters] = useState<LibraryFilters>(() => createDefaultFilters());
  const [ageRatingOptions, setAgeRatingOptions] = useState<ContentAgeRatingResponse[]>([]);
  const [tagOptions, setTagOptions] = useState<ContentTagResponse[]>([]);
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);
  const [libraryItems, setLibraryItems] = useState<CardData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const normalizedQuery = query.trim();

  const statusParam = useMemo(
    () => (appliedFilters.statuses.length > 0 ? appliedFilters.statuses.join(',') : undefined),
    [appliedFilters.statuses],
  );

  const ageRatingParam = useMemo(
    () => (appliedFilters.ageRatingIds.length > 0 ? appliedFilters.ageRatingIds.join(',') : undefined),
    [appliedFilters.ageRatingIds],
  );

  const tagsParam = useMemo(
    () => (appliedFilters.tagIds.length > 0 ? appliedFilters.tagIds.join(',') : undefined),
    [appliedFilters.tagIds],
  );

  const contentTypeParam = useMemo(
    () => (appliedFilters.contentTypes.length > 0 ? appliedFilters.contentTypes.join(',') : undefined),
    [appliedFilters.contentTypes],
  );

  const favoriteParam = useMemo(
    () =>
      appliedFilters.favorite === 'all'
        ? undefined
        : appliedFilters.favorite === 'true',
    [appliedFilters.favorite],
  );

  useEffect(() => {
    let isMounted = true;

    const loadFilterOptions = async () => {
      try {
        const [ageRatingsResponse, tagsResponse] = await Promise.all([
          getContentAgeRatings(),
          getContentTags(),
        ]);

        if (!isMounted) return;

        setAgeRatingOptions(ageRatingsResponse);
        setTagOptions(tagsResponse);
      } catch (filterLoadError) {
        console.error('Library filter options loading failed:', filterLoadError);
      }
    };

    void loadFilterOptions();

    return () => {
      isMounted = false;
    };
  }, []);

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
        const response = await getLibrary({
          q: normalizedQuery || undefined,
          status: statusParam,
          ageRating: ageRatingParam,
          tags: tagsParam,
          contentType: contentTypeParam,
          sortBy: appliedFilters.sortBy,
          favorite: favoriteParam,
        });
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
  }, [normalizedQuery, statusParam, ageRatingParam, tagsParam, contentTypeParam, appliedFilters.sortBy, favoriteParam]);

  const totalPages = Math.max(1, Math.ceil(libraryItems.length / pageSize));
  const pagedResults = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return libraryItems.slice(start, start + pageSize);
  }, [libraryItems, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [normalizedQuery, statusParam, ageRatingParam, tagsParam, contentTypeParam, appliedFilters.sortBy, favoriteParam]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const toggleFilter = () => {
    setFilterOpen((isOpen) => {
      if (!isOpen) {
        setDraftFilters(cloneFilters(appliedFilters));
      }
      return !isOpen;
    });
  };

  const closeFilter = () => {
    setDraftFilters(cloneFilters(appliedFilters));
    setFilterOpen(false);
  };

  const applyFilters = () => {
    setAppliedFilters(cloneFilters(draftFilters));
    setFilterOpen(false);
  };

  const resetFilters = () => {
    const defaults = createDefaultFilters();
    setAppliedFilters(defaults);
    setDraftFilters(cloneFilters(defaults));
    setCurrentPage(1);
    setFilterOpen(false);
  };

  const toggleDraftStatus = (value: string) => {
    setDraftFilters((prev) => ({
      ...prev,
      statuses: toggleStringValue(prev.statuses, value),
    }));
  };

  const toggleDraftContentType = (value: string) => {
    setDraftFilters((prev) => ({
      ...prev,
      contentTypes: toggleStringValue(prev.contentTypes, value),
    }));
  };

  const toggleDraftAgeRating = (value: number) => {
    setDraftFilters((prev) => ({
      ...prev,
      ageRatingIds: toggleNumberValue(prev.ageRatingIds, value),
    }));
  };

  const toggleDraftTag = (value: number) => {
    setDraftFilters((prev) => ({
      ...prev,
      tagIds: toggleNumberValue(prev.tagIds, value),
    }));
  };

  const setDraftSortBy = (value: SortByValue) => {
    setDraftFilters((prev) => ({
      ...prev,
      sortBy: value,
    }));
  };

  const setDraftFavorite = (value: FavoriteFilterValue) => {
    setDraftFilters((prev) => ({
      ...prev,
      favorite: value,
    }));
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
                        {STATUS_OPTIONS.map((option, idx) => (
                          <div className="form-check" key={option.value}>
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`status_${idx}`}
                              checked={draftFilters.statuses.includes(option.value)}
                              onChange={() => toggleDraftStatus(option.value)}
                            />
                            <label className="form-check-label" htmlFor={`status_${idx}`}>{option.label}</label>
                          </div>
                        ))}
                      </div>

                      <div className="filter-group">
                        <h6>Típusok</h6>
                        {CONTENT_TYPE_OPTIONS.map((option, idx) => (
                          <div className="form-check" key={option.value}>
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`type_${idx}`}
                              checked={draftFilters.contentTypes.includes(option.value)}
                              onChange={() => toggleDraftContentType(option.value)}
                            />
                            <label className="form-check-label" htmlFor={`type_${idx}`}>{option.label}</label>
                          </div>
                        ))}
                      </div>

                      <div className="filter-group">
                        <h6>Korhatárok</h6>
                        {ageRatingOptions.map((option, idx) => (
                          <div className="form-check" key={option.id}>
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`ageRating_${idx}`}
                              checked={draftFilters.ageRatingIds.includes(option.id)}
                              onChange={() => toggleDraftAgeRating(option.id)}
                            />
                            <label className="form-check-label" htmlFor={`ageRating_${idx}`}>{option.name}</label>
                          </div>
                        ))}
                      </div>

                      <div className="filter-group filter-genres">
                        <h6>Címkék</h6>
                        <div className="genres-columns">
                          {tagOptions.map((option, idx) => (
                            <div className="form-check" key={option.id}>
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={`tag_${idx}`}
                                checked={draftFilters.tagIds.includes(option.id)}
                                onChange={() => toggleDraftTag(option.id)}
                              />
                              <label className="form-check-label" htmlFor={`tag_${idx}`}>{option.name}</label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="filter-group">
                        <h6>Rendezés</h6>
                        {SORT_OPTIONS.map((option, idx) => (
                          <div className="form-check" key={option.value}>
                            <input
                              className="form-check-input"
                              type="radio"
                              name="library-sort"
                              id={`sort_${idx}`}
                              checked={draftFilters.sortBy === option.value}
                              onChange={() => setDraftSortBy(option.value)}
                            />
                            <label className="form-check-label" htmlFor={`sort_${idx}`}>{option.label}</label>
                          </div>
                        ))}
                      </div>

                      <div className="filter-group">
                        <h6>Kedvencek</h6>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="library-favorite"
                            id="favorite_all"
                            checked={draftFilters.favorite === 'all'}
                            onChange={() => setDraftFavorite('all')}
                          />
                          <label className="form-check-label" htmlFor="favorite_all">Mind</label>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="library-favorite"
                            id="favorite_true"
                            checked={draftFilters.favorite === 'true'}
                            onChange={() => setDraftFavorite('true')}
                          />
                          <label className="form-check-label" htmlFor="favorite_true">Csak kedvencek</label>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="library-favorite"
                            id="favorite_false"
                            checked={draftFilters.favorite === 'false'}
                            onChange={() => setDraftFavorite('false')}
                          />
                          <label className="form-check-label" htmlFor="favorite_false">Nem kedvencek</label>
                        </div>
                      </div>
                    </div>

                    <div className="filter-panel-footer px-3 py-2">
                      <button id="filterApply" className="btn btn-primary btn-sm" onClick={applyFilters}>Alkalmaz</button>
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
