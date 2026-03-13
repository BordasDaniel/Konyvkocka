import React, { useEffect, useMemo, useState } from 'react';
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
  permissionLevel: 'user' | 'moderator' | 'admin' | 'banned';
  subscription: 'free' | 'premium';
  premiumExpiresAt: string | null;
  level: number;
  xp: number;
  countryCode: string;
  joinDate: string;
  lastLoginDate: string;
  dayStreak: number;
  readTimeMin: number;
  watchTimeMin: number;
  bookPoints: number;
  seriesPoints: number;
  moviePoints: number;
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
  content: string;
  eventTag: 'UPDATE' | 'ANNOUNCEMENT' | 'EVENT' | 'FUNCTION';
  createdAt: string;
  updatedAt: string;
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
  { id: 1, username: 'BookMaster99', email: 'bookmaster@example.com', avatar: 'https://i.pravatar.cc/150?img=1', permissionLevel: 'user', subscription: 'premium', premiumExpiresAt: '2026-08-12', level: 120, xp: 840, countryCode: 'HU', joinDate: '2020-03-15', lastLoginDate: '2026-03-12', dayStreak: 47, readTimeMin: 18320, watchTimeMin: 5220, bookPoints: 8450, seriesPoints: 2160, moviePoints: 980 },
  { id: 2, username: 'CinemaLover', email: 'cinema@example.com', avatar: 'https://i.pravatar.cc/150?img=2', permissionLevel: 'moderator', subscription: 'premium', premiumExpiresAt: '2027-01-01', level: 115, xp: 625, countryCode: 'RO', joinDate: '2020-06-22', lastLoginDate: '2026-03-13', dayStreak: 18, readTimeMin: 6540, watchTimeMin: 24180, bookPoints: 2210, seriesPoints: 5840, moviePoints: 6120 },
  { id: 3, username: 'ReadingQueen', email: 'queen@example.com', avatar: 'https://i.pravatar.cc/150?img=3', permissionLevel: 'user', subscription: 'premium', premiumExpiresAt: '2026-05-17', level: 112, xp: 410, countryCode: 'HU', joinDate: '2019-11-08', lastLoginDate: '2026-03-11', dayStreak: 83, readTimeMin: 24880, watchTimeMin: 1240, bookPoints: 11020, seriesPoints: 640, moviePoints: 310 },
  { id: 4, username: 'TrollUser69', email: 'troll@example.com', avatar: 'https://i.pravatar.cc/150?img=4', permissionLevel: 'banned', subscription: 'free', premiumExpiresAt: null, level: 5, xp: 90, countryCode: 'HU', joinDate: '2025-01-20', lastLoginDate: '2026-02-20', dayStreak: 0, readTimeMin: 14, watchTimeMin: 41, bookPoints: 0, seriesPoints: 10, moviePoints: 0 },
  { id: 5, username: 'PageTurner', email: 'turner@example.com', avatar: 'https://i.pravatar.cc/150?img=5', permissionLevel: 'user', subscription: 'premium', premiumExpiresAt: '2026-09-09', level: 105, xp: 255, countryCode: 'SK', joinDate: '2020-08-30', lastLoginDate: '2026-03-13', dayStreak: 29, readTimeMin: 16770, watchTimeMin: 3100, bookPoints: 9040, seriesPoints: 420, moviePoints: 260 },
  { id: 6, username: 'FilmFanatic', email: 'fanatic@example.com', avatar: 'https://i.pravatar.cc/150?img=10', permissionLevel: 'user', subscription: 'free', premiumExpiresAt: null, level: 91, xp: 710, countryCode: 'DE', joinDate: '2021-06-20', lastLoginDate: '2026-03-08', dayStreak: 6, readTimeMin: 2100, watchTimeMin: 20640, bookPoints: 840, seriesPoints: 4120, moviePoints: 4970 },
  { id: 7, username: 'NovelNinja', email: 'ninja@example.com', avatar: 'https://i.pravatar.cc/150?img=9', permissionLevel: 'moderator', subscription: 'premium', premiumExpiresAt: '2026-12-31', level: 94, xp: 930, countryCode: 'AT', joinDate: '2020-09-14', lastLoginDate: '2026-03-13', dayStreak: 12, readTimeMin: 14320, watchTimeMin: 6220, bookPoints: 6900, seriesPoints: 1540, moviePoints: 890 },
  { id: 8, username: 'SpamBot2025', email: 'spam@fake.com', avatar: 'https://i.pravatar.cc/150?img=20', permissionLevel: 'banned', subscription: 'free', premiumExpiresAt: null, level: 1, xp: 0, countryCode: '??', joinDate: '2025-02-01', lastLoginDate: '2026-02-22', dayStreak: 0, readTimeMin: 0, watchTimeMin: 0, bookPoints: 0, seriesPoints: 0, moviePoints: 0 },
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
  {
    id: 1,
    title: 'KönyvKocka 1.0 Launch Esemény',
    content: 'Ünnepélyes rajt exkluzív tartalmakkal, nyereményjátékkal és élő közösségi programokkal.',
    eventTag: 'EVENT',
    createdAt: '2025-11-05T10:30:00',
    updatedAt: '2025-11-05T10:30:00',
  },
  {
    id: 2,
    title: 'Új Megtekintés oldal',
    content: 'A watch felület átdolgozva: gyorsabb betöltés, jobb listanézet és pontosabb lejátszási folytatás.',
    eventTag: 'FUNCTION',
    createdAt: '2025-10-30T14:20:00',
    updatedAt: '2025-10-31T09:40:00',
  },
  {
    id: 3,
    title: 'PDF olvasó továbbfejlesztve',
    content: 'Új könyvjelzőzés, stabilabb nagyítás és gyorsabb oldalszinkron a mentett állapotokkal.',
    eventTag: 'UPDATE',
    createdAt: '2025-10-28T08:15:00',
    updatedAt: '2025-10-28T19:05:00',
  },
  {
    id: 4,
    title: 'Fizetési oldal finomhangolás',
    content: 'Pontszerű UX javítások, egyértelműbb visszajelzések és hibakezelés a checkout folyamatban.',
    eventTag: 'ANNOUNCEMENT',
    createdAt: '2025-10-21T12:00:00',
    updatedAt: '2025-10-22T11:32:00',
  },
  {
    id: 5,
    title: 'Téli olvasási akció',
    content: 'Decemberben minden teljesített olvasás dupla pontot ad, a toplista külön jutalmazással fut.',
    eventTag: 'EVENT',
    createdAt: '2025-12-20T09:00:00',
    updatedAt: '2025-12-20T09:00:00',
  },
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
  const [userTypeFilter, setUserTypeFilter] = useState<'all' | 'premium' | 'staff' | 'banned'>('all');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [userDraft, setUserDraft] = useState<AdminUser | null>(null);
  const [activeUserDropdown, setActiveUserDropdown] = useState<'permissionLevel' | 'subscription' | null>(null);
  const [selectedNewsId, setSelectedNewsId] = useState<number | null>(null);
  const [newsDraft, setNewsDraft] = useState<AdminNewsItem | null>(null);
  const [newsTagDropdownOpen, setNewsTagDropdownOpen] = useState(false);
  const [saveModal, setSaveModal] = useState<{ title: string; message: string } | null>(null);
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementTarget, setAnnouncementTarget] = useState<'all' | 'subscribers' | 'free' | 'specific'>('all');
  const [announcementUsers, setAnnouncementUsers] = useState('');
  const [announcementSent, setAnnouncementSent] = useState(false);

  const selectedUser = userDraft;
  const selectedNews = newsDraft;

  const getUserTotalPoints = (user: AdminUser) => user.bookPoints + user.seriesPoints + user.moviePoints;

  const userSummary = useMemo(() => ({
    premium: users.filter(user => user.subscription !== 'free').length,
    staff: users.filter(user => user.permissionLevel === 'moderator' || user.permissionLevel === 'admin').length,
    banned: users.filter(user => user.permissionLevel === 'banned').length,
    activeToday: users.filter(user => user.lastLoginDate >= '2026-03-13').length,
  }), [users]);

  // Szűrt felhasználók
  const filteredUsers = useMemo(() => {
    let items = users;

    if (userTypeFilter === 'premium') {
      items = items.filter(user => user.subscription !== 'free');
    }

    if (userTypeFilter === 'staff') {
      items = items.filter(user => user.permissionLevel === 'moderator' || user.permissionLevel === 'admin');
    }

    if (userTypeFilter === 'banned') {
      items = items.filter(user => user.permissionLevel === 'banned');
    }

    if (!userSearch.trim()) return items;

    const q = userSearch.toLowerCase();
    return items.filter(user =>
      user.username.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q) ||
      user.countryCode.toLowerCase().includes(q)
    );
  }, [users, userSearch, userTypeFilter]);

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
      n.content.toLowerCase().includes(q) ||
      n.eventTag.toLowerCase().includes(q)
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
    setSaveModal({
      title: 'Mentés kész',
      message: `${section} módosításai sikeresen mentve lettek.`,
    });
  };

  const openUserModal = (user: AdminUser) => {
    setSelectedUserId(user.id);
    setUserDraft({ ...user });
  };

  const openNewsModal = (item: AdminNewsItem) => {
    setSelectedNewsId(item.id);
    setNewsDraft({ ...item });
    setNewsTagDropdownOpen(false);
  };

  const closeUserModal = () => {
    setSelectedUserId(null);
    setUserDraft(null);
    setActiveUserDropdown(null);
  };

  const closeNewsModal = () => {
    setSelectedNewsId(null);
    setNewsDraft(null);
    setNewsTagDropdownOpen(false);
  };

  const updateUserDraft = <K extends keyof AdminUser>(field: K, value: AdminUser[K]) => {
    setUserDraft(prev => prev ? { ...prev, [field]: value } : prev);
  };

  const saveUserDraft = () => {
    if (!userDraft) return;

    const normalizedUser: AdminUser = {
      ...userDraft,
      premiumExpiresAt: userDraft.subscription === 'free' ? null : userDraft.premiumExpiresAt,
    };

    setUsers(prev => prev.map(user =>
      user.id === normalizedUser.id ? normalizedUser : user
    ));

    closeUserModal();
  };

  const updateNewsDraft = <K extends keyof AdminNewsItem>(field: K, value: AdminNewsItem[K]) => {
    setNewsDraft(prev => prev ? { ...prev, [field]: value } : prev);
  };

  const saveNewsDraft = () => {
    if (!newsDraft) return;

    const normalizedNews: AdminNewsItem = {
      ...newsDraft,
      updatedAt: new Date().toISOString(),
    };

    setNews(prev => prev.map(item =>
      item.id === normalizedNews.id ? normalizedNews : item
    ));

    closeNewsModal();
    setSaveModal({
      title: 'Cikk frissítve',
      message: 'A hír adatai sikeresen elmentésre kerültek.',
    });
  };

  useEffect(() => {
    if (!selectedUserId && !selectedNewsId) return;

    const scrollY = window.scrollY;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (selectedUserId) closeUserModal();
        if (selectedNewsId) closeNewsModal();
      }
    };

    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.height = '100%';
    document.body.style.overflow = 'hidden';
    document.body.style.height = '100%';
    document.body.style.touchAction = 'none';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.documentElement.style.overflow = '';
      document.documentElement.style.height = '';
      document.body.style.overflow = '';
      document.body.style.height = '';
      document.body.style.touchAction = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.removeEventListener('keydown', handleKeyDown);
      window.scrollTo(0, scrollY);
    };
  }, [selectedUserId, selectedNewsId]);

  useEffect(() => {
    if (!selectedUserId && !selectedNewsId) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.admin-custom-select')) {
        setActiveUserDropdown(null);
        setNewsTagDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedUserId, selectedNewsId]);

  const getUserHealth = (user: AdminUser) => {
    if (user.permissionLevel === 'banned') return 'Korlátozott';
    if (user.subscription !== 'free') return 'Prémium aktív';
    if (user.dayStreak >= 30) return 'Magasan aktív';
    return 'Normál';
  };

  const permissionLevelLabels: Record<AdminUser['permissionLevel'], string> = {
    user: 'USER',
    moderator: 'MODERATOR',
    admin: 'ADMIN',
    banned: 'BANNED',
  };

  const subscriptionLabels: Record<AdminUser['subscription'], string> = {
    free: 'FREE',
    premium: 'PREMIUM',
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
  const getRoleBadge = (permissionLevel: AdminUser['permissionLevel']) => {
    switch (permissionLevel) {
      case 'admin': return <span className="admin-badge admin-badge-red">Admin</span>;
      case 'moderator': return <span className="admin-badge admin-badge-blue">Moderátor</span>;
      case 'banned': return <span className="admin-badge admin-badge-red">Banned</span>;
      default: return <span className="admin-badge admin-badge-gray">Felhasználó</span>;
    }
  };

  const getSubBadge = (sub: AdminUser['subscription']) => {
    switch (sub) {
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

  const getEventTagBadge = (eventTag: AdminNewsItem['eventTag']) => {
    switch (eventTag) {
      case 'UPDATE': return <span className="admin-badge admin-badge-blue">UPDATE</span>;
      case 'ANNOUNCEMENT': return <span className="admin-badge admin-badge-yellow">ANNOUNCEMENT</span>;
      case 'EVENT': return <span className="admin-badge admin-badge-green">EVENT</span>;
      case 'FUNCTION': return <span className="admin-badge admin-badge-purple">FUNCTION</span>;
      default: return null;
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
              <div className="admin-users-overview">
                <div className="admin-users-stat">
                  <span className="admin-users-stat-label">Prémium fiókok</span>
                  <strong>{userSummary.premium}</strong>
                  <small>{Math.round((userSummary.premium / users.length) * 100)}% konverzió</small>
                </div>
                <div className="admin-users-stat">
                  <span className="admin-users-stat-label">Stáb tagok</span>
                  <strong>{userSummary.staff}</strong>
                  <small>moderátor + admin jogosultság</small>
                </div>
                <div className="admin-users-stat admin-users-stat-alert">
                  <span className="admin-users-stat-label">Korlátozott fiókok</span>
                  <strong>{userSummary.banned}</strong>
                  <small>permissionLevel = banned</small>
                </div>
                <div className="admin-users-stat">
                  <span className="admin-users-stat-label">Mai belépések</span>
                  <strong>{userSummary.activeToday}</strong>
                  <small>utolsó login alapján</small>
                </div>
              </div>

              <div className="admin-card">
                <div className="admin-card-header">
                  <h3 className="admin-card-title">
                    <i className="bi bi-people-fill me-2"></i>
                    Felhasználók kezelése
                    <span className="admin-count">{users.length}</span>
                  </h3>
                  <div className="admin-header-controls">
                    <div className="admin-filter-pills">
                      {([
                        { key: 'all', label: 'Minden user' },
                        { key: 'premium', label: 'Prémium' },
                        { key: 'staff', label: 'Stáb' },
                        { key: 'banned', label: 'Korlátozott' },
                      ] as const).map(filter => (
                        <button
                          key={filter.key}
                          className={`admin-pill ${userTypeFilter === filter.key ? 'active' : ''}`}
                          onClick={() => setUserTypeFilter(filter.key)}
                        >
                          {filter.label}
                        </button>
                      ))}
                    </div>

                    <div className="admin-search">
                      <i className="bi bi-search"></i>
                      <input
                        type="text"
                        placeholder="Keresés név, e-mail vagy országkód alapján..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Felhasználó</th>
                        <th>Hozzáférés</th>
                        <th>Előfizetés</th>
                        <th>Haladás</th>
                        <th>Összpont</th>
                        <th>Utolsó login</th>
                        <th>Regisztráció</th>
                        <th>Állapot</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(user => (
                        <tr
                          key={user.id}
                          className={user.permissionLevel === 'banned' ? 'banned-row admin-user-row' : 'admin-user-row'}
                          onClick={() => openUserModal(user)}
                        >
                          <td>
                            <div className="admin-user-cell">
                              <img src={user.avatar} alt={user.username} className="admin-user-avatar" />
                              <div>
                                <div className="admin-user-name">{user.username}</div>
                                <div className="admin-user-email">{user.email}</div>
                                <div className="admin-user-meta">#{user.id} · {user.countryCode}</div>
                              </div>
                            </div>
                          </td>
                          <td>{getRoleBadge(user.permissionLevel)}</td>
                          <td className="admin-user-subscription-cell">
                            <div className="admin-user-subscription">
                              {getSubBadge(user.subscription)}
                              <small>{user.subscription === 'premium' && user.premiumExpiresAt ? `Lejár: ${new Date(user.premiumExpiresAt).toLocaleDateString('hu-HU')}` : 'Nincs előfizetés'}</small>
                            </div>
                          </td>
                          <td>
                            <div className="admin-user-progress">
                              <span className="admin-level">Lv.{user.level}</span>
                              <small>{user.xp} XP · {user.dayStreak} napos streak</small>
                            </div>
                          </td>
                          <td>
                            <div className="admin-user-points">
                              <strong>{getUserTotalPoints(user).toLocaleString('hu-HU')}</strong>
                              <small>Könyv {user.bookPoints} · Média {(user.seriesPoints + user.moviePoints).toLocaleString('hu-HU')}</small>
                            </div>
                          </td>
                          <td>{new Date(user.lastLoginDate).toLocaleDateString('hu-HU')}</td>
                          <td>{new Date(user.joinDate).toLocaleDateString('hu-HU')}</td>
                          <td>
                            <span className={`admin-badge ${user.permissionLevel === 'banned' ? 'admin-badge-red' : user.subscription !== 'free' ? 'admin-badge-gold' : 'admin-badge-green'}`}>
                              {getUserHealth(user)}
                            </span>
                          </td>
                          <td>
                            <div className="admin-actions">
                              <button className="admin-btn-icon" title="Felhasználó szerkesztése" onClick={(event) => {
                                event.stopPropagation();
                                openUserModal(user);
                              }}>
                                <i className="bi bi-sliders2"></i>
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
                    Módosítások mentése
                  </button>
                </div>
              </div>

              {selectedUser && (
                <div className="admin-user-modal-backdrop" onClick={closeUserModal}>
                  <div className="admin-user-modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="admin-user-modal-title">
                    <div className="admin-user-modal-header">
                      <div className="admin-user-modal-title-wrap">
                        <div className="admin-user-modal-avatar-wrap">
                          <img src={selectedUser.avatar} alt={selectedUser.username} className="admin-user-modal-avatar" />
                        </div>
                        <div>
                          <h3 id="admin-user-modal-title">{selectedUser.username}</h3>
                          <p>{selectedUser.email}</p>
                        </div>
                      </div>
                      <button className="admin-user-modal-close" onClick={closeUserModal} aria-label="Bezárás">
                        <i className="bi bi-x-lg"></i>
                      </button>
                    </div>

                    <div className="admin-user-modal-body">
                      <div className="admin-user-modal-sidebar">
                        <div className="admin-user-snapshot">
                          <span className="admin-user-snapshot-label">Regisztráció</span>
                          <strong>{new Date(selectedUser.joinDate).toLocaleDateString('hu-HU')}</strong>
                        </div>
                        <div className="admin-user-snapshot">
                          <span className="admin-user-snapshot-label">Utolsó login</span>
                          <strong>{new Date(selectedUser.lastLoginDate).toLocaleDateString('hu-HU')}</strong>
                        </div>
                        <div className="admin-user-snapshot">
                          <span className="admin-user-snapshot-label">Összpont</span>
                          <strong>{getUserTotalPoints(selectedUser).toLocaleString('hu-HU')}</strong>
                        </div>
                        <div className="admin-user-snapshot">
                          <span className="admin-user-snapshot-label">Aktivitás</span>
                          <strong>{selectedUser.readTimeMin + selectedUser.watchTimeMin} perc</strong>
                        </div>
                      </div>

                      <div className="admin-user-modal-form">
                        <div className="admin-user-form-section">
                          <h4>Hozzáférés és moderáció</h4>
                          <div className="admin-user-form-grid">
                            <label className="admin-user-field">
                              <span>Permission level</span>
                              <div className="admin-custom-select">
                                <button
                                  type="button"
                                  className="admin-custom-select-trigger"
                                  aria-expanded={activeUserDropdown === 'permissionLevel'}
                                  onClick={() => setActiveUserDropdown(prev => prev === 'permissionLevel' ? null : 'permissionLevel')}
                                >
                                  <span>{permissionLevelLabels[selectedUser.permissionLevel]}</span>
                                </button>
                                <div className={`admin-custom-select-menu ${activeUserDropdown === 'permissionLevel' ? 'show' : ''}`}>
                                  {(['user', 'moderator', 'admin', 'banned'] as const).map(option => (
                                    <button
                                      key={option}
                                      type="button"
                                      className={`admin-custom-select-option ${selectedUser.permissionLevel === option ? 'active' : ''}`}
                                      onClick={() => {
                                        updateUserDraft('permissionLevel', option);
                                        setActiveUserDropdown(null);
                                      }}
                                    >
                                      {permissionLevelLabels[option]}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </label>

                            <label className="admin-user-field">
                              <span>Országkód</span>
                              <input value={selectedUser.countryCode} maxLength={2} onChange={(event) => updateUserDraft('countryCode', event.target.value.toUpperCase())} />
                            </label>

                            <label className="admin-user-field">
                              <span>Előfizetés</span>
                              <div className="admin-custom-select">
                                <button
                                  type="button"
                                  className="admin-custom-select-trigger"
                                  aria-expanded={activeUserDropdown === 'subscription'}
                                  onClick={() => setActiveUserDropdown(prev => prev === 'subscription' ? null : 'subscription')}
                                >
                                  <span>{subscriptionLabels[selectedUser.subscription]}</span>
                                </button>
                                <div className={`admin-custom-select-menu ${activeUserDropdown === 'subscription' ? 'show' : ''}`}>
                                  {(['free', 'premium'] as const).map(option => (
                                    <button
                                      key={option}
                                      type="button"
                                      className={`admin-custom-select-option ${selectedUser.subscription === option ? 'active' : ''}`}
                                      onClick={() => {
                                        updateUserDraft('subscription', option);
                                        if (option === 'free') {
                                          updateUserDraft('premiumExpiresAt', null);
                                        }
                                        setActiveUserDropdown(null);
                                      }}
                                    >
                                      {subscriptionLabels[option]}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </label>

                            <label className="admin-user-field">
                              <span>Prémium lejárat</span>
                              <input type="date" value={selectedUser.premiumExpiresAt ?? ''} onChange={(event) => updateUserDraft('premiumExpiresAt', event.target.value || null)} />
                            </label>
                          </div>
                        </div>

                        <div className="admin-user-form-section">
                          <h4>Haladás és pontok</h4>
                          <div className="admin-user-form-grid">
                            <label className="admin-user-field">
                              <span>Szint</span>
                              <input type="number" min={1} value={selectedUser.level} onChange={(event) => updateUserDraft('level', Number(event.target.value))} />
                            </label>

                            <label className="admin-user-field">
                              <span>XP</span>
                              <input type="number" min={0} value={selectedUser.xp} onChange={(event) => updateUserDraft('xp', Number(event.target.value))} />
                            </label>

                            <label className="admin-user-field">
                              <span>Könyv pontok</span>
                              <input type="number" min={0} value={selectedUser.bookPoints} onChange={(event) => updateUserDraft('bookPoints', Number(event.target.value))} />
                            </label>

                            <label className="admin-user-field">
                              <span>Sorozat pontok</span>
                              <input type="number" min={0} value={selectedUser.seriesPoints} onChange={(event) => updateUserDraft('seriesPoints', Number(event.target.value))} />
                            </label>

                            <label className="admin-user-field">
                              <span>Film pontok</span>
                              <input type="number" min={0} value={selectedUser.moviePoints} onChange={(event) => updateUserDraft('moviePoints', Number(event.target.value))} />
                            </label>

                            <label className="admin-user-field">
                              <span>Napi streak</span>
                              <input type="number" min={0} value={selectedUser.dayStreak} onChange={(event) => updateUserDraft('dayStreak', Number(event.target.value))} />
                            </label>
                          </div>
                        </div>

                        <div className="admin-user-form-section">
                          <h4>Elköteleződés</h4>
                          <div className="admin-user-form-grid">
                            <label className="admin-user-field">
                              <span>Olvasási idő (perc)</span>
                              <input type="number" min={0} value={selectedUser.readTimeMin} onChange={(event) => updateUserDraft('readTimeMin', Number(event.target.value))} />
                            </label>

                            <label className="admin-user-field">
                              <span>Nézési idő (perc)</span>
                              <input type="number" min={0} value={selectedUser.watchTimeMin} onChange={(event) => updateUserDraft('watchTimeMin', Number(event.target.value))} />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="admin-user-modal-footer">
                      <button className="admin-user-secondary-btn" onClick={closeUserModal}>Mégse</button>
                      <button className="admin-send-btn" onClick={saveUserDraft}>
                        <i className="bi bi-check2-circle me-2"></i>
                        Felhasználó mentése
                      </button>
                    </div>
                  </div>
                </div>
              )}

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
                    Hírcikkek kezelése
                    <span className="admin-count">{news.length}</span>
                  </h3>
                  <div className="admin-search">
                    <i className="bi bi-search"></i>
                    <input
                      type="text"
                      placeholder="Keresés cím, tartalom vagy EventTag alapján..."
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
                        <th>Tartalom</th>
                        <th>EventTag</th>
                        <th>Létrehozva</th>
                        <th>Frissítve</th>
                        <th>Műveletek</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredNews.map(item => (
                        <tr key={item.id} className="admin-news-row" onClick={() => openNewsModal(item)}>
                          <td><span className="admin-news-title">{item.title}</span></td>
                          <td>
                            <p className="admin-news-preview">
                              {item.content.length > 110 ? `${item.content.slice(0, 110)}...` : item.content}
                            </p>
                          </td>
                          <td>{getEventTagBadge(item.eventTag)}</td>
                          <td>{new Date(item.createdAt).toLocaleString('hu-HU')}</td>
                          <td>{new Date(item.updatedAt).toLocaleString('hu-HU')}</td>
                          <td>
                            <div className="admin-actions">
                              <button
                                className="admin-btn-icon"
                                title="Cikk szerkesztése"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  openNewsModal(item);
                                }}
                              >
                                <i className="bi bi-pencil-fill"></i>
                              </button>
                              <button
                                className="admin-btn-icon text-danger"
                                title="Törlés"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  deleteNews(item.id);
                                }}
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

              {selectedNews && (
                <div className="admin-news-modal-backdrop" onClick={closeNewsModal}>
                  <div className="admin-news-modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="admin-news-modal-title">
                    <div className="admin-news-modal-header">
                      <div>
                        <h3 id="admin-news-modal-title">Cikk szerkesztése</h3>
                        <p>Az article tábla mezőihez igazítva: Title, Content, EventTag, CreatedAt, updated_at.</p>
                      </div>
                      <button className="admin-user-modal-close" onClick={closeNewsModal} aria-label="Bezárás">
                        <i className="bi bi-x-lg"></i>
                      </button>
                    </div>

                    <div className="admin-news-modal-body">
                      <div className="admin-news-meta-grid">
                        <div className="admin-user-snapshot">
                          <span className="admin-user-snapshot-label">Article ID</span>
                          <strong>#{selectedNews.id}</strong>
                        </div>
                        <div className="admin-user-snapshot">
                          <span className="admin-user-snapshot-label">Létrehozva</span>
                          <strong>{new Date(selectedNews.createdAt).toLocaleString('hu-HU')}</strong>
                        </div>
                        <div className="admin-user-snapshot">
                          <span className="admin-user-snapshot-label">Utolsó frissítés</span>
                          <strong>{new Date(selectedNews.updatedAt).toLocaleString('hu-HU')}</strong>
                        </div>
                      </div>

                      <div className="admin-user-form-section">
                        <div className="admin-user-form-grid">
                          <label className="admin-user-field admin-user-field-wide">
                            <span>Cím</span>
                            <input
                              value={selectedNews.title}
                              onChange={(event) => updateNewsDraft('title', event.target.value)}
                              maxLength={256}
                            />
                          </label>

                          <label className="admin-user-field">
                            <span>EventTag</span>
                            <div className="admin-custom-select">
                              <button
                                type="button"
                                className="admin-custom-select-trigger"
                                aria-expanded={newsTagDropdownOpen}
                                onClick={() => setNewsTagDropdownOpen(prev => !prev)}
                              >
                                <span>{selectedNews.eventTag}</span>
                              </button>

                              <div className={`admin-custom-select-menu ${newsTagDropdownOpen ? 'show' : ''}`}>
                                {(['UPDATE', 'ANNOUNCEMENT', 'EVENT', 'FUNCTION'] as const).map(option => (
                                  <button
                                    key={option}
                                    type="button"
                                    className={`admin-custom-select-option ${selectedNews.eventTag === option ? 'active' : ''}`}
                                    onClick={() => {
                                      updateNewsDraft('eventTag', option);
                                      setNewsTagDropdownOpen(false);
                                    }}
                                  >
                                    {option}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </label>

                          <label className="admin-user-field admin-user-field-wide">
                            <span>Tartalom</span>
                            <textarea
                              className="admin-textarea admin-news-textarea"
                              value={selectedNews.content}
                              onChange={(event) => updateNewsDraft('content', event.target.value)}
                              maxLength={4000}
                              rows={8}
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="admin-user-modal-footer">
                      <button className="admin-user-secondary-btn" onClick={closeNewsModal}>Mégse</button>
                      <button className="admin-send-btn" onClick={saveNewsDraft}>
                        <i className="bi bi-check2-circle me-2"></i>
                        Cikk mentése
                      </button>
                    </div>
                  </div>
                </div>
              )}
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

          {saveModal && (
            <div className="admin-save-modal-backdrop" onClick={() => setSaveModal(null)}>
              <div className="admin-save-modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="admin-save-modal-title">
                <div className="admin-save-modal-icon">
                  <i className="bi bi-check2-circle"></i>
                </div>
                <h4 id="admin-save-modal-title">{saveModal.title}</h4>
                <p>{saveModal.message}</p>
                <button className="admin-send-btn" onClick={() => setSaveModal(null)}>
                  Rendben
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Admin;
