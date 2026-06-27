import { describe, expect, it } from 'vitest';
import { isOramaDataSearchType } from '../../src/constants/orama-data-search';

describe('isOramaDataSearchType', () => {
	it('accepts known search types', () => {
		expect(isOramaDataSearchType('spell')).toBe(true);
		expect(isOramaDataSearchType('magic-item')).toBe(true);
	});

	it('rejects unknown values', () => {
		expect(isOramaDataSearchType('')).toBe(false);
		expect(isOramaDataSearchType('spells')).toBe(false);
	});
});
