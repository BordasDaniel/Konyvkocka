import { useEffect, useMemo, useRef, useState } from 'react';
import NewsArticle, { type NewsArticleData } from '../components/features/NewsArticle';
import { getNews } from '../services/api';

type NewsFilter = 'all' | 'update' | 'feature' | 'info' | 'event';
type NewsArticleType = Exclude<NewsFilter, 'all'>;

// Alapértelmezett cikkek (fallback, amíg nincs adatbázis)
const DEFAULT_ARTICLES: NewsArticleData[] = [
  {
    id: 1,
    type: 'event',
    title: 'KönyvKocka 1.0 Launch Esemény - Csatlakozz hozzánk!',
    date: '2025.11.05.',
    tags: 'Esemény',
    excerpt: 'Ünnepeld velünk a KönyvKocka 1.0 megjelenését egy különleges online eseményen! Bemutatjuk az új funkciókat, és exkluzív kedvezményeket kínálunk.',
    link: '/events',
    linkText: 'További információ'
  },
  {
    id: 2,
    type: 'feature',
    title: 'Új Megtekintés oldal - videólejátszó glass stílussal',
    date: '2025.10.30.',
    tags: 'Új funkció',
    excerpt: 'Elkészült a watch oldal, ahol beágyazott lejátszóval, reszponzív 16:9 képaránnyal és az oldal többi részéhez illő glass dizájnnal nézhetők a videók.',
    link: '/nezes',
    linkText: 'Megnyitás'
  },
  {
    id: 3,
    type: 'update',
    title: 'PDF olvasó továbbfejlesztve – jobb zoom és mobil élmény',
    date: '2025.10.28.',
    tags: 'Frissítés',
    excerpt: 'A PDF olvasó a zoom után megőrzi a pozíciót, a nézet tetejére igazít, és mobilon a csúszka elrejthető, a +/− gombok és a pinch továbbra is működnek.',
    link: '/olvaso',
    linkText: 'Részletek'
  },
  {
    id: 4,
    type: 'info',
    title: 'Fizetési oldal finomhangolás – biztonságosabb és átláthatóbb',
    date: '2025.10.21.',
    tags: 'Közlemény',
    excerpt: 'A fizetési modál siker/sikertelen visszajelzéssel és tranzakciós azonosítóval érkezik. A formok glass stílust kaptak, az országválasztó stabilabb lett.',
    link: '/fizetes',
    linkText: 'Bővebben'
  },
  {
    id: 5,
    type: 'update',
    title: 'Kereső lapozás és gyorsabb találati oldal érkezett',
    date: '2025.10.18.',
    tags: 'Frissítés',
    excerpt: 'A keresés oldalon mostantól lapozással böngészhetők a találatok, gyorsabb képköltéssel és stabilabb poszter fallback megjelenítéssel.',
    link: '/kereses',
    linkText: 'Megnézem'
  },
  {
    id: 6,
    type: 'feature',
    title: 'Könyvtár fejlesztés - saját gyűjtemény több oldalon',
    date: '2025.10.14.',
    tags: 'Új funkció',
    excerpt: 'A könyvtár nézet mostantól nagyobb gyűjteménynél is kényelmesen használható, oldalakra bontott tartalommal és gyors visszaugrással a lista tetejére.',
    link: '/konyvtaram',
    linkText: 'Tovább a könyvtárhoz'
  },
  {
    id: 7,
    type: 'info',
    title: 'Új badge ritkaság-jelölések a profil oldalon',
    date: '2025.10.09.',
    tags: 'Közlemény',
    excerpt: 'A profilon megszerzett kitűzők ritkasága mostantól jól elkülönülő színekkel jelenik meg, így azonnal látszik, melyik mennyire különleges.',
    link: '/profil',
    linkText: 'Profil megnyitása'
  },
  {
    id: 8,
    type: 'event',
    title: 'Közösségi olvasóhét indul exkluzív kihívásokkal',
    date: '2025.10.04.',
    tags: 'Esemény',
    excerpt: 'Hét napon át napi mini kihívások, közös ajánlók és extra pontszerzési lehetőségek várják azokat, akik csatlakoznak az olvasóhéthez.',
    link: '/kihivasok',
    linkText: 'Részt veszek'
  },
  {
    id: 9,
    type: 'feature',
    title: 'Ranglista lapozás és szűrés tartalomtípus szerint',
    date: '2025.09.30.',
    tags: 'Új funkció',
    excerpt: 'A ranglista oldalon külön szűrhetővé váltak a könyves, filmes és sorozatos pontok, és a hosszabb listák lapozással böngészhetők.',
    link: '/ranglista',
    linkText: 'Ranglista megnyitása'
  },
  {
    id: 10,
    type: 'update',
    title: 'Kihívások oldalon már átvehetők a teljesített jutalmak',
    date: '2025.09.24.',
    tags: 'Frissítés',
    excerpt: 'A teljesített kihívások külön állapotot kaptak, és egyetlen gombnyomással átvehetők a jutalmak, mielőtt a kihívás átvett állapotba kerül.',
    link: '/kihivasok',
    linkText: 'Kihívások megnyitása'
  },
  {
    id: 11,
    type: 'info',
    title: 'Profil beállítások: a nem módosítható mezők most egyértelműbbek',
    date: '2025.09.18.',
    tags: 'Közlemény',
    excerpt: 'A beállítások panelen a zárolt vagy rendszerből érkező mezők külön megjelenést kaptak, így könnyebb felismerni, mi módosítható és mi nem.',
    link: '/profil',
    linkText: 'Beállítások megnyitása'
  },
  {
    id: 12,
    type: 'event',
    title: 'Filmklub hétvége közös toplistával és extra XP-vel',
    date: '2025.09.11.',
    tags: 'Esemény',
    excerpt: 'A hétvégi esemény alatt közösen ajánlhattok filmeket, ranglistán mérhetitek össze a pontokat, és extra XP is jár az aktivitásért.',
    link: '/ranglista',
    linkText: 'Részletek megtekintése'
  }
];

