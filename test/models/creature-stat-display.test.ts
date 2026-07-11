import { describe, expect, it } from 'vitest';

import {
	actionHeading,
	armorAbbrev,
	legendarySaveBadges,
	sizeLabel,
	SPEED_MODE_LABEL,
} from '../../src/models/creature-stat-display';

describe('creature-stat-display', () => {
	it('resolves size slugs to display names', () => {
		expect(sizeLabel('medium')).toBe('Medium');
		expect(sizeLabel('unknown-size')).toBe('unknown-size');
	});

	it('formats action headings with optional uses and trailing period', () => {
		expect(actionHeading({ name: 'Bite', description: 'dmg' })).toBe('Bite.');
		expect(actionHeading({ name: 'Claw.', description: 'dmg', uses: 2 })).toBe(
			'Claw. (2x)',
		);
	});

	it('exposes movement and armor labels', () => {
		expect(SPEED_MODE_LABEL.fly).toBe('Fly');
		expect(armorAbbrev.heavy).toBe('H');
		expect(armorAbbrev.none).toBeNull();
	});

	it('builds legendary save badges', () => {
		expect(legendarySaveBadges({ str: 2, dex: 1 })).toEqual(['STR++', 'DEX+']);
		expect(legendarySaveBadges({ all: -2 })).toEqual(['ALL--']);
		expect(legendarySaveBadges(undefined)).toEqual([]);
	});
});
