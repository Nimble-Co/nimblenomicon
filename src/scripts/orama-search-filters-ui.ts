/**
 * Pure helpers for search filter UI state (monster tri-toggles, etc.).
 */
import type { SearchFiltersState } from '../models/search-filters';

function toggleStringInList(list: string[], value: string): string[] {
	const s = new Set(list);
	if (s.has(value)) s.delete(value);
	else s.add(value);
	return [...s].sort();
}

export function patchSearchFiltersState(
	prev: SearchFiltersState,
	action:
		| { kind: 'toggle-multi'; dim: keyof SearchFiltersState; value: string }
		| {
				kind: 'toggle-tri';
				dim: 'minion' | 'legendary';
		  },
): SearchFiltersState {
	const next = { ...prev };
	if (action.kind === 'toggle-multi') {
		const dim = action.dim;
		if (
			dim === 'tier' ||
			dim === 'school' ||
			dim === 'target' ||
			dim === 'level' ||
			dim === 'family' ||
			dim === 'kind' ||
			dim === 'armor' ||
			dim === 'speed' ||
			dim === 'size' ||
			dim === 'stat' ||
			dim === 'hitdie' ||
			dim === 'category' ||
			dim === 'section' ||
			dim === 'source' ||
			dim === 'reward' ||
			dim === 'book'
		) {
			const cur = prev[dim] as string[];
			(next as SearchFiltersState)[dim] = toggleStringInList(cur, action.value);
		}
		return next;
	}
	const dim = action.dim;
	const cur = prev[dim] as boolean | null;
	let nextVal: boolean | null;
	if (cur === null) nextVal = true;
	else if (cur === true) nextVal = false;
	else nextVal = null;
	(next as SearchFiltersState)[dim] = nextVal;
	return next;
}
