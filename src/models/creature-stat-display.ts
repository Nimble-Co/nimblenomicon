/**
 * Shared display helpers for standard and legendary creature stat blocks
 * (detail pages, search cards, and Orama card payloads).
 */
import { slugifyEntityId } from '../utils/slugifyEntityId';
import type { LegendarySaveModifiers } from './creature-stat-shared';
import type { MonsterAction } from './monsters';
import { sizes } from './sizes';

export function creatureSizeLabel(sizeSlug: string): string {
	const match = sizes.find((s) => slugifyEntityId(s.name, 'size') === sizeSlug);
	return match?.name ?? sizeSlug;
}

/** Bold action label + optional (Nx); add a sentence-ending period only when the name lacks one. */
export function monsterActionHeading(action: MonsterAction): string {
	const uses = action.uses != null ? ` (${action.uses}x)` : '';
	const endsSentence = /[.!?;:]$/.test(action.name.trim());
	return `${action.name}${uses}${endsSentence ? '' : '.'}`;
}

export const CREATURE_SPEED_MODE_LABEL: Record<string, string> = {
	walk: 'Walk',
	fly: 'Fly',
	burrow: 'Burrow',
	swim: 'Swim',
};

export const CREATURE_ARMOR_ABBREV: Record<
	'none' | 'medium' | 'heavy',
	string | null
> = {
	none: null,
	medium: 'M',
	heavy: 'H',
};

const LEGENDARY_SAVE_LABEL = {
	str: 'STR',
	dex: 'DEX',
	int: 'INT',
	wil: 'WIL',
	all: 'ALL',
} as const;

export function legendarySaveBadgeStrings(
	saves: LegendarySaveModifiers | undefined,
): string[] {
	if (!saves) return [];
	if (typeof saves.all === 'number' && saves.all !== 0) {
		const n = saves.all;
		const sign = n > 0 ? '+'.repeat(n) : '-'.repeat(-n);
		return [`ALL${sign}`];
	}
	const order = ['str', 'dex', 'int', 'wil'] as const;
	const out: string[] = [];
	for (const k of order) {
		const v = saves[k];
		if (typeof v === 'number' && v > 0) {
			out.push(`${LEGENDARY_SAVE_LABEL[k]}${'+'.repeat(v)}`);
		}
	}
	return out;
}
