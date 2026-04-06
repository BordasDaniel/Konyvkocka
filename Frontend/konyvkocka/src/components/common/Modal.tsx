import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CardData } from './Card';
import { useAuth } from '../../context/AuthContext';
import {
	addToLibrary,
	ApiHttpError,
	applyContentImageFallback,
	getLibraryItemState,
	parseContentKey,
	toggleLibraryFavorite,
	updateLibraryProgress,
	type LibraryStatus,
} from '../../services/api';
import { toEmbedVideoUrl } from '../../utils/helpers';
import '../../styles/modal.css';

interface ModalProps {
	open: boolean;
	card?: CardData;
	onClose?: () => void;
}

const STATUS_OPTIONS: Array<{ value: LibraryStatus; label: string }> = [
	{ value: 'WATCHING', label: 'Folyamatban' },
	{ value: 'PAUSED', label: 'Szüneteltetett' },
	{ value: 'DROPPED', label: 'Félbehagyott' },
	{ value: 'PLANNED', label: 'Tervezett' },
	{ value: 'ARCHIVED', label: 'Archivált' },
];

const STATUS_VALUES = new Set<LibraryStatus>([
	...STATUS_OPTIONS.map((option) => option.value),
	'COMPLETED',
]);

const toLibraryStatus = (value: string | null | undefined): LibraryStatus | '' => {
	if (!value) return '';
	const normalized = value.toUpperCase() as LibraryStatus;
	return STATUS_VALUES.has(normalized) ? normalized : '';
};

