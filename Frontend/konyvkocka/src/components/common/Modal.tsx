import React, { useEffect, useLayoutEffect, useState } from 'react';
import type { CardData } from './Card';
import { useAuth } from '../../context/AuthContext';
import { toEmbedVideoUrl } from '../../utils/helpers';
import '../../styles/modal.css';

interface ModalProps {
	open: boolean;
	card?: CardData;
	onClose?: () => void;
}

export default function Modal({ open, card, onClose }: ModalProps) {
	const { isAuthenticated } = useAuth();
	const [visible, setVisible] = useState(false);
	const [closing, setClosing] = useState(false);
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

	if (!visible) return null;
	const displayCard = card ?? lastCard.current;
	if (!displayCard) return null;
	const trailerSrc = toEmbedVideoUrl(displayCard.trailer);

	const ratingStars = (rating: number) => {
		const r = Number.isFinite(rating) ? rating : 0;
		return Array.from({ length: 5 }).map((_, i) => (
			<i key={i} className={`bi bi-star-fill ${i < Math.round(r) ? 'filled' : ''}`}></i>
		));
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
									<img className="cover" src={displayCard.img} alt={`${displayCard.title} borító`} />
								</div>
								<div className="col-md-7">
										<h4>{displayCard.title}</h4>
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
