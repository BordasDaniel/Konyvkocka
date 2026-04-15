import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
	ApiHttpError,
	claimChallenge,
	getChallenges,
	type ChallengeItemResponse,
} from '../services/api';
import '../styles/challenges.css';

type ChallengeCategory = 'reading' | 'watching' | 'social' | 'dedication' | 'event';
type RewardType = 'xp' | 'medal' | 'title' | 'badge';
type ChallengeStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CLAIMED';
type ChallengeDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'EPIC';

interface Reward {
	type: RewardType;
	value: string;
	icon?: string;
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
	progressLabel: string;
	status: ChallengeStatus;
	claimedAt?: string;
	expiresAt?: string;
	icon: string;
}

type FilterType = 'all' | 'active' | 'claimable' | 'claimed' | 'event';

const mapChallengeCategory = (type: string): ChallengeCategory => {
	const normalized = type.toUpperCase();
	if (normalized === 'EVENT') return 'event';
	if (normalized === 'BOOK' || normalized === 'READING') return 'reading';
	if (normalized === 'MOVIE' || normalized === 'SERIES' || normalized === 'WATCHING' || normalized === 'MEDIA') {
		return 'watching';
	}
	if (normalized === 'SOCIAL') return 'social';
	return 'dedication';
};

const mapChallengeProgressLabel = (type: string): string => {
	const normalized = type.toUpperCase();
	if (normalized === 'BOOK' || normalized === 'READING') return 'Olvasott tartalmak';
	if (normalized === 'MOVIE' || normalized === 'SERIES' || normalized === 'WATCHING' || normalized === 'MEDIA') {
		return 'Megtekintett tartalmak';
	}
	if (normalized === 'STREAK') return 'Napok';
	if (normalized === 'EVENT') return 'Esemény haladás';
	return 'Haladás';
};

const mapChallengeRewards = (item: ChallengeItemResponse): Reward[] => {
	const rewards: Reward[] = [];
	if (item.rewards.xp > 0) {
		rewards.push({ type: 'xp', value: String(item.rewards.xp) });
	}
	if (item.rewards.title) {
		rewards.push({ type: 'title', value: item.rewards.title.name });
	}
	if (item.rewards.badge) {
		rewards.push({
			type: item.rewards.badge.iconURL ? 'medal' : 'badge',
			value: item.rewards.badge.name,
			icon: item.rewards.badge.iconURL ?? undefined,
		});
	}
	return rewards;
};

const mapChallengeIcon = (category: ChallengeCategory): string => {
	switch (category) {
		case 'reading': return 'bi-book';
		case 'watching': return 'bi-play-circle';
		case 'social': return 'bi-people';
		case 'dedication': return 'bi-hourglass-split';
		case 'event': return 'bi-calendar-event';
		default: return 'bi-star';
	}
};

const mapChallenge = (item: ChallengeItemResponse): Challenge => {
	const category = mapChallengeCategory(item.type);
	const difficulty = (item.difficulty?.toUpperCase() || 'MEDIUM') as ChallengeDifficulty;
	return {
		id: item.id,
		title: item.title,
		description: item.description,
		category,
		difficulty,
		rewards: mapChallengeRewards(item),
		progress: Math.max(0, item.currentValue ?? 0),
		goal: Math.max(0, item.targetValue ?? 0),
		progressLabel: mapChallengeProgressLabel(item.type),
		status: item.status,
		claimedAt: item.claimedAt ?? undefined,
		icon: mapChallengeIcon(category),
	};
};

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
		case 'MEDIUM': return 'Normal';
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

