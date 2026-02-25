import React, { useState, useEffect } from 'react';
import '../styles/leaderboard.css';

// ========================
// TÍPUSOK
// ========================

type ContentFilter = 'all' | 'book' | 'media';
type LocationFilter = 'world' | 'country';

interface LeaderboardEntry {
  rank: number;
  username: string;
  avatar: string;
  countryFlag: string;
  countryCode: string;
  points: number;
  booksRead: number;
  mediaWatched: number;
  completionRate: number;
  longestStreak: number;
  level: number;
  isSubscriber: boolean;
  joinDate: string;
}

// ========================
// MOCK ADATOK - Később fetch-ből jönnek
// ========================

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  {
    rank: 1,
    username: 'BookMaster99',
    avatar: 'https://i.pravatar.cc/150?img=1',
    countryFlag: 'https://flagcdn.com/w20/hu.png',
    countryCode: 'HU',
    points: 15420,
    booksRead: 245,
    mediaWatched: 189,
    completionRate: 99.8,
    longestStreak: 365,
    level: 120,
    isSubscriber: true,
    joinDate: '2020-03-15',
  },
  {
    rank: 2,
    username: 'CinemaLover',
    avatar: 'https://i.pravatar.cc/150?img=2',
    countryFlag: 'https://flagcdn.com/w20/de.png',
    countryCode: 'DE',
    points: 14850,
    booksRead: 120,
    mediaWatched: 520,
    completionRate: 98.5,
    longestStreak: 290,
    level: 115,
    isSubscriber: true,
    joinDate: '2020-06-22',
  },
  {
    rank: 3,
    username: 'ReadingQueen',
    avatar: 'https://i.pravatar.cc/150?img=3',
    countryFlag: 'https://flagcdn.com/w20/hu.png',
    countryCode: 'HU',
    points: 13990,
    booksRead: 380,
    mediaWatched: 45,
    completionRate: 99.2,
    longestStreak: 412,
    level: 112,
    isSubscriber: true,
    joinDate: '2019-11-08',
  },
  {
    rank: 4,
    username: 'MediaHunter',
    avatar: 'https://i.pravatar.cc/150?img=4',
    countryFlag: 'https://flagcdn.com/w20/at.png',
    countryCode: 'AT',
    points: 12650,
    booksRead: 89,
    mediaWatched: 445,
    completionRate: 97.8,
    longestStreak: 178,
    level: 108,
    isSubscriber: false,
    joinDate: '2021-01-12',
  },
  {
    rank: 5,
    username: 'PageTurner',
    avatar: 'https://i.pravatar.cc/150?img=5',
    countryFlag: 'https://flagcdn.com/w20/sk.png',
    countryCode: 'SK',
    points: 11800,
    booksRead: 310,
    mediaWatched: 67,
    completionRate: 98.9,
    longestStreak: 256,
    level: 105,
    isSubscriber: true,
    joinDate: '2020-08-30',
  },
  {
    rank: 6,
    username: 'BingeWatcher',
    avatar: 'https://i.pravatar.cc/150?img=6',
    countryFlag: 'https://flagcdn.com/w20/pl.png',
    countryCode: 'PL',
    points: 10920,
    booksRead: 45,
    mediaWatched: 612,
    completionRate: 96.5,
    longestStreak: 134,
    level: 102,
    isSubscriber: false,
    joinDate: '2021-04-18',
  },
  {
    rank: 7,
    username: 'LiteraryGuru',
    avatar: 'https://i.pravatar.cc/150?img=7',
    countryFlag: 'https://flagcdn.com/w20/hu.png',
    countryCode: 'HU',
    points: 10450,
    booksRead: 289,
    mediaWatched: 78,
    completionRate: 99.1,
    longestStreak: 198,
    level: 99,
    isSubscriber: true,
    joinDate: '2020-12-05',
  },
  {
    rank: 8,
    username: 'StorySeeker',
    avatar: 'https://i.pravatar.cc/150?img=8',
    countryFlag: 'https://flagcdn.com/w20/ro.png',
    countryCode: 'RO',
    points: 9870,
    booksRead: 156,
    mediaWatched: 234,
    completionRate: 97.2,
    longestStreak: 145,
    level: 96,
    isSubscriber: false,
    joinDate: '2021-02-28',
  },
  {
    rank: 9,
    username: 'NovelNinja',
    avatar: 'https://i.pravatar.cc/150?img=9',
    countryFlag: 'https://flagcdn.com/w20/cz.png',
    countryCode: 'CZ',
    points: 9340,
    booksRead: 267,
    mediaWatched: 89,
    completionRate: 98.4,
    longestStreak: 167,
    level: 94,
    isSubscriber: true,
    joinDate: '2020-09-14',
  },
  {
    rank: 10,
    username: 'FilmFanatic',
    avatar: 'https://i.pravatar.cc/150?img=10',
    countryFlag: 'https://flagcdn.com/w20/hr.png',
    countryCode: 'HR',
    points: 8920,
    booksRead: 34,
    mediaWatched: 478,
    completionRate: 95.8,
    longestStreak: 112,
    level: 91,
    isSubscriber: false,
    joinDate: '2021-06-20',
  },
  {
    rank: 11,
    username: 'BookWorm2000',
    avatar: 'https://i.pravatar.cc/150?img=11',
    countryFlag: 'https://flagcdn.com/w20/hu.png',
    countryCode: 'HU',
    points: 8450,
    booksRead: 298,
    mediaWatched: 23,
    completionRate: 99.5,
    longestStreak: 234,
    level: 89,
    isSubscriber: true,
    joinDate: '2020-05-11',
  },
  {
    rank: 12,
    username: 'SeriesAddict',
    avatar: 'https://i.pravatar.cc/150?img=12',
    countryFlag: 'https://flagcdn.com/w20/si.png',
    countryCode: 'SI',
    points: 7980,
    booksRead: 67,
    mediaWatched: 389,
    completionRate: 96.9,
    longestStreak: 98,
    level: 86,
    isSubscriber: false,
    joinDate: '2021-08-03',
  },
  {
    rank: 13,
    username: 'ChapterChaser',
    avatar: 'https://i.pravatar.cc/150?img=13',
    countryFlag: 'https://flagcdn.com/w20/ua.png',
    countryCode: 'UA',
    points: 7560,
    booksRead: 234,
    mediaWatched: 56,
    completionRate: 98.1,
    longestStreak: 156,
    level: 84,
    isSubscriber: true,
    joinDate: '2020-10-22',
  },
  {
    rank: 14,
    username: 'ScreenTime',
    avatar: 'https://i.pravatar.cc/150?img=14',
    countryFlag: 'https://flagcdn.com/w20/bg.png',
    countryCode: 'BG',
    points: 7120,
    booksRead: 45,
    mediaWatched: 356,
    completionRate: 95.4,
    longestStreak: 87,
    level: 81,
    isSubscriber: false,
    joinDate: '2021-09-15',
  },
  {
    rank: 15,
    username: 'TaleExplorer',
    avatar: 'https://i.pravatar.cc/150?img=15',
    countryFlag: 'https://flagcdn.com/w20/hu.png',
    countryCode: 'HU',
    points: 6780,
    booksRead: 189,
    mediaWatched: 123,
    completionRate: 97.6,
    longestStreak: 134,
    level: 78,
    isSubscriber: true,
    joinDate: '2021-01-08',
  },
  {
    rank: 16,
    username: 'CinephileMax',
    avatar: 'https://i.pravatar.cc/150?img=16',
    countryFlag: 'https://flagcdn.com/w20/rs.png',
    countryCode: 'RS',
    points: 6340,
    booksRead: 28,
    mediaWatched: 412,
    completionRate: 94.8,
    longestStreak: 76,
    level: 75,
    isSubscriber: false,
    joinDate: '2021-11-28',
  },
  {
    rank: 17,
    username: 'ReadALot',
    avatar: 'https://i.pravatar.cc/150?img=17',
    countryFlag: 'https://flagcdn.com/w20/hu.png',
    countryCode: 'HU',
    points: 5920,
    booksRead: 256,
    mediaWatched: 34,
    completionRate: 98.8,
    longestStreak: 189,
    level: 72,
    isSubscriber: true,
    joinDate: '2020-07-19',
  },
];

