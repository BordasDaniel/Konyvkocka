type RouteLoader = () => Promise<unknown>;

const routeLoaders: Record<string, RouteLoader> = {
	'/': () => import('../pages/Home.tsx'),
	'/rolunk': () => import('../pages/About.tsx'),
	'/aszf': () => import('../pages/Aszf.tsx'),
	'/belepes': () => import('../pages/Login.tsx'),
	'/kereses': () => import('../pages/Search.tsx'),
	'/hirek': () => import('../pages/News.tsx'),
	'/konyvtaram': () => import('../pages/Library.tsx'),
	'/elozmenyeim': () => import('../pages/History.tsx'),
	'/ertesitesek': () => import('../pages/Notifications.tsx'),
	'/kihivasok': () => import('../pages/Challenges.tsx'),
	'/tamogatas': () => import('../pages/Support.tsx'),
	'/fizetes': () => import('../pages/Payment.tsx'),
	'/vasarlas': () => import('../pages/Subscription.tsx'),
	'/ranglista': () => import('../pages/Leaderboard.tsx'),
	'/olvaso': () => import('../pages/Reader.tsx'),
	'/nezes': () => import('../pages/Watch.tsx'),
	'/profil': () => import('../pages/User.tsx'),
	'/admin': () => import('../pages/Admin.tsx'),
	'/jelszo-visszaallitas': () => import('../pages/ResetPassword.tsx'),
};

const prefetchedRoutes = new Set<string>();

const normalizeRoutePath = (rawPath: string): string => {
	if (!rawPath) return '/';
	if (rawPath.startsWith('/profil/')) return '/profil';
	return rawPath;
};

export const prefetchRoute = async (rawPath: string): Promise<void> => {
	const path = normalizeRoutePath(rawPath);
	const loader = routeLoaders[path];
	if (!loader) return;
	if (prefetchedRoutes.has(path)) return;

	prefetchedRoutes.add(path);
	try {
		await loader();
	} catch {
		prefetchedRoutes.delete(path);
	}
};
