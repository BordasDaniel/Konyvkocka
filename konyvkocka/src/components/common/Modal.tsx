import React, { useEffect, useMemo, useState } from 'react';
import type { CardData } from './Card';
import '../../styles/modal.css';

interface Comment {
	text: string;
	date: string;
	user: string;
}

interface ModalProps {
	open: boolean;
	card?: CardData;
	onClose?: () => void;
}

/**
 * Modal a kártyák megnyitásához. A kommentek localStorage-ben tárolódnak,
 * és az "isLoggedIn" flag alapján engedélyezettek (home.html mintájára).
 */
export default function Modal({ open, card, onClose }: ModalProps) {
	const [comments, setComments] = useState<Comment[]>([]);
	const [commentText, setCommentText] = useState('');

	const isLoggedIn = useMemo(() => localStorage.getItem('isLoggedIn') === 'true', []);

	useEffect(() => {
		if (open && card) {
			const scrollY = window.scrollY;
			document.body.style.position = 'fixed';
			document.body.style.top = `-${scrollY}px`;
			document.body.style.width = '100%';
			document.body.style.overflow = 'hidden';
			loadComments(card.title);
			return () => {
				document.body.style.position = '';
				document.body.style.top = '';
				document.body.style.width = '';
				document.body.style.overflow = '';
				window.scrollTo(0, scrollY);
			};
		}
	}, [open, card]);

	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && open) onClose?.();
		};
		document.addEventListener('keydown', handler);
		return () => document.removeEventListener('keydown', handler);
	}, [open, onClose]);

	if (!open || !card) return null;

	const ratingStars = (rating: number) => {
		const r = Number.isFinite(rating) ? rating : 0;
		return Array.from({ length: 5 }).map((_, i) => (
			<i key={i} className={`bi bi-star-fill ${i < Math.round(r) ? 'filled' : ''}`}></i>
		));
	};

	const commentsKey = (title: string) => `comments::${title}`;

	const loadComments = (title: string) => {
		try {
			const raw = localStorage.getItem(commentsKey(title));
			const arr = raw ? JSON.parse(raw) : [];
			setComments(Array.isArray(arr) ? arr : []);
		} catch (e) {
			setComments([]);
		}
	};

	const saveComment = (title: string, text: string) => {
		const key = commentsKey(title);
		const user = localStorage.getItem('lastUsername') || `User${Math.floor(1000 + Math.random() * 9000)}`;
		localStorage.setItem('lastUsername', user);
		const next = [...comments, { text, date: new Date().toLocaleString(), user }];
		setComments(next);
		localStorage.setItem(key, JSON.stringify(next));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!isLoggedIn) return;
		const txt = commentText.trim();
		if (!txt) return;
		saveComment(card.title, txt);
		setCommentText('');
	};

	const handleBackdropClick = (e: React.MouseEvent) => {
		if ((e.target as HTMLElement).classList.contains('modal')) onClose?.();
	};

	const handleEpisodeClick = () => {
		if (card.reader) {
			window.location.href = card.reader;
		}
	};

	return (
		<>
			<div className="custom-modal-backdrop" style={{ display: open ? 'block' : 'none' }} onClick={onClose}></div>
			<div className={`modal fade modal-custom show`} style={{ display: 'block' }} role="dialog" onClick={handleBackdropClick}>
				<div className="modal-dialog modal-xl modal-dialog-centered" role="document">
					<div className="modal-content bg-dark text-light">
						<div className="modal-header border-0">
							<h5 className="modal-title">{card.title}</h5>
							<button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={onClose}></button>
						</div>
						<div className="modal-body">
						<div className="px-3">
							<div className="row g-2">
								<div className="col-md-5">
									<img className="cover" src={card.img} alt={`${card.title} borító`} />
								</div>
								<div className="col-md-7">
										<h4>{card.title}</h4>
										<div className="tags-inline">
											{(card.tags || []).map((t, idx) => (
												<span key={idx}>{t}</span>
											))}
										</div>
										{card.desc && <p>{card.desc}</p>}

										{card.trailer && (
											<div className="video-wrapper">
												<iframe
													src={`${card.trailer}${card.trailer.includes('?') ? '&' : '?'}rel=0`}
													title={`${card.title} trailer`}
													allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
													allowFullScreen
												></iframe>
											</div>
										)}

										{Number.isFinite(card.rating) && (
											<div className="viewer-rating" aria-hidden="true">
												<div className="stars">{ratingStars(card.rating)}</div>
												<div className="rating-num">{card.rating.toFixed(1)}</div>
											</div>
										)}

										<div className="episode-list">
											<strong>Epizódok:</strong>
											<ul aria-label="Episodic list">
												{Array.isArray(card.episodes) && card.episodes.length > 0 ? (
													card.episodes.map((ep, idx) => (
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
											<form className="comment-form" onSubmit={handleSubmit}>
												<textarea
													placeholder="Írj egy hozzászólást..."
													value={commentText}
													onChange={(e) => setCommentText(e.target.value)}
													disabled={!isLoggedIn}
												></textarea>
												<div className="d-flex justify-content-end mt-2">
													<button 
														type="button" 
														className="btn"
														onClick={() => {
															if (isLoggedIn) {
																handleSubmit(new Event('submit') as any);
															} else {
															window.location.href = '/belepes';
															}
														}}
													>
														{isLoggedIn ? 'Küldés' : 'Jelentkezz be először'}
													</button>
												</div>
											</form>
											<ul className="comments-list">
												{comments.length === 0 ? (
													<li>Még nincs hozzászólás.</li>
												) : (
													comments
														.slice()
														.reverse()
														.map((c, idx) => (
															<li key={idx}>
																<div className="comment-meta">{`${c.user || 'Anonymous'} · ${c.date}`}</div>
																<div className="comment-text">{c.text}</div>
															</li>
														))
												)}
											</ul>
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
