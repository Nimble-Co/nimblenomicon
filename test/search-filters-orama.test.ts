import { describe, expect, it } from 'vitest';
import {
	buildOramaWhereForFilters,
	classKeyStatsRowMatches,
	documentMatchesFilters,
	emptySearchFiltersState,
} from '../src/models/search-filters';
import {
	emptyOramaFilterFields,
	type SearchableGameDataDoc,
} from '../src/models/orama-game-data-index';

function spellDoc(
	overrides: Partial<SearchableGameDataDoc> = {},
): SearchableGameDataDoc {
	return {
		id: 'spell-test',
		type: 'spell',
		title: 'Test Spell',
		content: '',
		href: '/spells/test/',
		subtitle: '',
		cardJson: '',
		...emptyOramaFilterFields(),
		spellTier: '1',
		spellSchool: 'fire-spell-school',
		spellTarget: 'single-target',
		spellUtility: '0',
		spellSecret: '0',
		...overrides,
	};
}

function classDoc(
	overrides: Partial<SearchableGameDataDoc> = {},
): SearchableGameDataDoc {
	return {
		id: 'class-test',
		type: 'class',
		title: 'Test Class',
		content: '',
		href: '/classes/test/',
		subtitle: '',
		cardJson: '',
		...emptyOramaFilterFields(),
		classKeyStats: 'dexterity,strength',
		classHitDie: '1d10',
		...overrides,
	};
}

describe('buildOramaWhereForFilters', () => {
	it('returns type-only where when spell filters are empty', () => {
		expect(
			buildOramaWhereForFilters('spell', emptySearchFiltersState()),
		).toEqual({ type: 'spell' });
	});

	it('combines spell tier and school with and', () => {
		const filters = emptySearchFiltersState();
		filters.tier = ['0', '1'];
		filters.school = ['fire-spell-school'];
		expect(buildOramaWhereForFilters('spell', filters)).toEqual({
			and: [
				{ type: 'spell' },
				{ or: [{ spellTier: '0' }, { spellTier: '1' }] },
				{ spellSchool: 'fire-spell-school' },
			],
		});
	});

	it('maps spell utility and secret tri-state to index values', () => {
		const filters = emptySearchFiltersState();
		filters.utility = true;
		filters.secret = false;
		expect(buildOramaWhereForFilters('spell', filters)).toEqual({
			and: [{ type: 'spell' }, { spellUtility: '1' }, { spellSecret: '0' }],
		});
	});

	it('omits class key stats from Orama where (post-filter only)', () => {
		const filters = emptySearchFiltersState();
		filters.stat = ['dexterity'];
		filters.hitdie = ['1d10'];
		expect(buildOramaWhereForFilters('class', filters)).toEqual({
			and: [{ type: 'class' }, { classHitDie: '1d10' }],
		});
	});
});

describe('classKeyStatsRowMatches', () => {
	it('passes when no stats are selected', () => {
		expect(classKeyStatsRowMatches('dexterity,strength', [])).toBe(true);
	});

	it('matches when any selected stat appears in the field', () => {
		expect(classKeyStatsRowMatches('dexterity,strength', ['strength'])).toBe(
			true,
		);
	});

	it('fails when field is empty but stats are selected', () => {
		expect(classKeyStatsRowMatches('', ['dexterity'])).toBe(false);
	});

	it('fails when selected stat is absent', () => {
		expect(classKeyStatsRowMatches('dexterity', ['wisdom'])).toBe(false);
	});
});

describe('documentMatchesFilters', () => {
	it('accepts spell rows that match active filters', () => {
		const filters = emptySearchFiltersState();
		filters.tier = ['1'];
		filters.school = ['fire-spell-school'];
		expect(documentMatchesFilters(spellDoc(), 'spell', filters)).toBe(true);
	});

	it('rejects spell rows outside tier filter', () => {
		const filters = emptySearchFiltersState();
		filters.tier = ['2'];
		expect(documentMatchesFilters(spellDoc(), 'spell', filters)).toBe(false);
	});

	it('rejects rows whose type does not match', () => {
		expect(
			documentMatchesFilters(spellDoc(), 'monster', emptySearchFiltersState()),
		).toBe(false);
	});

	it('applies class key stat post-filter', () => {
		const filters = emptySearchFiltersState();
		filters.stat = ['wisdom'];
		expect(documentMatchesFilters(classDoc(), 'class', filters)).toBe(false);
		filters.stat = ['dexterity'];
		expect(documentMatchesFilters(classDoc(), 'class', filters)).toBe(true);
	});
});
