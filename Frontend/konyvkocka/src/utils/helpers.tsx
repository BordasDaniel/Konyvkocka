const parseYouTubeTimeToSeconds = (value: string | null): number | null => {
	if (!value) return null;

	if (/^\d+$/.test(value)) {
		return Number(value);
	}

	const match = value.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
	if (!match) return null;

	const hours = Number(match[1] ?? 0);
	const minutes = Number(match[2] ?? 0);
	const seconds = Number(match[3] ?? 0);
	const total = hours * 3600 + minutes * 60 + seconds;

	return Number.isFinite(total) && total > 0 ? total : null;
};

const extractYouTubeId = (url: URL): string | null => {
	const host = url.hostname.toLowerCase();
	const pathParts = url.pathname.split('/').filter(Boolean);

	if (host === 'youtu.be') {
		return pathParts[0] ?? null;
	}

	if (host.endsWith('youtube.com')) {
		if (pathParts[0] === 'watch') {
			return url.searchParams.get('v');
		}

		if (pathParts[0] === 'embed') {
			return pathParts[1] ?? null;
		}

		if (pathParts[0] === 'shorts') {
			return pathParts[1] ?? null;
		}
	}

	return null;
};

export const toEmbedVideoUrl = (rawUrl: string | null | undefined): string => {
	if (!rawUrl) return '';

	const trimmed = rawUrl.trim();
	if (!trimmed) return '';

	let parsed: URL;
	try {
		parsed = new URL(trimmed);
	} catch {
		return trimmed;
	}

	const youtubeId = extractYouTubeId(parsed);
	if (!youtubeId) {
		return trimmed;
	}

	const embedUrl = new URL(`https://www.youtube-nocookie.com/embed/${youtubeId}`);
	const startFromStart = parseYouTubeTimeToSeconds(parsed.searchParams.get('start'));
	const startFromT = parseYouTubeTimeToSeconds(parsed.searchParams.get('t'));
	const startSeconds = startFromStart ?? startFromT;

	if (startSeconds && startSeconds > 0) {
		embedUrl.searchParams.set('start', String(startSeconds));
	}

	embedUrl.searchParams.set('rel', '0');
	embedUrl.searchParams.set('modestbranding', '1');
	embedUrl.searchParams.set('playsinline', '1');

	return embedUrl.toString();
};
