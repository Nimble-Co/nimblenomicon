/**
 * URL helpers for Astro `base` and Starlight trailing-slash behavior.
 */

/** `import.meta.env.BASE_URL` without a trailing slash (`''` at site root). */
export function normalizeBaseUrl(baseUrl: string): string {
	return baseUrl.replace(/\/$/, '');
}

export type StarlightTrailingSlash = 'always' | 'never' | 'ignore';

/**
 * Absolute path to the game-data search page (`GET ?q=`), respecting Starlight’s
 * `trailingSlash` setting so form actions match emitted routes.
 */
export function searchPageUrl(
	baseUrl: string,
	trailingSlash: StarlightTrailingSlash,
): string {
	const base = normalizeBaseUrl(baseUrl);
	const path = `${base}/search`;
	return trailingSlash === 'always' ? `${path}/` : path;
}
