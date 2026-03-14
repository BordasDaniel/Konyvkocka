import React, { useState } from 'react';
import '../styles/challenges.css';

// ========================
// TÍPUSOK
// ========================

type ChallengeCategory = 'reading' | 'watching' | 'social' | 'dedication' | 'event';
type RewardType = 'xp' | 'medal' | 'title' | 'badge';
type ChallengeStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CLAIMED';
type ChallengeDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'EPIC';

interface Reward {
  type: RewardType;
  value: string; // e.g. "500", "Kihívó medál", "Könyvmoly"
  icon?: string; // medal image URL
}

interface Challenge {
  id: number;
  title: string;
  description: string;
  category: ChallengeCategory;
  difficulty: ChallengeDifficulty;
  rewards: Reward[];
  progress: number;
  goal: number;
  progressLabel: string; // e.g. "Olvasott könyvek"
  status: ChallengeStatus;
  claimedAt?: string;
  expiresAt?: string; // for event challenges
  icon: string;
}

// ========================
// MOCK ADATOK
// ========================

const mockChallenges: Challenge[] = [
  // Reading challenges
  {
    id: 1,
    title: 'Első lépések',
    description: 'Olvass el 5 könyvet a platformon.',
    category: 'reading',
    difficulty: 'EASY',
    rewards: [{ type: 'xp', value: '250' }],
    progress: 3,
    goal: 5,
    progressLabel: 'Olvasott könyvek',
    status: 'IN_PROGRESS',
    icon: 'bi-book',
  },
  {
    id: 2,
    title: 'Könyvmoly',
    description: 'Olvass el 50 könyvet és szerezd meg a "Könyvmoly" címet.',
    category: 'reading',
    difficulty: 'EPIC',
    rewards: [
      { type: 'title', value: 'Könyvmoly' },
      { type: 'xp', value: '2000' },
      { type: 'medal', value: 'Könyvmoly medál', icon: 'https://assets.ppy.sh/medals/web/all-secret-infectiousenthusiasm@2x.png' },
    ],
    progress: 47,
    goal: 50,
    progressLabel: 'Olvasott könyvek',
    status: 'IN_PROGRESS',
    icon: 'bi-book-fill',
  },
  {
    id: 3,
    title: 'Napi olvasó',
    description: 'Olvass minden nap legalább 30 percet egy héten át.',
    category: 'reading',
    difficulty: 'MEDIUM',
    rewards: [
      { type: 'xp', value: '500' },
      { type: 'medal', value: '7 napos sorozat', icon: 'https://assets.ppy.sh/medals/web/all-secret-consolation_prize@2x.png' },
    ],
    progress: 5,
    goal: 7,
    progressLabel: 'Napok',
    status: 'IN_PROGRESS',
    icon: 'bi-calendar-check',
  },
  // Watching challenges
  {
    id: 4,
    title: 'Filmmánia',
    description: 'Nézz meg 25 filmet a platformon.',
    category: 'watching',
    difficulty: 'MEDIUM',
    rewards: [
      { type: 'xp', value: '750' },
      { type: 'badge', value: 'Filmrajongó' },
    ],
    progress: 25,
    goal: 25,
    progressLabel: 'Megtekintett filmek',
    status: 'COMPLETED',
    icon: 'bi-film',
  },
  {
    id: 5,
    title: 'Sorozatőrült',
    description: 'Fejezz be 10 teljes sorozatot.',
    category: 'watching',
    difficulty: 'HARD',
    rewards: [
      { type: 'title', value: 'Sorozatőrült' },
      { type: 'xp', value: '1500' },
    ],
    progress: 7,
    goal: 10,
    progressLabel: 'Befejezett sorozatok',
    status: 'IN_PROGRESS',
    icon: 'bi-tv',
  },
  // Social challenges
  {
    id: 6,
    title: 'Kritikus',
    description: 'Írj 20 véleményt könyvekről vagy filmekről.',
    category: 'social',
    difficulty: 'MEDIUM',
    rewards: [
      { type: 'xp', value: '600' },
      { type: 'medal', value: 'Kritikus medál', icon: 'https://assets.ppy.sh/medals/web/all-secret-allgood@2x.png' },
    ],
    progress: 14,
    goal: 20,
    progressLabel: 'Megírt vélemények',
    status: 'IN_PROGRESS',
    icon: 'bi-chat-quote',
  },
  {
    id: 7,
    title: 'Közösségi pillér',
    description: 'Szerezz 100 követőt a profilodon.',
    category: 'social',
    difficulty: 'EPIC',
    rewards: [
      { type: 'title', value: 'Influencer' },
      { type: 'xp', value: '2500' },
      { type: 'medal', value: 'Közösségi medál', icon: 'https://assets.ppy.sh/medals/web/all-secret-ourbenefactors@2x.png' },
    ],
    progress: 42,
    goal: 100,
    progressLabel: 'Követők',
    status: 'IN_PROGRESS',
    icon: 'bi-people-fill',
  },
  // Dedication challenges
  {
    id: 8,
    title: 'Gyűjtögető',
    description: 'Adj hozzá 100 tartalmat a könyvtáradhoz.',
    category: 'dedication',
    difficulty: 'HARD',
    rewards: [
      { type: 'xp', value: '1000' },
      { type: 'badge', value: 'Gyűjtő' },
    ],
    progress: 87,
    goal: 100,
    progressLabel: 'Tartalmak a könyvtárban',
    status: 'IN_PROGRESS',
    icon: 'bi-collection',
  },
  // Event challenges
  {
    id: 9,
    title: '30 napos olvasási maraton',
    description: 'Olvass minden nap 30 napig és nyerj exkluzív medált! Időkorlátosesemény.',
    category: 'event',
    difficulty: 'EPIC',
    rewards: [
      { type: 'xp', value: '5000' },
      { type: 'medal', value: 'Maraton bajnok', icon: 'https://assets.ppy.sh/medals/web/all-secret-toofasttoofurious@2x.png' },
      { type: 'title', value: 'Maratonfutó' },
    ],
    progress: 12,
    goal: 30,
    progressLabel: 'Napok',
    status: 'IN_PROGRESS',
    expiresAt: '2025-01-31',
    icon: 'bi-trophy-fill',
  },
  {
    id: 10,
    title: 'Téli kihívás',
    description: 'Olvass el 3 téli témájú könyvet december és január között.',
    category: 'event',
    difficulty: 'HARD',
    rewards: [
      { type: 'xp', value: '1200' },
      { type: 'medal', value: 'Téli olvasó', icon: 'https://assets.ppy.sh/medals/web/all-secret-deciduousarborist@2x.png' },
    ],
    progress: 1,
    goal: 3,
    progressLabel: 'Téli könyvek',
    status: 'IN_PROGRESS',
    expiresAt: '2025-01-31',
    icon: 'bi-snow',
  },
  {
    id: 11,
    title: 'Klasszikus maraton',
    description: 'Fejezz be 8 klasszikus művet és szerezd meg a gyűjtő jutalmakat.',
    category: 'reading',
    difficulty: 'HARD',
    rewards: [
      { type: 'xp', value: '900' },
      { type: 'badge', value: 'Klasszikus gyűjtő' },
    ],
    progress: 8,
    goal: 8,
    progressLabel: 'Elolvasott klasszikusok',
    status: 'CLAIMED',
    claimedAt: '2026-03-10T18:24:00.000Z',
    icon: 'bi-journal-bookmark-fill',
  },
  {
    id: 12,
    title: 'Hétvégi binge mester',
    description: 'Nézz meg 6 epizódot egy hétvégén belül.',
    category: 'watching',
    difficulty: 'MEDIUM',
    rewards: [
      { type: 'xp', value: '450' },
      { type: 'medal', value: 'Binge medál', icon: 'https://assets.ppy.sh/medals/web/all-secret-improved@2x.png' },
    ],
    progress: 6,
    goal: 6,
    progressLabel: 'Megnézett epizódok',
    status: 'COMPLETED',
    icon: 'bi-camera-reels-fill',
  },
];

