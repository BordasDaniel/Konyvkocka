const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5269').replace(/\/$/, '');

export const SESSION_STORAGE_KEY = 'kk_session';

const DEFAULT_AVATAR =
	"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' stop-color='%232f3b52'/%3E%3Cstop offset='100%25' stop-color='%23192234'/%3E%3C/linearGradient%3E%3C/defs%3E%3Ccircle cx='64' cy='64' r='64' fill='url(%23g)'/%3E%3Ccircle cx='64' cy='49' r='23' fill='%23d6deeb'/%3E%3Cpath d='M24 113c5-22 21-34 40-34s35 12 40 34' fill='%23d6deeb'/%3E%3C/svg%3E";
export const CONTENT_FALLBACK_IMAGE = '/assets/img/default-cover.svg';

export const applyContentImageFallback = (imageElement: HTMLImageElement): void => {
	const fallbackAbsoluteUrl = new URL(CONTENT_FALLBACK_IMAGE, window.location.origin).toString();
	if (imageElement.src === fallbackAbsoluteUrl || imageElement.getAttribute('src') === CONTENT_FALLBACK_IMAGE) {
		return;
	}

	imageElement.onerror = null;
	imageElement.src = CONTENT_FALLBACK_IMAGE;
};

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

interface RequestOptions {
	method?: HttpMethod;
	body?: unknown;
	auth?: boolean;
}

export class ApiHttpError extends Error {
	public readonly status: number;
	public readonly payload: unknown;

	constructor(status: number, message: string, payload: unknown) {
		super(message);
		this.name = 'ApiHttpError';
		this.status = status;
		this.payload = payload;
	}
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null;

const extractErrorMessage = (payload: unknown, fallback: string): string => {
	if (isRecord(payload)) {
		const message = payload.message;
		const error = payload.error;
		if (typeof message === 'string' && message.trim().length > 0) return message;
		if (typeof error === 'string' && error.trim().length > 0) return error;
	}

	return fallback;
};

const getToken = (): string | null => localStorage.getItem(SESSION_STORAGE_KEY);

const request = async <T,>(path: string, options: RequestOptions = {}): Promise<T> => {
	const { method = 'GET', body, auth = false } = options;

	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
	};

	if (auth) {
		const token = getToken();
		if (token) {
			headers.Authorization = `Bearer ${token}`;
		}
	}

	const response = await fetch(`${API_BASE_URL}${path}`, {
		method,
		headers,
		body: body === undefined ? undefined : JSON.stringify(body),
	});

	const text = await response.text();
	let payload: unknown = null;

	if (text) {
		try {
			payload = JSON.parse(text) as unknown;
		} catch {
			payload = text;
		}
	}

	if (!response.ok) {
		throw new ApiHttpError(
			response.status,
			extractErrorMessage(payload, `HTTP ${response.status}`),
			payload,
		);
	}

	return payload as T;
};

const sha256Hex = async (value: string): Promise<string> => {
	const bytes = new TextEncoder().encode(value);
	const hash = await crypto.subtle.digest('SHA-256', bytes);
	return Array.from(new Uint8Array(hash))
		.map((byte) => byte.toString(16).padStart(2, '0'))
		.join('');
};

const createRandomSalt = (length = 64): string => {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	const random = crypto.getRandomValues(new Uint8Array(length));

	let result = '';
	for (const value of random) {
		result += chars[value % chars.length];
	}

	return result;
};

export interface ApiUserMe {
	id: number;
	username: string;
	email: string;
	avatar: string | null;
	isSubscriber: boolean;
	permissionLevel: string;
}

interface AuthResponse {
	user: ApiUserMe;
	token: string;
}

export interface UiAuthUser {
	id: number;
	username: string;
	email: string;
	avatar: string;
	isSubscriber: boolean;
	permissionLevel: 'USER' | 'MODERATOR' | 'ADMIN' | 'BANNED';
	isAdmin: boolean;
	isModerator: boolean;
}

const normalizePermissionLevel = (permissionLevel: string | null | undefined): UiAuthUser['permissionLevel'] => {
	const normalized = permissionLevel?.toUpperCase();
	if (normalized === 'ADMIN') return 'ADMIN';
	if (normalized === 'MODERATOR') return 'MODERATOR';
	if (normalized === 'BANNED') return 'BANNED';
	return 'USER';
};

