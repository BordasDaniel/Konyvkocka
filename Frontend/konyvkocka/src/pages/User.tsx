import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import '../styles/user.css';
import {
	ApiHttpError,
	SESSION_STORAGE_KEY,
	authMe,
	getUserBadges,
	getOwnedUserTitles,
	getUserFavorites,
	getUserProfile,
	getUserRecent,
	applyContentImageFallback,
	toAvatarSrc,
	toContentImageSrc,
	updateUserSettings,
	type OwnedUserTitleResponse,
	type UserBadgeCategoryResponse,
	type UserProfileResponse,
	type UserRecentFavoriteItemResponse,
} from '../services/api';

// ========================
// TÍPUSOK - Adatbázisból fetchelhető típusok
// ========================

interface UserProfile {
	username: string;
	avatar: string;
	country: string;
	countryCode: string;
	countryFlag: string;
	level: number;
	levelProgress: number;
	isSubscriber: boolean;
	premium: boolean;
	premiumExpiresAt: string | null;
	permissionLevel: 'USER' | 'MODERATOR' | 'ADMIN' | 'BANNED';
	email: string;
	creationDate: string;
	lastLoginDate: string;
	xp: number;
	bookPoints: number;
	seriesPoints: number;
	moviePoints: number;
	dayStreak: number;
	readTimeMin: number;
	watchTimeMin: number;
}

interface ViewStats {
	globalRank: string;
	countryRank: string;
	readingTime: string;
	readingPoints: string;
	mediaViewed: string;
	completionRate: string;
	readBooks: string;
	longestStreak: string;
	badges: string[];
	labels: {
		labelReadingPoints: string;
		labelReadingTime: string;
		labelCompletion: string;
		labelReadBooks: string;
		labelMediaViewed: string;
		labelLongestStreak: string;
	};
	sections: {
		readSectionTitle: string;
		readSectionSubtitle: string;
		readSectionActivity: string;
		readSectionButton: string;
		favSectionTitle: string;
		favSectionSubtitle: string;
		favSectionActivity: string;
		favSectionButton: string;
	};
}

interface Book {
	id: number;
	title: string;
	cover: string;
	startDate: string;
	endDate: string;
	readingTime: string;
	score: number | null;
	points: number;
	status: 'completed' | 'partial' | 'dropped';
}

interface Medal {
	id: number;
	image: string;
	label: string;
	date: string | null;
	isLocked: boolean;
}

interface MedalGroup {
	title: string;
	medals: Medal[];
}

interface MedalDetails {
	category: string;
	rarity: string;
	description: string;
}

interface UserSettings {
	username: string;
	email: string;
	countryCode: string;
	avatarDataUrl: string | null;
	selectedBadges: string[];
	profileVisibility: 'public' | 'friends' | 'private';
	showCountryOnProfile: boolean;
	showOnlineStatus: boolean;
	allowFriendRequests: boolean;
	allowMentions: boolean;
	language: 'hu' | 'en';
	autoplayMedia: boolean;
	showMatureContent: boolean;
	pushNotificationsEnabled: boolean;
	newsletterEmails: boolean;
	productUpdateEmails: boolean;
	securityEmails: boolean;
	currentPassword: string;
	newPassword: string;
	confirmPassword: string;
	twoFactorEnabled: boolean;
	notificationFrequency: 'immediate' | 'daily' | 'weekly' | 'none';
	timezone: string;
}

const BADGE_FALLBACK_IMAGE = 'https://assets.ppy.sh/medals/web/fruits-hits-20000000.png';
const RECENT_AND_FAVORITE_LIMIT = 3;
const MAX_ACTIVE_BADGES = 3;
const PERMISSION_LEVEL_LABELS: Record<UserProfile['permissionLevel'], string> = {
	USER: 'Felhasználó',
	MODERATOR: 'Moderátor',
	ADMIN: 'Admin',
	BANNED: 'Korlátozott',
};

const COUNTRY_LABELS: Record<string, string> = {
	HU: 'Magyarország',
	DE: 'Németország',
	EN: 'Anglia',
	FR: 'Franciaország',
	US: 'Egyesült Államok',
	ES: 'Spanyolország',
	IT: 'Olaszország',
	PL: 'Lengyelország',
	RO: 'Románia',
	CZ: 'Csehország',
};

const getCountryName = (countryCode: string): string => COUNTRY_LABELS[countryCode] ?? countryCode;

const getCountryFlagUrl = (countryCode: string): string =>
	`https://flagcdn.com/w20/${countryCode.toLowerCase()}.png`;

const formatDuration = (minutes: number): string => {
	if (minutes <= 0) return '0p';
	const days = Math.floor(minutes / (60 * 24));
	const hours = Math.floor((minutes % (60 * 24)) / 60);
	const mins = minutes % 60;
	const chunks: string[] = [];
	if (days > 0) chunks.push(`${days}n`);
	if (hours > 0) chunks.push(`${hours}ó`);
	if (mins > 0 || chunks.length === 0) chunks.push(`${mins}p`);
	return chunks.join(' ');
};

const formatRank = (rank: number | null): string => (rank ? `#${rank.toLocaleString('hu-HU')}` : '—');

const formatPercent = (value: number): string => `${(value * 100).toFixed(2)}%`;

const formatDateLabel = (value: string | null | undefined): string => {
	if (!value) return 'Nincs adat';
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return 'Nincs adat';
	return date.toLocaleDateString('hu-HU');
};

const formatDateTimeLabel = (value: string | null | undefined): string | null => {
	if (!value) return null;
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return null;
	return `${date.toLocaleDateString('hu-HU')} ${date.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' })}`;
};

const mapPermissionLevel = (permissionLevel: string | undefined): UserProfile['permissionLevel'] => {
	const normalized = permissionLevel?.toUpperCase();
	if (normalized === 'ADMIN') return 'ADMIN';
	if (normalized === 'MODERATOR') return 'MODERATOR';
	if (normalized === 'BANNED') return 'BANNED';
	return 'USER';
};

const normalizeActiveBadges = (badges: string[]): string[] => badges.filter(Boolean).slice(0, MAX_ACTIVE_BADGES);

const buildActiveBadgesFromOwnedTitles = (titles: OwnedUserTitleResponse[]): string[] =>
	normalizeActiveBadges(titles.filter((title) => title.isActive).map((title) => title.name));

const mapApiStatsToViewStats = (profileData: UserProfileResponse, badges: string[]): Record<string, ViewStats> => {
	const allCompleted = profileData.all.booksCompleted + profileData.all.mediaCompleted;
	const allTouched = profileData.books.total + profileData.media.total;

	return {
	all: {
		globalRank: formatRank(profileData.all.globalRank),
		countryRank: formatRank(profileData.all.countryRank),
		readingTime: formatDuration(profileData.all.timeMin),
		readingPoints: profileData.all.points.toLocaleString('hu-HU'),
		mediaViewed: allTouched.toLocaleString('hu-HU'),
		completionRate: formatPercent(profileData.all.completionRate),
		readBooks: allCompleted.toLocaleString('hu-HU'),
		longestStreak: `${profileData.all.dayStreak} nap`,
		badges,
		labels: {
			labelReadingPoints: 'Összes pont',
			labelReadingTime: 'Összesen eltöltött idő',
			labelCompletion: 'Befejezési arány:',
			labelReadBooks: 'Befejezett elemek:',
			labelMediaViewed: 'Könyvtárban / érintett elemek:',
			labelLongestStreak: 'Nap sorozat:',
		},
		sections: {
			readSectionTitle: 'Legutóbb megtekintett tartalom',
			readSectionSubtitle: 'A legfrissebb aktivitásaid könyvekből és médiából.',
			readSectionActivity: 'Rendezés: legutóbbi aktivitás szerint',
			readSectionButton: 'Mutasd a tartalmakat',
			favSectionTitle: 'Legutóbbi kedvenc',
			favSectionSubtitle: 'A legfrissebben kedvencek közé tett elemek.',
			favSectionActivity: 'Rendezés: hozzáadás dátuma szerint',
			favSectionButton: 'Mutasd a kedvenceket',
		},
	},
	book: {
		globalRank: formatRank(profileData.books.globalRank),
		countryRank: formatRank(profileData.books.countryRank),
		readingTime: formatDuration(profileData.books.readTimeMin),
		readingPoints: profileData.books.points.toLocaleString('hu-HU'),
		mediaViewed: profileData.books.total.toLocaleString('hu-HU'),
		completionRate: formatPercent(profileData.books.completionRate),
		readBooks: profileData.books.completed.toLocaleString('hu-HU'),
		longestStreak: `${profileData.dayStreak} nap`,
		badges,
		labels: {
			labelReadingPoints: 'Könyv pontok',
			labelReadingTime: 'Olvasási idő',
			labelCompletion: 'Befejezési arány:',
			labelReadBooks: 'Befejezett könyvek:',
			labelMediaViewed: 'Könyvtárban lévő könyvek:',
			labelLongestStreak: 'Leghosszabb olvasási sorozat:',
		},
		sections: {
			readSectionTitle: 'Legutóbb olvasott könyvek',
			readSectionSubtitle: 'Könyves aktivitásaid a könyvtáradból.',
			readSectionActivity: 'Rendezés: legutóbbi aktivitás szerint',
			readSectionButton: 'Mutasd a könyveket',
			favSectionTitle: 'Legutóbbi kedvenc könyvek',
			favSectionSubtitle: 'A legfrissebb kedvenc könyveid.',
			favSectionActivity: 'Rendezés: hozzáadás dátuma szerint',
			favSectionButton: 'Mutasd a kedvenc könyveket',
		},
	},
	media: {
		globalRank: formatRank(profileData.media.globalRank),
		countryRank: formatRank(profileData.media.countryRank),
		readingTime: formatDuration(profileData.media.watchTimeMin),
		readingPoints: profileData.media.points.toLocaleString('hu-HU'),
		mediaViewed: profileData.media.total.toLocaleString('hu-HU'),
		completionRate: formatPercent(profileData.media.completionRate),
		readBooks: profileData.media.completed.toLocaleString('hu-HU'),
		longestStreak: `${profileData.dayStreak} nap`,
		badges,
		labels: {
			labelReadingPoints: 'Média pontok',
			labelReadingTime: 'Nézési idő',
			labelCompletion: 'Befejezési arány:',
			labelReadBooks: 'Befejezett média tartalmak:',
			labelMediaViewed: 'Médiatárban lévő tartalmak:',
			labelLongestStreak: 'Leghosszabb nézési sorozat:',
		},
		sections: {
			readSectionTitle: 'Legutóbb megtekintett média tartalmak',
			readSectionSubtitle: 'Filmes és sorozatos aktivitásaid.',
			readSectionActivity: 'Rendezés: legutóbbi aktivitás szerint',
			readSectionButton: 'Mutasd a média tartalmakat',
			favSectionTitle: 'Legutóbbi kedvenc média tartalmak',
			favSectionSubtitle: 'A legfrissebb kedvenceid filmekből és sorozatokból.',
			favSectionActivity: 'Rendezés: hozzáadás dátuma szerint',
			favSectionButton: 'Mutasd a kedvenc média tartalmakat',
		},
	},
	};
};

