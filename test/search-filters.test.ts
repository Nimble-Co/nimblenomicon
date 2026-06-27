import { describe, expect, it } from 'vitest';
import {
	applySearchFiltersToParams,
	clearAllSearchFilterParams,
	clearMultiFilterDim,
	cycleTriStateFilter,
	emptySearchFiltersState,
	hasAnyActiveFilters,
	parseSearchFiltersFromParams,
	setMultiFilterValue,
} from '../src/models/search-filters';

describe('search-filters URL helpers', () => {
	it('round-trips spell filters as comma-separated lists', () => {
		const state = emptySearchFiltersState();
		state.tier = ['0', '1'];
		state.school = ['fire-spell-school', 'ice-spell-school'];
		state.utility = true;
		const params = new URLSearchParams();
		params.set('q', 'bolt');
		params.set('type', 'spell');
		applySearchFiltersToParams('spell', state, params);
		expect(params.get('tier')).toBe('0,1');
		expect(params.get('school')).toBe('fire-spell-school,ice-spell-school');
		expect(params.get('utility')).toBe('1');
		const parsed = parseSearchFiltersFromParams('spell', params);
		expect(parsed.tier).toEqual(['0', '1']);
		expect(parsed.school).toEqual(['fire-spell-school', 'ice-spell-school']);
		expect(parsed.utility).toBe(true);
	});

	it('clearAllSearchFilterParams keeps q and type', () => {
		const params = new URLSearchParams();
		params.set('q', 'test');
		params.set('type', 'spell');
		params.set('tier', '1,2');
		params.set('school', 'fire-spell-school');
		clearAllSearchFilterParams(params);
		expect(params.get('q')).toBe('test');
		expect(params.get('type')).toBe('spell');
		expect(params.get('tier')).toBeNull();
		expect(params.get('school')).toBeNull();
	});

	it('hasAnyActiveFilters is false for empty spell state', () => {
		const s = emptySearchFiltersState();
		expect(hasAnyActiveFilters('spell', s)).toBe(false);
		s.tier.push('1');
		expect(hasAnyActiveFilters('spell', s)).toBe(true);
	});

	it('defaults spell utility to unfiltered when URL omits utility', () => {
		const params = new URLSearchParams();
		params.set('type', 'spell');
		const parsed = parseSearchFiltersFromParams('spell', params);
		expect(parsed.utility).toBeNull();
	});

	it('hasAnyActiveFilters reflects spell utility when not default', () => {
		const s = emptySearchFiltersState();
		expect(hasAnyActiveFilters('spell', s)).toBe(false);
		s.utility = true;
		expect(hasAnyActiveFilters('spell', s)).toBe(true);
		s.utility = null;
		expect(hasAnyActiveFilters('spell', s)).toBe(false);
		s.utility = false;
		expect(hasAnyActiveFilters('spell', s)).toBe(true);
	});

	it('cycleTriStateFilter advances minion/legendary tri-state', () => {
		expect(cycleTriStateFilter(null)).toBe(true);
		expect(cycleTriStateFilter(true)).toBe(false);
		expect(cycleTriStateFilter(false)).toBe(null);
	});

	it('clearMultiFilterDim empties one dimension only', () => {
		let s = emptySearchFiltersState();
		s = setMultiFilterValue(s, 'tier', '1', true);
		s = setMultiFilterValue(s, 'school', 'fire-spell-school', true);
		s = clearMultiFilterDim(s, 'tier');
		expect(s.tier).toEqual([]);
		expect(s.school).toEqual(['fire-spell-school']);
	});

	it('setMultiFilterValue adds and removes without toggling', () => {
		let s = emptySearchFiltersState();
		s = setMultiFilterValue(s, 'tier', '1', true);
		expect(s.tier).toEqual(['1']);
		s = setMultiFilterValue(s, 'tier', '2', true);
		expect(s.tier).toEqual(['1', '2']);
		s = setMultiFilterValue(s, 'tier', '1', false);
		expect(s.tier).toEqual(['2']);
	});
});
