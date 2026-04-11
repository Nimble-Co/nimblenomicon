import { describe, expect, it } from 'vitest';

import { formatArmorCategoryLabel } from '../../src/models/armor';

describe('formatArmorCategoryLabel', () => {
	it('returns the table label for known categories', () => {
		expect(formatArmorCategoryLabel('plate')).toBe('Plate');
		expect(formatArmorCategoryLabel('cloth')).toBe('Cloth');
	});
});
