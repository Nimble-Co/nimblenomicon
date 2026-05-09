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

/** Core Rules single-page anchor for a JSON entity id (detail `sourceHref`). */
export function coreRulesDocHref(entityId: string): string {
	return `/core-rules/#${entityId}`;
}

/** Game Master's Guide single-page anchor for a JSON entity id. */
export function gameMastersGuideDocHref(entityId: string): string {
	return `/game-masters-guide/#${entityId}`;
}

/** Heroes doc anchor for a class or other entity id. */
export function heroesDocHref(entityId: string): string {
	return `/heroes/#${entityId}`;
}