export default function News() {
  const [activeFilter, setActiveFilter] = useState<NewsFilter>('all');
  const [articles, setArticles] = useState<NewsArticleData[]>(DEFAULT_ARTICLES);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticleData | null>(null);
  const [newsModalVisible, setNewsModalVisible] = useState(false);
  const [newsModalClosing, setNewsModalClosing] = useState(false);
  const [totalCount, setTotalCount] = useState<number>(DEFAULT_ARTICLES.length);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const lastSelectedArticle = useRef<NewsArticleData | null>(null);
  if (selectedArticle) lastSelectedArticle.current = selectedArticle;
  const pageSize = 6;

  const truncateText = (value: string, maxLength = 220): string => {
    if (value.length <= maxLength) return value;
    return `${value.slice(0, maxLength).trimEnd()}...`;
  };

  useEffect(() => {
    // Initial filter from URL query params or hash
    const params = new URLSearchParams(location.search);
    const urlType = params.get('type') || location.hash.slice(1);
    if (urlType) {
      const normalized = normalizeFilter(urlType);
      if (normalized) {
        setActiveFilter(normalized);
      }
    }
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter]);

  useEffect(() => {
    if (selectedArticle) {
      setNewsModalClosing(false);
      setNewsModalVisible(true);
      return;
    }

    if (newsModalVisible) {
      setNewsModalClosing(true);
      const timeout = setTimeout(() => {
        setNewsModalVisible(false);
        setNewsModalClosing(false);
      }, 290);

      return () => clearTimeout(timeout);
    }
  }, [selectedArticle, newsModalVisible]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedArticle(null);
    };

    if (newsModalVisible) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.addEventListener('keydown', onKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [newsModalVisible]);

  useEffect(() => {
    void fetchArticles(activeFilter, currentPage);
  }, [activeFilter, currentPage]);

  const mapApiCategoryToFilter = (category: string): NewsArticleType => {
    const normalized = category.toUpperCase();
    if (normalized === 'UPDATE') return 'update';
    if (normalized === 'FUNCTION') return 'feature';
    if (normalized === 'ANNOUNCEMENT') return 'info';
    if (normalized === 'EVENT') return 'event';
    return 'info';
  };

  const getTagLabel = (filter: NewsArticleType): string => {
    switch (filter) {
      case 'update': return 'Frissítés';
      case 'feature': return 'Új funkció';
      case 'event': return 'Esemény';
      case 'info':
      default:
        return 'Közlemény';
    }
  };

  const fetchArticles = async (filter: NewsFilter, page: number) => {
    setLoading(true);
    setError(null);

    try {
      const apiFilter = filter === 'feature'
        ? 'function'
        : filter === 'info'
          ? 'announcement'
          : filter;

      const response = await getNews({
        filter: apiFilter,
        page,
        pageSize,
      });

      const mapped = response.articles.map((article) => {
        const mappedType = mapApiCategoryToFilter(article.category);

        return {
          id: article.id,
          type: mappedType,
          title: article.title,
          date: article.date,
          tags: getTagLabel(mappedType),
          excerpt: truncateText(article.description),
          fullDescription: article.description,
          link: '/hirek',
          linkText: 'Részletek',
        } satisfies NewsArticleData;
      });

      setArticles(mapped);
      setTotalCount(response.total);
    } catch (err) {
      console.error('Error fetching articles:', err);
      setError('Hiba történt a cikkek betöltése során.');

      const fallbackFiltered = filter === 'all'
        ? DEFAULT_ARTICLES
        : DEFAULT_ARTICLES.filter((article) => article.type === filter);
      setTotalCount(fallbackFiltered.length);

      const start = (page - 1) * pageSize;
      setArticles(fallbackFiltered.slice(start, start + pageSize));
    } finally {
      setLoading(false);
    }
  };

  const normalizeFilter = (value: string): NewsFilter | null => {
    const v = value.toLowerCase();
    if (v === 'function' || v === 'feat' || v === 'funkcio' || v === 'uj-funkcio') return 'feature';
    if (v === 'frissites') return 'update';
    if (v === 'kozlemeny' || v === 'announcement') return 'info';
    if (v === 'all' || v === 'update' || v === 'feature' || v === 'info' || v === 'event') return v as NewsFilter;
    return null;
  };

  const handleFilterClick = (filter: NewsFilter) => {
    setActiveFilter(filter);
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

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

  const getFilterIcon = (filter: NewsFilter): string => {
    switch (filter) {
      case 'all': return 'bi-grid-fill';
      case 'update': return 'bi-arrow-repeat';
      case 'feature': return 'bi-stars';
      case 'info': return 'bi-megaphone';
      case 'event': return 'bi-calendar-event';
      default: return 'bi-grid-fill';
    }
  };

  const getFilterLabel = (filter: NewsFilter): string => {
    switch (filter) {
      case 'all': return 'Összes';
      case 'update': return 'Frissítés';
      case 'feature': return 'Új funkció';
      case 'info': return 'Közlemény';
      case 'event': return 'Esemény';
      default: return 'Összes';
    }
  };

  const filters: NewsFilter[] = ['all', 'update', 'feature', 'info', 'event'];
  const modalArticle = selectedArticle ?? lastSelectedArticle.current;

  return (
    <main className="mt-5">
      <div className="container py-5" style={{maxWidth: '1200px'}}>
        <h1 className="mb-4 text-center display-6 fw-bold text-decoration-underline">
          <i className="bi bi-newspaper me-2"></i>
          Hírek
        </h1>

        {/* Filters / categories */}
        <div className="news-filters">
          {filters.map(filter => (
            <button
              key={filter}
              className={`btn btn-sm btn-action ${activeFilter === filter ? 'active' : ''}`}
              type="button"
              onClick={() => handleFilterClick(filter)}
            >
              <i className={`bi ${getFilterIcon(filter)} me-1`}></i>
              {getFilterLabel(filter)}
            </button>
          ))}
        </div>

        {/* News list */}
        <div className="news-list">
          {loading && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Betöltés...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {!loading && !error && articles.length === 0 && (
            <div className="text-center py-5">
              <p className="text-muted">Nincsenek megjeleníthető cikkek.</p>
            </div>
          )}

          {!loading && !error && articles.map(article => (
            <NewsArticle key={article.id} article={article} onReadMore={setSelectedArticle} />
          ))}
        </div>

        {!loading && !error && totalPages > 1 && (
          <nav className="kk-pagination-wrap news-pagination-wrap" aria-label="Hírek lapozása">
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
      </div>

      {newsModalVisible && modalArticle && (
        <div className={`news-modal-backdrop${newsModalClosing ? ' closing' : ''}`} onClick={() => setSelectedArticle(null)}>
          <div
            className={`news-modal${newsModalClosing ? ' closing' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="news-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="news-modal-header">
              <div>
                <h2 id="news-modal-title" className="news-modal-title">{modalArticle.title}</h2>
                <div className="news-modal-meta">
                  <span>
                    <i className="bi bi-calendar3 me-1"></i>
                    {modalArticle.date}
                  </span>
                  <span className={`news-type-chip news-type-${modalArticle.type}`}>
                    {modalArticle.tags}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="btn-close btn-close-white"
                aria-label="Bezár"
                onClick={() => setSelectedArticle(null)}
              ></button>
            </div>
            <div className="news-modal-body">
              {modalArticle.fullDescription ?? modalArticle.excerpt}
            </div>
            <div className="news-modal-footer">
              <button type="button" className="btn-read" onClick={() => setSelectedArticle(null)}>
                Rendben
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}