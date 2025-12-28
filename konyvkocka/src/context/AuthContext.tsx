import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

// ========================
// TÍPUSOK
// ========================

interface User {
	id: number;
	username: string;
	email: string;
	avatar: string;
	isSubscriber: boolean;
}

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
				// TODO: API hívás: const response = await fetch('/api/auth/me');
				const savedUser = localStorage.getItem('kk_user');
				if (savedUser) {
					setUser(JSON.parse(savedUser));
				}
			} catch (error) {
				console.error('Auth check failed:', error);
			} finally {
				setIsLoading(false);
			}
		};

		checkAuth();
	}, []);

	// Bejelentkezés
	const login = async (email: string, password: string): Promise<boolean> => {
		try {
			// TODO: Lecserélni API hívásra:
			// const response = await fetch('/api/auth/login', {
			//   method: 'POST',
			//   headers: { 'Content-Type': 'application/json' },
			//   body: JSON.stringify({ email, password })
			// });
			// const data = await response.json();

			// Mock login - siker ha van email és password
			if (email && password) {
				const mockUser: User = {
					id: 1,
					username: 'BordasDaniel',
					email: email,
					avatar: 'https://i.pinimg.com/236x/5a/bd/98/5abd985735a8fd4adcb0e795de6a1005.jpg',
					isSubscriber: true,
				};

				setUser(mockUser);
				localStorage.setItem('kk_user', JSON.stringify(mockUser));
				localStorage.setItem('kk_session', 'mock_session_token');
				return true;
			}

			return false;
		} catch (error) {
			console.error('Login failed:', error);
			return false;
		}
	};

	// Regisztráció
	const register = async (username: string, email: string, password: string): Promise<boolean> => {
		try {
			// TODO: Lecserélni API hívásra:
			// const response = await fetch('/api/auth/register', {
			//   method: 'POST',
			//   headers: { 'Content-Type': 'application/json' },
			//   body: JSON.stringify({ username, email, password })
			// });

			if (username && email && password) {
				const mockUser: User = {
					id: 1,
					username: username,
					email: email,
					avatar: 'https://i.pinimg.com/236x/5a/bd/98/5abd985735a8fd4adcb0e795de6a1005.jpg',
					isSubscriber: false,
				};

				setUser(mockUser);
				localStorage.setItem('kk_user', JSON.stringify(mockUser));
				localStorage.setItem('kk_session', 'mock_session_token');
				return true;
			}

			return false;
		} catch (error) {
			console.error('Register failed:', error);
			return false;
		}
	};

	// Kijelentkezés
	const logout = () => {
		// TODO: API hívás: await fetch('/api/auth/logout', { method: 'POST' });
		setUser(null);
		localStorage.removeItem('kk_user');
		localStorage.removeItem('kk_session');
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