const decodeBase64Prefix = (rawBase64: string, bytesToRead = 16): Uint8Array | null => {
	try {
		const cleaned = rawBase64.replace(/\s+/g, '');
		if (!cleaned) return null;

		const charsNeeded = Math.ceil((bytesToRead * 4) / 3);
		const prefix = cleaned.slice(0, charsNeeded);
		const padded = prefix + '='.repeat((4 - (prefix.length % 4)) % 4);
		const decoded = atob(padded);
		const bytes = new Uint8Array(decoded.length);
		for (let i = 0; i < decoded.length; i += 1) {
			bytes[i] = decoded.charCodeAt(i);
		}
		return bytes;
	} catch {
		return null;
	}
};

const detectAvatarMimeType = (rawBase64: string): string => {
	const bytes = decodeBase64Prefix(rawBase64, 16);
	if (!bytes || bytes.length < 4) return 'image/png';

	if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'image/png';
	if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
	if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) return 'image/gif';
	if (
		bytes.length >= 12 &&
		bytes[0] === 0x52 &&
		bytes[1] === 0x49 &&
		bytes[2] === 0x46 &&
		bytes[3] === 0x46 &&
		bytes[8] === 0x57 &&
		bytes[9] === 0x45 &&
		bytes[10] === 0x42 &&
		bytes[11] === 0x50
	) {
		return 'image/webp';
	}
	if (bytes[0] === 0x42 && bytes[1] === 0x4d) return 'image/bmp';

	return 'image/png';
};

