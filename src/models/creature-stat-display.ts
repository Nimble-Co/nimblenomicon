/**
 * Human-facing strings for creature stat blocks and search cards.
 * Keeps Astro detail pages and Svelte search cards aligned on armor, speed, size, and actions.
 */
import { slugifyEntityId } from '../utils/slugifyEntityId';
import type { LegendarySaveModifiers } from './creature-stat-shared';
import type {
	CreatureArmorTier,
	CreatureMovementMode,
} from './creature-stat-shared';
import type { MonsterAction } from './monsters';
import { sizes } from './sizes';

/** Resolve a size slug (from `sizes.json`) to its display name. */
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

export const CREATURE_SPEED_MODE_LABEL: Record<CreatureMovementMode, string> = {
	walk: 'Walk',
	fly: 'Fly',
	burrow: 'Burrow',
	swim: 'Swim',
};

export function creatureSpeedModeLabel(mode: string): string {
	return CREATURE_SPEED_MODE_LABEL[mode as CreatureMovementMode] ?? mode;
}

export const CREATURE_ARMOR_ABBREV: Record<CreatureArmorTier, string | null> = {
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

/** Save modifier badges for legendary stat blocks and search cards (e.g. `STR++`, `ALL+`). */
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
