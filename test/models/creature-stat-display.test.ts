import { describe, expect, it } from 'vitest';
import {
	legendarySaveBadgeStrings,
	monsterActionHeading,
} from '../../src/models/creature-stat-display';

describe('creature-stat-display', () => {
	it('monsterActionHeading adds uses and trailing period when needed', () => {
		expect(monsterActionHeading({ name: 'Bite', description: 'dmg' })).toBe(
			'Bite.',
		);
		expect(
			monsterActionHeading({ name: 'Claw.', description: 'dmg', uses: 2 }),
		).toBe('Claw. (2x)');
	});

	it('legendarySaveBadgeStrings formats per-save and all modifiers', () => {
		expect(legendarySaveBadgeStrings({ dex: 2, int: 1 })).toEqual([
			'DEX++',
			'INT+',
		]);
		expect(legendarySaveBadgeStrings({ all: -2 })).toEqual(['ALL--']);
	});
});
