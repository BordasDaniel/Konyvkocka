import React, { useState } from 'react';
import '../styles/challenges.css';

// ========================
// TÍPUSOK
// ========================

type ChallengeRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
type ChallengeCategory = 'reading' | 'watching' | 'social' | 'collection' | 'event';
type RewardType = 'xp' | 'medal' | 'title' | 'badge';

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
  rarity: ChallengeRarity;
  rewards: Reward[];
  progress: number;
  goal: number;
  progressLabel: string; // e.g. "Olvasott könyvek"
  isCompleted: boolean;
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
    rarity: 'common',
    rewards: [{ type: 'xp', value: '250' }],
    progress: 3,
    goal: 5,
    progressLabel: 'Olvasott könyvek',
    isCompleted: false,
    icon: 'bi-book',
  },
  {
    id: 2,
    title: 'Könyvmoly',
    description: 'Olvass el 50 könyvet és szerezd meg a "Könyvmoly" címet.',
    category: 'reading',
    rarity: 'epic',
    rewards: [
      { type: 'title', value: 'Könyvmoly' },
      { type: 'xp', value: '2000' },
      { type: 'medal', value: 'Könyvmoly medál', icon: 'https://assets.ppy.sh/medals/web/all-secret-infectiousenthusiasm@2x.png' },
    ],
    progress: 47,
    goal: 50,
    progressLabel: 'Olvasott könyvek',
    isCompleted: false,
    icon: 'bi-book-fill',
  },
  {
    id: 3,
    title: 'Napi olvasó',
    description: 'Olvass minden nap legalább 30 percet egy héten át.',
    category: 'reading',
    rarity: 'uncommon',
    rewards: [
      { type: 'xp', value: '500' },
      { type: 'medal', value: '7 napos sorozat', icon: 'https://assets.ppy.sh/medals/web/all-secret-consolation_prize@2x.png' },
    ],
    progress: 5,
    goal: 7,
    progressLabel: 'Napok',
    isCompleted: false,
    icon: 'bi-calendar-check',
  },
  // Watching challenges
  {
    id: 4,
    title: 'Filmmánia',
    description: 'Nézz meg 25 filmet a platformon.',
    category: 'watching',
    rarity: 'uncommon',
    rewards: [
      { type: 'xp', value: '750' },
      { type: 'badge', value: 'Filmrajongó' },
    ],
    progress: 25,
    goal: 25,
    progressLabel: 'Megtekintett filmek',
    isCompleted: true,
    icon: 'bi-film',
  },
  {
    id: 5,
    title: 'Sorozatőrült',
    description: 'Fejezz be 10 teljes sorozatot.',
    category: 'watching',
    rarity: 'rare',
    rewards: [
      { type: 'title', value: 'Sorozatőrült' },
      { type: 'xp', value: '1500' },
    ],
    progress: 7,
    goal: 10,
    progressLabel: 'Befejezett sorozatok',
    isCompleted: false,
    icon: 'bi-tv',
  },
  // Social challenges
  {
    id: 6,
    title: 'Kritikus',
    description: 'Írj 20 véleményt könyvekről vagy filmekről.',
    category: 'social',
    rarity: 'uncommon',
    rewards: [
      { type: 'xp', value: '600' },
      { type: 'medal', value: 'Kritikus medál', icon: 'https://assets.ppy.sh/medals/web/all-secret-allgood@2x.png' },
    ],
    progress: 14,
    goal: 20,
    progressLabel: 'Megírt vélemények',
    isCompleted: false,
    icon: 'bi-chat-quote',
  },
  {
    id: 7,
    title: 'Közösségi pillér',
    description: 'Szerezz 100 követőt a profilodon.',
    category: 'social',
    rarity: 'epic',
    rewards: [
      { type: 'title', value: 'Influencer' },
      { type: 'xp', value: '2500' },
      { type: 'medal', value: 'Közösségi medál', icon: 'https://assets.ppy.sh/medals/web/all-secret-ourbenefactors@2x.png' },
    ],
    progress: 42,
    goal: 100,
    progressLabel: 'Követők',
    isCompleted: false,
    icon: 'bi-people-fill',
  },
  // Collection challenges
  {
    id: 8,
    title: 'Gyűjtögető',
    description: 'Adj hozzá 100 tartalmat a könyvtáradhoz.',
    category: 'collection',
    rarity: 'rare',
    rewards: [
      { type: 'xp', value: '1000' },
      { type: 'badge', value: 'Gyűjtő' },
    ],
    progress: 87,
    goal: 100,
    progressLabel: 'Tartalmak a könyvtárban',
    isCompleted: false,
    icon: 'bi-collection',
  },
  // Event challenges
  {
    id: 9,
    title: '30 napos olvasási maraton',
    description: 'Olvass minden nap 30 napig és nyerj exkluzív medált! Időkorlátosesemény.',
    category: 'event',
    rarity: 'legendary',
    rewards: [
      { type: 'xp', value: '5000' },
      { type: 'medal', value: 'Maraton bajnok', icon: 'https://assets.ppy.sh/medals/web/all-secret-toofasttoofurious@2x.png' },
      { type: 'title', value: 'Maratonfutó' },
    ],
    progress: 12,
    goal: 30,
    progressLabel: 'Napok',
    isCompleted: false,
    expiresAt: '2025-01-31',
    icon: 'bi-trophy-fill',
  },
  {
    id: 10,
    title: 'Téli kihívás',
    description: 'Olvass el 3 téli témájú könyvet december és január között.',
    category: 'event',
    rarity: 'rare',
    rewards: [
      { type: 'xp', value: '1200' },
      { type: 'medal', value: 'Téli olvasó', icon: 'https://assets.ppy.sh/medals/web/all-secret-deciduousarborist@2x.png' },
    ],
    progress: 1,
    goal: 3,
    progressLabel: 'Téli könyvek',
    isCompleted: false,
    expiresAt: '2025-01-31',
    icon: 'bi-snow',
  },
];

