import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/nonPremiumAd.css';

type AdSurface = 'reader' | 'watch';

interface NonPremiumAdProps {
	enabled: boolean;
	surface: AdSurface;
}

interface AdVariant {
	title: string;
	description: string;
	iconClass: string;
}

const MIN_DELAY_MS = 300000;
const MAX_DELAY_MS = 600000;
const DISPLAY_DURATION_MS = 18000;
const SHOW_PROBABILITY = 0.72;
const LAST_SHOWN_KEY = 'kk_non_premium_ad_last_shown';
const SESSION_COOLDOWN_MS = 120000;
const DISMISS_LOCK_SECONDS = 5;

const SURFACE_ADS: Record<AdSurface, AdVariant[]> = {
	reader: [
		{
			title: 'Tetszik az olvasó?',
			description: 'Prémium csomaggal reklámok nélkül olvashatsz, extra kényelmi funkciókkal.',
			iconClass: 'bi-stars',
		},
		{
			title: 'Olvass megszakítás nélkül',
			description: 'Válts prémiumra, és élvezd a reklámmentes olvasási élményt.',
			iconClass: 'bi-book-half',
		},
	],
	watch: [
		{
			title: 'Filmezés prémium módban',
			description: 'Reklámmentes megtekintés, kevesebb megszakítás, jobb élmény.',
			iconClass: 'bi-film',
		},
		{
			title: 'Megéri prémiumra váltani',
			description: 'Több tartalom, reklámok nélkül, komfortosabban.',
			iconClass: 'bi-play-circle',
		},
	],
};

const randomBetween = (min: number, max: number): number =>
	Math.floor(min + Math.random() * (max - min));

const canShowNow = (): boolean => {
	try {
		const raw = sessionStorage.getItem(LAST_SHOWN_KEY);
		if (!raw) return true;
		const lastShown = Number(raw);
		if (!Number.isFinite(lastShown)) return true;
		return Date.now() - lastShown >= SESSION_COOLDOWN_MS;
	} catch {
		return true;
	}
};

const markShownNow = () => {
	try {
		sessionStorage.setItem(LAST_SHOWN_KEY, String(Date.now()));
	} catch {
		// Ignore storage errors.
	}
};

const exitFullscreenIfNeeded = async (): Promise<void> => {
	if (!document.fullscreenElement) return;

	try {
		await document.exitFullscreen();
	} catch {
		// Some browsers may reject programmatic fullscreen exit.
	}
};

const NonPremiumAd: React.FC<NonPremiumAdProps> = ({ enabled, surface }) => {
	const [visible, setVisible] = useState(false);
	const [adIndex, setAdIndex] = useState(0);
	const [dismissCountdown, setDismissCountdown] = useState(0);
	const showTimerRef = useRef<number | null>(null);
	const hideTimerRef = useRef<number | null>(null);
	const dismissTimerRef = useRef<number | null>(null);

	const adVariants = useMemo(() => SURFACE_ADS[surface], [surface]);
	const currentAd = adVariants[adIndex] ?? adVariants[0];

	const clearTimers = () => {
		if (showTimerRef.current) window.clearTimeout(showTimerRef.current);
		if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
		if (dismissTimerRef.current) window.clearInterval(dismissTimerRef.current);
		showTimerRef.current = null;
		hideTimerRef.current = null;
		dismissTimerRef.current = null;
	};

	const hideAdNow = () => {
		setVisible(false);
		setDismissCountdown(0);
		if (hideTimerRef.current) {
			window.clearTimeout(hideTimerRef.current);
			hideTimerRef.current = null;
		}
		if (dismissTimerRef.current) {
			window.clearInterval(dismissTimerRef.current);
			dismissTimerRef.current = null;
		}
	};

	useEffect(() => {
		if (!enabled) {
			hideAdNow();
			clearTimers();
			return;
		}

		let cancelled = false;

		const scheduleNext = () => {
			if (cancelled) return;
			const delay = randomBetween(MIN_DELAY_MS, MAX_DELAY_MS);
			showTimerRef.current = window.setTimeout(async () => {
				if (cancelled) return;

				const shouldShow = Math.random() < SHOW_PROBABILITY && canShowNow();
				if (shouldShow) {
					await exitFullscreenIfNeeded();
					if (cancelled) return;

					setAdIndex((prev) => (prev + 1) % adVariants.length);
					setDismissCountdown(DISMISS_LOCK_SECONDS);
					setVisible(true);
					markShownNow();

					if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
					hideTimerRef.current = window.setTimeout(() => {
						hideAdNow();
					}, DISPLAY_DURATION_MS);
				}

				scheduleNext();
			}, delay);
		};

		scheduleNext();

		return () => {
			cancelled = true;
			clearTimers();
		};
	}, [adVariants.length, enabled]);

	useEffect(() => {
		if (!visible) {
			if (dismissTimerRef.current) {
				window.clearInterval(dismissTimerRef.current);
				dismissTimerRef.current = null;
			}
			return;
		}

		if (dismissTimerRef.current) {
			window.clearInterval(dismissTimerRef.current);
		}

		dismissTimerRef.current = window.setInterval(() => {
			setDismissCountdown((previous) => {
				if (previous <= 1) {
					if (dismissTimerRef.current) {
						window.clearInterval(dismissTimerRef.current);
						dismissTimerRef.current = null;
					}
					return 0;
				}

				return previous - 1;
			});
		}, 1000);

		return () => {
			if (dismissTimerRef.current) {
				window.clearInterval(dismissTimerRef.current);
				dismissTimerRef.current = null;
			}
		};
	}, [visible]);

	useEffect(() => {
		if (!visible) return;
		void exitFullscreenIfNeeded();
	}, [visible]);

	if (!enabled || !visible || !currentAd) {
		return null;
	}

	const closeBlocked = dismissCountdown > 0;

	return (
		<div className="kk-non-premium-ad-overlay" aria-live="polite" role="dialog" aria-modal="true">
			<aside className="kk-non-premium-ad">
				<div className="kk-non-premium-ad-header">
					<span>Hirdetés</span>
					<button
						type="button"
						className="kk-non-premium-ad-close"
						onClick={hideAdNow}
						disabled={closeBlocked}
						aria-label="Hirdetés bezárása"
					>
						{closeBlocked ? `Bezárás ${dismissCountdown}s` : 'Bezárás'}
					</button>
				</div>
				<div className="kk-non-premium-ad-body">
					<div className="kk-non-premium-ad-icon">
						<i className={`bi ${currentAd.iconClass}`}></i>
					</div>
					<div>
						<h5>{currentAd.title}</h5>
						<p>{currentAd.description}</p>
					</div>
				</div>
				<div className="kk-non-premium-ad-actions">
					<button
						type="button"
						className="btn btn-sm btn-outline-light"
						onClick={hideAdNow}
						disabled={closeBlocked}
					>
						{closeBlocked ? `Várj ${dismissCountdown}s` : 'Folytatás'}
					</button>
					<Link to="/fizetes" className="btn btn-sm btn-primary" onClick={hideAdNow}>
						Prémium most
					</Link>
				</div>
			</aside>
		</div>
	);
};

export default NonPremiumAd;
