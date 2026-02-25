import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/admin.css';

// ========================
// TÍPUSOK
// ========================

type AdminTab = 'overview' | 'users' | 'content' | 'news' | 'challenges' | 'announcements';

interface StatCard {
  label: string;
  value: string;
  change: string;
  changeType: 'up' | 'down' | 'neutral';
  icon: string;
  color: string;
}

interface AdminUser {
  id: number;
  username: string;
  email: string;
  avatar: string;
  role: 'user' | 'moderator' | 'admin';
  subscription: 'free' | 'premium' | 'premium-plus';
  level: number;
  joinDate: string;
  lastActive: string;
  isBanned: boolean;
  booksRead: number;
  mediaWatched: number;
}

interface AdminContent {
  id: number;
  title: string;
  type: 'book' | 'movie' | 'series';
  cover: string;
  author: string;
  addedDate: string;
  views: number;
  rating: number;
  status: 'active' | 'draft' | 'hidden';
}

interface AdminNewsItem {
  id: number;
  title: string;
  type: 'update' | 'feature' | 'info' | 'event';
  date: string;
  author: string;
  status: 'published' | 'draft' | 'archived';
  views: number;
}

interface AdminChallenge {
  id: number;
  title: string;
  category: string;
  rarity: string;
  participants: number;
  completions: number;
  status: 'active' | 'upcoming' | 'ended';
  startDate: string;
  endDate?: string;
}

// ========================
// MOCK ADATOK
// ========================

const STATS: StatCard[] = [
  { label: 'Felhasználók', value: '12,847', change: '+324', changeType: 'up', icon: 'bi-people-fill', color: '#4a9eff' },
  { label: 'Aktív előfizetők', value: '3,291', change: '+89', changeType: 'up', icon: 'bi-star-fill', color: 'var(--secondary)' },
  { label: 'Havi bevétel', value: '9,840,990 Ft', change: '+12.3%', changeType: 'up', icon: 'bi-cash-stack', color: '#4ade80' },
  { label: 'Tartalmak', value: '2,456', change: '+18', changeType: 'up', icon: 'bi-collection-fill', color: '#f472b6' },
  { label: 'Mai látogatók', value: '1,893', change: '-5.2%', changeType: 'down', icon: 'bi-eye-fill', color: '#fb923c' },
  { label: 'Aktív kihívások', value: '14', change: '+2', changeType: 'up', icon: 'bi-trophy-fill', color: '#a78bfa' },
];

const MOCK_USERS: AdminUser[] = [
  { id: 1, username: 'BookMaster99', email: 'bookmaster@example.com', avatar: 'https://i.pravatar.cc/150?img=1', role: 'user', subscription: 'premium', level: 120, joinDate: '2020-03-15', lastActive: '2026.02.25.', isBanned: false, booksRead: 245, mediaWatched: 189 },
  { id: 2, username: 'CinemaLover', email: 'cinema@example.com', avatar: 'https://i.pravatar.cc/150?img=2', role: 'moderator', subscription: 'premium-plus', level: 115, joinDate: '2020-06-22', lastActive: '2026.02.25.', isBanned: false, booksRead: 120, mediaWatched: 520 },
  { id: 3, username: 'ReadingQueen', email: 'queen@example.com', avatar: 'https://i.pravatar.cc/150?img=3', role: 'user', subscription: 'premium', level: 112, joinDate: '2019-11-08', lastActive: '2026.02.24.', isBanned: false, booksRead: 380, mediaWatched: 45 },
  { id: 4, username: 'TrollUser69', email: 'troll@example.com', avatar: 'https://i.pravatar.cc/150?img=4', role: 'user', subscription: 'free', level: 5, joinDate: '2025-01-20', lastActive: '2026.02.20.', isBanned: true, booksRead: 0, mediaWatched: 2 },
  { id: 5, username: 'PageTurner', email: 'turner@example.com', avatar: 'https://i.pravatar.cc/150?img=5', role: 'user', subscription: 'premium', level: 105, joinDate: '2020-08-30', lastActive: '2026.02.25.', isBanned: false, booksRead: 310, mediaWatched: 67 },
  { id: 6, username: 'FilmFanatic', email: 'fanatic@example.com', avatar: 'https://i.pravatar.cc/150?img=10', role: 'user', subscription: 'free', level: 91, joinDate: '2021-06-20', lastActive: '2026.02.18.', isBanned: false, booksRead: 34, mediaWatched: 478 },
  { id: 7, username: 'NovelNinja', email: 'ninja@example.com', avatar: 'https://i.pravatar.cc/150?img=9', role: 'moderator', subscription: 'premium-plus', level: 94, joinDate: '2020-09-14', lastActive: '2026.02.25.', isBanned: false, booksRead: 267, mediaWatched: 89 },
  { id: 8, username: 'SpamBot2025', email: 'spam@fake.com', avatar: 'https://i.pravatar.cc/150?img=20', role: 'user', subscription: 'free', level: 1, joinDate: '2025-02-01', lastActive: '2026.02.22.', isBanned: true, booksRead: 0, mediaWatched: 0 },
];

