import React, { useMemo, useState, useEffect } from 'react';
import Card, { mockCards } from '../components/common/Card.tsx';
import type { CardData } from '../components/common/Card.tsx';
import Modal from '../components/common/Modal.tsx';

const Search: React.FC = () => {
	const [query, setQuery] = useState('');
	const [filterOpen, setFilterOpen] = useState(false);
	const [selectedCard, setSelectedCard] = useState<CardData | null>(null);

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

	const results = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) return mockCards;
		return mockCards.filter((c) => {
			const haystack = `${c.title} ${c.desc} ${(c.tags || []).join(' ')}`.toLowerCase();
			return haystack.includes(q);
		});
	}, [query]);

	const toggleFilter = () => setFilterOpen((v) => !v);
	const closeFilter = () => setFilterOpen(false);
	const resetFilters = () => {
		// Későbbre: ide jön majd a valódi szűrés logika
		closeFilter();
	};

	return (
		<div className="search-page">
			<div id="filterBackdrop" className={`filter-backdrop ${filterOpen ? 'active' : ''}`} onClick={closeFilter}></div>

			<section className="search-hero py-5">
				<div className="container">
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

			<section className="search-results my-4">
				<div className="container-fluid px-4">
					<div className="results-grid">
						<div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5">
							{results.length === 0 ? (
								<div className="col-12">
									<p className="fw-bold text-center text-decoration-underline">Nincsenek találatok. Kezdd el a keresést a fenti mezőben.</p>
								</div>
							) : (
								<Card
									data={results}
									count={results.length}
									category="custom"
									showMoreCard={false}
									onCardClick={(c) => setSelectedCard(c)}
									gridClass="col mb-4"
								/>
							)}
						</div>
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