// Felhasználó országa (később az AuthContext-ből jön)
const USER_COUNTRY = 'HU';

export default function Leaderboard() {
  const [contentFilter, setContentFilter] = useState<ContentFilter>('all');
  const [locationFilter, setLocationFilter] = useState<LocationFilter>('world');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(MOCK_LEADERBOARD);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<{
    username: string;
    avatar: string;
    countryFlag: string;
    isSubscriber: boolean;
  } | null>(null);

  // Mock function - később lecserélni API hívásra
  const fetchCurrentUser = async () => {
    // TODO: API hívás a jelenlegi felhasználó adataiért
    return {
      username: 'BordasDaniel',
      avatar: 'https://i.pravatar.cc/150?img=12',
      countryFlag: 'https://flagcdn.com/w20/hu.png',
      isSubscriber: true,
    };
  };

  // Aktuális felhasználó betöltése
  useEffect(() => {
    const loadCurrentUser = async () => {
      const userData = await fetchCurrentUser();
      setCurrentUser(userData);
    };
    loadCurrentUser();
  }, []);

  // Szűrés alkalmazása
  useEffect(() => {
    filterLeaderboard();
  }, [contentFilter, locationFilter]);

  const filterLeaderboard = async () => {
    setLoading(true);
    
    // TODO: API hívás lecseréléskor
    // const response = await fetch(`/api/leaderboard?content=${contentFilter}&location=${locationFilter}`);
    
    // Szimulált szűrés
    setTimeout(() => {
      let filtered = [...MOCK_LEADERBOARD];

      // Hely szerinti szűrés
      if (locationFilter === 'country') {
        filtered = filtered.filter(entry => entry.countryCode === USER_COUNTRY);
      }

      // Pontok újraszámolása tartalom típus szerint
      if (contentFilter === 'book') {
        filtered = filtered.map(entry => ({
          ...entry,
          points: Math.round(entry.points * (entry.booksRead / (entry.booksRead + entry.mediaWatched || 1))),
        }));
      } else if (contentFilter === 'media') {
        filtered = filtered.map(entry => ({
          ...entry,
          points: Math.round(entry.points * (entry.mediaWatched / (entry.booksRead + entry.mediaWatched || 1))),
        }));
      }

      // Újra rangsorolás pontok alapján
      filtered.sort((a, b) => b.points - a.points);
      filtered = filtered.map((entry, index) => ({ ...entry, rank: index + 1 }));

      setLeaderboardData(filtered);
      setLoading(false);
    }, 300);
  };

  const formatNumber = (num: number): string => {
    return num.toLocaleString('hu-HU');
  };

  const getContentLabel = (filter: ContentFilter): string => {
    switch (filter) {
      case 'all': return 'Összes';
      case 'book': return 'Könyvek';
      case 'media': return 'Filmek/Sorozatok';
    }
  };

  const getLocationLabel = (filter: LocationFilter): string => {
    switch (filter) {
      case 'world': return 'Világ';
      case 'country': return 'Ország';
    }
  };

  const getRankClass = (rank: number): string => {
    if (rank === 1) return 'rank-gold';
    if (rank === 2) return 'rank-silver';
    if (rank === 3) return 'rank-bronze';
    return '';
  };

  const getRankIcon = (rank: number): React.ReactNode => {
    if (rank === 1) return <i className="bi bi-trophy-fill rank-trophy gold"></i>;
    if (rank === 2) return <i className="bi bi-trophy-fill rank-trophy silver"></i>;
    if (rank === 3) return <i className="bi bi-trophy-fill rank-trophy bronze"></i>;
    return null;
  };

  return (
    <main className="mt-5">
      <div className="container py-5" style={{maxWidth: '1400px'}}>
        <h1 className="mb-4 text-center display-6 fw-bold text-decoration-underline">
          <i className="bi bi-bar-chart-fill me-2"></i>
          Ranglista
        </h1>

      {/* Szűrők */}
      <div className="leaderboard-filters mb-4">
        {/* Tartalom típus szűrő */}
        <div className="leaderboard-filter-group">
          <span className="leaderboard-filter-label">Tartalom:</span>
          <div className="leaderboard-filter-buttons">
            {(['all', 'book', 'media'] as ContentFilter[]).map((filter) => (
              <button
                key={filter}
                className={`btn btn-sm btn-action ${contentFilter === filter ? 'active' : ''}`}
                type="button"
                onClick={() => setContentFilter(filter)}
              >
                {filter === 'all' && <i className="bi bi-collection me-1"></i>}
                {filter === 'book' && <i className="bi bi-book me-1"></i>}
                {filter === 'media' && <i className="bi bi-film me-1"></i>}
                {getContentLabel(filter)}
              </button>
            ))}
          </div>
        </div>

        {/* Hely szűrő */}
        <div className="leaderboard-filter-group">
          <span className="leaderboard-filter-label">Régió:</span>
          <div className="leaderboard-filter-buttons">
            {(['world', 'country'] as LocationFilter[]).map((filter) => (
              <button
                key={filter}
                className={`btn btn-sm btn-action ${locationFilter === filter ? 'active' : ''}`}
                type="button"
                onClick={() => setLocationFilter(filter)}
              >
                {filter === 'world' && <i className="bi bi-globe me-1"></i>}
                {filter === 'country' && <i className="bi bi-flag me-1"></i>}
                {getLocationLabel(filter)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Aktuális felhasználó pozíció */}
      <div className="current-user-position mb-4">
        <div className="current-user-label">
          <i className="bi bi-person-fill me-2"></i>
          Te a ranglistán:
        </div>
        <div className="current-user-row">
          {/* Helyezés */}
          <div className="lb-col lb-rank">
            <span className="rank-number">#42</span>
          </div>

          {/* Játékos info */}
          <div className="lb-col lb-player">
            <img 
              src={currentUser?.avatar || 'https://i.pravatar.cc/150?img=99'} 
              alt={currentUser?.username || 'User'} 
              className="player-avatar"
            />
            <img 
              src={currentUser?.countryFlag || 'https://flagcdn.com/w20/hu.png'} 
              alt="HU" 
              className="player-flag"
            />
            <span className="player-name">
              {currentUser?.username || 'Betöltés...'}
              {currentUser?.isSubscriber && (
                <svg
                  className="subscriber-crown"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="14"
                  height="14"
                >
                  <path fill="currentColor" d="M2 17l2-7 4 4 5-9 5 9 4-4 2 7H2z" />
                </svg>
              )}
            </span>
          </div>

          {/* Pontok */}
          <div className="lb-col lb-points">
            <span className="points-value">3,303</span>
          </div>

          {/* Könyvek */}
          <div className="lb-col lb-stats">
            <i className="bi bi-book stat-icon"></i>
            17,735
          </div>

          {/* Média */}
          <div className="lb-col lb-stats">
            <i className="bi bi-film stat-icon"></i>
            3,200
          </div>

          {/* Befejezési arány */}
          <div className="lb-col lb-stats hide-mobile">
            <span className="completion-rate">98.3%</span>
          </div>

          {/* Szint */}
          <div className="lb-col lb-stats hide-mobile">
            <span className="level-badge">Lv.98</span>
          </div>

          {/* Sorozat */}
          <div className="lb-col lb-streak hide-tablet">
            <i className="bi bi-fire streak-icon"></i>
            746 nap
          </div>
        </div>
      </div>

      {/* Ranglista táblázat */}
      <div className="leaderboard-container">
        {/* Fejléc */}
        <div className="leaderboard-header">
          <div className="lb-col lb-rank">Helyezés</div>
          <div className="lb-col lb-player">Játékos</div>
          <div className="lb-col lb-points">Pontok</div>
          <div className="lb-col lb-stats">Könyvek</div>
          <div className="lb-col lb-stats">Média</div>
          <div className="lb-col lb-stats hide-mobile">Befejezés</div>
          <div className="lb-col lb-stats hide-mobile">Szint</div>
          <div className="lb-col lb-streak hide-tablet">Sorozat</div>
        </div>

        {/* Betöltés */}
        {loading && (
          <div className="leaderboard-loading">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Betöltés...</span>
            </div>
          </div>
        )}

        {/* Rangsor lista */}
        {!loading && (
          <div className="leaderboard-list">
            {leaderboardData.map((entry) => (
              <div 
                key={entry.username} 
                className={`leaderboard-row ${getRankClass(entry.rank)}`}
              >
                {/* Helyezés */}
                <div className="lb-col lb-rank">
                  {getRankIcon(entry.rank)}
                  <span className="rank-number">#{entry.rank}</span>
                </div>

                {/* Játékos info */}
                <div className="lb-col lb-player">
                  <img 
                    src={entry.avatar} 
                    alt={entry.username} 
                    className="player-avatar"
                  />
                  <img 
                    src={entry.countryFlag} 
                    alt={entry.countryCode} 
                    className="player-flag"
                  />
                  <span className="player-name">
                    {entry.username}
                    {entry.isSubscriber && (
                      <svg
                        className="subscriber-crown"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="14"
                        height="14"
                      >
                        <path fill="currentColor" d="M2 17l2-7 4 4 5-9 5 9 4-4 2 7H2z" />
                      </svg>
                    )}
                  </span>
                </div>

                {/* Pontok */}
                <div className="lb-col lb-points">
                  <span className="points-value">{formatNumber(entry.points)}</span>
                </div>

                {/* Könyvek */}
                <div className="lb-col lb-stats">
                  <i className="bi bi-book stat-icon"></i>
                  {formatNumber(entry.booksRead)}
                </div>

                {/* Média */}
                <div className="lb-col lb-stats">
                  <i className="bi bi-film stat-icon"></i>
                  {formatNumber(entry.mediaWatched)}
                </div>

                {/* Befejezési arány */}
                <div className="lb-col lb-stats hide-mobile">
                  <span className="completion-rate">{entry.completionRate.toFixed(1)}%</span>
                </div>

                {/* Szint */}
                <div className="lb-col lb-stats hide-mobile">
                  <span className="level-badge">Lv.{entry.level}</span>
                </div>

                {/* Sorozat */}
                <div className="lb-col lb-streak hide-tablet">
                  <i className="bi bi-fire streak-icon"></i>
                  {entry.longestStreak} nap
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Üres állapot */}
        {!loading && leaderboardData.length === 0 && (
          <div className="leaderboard-empty">
            <i className="bi bi-emoji-frown"></i>
            <p>Nincs találat a kiválasztott szűrőkkel.</p>
          </div>
        )}
      </div>

        {/* Info panel */}
        <div className="leaderboard-info mt-4">
          <div className="info-card">
            <i className="bi bi-info-circle"></i>
            <div>
              <strong>Hogyan számolódnak a pontok?</strong>
              <p>A pontok az elolvasott könyvek, megtekintett filmek és sorozatok, valamint az aktivitásod alapján számolódnak. Minél többet olvasol és nézel, annál több pontot szerezhetsz!</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
