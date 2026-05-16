import { describe, expect, it } from 'vitest';
import { spellTierDisplayLabel } from '../../src/models/spell-tier-display-label';

describe('spellTierDisplayLabel', () => {
	it('maps 0 to Cantrip', () => {
		expect(spellTierDisplayLabel(0)).toBe('Cantrip');
	});

	it('maps positive tiers to Tier n', () => {
		expect(spellTierDisplayLabel(1)).toBe('Tier 1');
		expect(spellTierDisplayLabel(9)).toBe('Tier 9');
	});
});