const Challenges: React.FC = () => {
	const { isAuthenticated } = useAuth();
	const [challenges, setChallenges] = useState<Challenge[]>([]);
	const [claimingIds, setClaimingIds] = useState<number[]>([]);
	const [filter, setFilter] = useState<FilterType>('all');
	const [categoryFilter, setCategoryFilter] = useState<ChallengeCategory | 'all'>('all');
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let isMounted = true;

		const loadChallenges = async () => {
			if (!isAuthenticated) {
				setChallenges([]);
				setError('A kihívások megtekintéséhez be kell jelentkezned.');
				setIsLoading(false);
				return;
			}

			setIsLoading(true);
			setError(null);

			try {
				const response = await getChallenges({ status: 'all' });
				if (!isMounted) return;
				setChallenges(response.challenges.map(mapChallenge));
			} catch (loadError) {
				if (!isMounted) return;
				if (loadError instanceof ApiHttpError && loadError.status === 401) {
					setError('A kihívások megtekintéséhez be kell jelentkezned.');
				} else {
					setError('A kihívások betöltése sikertelen.');
				}
				setChallenges([]);
			} finally {
				if (isMounted) setIsLoading(false);
			}
		};

		void loadChallenges();

		return () => {
			isMounted = false;
		};
	}, [isAuthenticated]);

	const isClaimable = (challenge: Challenge) => challenge.status === 'COMPLETED';
	const isClaimed = (challenge: Challenge) => challenge.status === 'CLAIMED';
	const isFinished = (challenge: Challenge) => challenge.status === 'COMPLETED' || challenge.status === 'CLAIMED';

	const handleClaim = async (challengeId: number) => {
		if (claimingIds.includes(challengeId)) return;

		setClaimingIds((prev) => [...prev, challengeId]);
		try {
			const response = await claimChallenge(challengeId);
			setChallenges((prev) =>
				prev.map((challenge) =>
					challenge.id === challengeId
						? { ...challenge, status: 'CLAIMED', claimedAt: response.claimedAt }
						: challenge,
				),
			);
		} catch (claimError) {
			console.error('Kihívás claim hiba:', claimError);
		} finally {
			setClaimingIds((prev) => prev.filter((id) => id !== challengeId));
		}
	};

	const filteredChallenges = useMemo(() => challenges.filter(c => {
		if (filter === 'active' && isFinished(c)) return false;
		if (filter === 'claimable' && !isClaimable(c)) return false;
		if (filter === 'claimed' && !isClaimed(c)) return false;
		if (filter === 'event' && c.category !== 'event') return false;
		if (categoryFilter !== 'all' && c.category !== categoryFilter) return false;
		return true;
	}), [challenges, filter, categoryFilter]);

	const activeCount = challenges.filter(c => !isFinished(c)).length;
	const claimableCount = challenges.filter(c => isClaimable(c)).length;
	const claimedCount = challenges.filter(c => isClaimed(c)).length;
	const eventCount = challenges.filter(c => c.category === 'event').length;

	return (
		<div className="challenges-page">
			<section className="challenges-hero py-5">
				<div className="container-fluid p-3 p-lg-5 px-4 px-lg-5">
					<div className="row mb-4">
						<div className="col-12">
							<div className="text-center mb-4 pt-5">
								<h1 className="text-uppercase fw-bold mb-2" style={{ color: 'var(--h1Text)' }}>
									<i className="bi bi-trophy-fill me-3" style={{ color: 'var(--secondary)' }}></i>
									Kihívások
								</h1>
								<p className="text-light mb-0">
									Teljesíts kihívásokat, gyűjts XP-t, medálokat és exkluzív címeket.
								</p>
							</div>

							<div className="challenges-filters mb-3">
								<button className={`btn btn-action ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
									<i className="bi bi-grid-fill me-2"></i>Összes ({challenges.length})
								</button>
								<button className={`btn btn-action ${filter === 'active' ? 'active' : ''}`} onClick={() => setFilter('active')}>
									<i className="bi bi-hourglass-split me-2"></i>Aktív ({activeCount})
								</button>
								<button className={`btn btn-action ${filter === 'claimable' ? 'active' : ''}`} onClick={() => setFilter('claimable')}>
									<i className="bi bi-gift-fill me-2"></i>Átvehető ({claimableCount})
								</button>
								<button className={`btn btn-action ${filter === 'claimed' ? 'active' : ''}`} onClick={() => setFilter('claimed')}>
									<i className="bi bi-check2-circle me-2"></i>Átvett ({claimedCount})
								</button>
								<button className={`btn btn-action ${filter === 'event' ? 'active' : ''}`} onClick={() => setFilter('event')}>
									<i className="bi bi-calendar-event me-2"></i>Események ({eventCount})
								</button>
							</div>

							<div className="challenges-filters">
								<button className={`btn btn-action ${categoryFilter === 'all' ? 'active' : ''}`} onClick={() => setCategoryFilter('all')}>
									<i className="bi bi-grid-fill me-2"></i>Összes
								</button>
								<button className={`btn btn-action ${categoryFilter === 'reading' ? 'active' : ''}`} onClick={() => setCategoryFilter('reading')}>
									<i className="bi bi-book me-1"></i>Olvasás
								</button>
								<button className={`btn btn-action ${categoryFilter === 'watching' ? 'active' : ''}`} onClick={() => setCategoryFilter('watching')}>
									<i className="bi bi-play-circle me-1"></i>Nézés
								</button>
								<button className={`btn btn-action ${categoryFilter === 'social' ? 'active' : ''}`} onClick={() => setCategoryFilter('social')}>
									<i className="bi bi-people me-1"></i>Közösségi
								</button>
								<button className={`btn btn-action ${categoryFilter === 'dedication' ? 'active' : ''}`} onClick={() => setCategoryFilter('dedication')}>
									<i className="bi bi-hourglass-split me-1"></i>Kitartás
								</button>
							</div>
						</div>
					</div>

					<div className="row">
						<div className="col-12">
							{isLoading ? (
								<div className="empty-state text-center">
									<div className="spinner-border text-light" role="status">
										<span className="visually-hidden">Betöltés...</span>
									</div>
								</div>
							) : error ? (
								<div className="empty-state text-center">
									<div>
										<i className="bi bi-exclamation-circle" style={{ fontSize: '3rem', color: 'var(--secondary)', opacity: 0.5, marginBottom: '1rem' }}></i>
										<p className="empty-title mb-2">{error}</p>
									</div>
								</div>
							) : filteredChallenges.length === 0 ? (
								<div className="empty-state text-center">
									<div>
										<i className="bi bi-trophy" style={{ fontSize: '3rem', color: 'var(--secondary)', opacity: 0.5, marginBottom: '1rem' }}></i>
										<p className="empty-title mb-2">Nincs találat</p>
										<p className="empty-subtitle mb-0">Próbáld más szűrőkkel.</p>
									</div>
								</div>
							) : (
								<div className="challenges-list">
									{filteredChallenges.map(challenge => {
										const safeGoal = challenge.goal > 0 ? challenge.goal : 1;
										return (
											<div key={challenge.id} className={`challenge-card ${isClaimed(challenge) ? 'completed' : ''} difficulty-${challenge.difficulty.toLowerCase()}`}>
												<div className="challenge-icon" style={{ borderColor: getDifficultyColor(challenge.difficulty) }}>
													<i className={`bi ${challenge.icon}`} style={{ color: getDifficultyColor(challenge.difficulty) }}></i>
												</div>

												<div className="challenge-content">
													<div className="challenge-header">
														<h5 className="challenge-title">
															{challenge.title}
															{isClaimed(challenge) && <i className="bi bi-check-circle-fill ms-2 text-success"></i>}
														</h5>
														<div className="challenge-badges">
															<span className="badge badge-difficulty" style={{ backgroundColor: getDifficultyColor(challenge.difficulty) }}>
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

													<div className="challenge-progress">
														<div className="progress-info">
															<span className="progress-label">{challenge.progressLabel}</span>
															<span className="progress-value">{challenge.progress}/{challenge.goal}</span>
														</div>
														<div className="progress-bar-container">
															<div className="progress-bar-fill" style={{ width: `${Math.min((challenge.progress / safeGoal) * 100, 100)}%`, backgroundColor: isFinished(challenge) ? '#4caf50' : getDifficultyColor(challenge.difficulty) }}></div>
														</div>
													</div>

													{challenge.expiresAt && (
														<div className="challenge-expiry">
															<i className="bi bi-clock me-1"></i>
															Lejár: {new Date(challenge.expiresAt).toLocaleDateString('hu-HU')}
														</div>
													)}
												</div>

												<div className="challenge-rewards">
													<div className="rewards-label">Jutalmak</div>
													<div className="rewards-list">
														{challenge.rewards.map((reward, idx) => (
															<div key={`${challenge.id}-reward-${idx}`} className="reward-item">
																{reward.type === 'medal' && reward.icon ? (
																	<img src={reward.icon} alt={reward.value} className="reward-medal-icon" />
																) : (
																	<i className={`bi ${getRewardIcon(reward.type)} reward-icon`}></i>
																)}
																<span className="reward-value">{reward.type === 'xp' ? `${reward.value} XP` : reward.value}</span>
															</div>
														))}
													</div>

													{isClaimable(challenge) && (
														<button className="btn challenge-claim-btn mt-3" disabled={claimingIds.includes(challenge.id)} onClick={() => void handleClaim(challenge.id)}>
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
										);
									})}
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