export const toAvatarSrc = (avatar: string | null | undefined): string => {
	if (!avatar) return DEFAULT_AVATAR;
	if (/^https?:\/\//i.test(avatar) || avatar.startsWith('data:')) return avatar;
	return `data:${detectAvatarMimeType(avatar)};base64,${avatar}`;
};

export const toContentImageSrc = (img: string | null | undefined): string => {
	const normalized = img?.trim();
	if (!normalized) return CONTENT_FALLBACK_IMAGE;
	return normalized;
};

export type NormalizedContentType = 'book' | 'movie' | 'series';

export const normalizeContentType = (type: string): NormalizedContentType => {
	const lowered = type.toLowerCase();
	if (lowered === 'movie') return 'movie';
	if (lowered === 'series') return 'series';
	return 'book';
};

export const buildContentKey = (type: string, id: number): string => `${normalizeContentType(type)}:${id}`;

export const parseContentKey = (key: string): { type: NormalizedContentType; id: number } | null => {
	const [typePart, idPart] = key.split(':');
	const id = Number(idPart);
	if (!typePart || Number.isNaN(id)) return null;
	return { type: normalizeContentType(typePart), id };
};

export const mapUserMeToUiUser = (user: ApiUserMe): UiAuthUser => {
	const permissionLevel = normalizePermissionLevel(user.permissionLevel);

	return {
		id: user.id,
		username: user.username,
		email: user.email,
		avatar: toAvatarSrc(user.avatar),
		isSubscriber: user.isSubscriber,
		permissionLevel,
		isAdmin: permissionLevel === 'ADMIN',
		isModerator: permissionLevel === 'MODERATOR',
	};
};

export const authLogin = async (email: string, plainPassword: string): Promise<AuthResponse> => {
	const passwordHash = await sha256Hex(plainPassword);

	return request<AuthResponse>('/api/auth/login', {
		method: 'POST',
		body: { email, passwordHash },
	});
};

export const authRegister = async (
	username: string,
	email: string,
	plainPassword: string,
): Promise<AuthResponse> => {
	const passwordHash = await sha256Hex(plainPassword);
	const passwordSalt = createRandomSalt();

	return request<AuthResponse>('/api/auth/register', {
		method: 'POST',
		body: { username, email, passwordHash, passwordSalt },
	});
};

export const authMe = async (): Promise<ApiUserMe> => request<ApiUserMe>('/api/auth/me', { auth: true });

export const authLogout = async (): Promise<void> => {
	await request<{ message: string }>('/api/auth/logout', {
		method: 'POST',
		auth: true,
	});
};

export interface HomeCardResponse {
	id: number;
	type: string;
	title: string;
	img: string;
	year: number;
	rating: number;
	tags: string[];
}


export interface AdminNewsItemResponse {
	id: number;
	title: string;
	content: string;
	eventTag: 'UPDATE' | 'ANNOUNCEMENT' | 'EVENT' | 'FUNCTION';
	createdAt: string;
	updatedAt: string | null;
}

export interface AdminNewsResponse {
	total: number;
	page: number;
	pageSize: number;
	news: AdminNewsItemResponse[];
	summary: {
		total: number;
		updates: number;
		announcements: number;
		events: number;
		functions: number;
	};
}

export interface UpdateAdminNewsPayload {
	title: string;
	content: string;
	eventTag: 'UPDATE' | 'ANNOUNCEMENT' | 'EVENT' | 'FUNCTION';
}

export const getAdminNews = async (params: {
	page?: number;
	pageSize?: number;
	eventTag?: 'UPDATE' | 'ANNOUNCEMENT' | 'EVENT' | 'FUNCTION';
	q?: string;
} = {}): Promise<AdminNewsResponse> => {
	const searchParams = new URLSearchParams();
	searchParams.set('page', String(params.page ?? 1));
	searchParams.set('pageSize', String(params.pageSize ?? 20));
	if (params.eventTag) searchParams.set('eventTag', params.eventTag);
	if (params.q && params.q.trim().length > 0) searchParams.set('q', params.q.trim());

	return request<AdminNewsResponse>(`/api/admin/news?${searchParams.toString()}`, { auth: true });
};

export const updateAdminNews = async (
	id: number,
	payload: UpdateAdminNewsPayload,
): Promise<AdminNewsItemResponse> =>
	request<AdminNewsItemResponse>(`/api/admin/news/${id}`, {
		auth: true,
		method: 'PUT',
		body: payload,
	});

export interface CreateAdminAnnouncementPayload {
	target: 'all' | 'subscribers' | 'free' | 'specific';
	message: string;
	usernames?: string[];
}

export interface AdminAnnouncementResponse {
	sentCount: number;
	missingUsernames: string[];
}

export const sendAdminAnnouncement = async (
	payload: CreateAdminAnnouncementPayload,
): Promise<AdminAnnouncementResponse> =>
	request<AdminAnnouncementResponse>('/api/admin/announcements', {
		auth: true,
		method: 'POST',
		body: payload,
	});
export interface HomeCarouselResponse {
	id: number;
	type: string;
	title: string;
	img: string;
	year: number;
	description: string;
	tags: string[];
}

export interface EpisodeResponse {
	id: number;
	seasonNum: number;
	episodeNum: number;
	title: string;
	streamUrl: string;
	length: number;
}

export interface ContentDetailResponse {
	id: number;
	type: string;
	title: string;
	img: string;
	description: string;
	rating: number;
	trailerUrl: string | null;
	tags: string[];
	watchUrl: string | null;
	episodes: EpisodeResponse[] | null;
}

export interface HomePageResponse {
	fresh: HomeCardResponse[];
	hot: HomeCardResponse[];
	carousel: HomeCarouselResponse[];
}

export const getHomePage = async (): Promise<HomePageResponse> =>
	request<HomePageResponse>('/api/content/home');

export const getContentDetail = async (
	type: string,
	id: number,
): Promise<ContentDetailResponse> => request<ContentDetailResponse>(`/api/content/${type}/${id}`);

export interface SearchContentParams {
	q?: string;
	type?: string;
	ageRatings?: string;
	tags?: string;
	sort?: string;
	limit?: number;
	offset?: number;
}

export interface SearchResponse {
	total: number;
	limit: number;
	offset: number;
	items: HomeCardResponse[];
}

export const searchContent = async (params: SearchContentParams): Promise<SearchResponse> => {
	const searchParams = new URLSearchParams();
	if (params.q) searchParams.set('q', params.q);
	if (params.type) searchParams.set('type', params.type);
	if (params.ageRatings) searchParams.set('ageRatings', params.ageRatings);
	if (params.tags) searchParams.set('tags', params.tags);
	if (params.sort) searchParams.set('sort', params.sort);
	if (typeof params.limit === 'number') searchParams.set('limit', String(params.limit));
	if (typeof params.offset === 'number') searchParams.set('offset', String(params.offset));

	return request<SearchResponse>(`/api/content/search?${searchParams.toString()}`);
};

export interface LibraryItemResponse {
	id: number;
	contentType: string;
	title: string;
	cover: string;
	year: number | null;
	rating: number | null;
	tags: string[];
	status: string | null;
	favorite: boolean;
	userRating: number | null;
	addedAt: string | null;
	completedAt: string | null;
	lastSeen: string | null;
}

export interface LibraryResponse {
	query: string | null;
	totalResults: number;
	results: LibraryItemResponse[];
}

export const getLibrary = async (params: { q?: string } = {}): Promise<LibraryResponse> => {
	const searchParams = new URLSearchParams();
	if (params.q) searchParams.set('q', params.q);
	const query = searchParams.toString();
	const path = query.length > 0 ? `/api/library?${query}` : '/api/library';
	return request<LibraryResponse>(path, { auth: true });
};

export interface HistoryItemResponse {
	contentType: string;
	contentId: number;
	title: string;
	cover: string | null;
	poster: string | null;
	status: string | null;
	progress: number | null;
	totalUnits: number | null;
	rating: number | null;
	lastSeen: string | null;
	addedAt: string | null;
}

export interface HistoryResponse {
	type: string;
	total: number;
	page: number;
	pageSize: number;
	history: HistoryItemResponse[];
}

export const getHistory = async (params: {
	type?: 'all' | 'book' | 'movie' | 'series';
	page?: number;
	pageSize?: number;
} = {}): Promise<HistoryResponse> => {
	const searchParams = new URLSearchParams();
	searchParams.set('type', params.type ?? 'all');
	searchParams.set('page', String(params.page ?? 1));
	searchParams.set('pageSize', String(params.pageSize ?? 100));

	return request<HistoryResponse>(`/api/history?${searchParams.toString()}`, { auth: true });
};

export interface NewsArticleResponse {
	id: number;
	title: string;
	date: string;
	category: string;
	description: string;
}

export interface NewsResponse {
	total: number;
	page: number;
	pageSize: number;
	articles: NewsArticleResponse[];
}

export const getNews = async (params: {
	filter?: 'all' | 'update' | 'function' | 'announcement' | 'event';
	page?: number;
	pageSize?: number;
} = {}): Promise<NewsResponse> => {
	const searchParams = new URLSearchParams();
	searchParams.set('filter', params.filter ?? 'all');
	searchParams.set('page', String(params.page ?? 1));
	searchParams.set('pageSize', String(params.pageSize ?? 20));

	return request<NewsResponse>(`/api/news?${searchParams.toString()}`);
};

export interface UserProfileTabAllResponse {
	globalRank: number | null;
	countryRank: number | null;
	points: number;
	timeMin: number;
	completionRate: number;
	booksCompleted: number;
	mediaCompleted: number;
	dayStreak: number;
}

export interface UserProfileTabMediaResponse {
	globalRank: number | null;
	countryRank: number | null;
	points: number;
	watchTimeMin: number;
	completionRate: number;
	completed: number;
	total: number;
}

export interface UserProfileTabBooksResponse {
	globalRank: number | null;
	countryRank: number | null;
	points: number;
	readTimeMin: number;
	completionRate: number;
	completed: number;
	total: number;
}

export interface UserProfileResponse {
	id: number;
	username: string;
	avatar: string | null;
	countryCode: string;
	email: string | null;
	isSubscriber: boolean;
	premiumExpiresAt: string | null;
	creationDate: string;
	lastLoginDate: string;
	xp: number;
	level: number;
	dayStreak: number;
	bookPoints: number;
	seriesPoints: number;
	moviePoints: number;
	activeTitles: string[];
	all: UserProfileTabAllResponse;
	media: UserProfileTabMediaResponse;
	books: UserProfileTabBooksResponse;
}

export interface UserRecentFavoriteItemResponse {
	id: number;
	type: string;
	title: string;
	img: string;
	points: number;
	status: string | null;
}

export interface UserBadgeCardResponse {
	id: number;
	name: string;
	iconUrl: string | null;
	earnedAt: string;
}

export interface UserBadgeCategoryResponse {
	category: string;
	badges: UserBadgeCardResponse[];
}

export interface OwnedUserTitleResponse {
	id: number;
	name: string;
	rarity: string;
	isActive: boolean;
	earnedAt: string;
}

export interface UpdateUserSettingsParams {
	avatarDataUrl?: string | null;
	countryCode?: string | null;
	newPlainPassword?: string;
	activeTitleIds?: number[];
}

const dataUrlToRawBase64 = (value: string): string => {
	if (!value.startsWith('data:')) return value;
	const [, raw] = value.split(',', 2);
	return raw ?? value;
};

export const getUserProfile = async (userId: number): Promise<UserProfileResponse> =>
	request<UserProfileResponse>(`/api/user/${userId}/profile`);

export const getUserRecent = async (
	userId: number,
	type: 'all' | 'media' | 'books',
): Promise<UserRecentFavoriteItemResponse[]> =>
	request<UserRecentFavoriteItemResponse[]>(`/api/user/${userId}/recent/${type}`);

export const getUserFavorites = async (
	userId: number,
	type: 'all' | 'media' | 'books',
): Promise<UserRecentFavoriteItemResponse[]> =>
	request<UserRecentFavoriteItemResponse[]>(`/api/user/${userId}/favorites/${type}`);

export const getUserBadges = async (userId: number): Promise<UserBadgeCategoryResponse[]> =>
	request<UserBadgeCategoryResponse[]>(`/api/user/${userId}/badges`);

export const getOwnedUserTitles = async (): Promise<OwnedUserTitleResponse[]> =>
	request<OwnedUserTitleResponse[]>('/api/user/settings/titles', { auth: true });

export const updateUserSettings = async (params: UpdateUserSettingsParams): Promise<void> => {
	const body: {
		avatar: string | null;
		countryCode: string | null;
		newPasswordHash?: string;
		newPasswordSalt?: string;
		activeTitleIds: number[];
	} = {
		avatar: params.avatarDataUrl === undefined || params.avatarDataUrl === null
			? null
			: dataUrlToRawBase64(params.avatarDataUrl),
		countryCode: params.countryCode ?? null,
		activeTitleIds: params.activeTitleIds ?? [],
	};

	if (params.newPlainPassword && params.newPlainPassword.trim().length > 0) {
		const salt = createRandomSalt();
		body.newPasswordHash = await sha256Hex(params.newPlainPassword);
		body.newPasswordSalt = salt;
	}

	await request<{ message: string }>('/api/user/settings', {
		method: 'PATCH',
		auth: true,
		body,
	});
};

export interface ChallengeTitleRewardResponse {
	id: number;
	name: string;
	rarity: string;
}

export interface ChallengeBadgeRewardResponse {
	id: number;
	name: string;
	iconURL: string | null;
	rarity: string;
}

export interface ChallengeRewardsResponse {
	xp: number;
	title: ChallengeTitleRewardResponse | null;
	badge: ChallengeBadgeRewardResponse | null;
}

export interface ChallengeItemResponse {
	id: number;
	title: string;
	description: string;
	difficulty: string;
	type: string;
	targetValue: number;
	currentValue: number;
	status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CLAIMED';
	completedAt: string | null;
	claimedAt: string | null;
	rewards: ChallengeRewardsResponse;
}

export interface ChallengesResponse {
	counts: {
		all: number;
		active: number;
		completed: number;
		events: number;
	};
	challenges: ChallengeItemResponse[];
}

export interface ClaimChallengeResponse {
	message: string;
	challengeId: number;
	rewards: {
		xp: number;
		badge: {
			id: number;
			name: string;
			iconUrl: string | null;
			rarity: string;
		} | null;
		title: {
			id: number;
			name: string;
			rarity: string;
		} | null;
	};
	claimedAt: string;
}

export const getChallenges = async (params: {
	status?: 'all' | 'active' | 'completed' | 'events';
	type?: string;
} = {}): Promise<ChallengesResponse> => {
	const searchParams = new URLSearchParams();
	if (params.status) searchParams.set('status', params.status);
	if (params.type) searchParams.set('type', params.type);
	const query = searchParams.toString();
	const path = query.length > 0 ? `/api/challenge?${query}` : '/api/challenge';

	return request<ChallengesResponse>(path, { auth: true });
};

export const claimChallenge = async (challengeId: number): Promise<ClaimChallengeResponse> =>
	request<ClaimChallengeResponse>(`/api/challenge/${challengeId}/claim`, {
		method: 'POST',
		auth: true,
	});

export interface LeaderboardEntryResponse {
	rank: number;
	userId: number;
	username: string;
	avatar: string | null;
	countryCode: string;
	isPremium: boolean;
	points: number;
	bookCount: number;
	mediaCount: number;
	completionPct: number;
	level: number;
	dayStreak: number;
}

export interface LeaderboardResponse {
	me: LeaderboardEntryResponse;
	entries: LeaderboardEntryResponse[];
	total: number;
	page: number;
	pageSize: number;
}

export const getLeaderboard = async (params: {
	content?: 'all' | 'books' | 'media';
	region?: 'world' | 'country';
	page?: number;
	pageSize?: number;
} = {}): Promise<LeaderboardResponse> => {
	const searchParams = new URLSearchParams();
	searchParams.set('content', params.content ?? 'all');
	searchParams.set('region', params.region ?? 'world');
	searchParams.set('page', String(params.page ?? 1));
	searchParams.set('pageSize', String(params.pageSize ?? 10));

	return request<LeaderboardResponse>(`/api/leaderboard?${searchParams.toString()}`, { auth: true });
};

export type NotificationType = 'ALL' | 'SYSTEM' | 'FRIEND' | 'CHALLENGE' | 'PURCHASE';

export interface NotificationItemResponse {
	id: number;
	type: NotificationType;
	subject: string;
	message: string;
	isRead: boolean;
	createdAt: string | null;
	senderUsername: string | null;
}

export interface NotificationsResponse {
	total: number;
	unreadCount: number;
	page: number;
	pageSize: number;
	notifications: NotificationItemResponse[];
}

export const getNotifications = async (params: {
	type?: NotificationType;
	unread?: boolean;
	page?: number;
	pageSize?: number;
} = {}): Promise<NotificationsResponse> => {
	const searchParams = new URLSearchParams();
	if (params.type) searchParams.set('type', params.type);
	if (typeof params.unread === 'boolean') searchParams.set('unread', String(params.unread));
	searchParams.set('page', String(params.page ?? 1));
	searchParams.set('pageSize', String(params.pageSize ?? 100));

	return request<NotificationsResponse>(`/api/notification?${searchParams.toString()}`, { auth: true });
};

export const markNotificationAsRead = async (notificationId: number): Promise<void> => {
	await request<{ message: string }>(`/api/notification/${notificationId}/read`, {
		method: 'PATCH',
		auth: true,
	});
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
	await request<{ message: string }>('/api/notification/read-all', {
		method: 'PATCH',
		auth: true,
	});
};

export const deleteNotification = async (notificationId: number): Promise<void> => {
	await request<{ message: string }>(`/api/notification/${notificationId}`, {
		method: 'DELETE',
		auth: true,
	});
};

export interface SubscriptionInfoResponse {
	type: 'free' | 'premium';
	name: string;
	expiresAt: string | null;
}

export interface PurchaseItemResponse {
	id: number;
	purchaseDate: string | null;
	price: number | null;
	tier: string;
	purchaseStatus: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED' | null;
}

export interface SubscriptionPurchasesResponse {
	total: number;
	page: number;
	pageSize: number;
	purchases: PurchaseItemResponse[];
}

export const getSubscriptionInfo = async (): Promise<SubscriptionInfoResponse> =>
	request<SubscriptionInfoResponse>('/api/subscription/info', { auth: true });

export const getSubscriptionPurchases = async (params: {
	page?: number;
	pageSize?: number;
} = {}): Promise<SubscriptionPurchasesResponse> => {
	const searchParams = new URLSearchParams();
	searchParams.set('page', String(params.page ?? 1));
	searchParams.set('pageSize', String(params.pageSize ?? 200));

	return request<SubscriptionPurchasesResponse>(`/api/subscription/purchases?${searchParams.toString()}`, {
		auth: true,
	});
};

// ========================
// VÁSÁRLÁS (PURCHASE)
// ========================

export interface CreatePurchaseResponse {
	message: string;
	purchaseId: number;
	tier: string;
	price: number;
	expiresAt: string;
}

export const createPurchase = async (tier: string): Promise<CreatePurchaseResponse> =>
	request<CreatePurchaseResponse>('/api/subscription/purchase', {
		method: 'POST',
		auth: true,
		body: { tier },
	});

// ========================
// ADMIN VÉGPONTOK
// ========================

export interface AdminOverviewStatResponse {
	label: string;
	value: string;
	change: string;
	changeType: 'up' | 'down' | 'neutral';
	icon: string;
	color: string;
}

export interface AdminOverviewActivityResponse {
	icon: string;
	color: string;
	text: string;
	timestamp: string;
}

export interface AdminOverviewResponse {
	stats: AdminOverviewStatResponse[];
	activities: AdminOverviewActivityResponse[];
}

export const getAdminOverview = async (): Promise<AdminOverviewResponse> =>
	request<AdminOverviewResponse>('/api/admin/overview', { auth: true });

export interface AdminUserItemResponse {
	id: number;
	username: string;
	email: string;
	avatar: string | null;
	permissionLevel: string;
	premium: boolean;
	premiumExpiresAt: string | null;
	level: number;
	xp: number;
	countryCode: string;
	creationDate: string;
	lastLoginDate: string;
	dayStreak: number;
	readTimeMin: number;
	watchTimeMin: number;
	bookPoints: number;
	seriesPoints: number;
	moviePoints: number;
}

export interface AdminUsersResponse {
	total: number;
	page: number;
	pageSize: number;
	users: AdminUserItemResponse[];
	summary: {
		totalUsers: number;
		premium: number;
		staff: number;
		banned: number;
		activeToday: number;
	};
}

export interface AdminManagedContentItemResponse {
	id: number;
	contentType: 'BOOK' | 'MOVIE' | 'SERIES';
	title: string;
	released: number;
	rating: number;
	description: string;
	ageRatingId: number | null;
	trailerUrl: string | null;
	rewardXP: number;
	rewardPoints: number;
	hasSubtitles: boolean;
	isOriginalLanguage: boolean;
	isOfflineAvailable: boolean;
	updatedAt: string | null;
	coverOrPosterApiName: string;
	pageNum: number | null;
	bookType: 'BOOK' | 'AUDIOBOOK' | 'EBOOK' | null;
	pdfUrl: string | null;
	audioUrl: string | null;
	epubUrl: string | null;
	audioLength: number | null;
	narratorName: string | null;
	originalLanguage: string | null;
	streamUrl: string | null;
	length: number | null;
	tagIds: number[];
}

export interface AdminContentSummaryResponse {
	total: number;
	books: number;
	series: number;
	movies: number;
}

export interface AdminManagedContentResponse {
	total: number;
	page: number;
	pageSize: number;
	content: AdminManagedContentItemResponse[];
	summary: AdminContentSummaryResponse;
}

export interface AdminContentTagOptionResponse {
	id: number;
	name: string;
}

export interface AdminAgeRatingOptionResponse {
	id: number;
	name: string;
	minAge: number;
}

export interface AdminContentOptionsResponse {
	tags: AdminContentTagOptionResponse[];
	ageRatings: AdminAgeRatingOptionResponse[];
}

export interface UpdateAdminContentPayload {
	title: string;
	released: number;
	rating: number;
	description: string;
	ageRatingId: number | null;
	trailerUrl: string | null;
	rewardXP: number;
	rewardPoints: number;
	hasSubtitles: boolean;
	isOriginalLanguage: boolean;
	isOfflineAvailable: boolean;
	coverOrPosterApiName: string;
	pageNum: number | null;
	bookType: 'BOOK' | 'AUDIOBOOK' | 'EBOOK' | null;
	pdfUrl: string | null;
	audioUrl: string | null;
	epubUrl: string | null;
	audioLength: number | null;
	narratorName: string | null;
	originalLanguage: string | null;
	streamUrl: string | null;
	length: number | null;
	tagIds: number[];
}

export const getAdminUsers = async (params: {
	page?: number;
	pageSize?: number;
	userType?: 'all' | 'premium' | 'staff' | 'banned';
	q?: string;
} = {}): Promise<AdminUsersResponse> => {
	const searchParams = new URLSearchParams();
	searchParams.set('page', String(params.page ?? 1));
	searchParams.set('pageSize', String(params.pageSize ?? 20));
	if (params.userType) searchParams.set('userType', params.userType);
	if (params.q) searchParams.set('q', params.q);

	return request<AdminUsersResponse>(`/api/admin/users?${searchParams.toString()}`, { auth: true });
};

export const getAdminContent = async (params: {
	page?: number;
	pageSize?: number;
	type?: 'BOOK' | 'MOVIE' | 'SERIES';
	q?: string;
} = {}): Promise<AdminManagedContentResponse> => {
	const searchParams = new URLSearchParams();
	searchParams.set('page', String(params.page ?? 1));
	searchParams.set('pageSize', String(params.pageSize ?? 20));
	if (params.type) searchParams.set('type', params.type);
	if (params.q && params.q.trim().length > 0) searchParams.set('q', params.q.trim());

	return request<AdminManagedContentResponse>(`/api/admin/content?${searchParams.toString()}`, { auth: true });
};

export const getAdminContentOptions = async (): Promise<AdminContentOptionsResponse> =>
	request<AdminContentOptionsResponse>('/api/admin/content/options', { auth: true });

export const updateAdminContent = async (
	type: 'BOOK' | 'MOVIE' | 'SERIES',
	id: number,
	payload: UpdateAdminContentPayload,
): Promise<AdminManagedContentItemResponse> =>
	request<AdminManagedContentItemResponse>(`/api/admin/content/${type.toLowerCase()}/${id}`, {
		auth: true,
		method: 'PUT',
		body: payload,
	});

export interface UpdateAdminUserPayload {
	permissionLevel: 'USER' | 'MODERATOR' | 'ADMIN' | 'BANNED';
	premium: boolean;
	premiumExpiresAt: string | null;
	level: number;
	xp: number;
	countryCode: string;
	dayStreak: number;
	readTimeMin: number;
	watchTimeMin: number;
	bookPoints: number;
	seriesPoints: number;
	moviePoints: number;
}

export const updateAdminUser = async (
	id: number,
	payload: UpdateAdminUserPayload,
): Promise<AdminUserItemResponse> =>
	request<AdminUserItemResponse>(`/api/admin/users/${id}`, {
		auth: true,
		method: 'PUT',
		body: payload,
	});

export interface AdminPurchaseItemResponse {
	id: number;
	userId: number;
	username: string;
	email: string;
	purchaseDate: string | null;
	price: number | null;
	tier: string;
	purchaseStatus: string | null;
	updatedAt: string | null;
}

export interface AdminPurchasesResponse {
	total: number;
	page: number;
	pageSize: number;
	purchases: AdminPurchaseItemResponse[];
}

export const getAdminPurchases = async (params: {
	page?: number;
	pageSize?: number;
	status?: string;
	q?: string;
} = {}): Promise<AdminPurchasesResponse> => {
	const searchParams = new URLSearchParams();
	searchParams.set('page', String(params.page ?? 1));
	searchParams.set('pageSize', String(params.pageSize ?? 20));
	if (params.status) searchParams.set('status', params.status);
	if (params.q && params.q.trim().length > 0) searchParams.set('q', params.q.trim());

	return request<AdminPurchasesResponse>(`/api/admin/purchases?${searchParams.toString()}`, { auth: true });
};

export interface AdminChallengeItemResponse {
	id: number;
	title: string;
	description: string;
	iconUrl: string | null;
	type: 'READ' | 'WATCH' | 'SOCIAL' | 'MIXED' | 'DEDICATION' | 'EVENT';
	targetValue: number;
	rewardXP: number;
	rewardBadgeId: number | null;
	rewardTitleId: number | null;
	difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EPIC';
	isActive: boolean;
	isRepeatable: boolean;
	createdAt: string;
	participants: number;
	completions: number;
}

export interface AdminChallengeSummaryResponse {
	total: number;
	active: number;
	repeatable: number;
	event: number;
}

export interface AdminChallengesResponse {
	total: number;
	page: number;
	pageSize: number;
	challenges: AdminChallengeItemResponse[];
	summary: AdminChallengeSummaryResponse;
}

export interface AdminChallengeBadgeOptionResponse {
	id: number;
	name: string;
	category: string;
	rarity: string;
	isHidden: boolean;
}

export interface AdminChallengeTitleOptionResponse {
	id: number;
	name: string;
	description: string | null;
	rarity: string;
}

export interface AdminChallengeOptionsResponse {
	badges: AdminChallengeBadgeOptionResponse[];
	titles: AdminChallengeTitleOptionResponse[];
}

export interface UpdateAdminChallengePayload {
	title: string;
	description: string;
	type: 'READ' | 'WATCH' | 'SOCIAL' | 'MIXED' | 'DEDICATION' | 'EVENT';
	targetValue: number;
	rewardXP: number;
	rewardBadgeId: number | null;
	rewardTitleId: number | null;
	difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EPIC';
	isActive: boolean;
	isRepeatable: boolean;
}

export const getAdminChallenges = async (params: {
	page?: number;
	pageSize?: number;
	type?: 'READ' | 'WATCH' | 'SOCIAL' | 'MIXED' | 'DEDICATION' | 'EVENT';
	q?: string;
} = {}): Promise<AdminChallengesResponse> => {
	const searchParams = new URLSearchParams();
	searchParams.set('page', String(params.page ?? 1));
	searchParams.set('pageSize', String(params.pageSize ?? 20));
	if (params.type) searchParams.set('type', params.type);
	if (params.q && params.q.trim().length > 0) searchParams.set('q', params.q.trim());

	return request<AdminChallengesResponse>(`/api/admin/challenges?${searchParams.toString()}`, { auth: true });
};

export const getAdminChallengeOptions = async (): Promise<AdminChallengeOptionsResponse> =>
	request<AdminChallengeOptionsResponse>('/api/admin/challenges/options', { auth: true });

export const updateAdminChallenge = async (
	id: number,
	payload: UpdateAdminChallengePayload,
): Promise<AdminChallengeItemResponse> =>
	request<AdminChallengeItemResponse>(`/api/admin/challenges/${id}`, {
		auth: true,
		method: 'PUT',
		body: payload,
	});