const mapRecentItemsToBooks = (items: UserRecentFavoriteItemResponse[]): Book[] =>
	items.map((item) => ({
		id: item.id,
		title: item.title,
		cover: toContentImageSrc(item.img),
		startDate: '',
		endDate: '',
		readingTime: '',
		score: null,
		points: item.points,
		status:
			item.status?.toUpperCase() === 'COMPLETED'
				? 'completed'
				: item.status?.toUpperCase() === 'DROPPED'
					? 'dropped'
					: 'partial',
	}));

	const mapViewTypeToContentType = (viewType: ViewType): 'all' | 'media' | 'books' => {
		if (viewType === 'book') return 'books';
		if (viewType === 'media') return 'media';
		return 'all';
	};

const mapBadgeCategoryName = (category: string): string => {
	const normalized = category.toUpperCase();
	if (normalized === 'EVENT') return 'Események';
	if (normalized === 'STREAK') return 'Kitartás';
	if (normalized === 'READING' || normalized === 'WATCHING') return 'Megszerezve';
	if (normalized === 'SPECIAL') return 'Különlegesek';
	return category;
};

const mapApiBadgesToMedalGroups = (groups: UserBadgeCategoryResponse[]): MedalGroup[] =>
	groups.map((group) => ({
		title: mapBadgeCategoryName(group.category),
		medals: group.badges.map((badge) => ({
			id: badge.id,
			image: badge.iconUrl || BADGE_FALLBACK_IMAGE,
			label: badge.name,
			date: badge.earnedAt ? new Date(badge.earnedAt).toISOString().slice(0, 10) : null,
			isLocked: false,
		})),
	}));

const MAX_AVATAR_BYTES = 512 * 1024;
const MAX_SOURCE_AVATAR_BYTES = 20 * 1024 * 1024;
const MAX_AVATAR_DIMENSION = 1024;

const decodeBase64Url = (value: string): string => {
	const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
	const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
	return atob(padded);
};

const getUserIdFromToken = (): number | null => {
	try {
		const token = localStorage.getItem(SESSION_STORAGE_KEY);
		if (!token) return null;

		const tokenParts = token.split('.');
		if (tokenParts.length < 2 || !tokenParts[1]) return null;

		const payload = JSON.parse(decodeBase64Url(tokenParts[1])) as { userId?: unknown };
		if (typeof payload.userId === 'number') return payload.userId;
		if (typeof payload.userId === 'string') {
			const parsedId = Number(payload.userId);
			return Number.isInteger(parsedId) ? parsedId : null;
		}

		return null;
	} catch {
		return null;
	}
};

const base64ByteLength = (rawBase64: string): number => {
	const normalized = rawBase64.trim();
	if (!normalized) return 0;
	const padding = normalized.endsWith('==') ? 2 : normalized.endsWith('=') ? 1 : 0;
	return Math.max(0, Math.floor((normalized.length * 3) / 4) - padding);
};

const dataUrlByteLength = (dataUrl: string): number => {
	const commaIndex = dataUrl.indexOf(',');
	if (commaIndex < 0 || commaIndex >= dataUrl.length - 1) return 0;
	return base64ByteLength(dataUrl.slice(commaIndex + 1));
};

const readFileAsDataUrl = (file: File): Promise<string> =>
	new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			if (typeof reader.result !== 'string') {
				reject(new Error('Nem sikerült beolvasni a képet.'));
				return;
			}
			resolve(reader.result);
		};
		reader.onerror = () => reject(new Error('Nem sikerült beolvasni a képet.'));
		reader.readAsDataURL(file);
	});

const loadImageFromDataUrl = (dataUrl: string): Promise<HTMLImageElement> =>
	new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = () => reject(new Error('A kép feldolgozása sikertelen.'));
		img.src = dataUrl;
	});

const canvasToDataUrl = (canvas: HTMLCanvasElement, mimeType: string, quality?: number): Promise<string> =>
	new Promise((resolve, reject) => {
		try {
			resolve(canvas.toDataURL(mimeType, quality));
		} catch {
			reject(new Error('A kép tömörítése sikertelen.'));
		}
	});

const normalizeAvatarDataUrl = async (file: File): Promise<string> => {
	if (file.size > MAX_SOURCE_AVATAR_BYTES) {
		throw new Error('A kiválasztott kép túl nagy. Maximum 20MB-os forrásfájl tölthető fel.');
	}

	const initialDataUrl = await readFileAsDataUrl(file);
	if (dataUrlByteLength(initialDataUrl) <= MAX_AVATAR_BYTES) {
		return initialDataUrl;
	}

	const image = await loadImageFromDataUrl(initialDataUrl);
	const scale = Math.min(1, MAX_AVATAR_DIMENSION / Math.max(image.width, image.height));
	const width = Math.max(1, Math.round(image.width * scale));
	const height = Math.max(1, Math.round(image.height * scale));

	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	const context = canvas.getContext('2d');
	if (!context) {
		throw new Error('A böngésző nem tudta feldolgozni a képet.');
	}

	context.drawImage(image, 0, 0, width, height);

	let smallestCandidate = initialDataUrl;
	const mimeTypes = file.type === 'image/png'
		? ['image/webp', 'image/jpeg', 'image/png']
		: ['image/webp', 'image/jpeg', file.type];

	for (const mimeType of mimeTypes) {
		const qualityOptions = mimeType === 'image/png'
			? [undefined]
			: [0.9, 0.82, 0.74, 0.66, 0.58, 0.5];

		for (const quality of qualityOptions) {
			const candidate = await canvasToDataUrl(canvas, mimeType, quality);
			if (dataUrlByteLength(candidate) < dataUrlByteLength(smallestCandidate)) {
				smallestCandidate = candidate;
			}

			if (dataUrlByteLength(candidate) <= MAX_AVATAR_BYTES) {
				return candidate;
			}
		}
	}

	if (dataUrlByteLength(smallestCandidate) <= MAX_AVATAR_BYTES) {
		return smallestCandidate;
	}

	throw new Error('A kép méretét nem sikerült eléggé csökkenteni. Válassz kisebb felbontású képet.');
};

const getStoredUserId = (): number | null => {
	try {
		const raw = localStorage.getItem('kk_user');
		if (raw) {
			const parsed = JSON.parse(raw) as { id?: unknown };
			if (typeof parsed.id === 'number') return parsed.id;
		}

		return getUserIdFromToken();
	} catch {
		return getUserIdFromToken();
	}
};

// ========================
// KOMPONENS
// ========================

type ViewType = 'all' | 'book' | 'media' | 'settings';

type OpenSelectId = 'profileVisibility' | 'language' | 'badge-0' | 'badge-1' | 'badge-2' | 'notificationFrequency' | 'timezone' | null;
type SaveModalState = { type: 'success' | 'error'; title: string; message: string } | null;
type MedalModalState = { medal: Medal; groupTitle: string; details: MedalDetails } | null;
type MedalRarityKey = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

