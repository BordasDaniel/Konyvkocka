import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import {
	SESSION_STORAGE_KEY,
	authLogin,
	authLogout,
	authMe,
	authRegister,
	mapUserMeToUiUser,
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

	// Bejelentkezés ellenőrzése app indulásakor
	useEffect(() => {
		const checkAuth = async () => {
			try {
				const token = localStorage.getItem(SESSION_STORAGE_KEY);
				if (!token) return;

				const me = await authMe();
				const mappedUser = mapUserMeToUiUser(me);
				setUser(mappedUser);
				localStorage.setItem('kk_user', JSON.stringify(mappedUser));
			} catch (error) {
				console.error('Auth check failed:', error);
				localStorage.removeItem(SESSION_STORAGE_KEY);
				localStorage.removeItem('kk_user');
				setUser(null);
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
				const savedUser = localStorage.getItem('kk_user');
				setUser(savedUser ? JSON.parse(savedUser) : null);
			} catch (error) {
				console.error('Failed to refresh user from storage:', error);
			}
		};

		const onUserUpdated = () => refreshFromStorage();
		const onStorage = (event: StorageEvent) => {
			if (event.key === 'kk_user') {
				refreshFromStorage();
			}
		};

		window.addEventListener('kk_user_updated', onUserUpdated as EventListener);
		window.addEventListener('storage', onStorage);
		return () => {
			window.removeEventListener('kk_user_updated', onUserUpdated as EventListener);
			window.removeEventListener('storage', onStorage);
		};
	}, []);

	// Bejelentkezés
	const login = async (email: string, password: string): Promise<boolean> => {
		try {
			const response = await authLogin(email, password);
			const mappedUser = mapUserMeToUiUser(response.user);

			setUser(mappedUser);
			localStorage.setItem('kk_user', JSON.stringify(mappedUser));
			localStorage.setItem(SESSION_STORAGE_KEY, response.token);
			return true;
		} catch (error) {
			console.error('Login failed:', error);
			return false;
		}
	};

	// Regisztráció
	const register = async (username: string, email: string, password: string): Promise<boolean> => {
		try {
			const response = await authRegister(username, email, password);
			const mappedUser = mapUserMeToUiUser(response.user);

			setUser(mappedUser);
			localStorage.setItem('kk_user', JSON.stringify(mappedUser));
			localStorage.setItem(SESSION_STORAGE_KEY, response.token);
			return true;
		} catch (error) {
			console.error('Register failed:', error);
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
		isAuthenticated: !!user,
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
