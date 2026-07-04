import { describe, expect, it } from 'vitest';
import {
	CREATURE_ARMOR_ABBREV,
	CREATURE_SPEED_MODE_LABEL,
	creatureSizeLabel,
	legendarySaveBadgeStrings,
	monsterActionHeading,
} from '../../src/models/creature-stat-display';

describe('creature-stat-display', () => {
	it('creatureSizeLabel resolves known size slugs', () => {
		expect(creatureSizeLabel('medium')).toBe('Medium');
		expect(creatureSizeLabel('large')).toBe('Large');
	});

	it('creatureSizeLabel falls back to the slug', () => {
		expect(creatureSizeLabel('unknown-size')).toBe('unknown-size');
	});

	it('monsterActionHeading adds uses and trailing period', () => {
		expect(
			monsterActionHeading({
				name: 'Bite',
				description: 'Deal damage.',
			}),
		).toBe('Bite.');
		expect(
			monsterActionHeading({
				name: 'Claw',
				uses: 2,
				description: 'Attack twice.',
			}),
		).toBe('Claw (2x).');
		expect(
			monsterActionHeading({
				name: 'Already punctuated!',
				description: 'Done.',
			}),
		).toBe('Already punctuated!');
	});

	it('exposes armor and speed labels used by stat blocks', () => {
		expect(CREATURE_ARMOR_ABBREV.medium).toBe('M');
		expect(CREATURE_SPEED_MODE_LABEL.fly).toBe('Fly');
	});

	it('legendarySaveBadgeStrings formats per-save and all modifiers', () => {
		expect(legendarySaveBadgeStrings({ str: 2, dex: 1 })).toEqual([
			'STR++',
			'DEX+',
		]);
		expect(legendarySaveBadgeStrings({ all: -2 })).toEqual(['ALL--']);
	});
});
