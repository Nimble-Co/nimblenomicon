import { describe, expect, it } from 'vitest';
import { isOramaDataSearchType } from '../../src/constants/orama-data-search';
import { parseTypeFromSearchParams } from '../../src/search/orama-search-url';

describe('isOramaDataSearchType', () => {
	it('accepts known search types', () => {
		expect(isOramaDataSearchType('spell')).toBe(true);
		expect(isOramaDataSearchType('magic-item')).toBe(true);
	});

	it('rejects unknown values', () => {
		expect(isOramaDataSearchType('creature')).toBe(false);
		expect(isOramaDataSearchType('')).toBe(false);
	});
});

describe('parseTypeFromSearchParams', () => {
	it('normalizes type param to lowercase slug', () => {
		const params = new URLSearchParams('type=Spell');
		expect(parseTypeFromSearchParams(params)).toBe('spell');
	});

	it('returns null for invalid type', () => {
		const params = new URLSearchParams('type=foo');
		expect(parseTypeFromSearchParams(params)).toBeNull();
	});
});