// ========================
// HELPER FUNCTIONS
// ========================

const getRarityColor = (rarity: ChallengeRarity): string => {
  switch (rarity) {
    case 'common': return '#9e9e9e';
    case 'uncommon': return '#4caf50';
    case 'rare': return '#2196f3';
    case 'epic': return '#9c27b0';
    case 'legendary': return '#ff9800';
    default: return '#9e9e9e';
  }
};

const getRarityLabel = (rarity: ChallengeRarity): string => {
  switch (rarity) {
    case 'common': return 'Gyakori';
    case 'uncommon': return 'Ritka';
    case 'rare': return 'Nagyon ritka';
    case 'epic': return 'Epikus';
    case 'legendary': return 'Legendás';
    default: return 'Ismeretlen';
  }
};

const getCategoryLabel = (category: ChallengeCategory): string => {
  switch (category) {
    case 'reading': return 'Olvasás';
    case 'watching': return 'Nézés';
    case 'social': return 'Közösségi';
    case 'collection': return 'Gyűjtés';
    case 'event': return 'Esemény';
    default: return 'Egyéb';
  }
};

const getCategoryIcon = (category: ChallengeCategory): string => {
  switch (category) {
    case 'reading': return 'bi-book';
    case 'watching': return 'bi-play-circle';
    case 'social': return 'bi-people';
    case 'collection': return 'bi-collection';
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

type FilterType = 'all' | 'active' | 'completed' | 'event';

const Challenges: React.FC = () => {
  const [challenges] = useState<Challenge[]>(mockChallenges);
  const [filter, setFilter] = useState<FilterType>('all');
  const [categoryFilter, setCategoryFilter] = useState<ChallengeCategory | 'all'>('all');

  const filteredChallenges = challenges.filter(c => {
    // Status filter
    if (filter === 'active' && c.isCompleted) return false;
    if (filter === 'completed' && !c.isCompleted) return false;
    if (filter === 'event' && c.category !== 'event') return false;
    
    // Category filter
    if (categoryFilter !== 'all' && c.category !== categoryFilter) return false;
    
    return true;
  });

  const activeCount = challenges.filter(c => !c.isCompleted).length;
  const completedCount = challenges.filter(c => c.isCompleted).length;
  const eventCount = challenges.filter(c => c.category === 'event').length;

  return (
    <div className="challenges-page">
      <section className="challenges-hero py-5">
        <div className="container-fluid p-5 px-4 px-lg-5">
          {/* Header */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="text-center mb-4">
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
                  className={`btn btn-action ${filter === 'completed' ? 'active' : ''}`}
                  onClick={() => setFilter('completed')}
                >
                  <i className="bi bi-check-circle-fill me-2"></i>Teljesítve ({completedCount})
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
                  className={`btn btn-action ${categoryFilter === 'collection' ? 'active' : ''}`}
                  onClick={() => setCategoryFilter('collection')}
                >
                  <i className="bi bi-collection me-1"></i>Gyűjtés
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
                      className={`challenge-card ${challenge.isCompleted ? 'completed' : ''} rarity-${challenge.rarity}`}
                    >
                      {/* Left side: Icon */}
                      <div className="challenge-icon" style={{ borderColor: getRarityColor(challenge.rarity) }}>
                        <i className={`bi ${challenge.icon}`} style={{ color: getRarityColor(challenge.rarity) }}></i>
                      </div>

                      {/* Middle: Content */}
                      <div className="challenge-content">
                        <div className="challenge-header">
                          <h5 className="challenge-title">
                            {challenge.title}
                            {challenge.isCompleted && (
                              <i className="bi bi-check-circle-fill ms-2 text-success"></i>
                            )}
                          </h5>
                          <div className="challenge-badges">
                            <span 
                              className="badge badge-rarity"
                              style={{ backgroundColor: getRarityColor(challenge.rarity) }}
                            >
                              {getRarityLabel(challenge.rarity)}
                            </span>
                            <span className="badge badge-category">
                              <i className={`bi ${getCategoryIcon(challenge.category)} me-1`}></i>
                              {getCategoryLabel(challenge.category)}
                            </span>
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
                                backgroundColor: challenge.isCompleted ? '#4caf50' : getRarityColor(challenge.rarity)
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
