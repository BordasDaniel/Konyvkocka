import { useState, useEffect } from 'react';
import NewsArticle, { type NewsArticleData } from '../components/features/NewsArticle';

type NewsFilter = 'all' | 'update' | 'feature' | 'info' | 'event';

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
    link: '/watch',
    linkText: 'Megnyitás'
  },
  {
    id: 3,
    type: 'update',
    title: 'PDF olvasó továbbfejlesztve – jobb zoom és mobil élmény',
    date: '2025.10.28.',
    tags: 'Frissítés',
    excerpt: 'A PDF olvasó a zoom után megőrzi a pozíciót, a nézet tetejére igazít, és mobilon a csúszka elrejthető, a +/− gombok és a pinch továbbra is működnek.',
    link: '/reader',
    linkText: 'Részletek'
  },
  {
    id: 4,
    type: 'info',
    title: 'Fizetési oldal finomhangolás – biztonságosabb és átláthatóbb',
    date: '2025.10.21.',
    tags: 'Közlemény',
    excerpt: 'A fizetési modál siker/sikertelen visszajelzéssel és tranzakciós azonosítóval érkezik. A formok glass stílust kaptak, az országválasztó stabilabb lett.',
    link: '/pay',
    linkText: 'Bővebben'
  }
];

export default function News() {
  const [activeFilter, setActiveFilter] = useState<NewsFilter>('all');
  const [articles, setArticles] = useState<NewsArticleData[]>(DEFAULT_ARTICLES);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
    // Fetch articles when filter changes
    fetchArticles(activeFilter);
  }, [activeFilter]);

  const fetchArticles = async (filter: NewsFilter) => {
    setLoading(true);
    setError(null);

    try {
      // TODO: Replace with actual API endpoint when database is ready
      // const endpoint = filter === 'all' 
      //   ? '/api/news/articles' 
      //   : `/api/news/articles?type=${filter}`;
      // const response = await fetch(endpoint);
      // if (!response.ok) throw new Error('Failed to fetch articles');
      // const data = await response.json();
      // setArticles(data);

      // Jelenleg: alapértelmezett cikkek használata szűréssel
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
      
      if (filter === 'all') {
        setArticles(DEFAULT_ARTICLES);
      } else {
        const filtered = DEFAULT_ARTICLES.filter(article => article.type === filter);
        setArticles(filtered);
      }
    } catch (err) {
      console.error('Error fetching articles:', err);
      setError('Hiba történt a cikkek betöltése során.');
      setArticles(DEFAULT_ARTICLES); // Fallback to default articles
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

  return (
    <main className="mt-5">
      <div className="container py-5">
        <h1 className="mb-4 text-center display-6 fw-bold text-decoration-underline">Hírek</h1>

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
            <NewsArticle key={article.id} article={article} />
          ))}
        </div>
      </div>
    </main>
  );
}