const MEDAL_DB_DETAILS: Record<number, Partial<MedalDetails>> = {
	1: { rarity: 'Ritka', description: 'Amikor mások még a startgombot keresik, te már célba értél a tavaszi hajrában.' },
	2: { rarity: 'Epikus', description: 'A nyári maratonon nem csak végigmentél, hanem közben még mosolyogtál is.' },
	3: { rarity: 'Legendás', description: 'Az őszi fesztivál úgy lett kipipálva, mintha ez csak bemelegítés lett volna.' },
	4: { description: 'Visszajöttél, és a rendszer is csak annyit mondott: na végre!' },
	5: { description: 'Hét nap fókusz, hét nap lendület, hét nap "csak még egy fejezet".' },
	6: { rarity: 'Ritka', description: '30 napos sorozat? Itt már nem motivációról beszélünk, hanem szokásról.' },
	7: { rarity: 'Legendás', description: '100 nap kitartás. Ez már nem streak, ez karakterfejlődés.' },
	8: { description: 'A gyűjteményed elkezdett önálló életet élni. És ez még csak a kezdet.' },
	9: { rarity: 'Ritka', description: 'Haladó gyűjtő szint elérve: a polc már rád néz fel.' },
	10: { description: 'Első vélemény kipipálva. A közösség innentől hivatalosan ismer.' },
	11: { rarity: 'Epikus', description: 'A kritikáid után még a csillagok is rendezettebb sorban állnak.' },
	12: { rarity: 'Epikus', description: 'Tökéletesnek hívják, de te ezt csak "egy átlagos napnak" nevezed.' },
	13: { description: 'Első esemény megvolt. Onnantól már tudtad: ez az a hely.' },
	14: { rarity: 'Ritka', description: 'Tanulás közben feloldva. Mert néha a fejlődés a legjobb jutalom.' },
	15: { rarity: 'Epikus', description: 'Afterparty mód: bekapcsolva. Még egy utolsó kör? Persze.' },
	16: { rarity: 'Legendás', description: 'Talán majd máskor? Te inkább most rögtön megszereznéd.' },
	17: { rarity: 'Legendás', description: 'Titokzatos: ? ? ? ? ? ? ? ... és valahol itt kezdődik a legenda.' },
	18: { rarity: 'Legendás', description: 'Mesteri teljesítmény, ahol a "jó" már rég nem elég.' },
	19: { rarity: 'Legendás', description: 'Ő ott biztosúr! De hogy pontosan miért, azt csak kevesen tudják.' },
	20: { rarity: 'Legendás', description: 'Maraton kitűző: amikor a célvonal már csak formalitás.' },
};

const getMedalDetails = (medal: Medal, groupTitle: string): MedalDetails => {
	const groupCategoryMap: Record<string, string> = {
		Események: 'Esemény',
		Kitartás: 'Aktivitás',
		Megszerezve: 'Gyűjtemény',
		Különlegesek: 'Különleges',
	};

	const defaults: MedalDetails = {
		category: groupCategoryMap[groupTitle] ?? 'Általános',
		rarity: medal.isLocked ? 'Legendás' : 'Gyakori',
		description: `${medal.label} kitűző a(z) ${groupTitle.toLowerCase()} kategóriában. Jelenleg ez az egyik legmenőbb jelölésed.`,
	};

	return {
		...defaults,
		...MEDAL_DB_DETAILS[medal.id],
	};
};

const getMedalRarityKey = (rarity: string): MedalRarityKey => {
	const normalized = rarity.trim().toLowerCase();

	if (normalized === 'common' || normalized === 'gyakori') return 'COMMON';
	if (normalized === 'rare' || normalized === 'ritka') return 'RARE';
	if (normalized === 'epic' || normalized === 'epikus') return 'EPIC';
	if (normalized === 'legendary' || normalized === 'legendás') return 'LEGENDARY';

	return 'COMMON';
};

const NOTIFICATION_FREQUENCY_OPTIONS: Array<{ value: UserSettings['notificationFrequency']; label: string }> = [
	{ value: 'immediate', label: 'Azonnal' },
	{ value: 'daily', label: 'Napi' },
	{ value: 'weekly', label: 'Heti' },
	{ value: 'none', label: 'Egyáltalán nem' },
];

const TIMEZONE_OPTIONS: Array<{ value: string; label: string }> = [
	{ value: 'Europe/Budapest', label: 'Europe/Budapest (GMT+1)' },
	{ value: 'Europe/London', label: 'Europe/London (GMT+0)' },
	{ value: 'America/New_York', label: 'America/New_York (GMT-5)' },
];

interface LocationState {
	view?: 'settings';
}

