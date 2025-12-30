import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/common/Modal.tsx';
import type { CardData } from '../components/common/Card.tsx';
import '../styles/history.css';

// Előzmény elem típus
interface HistoryItem {
  id: number;
  title: string;
  cover: string;
  type: 'book' | 'movie' | 'series';
  progress: number; // 0-100
  lastPosition: string; // pl. "124. oldal" vagy "S2 E5 - 23:45"
  totalDuration: string; // pl. "320 oldal" vagy "45 perc"
  viewedAt: Date;
  rating?: number;
}

// Mock előzmények adatok
const mockHistoryItems: HistoryItem[] = [
  {
    id: 1,
    title: 'Inception',
    cover: 'https://image.tmdb.org/t/p/w500/ljsZTbVsrQSqZgWeep2B1QiDKuh.jpg',
    type: 'movie',
    progress: 65,
    lastPosition: '1:23:45',
    totalDuration: '2:28:00',
    viewedAt: new Date(Date.now() - 1000 * 60 * 30), // 30 perce
    rating: 9.2,
  },
  {
    id: 2,
    title: 'A kis herceg',
    cover: 'https://moly.hu/system/covers/big/covers_535498.jpg',
    type: 'book',
    progress: 78,
    lastPosition: '89. oldal',
    totalDuration: '114 oldal',
    viewedAt: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 órája
    rating: 9.5,
  },
  {
    id: 3,
    title: 'Interstellar',
    cover: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    type: 'movie',
    progress: 100,
    lastPosition: 'Befejezve',
    totalDuration: '2:49:00',
    viewedAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 órája
    rating: 9.8,
  },
  {
    id: 4,
    title: 'Breaking Bad',
    cover: 'https://image.tmdb.org/t/p/w500/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg',
    type: 'series',
    progress: 45,
    lastPosition: 'S3 E7 - 34:12',
    totalDuration: '5 évad',
    viewedAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // tegnap
    rating: 9.5,
  },
  {
    id: 5,
    title: '1984',
    cover: 'https://moly.hu/system/covers/big/covers_227576.jpg',
    type: 'book',
    progress: 23,
    lastPosition: '67. oldal',
    totalDuration: '328 oldal',
    viewedAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // tegnap
  },
  {
    id: 6,
    title: 'A Gyűrűk Ura: A király visszatér',
    cover: 'https://image.tmdb.org/t/p/w500/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg',
    type: 'movie',
    progress: 33,
    lastPosition: '1:12:30',
    totalDuration: '3:21:00',
    viewedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 napja
    rating: 9.0,
  },
  {
    id: 7,
    title: 'The Witcher',
    cover: 'https://image.tmdb.org/t/p/w500/7vjaCdMw15FEbXyLQTVa04URsPm.jpg',
    type: 'series',
    progress: 100,
    lastPosition: 'Befejezve',
    totalDuration: '3 évad',
    viewedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 napja
    rating: 8.2,
  },
  {
    id: 8,
    title: 'Dűne',
    cover: 'https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg',
    type: 'movie',
    progress: 100,
    lastPosition: 'Befejezve',
    totalDuration: '2:35:00',
    viewedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 1 hete
    rating: 8.8,
  },
];

const History: React.FC = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<'all' | 'book' | 'movie' | 'series'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'in-progress'>('all');
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);

  // Szűrt elemek
  const filteredItems = useMemo(() => {
    let items = mockHistoryItems;

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
  }, [activeFilter, statusFilter]);

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

    filteredItems.forEach(item => {
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
  }, [filteredItems]);

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
  const handleContinue = (item: HistoryItem) => {
    if (item.type === 'book') {
      navigate('/reader', { state: { bookId: item.id } });
    } else {
      navigate('/watch', { state: { mediaId: item.id } });
    }
  };

  // Folytatásban lévő elemek száma
  const inProgressCount = mockHistoryItems.filter(i => i.progress < 100).length;

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
                Összes ({mockHistoryItems.length})
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
                Befejezett ({mockHistoryItems.filter(i => i.progress === 100).length})
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Előzmények lista */}
      <section className="history-content">
        <div className="container">
          {groupedItems.length === 0 ? (
            <div className="history-empty">
              <i className="bi bi-clock-history"></i>
              <h3>Nincs megjeleníthető előzmény</h3>
              <p>Kezdj el olvasni vagy nézni valamit, és itt fognak megjelenni az előzményeid.</p>
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
                        key={item.id}
                        className={`history-item ${isCompleted ? 'completed' : ''}`}
                      >
                        {/* Borító */}
                        <div className="item-cover">
                          <img src={item.cover} alt={item.title} />
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

export default History;
