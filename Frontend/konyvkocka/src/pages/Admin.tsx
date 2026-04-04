import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  ApiHttpError,
  getAdminChallengeOptions,
  getAdminChallenges,
  getAdminOverview,
  getAdminNews,
  getAdminPurchases,
  sendAdminAnnouncement,
  updateAdminChallenge,
  updateAdminNews,
  type AdminChallengeBadgeOptionResponse,
  type AdminChallengeItemResponse,
  type AdminChallengeTitleOptionResponse,
  type AdminOverviewResponse,
  type AdminNewsItemResponse,
  type AdminPurchaseItemResponse,
} from '../services/api';
import '../styles/admin.css';

// ========================
// TÍPUSOK
// ========================

type AdminTab = 'overview' | 'users' | 'content' | 'news' | 'challenges' | 'purchases' | 'announcements';

interface StatCard {
  label: string;
  value: string;
  change: string;
  changeType: 'up' | 'down' | 'neutral';
  icon: string;
  color: string;
}

interface OverviewActivityItem {
  icon: string;
  color: string;
  text: string;
  time: string;
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
  contentType: 'BOOK' | 'MOVIE' | 'SERIES';
  title: string;
  released: number;
  rating: number;
  description: string;
  ageRatingId: number | null;
  trailerUrl: string | null;
  rewardXP: number;
  rewardPoints: number;
  hasSubtitles: boolean;
  isOriginalLanguage: boolean;
  isOfflineAvailable: boolean;
  updatedAt: string | null;
  coverOrPosterApiName: string;
  pageNum: number | null;
  bookType: 'BOOK' | 'AUDIOBOOK' | 'EBOOK' | null;
  pdfUrl: string | null;
  audioUrl: string | null;
  epubUrl: string | null;
  audioLength: number | null;
  narratorName: string | null;
  originalLanguage: string | null;
  streamUrl: string | null;
  length: number | null;
  tagIds: number[];
}

interface AdminTagOption {
  id: number;
  name: string;
}

interface AdminNewsItem {
  id: number;
  title: string;
  content: string;
  eventTag: 'UPDATE' | 'ANNOUNCEMENT' | 'EVENT' | 'FUNCTION';
  createdAt: string;
  updatedAt: string | null;
}

interface AdminNewsSummary {
  total: number;
  updates: number;
  announcements: number;
  events: number;
  functions: number;
}

type AdminChallengeDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'EPIC';

interface AdminChallenge {
  id: number;
  title: string;
  description: string;
  iconUrl: string | null;
  type: 'READ' | 'WATCH' | 'SOCIAL' | 'MIXED' | 'DEDICATION' | 'EVENT';
  targetValue: number;
  rewardXP: number;
  rewardBadgeId: number | null;
  rewardTitleId: number | null;
  difficulty: AdminChallengeDifficulty;
  isActive: boolean;
  isRepeatable: boolean;
  createdAt: string;
  participants: number;
  completions: number;
}

interface AdminChallengeSummary {
  total: number;
  active: number;
  repeatable: number;
  event: number;
}

interface AdminBadgeOption {
  id: number;
  name: string;
  category: 'EVENT' | 'STREAK' | 'READING' | 'WATCHING' | 'SOCIAL' | 'SPECIAL';
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  isHidden: boolean;
}

interface AdminTitleOption {
  id: number;
  name: string;
  description: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
}

// ========================
// MOCK ADATOK
// ========================

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
  {
    id: 1,
    contentType: 'BOOK',
    title: 'A szel arnyeka',
    released: 2001,
    rating: 9.2,
    description: 'Barcelonaban egy fiatal fiu egy kulonleges konyvet talal a Feledett Konyvek Temetojeben.',
    ageRatingId: 2,
    trailerUrl: null,
    rewardXP: 120,
    rewardPoints: 60,
    hasSubtitles: false,
    isOriginalLanguage: true,
    isOfflineAvailable: true,
    updatedAt: '2026-03-12T09:45:00',
    coverOrPosterApiName: 'https://moly.hu/system/covers/big/covers_582574.jpg',
    pageNum: 560,
    bookType: 'BOOK',
    pdfUrl: 'https://example.com/books/szel-arnyeka.pdf',
    audioUrl: null,
    epubUrl: 'https://example.com/books/szel-arnyeka.epub',
    audioLength: null,
    narratorName: null,
    originalLanguage: 'es',
    streamUrl: null,
    length: null,
    tagIds: [1, 3, 7],
  },
  {
    id: 2,
    contentType: 'MOVIE',
    title: 'Inception',
    released: 2010,
    rating: 9.5,
    description: 'Egy kulonleges csapat alommanipulacioval probal beultetni egy otletet.',
    ageRatingId: 4,
    trailerUrl: 'https://www.youtube.com/watch?v=YoHD9XEInc0',
    rewardXP: 80,
    rewardPoints: 40,
    hasSubtitles: true,
    isOriginalLanguage: true,
    isOfflineAvailable: false,
    updatedAt: '2026-03-10T15:30:00',
    coverOrPosterApiName: 'https://image.tmdb.org/t/p/w500/ljsZTbVsrQSqZgWeep2B1QiDKuh.jpg',
    pageNum: null,
    bookType: null,
    pdfUrl: null,
    audioUrl: null,
    epubUrl: null,
    audioLength: null,
    narratorName: null,
    originalLanguage: null,
    streamUrl: 'https://cdn.konyvkocka.local/stream/inception.m3u8',
    length: 148,
    tagIds: [2, 4, 8],
  },
  {
    id: 3,
    contentType: 'SERIES',
    title: 'Breaking Bad',
    released: 2008,
    rating: 9.7,
    description: 'Egy kemiatanar a csaladja jovojeert drogkartell-vilagba sodrodik.',
    ageRatingId: 5,
    trailerUrl: 'https://www.youtube.com/watch?v=HhesaQXLuRY',
    rewardXP: 150,
    rewardPoints: 75,
    hasSubtitles: true,
    isOriginalLanguage: true,
    isOfflineAvailable: false,
    updatedAt: '2026-03-09T19:10:00',
    coverOrPosterApiName: 'https://image.tmdb.org/t/p/w500/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg',
    pageNum: null,
    bookType: null,
    pdfUrl: null,
    audioUrl: null,
    epubUrl: null,
    audioLength: null,
    narratorName: null,
    originalLanguage: null,
    streamUrl: null,
    length: null,
    tagIds: [3, 4, 8],
  },
  {
    id: 4,
    contentType: 'BOOK',
    title: '1984',
    released: 1949,
    rating: 9.1,
    description: 'Disztopikus regeny totalis megfigyelesrol es az igazsag manipulalasarol.',
    ageRatingId: 3,
    trailerUrl: null,
    rewardXP: 110,
    rewardPoints: 55,
    hasSubtitles: false,
    isOriginalLanguage: false,
    isOfflineAvailable: true,
    updatedAt: '2026-03-11T11:25:00',
    coverOrPosterApiName: 'https://moly.hu/system/covers/big/covers_227576.jpg',
    pageNum: 328,
    bookType: 'EBOOK',
    pdfUrl: 'https://example.com/books/1984.pdf',
    audioUrl: null,
    epubUrl: 'https://example.com/books/1984.epub',
    audioLength: null,
    narratorName: null,
    originalLanguage: 'en',
    streamUrl: null,
    length: null,
    tagIds: [1, 7],
  },
  {
    id: 5,
    contentType: 'MOVIE',
    title: 'Interstellar',
    released: 2014,
    rating: 9.8,
    description: 'Egy csapat urhajos uj lakhelyet keres az emberisegnek.',
    ageRatingId: 4,
    trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
    rewardXP: 95,
    rewardPoints: 45,
    hasSubtitles: true,
    isOriginalLanguage: true,
    isOfflineAvailable: true,
    updatedAt: '2026-03-13T08:40:00',
    coverOrPosterApiName: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    pageNum: null,
    bookType: null,
    pdfUrl: null,
    audioUrl: null,
    epubUrl: null,
    audioLength: null,
    narratorName: null,
    originalLanguage: null,
    streamUrl: 'https://cdn.konyvkocka.local/stream/interstellar.m3u8',
    length: 169,
    tagIds: [2, 3, 8],
  },
  {
    id: 6,
    contentType: 'BOOK',
    title: 'Dune',
    released: 1965,
    rating: 8.8,
    description: 'Sci-fi klasszikus a hatalomrol, hitrol es tulelesrol az Arrakis bolygon.',
    ageRatingId: 3,
    trailerUrl: null,
    rewardXP: 130,
    rewardPoints: 65,
    hasSubtitles: false,
    isOriginalLanguage: true,
    isOfflineAvailable: true,
    updatedAt: '2026-03-07T16:55:00',
    coverOrPosterApiName: 'https://marvin.bline.hu/product_images/920/ID250-141842.JPG',
    pageNum: 688,
    bookType: 'AUDIOBOOK',
    pdfUrl: null,
    audioUrl: '/assets/audio/dune.mp3',
    epubUrl: 'https://example.com/books/dune.epub',
    audioLength: 4100,
    narratorName: 'Simon Vance',
    originalLanguage: 'en',
    streamUrl: null,
    length: null,
    tagIds: [2, 5, 7],
  },
];

const MOCK_TAG_OPTIONS: AdminTagOption[] = [
  { id: 1, name: 'Klasszikus' },
  { id: 2, name: 'Sci-Fi' },
  { id: 3, name: 'Drama' },
  { id: 4, name: 'Thriller' },
  { id: 5, name: 'Fantasy' },
  { id: 6, name: 'Akcio' },
  { id: 7, name: 'Bestseller' },
  { id: 8, name: 'Dijazott' },
];

