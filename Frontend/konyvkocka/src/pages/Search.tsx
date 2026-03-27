import React, { useMemo, useState, useEffect } from 'react';
import Card from '../components/common/Card.tsx';
import type { CardData } from '../components/common/Card.tsx';
import Modal from '../components/common/Modal.tsx';
import {
	buildContentKey,
	getContentDetail,
	parseContentKey,
	searchContent,
	toContentImageSrc,
	type ContentDetailResponse,
	type HomeCardResponse,
} from '../services/api';

const mapSearchCardToUi = (item: HomeCardResponse): CardData => ({
	id: buildContentKey(item.type, item.id),
	img: toContentImageSrc(item.img),
	title: item.title,
	tags: item.tags ?? [],
	rating: Number(item.rating ?? 0),
	desc: '',
	type: item.type === 'movie' ? 'movie' : item.type === 'series' ? 'series' : 'book',
});

const mapDetailToCard = (detail: ContentDetailResponse): CardData => ({
	id: buildContentKey(detail.type, detail.id),
	img: toContentImageSrc(detail.img),
	title: detail.title,
	tags: detail.tags ?? [],
	rating: Number(detail.rating ?? 0),
	desc: detail.description,
	trailer: detail.trailerUrl ?? undefined,
	episodes:
		detail.episodes?.map((episode) => `S${episode.seasonNum}E${episode.episodeNum} - ${episode.title}`) ??
		(detail.watchUrl ? ['Megnyitás'] : []),
	reader: detail.type === 'movie' || detail.type === 'series' ? '/nezes' : '/olvaso',
	type: detail.type === 'movie' ? 'movie' : detail.type === 'series' ? 'series' : 'book',
});

