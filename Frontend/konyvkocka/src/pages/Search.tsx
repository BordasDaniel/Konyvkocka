import React, { useEffect, useMemo, useState } from 'react';
import Card from '../components/common/Card.tsx';
import type { CardData } from '../components/common/Card.tsx';
import Modal from '../components/common/Modal.tsx';
import {
	buildContentKey,
	getContentAgeRatings,
	getContentDetail,
	getContentTags,
	parseContentKey,
	searchContent,
	toContentImageSrc,
	type ContentDetailResponse,
	type HomeCardResponse,
} from '../services/api';

const TYPE_OPTIONS = [
	{ value: 'book', label: 'Könyv' },
	{ value: 'movie', label: 'Film' },
	{ value: 'series', label: 'Sorozat' },
] as const;

const SORT_OPTIONS = [
	{ value: 'relevancia', label: 'Relevancia' },
	{ value: 'ertekeles', label: 'Értékelés' },
	{ value: 'felkapott', label: 'Felkapott' },
	{ value: 'megjelenes', label: 'Megjelenés' },
] as const;

const FALLBACK_AGE_RATINGS = ['Minden', 'Gyerek', '12+', '16+', '18+'];

const FALLBACK_TAGS = [
	'Akció',
	'Kaland',
	'Krimi',
	'Dráma',
	'Vígjáték',
	'Romantikus',
	'Sci-fi',
	'Fantasy',
	'Horror',
	'Thriller',
	'Családi',
	'Történelmi',
	'Életrajzi',
	'Dokumentum',
	'Mese',
	'Magyar',
	'Külföldi',
	'Filmadaptáció',
	'Képregény alapú',
	'Animációs',
	'Feliratos',
];

type SortValue = (typeof SORT_OPTIONS)[number]['value'];

interface SearchFilters {
	ageRatings: string[];
	types: string[];
	tags: string[];
	sort: SortValue;
}

const createDefaultFilters = (): SearchFilters => ({
	ageRatings: [],
	types: [],
	tags: [],
	sort: 'relevancia',
});

const cloneFilters = (filters: SearchFilters): SearchFilters => ({
	ageRatings: [...filters.ageRatings],
	types: [...filters.types],
	tags: [...filters.tags],
	sort: filters.sort,
});

