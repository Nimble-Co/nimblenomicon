/**
 * URL sync for the full-page game data search (`/search/`).
 */
import {
	applySearchFiltersToParams,
	parseSearchFiltersFromParams,
	stripSearchFilterParamsNotForType,
	type SearchFiltersState,
} from '../models/search-filters';
import {
	isOramaDataSearchType,
	type OramaDataSearchType,
} from '../constants/orama-data-search';

export const SEARCH_URL_UPDATE_EVENT = 'nimble-search-url-update';

export function parseTypeFromSearchParams(
	params: URLSearchParams,
): OramaDataSearchType | null {
	const raw = params.get('type')?.trim().toLowerCase();
	if (!raw) return null;
	return isOramaDataSearchType(raw) ? raw : null;
}

export function readSearchPageParams(): {
	q: string;
	type: OramaDataSearchType | null;
	filters: SearchFiltersState;
} {
	const params = new URLSearchParams(window.location.search);
	const q = params.get('q')?.trim() ?? '';
	const type = parseTypeFromSearchParams(params);
	const filters = parseSearchFiltersFromParams(type, params);
	return { q, type, filters };
}

export function stripInvalidTypeFromUrl(): void {
	const params = new URLSearchParams(window.location.search);
	const raw = params.get('type')?.trim();
	if (!raw) return;
	if (isOramaDataSearchType(raw.toLowerCase())) return;
	params.delete('type');
	const query = params.toString();
	const next = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`;
	window.history.replaceState({}, '', next);
}

function dispatchSearchUrlUpdated(): void {
	window.dispatchEvent(new CustomEvent(SEARCH_URL_UPDATE_EVENT));
}

export function setSearchPageUrl(
	q: string,
	type: OramaDataSearchType | null,
	filters: SearchFiltersState,
	options?: { replace?: boolean },
): void {
	const params = new URLSearchParams(window.location.search);
	if (q.length > 0) params.set('q', q);
	else params.delete('q');
	if (type) params.set('type', type);
	else params.delete('type');
	stripSearchFilterParamsNotForType(params, type);
	applySearchFiltersToParams(type, filters, params);
	const query = params.toString();
	const next = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`;
	if (
		next !==
		`${window.location.pathname}${window.location.search}${window.location.hash}`
	) {
		const method = options?.replace ? 'replaceState' : 'pushState';
		window.history[method]({}, '', next);
	}
	dispatchSearchUrlUpdated();
}