const Search: React.FC = () => {
	const [query, setQuery] = useState('');
	const [filterOpen, setFilterOpen] = useState(false);
	const [selectedCard, setSelectedCard] = useState<CardData | null>(null);
	const [results, setResults] = useState<CardData[]>([]);
	const [totalResults, setTotalResults] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const pageSize = 10;

	useEffect(() => {
		if (filterOpen) {
			document.body.style.overflow = 'hidden';
			document.documentElement.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
			document.documentElement.style.overflow = '';
		}
		return () => {
			document.body.style.overflow = '';
			document.documentElement.style.overflow = '';
		};
	}, [filterOpen]);

	const totalPages = Math.max(1, Math.ceil(totalResults / pageSize));

	useEffect(() => {
		setCurrentPage(1);
	}, [query]);

	useEffect(() => {
		let isMounted = true;

		const loadSearchResults = async () => {
			setIsLoading(true);
			setError(null);

			try {
				const response = await searchContent({
					q: query.trim() || undefined,
					limit: pageSize,
					offset: (currentPage - 1) * pageSize,
				});

				if (!isMounted) return;

				setResults(response.items.map(mapSearchCardToUi));
				setTotalResults(response.total);
			} catch (loadError) {
				if (!isMounted) return;
				console.error('Search failed:', loadError);
				setError('A keresési eredmények betöltése sikertelen.');
				setResults([]);
				setTotalResults(0);
			} finally {
				if (isMounted) setIsLoading(false);
			}
		};

		void loadSearchResults();

		return () => {
			isMounted = false;
		};
	}, [query, currentPage]);

	useEffect(() => {
		if (currentPage > totalPages) {
			setCurrentPage(totalPages);
		}
	}, [currentPage, totalPages]);

	const toggleFilter = () => setFilterOpen((v) => !v);
	const closeFilter = () => setFilterOpen(false);
	const resetFilters = () => {
		// Későbbre: ide jön majd a valódi szűrés logika
		closeFilter();
	};

	const handleCardClick = async (card: CardData) => {
		const parsed = parseContentKey(card.id);
		if (!parsed) {
			setSelectedCard(card);
			return;
		}

		setSelectedCard({ ...card, desc: 'Részletek betöltése...' });

		try {
			const details = await getContentDetail(parsed.type, parsed.id);
			setSelectedCard(mapDetailToCard(details));
		} catch (detailError) {
			console.error('Detail load failed:', detailError);
			setSelectedCard({ ...card, desc: card.desc || 'A részletek betöltése sikertelen.' });
		}
	};

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

	return (
		<div className="search-page">
			<div id="filterBackdrop" className={`filter-backdrop ${filterOpen ? 'active' : ''}`} onClick={closeFilter}></div>

			<section className="search-hero py-5">
				<div className="container pt-5">
					<div className="row justify-content-center mb-3">
						<div className="col-lg-8 col-md-10 text-center">
							<h1 className="fw-bold text-decoration-underline" style={{ color: 'var(--h1Text)' }}>
								<i className="bi bi-search me-2"></i>
								Keresés
							</h1>
							<p className="text-light mb-0">Fedezd fel könyvek, filmek és sorozatok széles választékát. Szűrj, találd meg a kedvenceidet.</p>
						</div>
					</div>

					<div className="row justify-content-center">
						<div className="col-lg-8 col-md-10">
							<div className="search-wrap position-relative">
								<button
									id="filterToggle"
									className="btn-filter position-absolute"
									aria-expanded={filterOpen}
									aria-controls="filterPanel"
									aria-label="Szűrők megnyitása"
									onClick={toggleFilter}
								>
									<i className="bi bi-funnel"></i>
								</button>

								<div
									id="filterPanel"
									className={`filter-panel ${filterOpen ? '' : 'd-none'}`}
									role="dialog"
									aria-modal="false"
									aria-hidden={!filterOpen}
								>
									<div className="filter-panel-header d-flex justify-content-between align-items-center px-3 py-2">
										<h5 className="m-0">Szűrők</h5>
										<button id="filterClose" className="filter-close btn-close" aria-label="Bezár" onClick={closeFilter}></button>
									</div>
									<div className="filter-inner p-3">
										<div className="filter-grid">
											<div className="filter-group">
												<h6>Korhatárok</h6>
												{['Minden', 'Gyerek', '12+', '16+', '18+'].map((label, idx) => (
													<div className="form-check" key={idx}>
														<input className="form-check-input" type="checkbox" id={`age_${idx}`} />
														<label className="form-check-label" htmlFor={`age_${idx}`}>{label}</label>
													</div>
												))}
											</div>

											<div className="filter-group">
												<h6>Típusok</h6>
												{['Könyv', 'Film', 'Sorozat'].map((label, idx) => (
													<div className="form-check" key={idx}>
														<input className="form-check-input" type="checkbox" id={`type_${idx}`} />
														<label className="form-check-label" htmlFor={`type_${idx}`}>{label}</label>
													</div>
												))}
											</div>

											<div className="filter-group filter-genres">
												<h6>Műfajok</h6>
												<div className="genres-columns">
													{['Akció','Kaland','Krimi','Dráma','Vígjáték','Romantikus','Sci-fi','Fantasy','Horror','Thriller','Családi','Történelmi','Életrajzi','Dokumentum','Mese'].map((label, idx) => (
														<div className="form-check" key={idx}>
															<input className="form-check-input" type="checkbox" id={`genre_${idx}`} />
															<label className="form-check-label" htmlFor={`genre_${idx}`}>{label}</label>
														</div>
													))}
												</div>
											</div>

											<div className="filter-group">
												<h6>Egyéb</h6>
												{['Magyar','Külföldi','Filmadaptáció','Képregény alapú','Animációs','Feliratos'].map((label, idx) => (
													<div className="form-check" key={idx}>
														<input className="form-check-input" type="checkbox" id={`extra_${idx}`} />
														<label className="form-check-label" htmlFor={`extra_${idx}`}>{label}</label>
													</div>
												))}
											</div>

											<div className="filter-group">
												<h6>Rendezés</h6>
												{['Relevancia','Értékelés','Felkapott','Megjelenés'].map((label, idx) => (
													<div className="form-check" key={idx}>
														<input className="form-check-input" type="checkbox" id={`sort_${idx}`} />
														<label className="form-check-label" htmlFor={`sort_${idx}`}>{label}</label>
													</div>
												))}
											</div>
										</div>

										<div className="filter-panel-footer px-3 py-2">
											<button id="filterApply" className="btn btn-primary btn-sm" onClick={closeFilter}>Alkalmaz</button>
											<button id="filterReset" className="btn btn-secondary btn-sm reset" onClick={resetFilters}>Alaphelyzet</button>
										</div>
									</div>
								</div>

								<input
									type="search"
									className="form-control search-input rounded-pill"
									placeholder="Keresés könyvek, filmek..."
									aria-label="Keresés"
									value={query}
									onChange={(e) => setQuery(e.target.value)}
								/>
							</div>
						</div>
					</div>
				</div>
			</section>

			<section className="search-results my-2">
				<div className="container-fluid px-4">
					<div className="results-grid">
							{isLoading ? (
								<div className="text-center py-5">
									<div className="spinner-border text-primary" role="status">
										<span className="visually-hidden">Betöltés...</span>
									</div>
								</div>
							) : error ? (
								<div className="alert alert-warning" role="alert">
									{error}
								</div>
							) : results.length === 0 ? (
							<div className="empty-state text-center">
								<div>
									<p className="empty-title mb-2">Nincsenek találatok.</p>
									<p className="empty-subtitle mb-0">Kezdd el a keresést a fenti mezőben.</p>
								</div>
							</div>
						) : (
							<>
								<div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5">
									<Card
										data={results}
										count={results.length}
										category="custom"
										showMoreCard={false}
										onCardClick={handleCardClick}
										gridClass="col mb-4"
									/>
								</div>

								{totalPages > 1 && (
									<nav className="kk-pagination-wrap" aria-label="Keresési találatok lapozása">
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
							</>
						)}
					</div>
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

export default Search;
