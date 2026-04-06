import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/history.css';
import {
  ApiHttpError,
  applyContentImageFallback,
  buildContentKey,
  getHistory,
  recordContentView,
  touchHistoryItem,
  toContentImageSrc,
  type HistoryItemResponse,
} from '../services/api';

// Előzmény elem típus
interface HistoryItem {
  id: number;
  title: string;
  cover: string;
  type: 'book' | 'movie' | 'series';
  progress: number; // 0-100
  lastPosition: string; // pl. "124. oldal" vagy "S2 E5 - 23:45"
  totalDuration: string; // pl. "320 oldal" vagy "1 óra 34 perc"
  viewedAt: Date;
  rating?: number;
}

const formatMinutesAsDuration = (value: number): string => {
  const totalMinutes = Math.max(0, Math.floor(value));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours <= 0) return `${minutes} perc`;
  if (minutes === 0) return `${hours} óra`;
  return `${hours} óra ${minutes} perc`;
};

const mapHistoryItem = (item: HistoryItemResponse): HistoryItem => {
  const status = item.status?.toUpperCase() ?? '';
  const rawProgress = item.progress ?? 0;

  const progress = status === 'COMPLETED'
    ? 100
    : rawProgress <= 0
      ? 0
      : rawProgress <= 100
        ? Math.max(1, Math.min(99, rawProgress))
        : Math.max(1, Math.min(99, Math.round(rawProgress / 2)));

  const normalizedType: HistoryItem['type'] = item.contentType.toLowerCase() === 'movie'
    ? 'movie'
    : item.contentType.toLowerCase() === 'series'
      ? 'series'
      : 'book';

  const totalUnits = typeof item.totalUnits === 'number' && item.totalUnits > 0
    ? item.totalUnits
    : null;

  const lastPosition = status === 'COMPLETED'
    ? 'Befejezve'
    : normalizedType === 'book'
      ? `${rawProgress || 0}. oldal`
      : normalizedType === 'series'
        ? `Epizód ${rawProgress || 0}`
        : formatMinutesAsDuration(rawProgress || 0);

  return {
    id: item.contentId,
    title: item.title,
    cover: toContentImageSrc(item.cover ?? item.poster),
    type: normalizedType,
    progress,
    lastPosition,
    totalDuration:
      normalizedType === 'book'
        ? `${totalUnits ?? Math.max(0, rawProgress)} oldal`
        : normalizedType === 'series'
          ? `${totalUnits ?? Math.max(0, rawProgress)} epizód`
          : formatMinutesAsDuration(totalUnits ?? Math.max(0, rawProgress)),
    viewedAt: new Date(item.lastSeen ?? item.addedAt ?? Date.now()),
    rating: item.rating == null ? undefined : Number(item.rating),
  };
};