export default function Modal({ open, card, onClose }: ModalProps) {
	const { isAuthenticated } = useAuth();
	const [visible, setVisible] = useState(false);
	const [closing, setClosing] = useState(false);
	const [libraryStateLoading, setLibraryStateLoading] = useState(false);
	const [libraryActionLoading, setLibraryActionLoading] = useState(false);
	const [libraryError, setLibraryError] = useState<string | null>(null);
	const [isInLibrary, setIsInLibrary] = useState(false);
	const [isFavorite, setIsFavorite] = useState(false);
	const [selectedStatus, setSelectedStatus] = useState<LibraryStatus | ''>('');
	const [statusMenuOpen, setStatusMenuOpen] = useState(false);
	const statusMenuRef = useRef<HTMLDivElement | null>(null);
	const wasOpen = React.useRef(false);
	const lastCard = React.useRef<typeof card>(undefined);
	if (card) lastCard.current = card;

	useEffect(() => {
		if (open) {
			setClosing(false);
			setVisible(true);
			wasOpen.current = true;
		} else if (wasOpen.current) {
			setClosing(true);
			wasOpen.current = false;
			const t = setTimeout(() => { setVisible(false); setClosing(false); }, 290);
			return () => clearTimeout(t);
		}
	}, [open]);

	useLayoutEffect(() => {
		if (visible) {
			const html = document.documentElement;
			const body = document.body;
			const lockCount = Number(body.dataset.kkScrollLocks || '0');

			if (lockCount === 0) {
				const scrollBarWidth = window.innerWidth - html.clientWidth;
				html.style.setProperty('--scrollbar-compensation', `${scrollBarWidth}px`);
				html.style.overflow = 'hidden';
				body.style.overflow = 'hidden';
				body.style.paddingRight = `${scrollBarWidth}px`;
				body.classList.add('kk-scroll-lock');
			}

			body.dataset.kkScrollLocks = String(lockCount + 1);

			return () => {
				const current = Number(body.dataset.kkScrollLocks || '1');
				const next = Math.max(0, current - 1);
				if (next === 0) {
					delete body.dataset.kkScrollLocks;
					html.style.overflow = '';
					body.style.overflow = '';
					body.style.paddingRight = '';
					html.style.removeProperty('--scrollbar-compensation');
					body.classList.remove('kk-scroll-lock');
				} else {
					body.dataset.kkScrollLocks = String(next);
				}
			};
		}
	}, [visible]);

	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && open) onClose?.();
		};
		document.addEventListener('keydown', handler);
		return () => document.removeEventListener('keydown', handler);
	}, [open, onClose]);

	const displayCard = card ?? lastCard.current;
	const parsedKey = displayCard ? parseContentKey(displayCard.id) : null;
	const trailerSrc = toEmbedVideoUrl(displayCard?.trailer);

	useEffect(() => {
		if (!open) {
			setStatusMenuOpen(false);
		}
	}, [open]);

	useEffect(() => {
		const onDocumentMouseDown = (event: MouseEvent) => {
			if (!statusMenuRef.current) return;
			if (!statusMenuRef.current.contains(event.target as Node)) {
				setStatusMenuOpen(false);
			}
		};

		document.addEventListener('mousedown', onDocumentMouseDown);
		return () => {
			document.removeEventListener('mousedown', onDocumentMouseDown);
		};
	}, []);

	useEffect(() => {
		let isMounted = true;

		const resetUiState = () => {
			setIsInLibrary(false);
			setIsFavorite(false);
			setSelectedStatus('');
			setLibraryError(null);
		};

		const loadLibraryState = async () => {
			if (!open || !isAuthenticated || !parsedKey) {
				resetUiState();
				setLibraryStateLoading(false);
				return;
			}

			setLibraryStateLoading(true);
			setLibraryError(null);

			try {
				const state = await getLibraryItemState(parsedKey.type, parsedKey.id);
				if (!isMounted) return;

				setIsInLibrary(state.exists);
				setIsFavorite(state.favorite);
				setSelectedStatus(toLibraryStatus(state.status));
				setStatusMenuOpen(false);
			} catch (error) {
				if (!isMounted) return;
				console.error('Library state load failed:', error);
				resetUiState();
			}
			finally {
				if (isMounted) setLibraryStateLoading(false);
			}
		};

		void loadLibraryState();

		return () => {
			isMounted = false;
		};
	}, [open, isAuthenticated, parsedKey?.id, parsedKey?.type]);

	if (!visible) return null;
	if (!displayCard) return null;

	const ratingStars = (rating: number) => {
		const r = Number.isFinite(rating) ? rating : 0;
		return Array.from({ length: 5 }).map((_, i) => (
			<i key={i} className={`bi bi-star-fill ${i < Math.round(r) ? 'filled' : ''}`}></i>
		));
	};

	const getAgeRatingClassName = () => {
		const ageRating = displayCard.ageRating;
		if (!ageRating) return '';

		const minAge = typeof ageRating.minAge === 'number' ? ageRating.minAge : null;
		const normalizedName = ageRating.name.toLowerCase();

		if (minAge === 18 || normalizedName.includes('18')) return 'age-rating-18';
		if (minAge === 16 || normalizedName.includes('16')) return 'age-rating-16';
		if (minAge === 12 || normalizedName.includes('12')) return 'age-rating-12';
		if (minAge === 0 || normalizedName.includes('minden')) return 'age-rating-all';
		if (normalizedName.includes('gyerek') || (minAge !== null && minAge > 0 && minAge < 12)) return 'age-rating-kid';

		return 'age-rating-unknown';
	};

	const handleBackdropClick = (e: React.MouseEvent) => {
		if ((e.target as HTMLElement).classList.contains('modal')) onClose?.();
	};

	const handleEpisodeClick = () => {
		if (displayCard.reader) {
			window.location.href = `#${displayCard.reader}?content=${encodeURIComponent(displayCard.id)}`;
		}
	};

	const handleLoginRedirect = () => {
		window.location.href = '#/belepes';
	};

	const ensureLibraryEntry = async (statusForCreate: LibraryStatus | ''): Promise<boolean> => {
		if (!parsedKey) return false;
		if (isInLibrary) return true;

		const payload: {
			type: typeof parsedKey.type;
			contentId: number;
			status?: LibraryStatus;
		} = {
			type: parsedKey.type,
			contentId: parsedKey.id,
		};

		if (statusForCreate !== '') {
			payload.status = statusForCreate;
		}

		try {
			await addToLibrary(payload);
		} catch (error) {
			if (!(error instanceof ApiHttpError) || error.status !== 409) {
				throw error;
			}
		}

		setIsInLibrary(true);
		return true;
	};

	const handleFavoriteToggle = async () => {
		if (!isAuthenticated) {
			handleLoginRedirect();
			return;
		}
		if (!parsedKey || libraryActionLoading) return;

		setLibraryActionLoading(true);
		setLibraryError(null);

		try {
			await ensureLibraryEntry(selectedStatus);
			const response = await toggleLibraryFavorite(parsedKey.type, parsedKey.id);
			setIsFavorite(response.favorite);
		} catch (error) {
			console.error('Favorite toggle failed:', error);
			if (error instanceof ApiHttpError && (error.status === 401 || error.status === 403)) {
				handleLoginRedirect();
				return;
			}
			setLibraryError('A kedvenc állapot mentése sikertelen.');
		} finally {
			setLibraryActionLoading(false);
		}
	};

	const handleStatusSelect = async (nextStatus: LibraryStatus | '') => {
		if (selectedStatus === 'COMPLETED') {
			setStatusMenuOpen(false);
			return;
		}

		setStatusMenuOpen(false);

		const previousStatus = selectedStatus;
		if (nextStatus === previousStatus) return;
		setSelectedStatus(nextStatus);

		if (!isAuthenticated) {
			handleLoginRedirect();
			setSelectedStatus(previousStatus);
			return;
		}
		if (!parsedKey || libraryActionLoading) return;

		setLibraryActionLoading(true);
		setLibraryError(null);

		try {
			await ensureLibraryEntry(nextStatus);
			await updateLibraryProgress(parsedKey.type, parsedKey.id, { status: nextStatus });
		} catch (error) {
			console.error('Status update failed:', error);
			if (error instanceof ApiHttpError && (error.status === 401 || error.status === 403)) {
				handleLoginRedirect();
				return;
			}
			setSelectedStatus(previousStatus);
			if (error instanceof ApiHttpError && error.message) {
				setLibraryError(error.message);
			} else {
				setLibraryError('Az állapot mentése sikertelen.');
			}
		} finally {
			setLibraryActionLoading(false);
		}
	};

	const selectedStatusLabel =
		selectedStatus === 'COMPLETED'
			? 'Befejezett'
			: STATUS_OPTIONS.find((option) => option.value === selectedStatus)?.label ?? 'Nincs állapot';

	const statusLocked = selectedStatus === 'COMPLETED';
	const statusTriggerDisabled = libraryStateLoading || libraryActionLoading || statusLocked;

	return (
		<>
			<div className={`custom-modal-backdrop${closing ? ' closing' : ''}`} style={{ display: 'block' }} onClick={onClose}></div>
			<div className={`modal fade modal-custom show${closing ? ' closing' : ''}`} style={{ display: 'block' }} role="dialog" onClick={handleBackdropClick}>
				<div className="modal-dialog modal-xl modal-dialog-centered" role="document">
					<div className="modal-content bg-dark text-light">
						<div className="modal-header border-0">
							<h5 className="modal-title">{displayCard.title}</h5>
							<button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={onClose}></button>
						</div>
						<div className="modal-body">
						<div className="px-3">
							<div className="row g-2">
								<div className="col-md-5">
									<img
										className="cover"
										src={displayCard.img}
										alt={`${displayCard.title} borító`}
										onError={(event) => {
											applyContentImageFallback(event.currentTarget);
										}}
									/>
								</div>
								<div className="col-md-7">
										<div className="modal-header-row">
											<h4>{displayCard.title}</h4>
											{isAuthenticated && parsedKey && (
												<div className="modal-library-actions" aria-label="Könyvtár és előzmény műveletek">
													<button
														type="button"
														className={`modal-favorite-btn${isFavorite ? ' active' : ''}`}
														onClick={handleFavoriteToggle}
														disabled={libraryStateLoading || libraryActionLoading}
														aria-label={isFavorite ? 'Eltávolítás a kedvencek közül' : 'Hozzáadás a kedvencekhez'}
														title={isFavorite ? 'Kedvenc' : 'Nem kedvenc'}
													>
														<i className={`bi ${isFavorite ? 'bi-heart-fill' : 'bi-heart'}`}></i>
													</button>
													<div className="modal-status-dropdown" ref={statusMenuRef}>
														<button
															type="button"
															className={`modal-status-trigger${statusLocked ? ' is-locked' : ''}`}
															onClick={() => {
																if (statusTriggerDisabled) return;
																setStatusMenuOpen((prev) => !prev);
															}}
															disabled={statusTriggerDisabled}
															aria-expanded={statusMenuOpen}
															aria-haspopup="listbox"
															aria-label="Megtekintési állapot"
															title={statusLocked ? 'Befejezett állapot lezárva' : 'Megtekintési állapot'}
														>
															<span>{selectedStatusLabel}</span>
															<i className={`bi ${statusLocked ? 'bi-lock-fill' : 'bi-chevron-down'}`}></i>
														</button>
														<div className={`modal-status-menu${statusMenuOpen ? ' show' : ''}`} role="listbox" aria-label="Állapot lehetőségek">
															<button
																type="button"
																className={`modal-status-option${selectedStatus === '' ? ' active' : ''}`}
																onClick={() => void handleStatusSelect('')}
															>
																Nincs állapot
															</button>
															{STATUS_OPTIONS.map((option) => (
																<button
																	key={option.value}
																	type="button"
																	className={`modal-status-option${selectedStatus === option.value ? ' active' : ''}`}
																	onClick={() => void handleStatusSelect(option.value)}
																>
																	{option.label}
																</button>
															))}
														</div>
													</div>
												</div>
											)}
										</div>
										{libraryError && (
											<div className="modal-library-error">{libraryError}</div>
										)}
										{displayCard.ageRating && (
											<div className="age-rating-row">
												<span className={`age-rating-badge ${getAgeRatingClassName()}`}>
													Korhatár: {displayCard.ageRating.name}
												</span>
											</div>
										)}
										<div className="tags-inline">
											{(displayCard.tags || []).map((t, idx) => (
												<span key={idx}>{t}</span>
											))}
										</div>
										{displayCard.desc && <p>{displayCard.desc}</p>}

										{trailerSrc && displayCard.type !== 'book' && (
											<div className="video-wrapper">
												<iframe
													src={trailerSrc}
													title={`${displayCard.title} trailer`}
													allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
													allowFullScreen
												></iframe>
											</div>
										)}

{Number.isFinite(displayCard.rating) && (
								<div className="viewer-rating" aria-hidden="true">
									<div className="stars">{ratingStars(displayCard.rating)}</div>
									<div className="rating-num">{displayCard.rating.toFixed(1)}</div>
											</div>
										)}

										<div className="episode-list">
											<strong>Epizódok:</strong>
											<ul aria-label="Episodic list">
												{Array.isArray(displayCard.episodes) && displayCard.episodes.length > 0 ? (
													displayCard.episodes.map((ep, idx) => (
														<li key={idx} onClick={handleEpisodeClick} tabIndex={0}>
															{typeof ep === 'string' ? ep : 'Epizód'}
														</li>
													))
												) : (
													<li style={{ opacity: 0.8 }}>Nincs elérhető epizód.</li>
												)}
											</ul>
										</div>

										<div className="comments-section">
											<h6>Hozzászólások</h6>
											<p className="comment-text mb-2">
												A hozzászólás funkció jelenleg nem érhető el.
											</p>
											{!isAuthenticated && (
												<div className="d-flex justify-content-end mt-2">
													<button type="button" className="btn" onClick={handleLoginRedirect}>
														Jelentkezz be
													</button>
												</div>
											)}
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
