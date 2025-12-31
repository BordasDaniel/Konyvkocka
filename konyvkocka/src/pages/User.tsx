import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import '../styles/user.css';

// ========================
// TÍPUSOK - Adatbázisból fetchelhető típusok
// ========================

interface UserProfile {
	username: string;
	avatar: string;
	country: string;
	countryFlag: string;
	level: number;
	levelProgress: number;
	isSubscriber: boolean;
	email: string;
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

interface UserSettings {
	username: string;
	email: string;
	avatarDataUrl: string | null;
	profileVisibility: 'public' | 'friends' | 'private';
	showCountryOnProfile: boolean;
	showOnlineStatus: boolean;
	allowFriendRequests: boolean;
	allowMentions: boolean;
	language: 'hu' | 'en';
	textSize: 'small' | 'normal' | 'large';
	reducedMotion: boolean;
	highContrast: boolean;
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
		countryFlag: 'https://flagcdn.com/w20/hu.png',
		level: 98,
		levelProgress: 27,
		isSubscriber: true,
		email: 'daniel@example.com',
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
				readSectionTitle: 'Összes megtekintett tartalom',
				readSectionSubtitle: '124 film, 89 sorozat, 8 könyv teljes • 57 könyv részben • 23 folyamatban',
				readSectionActivity: 'Utolsó aktivitás: 2 nappal ezelőtt',
				readSectionButton: 'Mutasd a tartalmakat',
				favSectionTitle: 'Összes kedvenc',
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
				readSectionTitle: 'Olvasott könyvek',
				readSectionSubtitle: '8 befejezve • 57 olvasás alatt • 7 félbehagyva • 357 tervben • 513 archivált',
				readSectionActivity: 'Utolsó könyv: 1 nappal ezelőtt',
				readSectionButton: 'Mutasd a könyveket',
				favSectionTitle: 'Kedvenc könyvek',
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
				labelReadingPoints: 'Film/Sorozat pontok',
				labelReadingTime: 'Nézési idő',
				labelCompletion: 'Befejezési arány:',
				labelReadBooks: 'Elolvasott könyvek:',
				labelMediaViewed: 'Megtekintett filmek/sorozatok:',
				labelLongestStreak: 'Leghosszabb nézési sorozat:',
				labelReviewsSent: 'Film/Sorozat vélemények:',
			},
			sections: {
				readSectionTitle: 'Megtekintett filmek és sorozatok',
				readSectionSubtitle: '124 film befejezve • 89 sorozat befejezve • 23 folyamatban • 12 félbehagyva',
				readSectionActivity: 'Utoljára nézett: tegnap',
				readSectionButton: 'Mutasd a filmeket/sorozatokat',
				favSectionTitle: 'Kedvenc filmek és sorozatok',
				favSectionSubtitle: '45 kedvenc film • 32 kedvenc sorozat',
				favSectionActivity: 'Frissítve: ma',
				favSectionButton: 'Mutasd a kedvenc filmeket',
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

type OpenSelectId = 'profileVisibility' | 'language' | 'textSize' | 'contrast' | null;

interface LocationState {
	view?: 'settings';
}

const User: React.FC = () => {
	const location = useLocation();
	const locationState = location.state as LocationState | null;
	const [openSelect, setOpenSelect] = useState<OpenSelectId>(null);
	const profileVisibilityRef = useRef<HTMLDivElement>(null);
	const languageRef = useRef<HTMLDivElement>(null);
	const textSizeRef = useRef<HTMLDivElement>(null);
	const contrastRef = useRef<HTMLDivElement>(null);

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

	// Collapse állapotok
	const [readBooksOpen, setReadBooksOpen] = useState(false);
	const [favBooksOpen, setFavBooksOpen] = useState(false);

	// Beállítások állapotok
	const [settings, setSettings] = useState<UserSettings>({
		username: '',
		email: '',
		avatarDataUrl: null,
		profileVisibility: 'public',
		showCountryOnProfile: true,
		showOnlineStatus: true,
		allowFriendRequests: true,
		allowMentions: true,
		language: 'hu',
		textSize: 'normal',
		reducedMotion: false,
		highContrast: false,
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
			const target = event.target as Node;
			const inAny =
				profileVisibilityRef.current?.contains(target) ||
				languageRef.current?.contains(target) ||
				textSizeRef.current?.contains(target) ||
				contrastRef.current?.contains(target);

			if (!inAny) {
				setOpenSelect(null);
			}
		};

		document.addEventListener('click', clickAway);
		return () => document.removeEventListener('click', clickAway);
	}, []);

	// Location state változásának figyelése (pl. navigáció a Beállításokhoz)
	useEffect(() => {
		if (locationState?.view === 'settings') {
			setActiveView('settings');
		}
	}, [locationState]);

	// Adatok betöltése
	useEffect(() => {
		const loadData = async () => {
			setIsLoading(true);
			try {
				// TODO: Később ezek API hívások lesznek
				const [profileData, statsData, booksData, medalsData] = await Promise.all([
					fetchUserProfile(),
					fetchViewStats(),
					fetchBooks(),
					fetchMedalGroups(),
				]);

				setProfile(profileData);
				setDefaultAvatar(profileData.avatar);
				setAllStats(statsData);
				setBooks(booksData);
				setMedalGroups(medalsData);

				// Beállítások inicializálása profil adatokból
				setSettings(prev => ({
					...prev,
					username: profileData.username,
					email: profileData.email,
				}));

				// localStorage beállítások betöltése
				const savedSettings = localStorage.getItem('kk_profile_settings');
				if (savedSettings) {
					const parsed = JSON.parse(savedSettings) as Partial<UserSettings>;
					setSettings(prev => ({
						...prev,
						...parsed,
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
			avatarDataUrl: settings.avatarDataUrl,
			profileVisibility: settings.profileVisibility,
			showCountryOnProfile: settings.showCountryOnProfile,
			showOnlineStatus: settings.showOnlineStatus,
			allowFriendRequests: settings.allowFriendRequests,
			allowMentions: settings.allowMentions,
			language: settings.language,
			textSize: settings.textSize,
			reducedMotion: settings.reducedMotion,
			highContrast: settings.highContrast,
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
		alert('Beállítások elmentve.');
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

	// Kijelentkezés
	const handleLogout = () => {
		// TODO: API hívás: await fetch('/api/auth/logout', { method: 'POST' });
		localStorage.removeItem('kk_session');
		alert('Kijelentkezve. Átirányítás a bejelentkezéshez.');
		window.location.href = '/login';
	};

	// Fiók törlése
	const handleDeleteAccount = () => {
		if (window.confirm('Biztosan végleg törlöd a fiókodat? Ez nem visszavonható.')) {
			// TODO: API hívás: await fetch('/api/user/delete', { method: 'DELETE' });
			localStorage.removeItem('kk_profile_settings');
			localStorage.removeItem('kk_session');
			alert('Fiók törlése szimulálva. Átirányítás a kezdőlapra.');
			window.location.href = '/';
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
				<div className="row align-items-center">
					<div className="col-auto">
						<div className="avatar">
							<img src={profile.avatar} alt="avatar" />
						</div>
					</div>
					<div className="col">
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
							<div className="d-flex align-items-center gap-2 mb-3">
								<img src={profile.countryFlag} alt={profile.country} />
								<small>{profile.country}</small>
							</div>
						)}

						{/* Profile action buttons - 2x2 grid layout */}
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
								<i className="bi bi-film me-1"></i>FILMEK/Sorozatok
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
					<div className="col-auto text-end">
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
								<div className="d-flex align-items-center gap-3">
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
										<div className="d-flex gap-2 mt-2">
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
										<div className="custom-select-wrapper position-relative" ref={profileVisibilityRef}>
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
										<div className="custom-select-wrapper position-relative" ref={languageRef}>
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
								<div className="col-md-6 mb-3">
									<label className="form-label">Értesítési gyakoriság</label>
									<select
										className="form-select"
										value={settings.notificationFrequency}
										onChange={(e) => updateSetting('notificationFrequency', e.target.value as UserSettings['notificationFrequency'])}
									>
										<option value="immediate">Azonnal</option>
										<option value="daily">Napi</option>
										<option value="weekly">Heti</option>
										<option value="none">Egyáltalán nem</option>
									</select>
								</div>
								<div className="col-md-6 mb-3">
									<label className="form-label">Időzóna</label>
									<select
										className="form-select"
										value={settings.timezone}
										onChange={(e) => updateSetting('timezone', e.target.value)}
									>
										<option value="Europe/Budapest">Europe/Budapest (GMT+1)</option>
										<option value="Europe/London">Europe/London (GMT+0)</option>
										<option value="America/New_York">America/New_York (GMT-5)</option>
									</select>
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
							<h6 className="mb-3" style={{ color: 'var(--h1Text)' }}>Megjelenés és kisegítő lehetőségek</h6>
							<div className="row">
								<div className="col-md-6 mb-3">
									<label className="form-label">Betűméret</label>
									<div className="custom-select-wrapper position-relative" ref={textSizeRef}>
										<button
											className="form-select text-start"
											type="button"
											id="textSizeDropdown"
											aria-expanded={openSelect === 'textSize'}
											onClick={(e) => {
												e.stopPropagation();
												setOpenSelect(prev => (prev === 'textSize' ? null : 'textSize'));
											}}
										>
											<span>
												{settings.textSize === 'small' ? 'Kicsi' : settings.textSize === 'large' ? 'Nagy' : 'Normál'}
											</span>
										</button>
										<div className={`custom-select-menu ${openSelect === 'textSize' ? 'show' : ''}`}>
											<div
												className="country-item"
												onClick={() => {
													updateSetting('textSize', 'small');
													setOpenSelect(null);
												}}
											>
												Kicsi
											</div>
											<div
												className="country-item"
												onClick={() => {
													updateSetting('textSize', 'normal');
													setOpenSelect(null);
												}}
											>
												Normál
											</div>
											<div
												className="country-item"
												onClick={() => {
													updateSetting('textSize', 'large');
													setOpenSelect(null);
												}}
											>
												Nagy
											</div>
										</div>
									</div>
								</div>
								<div className="col-md-6 mb-3">
									<label className="form-label">Kontraszt</label>
									<div className="custom-select-wrapper position-relative" ref={contrastRef}>
										<button
											className="form-select text-start"
											type="button"
											id="contrastDropdown"
											aria-expanded={openSelect === 'contrast'}
											onClick={(e) => {
												e.stopPropagation();
												setOpenSelect(prev => (prev === 'contrast' ? null : 'contrast'));
											}}
										>
											<span>{settings.highContrast ? 'Magas kontraszt' : 'Normál'}</span>
										</button>
										<div className={`custom-select-menu ${openSelect === 'contrast' ? 'show' : ''}`}>
											<div
												className="country-item"
												onClick={() => {
													updateSetting('highContrast', false);
													setOpenSelect(null);
												}}
											>
												Normál
											</div>
											<div
												className="country-item"
												onClick={() => {
													updateSetting('highContrast', true);
													setOpenSelect(null);
												}}
											>
												Magas kontraszt
											</div>
										</div>
									</div>
								</div>
								<div className="col-12 col-md-6 mb-2">
									<div className="form-check form-switch">
										<input
											className="form-check-input"
											type="checkbox"
											id="reducedMotion"
											checked={settings.reducedMotion}
											onChange={(e) => updateSetting('reducedMotion', e.target.checked)}
										/>
										<label className="form-check-label" htmlFor="reducedMotion">
											Kevesebb animáció (reduced motion)
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
						</div>
					</div>

					{/* Actions Section */}
					<div className="about-panel p-4 mb-4">
						<div className="row">
							<div className="col-12 col-md-6 mb-3 mb-md-0">
								<div className="d-flex gap-2">
									<button type="button" className="btn btn-primary" onClick={handleSaveSettings}>
										<i className="bi bi-check-circle me-1"></i> Mentés
									</button>
									<button type="button" className="btn btn-secondary" onClick={() => setActiveView('all')}>
										<i className="bi bi-arrow-left me-1"></i> Vissza
									</button>
								</div>
							</div>
							<div className="col-12 col-md-6 text-md-end">
								<div className="d-flex flex-wrap gap-2 justify-content-md-end">
									<button className="btn btn-sm btn-outline-light" type="button" onClick={handleExportData} title="Adatok exportálása">
										<i className="bi bi-download me-1"></i> Export
									</button>
									<button className="btn btn-sm btn-secondary" type="button" onClick={handleLogout} title="Kijelentkezés">
										<i className="bi bi-box-arrow-right me-1"></i> Kijelentkezés
									</button>
									<button className="btn btn-sm btn-danger" type="button" onClick={handleDeleteAccount} title="Fiók törlése">
										<i className="bi bi-trash me-1"></i> Fiók törlése
									</button>
								</div>
							</div>
						</div>
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
											{currentStats.badges.map((badge, index) => (
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

						<div className="col-lg-4">
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
										<p className="mb-0 text-muted">{currentStats.sections.readSectionSubtitle}</p>
									</div>
									<div className="text-end">
										<small className="text-muted">{currentStats.sections.readSectionActivity}</small>
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
													<div className="flex-grow-1">
														<div className="book-title">{book.title}</div>
														<div className="book-meta">
															Kezdte: {book.startDate} • Befejezte: {book.endDate} • Olvasás: {book.readingTime}
														</div>
													</div>
													<div className="text-end text-nowrap">
														{book.score !== null ? (
															<div><span className="badge badge-score">{book.score}</span></div>
														) : (
															<div className="no-score">Nincs értékelés</div>
														)}
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
										<p className="mb-0 text-muted">{currentStats.sections.favSectionSubtitle}</p>
									</div>
									<div className="text-end">
										<small className="text-muted">{currentStats.sections.favSectionActivity}</small>
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
													<div className="flex-grow-1">
														<div className="book-title">{book.title}</div>
														<div className="book-meta">
															Kezdte: {book.startDate} • Befejezte: {book.endDate} • Olvasás: {book.readingTime}
														</div>
													</div>
													<div className="text-end text-nowrap">
														{book.score !== null ? (
															<div><span className="badge badge-score">{book.score}</span></div>
														) : (
															<div className="no-score">Nincs értékelés</div>
														)}
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

			{/* Medals Section */}
			{activeView !== 'settings' && (
				<section id="medalsSection" className="medals-section">
					<h3 className="mt-4 mb-3" style={{ color: 'var(--h1Text)' }}>Jelvények</h3>

					{medalGroups.map((group, groupIndex) => (
						<div key={groupIndex} className="group about-panel p-3">
							<div className="group-title">{group.title}</div>
							<div className="medal-grid">
								{group.medals.map((medal) => (
									<div
										key={medal.id}
										className={`medal-tile ${medal.isLocked ? 'medal-locked' : 'medal-earned'}`}
									>
										<img src={medal.image} alt={medal.label} className="medal" />
										<div className="medal-label">{medal.label}</div>
										<div className="medal-date">{medal.date || '—'}</div>
									</div>
								))}
							</div>
						</div>
					))}
				</section>
			)}
		</main>
	);
};

export default User;
