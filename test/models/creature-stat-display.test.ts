import { describe, expect, it } from 'vitest';
import {
	creatureSizeLabel,
	legendarySaveBadgeStrings,
	monsterActionHeading,
} from '../../src/models/creature-stat-display';
import type { MonsterAction } from '../../src/models/monsters';

describe('creature-stat-display', () => {
	it('creatureSizeLabel resolves known size slugs', () => {
		expect(creatureSizeLabel('medium')).toBe('Medium');
	});

	it('creatureSizeLabel falls back to the slug', () => {
		expect(creatureSizeLabel('unknown-size')).toBe('unknown-size');
	});

	it('monsterActionHeading adds uses and trailing period when needed', () => {
		const action: MonsterAction = {
			name: 'Bite',
			description: 'Deal damage.',
			uses: 2,
		};
		expect(monsterActionHeading(action)).toBe('Bite (2x).');
	});

	it('monsterActionHeading preserves sentence-ending punctuation', () => {
		const action: MonsterAction = {
			name: 'Bite.',
			description: 'Deal damage.',
		};
		expect(monsterActionHeading(action)).toBe('Bite.');
	});

	it('legendarySaveBadgeStrings formats per-stat and all saves', () => {
		expect(legendarySaveBadgeStrings({ str: 2, dex: 1 })).toEqual([
			'STR++',
			'DEX+',
		]);
		expect(legendarySaveBadgeStrings({ all: -2 })).toEqual(['ALL--']);
	});
});