const MOCK_CHALLENGES: AdminChallenge[] = [
  {
    id: 1,
    title: 'Első lépések',
    description: 'Olvass el 3 fejezetet bármely könyvből.',
    iconUrl: null,
    type: 'READ',
    targetValue: 3,
    rewardXP: 120,
    rewardBadgeId: 1,
    rewardTitleId: null,
    difficulty: 'EASY',
    isActive: true,
    isRepeatable: true,
    createdAt: '2024-01-01T09:00:00',
    participants: 8420,
    completions: 6210,
  },
  {
    id: 2,
    title: 'Könyvmoly',
    description: 'Teljesíts 12 olvasási sessiont 7 nap alatt.',
    iconUrl: null,
    type: 'DEDICATION',
    targetValue: 12,
    rewardXP: 420,
    rewardBadgeId: 2,
    rewardTitleId: 2,
    difficulty: 'HARD',
    isActive: true,
    isRepeatable: false,
    createdAt: '2024-01-01T09:30:00',
    participants: 3200,
    completions: 890,
  },
  {
    id: 3,
    title: 'Filmmánia',
    description: 'Nézz meg 5 filmet ezen a héten.',
    iconUrl: null,
    type: 'WATCH',
    targetValue: 5,
    rewardXP: 260,
    rewardBadgeId: 4,
    rewardTitleId: null,
    difficulty: 'MEDIUM',
    isActive: true,
    isRepeatable: true,
    createdAt: '2024-03-15T12:00:00',
    participants: 5100,
    completions: 2340,
  },
  {
    id: 4,
    title: '30 napos olvasási maraton',
    description: 'Legalabb 20 nap olvasás egy 30 napos ablakban.',
    iconUrl: null,
    type: 'EVENT',
    targetValue: 20,
    rewardXP: 780,
    rewardBadgeId: 2,
    rewardTitleId: 3,
    difficulty: 'EPIC',
    isActive: true,
    isRepeatable: false,
    createdAt: '2025-01-01T08:00:00',
    participants: 1240,
    completions: 156,
  },
  {
    id: 5,
    title: 'Téli kihívás',
    description: 'Olvass és nézz összesen 15 tartalmat a szezonban.',
    iconUrl: null,
    type: 'MIXED',
    targetValue: 15,
    rewardXP: 500,
    rewardBadgeId: 3,
    rewardTitleId: 4,
    difficulty: 'HARD',
    isActive: false,
    isRepeatable: false,
    createdAt: '2024-12-01T10:00:00',
    participants: 2890,
    completions: 410,
  },
];

// ========================
// KOMPONENS
// ========================