const toggleListValue = (items: string[], value: string): string[] =>
	items.includes(value) ? items.filter((item) => item !== value) : [...items, value];

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
	const [appliedFilters, setAppliedFilters] = useState<SearchFilters>(() => createDefaultFilters());
	const [draftFilters, setDraftFilters] = useState<SearchFilters>(() => createDefaultFilters());
	const [ageRatingOptions, setAgeRatingOptions] = useState<string[]>(FALLBACK_AGE_RATINGS);
	const [tagOptions, setTagOptions] = useState<string[]>(FALLBACK_TAGS);
	const [selectedCard, setSelectedCard] = useState<CardData | null>(null);
	const [results, setResults] = useState<CardData[]>([]);
	const [totalResults, setTotalResults] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const pageSize = 10;
	const normalizedQuery = query.trim();

	const typeParam = useMemo(
		() => (appliedFilters.types.length > 0 ? appliedFilters.types.join(',') : undefined),
		[appliedFilters.types],
	);

	const ageRatingsParam = useMemo(
		() => (appliedFilters.ageRatings.length > 0 ? appliedFilters.ageRatings.join(',') : undefined),
		[appliedFilters.ageRatings],
	);

	const tagsParam = useMemo(
		() => (appliedFilters.tags.length > 0 ? appliedFilters.tags.join(',') : undefined),
		[appliedFilters.tags],
	);

	useEffect(() => {
		let isMounted = true;

		const loadFilterOptions = async () => {
			try {
				const [ageRatingsResponse, tagsResponse] = await Promise.all([
					getContentAgeRatings(),
					getContentTags(),
				]);

				if (!isMounted) return;

				if (ageRatingsResponse.length > 0) {
					setAgeRatingOptions(ageRatingsResponse.map((ageRating) => ageRating.name));
				}

				if (tagsResponse.length > 0) {
					setTagOptions(tagsResponse.map((tag) => tag.name));
				}
			} catch (filterLoadError) {
				console.error('Filter options loading failed:', filterLoadError);
			}
		};

		void loadFilterOptions();

		return () => {
			isMounted = false;
		};
	}, []);

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
	}, [normalizedQuery, typeParam, ageRatingsParam, tagsParam, appliedFilters.sort]);

	useEffect(() => {
		let isMounted = true;

		const loadSearchResults = async () => {
			setIsLoading(true);
			setError(null);

			try {
				const response = await searchContent({
					q: normalizedQuery || undefined,
					type: typeParam,
					ageRatings: ageRatingsParam,
					tags: tagsParam,
					sort: appliedFilters.sort,
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
	}, [normalizedQuery, currentPage, typeParam, ageRatingsParam, tagsParam, appliedFilters.sort]);

	useEffect(() => {
		if (currentPage > totalPages) {
			setCurrentPage(totalPages);
		}
	}, [currentPage, totalPages]);

	const toggleFilter = () => {
		setFilterOpen((isOpen) => {
			if (!isOpen) {
				setDraftFilters(cloneFilters(appliedFilters));
			}
			return !isOpen;
		});
	};

	const closeFilter = () => {
		setDraftFilters(cloneFilters(appliedFilters));
		setFilterOpen(false);
	};

	const applyFilters = () => {
		setAppliedFilters(cloneFilters(draftFilters));
		setFilterOpen(false);
	};

	const resetFilters = () => {
		const defaults = createDefaultFilters();
		setAppliedFilters(defaults);
		setDraftFilters(cloneFilters(defaults));
		setCurrentPage(1);
		setFilterOpen(false);
	};

	const toggleDraftAgeRating = (value: string) => {
		setDraftFilters((prev) => ({
			...prev,
			ageRatings: toggleListValue(prev.ageRatings, value),
		}));
	};

	const toggleDraftType = (value: string) => {
		setDraftFilters((prev) => ({
			...prev,
			types: toggleListValue(prev.types, value),
		}));
	};

	const toggleDraftTag = (value: string) => {
		setDraftFilters((prev) => ({
			...prev,
			tags: toggleListValue(prev.tags, value),
		}));
	};

	const setDraftSort = (value: SortValue) => {
		setDraftFilters((prev) => ({
			...prev,
			sort: value,
		}));
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
												{ageRatingOptions.map((label, idx) => (
													<div className="form-check" key={`${label}_${idx}`}>
														<input
															className="form-check-input"
															type="checkbox"
															id={`age_${idx}`}
															checked={draftFilters.ageRatings.includes(label)}
															onChange={() => toggleDraftAgeRating(label)}
														/>
														<label className="form-check-label" htmlFor={`age_${idx}`}>{label}</label>
													</div>
												))}
											</div>

											<div className="filter-group">
												<h6>Típusok</h6>
												{TYPE_OPTIONS.map((option, idx) => (
													<div className="form-check" key={option.value}>
														<input
															className="form-check-input"
															type="checkbox"
															id={`type_${idx}`}
															checked={draftFilters.types.includes(option.value)}
															onChange={() => toggleDraftType(option.value)}
														/>
														<label className="form-check-label" htmlFor={`type_${idx}`}>{option.label}</label>
													</div>
												))}
											</div>

											<div className="filter-group filter-genres">
												<h6>Címkék</h6>
												<div className="genres-columns">
													{tagOptions.map((label, idx) => (
														<div className="form-check" key={`${label}_${idx}`}>
															<input
																className="form-check-input"
																type="checkbox"
																id={`tag_${idx}`}
																checked={draftFilters.tags.includes(label)}
																onChange={() => toggleDraftTag(label)}
															/>
															<label className="form-check-label" htmlFor={`tag_${idx}`}>{label}</label>
														</div>
													))}
												</div>
											</div>

											<div className="filter-group">
												<h6>Rendezés</h6>
												{SORT_OPTIONS.map((option, idx) => (
													<div className="form-check" key={option.value}>
														<input
															className="form-check-input"
															type="radio"
															name="search-sort"
															id={`sort_${idx}`}
															checked={draftFilters.sort === option.value}
															onChange={() => setDraftSort(option.value)}
														/>
														<label className="form-check-label" htmlFor={`sort_${idx}`}>{option.label}</label>
													</div>
												))}
											</div>
										</div>

										<div className="filter-panel-footer px-3 py-2">
											<button id="filterApply" className="btn btn-primary btn-sm" onClick={applyFilters}>Alkalmaz</button>
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