const History: React.FC = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<'all' | 'book' | 'movie' | 'series'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'in-progress'>('all');
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    let isMounted = true;

    const loadHistory = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getHistory({
          type: activeFilter,
          page: 1,
          pageSize: 100,
        });

        if (!isMounted) return;

        const mappedItems = response.history
          .map(mapHistoryItem)
          .sort((a, b) => b.viewedAt.getTime() - a.viewedAt.getTime());

        setHistoryItems(mappedItems);
      } catch (loadError) {
        if (!isMounted) return;

        console.error('Failed to load history:', loadError);
        if (loadError instanceof ApiHttpError && loadError.status === 401) {
          setError('Az előzmények megtekintéséhez be kell jelentkezned.');
          setHistoryItems([]);
        } else {
          setError('Az előzmények betöltése sikertelen.');
          setHistoryItems([]);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void loadHistory();

    return () => {
      isMounted = false;
    };
  }, [activeFilter]);

  // Szűrt elemek
  const filteredItems = useMemo(() => {
    let items = historyItems;

    // Típus szűrés
    if (activeFilter !== 'all') {
      items = items.filter(item => item.type === activeFilter);
    }

    // Státusz szűrés
    if (statusFilter === 'completed') {
      items = items.filter(item => item.progress === 100);
    } else if (statusFilter === 'in-progress') {
      items = items.filter(item => item.progress < 100);
    }

    return items;
  }, [historyItems, activeFilter, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));

  const pagedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Időrendi csoportosítás
  const groupedItems = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const groups: { title: string; items: HistoryItem[] }[] = [
      { title: 'Ma', items: [] },
      { title: 'Tegnap', items: [] },
      { title: 'Ezen a héten', items: [] },
      { title: 'Korábban', items: [] },
    ];

    pagedItems.forEach(item => {
      if (item.viewedAt >= today) {
        groups[0].items.push(item);
      } else if (item.viewedAt >= yesterday) {
        groups[1].items.push(item);
      } else if (item.viewedAt >= weekAgo) {
        groups[2].items.push(item);
      } else {
        groups[3].items.push(item);
      }
    });

    // Csak nem üres csoportokat adjuk vissza
    return groups.filter(group => group.items.length > 0);
  }, [pagedItems]);

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

  // Típus ikon és szín
  const getTypeInfo = (type: HistoryItem['type']) => {
    switch (type) {
      case 'book':
        return { icon: 'bi-book-fill', label: 'Könyv', color: '#4CAF50' };
      case 'movie':
        return { icon: 'bi-camera-reels-fill', label: 'Film', color: '#2196F3' };
      case 'series':
        return { icon: 'bi-film', label: 'Sorozat', color: '#9C27B0' };
    }
  };

  // Idő formázás
  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Most';
    if (diffMins < 60) return `${diffMins} perce`;
    if (diffHours < 24) return `${diffHours} órája`;
    if (diffDays === 1) return 'Tegnap';
    if (diffDays < 7) return `${diffDays} napja`;
    return date.toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' });
  };

  // Folytatás kezelése
  const handleContinue = async (item: HistoryItem) => {
    const contentKey = buildContentKey(item.type, item.id);

    // Only LastSeen frissítése meglévő rekordra; ha hiányzik, fallbackként létrehozzuk/upserteljük.
    try {
      await touchHistoryItem({
        contentType: item.type,
        contentId: item.id,
      });
    } catch (recordError) {
      if (recordError instanceof ApiHttpError && recordError.status === 404) {
        try {
          await recordContentView({ contentType: item.type, contentId: item.id });
        } catch (fallbackError) {
          console.warn('History fallback view tracking failed:', fallbackError);
        }
      } else {
        console.warn('History pre-navigation update failed:', recordError);
      }
    }

    if (item.type === 'book') {
      navigate(`/olvaso?content=${encodeURIComponent(contentKey)}`);
      return;
    }

    navigate(`/nezes?content=${encodeURIComponent(contentKey)}`);
  };

  // Folytatásban lévő elemek száma
  const inProgressCount = historyItems.filter(i => i.progress < 100).length;

  return (
    <div className="history-page">
      {/* Header szekció */}
      <section className="history-hero">
        <div className="container">
          {/* Cím */}
          <h1 className="mb-4 text-center display-6 fw-bold text-decoration-underline">
            <i className="bi bi-clock-history me-2"></i>
            Előzmények
          </h1>

          {/* Szűrők */}
          <div className="history-filters">
            <div className="filter-buttons">
              {/* Típus filterek */}
              {[
                { key: 'all', label: 'Összes', icon: 'bi-grid-fill' },
                { key: 'book', label: 'Könyvek', icon: 'bi-book-fill' },
                { key: 'movie', label: 'Filmek', icon: 'bi-camera-reels-fill' },
                { key: 'series', label: 'Sorozatok', icon: 'bi-film' },
              ].map(filter => (
                <button
                  key={filter.key}
                  className={`filter-btn ${activeFilter === filter.key ? 'active' : ''}`}
                  onClick={() => setActiveFilter(filter.key as typeof activeFilter)}
                >
                  <i className={`bi ${filter.icon}`}></i>
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Státusz filterek */}
            <div className="filter-buttons status-filters">
              <button
                className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
                onClick={() => setStatusFilter('all')}
              >
                Összes ({historyItems.length})
              </button>
              <button
                className={`filter-btn ${statusFilter === 'in-progress' ? 'active' : ''}`}
                onClick={() => setStatusFilter('in-progress')}
              >
                <i className="bi bi-play-circle"></i>
                Folyamatban ({inProgressCount})
              </button>
              <button
                className={`filter-btn ${statusFilter === 'completed' ? 'active' : ''}`}
                onClick={() => setStatusFilter('completed')}
              >
                <i className="bi bi-check-circle"></i>
                Befejezett ({historyItems.filter(i => i.progress === 100).length})
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Előzmények lista */}
      <section className="history-content">
        <div className="container">
          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Betöltés...</span>
              </div>
            </div>
          ) : groupedItems.length === 0 ? (
            <div className="history-empty">
              <i className="bi bi-clock-history"></i>
              <h3>Nincs megjeleníthető előzmény</h3>
              <p>{error ?? 'Kezdj el olvasni vagy nézni valamit, és itt fognak megjelenni az előzményeid.'}</p>
            </div>
          ) : (
            groupedItems.map((group, groupIndex) => (
              <div key={groupIndex} className="history-group">
                <h2 className="group-title">{group.title}</h2>
                <div className="history-list">
                  {group.items.map(item => {
                    const typeInfo = getTypeInfo(item.type);
                    const isCompleted = item.progress === 100;

                    return (
                      <div
                        key={`${item.type}-${item.id}`}
                        className={`history-item ${isCompleted ? 'completed' : ''}`}
                      >
                        {/* Borító */}
                        <div className="item-cover">
                          <img
                            src={item.cover}
                            alt={item.title}
                            onError={(event) => {
                              applyContentImageFallback(event.currentTarget);
                            }}
                          />
                          <div className="item-type-badge" style={{ backgroundColor: typeInfo.color }}>
                            <i className={`bi ${typeInfo.icon}`}></i>
                          </div>
                          {!isCompleted && (
                            <div className="item-progress-ring">
                              <svg viewBox="0 0 36 36">
                                <path
                                  className="progress-bg"
                                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                <path
                                  className="progress-fill"
                                  strokeDasharray={`${item.progress}, 100`}
                                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                              </svg>
                              <span className="progress-text">{item.progress}%</span>
                            </div>
                          )}
                          {isCompleted && (
                            <div className="completed-badge">
                              <i className="bi bi-check-circle-fill"></i>
                            </div>
                          )}
                        </div>

                        {/* Tartalom */}
                        <div className="item-content">
                          <div className="item-header">
                            <h3 className="item-title">{item.title}</h3>
                            <span className="item-time">{formatTimeAgo(item.viewedAt)}</span>
                          </div>

                          <div className="item-meta">
                            <span className="item-type" style={{ color: typeInfo.color }}>
                              {typeInfo.label}
                            </span>
                            <span className="item-position">
                              <i className="bi bi-bookmark-fill"></i>
                              {item.lastPosition}
                            </span>
                            <span className="item-total">
                              {item.totalDuration}
                            </span>
                          </div>

                          {/* Progress bar */}
                          {!isCompleted && (
                            <div className="item-progress-bar">
                              <div
                                className="progress-fill"
                                style={{ width: `${item.progress}%` }}
                              />
                            </div>
                          )}

                          {item.rating && (
                            <div className="item-rating">
                              <i className="bi bi-star-fill"></i>
                              <span>{item.rating}</span>
                            </div>
                          )}
                        </div>

                        {/* Akciók */}
                        <div className="item-actions">
                          {!isCompleted ? (
                            <button
                              className="btn-continue"
                              onClick={() => handleContinue(item)}
                            >
                              <i className="bi bi-play-fill"></i>
                              Folytatás
                            </button>
                          ) : (
                            <button
                              className="btn-rewatch"
                              onClick={() => handleContinue(item)}
                            >
                              <i className="bi bi-arrow-repeat"></i>
                              Újra
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}

          {filteredItems.length > 0 && totalPages > 1 && (
            <nav className="kk-pagination-wrap history-pagination-wrap" aria-label="Előzmények lapozása">
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
      </section>
    </div>
  );
};

export default History;
