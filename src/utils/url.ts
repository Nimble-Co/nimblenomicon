/**
 * URL helpers for Astro `base` and Starlight trailing-slash behavior.
 */

import type { OramaDataSearchType } from '../constants/orama-data-search';

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

/**
 * True when `pathname` is the game-data search route (with or without a trailing slash),
 * e.g. `/search`, `/search/`, `/docs/search`. Use for client-side URL checks where
 * Starlight’s `trailingSlash` may vary.
 */
export function pathnameIsGameDataSearchPage(pathname: string): boolean {
	return /\/search\/?$/.test(pathname);
}

/**
 * Game-data search with an optional type filter (`?type=`), e.g. browse-all spells.
 */
export function dataSearchBrowseUrl(
	baseUrl: string,
	trailingSlash: StarlightTrailingSlash,
	type: OramaDataSearchType,
): string {
	const path = searchPageUrl(baseUrl, trailingSlash);
	const params = new URLSearchParams();
	params.set('type', type);
	return `${path}?${params.toString()}`;
}