const parseProfileRouteUserId = (value: string | undefined): number | null => {
	if (!value) return null;
	const parsed = Number(value);
	return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

interface BadgeOption {
	id: number;
	name: string;
}

const User: React.FC = () => {
	const { userId: profileRouteParam } = useParams<{ userId?: string }>();
	const requestedProfileUserId = parseProfileRouteUserId(profileRouteParam);
	const isReadOnlyProfile = requestedProfileUserId !== null;
	const location = useLocation();
	const locationState = location.state as LocationState | null;
	const [openSelect, setOpenSelect] = useState<OpenSelectId>(null);

	// Állapotok - activeView alapértelmezése a location.state alapján
	const [activeView, setActiveView] = useState<ViewType>(() => {
		if (isReadOnlyProfile) {
			return 'all';
		}
		if (locationState?.view === 'settings') {
			return 'settings';
		}
		return 'all';
	});
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [allStats, setAllStats] = useState<Record<string, ViewStats>>({});
	const [recentBooks, setRecentBooks] = useState<Book[]>([]);
	const [favoriteBooks, setFavoriteBooks] = useState<Book[]>([]);
	const [medalGroups, setMedalGroups] = useState<MedalGroup[]>([]);
	const [badgeOptions, setBadgeOptions] = useState<BadgeOption[]>([]);
	const [profileUserId, setProfileUserId] = useState<number | null>(null);
	const [authRequired, setAuthRequired] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [saveModal, setSaveModal] = useState<SaveModalState>(null);
	const [medalModal, setMedalModal] = useState<MedalModalState>(null);
	const [medalModalVisible, setMedalModalVisible] = useState(false);
	const [medalModalClosing, setMedalModalClosing] = useState(false);
	const lastMedalModal = useRef<MedalModalState>(null);
	if (medalModal) lastMedalModal.current = medalModal;
	const [badgesExpanded, setBadgesExpanded] = useState(false);
	const [badgesLoaded, setBadgesLoaded] = useState(false);
	const [isLoadingBadges, setIsLoadingBadges] = useState(false);

	// Collapse állapotok
	const [readBooksOpen, setReadBooksOpen] = useState(false);
	const [favBooksOpen, setFavBooksOpen] = useState(false);

	// Beállítások állapotok
	const [settings, setSettings] = useState<UserSettings>({
		username: '',
		email: '',
		countryCode: 'HU',
		avatarDataUrl: null,
		selectedBadges: [],
		profileVisibility: 'public',
		showCountryOnProfile: true,
		showOnlineStatus: true,
		allowFriendRequests: true,
		allowMentions: true,
		language: 'hu',
		autoplayMedia: true,
		showMatureContent: false,
		pushNotificationsEnabled: true,
		newsletterEmails: true,
		productUpdateEmails: true,
		securityEmails: true,
		currentPassword: '',
		newPassword: '',
		confirmPassword: '',
		twoFactorEnabled: false,
		notificationFrequency: 'weekly',
		timezone: 'Europe/Budapest',
	});

	const pendingAvatarPreview = (() => {
		if (settings.avatarDataUrl === '') return toAvatarSrc(null);
		if (typeof settings.avatarDataUrl === 'string' && settings.avatarDataUrl.length > 0) return settings.avatarDataUrl;
		return profile?.avatar ?? toAvatarSrc(null);
	})();

	const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
		setSettings(prev => ({
			...prev,
			[key]: value,
		}));
	};

	const handleBadgeSelect = (position: number, badge: string) => {
		setSettings(prev => {
			const next = [...prev.selectedBadges];
			if (!badge) {
				next[position] = '';
				return {
					...prev,
					selectedBadges: next.slice(0, MAX_ACTIVE_BADGES),
				};
			}

			const duplicateIndex = next.findIndex((item, index) => index !== position && item === badge);
			if (duplicateIndex !== -1) {
				next[duplicateIndex] = '';
			}
			next[position] = badge;
			return {
				...prev,
				selectedBadges: next.slice(0, MAX_ACTIVE_BADGES),
			};
		});
	};

	const handleAvatarFileChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
		const file = e.target.files?.[0];
		if (!file) return;

		const allowedTypes = new Set(['image/png', 'image/jpeg', 'image/webp']);
		if (!allowedTypes.has(file.type)) {
			alert('Csak PNG, JPG vagy WEBP képet tölthetsz fel.');
			e.target.value = '';
			return;
		}

		try {
			const dataUrl = await normalizeAvatarDataUrl(file);
			updateSetting('avatarDataUrl', dataUrl);
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Nem sikerült feldolgozni a képet.';
			alert(message);
		} finally {
			e.target.value = '';
		}
	};

	const handleResetAvatar = () => {
		// Empty string marks explicit avatar deletion on next save.
		updateSetting('avatarDataUrl', '');
	};

	const syncAuthAvatar = (avatarUrl: string | null) => {
		const normalizedAvatar = avatarUrl && avatarUrl.trim().length > 0 ? avatarUrl : toAvatarSrc(null);
		window.dispatchEvent(new CustomEvent('kk_user_avatar_updated', { detail: { avatar: normalizedAvatar } }));
	};

	useEffect(() => {
		const clickAway = (event: MouseEvent) => {
			const target = event.target as HTMLElement;
			if (!target.closest('.custom-select-wrapper')) {
				setOpenSelect(null);
			}
		};

		document.addEventListener('click', clickAway);
		return () => document.removeEventListener('click', clickAway);
	}, []);

	useLayoutEffect(() => {
		if (!saveModal) return;

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				if (saveModal) setSaveModal(null);
			}
		};

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
		html.style.height = '100%';
		body.style.height = '100%';
		document.addEventListener('keydown', onKeyDown);

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

			html.style.height = '';
			body.style.height = '';
			document.removeEventListener('keydown', onKeyDown);
		};
	}, [saveModal]);

	useEffect(() => {
		if (medalModal) {
			setMedalModalClosing(false);
			setMedalModalVisible(true);
		} else if (medalModalVisible) {
			setMedalModalClosing(true);
			const t = setTimeout(() => { setMedalModalVisible(false); setMedalModalClosing(false); }, 290);
			return () => clearTimeout(t);
		}
	}, [medalModal]); // eslint-disable-line react-hooks/exhaustive-deps

	useLayoutEffect(() => {
		if (!medalModalVisible) return;

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') setMedalModal(null);
		};

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
		document.addEventListener('keydown', onKeyDown);

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

			document.removeEventListener('keydown', onKeyDown);
		};
	}, [medalModalVisible]);

	// Location state változásának figyelése (pl. navigáció a Beállításokhoz)
	useEffect(() => {
		if (!isReadOnlyProfile && locationState?.view === 'settings') {
			setActiveView('settings');
		}
	}, [isReadOnlyProfile, locationState]);

	useEffect(() => {
		if (isReadOnlyProfile && activeView === 'settings') {
			setActiveView('all');
		}
	}, [activeView, isReadOnlyProfile]);

	useEffect(() => {
		setReadBooksOpen(false);
		setFavBooksOpen(false);
		setMedalModal(null);
		setMedalModalVisible(false);
		setMedalModalClosing(false);
		setBadgesExpanded(false);
	}, [activeView]);

	const openMedalModal = (medal: Medal, groupTitle: string) => {
		setMedalModal({
			medal,
			groupTitle,
			details: getMedalDetails(medal, groupTitle),
		});
	};

	// Adatok betöltése
	useEffect(() => {
		const loadData = async () => {
			setIsLoading(true);
			setAuthRequired(false);
			setBadgesLoaded(false);
			setMedalGroups([]);
			let serverEmail = '';
			try {
				const viewerUserId = getStoredUserId();
				const targetUserId = requestedProfileUserId ?? viewerUserId;
				setProfileUserId(targetUserId);

				if (targetUserId) {
					const shouldLoadOwnedTitles = !isReadOnlyProfile && viewerUserId === targetUserId;
					const [profileResponse, meResponse, recentItems, favoriteItems, ownedTitles] = await Promise.all([
						getUserProfile(targetUserId),
						authMe().catch(() => null),
						getUserRecent(targetUserId, 'all').catch(() => [] as UserRecentFavoriteItemResponse[]),
						getUserFavorites(targetUserId, 'all').catch(() => [] as UserRecentFavoriteItemResponse[]),
						shouldLoadOwnedTitles
							? getOwnedUserTitles().catch(() => [] as OwnedUserTitleResponse[])
							: Promise.resolve([] as OwnedUserTitleResponse[]),
					]);

					const ownedBadgeOptions = shouldLoadOwnedTitles
						? ownedTitles.map((title) => ({ id: title.id, name: title.name }))
						: [];
					setBadgeOptions(ownedBadgeOptions);

					const selectedBadges = shouldLoadOwnedTitles
						? (() => {
							const activeBadgesFromOwnedTitles = buildActiveBadgesFromOwnedTitles(ownedTitles);
							return activeBadgesFromOwnedTitles.length > 0
								? activeBadgesFromOwnedTitles
								: normalizeActiveBadges(profileResponse.activeTitles);
						})()
						: normalizeActiveBadges(profileResponse.activeTitles);
					const countryCode = (profileResponse.countryCode || 'HU').toUpperCase();
					const mappedProfile: UserProfile = {
						username: profileResponse.username,
						avatar: toAvatarSrc(profileResponse.avatar),
						country: getCountryName(countryCode),
						countryCode,
						countryFlag: getCountryFlagUrl(countryCode),
						level: profileResponse.level,
						levelProgress: Math.max(0, Math.min(100, profileResponse.xp % 100)),
						isSubscriber: profileResponse.isSubscriber,
						premium: profileResponse.isSubscriber,
						premiumExpiresAt: formatDateTimeLabel(profileResponse.premiumExpiresAt),
						permissionLevel: mapPermissionLevel(meResponse?.permissionLevel),
						email: isReadOnlyProfile ? '' : meResponse?.email ?? profileResponse.email ?? '',
						creationDate: formatDateLabel(profileResponse.creationDate),
						lastLoginDate: formatDateLabel(profileResponse.lastLoginDate),
						xp: profileResponse.xp,
						bookPoints: profileResponse.bookPoints,
						seriesPoints: profileResponse.seriesPoints,
						moviePoints: profileResponse.moviePoints,
						dayStreak: profileResponse.dayStreak,
						readTimeMin: profileResponse.books.readTimeMin,
						watchTimeMin: profileResponse.media.watchTimeMin,
					};
					serverEmail = mappedProfile.email;

					setProfile(mappedProfile);
					setAllStats(mapApiStatsToViewStats(profileResponse, selectedBadges));
					setRecentBooks(mapRecentItemsToBooks(recentItems.slice(0, RECENT_AND_FAVORITE_LIMIT)));
					setFavoriteBooks(mapRecentItemsToBooks(favoriteItems.slice(0, RECENT_AND_FAVORITE_LIMIT)));

					setSettings(prev => ({
						...prev,
						username: mappedProfile.username,
						email: mappedProfile.email,
						countryCode,
						selectedBadges,
					}));
				} else {
					setAuthRequired(true);
					setProfile(null);
					setAllStats({});
					setRecentBooks([]);
					setFavoriteBooks([]);
					setMedalGroups([]);
					return;
				}

				// Beállítások inicializálása profil adatokból
				// localStorage beállítások betöltése
				if (!isReadOnlyProfile) {
					const savedSettings = localStorage.getItem('kk_profile_settings');
					if (savedSettings) {
						const parsed = JSON.parse(savedSettings) as Partial<UserSettings>;
						const { email: _ignoredEmail, username: _ignoredUsername, ...safeParsed } = parsed;
						const { selectedBadges: _ignoredSelectedBadges, selectedTitles: _ignoredSelectedTitles, ...safeParsedWithoutBadges } =
							safeParsed as Partial<UserSettings> & { selectedTitles?: string[] };
						setSettings(prev => ({
							...prev,
							...safeParsedWithoutBadges,
							avatarDataUrl: null,
							selectedBadges: prev.selectedBadges,
							username: prev.username,
							email: serverEmail || prev.email,
						}));
					}
				}
			} catch (error) {
				console.error('Hiba az adatok betöltésekor:', error);
			} finally {
				setIsLoading(false);
			}
		};

		loadData();
	}, [isReadOnlyProfile, requestedProfileUserId]);

	useEffect(() => {
		if (!profileUserId || activeView === 'settings') return;

		let cancelled = false;
		const contentType = mapViewTypeToContentType(activeView);

		const loadCurrentViewContent = async () => {
			try {
				const [recentItems, favoriteItems] = await Promise.all([
					getUserRecent(profileUserId, contentType).catch(() => [] as UserRecentFavoriteItemResponse[]),
					getUserFavorites(profileUserId, contentType).catch(() => [] as UserRecentFavoriteItemResponse[]),
				]);

				if (cancelled) return;
				setRecentBooks(mapRecentItemsToBooks(recentItems.slice(0, RECENT_AND_FAVORITE_LIMIT)));
				setFavoriteBooks(mapRecentItemsToBooks(favoriteItems.slice(0, RECENT_AND_FAVORITE_LIMIT)));
			} catch {
				if (!cancelled) {
					setRecentBooks([]);
					setFavoriteBooks([]);
				}
			}
		};

		loadCurrentViewContent();

		return () => {
			cancelled = true;
		};
	}, [activeView, profileUserId]);

	useEffect(() => {
		if (!badgesExpanded || badgesLoaded || !profileUserId) return;

		let cancelled = false;

		const loadBadgeGroups = async () => {
			setIsLoadingBadges(true);
			try {
				const medalsData = mapApiBadgesToMedalGroups(await getUserBadges(profileUserId));
				if (cancelled) return;
				setMedalGroups(medalsData);
				setBadgesLoaded(true);
			} catch (error) {
				console.error('Hiba a kitűzők betöltésekor:', error);
				if (!cancelled) {
					setMedalGroups([]);
					setBadgesLoaded(true);
				}
			} finally {
				if (!cancelled) {
					setIsLoadingBadges(false);
				}
			}
		};

		loadBadgeGroups();

		return () => {
			cancelled = true;
		};
	}, [badgesExpanded, badgesLoaded, profileUserId]);

	// Jelenlegi nézet statisztikái
	const currentStats = allStats[activeView] || allStats['all'];

	// Beállítások mentése
	const handleSaveSettings = async () => {
		if (isReadOnlyProfile) {
			setSaveModal({
				type: 'error',
				title: 'Szerkesztés letiltva',
				message: 'Másik felhasználó profilja csak megtekinthető.',
			});
			return;
		}

		if (settings.newPassword && settings.newPassword !== settings.confirmPassword) {
			alert('Az új jelszó és megerősítés nem egyezik.');
			return;
		}

		const payload = {
			username: settings.username,
			countryCode: settings.countryCode,
			profileVisibility: settings.profileVisibility,
			showCountryOnProfile: settings.showCountryOnProfile,
			showOnlineStatus: settings.showOnlineStatus,
			allowFriendRequests: settings.allowFriendRequests,
			allowMentions: settings.allowMentions,
			language: settings.language,
			autoplayMedia: settings.autoplayMedia,
			showMatureContent: settings.showMatureContent,
			pushNotificationsEnabled: settings.pushNotificationsEnabled,
			newsletterEmails: settings.newsletterEmails,
			productUpdateEmails: settings.productUpdateEmails,
			securityEmails: settings.securityEmails,
			twoFactorEnabled: settings.twoFactorEnabled,
			timezone: settings.timezone,
			notificationFrequency: settings.notificationFrequency,
		};

		const selectedTitleIds = normalizeActiveBadges(settings.selectedBadges)
			.map((badgeName) => badgeOptions.find((option) => option.name === badgeName)?.id)
			.filter((id): id is number => typeof id === 'number');

		if (!profileUserId) {
			setSaveModal({
				type: 'error',
				title: 'Mentési hiba',
				message: 'A beállítások mentéséhez be kell jelentkezned.',
			});
			return;
		}

		try {
			await updateUserSettings({
				avatarDataUrl: settings.avatarDataUrl,
				countryCode: settings.countryCode,
				newPlainPassword: settings.newPassword,
				activeTitleIds: selectedTitleIds,
			});

			if (profileUserId) {
				try {
					const refreshedProfile = await getUserProfile(profileUserId);
					const refreshedOwnedTitles = await getOwnedUserTitles().catch(() => [] as OwnedUserTitleResponse[]);
					const refreshedOptions = refreshedOwnedTitles.map((title) => ({ id: title.id, name: title.name }));
					setBadgeOptions(refreshedOptions);
					const refreshedActiveBadges = buildActiveBadgesFromOwnedTitles(refreshedOwnedTitles);
					const canonicalBadges = refreshedActiveBadges.length > 0
						? refreshedActiveBadges
						: normalizeActiveBadges(refreshedProfile.activeTitles);
					setAllStats(mapApiStatsToViewStats(refreshedProfile, canonicalBadges));
					setSettings(prev => ({
						...prev,
						selectedBadges: canonicalBadges,
					}));
				} catch (refreshProfileError) {
					console.warn('A mentés utáni jelvény frissítés sikertelen:', refreshProfileError);
				}
			}

			let nextAvatar = settings.avatarDataUrl;
			try {
				const me = await authMe();
				nextAvatar = toAvatarSrc(me.avatar);
			} catch (refreshError) {
				console.warn('A mentés utáni avatar frissítés sikertelen:', refreshError);
			}

			try {
				localStorage.setItem('kk_profile_settings', JSON.stringify(payload));
			} catch (storageError) {
				console.error('A helyi beállítások mentése sikertelen:', storageError);
			}

			syncAuthAvatar(nextAvatar);
			if (nextAvatar) {
				setProfile(prev => (prev ? { ...prev, avatar: nextAvatar } : prev));
			}
			setSaveModal({
				type: 'success',
				title: 'Mentés kész',
				message: 'A beállítások sikeresen elmentésre kerültek.',
			});
			setSettings(prev => ({
				...prev,
				avatarDataUrl: null,
				currentPassword: '',
				newPassword: '',
				confirmPassword: '',
			}));
		} catch (error) {
			let message = 'A beállítások mentése sikertelen volt.';
			if (error instanceof ApiHttpError) {
				message = error.status === 401
					? 'A munkamenet lejárt. Jelentkezz be újra, majd próbáld meg ismét.'
					: error.message;
			} else if (error instanceof Error) {
				message = error.message;
			}

			setSaveModal({
				type: 'error',
				title: 'Mentési hiba',
				message,
			});
		}
	};

	// Adatok exportálása
	const handleExportData = () => {
		const payload = {
			profile,
			stats: allStats,
			recentBooks,
			favoriteBooks,
		};

		const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'konyvkocka_profile_export.json';
		document.body.appendChild(a);
		a.click();
		a.remove();
		URL.revokeObjectURL(url);
	};

	// Fiók törlése
	const handleDeleteAccount = () => {
		if (window.confirm('Biztosan végleg törlöd a fiókodat? Ez nem visszavonható.')) {
			setSaveModal({
				type: 'error',
				title: 'Muvelet nem erheto el',
				message: 'Fiktores endpoint jelenleg nincs publikusan elerheto. Fordulj az ugyfelszolgalathoz.',
			});
		}
	};

	// Könyv státusz badge
	const getStatusBadge = (status: Book['status']) => {
		switch (status) {
			case 'completed':
				return <span className="badge badge-status bg-success">Befejezve</span>;
			case 'partial':
				return <span className="badge badge-status bg-warning text-dark">Részben</span>;
			case 'dropped':
				return <span className="badge badge-status bg-danger">Félbehagyva</span>;
			default:
				return null;
		}
	};

	if (authRequired) {
		return (
			<main className="container">
				<div className="profile-bar text-center py-5">
					<i className="bi bi-lock" style={{ fontSize: '3rem', color: 'var(--secondary)' }}></i>
					<h3 className="mt-3">Bejelentkezes szukseges</h3>
					<p className="text-muted mb-0">A profil oldal megtekintesehez jelentkezz be.</p>
				</div>
			</main>
		);
	}

	if (isLoading || !profile || !currentStats) {
		return (
			<main className="container">
				<div className="profile-bar text-center py-5">
					<div className="spinner-border text-light" role="status">
						<span className="visually-hidden">Betöltés...</span>
					</div>
				</div>
			</main>
		);
	}

	return (
		<main className="container-fluid px-4 px-lg-5">
			{/* Profile Bar */}
			<div className="profile-bar">
					<div className="profile-header">
						<div className="profile-header-top">
							<div className="avatar">
								<img src={profile.avatar} alt="avatar" />
							</div>
							<div className="profile-identity">
								<h2 className="mb-1">
									{profile.isSubscriber && (
										<svg
											className="subscriber-crown"
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											width="20"
											height="20"
											role="img"
											aria-label="Előfizető"
											focusable="false"
										>
											<title>Előfizető</title>
											<path fill="currentColor" d="M2 17l2-7 4 4 5-9 5 9 4-4 2 7H2z" />
										</svg>
									)}
									{profile.username}
								</h2>
								{settings.showCountryOnProfile && (
									<div className="d-flex align-items-center gap-2 mb-0">
										<img src={profile.countryFlag} alt={profile.country} />
										<small>{profile.country}</small>
									</div>
								)}
							</div>
						</div>

						<div className="profile-header-filters">
							<div className="profile-actions">
								<button
									className={`btn btn-action ${activeView === 'all' ? 'active' : ''}`}
									type="button"
									onClick={() => setActiveView('all')}
								>
									<i className="bi bi-grid-fill me-1"></i>ÖSSZES
								</button>
								<button
									className={`btn btn-action ${activeView === 'book' ? 'active' : ''}`}
									type="button"
									onClick={() => setActiveView('book')}
								>
									<i className="bi bi-book-fill me-1"></i>KÖNYVEK
								</button>
								<button
									className={`btn btn-action ${activeView === 'media' ? 'active' : ''}`}
									type="button"
									onClick={() => setActiveView('media')}
								>
									<i className="bi bi-film me-1"></i>MÉDIA
								</button>
								{!isReadOnlyProfile && (
									<button
										className={`btn btn-action ${activeView === 'settings' ? 'active' : ''}`}
										type="button"
										onClick={() => setActiveView('settings')}
									>
										<i className="bi bi-gear-fill me-1"></i>BEÁLLÍTÁSOK
									</button>
								)}
							</div>
						</div>

						<div className="profile-header-level">
							<div className="progress-level justify-content-end">
								<div className="progress-wrapper">
									<div className="progress" style={{ height: '10px', background: 'rgba(255,255,255,0.03)' }}>
										<div
											className="progress-bar"
											role="progressbar"
											style={{ width: `${profile.levelProgress}%` }}
											aria-valuenow={profile.levelProgress}
											aria-valuemin={0}
											aria-valuemax={100}
										></div>
									</div>
									<small className="fw-bold text-light">Felhasználói szint</small>
								</div>
								<div className="circle-level">{profile.level}</div>
							</div>
						</div>
					</div>
			</div>

			{/* Settings Panel */}
			{!isReadOnlyProfile && activeView === 'settings' && (
				<div id="settingsPanel" className="mt-4">
					{/* Profile Section */}
					<div className="about-panel p-4 mb-4">
						<div className="d-flex align-items-center mb-3">
							<i className="bi bi-image me-2" style={{ fontSize: '1.5rem', color: 'var(--secondary)' }}></i>
							<h4 className="mb-0">Profil</h4>
						</div>
						<div className="row align-items-start">
							<div className="col-12 col-md-4 mb-3 mb-md-0">
								<div className="d-flex align-items-center gap-3 settings-upload-row">
									<div className="avatar" style={{ width: '96px', height: '96px' }}>
										<img src={pendingAvatarPreview} alt="profilkép" />
									</div>
									<div>
										<label className="form-label">Profilkép feltöltése</label>
										<input
											type="file"
											className="form-control"
											accept="image/png,image/jpeg,image/webp"
											onChange={handleAvatarFileChange}
										/>
										<div className="d-flex gap-2 mt-2 settings-upload-actions">
											<button type="button" className="btn btn-outline-light btn-sm" onClick={handleResetAvatar}>
												Profilkép törlése
											</button>
											<small className="settings-hint d-block" style={{ lineHeight: 1.2 }}>
												A törlés csak a Mentés gomb után lép életbe.
											</small>
										</div>
									</div>
								</div>
							</div>
							<div className="col-12 col-md-8">
								<div className="row">
									<div className="col-md-6 mb-3">
										<label className="form-label">Profil láthatósága</label>
										<div className="custom-select-wrapper position-relative">
											<button
												className="form-select text-start"
												type="button"
												id="profileVisibilityDropdown"
												aria-expanded={openSelect === 'profileVisibility'}
												onClick={(e) => {
													e.stopPropagation();
													setOpenSelect(prev => (prev === 'profileVisibility' ? null : 'profileVisibility'));
												}}
											>
												<span>
													{settings.profileVisibility === 'public'
														? 'Nyilvános'
														: settings.profileVisibility === 'friends'
															? 'Csak ismerősök'
															: 'Privát'}
												</span>
											</button>
											<div className={`custom-select-menu ${openSelect === 'profileVisibility' ? 'show' : ''}`}>
												<div
													className="country-item"
													onClick={() => {
														updateSetting('profileVisibility', 'public');
														setOpenSelect(null);
													}}
												>
													Nyilvános
												</div>
												<div
													className="country-item"
													onClick={() => {
														updateSetting('profileVisibility', 'friends');
														setOpenSelect(null);
													}}
												>
													Csak ismerősök
												</div>
												<div
													className="country-item"
													onClick={() => {
														updateSetting('profileVisibility', 'private');
														setOpenSelect(null);
													}}
												>
													Privát
												</div>
											</div>
										</div>
									</div>
									<div className="col-md-6 mb-3">
										<label className="form-label">Nyelv</label>
										<div className="custom-select-wrapper position-relative">
											<button
												className="form-select text-start"
												type="button"
												id="languageDropdown"
												aria-expanded={openSelect === 'language'}
												onClick={(e) => {
													e.stopPropagation();
													setOpenSelect(prev => (prev === 'language' ? null : 'language'));
												}}
											>
												<span>{settings.language === 'hu' ? 'Magyar' : 'English'}</span>
											</button>
											<div className={`custom-select-menu ${openSelect === 'language' ? 'show' : ''}`}>
												<div
													className="country-item"
													onClick={() => {
														updateSetting('language', 'hu');
														setOpenSelect(null);
													}}
												>
													Magyar
												</div>
												<div
													className="country-item"
													onClick={() => {
														updateSetting('language', 'en');
														setOpenSelect(null);
													}}
												>
													English
												</div>
											</div>
										</div>
									</div>
								</div>

								<div className="row">
									<div className="col-12 col-md-6 mb-2">
										<div className="form-check form-switch">
											<input
												className="form-check-input"
												type="checkbox"
												id="showCountryOnProfile"
												checked={settings.showCountryOnProfile}
												onChange={(e) => updateSetting('showCountryOnProfile', e.target.checked)}
											/>
											<label className="form-check-label" htmlFor="showCountryOnProfile">
												Ország megjelenítése a profilon
											</label>
										</div>
									</div>
									<div className="col-12 col-md-6 mb-2">
										<div className="form-check form-switch">
											<input
												className="form-check-input"
												type="checkbox"
												id="showOnlineStatus"
												checked={settings.showOnlineStatus}
												onChange={(e) => updateSetting('showOnlineStatus', e.target.checked)}
											/>
											<label className="form-check-label" htmlFor="showOnlineStatus">
												Online státusz megjelenítése
											</label>
										</div>
									</div>
									<div className="col-12 col-md-6 mb-2">
										<div className="form-check form-switch">
											<input
												className="form-check-input"
												type="checkbox"
												id="allowFriendRequests"
												checked={settings.allowFriendRequests}
												onChange={(e) => updateSetting('allowFriendRequests', e.target.checked)}
											/>
											<label className="form-check-label" htmlFor="allowFriendRequests">
												Ismerősnek jelölés engedélyezése
											</label>
										</div>
									</div>
									<div className="col-12 col-md-6 mb-2">
										<div className="form-check form-switch">
											<input
												className="form-check-input"
												type="checkbox"
												id="allowMentions"
												checked={settings.allowMentions}
												onChange={(e) => updateSetting('allowMentions', e.target.checked)}
											/>
											<label className="form-check-label" htmlFor="allowMentions">
												Megemlítések (@) engedélyezése
											</label>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Account Settings Section */}
					<div className="about-panel p-4 mb-4">
						<div className="d-flex align-items-center mb-3">
							<i className="bi bi-person-circle me-2" style={{ fontSize: '1.5rem', color: 'var(--secondary)' }}></i>
							<h4 className="mb-0">Fiók beállítások</h4>
						</div>
						<form>
							<div className="row">
								<div className="col-md-6 mb-3">
									<label className="form-label">Felhasználónév</label>
									<input
										className="form-control"
										value={settings.username}
										disabled
									/>
								</div>
								<div className="col-md-6 mb-3">
									<label className="form-label">E-mail cím</label>
									<input
										type="email"
										className="form-control"
										value={settings.email}
										disabled
									/>
								</div>
								<div className="col-md-6 mb-3">
									<label className="form-label">Országkód</label>
									<input
										className="form-control"
										value={settings.countryCode}
										maxLength={2}
										onChange={(e) => updateSetting('countryCode', e.target.value.toUpperCase())}
									/>
								</div>
								<div className="col-md-6 mb-3">
									<label className="form-label">Jogosultság</label>
									<input className="form-control" value={PERMISSION_LEVEL_LABELS[profile.permissionLevel]} disabled />
								</div>
								<div className="col-md-6 mb-3">
									<label className="form-label">Prémium státusz</label>
									<input className="form-control" value={profile.premium ? 'Aktív' : 'Inaktív'} disabled />
								</div>
								<div className="col-md-6 mb-3">
									<label className="form-label">Prémium lejárat</label>
									<input className="form-control" value={profile.premiumExpiresAt ?? 'Nincs beállítva'} disabled />
								</div>
								<div className="col-md-6 mb-3">
									<label className="form-label">Fiók létrehozása</label>
									<input className="form-control" value={profile.creationDate} disabled />
								</div>
								<div className="col-md-6 mb-3">
									<label className="form-label">Utolsó belépés</label>
									<input className="form-control" value={profile.lastLoginDate} disabled />
								</div>
								<div className="col-md-6 mb-3">
									<label className="form-label">XP</label>
									<input className="form-control" value={profile.xp} disabled />
								</div>
								<div className="col-md-6 mb-3">
									<label className="form-label">Napi streak</label>
									<input className="form-control" value={profile.dayStreak} disabled />
								</div>
								<div className="col-md-4 mb-3">
									<label className="form-label">Book pontok</label>
									<input className="form-control" value={profile.bookPoints} disabled />
								</div>
								<div className="col-md-4 mb-3">
									<label className="form-label">Series pontok</label>
									<input className="form-control" value={profile.seriesPoints} disabled />
								</div>
								<div className="col-md-4 mb-3">
									<label className="form-label">Movie pontok</label>
									<input className="form-control" value={profile.moviePoints} disabled />
								</div>
								<div className="col-md-6 mb-3">
									<label className="form-label">Olvasási idő (perc)</label>
									<input className="form-control" value={profile.readTimeMin} disabled />
								</div>
								<div className="col-md-6 mb-3">
									<label className="form-label">Nézési idő (perc)</label>
									<input className="form-control" value={profile.watchTimeMin} disabled />
								</div>
							</div>
						</form>
					</div>

					{/* Security Section */}
					<div className="about-panel p-4 mb-4">
						<div className="d-flex align-items-center mb-3">
							<i className="bi bi-shield-lock me-2" style={{ fontSize: '1.5rem', color: 'var(--secondary)' }}></i>
							<h4 className="mb-0">Biztonság</h4>
						</div>
						<form>
							<h6 className="mb-3" style={{ color: 'var(--h1Text)' }}>Jelszó módosítása</h6>
							<div className="row">
								<div className="col-md-4 mb-3">
									<label className="form-label">Jelenlegi jelszó</label>
									<input
										type="password"
										className="form-control"
										value={settings.currentPassword}
										onChange={(e) => updateSetting('currentPassword', e.target.value)}
									/>
								</div>
								<div className="col-md-4 mb-3">
									<label className="form-label">Új jelszó</label>
									<input
										type="password"
										className="form-control"
										value={settings.newPassword}
										onChange={(e) => updateSetting('newPassword', e.target.value)}
									/>
								</div>
								<div className="col-md-4 mb-3">
									<label className="form-label">Új jelszó megerősítése</label>
									<input
										type="password"
										className="form-control"
										value={settings.confirmPassword}
										onChange={(e) => updateSetting('confirmPassword', e.target.value)}
									/>
								</div>
							</div>
							<hr style={{ borderColor: 'rgba(255,255,255,0.06)' }} className="my-4" />
							<h6 className="mb-3" style={{ color: 'var(--h1Text)' }}>Kétlépcsős azonosítás</h6>
							<div className="form-check form-switch">
								<input
									className="form-check-input"
									type="checkbox"
									id="settingsTwoFactor"
									checked={settings.twoFactorEnabled}
									onChange={(e) => updateSetting('twoFactorEnabled', e.target.checked)}
								/>
								<label className="form-check-label" htmlFor="settingsTwoFactor">
									Kétlépcsős azonosítás (2FA) engedélyezése
								</label>
							</div>
						</form>
					</div>

					{/* Preferences Section */}
					<div className="about-panel p-4 mb-4">
						<div className="d-flex align-items-center mb-3">
							<i className="bi bi-sliders me-2" style={{ fontSize: '1.5rem', color: 'var(--secondary)' }}></i>
							<h4 className="mb-0">Preferenciák</h4>
						</div>
						<form>
							<div className="row">
								<div className="col-12 mb-3">
									<label className="form-label">Megjelenített jelvények (maximum 3)</label>
									<div className="row g-2 settings-title-grid">
										{[0, 1, 2].map((position) => (
											<div className="col-12 col-md-4" key={position}>
												<label className="form-label small mb-1">Jelvény {position + 1}</label>
												<div className="custom-select-wrapper position-relative">
													<button
														className="form-select text-start"
														type="button"
														aria-expanded={openSelect === `badge-${position}`}
														disabled={badgeOptions.length === 0}
														onClick={(e) => {
															e.stopPropagation();
															if (badgeOptions.length === 0) return;
															setOpenSelect(prev => (prev === `badge-${position}` ? null : `badge-${position}` as OpenSelectId));
														}}
													>
														<span>{settings.selectedBadges[position] || 'Nincs kiválasztva'}</span>
													</button>
													<div className={`custom-select-menu ${openSelect === `badge-${position}` ? 'show' : ''}`}>
														<div
															className="country-item"
															onClick={() => {
																handleBadgeSelect(position, '');
																setOpenSelect(null);
															}}
														>
															Nincs kiválasztva
														</div>
														{badgeOptions.map((badge) => (
															<div
																key={badge.id}
																className="country-item"
																onClick={() => {
																	handleBadgeSelect(position, badge.name);
																	setOpenSelect(null);
																}}
															>
																{badge.name}
															</div>
														))}
													</div>
												</div>
											</div>
										))}
									</div>
									{badgeOptions.length === 0 && (
										<small className="text-muted d-block mt-2">Még nincs megszerzett jelvényed, ezért nem állítható be aktív jelvény.</small>
									)}
								</div>
								<div className="col-md-6 mb-3">
									<label className="form-label">Értesítési gyakoriság</label>
									<div className="custom-select-wrapper position-relative">
										<button
											className="form-select text-start"
											type="button"
											aria-expanded={openSelect === 'notificationFrequency'}
											onClick={(e) => {
												e.stopPropagation();
												setOpenSelect(prev => (prev === 'notificationFrequency' ? null : 'notificationFrequency'));
											}}
										>
											<span>{NOTIFICATION_FREQUENCY_OPTIONS.find(item => item.value === settings.notificationFrequency)?.label ?? 'Heti'}</span>
										</button>
										<div className={`custom-select-menu ${openSelect === 'notificationFrequency' ? 'show' : ''}`}>
											{NOTIFICATION_FREQUENCY_OPTIONS.map((option) => (
												<div
													key={option.value}
													className="country-item"
													onClick={() => {
														updateSetting('notificationFrequency', option.value);
														setOpenSelect(null);
													}}
												>
													{option.label}
												</div>
											))}
										</div>
									</div>
								</div>
								<div className="col-md-6 mb-3">
									<label className="form-label">Időzóna</label>
									<div className="custom-select-wrapper position-relative">
										<button
											className="form-select text-start"
											type="button"
											aria-expanded={openSelect === 'timezone'}
											onClick={(e) => {
												e.stopPropagation();
												setOpenSelect(prev => (prev === 'timezone' ? null : 'timezone'));
											}}
										>
											<span>{TIMEZONE_OPTIONS.find(item => item.value === settings.timezone)?.label ?? settings.timezone}</span>
										</button>
										<div className={`custom-select-menu ${openSelect === 'timezone' ? 'show' : ''}`}>
											{TIMEZONE_OPTIONS.map((option) => (
												<div
													key={option.value}
													className="country-item"
													onClick={() => {
														updateSetting('timezone', option.value);
														setOpenSelect(null);
													}}
												>
													{option.label}
												</div>
											))}
										</div>
									</div>
								</div>
							</div>
							<hr style={{ borderColor: 'rgba(255,255,255,0.06)' }} className="my-4" />
							<h6 className="mb-3" style={{ color: 'var(--h1Text)' }}>Értesítések</h6>
							<div className="row">
								<div className="col-12 col-md-6 mb-2">
									<div className="form-check form-switch">
										<input
											className="form-check-input"
											type="checkbox"
											id="pushNotificationsEnabled"
											checked={settings.pushNotificationsEnabled}
											onChange={(e) => updateSetting('pushNotificationsEnabled', e.target.checked)}
										/>
										<label className="form-check-label" htmlFor="pushNotificationsEnabled">
											Push / böngésző értesítések
										</label>
									</div>
								</div>
								<div className="col-12 col-md-6 mb-2">
									<div className="form-check form-switch">
										<input
											className="form-check-input"
											type="checkbox"
											id="newsletterEmails"
											checked={settings.newsletterEmails}
											onChange={(e) => updateSetting('newsletterEmails', e.target.checked)}
										/>
										<label className="form-check-label" htmlFor="newsletterEmails">
											Hírlevél e-mailek
										</label>
									</div>
								</div>
								<div className="col-12 col-md-6 mb-2">
									<div className="form-check form-switch">
										<input
											className="form-check-input"
											type="checkbox"
											id="productUpdateEmails"
											checked={settings.productUpdateEmails}
											onChange={(e) => updateSetting('productUpdateEmails', e.target.checked)}
										/>
										<label className="form-check-label" htmlFor="productUpdateEmails">
											Termékfrissítések e-mailben
										</label>
									</div>
								</div>
								<div className="col-12 col-md-6 mb-2">
									<div className="form-check form-switch">
										<input
											className="form-check-input"
											type="checkbox"
											id="securityEmails"
											checked={settings.securityEmails}
											disabled
										/>
										<label className="form-check-label" htmlFor="securityEmails">
											Biztonsági e-mailek (kötelező)
										</label>
									</div>
								</div>
							</div>
							<hr style={{ borderColor: 'rgba(255,255,255,0.06)' }} className="my-4" />
							<h6 className="mb-3" style={{ color: 'var(--h1Text)' }}>Tartalom</h6>
							<div className="row">
								<div className="col-12 col-md-6 mb-2">
									<div className="form-check form-switch">
										<input
											className="form-check-input"
											type="checkbox"
											id="autoplayMedia"
											checked={settings.autoplayMedia}
											onChange={(e) => updateSetting('autoplayMedia', e.target.checked)}
										/>
										<label className="form-check-label" htmlFor="autoplayMedia">
											Videók automatikus lejátszása
										</label>
									</div>
								</div>
								<div className="col-12 col-md-6 mb-2">
									<div className="form-check form-switch">
										<input
											className="form-check-input"
											type="checkbox"
											id="showMatureContent"
											checked={settings.showMatureContent}
											onChange={(e) => updateSetting('showMatureContent', e.target.checked)}
										/>
										<label className="form-check-label" htmlFor="showMatureContent">
											18+ tartalmak megjelenítése
										</label>
									</div>
								</div>
							</div>
						</form>
					</div>

					{/* Connected Accounts Section */}
					<div className="about-panel p-4 mb-4">
						<div className="d-flex align-items-center mb-3">
							<i className="bi bi-link-45deg me-2" style={{ fontSize: '1.5rem', color: 'var(--secondary)' }}></i>
							<h4 className="mb-0">Kapcsolódó fiókok</h4>
						</div>
						<div className="d-flex flex-wrap gap-2">
							<button className="btn btn-outline-light btn-sm" type="button">
								<i className="bi bi-google me-1"></i> Csatlakozás Google-lal
							</button>
							<button className="btn btn-outline-light btn-sm" type="button">
								<i className="bi bi-facebook me-1"></i> Csatlakozás Facebook-kal
							</button>
							<button className="btn btn-outline-light btn-sm" type="button">
								<i className="bi bi-apple me-1"></i> Csatlakozás Apple-lel
							</button>
							<button className="btn btn-outline-light btn-sm" type="button">
								<i className="bi bi-microsoft me-1"></i> Csatlakozás Microsofttal
							</button>
							<button className="btn btn-outline-light btn-sm" type="button">
								<i className="bi bi-discord me-1"></i> Csatlakozás Discorddal
							</button>
						</div>
					</div>

					{/* Actions Section */}
					<div className="about-panel p-4 mb-4">
						<div className="row">
							<div className="col-12 col-md-6 mb-3 mb-md-0">
								<div className="d-flex flex-wrap gap-2">
									<button className="btn btn-sm btn-danger" type="button" onClick={handleDeleteAccount} title="Fiók törlése">
										<i className="bi bi-trash me-1"></i> Fiók törlése
									</button>
								</div>
							</div>
							<div className="col-12 col-md-6 text-md-end">
								<div className="d-flex flex-wrap gap-2 justify-content-md-end">
									<button className="btn btn-sm btn-outline-light" type="button" onClick={handleExportData} title="Adatok exportálása">
										<i className="bi bi-download me-1"></i> Export
									</button>
									<button type="button" className="btn btn-primary" onClick={handleSaveSettings}>
										<i className="bi bi-check-circle me-1"></i> Mentés
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{saveModal && (
				<div className="user-save-modal-backdrop" onClick={() => setSaveModal(null)}>
					<div
						className="user-save-modal"
						onClick={(event) => event.stopPropagation()}
						role="dialog"
						aria-modal="true"
						aria-labelledby="user-save-modal-title"
					>
						<div className="user-save-modal-icon">
							<i className={`bi ${saveModal.type === 'success' ? 'bi-check2-circle' : 'bi-exclamation-circle'}`}></i>
						</div>
						<h4 id="user-save-modal-title">{saveModal.title}</h4>
						<p>{saveModal.message}</p>
						<button className="admin-send-btn" onClick={() => setSaveModal(null)}>
							Rendben
						</button>
					</div>
				</div>
			)}

			{/* Main Content - Stats and Books */}
			{activeView !== 'settings' && (
				<div id="mainContent">
					{/* Stats area */}
					<div className="row mt-4 align-items-stretch">
						<div className="col-lg-8">
							<div className="stat-card about-panel">
								<div className="row">
									<div className="col-md-6">
										<div className="stat-title">Globális rang</div>
										<div className="big-number">{currentStats.globalRank}</div>
									</div>
									<div className="col-md-6 text-md-end">
										<div className="stat-title">Országos rang</div>
										<div className="big-number">{currentStats.countryRank}</div>
									</div>
								</div>

								<hr style={{ borderColor: 'rgba(255,255,255,0.06)' }} />

								<div className="row">
									<div className="col-md-4">
										<div className="stat-title">Jelvények</div>
										<div className="mt-2 badge-row">
											{currentStats.badges.slice(0, MAX_ACTIVE_BADGES).map((badge, index) => (
												<span key={index} className="badge-custom">{badge}</span>
											))}
										</div>
									</div>
									<div className="col-md-4">
										<div className="stat-title">{currentStats.labels.labelReadingPoints}</div>
										<div className="big-number">{currentStats.readingPoints}</div>
									</div>
									<div className="col-md-4 text-md-end">
										<div className="stat-title">{currentStats.labels.labelReadingTime}</div>
										<div className="big-number">{currentStats.readingTime}</div>
									</div>
								</div>
							</div>
						</div>

						<div className="col-lg-4 mt-3 mt-lg-0">
							<div className="stat-card about-panel">
								<h5 className="mb-3 fw-bold" style={{ color: 'var(--secondary)' }}>Felhasználói statisztikák</h5>
								<ul className="list-unstyled">
									<li>
										<strong><span>{currentStats.labels.labelCompletion}</span></strong>{' '}
										<span>{currentStats.completionRate}</span>
									</li>
									<li>
										<strong><span>{currentStats.labels.labelReadBooks}</span></strong>{' '}
										<span>{currentStats.readBooks}</span>
									</li>
									<li>
										<strong><span>{currentStats.labels.labelMediaViewed}</span></strong>{' '}
										<span>{currentStats.mediaViewed}</span>
									</li>
									<li>
										<strong><span>{currentStats.labels.labelLongestStreak}</span></strong>{' '}
										<span>{currentStats.longestStreak}</span>
									</li>
								</ul>
							</div>
						</div>
					</div>

					{/* Read Books Section */}
					<div className="row mt-4">
						<div className="col-12">
							<div className="stat-card about-panel">
								<div className="d-flex justify-content-between align-items-center mb-2">
									<div>
										<h6 className="mb-1">{currentStats.sections.readSectionTitle}</h6>
									</div>
								</div>

								<button
									className="btn btn-sm btn-outline-light mb-3"
									type="button"
									onClick={() => setReadBooksOpen(!readBooksOpen)}
									aria-expanded={readBooksOpen}
								>
									{currentStats.sections.readSectionButton}
								</button>

								{readBooksOpen && (
									<ul className="list-group list-group-flush book-list">
										{recentBooks.map((book) => (
											<li key={book.id} className="list-group-item book-item">
												<div className="d-flex gap-3 align-items-center">
													<img
														src={book.cover}
														alt={book.title}
														className="book-logo"
														onError={(event) => {
															applyContentImageFallback(event.currentTarget);
														}}
													/>
													<div className="grow">
														<div className="book-title">{book.title}</div>
													</div>
													<div className="text-end text-nowrap">
														<div className="book-points">Pontok: <strong>{book.points.toLocaleString()}</strong></div>
														<div className="mt-1">{getStatusBadge(book.status)}</div>
													</div>
												</div>
											</li>
										))}
									</ul>
								)}
							</div>
						</div>
					</div>

					{/* Favorite Books Section */}
					<div className="row mt-4">
						<div className="col-12">
							<div className="stat-card about-panel">
								<div className="d-flex justify-content-between align-items-center mb-2">
									<div>
										<h6 className="mb-1">{currentStats.sections.favSectionTitle}</h6>
									</div>
								</div>

								<button
									className="btn btn-sm btn-outline-light mb-3"
									type="button"
									onClick={() => setFavBooksOpen(!favBooksOpen)}
									aria-expanded={favBooksOpen}
								>
									{currentStats.sections.favSectionButton}
								</button>

								{favBooksOpen && (
									<ul className="list-group list-group-flush book-list">
										{favoriteBooks.map((book) => (
											<li key={book.id} className="list-group-item book-item">
												<div className="d-flex gap-3 align-items-center">
													<img
														src={book.cover}
														alt={book.title}
														className="book-logo"
														onError={(event) => {
															applyContentImageFallback(event.currentTarget);
														}}
													/>
													<div className="grow">
														<div className="book-title">{book.title}</div>
													</div>
													<div className="text-end text-nowrap">
														<div className="book-points">Pontok: <strong>{book.points.toLocaleString()}</strong></div>
														<div className="mt-1">{getStatusBadge(book.status)}</div>
													</div>
												</div>
											</li>
										))}
									</ul>
								)}
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Badges Section */}
			{activeView !== 'settings' && (
				<section id="medalsSection" className="medals-section">
					<div className="row mt-4">
						<div className="col-12">
							<div className="stat-card about-panel">
								<div className="d-flex justify-content-between align-items-center mb-2">
									<div>
										<h6 className="mb-1">Kitűzők</h6>
									</div>
								</div>

								<button
									className="btn btn-sm btn-outline-light mb-3"
									type="button"
									onClick={() => {
										setBadgesExpanded(prev => {
											const next = !prev;
											if (!next) {
												setMedalModal(null);
											} else {
												setBadgesLoaded(false);
											}
											return next;
										});
									}}
									aria-expanded={badgesExpanded}
								>
									{badgesExpanded ? 'Kitűzők elrejtése' : 'Mutasd a kitűzőket'}
								</button>

								{badgesExpanded && isLoadingBadges && (
									<div className="group p-3">
										<div className="text-muted">Kitűzők betöltése...</div>
									</div>
								)}

								{badgesExpanded && badgesLoaded && medalGroups.map((group, groupIndex) => (
									<div key={groupIndex} className="group p-3">
										<div className="group-title">{group.title}</div>
										<div className="medal-grid">
											{group.medals.map((medal) => (
												<button
													key={medal.id}
													type="button"
													className={`medal-tile ${medal.isLocked ? 'medal-locked' : 'medal-earned'}`}
													onClick={() => openMedalModal(medal, group.title)}
													aria-label={`${medal.label} kitűző részletek`}
												>
													<img
														src={medal.image}
														alt={medal.label}
														className="medal"
														onError={(event) => {
															const imageElement = event.currentTarget;
															if (imageElement.src !== BADGE_FALLBACK_IMAGE) {
																imageElement.src = BADGE_FALLBACK_IMAGE;
															}
														}}
													/>
													<div className="medal-label">{medal.label}</div>
													<div className="medal-date">{medal.date || '—'}</div>
												</button>
											))}
										</div>
									</div>
								))}

								{badgesExpanded && badgesLoaded && medalGroups.length === 0 && (
									<div className="group p-3">
										<div className="text-muted">Nincs megjeleníthető kitűző.</div>
									</div>
								)}
							</div>
						</div>
					</div>
				</section>
			)}

			{medalModalVisible && (() => {
				const dm = medalModal ?? lastMedalModal.current;
				if (!dm) return null;
				const rarityKey = getMedalRarityKey(dm.details.rarity);
				return (
					<div className={`user-medal-modal-backdrop${medalModalClosing ? ' closing' : ''}`} onClick={() => setMedalModal(null)}>
						<div
							className={`user-medal-modal${medalModalClosing ? ' closing' : ''}`}
							onClick={(event) => event.stopPropagation()}
							role="dialog"
							aria-modal="true"
							aria-labelledby="user-medal-modal-title"
						>
							<div className="user-medal-modal-header">
								<img src={dm.medal.image} alt={dm.medal.label} className="user-medal-modal-image" />
								<div>
									<h4 id="user-medal-modal-title">{dm.medal.label}</h4>
									<p>
										{dm.groupTitle} • <span className={`medal-rarity medal-rarity-${rarityKey.toLowerCase()}`}>{dm.details.rarity}</span>
									</p>
								</div>
							</div>

							<div className="user-medal-modal-grid">
								<div><strong>Kategória:</strong> <span>{dm.details.category}</span></div>
								<div><strong>Állapot:</strong> <span>{dm.medal.isLocked ? 'Zárolt' : 'Megszerezve'}</span></div>
								<div><strong>Megszerzés:</strong> <span>{dm.medal.date ?? 'Még nincs megszerezve'}</span></div>
							</div>

							<p className="user-medal-modal-description">{dm.details.description}</p>

							<button className="admin-send-btn" onClick={() => setMedalModal(null)}>
								Rendben
							</button>
						</div>
					</div>
				);
			})()}
		</main>
	);
};

export default User;
