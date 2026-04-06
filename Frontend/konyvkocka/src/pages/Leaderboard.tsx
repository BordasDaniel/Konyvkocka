import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
	ApiHttpError,
	getLeaderboard,
	toAvatarSrc,
	type LeaderboardEntryResponse,
} from '../services/api';
import '../styles/leaderboard.css';

type ContentFilter = 'all' | 'book' | 'media';
type LocationFilter = 'world' | 'country';

interface LeaderboardEntry {
	rank: number;
	userId: number;
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
}

const getCountryFlag = (countryCode: string): string =>
	`https://flagcdn.com/w20/${countryCode.toLowerCase()}.png`;

const mapEntry = (entry: LeaderboardEntryResponse): LeaderboardEntry => ({
	rank: entry.rank,
	userId: entry.userId,
	username: entry.username,
	avatar: toAvatarSrc(entry.avatar),
	countryFlag: getCountryFlag(entry.countryCode),
	countryCode: entry.countryCode,
	points: entry.points,
	booksRead: entry.bookCount,
	mediaWatched: entry.mediaCount,
	completionRate: entry.completionPct,
	longestStreak: entry.dayStreak,
	level: entry.level,
	isSubscriber: entry.isPremium,
});

export default function Leaderboard() {
	const { isAuthenticated } = useAuth();
	const navigate = useNavigate();
	const [contentFilter, setContentFilter] = useState<ContentFilter>('all');
	const [locationFilter, setLocationFilter] = useState<LocationFilter>('world');
	const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [currentUser, setCurrentUser] = useState<LeaderboardEntry | null>(null);
	const pageSize = 10;

	useEffect(() => {
		setCurrentPage(1);
	}, [contentFilter, locationFilter]);

	useEffect(() => {
		let isMounted = true;

		const loadLeaderboard = async () => {
			if (!isAuthenticated) {
				setLeaderboardData([]);
				setCurrentUser(null);
				setError('A ranglista megtekintesehez be kell jelentkezned.');
				setLoading(false);
				return;
			}

			setLoading(true);
			setError(null);

			try {
				const apiContent = contentFilter === 'book' ? 'books' : contentFilter;
				const response = await getLeaderboard({
					content: apiContent,
					region: locationFilter,
					page: currentPage,
					pageSize,
				});

				if (!isMounted) return;

				setLeaderboardData(response.entries.map(mapEntry));
				setCurrentUser(mapEntry(response.me));
				setTotalPages(Math.max(1, Math.ceil(response.total / response.pageSize)));
			} catch (loadError) {
				if (!isMounted) return;
				if (loadError instanceof ApiHttpError && loadError.status === 401) {
					setError('A ranglista megtekintesehez be kell jelentkezned.');
				} else {
					setError('A ranglista betoltese sikertelen.');
				}
				setLeaderboardData([]);
				setCurrentUser(null);
				setTotalPages(1);
			} finally {
				if (isMounted) setLoading(false);
			}
		};

		void loadLeaderboard();

		return () => {
			isMounted = false;
		};
	}, [contentFilter, currentPage, isAuthenticated, locationFilter]);

	const formatNumber = (num: number): string => {
		return num.toLocaleString('hu-HU');
	};

	const getContentLabel = (filter: ContentFilter): string => {
		switch (filter) {
			case 'all': return 'Összes';
			case 'book': return 'Könyvek';
			case 'media': return 'Média';
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

	const paginationRange = useMemo(() => {
		const delta = 2;
		const start = Math.max(1, currentPage - delta);
		const end = Math.min(totalPages, currentPage + delta);
		return Array.from({ length: end - start + 1 }, (_, idx) => start + idx);
	}, [currentPage, totalPages]);

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

	const openProfile = (userId: number) => {
		navigate(`/profil/${userId}`);
	};

	return (
		<main className="mt-5">
			<div className="container py-5" style={{ maxWidth: '1400px' }}>
				<h1 className="mb-4 text-center display-6 fw-bold text-decoration-underline">
					<i className="bi bi-bar-chart-fill me-2"></i>
					Ranglista
				</h1>

				<div className="leaderboard-filters mb-4">
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

				{error && (
					<div className="alert alert-warning" role="alert">
						{error}
					</div>
				)}

				{currentUser && (
					<div className="current-user-position mb-4">
						<div className="current-user-label">
							<i className="bi bi-person-fill me-2"></i>
							Te a ranglistan:
						</div>
						<div className="current-user-row">
							<div className="lb-col lb-rank">
								<span className="rank-number">#{currentUser.rank}</span>
							</div>
							<div className="lb-col lb-player">
								<img src={currentUser.avatar} alt={currentUser.username} className="player-avatar" />
								<img src={currentUser.countryFlag} alt={currentUser.countryCode} className="player-flag" />
								<button
									type="button"
									className="player-name leaderboard-profile-link"
									onClick={() => openProfile(currentUser.userId)}
								>
									{currentUser.username}
									{currentUser.isSubscriber && (
										<svg className="subscriber-crown" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14">
											<path fill="currentColor" d="M2 17l2-7 4 4 5-9 5 9 4-4 2 7H2z" />
										</svg>
									)}
								</button>
							</div>
							<div className="lb-col lb-points"><span className="points-value">{formatNumber(currentUser.points)}</span></div>
							<div className="lb-col lb-stats"><i className="bi bi-book stat-icon"></i>{formatNumber(currentUser.booksRead)}</div>
							<div className="lb-col lb-stats"><i className="bi bi-film stat-icon"></i>{formatNumber(currentUser.mediaWatched)}</div>
							<div className="lb-col lb-stats hide-mobile"><span className="completion-rate">{currentUser.completionRate.toFixed(1)}%</span></div>
							<div className="lb-col lb-stats hide-mobile"><span className="level-badge">Lv.{currentUser.level}</span></div>
							<div className="lb-col lb-streak hide-tablet"><i className="bi bi-fire streak-icon"></i>{currentUser.longestStreak} nap</div>
						</div>
					</div>
				)}

				<div className="leaderboard-container">
					<div className="leaderboard-header">
						<div className="lb-col lb-rank">Helyezes</div>
						<div className="lb-col lb-player">Jatekos</div>
						<div className="lb-col lb-points">Pontok</div>
						<div className="lb-col lb-stats">Konyvek</div>
						<div className="lb-col lb-stats">Media</div>
						<div className="lb-col lb-stats hide-mobile">Befejezes</div>
						<div className="lb-col lb-stats hide-mobile">Szint</div>
						<div className="lb-col lb-streak hide-tablet">Sorozat</div>
					</div>

					{loading && (
						<div className="leaderboard-loading">
							<div className="spinner-border text-primary" role="status">
								<span className="visually-hidden">Betoltes...</span>
							</div>
						</div>
					)}

					{!loading && (
						<div className="leaderboard-list">
							{leaderboardData.map((entry) => (
								<div key={entry.userId} className={`leaderboard-row ${getRankClass(entry.rank)}`}>
									<div className="lb-col lb-rank">
										{getRankIcon(entry.rank)}
										<span className="rank-number">#{entry.rank}</span>
									</div>
									<div className="lb-col lb-player">
										<img src={entry.avatar} alt={entry.username} className="player-avatar" />
										<img src={entry.countryFlag} alt={entry.countryCode} className="player-flag" />
										<button
											type="button"
											className="player-name leaderboard-profile-link"
											onClick={() => openProfile(entry.userId)}
										>
											{entry.username}
											{entry.isSubscriber && (
												<svg className="subscriber-crown" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14">
													<path fill="currentColor" d="M2 17l2-7 4 4 5-9 5 9 4-4 2 7H2z" />
												</svg>
											)}
										</button>
									</div>
									<div className="lb-col lb-points"><span className="points-value">{formatNumber(entry.points)}</span></div>
									<div className="lb-col lb-stats"><i className="bi bi-book stat-icon"></i>{formatNumber(entry.booksRead)}</div>
									<div className="lb-col lb-stats"><i className="bi bi-film stat-icon"></i>{formatNumber(entry.mediaWatched)}</div>
									<div className="lb-col lb-stats hide-mobile"><span className="completion-rate">{entry.completionRate.toFixed(1)}%</span></div>
									<div className="lb-col lb-stats hide-mobile"><span className="level-badge">Lv.{entry.level}</span></div>
									<div className="lb-col lb-streak hide-tablet"><i className="bi bi-fire streak-icon"></i>{entry.longestStreak} nap</div>
								</div>
							))}
						</div>
					)}

					{!loading && leaderboardData.length === 0 && !error && (
						<div className="leaderboard-empty">
							<i className="bi bi-emoji-frown"></i>
							<p>Nincs talalat a kivalasztott szurokkel.</p>
						</div>
					)}
				</div>

				{!loading && leaderboardData.length > 0 && totalPages > 1 && (
					<nav className="kk-pagination-wrap leaderboard-pagination-wrap" aria-label="Ranglista lapozasa">
						<ul className="pagination kk-pagination justify-content-center mb-0">
							<li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
								<button className="page-link" onClick={() => changePage(currentPage - 1)}>Elozo</button>
							</li>
							{paginationRange.map((page) => (
								<li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
									<button className="page-link" onClick={() => changePage(page)}>{page}</button>
								</li>
							))}
							<li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
								<button className="page-link" onClick={() => changePage(currentPage + 1)}>Kovetkezo</button>
							</li>
						</ul>
					</nav>
				)}

				<div className="leaderboard-info mt-4">
					<div className="info-card">
						<i className="bi bi-info-circle"></i>
						<div>
							<strong>Hogyan szamolodnak a pontok?</strong>
							<p>A pontokat a backend szamolja a kivalsztott tartalom- es regio-szurok alapjan.</p>
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}