const Admin: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const hasAdminAccess = Boolean(user && (user.isAdmin || user.isModerator));
  const [overviewStats, setOverviewStats] = useState<StatCard[]>([]);
  const [overviewActivities, setOverviewActivities] = useState<OverviewActivityItem[]>([]);
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [overviewError, setOverviewError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [users, setUsers] = useState<AdminUser[]>(MOCK_USERS);
  const [content, setContent] = useState<AdminContent[]>(MOCK_CONTENT);
  const [news, setNews] = useState<AdminNewsItem[]>([]);
  const [newsTotalFromApi, setNewsTotalFromApi] = useState(0);
  const [newsSummary, setNewsSummary] = useState<AdminNewsSummary>({
    total: 0,
    updates: 0,
    announcements: 0,
    events: 0,
    functions: 0,
  });
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsSaving, setNewsSaving] = useState(false);
  const [challenges, setChallenges] = useState<AdminChallenge[]>([]);
  const [challengeTotalFromApi, setChallengeTotalFromApi] = useState(0);
  const [challengeSummary, setChallengeSummary] = useState<AdminChallengeSummary>({
    total: 0,
    active: 0,
    repeatable: 0,
    event: 0,
  });
  const [challengesLoading, setChallengesLoading] = useState(false);
  const [challengeSaving, setChallengeSaving] = useState(false);
  const [badges, setBadges] = useState<AdminBadgeOption[]>([]);
  const [titles, setTitles] = useState<AdminTitleOption[]>([]);
  const [tags] = useState<AdminTagOption[]>(MOCK_TAG_OPTIONS);
  const [userSearch, setUserSearch] = useState('');
  const [contentSearch, setContentSearch] = useState('');
  const [newsSearch, setNewsSearch] = useState('');
  const [challengeSearch, setChallengeSearch] = useState('');
  const [contentTypeFilter, setContentTypeFilter] = useState<'all' | 'BOOK' | 'MOVIE' | 'SERIES'>('all');
  const [userTypeFilter, setUserTypeFilter] = useState<'all' | 'premium' | 'staff' | 'banned'>('all');
  const [newsTypeFilter, setNewsTypeFilter] = useState<'all' | 'UPDATE' | 'ANNOUNCEMENT' | 'EVENT' | 'FUNCTION'>('all');
  const [challengeTypeFilter, setChallengeTypeFilter] = useState<'all' | 'READ' | 'WATCH' | 'SOCIAL' | 'MIXED' | 'DEDICATION' | 'EVENT'>('all');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [userDraft, setUserDraft] = useState<AdminUser | null>(null);
  const [activeUserDropdown, setActiveUserDropdown] = useState<'permissionLevel' | 'subscription' | null>(null);
  const [selectedContentId, setSelectedContentId] = useState<number | null>(null);
  const [contentDraft, setContentDraft] = useState<AdminContent | null>(null);
  const [activeContentDropdown, setActiveContentDropdown] = useState<'bookType' | 'tags' | null>(null);
  const [selectedNewsId, setSelectedNewsId] = useState<number | null>(null);
  const [newsDraft, setNewsDraft] = useState<AdminNewsItem | null>(null);
  const [newsTagDropdownOpen, setNewsTagDropdownOpen] = useState(false);
  const [selectedChallengeId, setSelectedChallengeId] = useState<number | null>(null);
  const [challengeDraft, setChallengeDraft] = useState<AdminChallenge | null>(null);
  const [activeChallengeDropdown, setActiveChallengeDropdown] = useState<'type' | 'difficulty' | 'badge' | 'title' | null>(null);
  const [saveModal, setSaveModal] = useState<{ title: string; message: string } | null>(null);
  const [saveModalClosing, setSaveModalClosing] = useState(false);
  const closeSaveModal = () => {
    setSaveModalClosing(true);
    setTimeout(() => {
      setSaveModal(null);
      setSaveModalClosing(false);
    }, 270);
  };
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementTarget, setAnnouncementTarget] = useState<'all' | 'subscribers' | 'free' | 'specific'>('all');
  const [announcementUsers, setAnnouncementUsers] = useState('');
  const [announcementSent, setAnnouncementSent] = useState(false);
  const [announcementSending, setAnnouncementSending] = useState(false);
  const [usersPage, setUsersPage] = useState(1);
  const [contentPage, setContentPage] = useState(1);
  const [newsPage, setNewsPage] = useState(1);
  const [challengesPage, setChallengesPage] = useState(1);
  const [purchasesData, setPurchasesData] = useState<AdminPurchaseItemResponse[]>([]);
  const [purchasesTotalFromApi, setPurchasesTotalFromApi] = useState(0);
  const [purchasesPage, setPurchasesPage] = useState(1);
  const [purchasesLoading, setPurchasesLoading] = useState(false);
  const [purchasesStatusFilter, setPurchasesStatusFilter] = useState<'all' | 'SUCCESS' | 'PENDING' | 'FAILED' | 'REFUNDED'>('all');
  const [purchasesSearch, setPurchasesSearch] = useState('');
  const pageSize = 4;

  const selectedUser = userDraft;
  const selectedContent = contentDraft;
  const selectedNews = newsDraft;
  const selectedChallenge = challengeDraft;

  const getUserTotalPoints = (user: AdminUser) => user.bookPoints + user.seriesPoints + user.moviePoints;

  const userSummary = useMemo(() => ({
    premium: users.filter(user => user.subscription !== 'free').length,
    staff: users.filter(user => user.permissionLevel === 'moderator' || user.permissionLevel === 'admin').length,
    banned: users.filter(user => user.permissionLevel === 'banned').length,
    activeToday: users.filter(user => user.lastLoginDate >= '2026-03-13').length,
  }), [users]);

  const contentSummary = useMemo(() => ({
    total: content.length,
    books: content.filter(item => item.contentType === 'BOOK').length,
    series: content.filter(item => item.contentType === 'SERIES').length,
    movies: content.filter(item => item.contentType === 'MOVIE').length,
  }), [content]);

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
      user.email.toLowerCase().includes(q)
    );
  }, [users, userSearch, userTypeFilter]);

  // Szűrt tartalmak
  const filteredContent = useMemo(() => {
    let items = content;
    if (contentTypeFilter !== 'all') {
      items = items.filter(c => c.contentType === contentTypeFilter);
    }
    if (contentSearch.trim()) {
      const q = contentSearch.toLowerCase();
      items = items.filter(c =>
        c.title.toLowerCase().includes(q)
      );
    }
    return items;
  }, [content, contentTypeFilter, contentSearch]);

  const getPaginationRange = (current: number, total: number): number[] => {
    const delta = 2;
    const start = Math.max(1, current - delta);
    const end = Math.min(total, current + delta);
    return Array.from({ length: end - start + 1 }, (_, idx) => start + idx);
  };

  const totalUserPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const pagedUsers = useMemo(() => {
    const start = (usersPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, usersPage]);

  const totalContentPages = Math.max(1, Math.ceil(filteredContent.length / pageSize));
  const pagedContent = useMemo(() => {
    const start = (contentPage - 1) * pageSize;
    return filteredContent.slice(start, start + pageSize);
  }, [filteredContent, contentPage]);

  const totalNewsPages = Math.max(1, Math.ceil(newsTotalFromApi / pageSize));
  const pagedNews = news;

  const totalChallengePages = Math.max(1, Math.ceil(challengeTotalFromApi / pageSize));
  const pagedChallenges = challenges;

  useEffect(() => {
    setUsersPage(1);
  }, [userSearch, userTypeFilter]);

  useEffect(() => {
    if (usersPage > totalUserPages) setUsersPage(totalUserPages);
  }, [usersPage, totalUserPages]);

  useEffect(() => {
    setContentPage(1);
  }, [contentSearch, contentTypeFilter]);

  useEffect(() => {
    if (contentPage > totalContentPages) setContentPage(totalContentPages);
  }, [contentPage, totalContentPages]);

  useEffect(() => {
    setNewsPage(1);
  }, [newsSearch, newsTypeFilter]);

  useEffect(() => {
    if (newsPage > totalNewsPages) setNewsPage(totalNewsPages);
  }, [newsPage, totalNewsPages]);

  useEffect(() => {
    setChallengesPage(1);
  }, [challengeSearch, challengeTypeFilter]);

  useEffect(() => {
    if (challengesPage > totalChallengePages) setChallengesPage(totalChallengePages);
  }, [challengesPage, totalChallengePages]);

  // Vásárlások betöltése API-ból
  const loadPurchases = useCallback(async () => {
    setPurchasesLoading(true);
    try {
      const statusParam = purchasesStatusFilter === 'all' ? undefined : purchasesStatusFilter;
      const data = await getAdminPurchases({
        page: purchasesPage,
        pageSize,
        status: statusParam,
        q: purchasesSearch,
      });
      setPurchasesData(data.purchases);
      setPurchasesTotalFromApi(data.total);
    } catch {
      setPurchasesData([]);
      setPurchasesTotalFromApi(0);
    } finally {
      setPurchasesLoading(false);
    }
  }, [purchasesPage, purchasesSearch, purchasesStatusFilter]);

  useEffect(() => {
    if (activeTab === 'purchases') {
      void loadPurchases();
    }
  }, [activeTab, loadPurchases]);

  useEffect(() => {
    setPurchasesPage(1);
  }, [purchasesSearch, purchasesStatusFilter]);

  const totalPurchasePages = Math.max(1, Math.ceil(purchasesTotalFromApi / pageSize));

  const filteredPurchasesForDisplay = purchasesData;

  const mapAdminNewsItem = useCallback((item: AdminNewsItemResponse): AdminNewsItem => ({
    id: item.id,
    title: item.title,
    content: item.content,
    eventTag: item.eventTag,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }), []);

  const loadNews = useCallback(async () => {
    setNewsLoading(true);
    try {
      const eventTagParam = newsTypeFilter === 'all' ? undefined : newsTypeFilter;
      const data = await getAdminNews({
        page: newsPage,
        pageSize,
        eventTag: eventTagParam,
        q: newsSearch,
      });
      setNews(data.news.map(mapAdminNewsItem));
      setNewsTotalFromApi(data.total);
      setNewsSummary(data.summary);
    } catch {
      setNews([]);
      setNewsTotalFromApi(0);
      setNewsSummary({
        total: 0,
        updates: 0,
        announcements: 0,
        events: 0,
        functions: 0,
      });
    } finally {
      setNewsLoading(false);
    }
  }, [mapAdminNewsItem, newsPage, newsSearch, newsTypeFilter]);

  const mapAdminChallengeItem = useCallback((item: AdminChallengeItemResponse): AdminChallenge => ({
    id: item.id,
    title: item.title,
    description: item.description,
    iconUrl: item.iconUrl,
    type: item.type,
    targetValue: item.targetValue,
    rewardXP: item.rewardXP,
    rewardBadgeId: item.rewardBadgeId,
    rewardTitleId: item.rewardTitleId,
    difficulty: item.difficulty,
    isActive: item.isActive,
    isRepeatable: item.isRepeatable,
    createdAt: item.createdAt,
    participants: item.participants,
    completions: item.completions,
  }), []);

  const mapAdminBadgeOption = useCallback((item: AdminChallengeBadgeOptionResponse): AdminBadgeOption => ({
    id: item.id,
    name: item.name,
    category: item.category as AdminBadgeOption['category'],
    rarity: item.rarity as AdminBadgeOption['rarity'],
    isHidden: item.isHidden,
  }), []);

  const mapAdminTitleOption = useCallback((item: AdminChallengeTitleOptionResponse): AdminTitleOption => ({
    id: item.id,
    name: item.name,
    description: item.description ?? '',
    rarity: item.rarity as AdminTitleOption['rarity'],
  }), []);

  const loadChallenges = useCallback(async () => {
    setChallengesLoading(true);
    try {
      const typeParam = challengeTypeFilter === 'all' ? undefined : challengeTypeFilter;
      const data = await getAdminChallenges({
        page: challengesPage,
        pageSize,
        type: typeParam,
        q: challengeSearch,
      });

      setChallenges(data.challenges.map(mapAdminChallengeItem));
      setChallengeTotalFromApi(data.total);
      setChallengeSummary(data.summary);
    } catch {
      setChallenges(MOCK_CHALLENGES);
      setChallengeTotalFromApi(MOCK_CHALLENGES.length);
      setChallengeSummary({
        total: MOCK_CHALLENGES.length,
        active: MOCK_CHALLENGES.filter(ch => ch.isActive).length,
        repeatable: MOCK_CHALLENGES.filter(ch => ch.isRepeatable).length,
        event: MOCK_CHALLENGES.filter(ch => ch.type === 'EVENT').length,
      });
    } finally {
      setChallengesLoading(false);
    }
  }, [challengeSearch, challengeTypeFilter, challengesPage, mapAdminChallengeItem]);

  const loadChallengeOptions = useCallback(async () => {
    try {
      const data = await getAdminChallengeOptions();
      setBadges(data.badges.map(mapAdminBadgeOption));
      setTitles(data.titles.map(mapAdminTitleOption));
    } catch {
      setBadges([]);
      setTitles([]);
    }
  }, [mapAdminBadgeOption, mapAdminTitleOption]);

  useEffect(() => {
    if (activeTab === 'news') {
      void loadNews();
    }
  }, [activeTab, loadNews]);

  useEffect(() => {
    if (activeTab === 'challenges') {
      void loadChallenges();
    }
  }, [activeTab, loadChallenges]);

  useEffect(() => {
    if (activeTab === 'challenges') {
      void loadChallengeOptions();
    }
  }, [activeTab, loadChallengeOptions]);

  const formatOverviewTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return 'Ismeretlen időpont';

    return date.toLocaleString('hu-HU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const loadOverview = useCallback(async () => {
    setOverviewLoading(true);
    setOverviewError(null);

    try {
      const data: AdminOverviewResponse = await getAdminOverview();
      setOverviewStats(data.stats.map((stat) => ({
        label: stat.label,
        value: stat.value,
        change: stat.change,
        changeType: stat.changeType,
        icon: stat.icon,
        color: stat.color,
      })));
      setOverviewActivities(data.activities.map((item) => ({
        icon: item.icon,
        color: item.color,
        text: item.text,
        time: formatOverviewTime(item.timestamp),
      })));
    } catch (error) {
      console.error('Admin overview betöltés sikertelen:', error);
      setOverviewStats([]);
      setOverviewActivities([]);
      setOverviewError('Az áttekintés adatok betöltése sikertelen.');
    } finally {
      setOverviewLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'overview') {
      void loadOverview();
    }
  }, [activeTab, loadOverview]);

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

  const openContentModal = (item: AdminContent) => {
    setSelectedContentId(item.id);
    setContentDraft({ ...item });
    setActiveContentDropdown(null);
  };

  const openNewsModal = (item: AdminNewsItem) => {
    setSelectedNewsId(item.id);
    setNewsDraft({ ...item });
    setNewsTagDropdownOpen(false);
  };

  const openChallengeModal = (item: AdminChallenge) => {
    setSelectedChallengeId(item.id);
    setChallengeDraft({ ...item });
    setActiveChallengeDropdown(null);
  };

  const closeUserModal = () => {
    setSelectedUserId(null);
    setUserDraft(null);
    setActiveUserDropdown(null);
  };

  const closeContentModal = () => {
    setSelectedContentId(null);
    setContentDraft(null);
    setActiveContentDropdown(null);
  };

  const closeNewsModal = () => {
    setSelectedNewsId(null);
    setNewsDraft(null);
    setNewsTagDropdownOpen(false);
  };

  const closeChallengeModal = () => {
    setSelectedChallengeId(null);
    setChallengeDraft(null);
    setActiveChallengeDropdown(null);
  };

  const updateUserDraft = <K extends keyof AdminUser>(field: K, value: AdminUser[K]) => {
    setUserDraft(prev => prev ? { ...prev, [field]: value } : prev);
  };

  const updateContentDraft = <K extends keyof AdminContent>(field: K, value: AdminContent[K]) => {
    setContentDraft(prev => prev ? { ...prev, [field]: value } : prev);
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

  const saveContentDraft = () => {
    if (!contentDraft) return;

    setContent(prev => prev.map(item =>
      item.id === contentDraft.id ? contentDraft : item
    ));

    closeContentModal();
  };

  const updateNewsDraft = <K extends keyof AdminNewsItem>(field: K, value: AdminNewsItem[K]) => {
    setNewsDraft(prev => prev ? { ...prev, [field]: value } : prev);
  };

  const saveNewsDraft = async () => {
    if (!newsDraft) return;

    const title = newsDraft.title.trim();
    const content = newsDraft.content.trim();
    if (!title || !content) {
      setSaveModal({
        title: 'Hiányzó mező',
        message: 'A cím és a tartalom kitöltése kötelező.',
      });
      return;
    }

    setNewsSaving(true);

    try {
      await updateAdminNews(newsDraft.id, {
        title,
        content,
        eventTag: newsDraft.eventTag,
      });

      await loadNews();

      closeNewsModal();
      setSaveModal({
        title: 'Cikk frissítve',
        message: 'A hír adatai sikeresen elmentésre kerültek.',
      });
    } catch {
      setSaveModal({
        title: 'Mentési hiba',
        message: 'A cikk mentése sikertelen. Kérlek próbáld újra.',
      });
    } finally {
      setNewsSaving(false);
    }
  };

  const updateChallengeDraft = <K extends keyof AdminChallenge>(field: K, value: AdminChallenge[K]) => {
    setChallengeDraft(prev => prev ? { ...prev, [field]: value } : prev);
  };

  const saveChallengeDraft = async () => {
    if (!challengeDraft) return;

    const title = challengeDraft.title.trim();
    const description = challengeDraft.description.trim();

    if (!title || !description) {
      setSaveModal({
        title: 'Hiányzó mező',
        message: 'A cím és a leírás kitöltése kötelező.',
      });
      return;
    }

    setChallengeSaving(true);

    try {
      await updateAdminChallenge(challengeDraft.id, {
        title,
        description,
        type: challengeDraft.type,
        targetValue: challengeDraft.targetValue,
        rewardXP: challengeDraft.rewardXP,
        rewardBadgeId: challengeDraft.rewardBadgeId,
        rewardTitleId: challengeDraft.rewardTitleId,
        difficulty: challengeDraft.difficulty,
        isActive: challengeDraft.isActive,
        isRepeatable: challengeDraft.isRepeatable,
      });

      await loadChallenges();
      closeChallengeModal();
      setSaveModal({
        title: 'Kihívás frissítve',
        message: 'A kihívás adatai sikeresen elmentésre kerültek.',
      });
    } catch (error) {
      const messageText = error instanceof ApiHttpError
        ? error.message
        : 'A kihívás mentése sikertelen. Kérlek próbáld újra.';

      setSaveModal({
        title: 'Mentési hiba',
        message: messageText,
      });
    } finally {
      setChallengeSaving(false);
    }
  };

  const deleteChallenge = (id: number) => {
    if (!window.confirm('Biztosan törlöd ezt a kihívást?')) return;

    setChallenges(prev => prev.filter(item => item.id !== id));
    if (selectedChallengeId === id) {
      closeChallengeModal();
    }
  };

  useEffect(() => {
    const hasEditorModal = Boolean(selectedUserId || selectedContentId || selectedNewsId || selectedChallengeId);
    const hasAnyModal = hasEditorModal || Boolean(saveModal);
    if (!hasAnyModal) return;

    const scrollY = window.scrollY;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (selectedUserId) closeUserModal();
        if (selectedContentId) closeContentModal();
        if (selectedNewsId) closeNewsModal();
        if (selectedChallengeId) closeChallengeModal();
        if (saveModal) closeSaveModal();
      }
    };

    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.height = '100%';
    document.body.style.overflow = 'hidden';
    document.body.style.height = '100%';
    if (hasEditorModal) {
      document.body.style.touchAction = 'none';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    }
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
      if (hasEditorModal) {
        window.scrollTo(0, scrollY);
      }
    };
  }, [selectedUserId, selectedContentId, selectedNewsId, selectedChallengeId, saveModal]);

  useEffect(() => {
    if (!selectedUserId && !selectedContentId && !selectedNewsId && !selectedChallengeId) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.admin-custom-select')) {
        setActiveUserDropdown(null);
        setActiveContentDropdown(null);
        setNewsTagDropdownOpen(false);
        setActiveChallengeDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedUserId, selectedContentId, selectedNewsId, selectedChallengeId]);

  const getUserHealth = (user: AdminUser) => {
    if (user.permissionLevel === 'banned') return 'Korlátozott';
    if (user.subscription !== 'free') return 'Prémium aktív';
    if (user.dayStreak >= 30) return 'Magasan aktív';
    return 'Normál';
  };

  const permissionLevelLabels: Record<AdminUser['permissionLevel'], string> = {
    user: 'Felhasználó',
    moderator: 'Moderátor',
    admin: 'Admin',
    banned: 'Korlátozott',
  };

  const subscriptionLabels: Record<AdminUser['subscription'], string> = {
    free: 'FREE',
    premium: 'PREMIUM',
  };

  const challengeTypeLabels: Record<AdminChallenge['type'], string> = {
    READ: 'Olvasás',
    WATCH: 'Nézés',
    SOCIAL: 'Közösségi',
    MIXED: 'Vegyes',
    DEDICATION: 'Kitartás',
    EVENT: 'Esemény',
  };

  const challengeDifficultyLabels: Record<AdminChallenge['difficulty'], string> = {
    EASY: 'Könnyű',
    MEDIUM: 'Normál',
    HARD: 'Nehéz',
    EPIC: 'Epikus',
  };

  const getChallengeDifficultyBadgeClass = (difficulty: AdminChallengeDifficulty) => {
    switch (difficulty) {
      case 'EASY': return 'admin-badge-green';
      case 'MEDIUM': return 'admin-badge-blue';
      case 'HARD': return 'admin-badge-yellow';
      case 'EPIC': return 'admin-badge-purple';
      default: return 'admin-badge-dim';
    }
  };

  const getBadgeById = (id: number | null) => badges.find(b => b.id === id) ?? null;
  const getTitleById = (id: number | null) => titles.find(t => t.id === id) ?? null;
  const getTagById = (id: number) => tags.find(tag => tag.id === id) ?? null;

  const deleteContent = (id: number) => {
    if (window.confirm('Biztosan törlöd ezt a tartalmat?')) {
      setContent(prev => prev.filter(c => c.id !== id));
      if (selectedContentId === id) {
        closeContentModal();
      }
    }
  };

  const addTagToContentDraft = (tagId: number) => {
    setContentDraft(prev => {
      if (!prev || prev.tagIds.includes(tagId)) return prev;
      return { ...prev, tagIds: [...prev.tagIds, tagId] };
    });
  };

  const removeTagFromContentDraft = (tagId: number) => {
    setContentDraft(prev => {
      if (!prev) return prev;
      return { ...prev, tagIds: prev.tagIds.filter(id => id !== tagId) };
    });
  };

  // Hír törlése
  const deleteNews = (id: number) => {
    if (window.confirm('Biztosan törlöd ezt a hírt?')) {
      setNews(prev => prev.filter(n => n.id !== id));
    }
  };

  // Bejelentés küldése
  const sendAnnouncement = async () => {
    const message = announcementText.trim();
    if (!message) return;

    const specificUsernames = announcementUsers
      .split(',')
      .map(name => name.trim())
      .filter(Boolean);

    if (announcementTarget === 'specific' && specificUsernames.length === 0) {
      setSaveModal({
        title: 'Hiányzó címzett',
        message: 'Adott felhasználók célcsoportnál legalább egy felhasználónevet adj meg.',
      });
      return;
    }

    setAnnouncementSending(true);

    try {
      const result = await sendAdminAnnouncement({
        target: announcementTarget,
        message,
        usernames: announcementTarget === 'specific' ? specificUsernames : undefined,
      });

      setAnnouncementSent(true);
      setSaveModal({
        title: 'Bejelentés elküldve',
        message: result.missingUsernames.length > 0
          ? `${result.sentCount} címzettnek elküldve. Nem található felhasználók: ${result.missingUsernames.join(', ')}`
          : `${result.sentCount} címzettnek elküldve.`,
      });

      setTimeout(() => {
        setAnnouncementSent(false);
      }, 3000);

      setAnnouncementText('');
      setAnnouncementUsers('');
    } catch (error) {
      const messageText = error instanceof ApiHttpError
        ? error.message
        : 'A bejelentés küldése sikertelen. Kérlek próbáld újra.';

      setSaveModal({
        title: 'Küldési hiba',
        message: messageText,
      });
    } finally {
      setAnnouncementSending(false);
    }
  };

  // Helper: badge színek
  const getRoleBadge = (permissionLevel: AdminUser['permissionLevel']) => {
    switch (permissionLevel) {
      case 'admin': return <span className="admin-badge admin-badge-red">Admin</span>;
      case 'moderator': return <span className="admin-badge admin-badge-blue">Moderátor</span>;
      case 'banned': return <span className="admin-badge admin-badge-red">Korlátozott</span>;
      default: return <span className="admin-badge admin-badge-gray">Felhasználó</span>;
    }
  };

  const getSubBadge = (sub: AdminUser['subscription']) => {
    switch (sub) {
      case 'premium': return <span className="admin-badge admin-badge-yellow">Premium</span>;
      default: return <span className="admin-badge admin-badge-dim">Ingyenes</span>;
    }
  };

  const getContentTypeBadge = (type: AdminContent['contentType']) => {
    switch (type) {
      case 'BOOK': return <span className="admin-badge admin-badge-green">Konyv</span>;
      case 'MOVIE': return <span className="admin-badge admin-badge-blue">Film</span>;
      case 'SERIES': return <span className="admin-badge admin-badge-purple">Sorozat</span>;
    }
  };

  const bookTypeLabels: Record<NonNullable<AdminContent['bookType']>, string> = {
    BOOK: 'Konyv',
    AUDIOBOOK: 'Hangoskonyv',
    EBOOK: 'E-konyv',
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

  if (!hasAdminAccess) {
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
                  Az admin felülethez admin vagy moderátor jogosultság szükséges.
                </p>

                <div className="mb-4">
                  <button className="btn px-5 py-2" onClick={() => navigate('/')} style={{
                    background: 'linear-gradient(135deg, var(--secondary), var(--primary))',
                    color: 'var(--bg)',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 12px rgba(194, 157, 89, 0.25)',
                    transition: 'all 0.3s ease'
                  }}>
                    <i className="bi bi-house-door me-2"></i>
                    KEZDŐLAP
                  </button>
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
    { key: 'purchases', label: 'Vásárlások', icon: 'bi-bag-check-fill' },
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
              {overviewError && (
                <div className="alert alert-warning mb-3" role="alert">{overviewError}</div>
              )}

              {/* Statisztika kártyák */}
              <div className="admin-stats-grid">
                {overviewStats.map((stat, idx) => (
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

              {overviewLoading && (
                <div className="admin-card mt-3 text-center py-4">
                  <div className="spinner-border text-light" role="status">
                    <span className="visually-hidden">Betöltés...</span>
                  </div>
                </div>
              )}

              {/* Legutóbbi aktivitás */}
              <div className="admin-card mt-4">
                <h3 className="admin-card-title">
                  <i className="bi bi-activity me-2"></i>
                  Legutóbbi aktivitás
                </h3>
                <div className="admin-activity-list">
                  {overviewActivities.length === 0 && !overviewLoading && (
                    <div className="admin-activity-item">
                      <div className="admin-activity-icon" style={{ color: '#9ca3af' }}>
                        <i className="bi bi-info-circle"></i>
                      </div>
                      <div className="admin-activity-text">Nincs elérhető aktivitás adat.</div>
                      <div className="admin-activity-time">-</div>
                    </div>
                  )}
                  {overviewActivities.map((item, idx) => (
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
                  <strong>
                    {Math.round((userSummary.premium / Math.max(users.length, 1)) * 100)}%
                    <span className="admin-users-stat-range"> (300 - 1500)</span>
                  </strong>
                </div>
                <div className="admin-users-stat">
                  <span className="admin-users-stat-label">Stáb tagok</span>
                  <strong>{userSummary.staff}</strong>
                </div>
                <div className="admin-users-stat admin-users-stat-alert">
                  <span className="admin-users-stat-label">Korlátozott fiókok</span>
                  <strong>{userSummary.banned}</strong>
                </div>
                <div className="admin-users-stat">
                  <span className="admin-users-stat-label">Mai belépések</span>
                  <strong>{userSummary.activeToday}</strong>
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
                        placeholder="Keresés név vagy e-mail alapján..."
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
                      {pagedUsers.map(user => (
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
                                <div className="admin-user-meta">#{user.id}</div>
                              </div>
                            </div>
                          </td>
                          <td>{getRoleBadge(user.permissionLevel)}</td>
                          <td className="admin-user-subscription-cell">
                            <div className="admin-user-subscription">
                              {getSubBadge(user.subscription)}
                            </div>
                          </td>
                          <td>
                            <div className="admin-user-progress">
                              <span className="admin-level">Lv.{user.level}</span>
                            </div>
                          </td>
                          <td>
                            <div className="admin-user-points">
                              <strong>{getUserTotalPoints(user).toLocaleString('hu-HU')}</strong>
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

                {filteredUsers.length > 0 && totalUserPages > 1 && (
                  <nav className="admin-pagination-wrap" aria-label="Felhasználók lapozása">
                    <ul className="pagination kk-pagination justify-content-center mb-0">
                      <li className={`page-item ${usersPage === 1 ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => setUsersPage(Math.max(1, usersPage - 1))}>Előző</button>
                      </li>

                      {getPaginationRange(usersPage, totalUserPages).map((page) => (
                        <li key={page} className={`page-item ${usersPage === page ? 'active' : ''}`}>
                          <button className="page-link" onClick={() => setUsersPage(page)}>{page}</button>
                        </li>
                      ))}

                      <li className={`page-item ${usersPage === totalUserPages ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => setUsersPage(Math.min(totalUserPages, usersPage + 1))}>Következő</button>
                      </li>
                    </ul>
                  </nav>
                )}

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
                              <span>Jogosultság</span>
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
              <div className="admin-users-overview">
                <div className="admin-users-stat">
                  <span className="admin-users-stat-label">Összes tartalom</span>
                  <strong>{contentSummary.total}</strong>
                </div>
                <div className="admin-users-stat">
                  <span className="admin-users-stat-label">Könyv</span>
                  <strong>{contentSummary.books}</strong>
                </div>
                <div className="admin-users-stat">
                  <span className="admin-users-stat-label">Sorozat</span>
                  <strong>{contentSummary.series}</strong>
                </div>
                <div className="admin-users-stat">
                  <span className="admin-users-stat-label">Film</span>
                  <strong>{contentSummary.movies}</strong>
                </div>
              </div>

              <div className="admin-card">
                <div className="admin-card-header">
                  <h3 className="admin-card-title">
                    <i className="bi bi-collection-fill me-2"></i>
                    Tartalmak kezelése
                    <span className="admin-count">{content.length}</span>
                  </h3>
                  <div className="admin-header-controls">
                    <div className="admin-filter-pills">
                      {(['all', 'BOOK', 'MOVIE', 'SERIES'] as const).map(f => (
                        <button
                          key={f}
                          className={`admin-pill ${contentTypeFilter === f ? 'active' : ''}`}
                          onClick={() => setContentTypeFilter(f)}
                        >
                          {f === 'all' ? 'Mind' : f === 'BOOK' ? 'Konyv' : f === 'MOVIE' ? 'Film' : 'Sorozat'}
                        </button>
                      ))}
                    </div>
                    <div className="admin-search">
                      <i className="bi bi-search"></i>
                      <input
                        type="text"
                        placeholder="Keresés csak cím alapján..."
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
                        <th>Kiadás</th>
                        <th>Értékelés</th>
                        <th>Jutalom</th>
                        <th>Elérhetőség</th>
                        <th>Frissítve</th>
                        <th>Műveletek</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedContent.map(item => (
                        <tr key={item.id} className="admin-content-row" onClick={() => openContentModal(item)}>
                          <td>
                            <div className="admin-content-cell">
                              <img src={item.coverOrPosterApiName} alt={item.title} className="admin-content-cover" />
                              <div>
                                <div className="admin-news-title">{item.title}</div>
                                <small className="admin-content-meta">#{item.id}</small>
                              </div>
                            </div>
                          </td>
                          <td>{getContentTypeBadge(item.contentType)}</td>
                          <td>{item.released}</td>
                          <td>
                            <span className="admin-rating">
                              <i className="bi bi-star-fill"></i>
                              {item.rating.toFixed(1)}
                            </span>
                          </td>
                          <td>
                            <div className="admin-content-reward">
                              <strong>{item.rewardXP} XP</strong>
                              <small>{item.rewardPoints} pont</small>
                            </div>
                          </td>
                          <td>
                            <div className="admin-content-flags">
                              {item.isOfflineAvailable && <span className="admin-badge admin-badge-gold">Offline</span>}
                              {item.hasSubtitles && <span className="admin-badge admin-badge-blue">Sub</span>}
                              {item.isOriginalLanguage && <span className="admin-badge admin-badge-dim">Eredeti</span>}
                            </div>
                          </td>
                          <td>
                            {item.updatedAt ? new Date(item.updatedAt).toLocaleString('hu-HU') : '-'}
                          </td>
                          <td>
                            <div className="admin-actions">
                              <button
                                className="admin-btn-icon"
                                title="Szerkesztés"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  openContentModal(item);
                                }}
                              >
                                <i className="bi bi-pencil-fill"></i>
                              </button>
                              <button
                                className="admin-btn-icon text-danger"
                                title="Törlés"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  deleteContent(item.id);
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

                {filteredContent.length > 0 && totalContentPages > 1 && (
                  <nav className="admin-pagination-wrap" aria-label="Tartalmak lapozása">
                    <ul className="pagination kk-pagination justify-content-center mb-0">
                      <li className={`page-item ${contentPage === 1 ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => setContentPage(Math.max(1, contentPage - 1))}>Előző</button>
                      </li>

                      {getPaginationRange(contentPage, totalContentPages).map((page) => (
                        <li key={page} className={`page-item ${contentPage === page ? 'active' : ''}`}>
                          <button className="page-link" onClick={() => setContentPage(page)}>{page}</button>
                        </li>
                      ))}

                      <li className={`page-item ${contentPage === totalContentPages ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => setContentPage(Math.min(totalContentPages, contentPage + 1))}>Következő</button>
                      </li>
                    </ul>
                  </nav>
                )}

                <div className="admin-save-bar">
                  <button className="admin-send-btn" onClick={() => handleSave('Tartalmak')}>
                    <i className="bi bi-floppy-fill me-2"></i>
                    Változtatások mentése
                  </button>
                </div>
              </div>

              {selectedContent && (
                <div className="admin-content-modal-backdrop" onClick={closeContentModal}>
                  <div className="admin-content-modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="admin-content-modal-title">
                    <div className="admin-news-modal-header">
                      <div>
                        <h3 id="admin-content-modal-title">Tartalom szerkesztése</h3>
                        <p>Book/Movie/Series tabla mezok szerint (nincs uj letrehozas, csak edit/torles).</p>
                      </div>
                      <button className="admin-user-modal-close" onClick={closeContentModal} aria-label="Bezárás">
                        <i className="bi bi-x-lg"></i>
                      </button>
                    </div>

                    <div className="admin-news-modal-body">
                      <div className="admin-news-meta-grid">
                        <div className="admin-user-snapshot">
                          <span className="admin-user-snapshot-label">Tábla</span>
                          <strong>{selectedContent.contentType}</strong>
                        </div>
                        <div className="admin-user-snapshot">
                          <span className="admin-user-snapshot-label">Azonosító</span>
                          <strong>#{selectedContent.id}</strong>
                        </div>
                        <div className="admin-user-snapshot">
                          <span className="admin-user-snapshot-label">Frissítve</span>
                          <strong>{selectedContent.updatedAt ? new Date(selectedContent.updatedAt).toLocaleString('hu-HU') : 'Nincs adat'}</strong>
                        </div>
                      </div>

                      <div className="admin-user-form-section">
                        <div className="admin-user-form-grid">
                          <label className="admin-user-field admin-user-field-wide">
                            <span>Cím</span>
                            <input value={selectedContent.title} onChange={(event) => updateContentDraft('title', event.target.value)} maxLength={128} />
                          </label>

                          <label className="admin-user-field admin-user-field-wide">
                            <span>Leírás</span>
                            <textarea className="admin-textarea" value={selectedContent.description} onChange={(event) => updateContentDraft('description', event.target.value)} rows={4} />
                          </label>

                          <label className="admin-user-field">
                            <span>Kiadás éve</span>
                            <input type="number" min={1800} max={2099} value={selectedContent.released} onChange={(event) => updateContentDraft('released', Number(event.target.value))} />
                          </label>

                          <label className="admin-user-field">
                            <span>Értékelés</span>
                            <input type="number" min={0} max={10} step={0.1} value={selectedContent.rating} onChange={(event) => updateContentDraft('rating', Number(event.target.value))} />
                          </label>

                          <label className="admin-user-field">
                            <span>AgeRatingId</span>
                            <input type="number" min={1} value={selectedContent.ageRatingId ?? ''} onChange={(event) => updateContentDraft('ageRatingId', event.target.value ? Number(event.target.value) : null)} />
                          </label>

                          <label className="admin-user-field">
                            <span>Trailer URL</span>
                            <input value={selectedContent.trailerUrl ?? ''} onChange={(event) => updateContentDraft('trailerUrl', event.target.value || null)} />
                          </label>

                          <label className="admin-user-field">
                            <span>Reward XP</span>
                            <input type="number" min={0} value={selectedContent.rewardXP} onChange={(event) => updateContentDraft('rewardXP', Number(event.target.value))} />
                          </label>

                          <label className="admin-user-field">
                            <span>Reward Points</span>
                            <input type="number" min={0} value={selectedContent.rewardPoints} onChange={(event) => updateContentDraft('rewardPoints', Number(event.target.value))} />
                          </label>

                          <label className="admin-user-field admin-user-field-wide">
                            <span>Cover/Poster API név vagy URL</span>
                            <input value={selectedContent.coverOrPosterApiName} onChange={(event) => updateContentDraft('coverOrPosterApiName', event.target.value)} />
                          </label>

                          <div className="admin-user-field admin-user-field-wide">
                            <span>Tagek</span>
                            <div className="admin-content-tags-wrap">
                              <div className="admin-content-tags-list">
                                {selectedContent.tagIds.length === 0 && (
                                  <span className="admin-content-tag-empty">Nincs tag hozzárendelve</span>
                                )}
                                {selectedContent.tagIds.map(tagId => {
                                  const tag = getTagById(tagId);
                                  if (!tag) return null;
                                  return (
                                    <span key={tag.id} className="admin-content-tag-chip">
                                      {tag.name}
                                      <button
                                        type="button"
                                        aria-label={`Tag eltavolitasa: ${tag.name}`}
                                        onClick={() => removeTagFromContentDraft(tag.id)}
                                      >
                                        <i className="bi bi-x"></i>
                                      </button>
                                    </span>
                                  );
                                })}
                              </div>

                              <div className="admin-custom-select">
                                <button
                                  type="button"
                                  className="admin-custom-select-trigger"
                                  aria-expanded={activeContentDropdown === 'tags'}
                                  onClick={() => setActiveContentDropdown(prev => prev === 'tags' ? null : 'tags')}
                                >
                                  <span>Tag hozzaadása</span>
                                </button>
                                <div className={`admin-custom-select-menu ${activeContentDropdown === 'tags' ? 'show' : ''}`}>
                                  {tags.filter(tag => !selectedContent.tagIds.includes(tag.id)).length === 0 && (
                                    <button type="button" className="admin-custom-select-option" disabled>
                                      Minden tag hozzarendelve
                                    </button>
                                  )}
                                  {tags
                                    .filter(tag => !selectedContent.tagIds.includes(tag.id))
                                    .map(tag => (
                                      <button
                                        key={tag.id}
                                        type="button"
                                        className="admin-custom-select-option"
                                        onClick={() => {
                                          addTagToContentDraft(tag.id);
                                          setActiveContentDropdown(null);
                                        }}
                                      >
                                        {tag.name}
                                      </button>
                                    ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          {selectedContent.contentType === 'BOOK' && (
                            <>
                              <label className="admin-user-field">
                                <span>Oldalszám</span>
                                <input type="number" min={1} value={selectedContent.pageNum ?? ''} onChange={(event) => updateContentDraft('pageNum', event.target.value ? Number(event.target.value) : null)} />
                              </label>

                              <label className="admin-user-field">
                                <span>Könyv típus</span>
                                <div className="admin-custom-select">
                                  <button
                                    type="button"
                                    className="admin-custom-select-trigger"
                                    aria-expanded={activeContentDropdown === 'bookType'}
                                    onClick={() => setActiveContentDropdown(prev => prev === 'bookType' ? null : 'bookType')}
                                  >
                                    <span>{selectedContent.bookType ? bookTypeLabels[selectedContent.bookType] : 'Nincs tipus'}</span>
                                  </button>
                                  <div className={`admin-custom-select-menu ${activeContentDropdown === 'bookType' ? 'show' : ''}`}>
                                    <button
                                      type="button"
                                      className={`admin-custom-select-option ${selectedContent.bookType === null ? 'active' : ''}`}
                                      onClick={() => {
                                        updateContentDraft('bookType', null);
                                        setActiveContentDropdown(null);
                                      }}
                                    >
                                      Nincs tipus
                                    </button>
                                    {(['BOOK', 'AUDIOBOOK', 'EBOOK'] as const).map(option => (
                                      <button
                                        key={option}
                                        type="button"
                                        className={`admin-custom-select-option ${selectedContent.bookType === option ? 'active' : ''}`}
                                        onClick={() => {
                                          updateContentDraft('bookType', option);
                                          setActiveContentDropdown(null);
                                        }}
                                      >
                                        {bookTypeLabels[option]}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </label>

                              <label className="admin-user-field">
                                <span>PDF URL</span>
                                <input value={selectedContent.pdfUrl ?? ''} onChange={(event) => updateContentDraft('pdfUrl', event.target.value || null)} />
                              </label>

                              <label className="admin-user-field">
                                <span>Audio URL</span>
                                <input value={selectedContent.audioUrl ?? ''} onChange={(event) => updateContentDraft('audioUrl', event.target.value || null)} />
                              </label>

                              <label className="admin-user-field">
                                <span>EPUB URL</span>
                                <input value={selectedContent.epubUrl ?? ''} onChange={(event) => updateContentDraft('epubUrl', event.target.value || null)} />
                              </label>

                              <label className="admin-user-field">
                                <span>Audio hossz (sec)</span>
                                <input type="number" min={0} value={selectedContent.audioLength ?? ''} onChange={(event) => updateContentDraft('audioLength', event.target.value ? Number(event.target.value) : null)} />
                              </label>

                              <label className="admin-user-field">
                                <span>Narrátor</span>
                                <input value={selectedContent.narratorName ?? ''} onChange={(event) => updateContentDraft('narratorName', event.target.value || null)} />
                              </label>

                              <label className="admin-user-field">
                                <span>Eredeti nyelv</span>
                                <input value={selectedContent.originalLanguage ?? ''} onChange={(event) => updateContentDraft('originalLanguage', event.target.value || null)} maxLength={64} />
                              </label>
                            </>
                          )}

                          {selectedContent.contentType === 'MOVIE' && (
                            <>
                              <label className="admin-user-field">
                                <span>Hossz (perc)</span>
                                <input type="number" min={1} value={selectedContent.length ?? ''} onChange={(event) => updateContentDraft('length', event.target.value ? Number(event.target.value) : null)} />
                              </label>

                              <label className="admin-user-field admin-user-field-wide">
                                <span>Stream URL</span>
                                <input value={selectedContent.streamUrl ?? ''} onChange={(event) => updateContentDraft('streamUrl', event.target.value || null)} />
                              </label>
                            </>
                          )}

                          <label className="admin-user-field admin-user-field-inline">
                            <input type="checkbox" checked={selectedContent.hasSubtitles} onChange={(event) => updateContentDraft('hasSubtitles', event.target.checked)} />
                            <span>Felirat elérhető</span>
                          </label>

                          <label className="admin-user-field admin-user-field-inline">
                            <input type="checkbox" checked={selectedContent.isOriginalLanguage} onChange={(event) => updateContentDraft('isOriginalLanguage', event.target.checked)} />
                            <span>Eredeti nyelven</span>
                          </label>

                          <label className="admin-user-field admin-user-field-inline">
                            <input type="checkbox" checked={selectedContent.isOfflineAvailable} onChange={(event) => updateContentDraft('isOfflineAvailable', event.target.checked)} />
                            <span>Offline elérhető</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="admin-user-modal-footer">
                      <button className="admin-user-secondary-btn" onClick={closeContentModal}>Mégse</button>
                      <button className="admin-send-btn" onClick={saveContentDraft}>
                        <i className="bi bi-check2-circle me-2"></i>
                        Tartalom mentése
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================== HÍREK ======================== */}
          {activeTab === 'news' && (
            <div className="admin-section">
              <div className="admin-users-overview">
                <div className="admin-users-stat">
                  <span className="admin-users-stat-label">Összes cikk</span>
                  <strong>{newsSummary.total}</strong>
                </div>
                <div className="admin-users-stat">
                  <span className="admin-users-stat-label">Frissítés</span>
                  <strong>{newsSummary.updates}</strong>
                </div>
                <div className="admin-users-stat">
                  <span className="admin-users-stat-label">Közlemény</span>
                  <strong>{newsSummary.announcements}</strong>
                </div>
                <div className="admin-users-stat">
                  <span className="admin-users-stat-label">Esemény</span>
                  <strong>{newsSummary.events}</strong>
                </div>
                <div className="admin-users-stat">
                  <span className="admin-users-stat-label">Funkció</span>
                  <strong>{newsSummary.functions}</strong>
                </div>
              </div>

              <div className="admin-card">
                <div className="admin-card-header">
                  <h3 className="admin-card-title">
                    <i className="bi bi-newspaper me-2"></i>
                    Hírcikkek kezelése
                    <span className="admin-count">{newsTotalFromApi}</span>
                  </h3>
                  <div className="admin-header-controls">
                    <div className="admin-filter-pills">
                      {([
                        { key: 'all', label: 'Mind' },
                        { key: 'UPDATE', label: 'Frissítés' },
                        { key: 'ANNOUNCEMENT', label: 'Közlemény' },
                        { key: 'EVENT', label: 'Esemény' },
                        { key: 'FUNCTION', label: 'Funkció' },
                      ] as const).map(filter => (
                        <button
                          key={filter.key}
                          className={`admin-pill ${newsTypeFilter === filter.key ? 'active' : ''}`}
                          onClick={() => setNewsTypeFilter(filter.key)}
                        >
                          {filter.label}
                        </button>
                      ))}
                    </div>

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
                      {newsLoading ? (
                        <tr>
                          <td colSpan={6} className="text-center text-muted py-4">Hírek betöltése...</td>
                        </tr>
                      ) : (
                        pagedNews.map(item => (
                        <tr key={item.id} className="admin-news-row" onClick={() => openNewsModal(item)}>
                          <td><span className="admin-news-title">{item.title}</span></td>
                          <td>
                            <p className="admin-news-preview">
                              {item.content.length > 110 ? `${item.content.slice(0, 110)}...` : item.content}
                            </p>
                          </td>
                          <td>{getEventTagBadge(item.eventTag)}</td>
                          <td>{new Date(item.createdAt).toLocaleString('hu-HU')}</td>
                          <td>{item.updatedAt ? new Date(item.updatedAt).toLocaleString('hu-HU') : 'Nincs adat'}</td>
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
                      ))
                      )}
                    </tbody>
                  </table>
                </div>

                {newsTotalFromApi > 0 && totalNewsPages > 1 && (
                  <nav className="admin-pagination-wrap" aria-label="Hírek lapozása">
                    <ul className="pagination kk-pagination justify-content-center mb-0">
                      <li className={`page-item ${newsPage === 1 ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => setNewsPage(Math.max(1, newsPage - 1))}>Előző</button>
                      </li>

                      {getPaginationRange(newsPage, totalNewsPages).map((page) => (
                        <li key={page} className={`page-item ${newsPage === page ? 'active' : ''}`}>
                          <button className="page-link" onClick={() => setNewsPage(page)}>{page}</button>
                        </li>
                      ))}

                      <li className={`page-item ${newsPage === totalNewsPages ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => setNewsPage(Math.min(totalNewsPages, newsPage + 1))}>Következő</button>
                      </li>
                    </ul>
                  </nav>
                )}

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
                          <strong>{selectedNews.updatedAt ? new Date(selectedNews.updatedAt).toLocaleString('hu-HU') : 'Nincs adat'}</strong>
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
                      <button className="admin-user-secondary-btn" onClick={closeNewsModal} disabled={newsSaving}>Mégse</button>
                      <button className="admin-send-btn" onClick={saveNewsDraft} disabled={newsSaving}>
                        <i className="bi bi-check2-circle me-2"></i>
                        {newsSaving ? 'Mentés...' : 'Cikk mentése'}
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
              <div className="admin-users-overview">
                <div className="admin-users-stat">
                  <span className="admin-users-stat-label">Összes kihívás</span>
                  <strong>{challengeSummary.total}</strong>
                </div>
                <div className="admin-users-stat">
                  <span className="admin-users-stat-label">Aktív</span>
                  <strong>{challengeSummary.active}</strong>
                </div>
                <div className="admin-users-stat">
                  <span className="admin-users-stat-label">Ismételhető</span>
                  <strong>{challengeSummary.repeatable}</strong>
                </div>
                <div className="admin-users-stat">
                  <span className="admin-users-stat-label">Esemény típusú</span>
                  <strong>{challengeSummary.event}</strong>
                </div>
              </div>

              <div className="admin-card">
                <div className="admin-card-header">
                  <h3 className="admin-card-title">
                    <i className="bi bi-trophy-fill me-2"></i>
                    Kihívások kezelése
                    <span className="admin-count">{challengeTotalFromApi}</span>
                  </h3>
                  <div className="admin-header-controls">
                    <div className="admin-filter-pills">
                      {([
                        { key: 'all', label: 'Mind' },
                        { key: 'READ', label: 'Olvasás' },
                        { key: 'WATCH', label: 'Nézés' },
                        { key: 'SOCIAL', label: 'Közösségi' },
                        { key: 'MIXED', label: 'Vegyes' },
                        { key: 'DEDICATION', label: 'Kitartás' },
                        { key: 'EVENT', label: 'Esemény' },
                      ] as const).map(filter => (
                        <button
                          key={filter.key}
                          className={`admin-pill ${challengeTypeFilter === filter.key ? 'active' : ''}`}
                          onClick={() => setChallengeTypeFilter(filter.key)}
                        >
                          {filter.label}
                        </button>
                      ))}
                    </div>

                    <div className="admin-search">
                      <i className="bi bi-search"></i>
                      <input
                        type="text"
                        placeholder="Keresés cím, típus, nehézség vagy leírás alapján..."
                        value={challengeSearch}
                        onChange={(e) => setChallengeSearch(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Kihívás</th>
                        <th>Típus</th>
                        <th>Nehézség</th>
                        <th>Cél/Jutalom</th>
                        <th>Badge / Title</th>
                        <th>Résztvevők</th>
                        <th>Teljesítések</th>
                        <th>Státusz</th>
                        <th>Műveletek</th>
                      </tr>
                    </thead>
                    <tbody>
                      {challengesLoading ? (
                        <tr>
                          <td colSpan={9} className="text-center text-muted py-4">Kihívások betöltése...</td>
                        </tr>
                      ) : (
                        pagedChallenges.map(ch => (
                        <tr key={ch.id} className="admin-challenge-row" onClick={() => openChallengeModal(ch)}>
                          <td><span className="admin-news-title">{ch.title}</span></td>
                          <td>
                            <span className="admin-badge admin-badge-blue">{challengeTypeLabels[ch.type]}</span>
                          </td>
                          <td>
                            <span className={`admin-badge ${getChallengeDifficultyBadgeClass(ch.difficulty)}`}>{challengeDifficultyLabels[ch.difficulty]}</span>
                          </td>
                          <td>
                            <div className="admin-challenge-target">
                              <strong>{ch.targetValue}</strong>
                              <small>{ch.rewardXP} XP</small>
                            </div>
                          </td>
                          <td>
                            <div className="admin-challenge-links">
                              <small>{getBadgeById(ch.rewardBadgeId)?.name ?? 'Nincs badge'}</small>
                              <small>{getTitleById(ch.rewardTitleId)?.name ?? 'Nincs title'}</small>
                            </div>
                          </td>
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
                          <td>{ch.isActive ? <span className="admin-badge admin-badge-green">Aktív</span> : <span className="admin-badge admin-badge-dim">Inaktív</span>}</td>
                          <td>
                            <div className="admin-actions">
                              <button
                                className="admin-btn-icon"
                                title="Szerkesztés"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  openChallengeModal(ch);
                                }}
                              >
                                <i className="bi bi-pencil-fill"></i>
                              </button>
                              <button
                                className="admin-btn-icon text-danger"
                                title="Törlés"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  deleteChallenge(ch.id);
                                }}
                              >
                                <i className="bi bi-trash-fill"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                      )}
                    </tbody>
                  </table>
                </div>

                {challengeTotalFromApi > 0 && totalChallengePages > 1 && (
                  <nav className="admin-pagination-wrap" aria-label="Kihívások lapozása">
                    <ul className="pagination kk-pagination justify-content-center mb-0">
                      <li className={`page-item ${challengesPage === 1 ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => setChallengesPage(Math.max(1, challengesPage - 1))}>Előző</button>
                      </li>

                      {getPaginationRange(challengesPage, totalChallengePages).map((page) => (
                        <li key={page} className={`page-item ${challengesPage === page ? 'active' : ''}`}>
                          <button className="page-link" onClick={() => setChallengesPage(page)}>{page}</button>
                        </li>
                      ))}

                      <li className={`page-item ${challengesPage === totalChallengePages ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => setChallengesPage(Math.min(totalChallengePages, challengesPage + 1))}>Következő</button>
                      </li>
                    </ul>
                  </nav>
                )}

                <div className="admin-save-bar">
                  <button className="admin-send-btn" onClick={() => handleSave('Kihívások')}>
                    <i className="bi bi-floppy-fill me-2"></i>
                    Változtatások mentése
                  </button>
                </div>
              </div>

              {selectedChallenge && (
                <div className="admin-challenge-modal-backdrop" onClick={closeChallengeModal}>
                  <div className="admin-challenge-modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="admin-challenge-modal-title">
                    <div className="admin-news-modal-header">
                      <div>
                        <h3 id="admin-challenge-modal-title">Kihívás szerkesztése</h3>
                        <p>Challenge tábla mezői: Type, TargetValue, RewardXP, RewardBadgeId, RewardTitleId, Difficulty, IsActive, IsRepeatable.</p>
                      </div>
                      <button className="admin-user-modal-close" onClick={closeChallengeModal} aria-label="Bezárás">
                        <i className="bi bi-x-lg"></i>
                      </button>
                    </div>

                    <div className="admin-news-modal-body">
                      <div className="admin-news-meta-grid">
                        <div className="admin-user-snapshot">
                          <span className="admin-user-snapshot-label">Challenge ID</span>
                          <strong>#{selectedChallenge.id}</strong>
                        </div>
                        <div className="admin-user-snapshot">
                          <span className="admin-user-snapshot-label">Létrehozva</span>
                          <strong>{new Date(selectedChallenge.createdAt).toLocaleString('hu-HU')}</strong>
                        </div>
                        <div className="admin-user-snapshot">
                          <span className="admin-user-snapshot-label">Teljesítés arány</span>
                          <strong>{selectedChallenge.participants > 0 ? `${Math.round((selectedChallenge.completions / selectedChallenge.participants) * 100)}%` : '0%'}</strong>
                        </div>
                      </div>

                      <div className="admin-user-form-section">
                        <div className="admin-user-form-grid">
                          <label className="admin-user-field admin-user-field-wide">
                            <span>Cím</span>
                            <input value={selectedChallenge.title} onChange={(event) => updateChallengeDraft('title', event.target.value)} maxLength={128} />
                          </label>

                          <label className="admin-user-field admin-user-field-wide">
                            <span>Leírás</span>
                            <textarea
                              className="admin-textarea admin-news-textarea"
                              value={selectedChallenge.description}
                              onChange={(event) => updateChallengeDraft('description', event.target.value)}
                              rows={5}
                            />
                          </label>

                          <label className="admin-user-field">
                            <span>Típus</span>
                            <div className="admin-custom-select">
                              <button
                                type="button"
                                className="admin-custom-select-trigger"
                                aria-expanded={activeChallengeDropdown === 'type'}
                                onClick={() => setActiveChallengeDropdown(prev => prev === 'type' ? null : 'type')}
                              >
                                <span>{challengeTypeLabels[selectedChallenge.type]}</span>
                              </button>
                              <div className={`admin-custom-select-menu ${activeChallengeDropdown === 'type' ? 'show' : ''}`}>
                                {(['READ', 'WATCH', 'SOCIAL', 'MIXED', 'DEDICATION', 'EVENT'] as const).map(option => (
                                  <button
                                    key={option}
                                    type="button"
                                    className={`admin-custom-select-option ${selectedChallenge.type === option ? 'active' : ''}`}
                                    onClick={() => {
                                      updateChallengeDraft('type', option);
                                      setActiveChallengeDropdown(null);
                                    }}
                                  >
                                    {challengeTypeLabels[option]}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </label>

                          <label className="admin-user-field">
                            <span>Nehézség</span>
                            <div className="admin-custom-select">
                              <button
                                type="button"
                                className="admin-custom-select-trigger"
                                aria-expanded={activeChallengeDropdown === 'difficulty'}
                                onClick={() => setActiveChallengeDropdown(prev => prev === 'difficulty' ? null : 'difficulty')}
                              >
                                <span>{challengeDifficultyLabels[selectedChallenge.difficulty]}</span>
                              </button>
                              <div className={`admin-custom-select-menu ${activeChallengeDropdown === 'difficulty' ? 'show' : ''}`}>
                                {(['EASY', 'MEDIUM', 'HARD', 'EPIC'] as const).map(option => (
                                  <button
                                    key={option}
                                    type="button"
                                    className={`admin-custom-select-option ${selectedChallenge.difficulty === option ? 'active' : ''}`}
                                    onClick={() => {
                                      updateChallengeDraft('difficulty', option);
                                      setActiveChallengeDropdown(null);
                                    }}
                                  >
                                    {challengeDifficultyLabels[option]}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </label>

                          <label className="admin-user-field">
                            <span>Cél érték</span>
                            <input type="number" min={1} value={selectedChallenge.targetValue} onChange={(event) => updateChallengeDraft('targetValue', Number(event.target.value))} />
                          </label>

                          <label className="admin-user-field">
                            <span>Jutalom XP</span>
                            <input type="number" min={0} value={selectedChallenge.rewardXP} onChange={(event) => updateChallengeDraft('rewardXP', Number(event.target.value))} />
                          </label>

                          <label className="admin-user-field">
                            <span>Reward badge</span>
                            <div className="admin-custom-select">
                              <button
                                type="button"
                                className="admin-custom-select-trigger"
                                aria-expanded={activeChallengeDropdown === 'badge'}
                                onClick={() => setActiveChallengeDropdown(prev => prev === 'badge' ? null : 'badge')}
                              >
                                <span>{getBadgeById(selectedChallenge.rewardBadgeId)?.name ?? 'Nincs badge'}</span>
                              </button>
                              <div className={`admin-custom-select-menu ${activeChallengeDropdown === 'badge' ? 'show' : ''}`}>
                                <button
                                  type="button"
                                  className={`admin-custom-select-option ${selectedChallenge.rewardBadgeId === null ? 'active' : ''}`}
                                  onClick={() => {
                                    updateChallengeDraft('rewardBadgeId', null);
                                    setActiveChallengeDropdown(null);
                                  }}
                                >
                                  Nincs badge
                                </button>
                                {badges.map(option => (
                                  <button
                                    key={option.id}
                                    type="button"
                                    className={`admin-custom-select-option ${selectedChallenge.rewardBadgeId === option.id ? 'active' : ''}`}
                                    onClick={() => {
                                      updateChallengeDraft('rewardBadgeId', option.id);
                                      setActiveChallengeDropdown(null);
                                    }}
                                  >
                                    {option.name} ({option.rarity})
                                  </button>
                                ))}
                              </div>
                            </div>
                          </label>

                          <label className="admin-user-field">
                            <span>Reward title</span>
                            <div className="admin-custom-select">
                              <button
                                type="button"
                                className="admin-custom-select-trigger"
                                aria-expanded={activeChallengeDropdown === 'title'}
                                onClick={() => setActiveChallengeDropdown(prev => prev === 'title' ? null : 'title')}
                              >
                                <span>{getTitleById(selectedChallenge.rewardTitleId)?.name ?? 'Nincs title'}</span>
                              </button>
                              <div className={`admin-custom-select-menu ${activeChallengeDropdown === 'title' ? 'show' : ''}`}>
                                <button
                                  type="button"
                                  className={`admin-custom-select-option ${selectedChallenge.rewardTitleId === null ? 'active' : ''}`}
                                  onClick={() => {
                                    updateChallengeDraft('rewardTitleId', null);
                                    setActiveChallengeDropdown(null);
                                  }}
                                >
                                  Nincs title
                                </button>
                                {titles.map(option => (
                                  <button
                                    key={option.id}
                                    type="button"
                                    className={`admin-custom-select-option ${selectedChallenge.rewardTitleId === option.id ? 'active' : ''}`}
                                    onClick={() => {
                                      updateChallengeDraft('rewardTitleId', option.id);
                                      setActiveChallengeDropdown(null);
                                    }}
                                  >
                                    {option.name} ({option.rarity})
                                  </button>
                                ))}
                              </div>
                            </div>
                          </label>

                          <label className="admin-user-field admin-user-field-inline">
                            <input type="checkbox" checked={selectedChallenge.isActive} onChange={(event) => updateChallengeDraft('isActive', event.target.checked)} />
                            <span>Aktív kihívás</span>
                          </label>

                          <label className="admin-user-field admin-user-field-inline">
                            <input type="checkbox" checked={selectedChallenge.isRepeatable} onChange={(event) => updateChallengeDraft('isRepeatable', event.target.checked)} />
                            <span>Ismételhető</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="admin-user-modal-footer">
                      <button className="admin-user-secondary-btn" onClick={closeChallengeModal} disabled={challengeSaving}>Mégse</button>
                      <button className="admin-send-btn" onClick={saveChallengeDraft} disabled={challengeSaving}>
                        <i className="bi bi-check2-circle me-2"></i>
                        {challengeSaving ? 'Mentés...' : 'Kihívás mentése'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================== BEJELENTÉS ======================== */}
          {activeTab === 'purchases' && (
            <div className="admin-section">
              <div className="admin-users-overview">
                <div className="admin-users-stat">
                  <span className="admin-users-stat-label">Összes vásárlás</span>
                  <strong>{purchasesTotalFromApi}</strong>
                </div>
              </div>

              <div className="admin-card">
                <div className="admin-card-header">
                  <h3 className="admin-card-title">
                    <i className="bi bi-bag-check-fill me-2"></i>
                    Vásárlások kezelése
                    <span className="admin-count">{purchasesTotalFromApi}</span>
                  </h3>
                  <div className="admin-header-controls">
                    <div className="admin-filter-pills">
                      {([
                        { key: 'all', label: 'Mind' },
                        { key: 'SUCCESS', label: 'Sikeres' },
                        { key: 'PENDING', label: 'Függőben' },
                        { key: 'FAILED', label: 'Sikertelen' },
                        { key: 'REFUNDED', label: 'Visszatérítve' },
                      ] as const).map(filter => (
                        <button
                          key={filter.key}
                          className={`admin-pill ${purchasesStatusFilter === filter.key ? 'active' : ''}`}
                          onClick={() => setPurchasesStatusFilter(filter.key)}
                        >
                          {filter.label}
                        </button>
                      ))}
                    </div>

                    <div className="admin-search">
                      <i className="bi bi-search"></i>
                      <input
                        type="text"
                        placeholder="Keresés felhasználónév vagy e-mail alapján..."
                        value={purchasesSearch}
                        onChange={(e) => setPurchasesSearch(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="admin-table-wrapper">
                  {purchasesLoading ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-light" role="status">
                        <span className="visually-hidden">Betöltés...</span>
                      </div>
                    </div>
                  ) : (
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>#ID</th>
                          <th>Felhasználó</th>
                          <th>Csomag</th>
                          <th>Ár</th>
                          <th>Státusz</th>
                          <th>Dátum</th>
                          <th>Frissítve</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPurchasesForDisplay.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="text-center py-4">
                              <i className="bi bi-inbox" style={{ fontSize: '2rem', opacity: 0.5 }}></i>
                              <p className="mt-2 mb-0">Nincs megjeleníthető vásárlás</p>
                            </td>
                          </tr>
                        ) : (
                          filteredPurchasesForDisplay.map(purchase => (
                            <tr key={purchase.id}>
                              <td><code>#{purchase.id}</code></td>
                              <td>
                                <div>
                                  <div style={{ fontWeight: 600 }}>{purchase.username}</div>
                                  <small style={{ opacity: 0.6 }}>{purchase.email}</small>
                                </div>
                              </td>
                              <td>
                                {purchase.tier === 'ONE_M' && <span className="admin-badge admin-badge-blue">1 hónap</span>}
                                {purchase.tier === 'QUARTER_Y' && <span className="admin-badge admin-badge-purple">3 hónap</span>}
                                {purchase.tier === 'FULL_Y' && <span className="admin-badge admin-badge-gold">12 hónap</span>}
                              </td>
                              <td>{purchase.price != null ? `${purchase.price.toLocaleString('hu-HU')} Ft` : '—'}</td>
                              <td>
                                {purchase.purchaseStatus === 'SUCCESS' && <span className="admin-badge admin-badge-green">Sikeres</span>}
                                {purchase.purchaseStatus === 'PENDING' && <span className="admin-badge admin-badge-yellow">Függőben</span>}
                                {purchase.purchaseStatus === 'FAILED' && <span className="admin-badge admin-badge-red">Sikertelen</span>}
                                {purchase.purchaseStatus === 'REFUNDED' && <span className="admin-badge admin-badge-dim">Visszatérítve</span>}
                                {!purchase.purchaseStatus && <span className="admin-badge admin-badge-dim">Ismeretlen</span>}
                              </td>
                              <td>{purchase.purchaseDate ? new Date(purchase.purchaseDate).toLocaleDateString('hu-HU') : '—'}</td>
                              <td>{purchase.updatedAt ? new Date(purchase.updatedAt).toLocaleString('hu-HU') : '—'}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  )}
                </div>

                {!purchasesLoading && purchasesTotalFromApi > 0 && totalPurchasePages > 1 && (
                  <nav className="admin-pagination-wrap" aria-label="Vásárlások lapozása">
                    <ul className="pagination kk-pagination justify-content-center mb-0">
                      <li className={`page-item ${purchasesPage === 1 ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => setPurchasesPage(Math.max(1, purchasesPage - 1))}>Előző</button>
                      </li>

                      {getPaginationRange(purchasesPage, totalPurchasePages).map((page) => (
                        <li key={page} className={`page-item ${purchasesPage === page ? 'active' : ''}`}>
                          <button className="page-link" onClick={() => setPurchasesPage(page)}>{page}</button>
                        </li>
                      ))}

                      <li className={`page-item ${purchasesPage === totalPurchasePages ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => setPurchasesPage(Math.min(totalPurchasePages, purchasesPage + 1))}>Következő</button>
                      </li>
                    </ul>
                  </nav>
                )}
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
                        disabled={announcementSending || !announcementText.trim() || (announcementTarget === 'specific' && !announcementUsers.trim())}
                      >
                        <i className="bi bi-send-fill me-2"></i>
                        {announcementSending ? 'Küldés...' : 'Bejelentés küldése'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {saveModal && (
            <div className={`admin-save-modal-backdrop${saveModalClosing ? ' closing' : ''}`} onClick={closeSaveModal}>
              <div className={`admin-save-modal${saveModalClosing ? ' closing' : ''}`} onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="admin-save-modal-title">
                <div className="admin-save-modal-icon">
                  <i className="bi bi-check2-circle"></i>
                </div>
                <h4 id="admin-save-modal-title">{saveModal.title}</h4>
                <p>{saveModal.message}</p>
                <button className="admin-send-btn" onClick={closeSaveModal}>
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
