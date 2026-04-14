import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import '../styles/user.css';

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
	reviewsSent: string;
	badges: string[];
	labels: {
		labelReadingPoints: string;
		labelReadingTime: string;
		labelCompletion: string;
		labelReadBooks: string;
		labelMediaViewed: string;
		labelLongestStreak: string;
		labelReviewsSent: string;
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

const BADGE_OPTIONS = ['Kiemelt olvasó', 'Top 100', 'Fürge Nyúl Kihívás', 'Könyvmoly', 'Filmkritikus', 'Kihívásvadász'];
const PERMISSION_LEVEL_LABELS: Record<UserProfile['permissionLevel'], string> = {
	USER: 'Felhasználó',
	MODERATOR: 'Moderátor',
	ADMIN: 'Admin',
	BANNED: 'Korlátozott',
};

// ========================
// MOCK ADATOK - Később fetch-ből jönnek
// ========================

// Ez a függvény később lecserélhető API hívásra
const fetchUserProfile = async (): Promise<UserProfile> => {
	// TODO: Lecserélni API hívásra: const response = await fetch('/api/user/profile');
	return {
		username: 'BordasDaniel',
		avatar: 'https://i.pinimg.com/236x/5a/bd/98/5abd985735a8fd4adcb0e795de6a1005.jpg',
		country: 'Magyarország',
		countryCode: 'HU',
		countryFlag: 'https://flagcdn.com/w20/hu.png',
		level: 98,
		levelProgress: 27,
		isSubscriber: true,
		premium: true,
		premiumExpiresAt: '2026-12-31',
		permissionLevel: 'USER',
		email: 'daniel@example.com',
		creationDate: '2020-03-15',
		lastLoginDate: '2026-03-14',
		xp: 840,
		bookPoints: 8450,
		seriesPoints: 2160,
		moviePoints: 980,
		dayStreak: 47,
		readTimeMin: 18320,
		watchTimeMin: 5220,
	};
};

const fetchViewStats = async (): Promise<Record<string, ViewStats>> => {
	// TODO: Lecserélni API hívásra: const response = await fetch('/api/user/stats');
	return {
		all: {
			globalRank: '#1700',
			countryRank: '#42',
			readingTime: '11n 4ó 47p',
			readingPoints: '3,303',
			mediaViewed: '3,200',
			completionRate: '98.25%',
			readBooks: '17,735',
			longestStreak: '1,636 nap',
			reviewsSent: '1',
			badges: ['Kiemelt olvasó', 'Top 100', 'Fürge Nyúl Kihívás'],
			labels: {
				labelReadingPoints: 'Összes pont',
				labelReadingTime: 'Összesen eltöltött idő',
				labelCompletion: 'Befejezési arány:',
				labelReadBooks: 'Elolvasott könyvek:',
				labelMediaViewed: 'Megtekintett sorozatok/filmek:',
				labelLongestStreak: 'Nap sorozat:',
				labelReviewsSent: 'Összes vélemény:',
			},
			sections: {
				readSectionTitle: 'Legutóbb megtekintett tartalom',
				readSectionSubtitle: '124 film, 89 sorozat, 8 könyv teljes • 57 könyv részben • 23 folyamatban',
				readSectionActivity: 'Utolsó aktivitás: 2 nappal ezelőtt',
				readSectionButton: 'Mutasd a tartalmakat',
				favSectionTitle: 'Legutóbbi kedvenc',
				favSectionSubtitle: '23 kedvenc könyv • 45 kedvenc film • 32 kedvenc sorozat',
				favSectionActivity: 'Frissítve: ma',
				favSectionButton: 'Mutasd a kedvenceket',
			},
		},
		book: {
			globalRank: '#850',
			countryRank: '#12',
			readingTime: '7n 18ó 30p',
			readingPoints: '2,150',
			mediaViewed: '0',
			completionRate: '99.5%',
			readBooks: '12,345',
			longestStreak: '890 nap',
			reviewsSent: '87',
			badges: ['Top Olvasó', 'Könyvmoly', 'Kritikus'],
			labels: {
				labelReadingPoints: 'Könyv pontok',
				labelReadingTime: 'Olvasási idő',
				labelCompletion: 'Befejezési arány:',
				labelReadBooks: 'Elolvasott könyvek:',
				labelMediaViewed: 'Megtekintett sorozatok/filmek:',
				labelLongestStreak: 'Leghosszabb olvasási sorozat:',
				labelReviewsSent: 'Könyv vélemények:',
			},
			sections: {
				readSectionTitle: 'Legutóbb olvasott könyvek',
				readSectionSubtitle: '8 befejezve • 57 olvasás alatt • 7 félbehagyva • 357 tervben • 513 archivált',
				readSectionActivity: 'Utolsó könyv: 1 nappal ezelőtt',
				readSectionButton: 'Mutasd a könyveket',
				favSectionTitle: 'Legutóbbi kedvenc könyvek',
				favSectionSubtitle: '23 kedvenc könyv a listádon',
				favSectionActivity: 'Frissítve: 3 nappal ezelőtt',
				favSectionButton: 'Mutasd a kedvenc könyveket',
			},
		},
		media: {
			globalRank: '#420',
			countryRank: '#7',
			readingTime: '3n 10ó 17p',
			readingPoints: '1,153',
			mediaViewed: '3,200',
			completionRate: '95.0%',
			readBooks: '0',
			longestStreak: '746 nap',
			reviewsSent: '14',
			badges: ['Színészrajongó', 'Filmfan', 'Sorozatőrült'],
			labels: {
				labelReadingPoints: 'Média pontok',
				labelReadingTime: 'Nézési idő',
				labelCompletion: 'Befejezési arány:',
				labelReadBooks: 'Elolvasott könyvek:',
				labelMediaViewed: 'Megtekintett média tartalmak:',
				labelLongestStreak: 'Leghosszabb nézési sorozat:',
				labelReviewsSent: 'Média vélemények:',
			},
			sections: {
				readSectionTitle: 'Legutóbb megtekintett média tartalmak',
				readSectionSubtitle: '124 film befejezve • 89 sorozat befejezve • 23 folyamatban • 12 félbehagyva',
				readSectionActivity: 'Utoljára nézett: tegnap',
				readSectionButton: 'Mutasd a média tartalmakat',
				favSectionTitle: 'Legutóbbi kedvenc média tartalmak',
				favSectionSubtitle: '45 kedvenc film • 32 kedvenc sorozat',
				favSectionActivity: 'Frissítve: ma',
				favSectionButton: 'Mutasd a kedvenc média tartalmakat',
			},
		},
	};
};

const fetchBooks = async (): Promise<Book[]> => {
	// TODO: Lecserélni API hívásra: const response = await fetch('/api/user/books');
	return [
		{
			id: 1,
			title: 'A szél árnyéka',
			cover: 'https://moly.hu/system/covers/big/covers_582574.jpg',
			startDate: '2024-05-01',
			endDate: '2024-05-12',
			readingTime: '12h 35m',
			score: 9.2,
			points: 1250,
			status: 'completed',
		},
		{
			id: 2,
			title: 'A fény útján',
			cover: 'https://marvin.bline.hu/product_images/1037/ID250-67170.JPG',
			startDate: '2025-01-10',
			endDate: '2025-02-02',
			readingTime: '18h 2m',
			score: null,
			points: 980,
			status: 'partial',
		},
		{
			id: 3,
			title: 'Az éjszaka titka',
			cover: 'https://s01.static.libri.hu/cover/56/3/828911_4.jpg',
			startDate: '2023-11-02',
			endDate: '2023-11-15',
			readingTime: '9h 10m',
			score: 7.9,
			points: 420,
			status: 'dropped',
		},
	];
};

const fetchMedalGroups = async (): Promise<MedalGroup[]> => {
	// TODO: Lecserélni API hívásra: const response = await fetch('/api/user/medals');
	return [
		{
			title: 'Események',
			medals: [
				{ id: 1, image: 'https://assets.ppy.sh/medals/web/all-secret-hourbeforethedawn@2x.png', label: 'Tavaszi kihívó', date: '2025-04-12', isLocked: false },
				{ id: 2, image: 'https://assets.ppy.sh/medals/web/all-secret-lightsout@2x.png', label: 'Nyári maraton', date: '2025-07-22', isLocked: false },
				{ id: 3, image: 'https://assets.ppy.sh/medals/web/all-secret-deciduousarborist@2x.png', label: 'Őszi fesztivál', date: null, isLocked: true },
			],
		},
		{
			title: 'Kitartás',
			medals: [
				{ id: 4, image: 'https://assets.ppy.sh/medals/web/osu-secret-causality@2x.png', label: 'Vissza a kezdetekhez', date: '2025-09-03', isLocked: false },
				{ id: 5, image: 'https://assets.ppy.sh/medals/web/all-secret-consolation_prize@2x.png', label: '7 nap', date: '2025-09-01', isLocked: false },
				{ id: 6, image: 'https://assets.ppy.sh/medals/web/all-secret-improved@2x.png', label: '30 nap', date: '2025-10-25', isLocked: false },
				{ id: 7, image: 'https://assets.ppy.sh/medals/web/all-secret-dancer@2x.png', label: '100 nap', date: null, isLocked: true },
			],
		},
		{
			title: 'Megszerezve',
			medals: [
				{ id: 8, image: 'https://assets.ppy.sh/medals/web/all-secret-infectiousenthusiasm@2x.png', label: 'Kezdő gyűjtő', date: '2024-12-03', isLocked: false },
				{ id: 9, image: 'https://assets.ppy.sh/medals/web/all-secret-ourbenefactors@2x.png', label: 'Haladó gyűjtő', date: '2025-06-14', isLocked: false },
				{ id: 10, image: 'https://assets.ppy.sh/medals/web/all-secret-allgood@2x.png', label: 'Első vélemény', date: '2025-05-10', isLocked: false },
				{ id: 11, image: 'https://assets.ppy.sh/medals/web/all-secret-persistenceiskey@2x.png', label: 'Zsűri', date: '2025-05-10', isLocked: false },
				{ id: 12, image: 'https://assets.ppy.sh/medals/web/all-secret-exquisite@2x.png', label: 'Tökéletes', date: '2025-09-12', isLocked: false },
				{ id: 13, image: 'https://assets.ppy.sh/medals/web/all-secret-prepared@2x.png', label: 'Az első eseményem', date: '2025-09-12', isLocked: false },
				{ id: 14, image: 'https://assets.ppy.sh/medals/web/all-secret-quickmaffs@2x.png', label: 'Sosem árt a tanulás', date: null, isLocked: true },
				{ id: 15, image: 'https://assets.ppy.sh/medals/web/all-packs-afterparty@2x.png', label: 'Afterparty', date: null, isLocked: true },
				{ id: 16, image: 'https://assets.ppy.sh/medals/web/all-packs-VINXIS@2x.png', label: 'Talán majd máskor', date: null, isLocked: true },
			],
		},
		{
			title: 'Különlegesek',
			medals: [
				{ id: 17, image: 'https://assets.ppy.sh/medals/web/osu-secret-supersuperhardhddt@2x.png', label: 'Titokzatos', date: null, isLocked: true },
				{ id: 18, image: 'https://assets.ppy.sh/medals/web/all-secret-hybrid@2x.png', label: 'Mesteri', date: null, isLocked: true },
				{ id: 19, image: 'https://assets.ppy.sh/medals/web/all-secret-when-you-see-it@2x.png', label: 'Ő ott biztosúr!', date: null, isLocked: true },
				{ id: 20, image: 'https://assets.ppy.sh/medals/web/all-secret-toofasttoofurious@2x.png', label: 'Maraton', date: null, isLocked: true },
			],
		},
	];
};

// ========================
// KOMPONENS
// ========================

type ViewType = 'all' | 'book' | 'media' | 'settings';

type OpenSelectId = 'profileVisibility' | 'language' | 'badge-0' | 'badge-1' | 'badge-2' | 'notificationFrequency' | 'timezone' | null;
type SaveModalState = { title: string; message: string } | null;
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

const User: React.FC = () => {
	const location = useLocation();
	const locationState = location.state as LocationState | null;
	const [openSelect, setOpenSelect] = useState<OpenSelectId>(null);

	// Állapotok - activeView alapértelmezése a location.state alapján
	const [activeView, setActiveView] = useState<ViewType>(() => {
		if (locationState?.view === 'settings') {
			return 'settings';
		}
		return 'all';
	});
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [defaultAvatar, setDefaultAvatar] = useState<string>('');
	const [allStats, setAllStats] = useState<Record<string, ViewStats>>({});
	const [books, setBooks] = useState<Book[]>([]);
	const [medalGroups, setMedalGroups] = useState<MedalGroup[]>([]);
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
		selectedBadges: ['Kiemelt olvasó', 'Top 100', 'Fürge Nyúl Kihívás'],
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

	const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
		setSettings(prev => ({
			...prev,
			[key]: value,
		}));
	};

	const handleBadgeSelect = (position: number, badge: string) => {
		setSettings(prev => {
			const next = [...prev.selectedBadges];
			const duplicateIndex = next.findIndex((item, index) => index !== position && item === badge);
			if (duplicateIndex !== -1) {
				next[duplicateIndex] = next[position];
			}
			next[position] = badge;
			return {
				...prev,
				selectedBadges: next,
			};
		});
	};

	const handleAvatarFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
		const file = e.target.files?.[0];
		if (!file) return;

		const allowedTypes = new Set(['image/png', 'image/jpeg', 'image/webp']);
		if (!allowedTypes.has(file.type)) {
			alert('Csak PNG, JPG vagy WEBP képet tölthetsz fel.');
			e.target.value = '';
			return;
		}

		const maxBytes = 2 * 1024 * 1024; // 2MB
		if (file.size > maxBytes) {
			alert('A kép túl nagy. Maximum 2MB lehet.');
			e.target.value = '';
			return;
		}

		const reader = new FileReader();
		reader.onload = () => {
			const dataUrl = typeof reader.result === 'string' ? reader.result : null;
			if (!dataUrl) {
				alert('Nem sikerült beolvasni a képet.');
				return;
			}
			updateSetting('avatarDataUrl', dataUrl);
			setProfile(prev => (prev ? { ...prev, avatar: dataUrl } : prev));
		};
		reader.readAsDataURL(file);
	};

	const handleResetAvatar = () => {
		updateSetting('avatarDataUrl', null);
		setProfile(prev => (prev ? { ...prev, avatar: defaultAvatar || prev.avatar } : prev));
		if (defaultAvatar) {
			syncAuthAvatar(defaultAvatar);
		}
	};

	const syncAuthAvatar = (avatarUrl: string | null) => {
		try {
			const savedUser = localStorage.getItem('kk_user');
			if (!savedUser) return;
			const parsed = JSON.parse(savedUser) as { avatar?: string } & Record<string, unknown>;
			const next = { ...parsed, avatar: avatarUrl ?? parsed.avatar };
			localStorage.setItem('kk_user', JSON.stringify(next));
			window.dispatchEvent(new Event('kk_user_updated'));
		} catch (error) {
			console.error('Failed to sync navbar avatar:', error);
		}
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
		if (locationState?.view === 'settings') {
			setActiveView('settings');
		}
	}, [locationState]);

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
			try {
				// TODO: Később ezek API hívások lesznek
				const [profileData, statsData, booksData] = await Promise.all([
					fetchUserProfile(),
					fetchViewStats(),
					fetchBooks(),
				]);

				setProfile(profileData);
				setDefaultAvatar(profileData.avatar);
				setAllStats(statsData);
				setBooks(booksData);

				// Beállítások inicializálása profil adatokból
				setSettings(prev => ({
					...prev,
					username: profileData.username,
					email: profileData.email,
					countryCode: profileData.countryCode,
				}));

				// localStorage beállítások betöltése
				const savedSettings = localStorage.getItem('kk_profile_settings');
				if (savedSettings) {
					const parsed = JSON.parse(savedSettings) as Partial<UserSettings>;
					const legacySelectedTitles = (parsed as { selectedTitles?: string[] }).selectedTitles;
					const normalizedSelectedBadges = Array.isArray(parsed.selectedBadges)
						? parsed.selectedBadges.slice(0, 3)
						: Array.isArray(legacySelectedTitles)
							? legacySelectedTitles.slice(0, 3)
							: undefined;
					setSettings(prev => ({
						...prev,
						...parsed,
						selectedBadges: normalizedSelectedBadges ?? prev.selectedBadges,
						username: profileData.username,
					}));
					if (parsed.avatarDataUrl && typeof parsed.avatarDataUrl === 'string') {
						setProfile(prev => (prev ? { ...prev, avatar: parsed.avatarDataUrl as string } : prev));
						syncAuthAvatar(parsed.avatarDataUrl as string);
					}
				}
			} catch (error) {
				console.error('Hiba az adatok betöltésekor:', error);
			} finally {
				setIsLoading(false);
			}
		};

		loadData();
	}, []);

	useEffect(() => {
		if (!badgesExpanded || badgesLoaded || isLoadingBadges) return;

		let cancelled = false;

		const loadBadgeGroups = async () => {
			setIsLoadingBadges(true);
			try {
				const medalsData = await fetchMedalGroups();
				if (cancelled) return;
				setMedalGroups(medalsData);
				setBadgesLoaded(true);
			} catch (error) {
				console.error('Hiba a kitűzők betöltésekor:', error);
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
	}, [badgesExpanded, badgesLoaded, isLoadingBadges]);

	// Jelenlegi nézet statisztikái
	const currentStats = allStats[activeView] || allStats['all'];

	// Beállítások mentése
	const handleSaveSettings = () => {
		if (settings.newPassword && settings.newPassword !== settings.confirmPassword) {
			alert('Az új jelszó és megerősítés nem egyezik.');
			return;
		}

		const payload = {
			username: settings.username,
			email: settings.email,
			countryCode: settings.countryCode,
			avatarDataUrl: settings.avatarDataUrl,
			selectedBadges: settings.selectedBadges,
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

		// TODO: API hívás: await fetch('/api/user/settings', { method: 'PUT', body: JSON.stringify(payload) });
		localStorage.setItem('kk_profile_settings', JSON.stringify(payload));
		syncAuthAvatar(settings.avatarDataUrl);
		setSaveModal({
			title: 'Mentés kész',
			message: 'A beállítások sikeresen elmentésre kerültek.',
		});
	};

	// Adatok exportálása
	const handleExportData = () => {
		const payload = {
			profile,
			stats: allStats,
			books,
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
			// TODO: API hívás: await fetch('/api/user/delete', { method: 'DELETE' });
			localStorage.removeItem('kk_profile_settings');
			localStorage.removeItem('kk_session');
			alert('Fiók törlése szimulálva. Átirányítás a kezdőlapra.');
			window.location.href = '#/';
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
								<button
									className={`btn btn-action ${activeView === 'settings' ? 'active' : ''}`}
									type="button"
									onClick={() => setActiveView('settings')}
								>
									<i className="bi bi-gear-fill me-1"></i>BEÁLLÍTÁSOK
								</button>
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
			{activeView === 'settings' && (
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
										<img src={profile.avatar} alt="profilkép" />
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
												Visszaállítás
											</button>
											<small className="settings-hint d-block" style={{ lineHeight: 1.2 }}>
												PNG/JPG/WEBP • max. 2MB
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
										onChange={(e) => updateSetting('email', e.target.value)}
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
														onClick={(e) => {
															e.stopPropagation();
															setOpenSelect(prev => (prev === `badge-${position}` ? null : `badge-${position}` as OpenSelectId));
														}}
													>
														<span>{settings.selectedBadges[position]}</span>
													</button>
													<div className={`custom-select-menu ${openSelect === `badge-${position}` ? 'show' : ''}`}>
														{BADGE_OPTIONS.map((badge) => (
															<div
																key={badge}
																className="country-item"
																onClick={() => {
																	handleBadgeSelect(position, badge);
																	setOpenSelect(null);
																}}
															>
																{badge}
															</div>
														))}
													</div>
												</div>
											</div>
										))}
									</div>
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
							<i className="bi bi-check2-circle"></i>
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
											{(settings.selectedBadges.length > 0 ? settings.selectedBadges : currentStats.badges.slice(0, 3)).map((badge, index) => (
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
									{activeView !== 'book' && (
										<li>
											<strong><span>{currentStats.labels.labelMediaViewed}</span></strong>{' '}
											<span>{currentStats.mediaViewed}</span>
										</li>
									)}
									<li>
										<strong><span>{currentStats.labels.labelLongestStreak}</span></strong>{' '}
										<span>{currentStats.longestStreak}</span>
									</li>
									<li>
										<strong><span>{currentStats.labels.labelReviewsSent}</span></strong>{' '}
										<span>{currentStats.reviewsSent}</span>
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
										{books.map((book) => (
											<li key={book.id} className="list-group-item book-item">
												<div className="d-flex gap-3 align-items-center">
													<img src={book.cover} alt={book.title} className="book-logo" />
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
										{books.map((book) => (
											<li key={book.id} className="list-group-item book-item">
												<div className="d-flex gap-3 align-items-center">
													<img src={book.cover} alt={book.title} className="book-logo" />
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
													<img src={medal.image} alt={medal.label} className="medal" />
													<div className="medal-label">{medal.label}</div>
													<div className="medal-date">{medal.date || '—'}</div>
												</button>
											))}
										</div>
									</div>
								))}
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