const MOCK_CONTENT: AdminContent[] = [
  { id: 1, title: 'A szél árnyéka', type: 'book', cover: 'https://moly.hu/system/covers/big/covers_582574.jpg', author: 'Carlos Ruiz Zafón', addedDate: '2024-05-12', views: 12450, rating: 9.2, status: 'active' },
  { id: 2, title: 'Inception', type: 'movie', cover: 'https://image.tmdb.org/t/p/w500/ljsZTbVsrQSqZgWeep2B1QiDKuh.jpg', author: 'Christopher Nolan', addedDate: '2024-03-01', views: 34200, rating: 9.5, status: 'active' },
  { id: 3, title: 'Breaking Bad', type: 'series', cover: 'https://image.tmdb.org/t/p/w500/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg', author: 'Vince Gilligan', addedDate: '2024-01-15', views: 28900, rating: 9.7, status: 'active' },
  { id: 4, title: '1984', type: 'book', cover: 'https://moly.hu/system/covers/big/covers_227576.jpg', author: 'George Orwell', addedDate: '2024-06-20', views: 8700, rating: 9.1, status: 'active' },
  { id: 5, title: 'Interstellar', type: 'movie', cover: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', author: 'Christopher Nolan', addedDate: '2024-02-10', views: 41300, rating: 9.8, status: 'active' },
  { id: 6, title: 'Dűne', type: 'book', cover: 'https://marvin.bline.hu/product_images/920/ID250-141842.JPG', author: 'Frank Herbert', addedDate: '2025-01-05', views: 5600, rating: 8.8, status: 'draft' },
  { id: 7, title: 'The Witcher', type: 'series', cover: 'https://image.tmdb.org/t/p/w500/7vjaCdMw15FEbXyLQTVa04URsPm.jpg', author: 'Lauren Schmidt Hissrich', addedDate: '2024-08-14', views: 19200, rating: 8.2, status: 'hidden' },
];

const MOCK_NEWS: AdminNewsItem[] = [
  { id: 1, title: 'KönyvKocka 1.0 Launch Esemény', type: 'event', date: '2025-11-05', author: 'Admin', status: 'published', views: 3420 },
  { id: 2, title: 'Új Megtekintés oldal', type: 'feature', date: '2025-10-30', author: 'Admin', status: 'published', views: 2180 },
  { id: 3, title: 'PDF olvasó továbbfejlesztve', type: 'update', date: '2025-10-28', author: 'DevTeam', status: 'published', views: 1560 },
  { id: 4, title: 'Fizetési oldal finomhangolás', type: 'info', date: '2025-10-21', author: 'DevTeam', status: 'archived', views: 890 },
  { id: 5, title: 'Téli olvasási akció', type: 'event', date: '2025-12-20', author: 'Marketing', status: 'draft', views: 0 },
];

const MOCK_CHALLENGES: AdminChallenge[] = [
  { id: 1, title: 'Első lépések', category: 'Olvasás', rarity: 'Gyakori', participants: 8420, completions: 6210, status: 'active', startDate: '2024-01-01' },
  { id: 2, title: 'Könyvmoly', category: 'Olvasás', rarity: 'Epikus', participants: 3200, completions: 890, status: 'active', startDate: '2024-01-01' },
  { id: 3, title: 'Filmmánia', category: 'Nézés', rarity: 'Ritka', participants: 5100, completions: 2340, status: 'active', startDate: '2024-03-15' },
  { id: 4, title: '30 napos olvasási maraton', category: 'Esemény', rarity: 'Legendás', participants: 1240, completions: 156, status: 'active', startDate: '2025-01-01', endDate: '2025-01-31' },
  { id: 5, title: 'Tavaszi kihívás', category: 'Esemény', rarity: 'Nagyon ritka', participants: 0, completions: 0, status: 'upcoming', startDate: '2026-03-01', endDate: '2026-03-31' },
  { id: 6, title: 'Téli kihívás', category: 'Esemény', rarity: 'Nagyon ritka', participants: 2890, completions: 410, status: 'ended', startDate: '2024-12-01', endDate: '2025-01-31' },
];

// ========================
// KOMPONENS
// ========================

const Admin: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [users, setUsers] = useState<AdminUser[]>(MOCK_USERS);
  const [content, setContent] = useState<AdminContent[]>(MOCK_CONTENT);
  const [news, setNews] = useState<AdminNewsItem[]>(MOCK_NEWS);
  const [challenges] = useState<AdminChallenge[]>(MOCK_CHALLENGES);
  const [userSearch, setUserSearch] = useState('');
  const [contentSearch, setContentSearch] = useState('');
  const [newsSearch, setNewsSearch] = useState('');
  const [challengeSearch, setChallengeSearch] = useState('');
  const [contentTypeFilter, setContentTypeFilter] = useState<'all' | 'book' | 'movie' | 'series'>('all');
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementTarget, setAnnouncementTarget] = useState<'all' | 'subscribers' | 'free' | 'specific'>('all');
  const [announcementUsers, setAnnouncementUsers] = useState('');
  const [announcementSent, setAnnouncementSent] = useState(false);

  // Szűrt felhasználók
  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return users;
    const q = userSearch.toLowerCase();
    return users.filter(u =>
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  }, [users, userSearch]);

  // Szűrt tartalmak
  const filteredContent = useMemo(() => {
    let items = content;
    if (contentTypeFilter !== 'all') {
      items = items.filter(c => c.type === contentTypeFilter);
    }
    if (contentSearch.trim()) {
      const q = contentSearch.toLowerCase();
      items = items.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.author.toLowerCase().includes(q)
      );
    }
    return items;
  }, [content, contentTypeFilter, contentSearch]);

  // Szűrt hírek
  const filteredNews = useMemo(() => {
    if (!newsSearch.trim()) return news;
    const q = newsSearch.toLowerCase();
    return news.filter(n =>
      n.title.toLowerCase().includes(q) ||
      n.author.toLowerCase().includes(q)
    );
  }, [news, newsSearch]);

  // Szűrt kihívások
  const filteredChallenges = useMemo(() => {
    if (!challengeSearch.trim()) return challenges;
    const q = challengeSearch.toLowerCase();
    return challenges.filter(ch =>
      ch.title.toLowerCase().includes(q) ||
      ch.category.toLowerCase().includes(q)
    );
  }, [challenges, challengeSearch]);

  // Mentés handler (mock)
  const handleSave = (section: string) => {
    // TODO: API hívás
    alert(`${section} sikeresen mentve!`);
  };

  // Felhasználó ban/unban
  const toggleBan = (id: number) => {
    setUsers(prev => prev.map(u =>
      u.id === id ? { ...u, isBanned: !u.isBanned } : u
    ));
  };

  // Felhasználó szerepkör váltás
  const cycleRole = (id: number) => {
    const roles: AdminUser['role'][] = ['user', 'moderator', 'admin'];
    setUsers(prev => prev.map(u => {
      if (u.id !== id) return u;
      const idx = roles.indexOf(u.role);
      return { ...u, role: roles[(idx + 1) % roles.length] };
    }));
  };

  // Tartalom státusz váltás
  const cycleContentStatus = (id: number) => {
    const statuses: AdminContent['status'][] = ['active', 'draft', 'hidden'];
    setContent(prev => prev.map(c => {
      if (c.id !== id) return c;
      const idx = statuses.indexOf(c.status);
      return { ...c, status: statuses[(idx + 1) % statuses.length] };
    }));
  };

  // Tartalom törlése
  const deleteContent = (id: number) => {
    if (window.confirm('Biztosan törlöd ezt a tartalmat?')) {
      setContent(prev => prev.filter(c => c.id !== id));
    }
  };

  // Hír státusz váltás
  const cycleNewsStatus = (id: number) => {
    const statuses: AdminNewsItem['status'][] = ['published', 'draft', 'archived'];
    setNews(prev => prev.map(n => {
      if (n.id !== id) return n;
      const idx = statuses.indexOf(n.status);
      return { ...n, status: statuses[(idx + 1) % statuses.length] };
    }));
  };

  // Hír törlése
  const deleteNews = (id: number) => {
    if (window.confirm('Biztosan törlöd ezt a hírt?')) {
      setNews(prev => prev.filter(n => n.id !== id));
    }
  };

  // Bejelentés küldése
  const sendAnnouncement = () => {
    if (!announcementText.trim()) return;
    // TODO: API hívás
    setAnnouncementSent(true);
    setTimeout(() => {
      setAnnouncementSent(false);
      setAnnouncementText('');
      setAnnouncementUsers('');
    }, 3000);
  };

  // Helper: badge színek
  const getRoleBadge = (role: AdminUser['role']) => {
    switch (role) {
      case 'admin': return <span className="admin-badge admin-badge-red">Admin</span>;
      case 'moderator': return <span className="admin-badge admin-badge-blue">Moderátor</span>;
      default: return <span className="admin-badge admin-badge-gray">Felhasználó</span>;
    }
  };

  const getSubBadge = (sub: AdminUser['subscription']) => {
    switch (sub) {
      case 'premium-plus': return <span className="admin-badge admin-badge-gold">Premium+</span>;
      case 'premium': return <span className="admin-badge admin-badge-yellow">Premium</span>;
      default: return <span className="admin-badge admin-badge-dim">Ingyenes</span>;
    }
  };

  const getContentTypeBadge = (type: AdminContent['type']) => {
    switch (type) {
      case 'book': return <span className="admin-badge admin-badge-green">Könyv</span>;
      case 'movie': return <span className="admin-badge admin-badge-blue">Film</span>;
      case 'series': return <span className="admin-badge admin-badge-purple">Sorozat</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
      case 'published': return <span className="admin-badge admin-badge-green">{status === 'active' ? 'Aktív' : 'Publikált'}</span>;
      case 'draft': return <span className="admin-badge admin-badge-yellow">Vázlat</span>;
      case 'hidden':
      case 'archived': return <span className="admin-badge admin-badge-dim">{status === 'hidden' ? 'Rejtett' : 'Archivált'}</span>;
      case 'upcoming': return <span className="admin-badge admin-badge-blue">Közelgő</span>;
      case 'ended': return <span className="admin-badge admin-badge-dim">Befejezett</span>;
      default: return null;
    }
  };

  const getNewsTypeBadge = (type: AdminNewsItem['type']) => {
    switch (type) {
      case 'update': return <span className="admin-badge admin-badge-blue">Frissítés</span>;
      case 'feature': return <span className="admin-badge admin-badge-purple">Új funkció</span>;
      case 'info': return <span className="admin-badge admin-badge-yellow">Közlemény</span>;
      case 'event': return <span className="admin-badge admin-badge-green">Esemény</span>;
    }
  };

  // Auth check
  if (!isAuthenticated) {
    return (
      <main className="d-flex align-items-center justify-content-center mt-5 pt-4" style={{ 
        minHeight: '80vh',
        background: 'transparent'
      }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-5">
              <div className="text-center p-4" style={{
                background: 'rgba(12, 10, 8, 0.5)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(194, 157, 89, 0.15)',
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
              }}>
                <div className="mb-3">
                  <i className="bi bi-shield-lock" style={{ 
                    fontSize: '4.5rem', 
                    color: 'var(--secondary)'
                  }}></i>
                </div>

                <h1 className="display-1 fw-bold mb-3" style={{
                  fontSize: 'clamp(4rem, 12vw, 6rem)',
                  color: 'var(--secondary)',
                  letterSpacing: '0.1em'
                }}>
                  403
                </h1>

                <h2 className="h5 mb-3" style={{ color: 'var(--h1Text)' }}>Hozzáférés megtagadva</h2>
                <p className="mb-4" style={{ 
                  color: 'rgba(224, 224, 224, 0.7)',
                  fontSize: '0.95rem',
                  lineHeight: '1.6'
                }}>
                  Az admin felülethez be kell jelentkezned.<br />
                  Kérjük, jelentkezz be a folytatáshoz.
                </p>

                <div className="mb-4">
                  <button className="btn px-5 py-2" onClick={() => navigate('/belepes')} style={{
                    background: 'linear-gradient(135deg, var(--secondary), var(--primary))',
                    color: 'var(--bg)',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 12px rgba(194, 157, 89, 0.25)',
                    transition: 'all 0.3s ease'
                  }}>
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    BEJELENTKEZÉS
                  </button>
                </div>

                <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <p className="small mb-2" style={{ color: 'rgba(224, 224, 224, 0.5)' }}>Segíthetünk?</p>
                  <a href="/#/tamogatas" className="text-decoration-none" style={{ 
                    color: 'var(--secondary)',
                    fontSize: '0.95rem',
                    fontWeight: '500',
                    transition: 'all 0.3s ease'
                  }}>
                    <i className="bi bi-question-circle me-1"></i>
                    Támogatás
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const tabs: { key: AdminTab; label: string; icon: string }[] = [
    { key: 'overview', label: 'Áttekintés', icon: 'bi-speedometer2' },
    { key: 'users', label: 'Felhasználók', icon: 'bi-people-fill' },
    { key: 'content', label: 'Tartalmak', icon: 'bi-collection-fill' },
    { key: 'news', label: 'Hírek', icon: 'bi-newspaper' },
    { key: 'challenges', label: 'Kihívások', icon: 'bi-trophy-fill' },
    { key: 'announcements', label: 'Bejelentés', icon: 'bi-megaphone-fill' },
  ];

  return (
    <div className="admin-page">
      <section className="admin-hero">
        <div className="container-fluid px-4 px-lg-5">
          <h1 className="mb-4 display-6 fw-bold text-decoration-underline">
            <i className="bi bi-shield-lock-fill me-2"></i>
            Admin Panel
          </h1>
        </div>
      </section>

      <section className="admin-content">
        <div className="container-fluid px-4 px-lg-5">
          {/* Tab navigáció */}
          <div className="admin-tabs">
            {tabs.map(tab => (
              <button
                key={tab.key}
                className={`admin-tab ${activeTab === tab.key ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                <i className={`bi ${tab.icon} me-1`}></i>
                <span className="admin-tab-label">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* ======================== ÁTTEKINTÉS ======================== */}
          {activeTab === 'overview' && (
            <div className="admin-section">
              {/* Statisztika kártyák */}
              <div className="admin-stats-grid">
                {STATS.map((stat, idx) => (
                  <div key={idx} className="admin-stat-card">
                    <div className="admin-stat-icon" style={{ color: stat.color }}>
                      <i className={`bi ${stat.icon}`}></i>
                    </div>
                    <div className="admin-stat-info">
                      <span className="admin-stat-value">{stat.value}</span>
                      <span className="admin-stat-label">{stat.label}</span>
                    </div>
                    <div className={`admin-stat-change ${stat.changeType}`}>
                      <i className={`bi ${stat.changeType === 'up' ? 'bi-arrow-up-short' : stat.changeType === 'down' ? 'bi-arrow-down-short' : 'bi-dash'}`}></i>
                      {stat.change}
                    </div>
                  </div>
                ))}
              </div>

              {/* Legutóbbi aktivitás */}
              <div className="admin-card mt-4">
                <h3 className="admin-card-title">
                  <i className="bi bi-activity me-2"></i>
                  Legutóbbi aktivitás
                </h3>
                <div className="admin-activity-list">
                  {[
                    { icon: 'bi-person-plus-fill', color: '#4a9eff', text: 'Új felhasználó regisztrált: TavasziOlvaso', time: '2026.02.25. 14:32' },
                    { icon: 'bi-star-fill', color: 'var(--secondary)', text: 'Új Premium előfizető: ReadingQueen', time: '2026.02.25. 14:14' },
                    { icon: 'bi-book-fill', color: '#4ade80', text: 'Új könyv hozzáadva: "Az éjszaka gyermekei"', time: '2026.02.25. 13:45' },
                    { icon: 'bi-flag-fill', color: '#f87171', text: 'Bejelentés: TrollUser69 spam tevékenység', time: '2026.02.25. 12:30' },
                    { icon: 'bi-trophy-fill', color: '#a78bfa', text: '156 felhasználó teljesítette a "30 napos maraton" kihívást', time: '2026.02.25. 11:18' },
                    { icon: 'bi-cash-stack', color: '#4ade80', text: 'Napi bevétel összesítő: 327,450 Ft', time: '2026.02.25. 09:00' },
                  ].map((item, idx) => (
                    <div key={idx} className="admin-activity-item">
                      <div className="admin-activity-icon" style={{ color: item.color }}>
                        <i className={`bi ${item.icon}`}></i>
                      </div>
                      <div className="admin-activity-text">{item.text}</div>
                      <div className="admin-activity-time">{item.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ======================== FELHASZNÁLÓK ======================== */}
          {activeTab === 'users' && (
            <div className="admin-section">
              <div className="admin-card">
                <div className="admin-card-header">
                  <h3 className="admin-card-title">
                    <i className="bi bi-people-fill me-2"></i>
                    Felhasználók kezelése
                    <span className="admin-count">{users.length}</span>
                  </h3>
                  <div className="admin-search">
                    <i className="bi bi-search"></i>
                    <input
                      type="text"
                      placeholder="Keresés név vagy e-mail alapján..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                    />
                  </div>
                </div>

                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Felhasználó</th>
                        <th>Szerepkör</th>
                        <th>Előfizetés</th>
                        <th>Szint</th>
                        <th>Regisztráció</th>
                        <th>Utolsó aktivitás</th>
                        <th>Státusz</th>
                        <th>Műveletek</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(user => (
                        <tr key={user.id} className={user.isBanned ? 'banned-row' : ''}>
                          <td>
                            <div className="admin-user-cell">
                              <img src={user.avatar} alt={user.username} className="admin-user-avatar" />
                              <div>
                                <div className="admin-user-name">{user.username}</div>
                                <div className="admin-user-email">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td>{getRoleBadge(user.role)}</td>
                          <td>{getSubBadge(user.subscription)}</td>
                          <td><span className="admin-level">Lv.{user.level}</span></td>
                          <td>{new Date(user.joinDate).toLocaleDateString('hu-HU')}</td>
                          <td>{user.lastActive}</td>
                          <td>
                            {user.isBanned
                              ? <span className="admin-badge admin-badge-red">Bannolva</span>
                              : <span className="admin-badge admin-badge-green">Aktív</span>
                            }
                          </td>
                          <td>
                            <div className="admin-actions">
                              <button
                                className="admin-btn-icon"
                                title="Szerepkör váltása"
                                onClick={() => cycleRole(user.id)}
                              >
                                <i className="bi bi-person-gear"></i>
                              </button>
                              <button
                                className={`admin-btn-icon ${user.isBanned ? 'text-success' : 'text-danger'}`}
                                title={user.isBanned ? 'Unban' : 'Ban'}
                                onClick={() => toggleBan(user.id)}
                              >
                                <i className={`bi ${user.isBanned ? 'bi-unlock-fill' : 'bi-ban'}`}></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="admin-save-bar">
                  <button className="admin-send-btn" onClick={() => handleSave('Felhasználók')}>
                    <i className="bi bi-floppy-fill me-2"></i>
                    Változtatások mentése
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================== TARTALMAK ======================== */}
          {activeTab === 'content' && (
            <div className="admin-section">
              <div className="admin-card">
                <div className="admin-card-header">
                  <h3 className="admin-card-title">
                    <i className="bi bi-collection-fill me-2"></i>
                    Tartalmak kezelése
                    <span className="admin-count">{content.length}</span>
                  </h3>
                  <div className="admin-header-controls">
                    <div className="admin-filter-pills">
                      {(['all', 'book', 'movie', 'series'] as const).map(f => (
                        <button
                          key={f}
                          className={`admin-pill ${contentTypeFilter === f ? 'active' : ''}`}
                          onClick={() => setContentTypeFilter(f)}
                        >
                          {f === 'all' ? 'Mind' : f === 'book' ? 'Könyv' : f === 'movie' ? 'Film' : 'Sorozat'}
                        </button>
                      ))}
                    </div>
                    <div className="admin-search">
                      <i className="bi bi-search"></i>
                      <input
                        type="text"
                        placeholder="Keresés cím vagy szerző..."
                        value={contentSearch}
                        onChange={(e) => setContentSearch(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Tartalom</th>
                        <th>Típus</th>
                        <th>Szerző</th>
                        <th>Hozzáadva</th>
                        <th>Megtekintés</th>
                        <th>Értékelés</th>
                        <th>Státusz</th>
                        <th>Műveletek</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredContent.map(item => (
                        <tr key={item.id}>
                          <td>
                            <div className="admin-content-cell">
                              <img src={item.cover} alt={item.title} className="admin-content-cover" />
                              <span>{item.title}</span>
                            </div>
                          </td>
                          <td>{getContentTypeBadge(item.type)}</td>
                          <td>{item.author}</td>
                          <td>{new Date(item.addedDate).toLocaleDateString('hu-HU')}</td>
                          <td>{item.views.toLocaleString('hu-HU')}</td>
                          <td>
                            <span className="admin-rating">
                              <i className="bi bi-star-fill"></i>
                              {item.rating.toFixed(1)}
                            </span>
                          </td>
                          <td>
                            <button className="admin-btn-status" onClick={() => cycleContentStatus(item.id)}>
                              {getStatusBadge(item.status)}
                            </button>
                          </td>
                          <td>
                            <div className="admin-actions">
                              <button className="admin-btn-icon" title="Szerkesztés">
                                <i className="bi bi-pencil-fill"></i>
                              </button>
                              <button
                                className="admin-btn-icon text-danger"
                                title="Törlés"
                                onClick={() => deleteContent(item.id)}
                              >
                                <i className="bi bi-trash-fill"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="admin-save-bar">
                  <button className="admin-send-btn" onClick={() => handleSave('Tartalmak')}>
                    <i className="bi bi-floppy-fill me-2"></i>
                    Változtatások mentése
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================== HÍREK ======================== */}
          {activeTab === 'news' && (
            <div className="admin-section">
              <div className="admin-card">
                <div className="admin-card-header">
                  <h3 className="admin-card-title">
                    <i className="bi bi-newspaper me-2"></i>
                    Hírek kezelése
                    <span className="admin-count">{news.length}</span>
                  </h3>
                  <div className="admin-search">
                    <i className="bi bi-search"></i>
                    <input
                      type="text"
                      placeholder="Keresés cím vagy szerző..."
                      value={newsSearch}
                      onChange={(e) => setNewsSearch(e.target.value)}
                    />
                  </div>
                </div>

                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Cím</th>
                        <th>Típus</th>
                        <th>Dátum</th>
                        <th>Szerző</th>
                        <th>Megtekintés</th>
                        <th>Státusz</th>
                        <th>Műveletek</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredNews.map(item => (
                        <tr key={item.id}>
                          <td><span className="admin-news-title">{item.title}</span></td>
                          <td>{getNewsTypeBadge(item.type)}</td>
                          <td>{new Date(item.date).toLocaleDateString('hu-HU')}</td>
                          <td>{item.author}</td>
                          <td>{item.views.toLocaleString('hu-HU')}</td>
                          <td>
                            <button className="admin-btn-status" onClick={() => cycleNewsStatus(item.id)}>
                              {getStatusBadge(item.status)}
                            </button>
                          </td>
                          <td>
                            <div className="admin-actions">
                              <button className="admin-btn-icon" title="Szerkesztés">
                                <i className="bi bi-pencil-fill"></i>
                              </button>
                              <button
                                className="admin-btn-icon text-danger"
                                title="Törlés"
                                onClick={() => deleteNews(item.id)}
                              >
                                <i className="bi bi-trash-fill"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="admin-save-bar">
                  <button className="admin-send-btn" onClick={() => handleSave('Hírek')}>
                    <i className="bi bi-floppy-fill me-2"></i>
                    Változtatások mentése
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================== KIHÍVÁSOK ======================== */}
          {activeTab === 'challenges' && (
            <div className="admin-section">
              <div className="admin-card">
                <div className="admin-card-header">
                  <h3 className="admin-card-title">
                    <i className="bi bi-trophy-fill me-2"></i>
                    Kihívások kezelése
                    <span className="admin-count">{challenges.length}</span>
                  </h3>
                  <div className="admin-search">
                    <i className="bi bi-search"></i>
                    <input
                      type="text"
                      placeholder="Keresés név vagy kategória..."
                      value={challengeSearch}
                      onChange={(e) => setChallengeSearch(e.target.value)}
                    />
                  </div>
                </div>

                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Kihívás</th>
                        <th>Kategória</th>
                        <th>Ritkaság</th>
                        <th>Résztvevők</th>
                        <th>Teljesítések</th>
                        <th>Időszak</th>
                        <th>Státusz</th>
                        <th>Műveletek</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredChallenges.map(ch => (
                        <tr key={ch.id}>
                          <td><span className="admin-news-title">{ch.title}</span></td>
                          <td>{ch.category}</td>
                          <td>{ch.rarity}</td>
                          <td>{ch.participants.toLocaleString('hu-HU')}</td>
                          <td>
                            <span className="admin-completion">
                              {ch.completions.toLocaleString('hu-HU')}
                              {ch.participants > 0 && (
                                <small className="admin-completion-pct">
                                  ({Math.round((ch.completions / ch.participants) * 100)}%)
                                </small>
                              )}
                            </span>
                          </td>
                          <td>
                            <span className="admin-date-range">
                              {new Date(ch.startDate).toLocaleDateString('hu-HU')}
                              {ch.endDate && <> – {new Date(ch.endDate).toLocaleDateString('hu-HU')}</>}
                            </span>
                          </td>
                          <td>{getStatusBadge(ch.status)}</td>
                          <td>
                            <div className="admin-actions">
                              <button className="admin-btn-icon" title="Szerkesztés">
                                <i className="bi bi-pencil-fill"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="admin-save-bar">
                  <button className="admin-send-btn" onClick={() => handleSave('Kihívások')}>
                    <i className="bi bi-floppy-fill me-2"></i>
                    Változtatások mentése
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================== BEJELENTÉS ======================== */}
          {activeTab === 'announcements' && (
            <div className="admin-section">
              <div className="admin-card">
                <h3 className="admin-card-title">
                  <i className="bi bi-megaphone-fill me-2"></i>
                  Rendszerszintű bejelentés küldése
                </h3>

                {announcementSent ? (
                  <div className="admin-announcement-success">
                    <i className="bi bi-check-circle-fill"></i>
                    <p>Bejelentés sikeresen elküldve!</p>
                  </div>
                ) : (
                  <div className="admin-announcement-form">
                    <div className="admin-form-group">
                      <label>Célcsoport</label>
                      <div className="admin-filter-pills">
                        {([
                          { key: 'all', label: 'Mindenki' },
                          { key: 'subscribers', label: 'Előfizetők' },
                          { key: 'free', label: 'Ingyenes felhasználók' },
                          { key: 'specific', label: 'Adott felhasználók' },
                        ] as const).map(t => (
                          <button
                            key={t.key}
                            className={`admin-pill ${announcementTarget === t.key ? 'active' : ''}`}
                            onClick={() => setAnnouncementTarget(t.key)}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {announcementTarget === 'specific' && (
                      <div className="admin-form-group">
                        <label>Felhasználónevek (vesszővel elválasztva)</label>
                        <div className="admin-search" style={{ minWidth: 'unset', width: '100%' }}>
                          <i className="bi bi-people"></i>
                          <input
                            type="text"
                            placeholder="pl. BookMaster99, CinemaLover, ReadingQueen"
                            value={announcementUsers}
                            onChange={(e) => setAnnouncementUsers(e.target.value)}
                          />
                        </div>
                        {announcementUsers.trim() && (
                          <div className="admin-specific-users-preview">
                            {announcementUsers.split(',').map(u => u.trim()).filter(Boolean).map((u, i) => (
                              <span key={i} className="admin-badge admin-badge-blue">{u}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="admin-form-group">
                      <label>Üzenet</label>
                      <textarea
                        className="admin-textarea"
                        placeholder="Írd ide a bejelentés szövegét..."
                        value={announcementText}
                        onChange={(e) => setAnnouncementText(e.target.value)}
                        rows={5}
                      />
                    </div>

                    <div className="admin-form-group">
                      <button
                        className="admin-send-btn"
                        onClick={sendAnnouncement}
                        disabled={!announcementText.trim()}
                      >
                        <i className="bi bi-send-fill me-2"></i>
                        Bejelentés küldése
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Admin;