// ========================
// HELPER FUNCTIONS
// ========================

const getDifficultyColor = (difficulty: ChallengeDifficulty): string => {
  switch (difficulty) {
    case 'EASY': return '#4caf50';
    case 'MEDIUM': return '#2196f3';
    case 'HARD': return '#ff9800';
    case 'EPIC': return '#9c27b0';
    default: return '#9e9e9e';
  }
};

const getDifficultyLabel = (difficulty: ChallengeDifficulty): string => {
  switch (difficulty) {
    case 'EASY': return 'Könnyű';
    case 'MEDIUM': return 'Normál';
    case 'HARD': return 'Nehéz';
    case 'EPIC': return 'Epikus';
    default: return 'Ismeretlen';
  }
};

const getCategoryLabel = (category: ChallengeCategory): string => {
  switch (category) {
    case 'reading': return 'Olvasás';
    case 'watching': return 'Nézés';
    case 'social': return 'Közösségi';
    case 'dedication': return 'Kitartás';
    case 'event': return 'Esemény';
    default: return 'Egyéb';
  }
};

const getCategoryIcon = (category: ChallengeCategory): string => {
  switch (category) {
    case 'reading': return 'bi-book';
    case 'watching': return 'bi-play-circle';
    case 'social': return 'bi-people';
    case 'dedication': return 'bi-hourglass-split';
    case 'event': return 'bi-calendar-event';
    default: return 'bi-star';
  }
};

