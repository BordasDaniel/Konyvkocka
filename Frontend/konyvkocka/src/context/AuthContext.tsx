import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import {
	ApiHttpError,
	SESSION_STORAGE_KEY,
	authLogin,
	authLogout,
	authMe,
	authRegister,
	mapUserMeToUiUser,
	toAvatarSrc,
	type UiAuthUser,
} from '../services/api';

// ========================
// TÍPUSOK
// ========================

type User = UiAuthUser;

interface AuthContextType {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	login: (email: string, password: string) => Promise<boolean>;
	register: (username: string, email: string, password: string) => Promise<boolean>;
	logout: () => void;
}

// ========================
// CONTEXT
// ========================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ========================
// PROVIDER
// ========================

interface AuthProviderProps {
	children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const hasValidSessionToken = (): boolean => {
		const token = localStorage.getItem(SESSION_STORAGE_KEY);
		return typeof token === 'string' && token.trim().length > 0;
	};

	const normalizeStoredUser = (raw: string): User | null => {
		try {
			const parsed = JSON.parse(raw) as Partial<User>;
			if (typeof parsed.id !== 'number') return null;
			if (typeof parsed.username !== 'string' || parsed.username.trim().length === 0) return null;
			if (typeof parsed.email !== 'string' || parsed.email.trim().length === 0) return null;

			return {
				id: parsed.id,
				username: parsed.username,
				email: parsed.email,
				avatar: toAvatarSrc(typeof parsed.avatar === 'string' ? parsed.avatar : null),
				isSubscriber: Boolean(parsed.isSubscriber),
				isAdmin: Boolean(parsed.isAdmin),
			};
		} catch {
			return null;
		}
	};

	const createStorageSafeUser = (value: User): User => {
		const avatar = value.avatar;
		if (!avatar) return { ...value, avatar: toAvatarSrc(null) };
		if (avatar.startsWith('data:')) return { ...value, avatar: toAvatarSrc(null) };
		if (avatar.length > 2048) return { ...value, avatar: toAvatarSrc(null) };
		return value;
	};

	const persistUserSafely = (value: User): void => {
		const safeUser = createStorageSafeUser(value);
		try {
			localStorage.setItem('kk_user', JSON.stringify(safeUser));
		} catch (error) {
			const quotaExceeded = error instanceof DOMException && error.name === 'QuotaExceededError';
			if (quotaExceeded) {
				try {
					localStorage.removeItem('kk_profile_settings');
					localStorage.setItem('kk_user', JSON.stringify({ ...safeUser, avatar: toAvatarSrc(null) }));
					return;
				} catch (retryError) {
					console.error('Failed to persist kk_user after quota recovery:', retryError);
				}
			}

			console.error('Failed to persist kk_user:', error);
		}
	};

	// Bejelentkezés ellenőrzése app indulásakor
	useEffect(() => {
		const checkAuth = async () => {
			try {
				const token = localStorage.getItem(SESSION_STORAGE_KEY);
				if (!token) return;

				const me = await authMe();
				const mappedUser = mapUserMeToUiUser(me);
				setUser(mappedUser);
				persistUserSafely(mappedUser);
			} catch (error) {
				console.error('Auth check failed:', error);
				const unauthorized = error instanceof ApiHttpError && (error.status === 401 || error.status === 403);
				if (unauthorized) {
					localStorage.removeItem(SESSION_STORAGE_KEY);
					localStorage.removeItem('kk_user');
					setUser(null);
				} else {
					try {
						const savedUser = localStorage.getItem('kk_user');
						if (savedUser) {
							setUser(normalizeStoredUser(savedUser));
						}
					} catch (parseError) {
						console.error('Failed to restore user from storage after auth error:', parseError);
					}
				}
			} finally {
				setIsLoading(false);
			}
		};

		checkAuth();
	}, []);

	// Keep navbar/user state in sync when kk_user changes in-app.
	useEffect(() => {
		const refreshFromStorage = () => {
			try {
				if (!hasValidSessionToken()) {
					setUser(null);
					return;
				}

				const savedUser = localStorage.getItem('kk_user');
				setUser(savedUser ? normalizeStoredUser(savedUser) : null);
			} catch (error) {
				console.error('Failed to refresh user from storage:', error);
				setUser(null);
			}
		};

		const onAvatarUpdated = (event: Event) => {
			if (!hasValidSessionToken()) {
				setUser(null);
				return;
			}

			const customEvent = event as CustomEvent<{ avatar?: string | null }>;
			const avatar = customEvent.detail?.avatar;
			if (!avatar) return;

			setUser((previous) => {
				if (!previous) return previous;
				return { ...previous, avatar };
			});
		};

		const onUserUpdated = () => refreshFromStorage();
		const onStorage = (event: StorageEvent) => {
			if (event.key === 'kk_user') {
				refreshFromStorage();
			}
		};

		window.addEventListener('kk_user_updated', onUserUpdated as EventListener);
		window.addEventListener('kk_user_avatar_updated', onAvatarUpdated as EventListener);
		window.addEventListener('storage', onStorage);
		return () => {
			window.removeEventListener('kk_user_updated', onUserUpdated as EventListener);
			window.removeEventListener('kk_user_avatar_updated', onAvatarUpdated as EventListener);
			window.removeEventListener('storage', onStorage);
		};
	}, []);

	// Bejelentkezés
	const login = async (email: string, password: string): Promise<boolean> => {
		try {
			const response = await authLogin(email, password);
			const mappedUser = mapUserMeToUiUser(response.user);

			localStorage.setItem(SESSION_STORAGE_KEY, response.token);
			setUser(mappedUser);
			persistUserSafely(mappedUser);
			return true;
		} catch (error) {
			console.error('Login failed:', error);
			setUser(null);
			localStorage.removeItem('kk_user');
			localStorage.removeItem(SESSION_STORAGE_KEY);
			return false;
		}
	};

	// Regisztráció
	const register = async (username: string, email: string, password: string): Promise<boolean> => {
		try {
			const response = await authRegister(username, email, password);
			const mappedUser = mapUserMeToUiUser(response.user);

			localStorage.setItem(SESSION_STORAGE_KEY, response.token);
			setUser(mappedUser);
			persistUserSafely(mappedUser);
			return true;
		} catch (error) {
			console.error('Register failed:', error);
			setUser(null);
			localStorage.removeItem('kk_user');
			localStorage.removeItem(SESSION_STORAGE_KEY);
			return false;
		}
	};

	// Kijelentkezés
	const logout = () => {
		authLogout().catch((error) => {
			console.error('Logout request failed:', error);
		});
		setUser(null);
		localStorage.removeItem('kk_user');
		localStorage.removeItem(SESSION_STORAGE_KEY);
	};

	const value: AuthContextType = {
		user,
		isAuthenticated: !!user && hasValidSessionToken(),
		isLoading,
		login,
		register,
		logout,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ========================
// HOOK
// ========================

export const useAuth = (): AuthContextType => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
};

export default AuthContext;