const getRewardIcon = (type: RewardType): string => {
  switch (type) {
    case 'xp': return 'bi-lightning-charge-fill';
    case 'medal': return 'bi-award-fill';
    case 'title': return 'bi-tag-fill';
    case 'badge': return 'bi-patch-check-fill';
    default: return 'bi-gift';
  }
};

// ========================
// KOMPONENS
// ========================

type FilterType = 'all' | 'active' | 'claimable' | 'claimed' | 'event';

const Challenges: React.FC = () => {
  const [challenges, setChallenges] = useState<Challenge[]>(mockChallenges);
  const [claimingIds, setClaimingIds] = useState<number[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [categoryFilter, setCategoryFilter] = useState<ChallengeCategory | 'all'>('all');

  const isClaimable = (challenge: Challenge) => challenge.status === 'COMPLETED';
  const isClaimed = (challenge: Challenge) => challenge.status === 'CLAIMED';
  const isFinished = (challenge: Challenge) => challenge.status === 'COMPLETED' || challenge.status === 'CLAIMED';

  const handleClaim = (challengeId: number) => {
    if (claimingIds.includes(challengeId)) return;

    setClaimingIds((prev) => [...prev, challengeId]);

    // Mock: API kérés szimuláció a user_challenge CLAIMED állapotra
    window.setTimeout(() => {
      setChallenges((prev) =>
        prev.map((challenge) =>
          challenge.id === challengeId
            ? { ...challenge, status: 'CLAIMED', claimedAt: new Date().toISOString() }
            : challenge
        )
      );
      setClaimingIds((prev) => prev.filter((id) => id !== challengeId));
    }, 280);
  };

  const filteredChallenges = challenges.filter(c => {
    // Status filter
    if (filter === 'active' && isFinished(c)) return false;
    if (filter === 'claimable' && !isClaimable(c)) return false;
    if (filter === 'claimed' && !isClaimed(c)) return false;
    if (filter === 'event' && c.category !== 'event') return false;
    
    // Category filter
    if (categoryFilter !== 'all' && c.category !== categoryFilter) return false;
    
    return true;
  });

  const activeCount = challenges.filter(c => !isFinished(c)).length;
  const claimableCount = challenges.filter(c => isClaimable(c)).length;
  const claimedCount = challenges.filter(c => isClaimed(c)).length;
  const eventCount = challenges.filter(c => c.category === 'event').length;

  return (
    <div className="challenges-page">
      <section className="challenges-hero py-5">
        <div className="container-fluid p-3 p-lg-5 px-4 px-lg-5">
          {/* Header */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="text-center mb-4 pt-5">
                <h1 className="text-uppercase fw-bold mb-2" style={{ color: 'var(--h1Text)' }}>
                  <i className="bi bi-trophy-fill me-3" style={{ color: 'var(--secondary)' }}></i>
                  Kihívások
                </h1>
                <p className="text-light mb-0">
                  Teljesíts kihívásokat, gyűjts XP-t, medálokat és exkluzív címeket!
                </p>
              </div>

              {/* Status Filter */}
              <div className="challenges-filters mb-3">
                <button
                  className={`btn btn-action ${filter === 'all' ? 'active' : ''}`}
                  onClick={() => setFilter('all')}
                >
                  <i className="bi bi-grid-fill me-2"></i>Összes ({challenges.length})
                </button>
                <button
                  className={`btn btn-action ${filter === 'active' ? 'active' : ''}`}
                  onClick={() => setFilter('active')}
                >
                  <i className="bi bi-hourglass-split me-2"></i>Aktív ({activeCount})
                </button>
                <button
                  className={`btn btn-action ${filter === 'claimable' ? 'active' : ''}`}
                  onClick={() => setFilter('claimable')}
                >
                  <i className="bi bi-gift-fill me-2"></i>Átvehető ({claimableCount})
                </button>
                <button
                  className={`btn btn-action ${filter === 'claimed' ? 'active' : ''}`}
                  onClick={() => setFilter('claimed')}
                >
                  <i className="bi bi-check2-circle me-2"></i>Átvett ({claimedCount})
                </button>
                <button
                  className={`btn btn-action ${filter === 'event' ? 'active' : ''}`}
                  onClick={() => setFilter('event')}
                >
                  <i className="bi bi-calendar-event me-2"></i>Események ({eventCount})
                </button>
              </div>

              {/* Category Filter */}
              <div className="challenges-filters">
                <button
                  className={`btn btn-action ${categoryFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setCategoryFilter('all')}
                >
                  <i className="bi bi-grid-fill me-2"></i>Összes
                </button>
                <button
                  className={`btn btn-action ${categoryFilter === 'reading' ? 'active' : ''}`}
                  onClick={() => setCategoryFilter('reading')}
                >
                  <i className="bi bi-book me-1"></i>Olvasás
                </button>
                <button
                  className={`btn btn-action ${categoryFilter === 'watching' ? 'active' : ''}`}
                  onClick={() => setCategoryFilter('watching')}
                >
                  <i className="bi bi-play-circle me-1"></i>Nézés
                </button>
                <button
                  className={`btn btn-action ${categoryFilter === 'social' ? 'active' : ''}`}
                  onClick={() => setCategoryFilter('social')}
                >
                  <i className="bi bi-people me-1"></i>Közösségi
                </button>
                <button
                  className={`btn btn-action ${categoryFilter === 'dedication' ? 'active' : ''}`}
                  onClick={() => setCategoryFilter('dedication')}
                >
                  <i className="bi bi-hourglass-split me-1"></i>Kitartás
                </button>
              </div>
            </div>
          </div>

          {/* Challenges List */}
          <div className="row">
            <div className="col-12">
              {filteredChallenges.length === 0 ? (
                <div className="empty-state text-center">
                  <div>
                    <i className="bi bi-trophy" style={{ fontSize: '3rem', color: 'var(--secondary)', opacity: 0.5, marginBottom: '1rem' }}></i>
                    <p className="empty-title mb-2">Nincs találat</p>
                    <p className="empty-subtitle mb-0">Próbálj más szűrőket kiválasztani.</p>
                  </div>
                </div>
              ) : (
                <div className="challenges-list">
                  {filteredChallenges.map(challenge => (
                    <div
                      key={challenge.id}
                      className={`challenge-card ${isClaimed(challenge) ? 'completed' : ''} difficulty-${challenge.difficulty.toLowerCase()}`}
                    >
                      {/* Left side: Icon */}
                      <div className="challenge-icon" style={{ borderColor: getDifficultyColor(challenge.difficulty) }}>
                        <i className={`bi ${challenge.icon}`} style={{ color: getDifficultyColor(challenge.difficulty) }}></i>
                      </div>

                      {/* Middle: Content */}
                      <div className="challenge-content">
                        <div className="challenge-header">
                          <h5 className="challenge-title">
                            {challenge.title}
                            {isClaimed(challenge) && (
                              <i className="bi bi-check-circle-fill ms-2 text-success"></i>
                            )}
                          </h5>
                          <div className="challenge-badges">
                            <span 
                              className="badge badge-difficulty"
                              style={{ backgroundColor: getDifficultyColor(challenge.difficulty) }}
                            >
                              {getDifficultyLabel(challenge.difficulty)}
                            </span>
                            <span className="badge badge-category">
                              <i className={`bi ${getCategoryIcon(challenge.category)} me-1`}></i>
                              {getCategoryLabel(challenge.category)}
                            </span>
                            {isClaimable(challenge) && (
                              <span className="badge badge-claimable">
                                <i className="bi bi-gift-fill me-1"></i>
                                Átvehető
                              </span>
                            )}
                            {isClaimed(challenge) && (
                              <span className="badge badge-claimed">
                                <i className="bi bi-check2-circle me-1"></i>
                                Átvéve
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="challenge-description">{challenge.description}</p>

                        {/* Progress bar */}
                        <div className="challenge-progress">
                          <div className="progress-info">
                            <span className="progress-label">{challenge.progressLabel}</span>
                            <span className="progress-value">{challenge.progress}/{challenge.goal}</span>
                          </div>
                          <div className="progress-bar-container">
                            <div 
                              className="progress-bar-fill"
                              style={{ 
                                width: `${Math.min((challenge.progress / challenge.goal) * 100, 100)}%`,
                                backgroundColor: isFinished(challenge) ? '#4caf50' : getDifficultyColor(challenge.difficulty)
                              }}
                            ></div>
                          </div>
                        </div>

                        {/* Expiry date for events */}
                        {challenge.expiresAt && (
                          <div className="challenge-expiry">
                            <i className="bi bi-clock me-1"></i>
                            Lejár: {new Date(challenge.expiresAt).toLocaleDateString('hu-HU')}
                          </div>
                        )}
                      </div>

                      {/* Right side: Rewards */}
                      <div className="challenge-rewards">
                        <div className="rewards-label">Jutalmak</div>
                        <div className="rewards-list">
                          {challenge.rewards.map((reward, idx) => (
                            <div key={idx} className="reward-item">
                              {reward.type === 'medal' && reward.icon ? (
                                <img src={reward.icon} alt={reward.value} className="reward-medal-icon" />
                              ) : (
                                <i className={`bi ${getRewardIcon(reward.type)} reward-icon`}></i>
                              )}
                              <span className="reward-value">
                                {reward.type === 'xp' ? `${reward.value} XP` : reward.value}
                              </span>
                            </div>
                          ))}
                        </div>

                        {isClaimable(challenge) && (
                          <button
                            className="btn challenge-claim-btn mt-3"
                            disabled={claimingIds.includes(challenge.id)}
                            onClick={() => handleClaim(challenge.id)}
                          >
                            <i className="bi bi-gift-fill me-2"></i>
                            {claimingIds.includes(challenge.id) ? 'Átvétel...' : 'Jutalom átvétele'}
                          </button>
                        )}

                        {isClaimed(challenge) && challenge.claimedAt && (
                          <div className="challenge-claimed-at mt-2">
                            <i className="bi bi-clock-history me-1"></i>
                            Átvéve: {new Date(challenge.claimedAt).toLocaleString('hu-HU')}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Challenges;
