/**
 * Labelled option lists for search filter UI (derived from game data).
 */
import {
	ancestrySectionFilterOptions,
	ancestrySizeFilterOptions,
} from './ancestries';
import { armorCategoryFilterOptions } from './armor';
import { creatureArmorTierFilterOptions } from './creature-stat-shared';
import { spellSchools } from './spell-schools';
import { monsterFamilies } from './monster-families';
import { monsterKinds } from './monster-kinds';
import { monsters } from './monsters';
import { legendaryMonsters } from './legendary-monsters';
import { heroClasses } from './class';
import { MONSTER_LEVEL_VALUES } from './monsters';
import type { SpellTarget } from './spells';

export const SPELL_TARGET_FILTER_OPTIONS: {
	value: SpellTarget;
	label: string;
}[] = [
	{ value: 'single-target', label: 'Single Target' },
	{ value: 'self', label: 'Self' },
	{ value: 'aoe', label: 'AoE' },
	{ value: 'two-targets', label: '2 Targets' },
	{ value: 'multi-target', label: 'Multi-target' },
	{ value: 'single-target-plus', label: 'Single Target+' },
	{
		value: 'single-target-or-self',
		label: 'Single Target/Self',
	},
];

export function spellSchoolOptions(): { value: string; label: string }[] {
	return spellSchools.map((s) => ({ value: s.id, label: s.name }));
}

export function monsterFamilyOptions(): { value: string; label: string }[] {
	return monsterFamilies.map((f) => ({ value: f.id, label: f.name }));
}

export function monsterKindOptions(): { value: string; label: string }[] {
	return monsterKinds.map((k) => ({ value: k.id, label: k.name }));
}

export function monsterLevelOptions(): { value: string; label: string }[] {
	return [...MONSTER_LEVEL_VALUES].map((v) => ({
		value: v,
		label: v.includes('/') ? v : `Level ${v}`,
	}));
}

export function monsterArmorOptions(): { value: string; label: string }[] {
	return creatureArmorTierFilterOptions();
}

function collectDistinctSpeeds(): string[] {
	const s = new Set<string>();
	for (const m of monsters) {
		s.add(String(m.movement.speed));
	}
	for (const leg of legendaryMonsters) {
		for (const c of leg.creatures) {
			s.add(String(c.movement.speed));
		}
	}
	return [...s].sort((a, b) => Number(a) - Number(b));
}

export function monsterSpeedOptions(): { value: string; label: string }[] {
	return collectDistinctSpeeds().map((v) => ({ value: v, label: `${v} ft` }));
}

/** Creature size slugs from data (monsters). */
export function monsterSizeOptions(): { value: string; label: string }[] {
	const seen = new Set<string>();
	for (const m of monsters) seen.add(m.size);
	for (const leg of legendaryMonsters) {
		for (const c of leg.creatures) seen.add(c.size);
	}
	return [...seen]
		.sort()
		.map((id) => ({ value: id, label: id.replace(/-/g, ' ') }));
}

export function classKeyStatOptions(): { value: string; label: string }[] {
	const s = new Set<string>();
	for (const c of heroClasses) {
		for (const st of c.keyStats) s.add(st);
	}
	return [...s].sort().map((st) => ({ value: st, label: st }));
}

export function classHitDieOptions(): { value: string; label: string }[] {
	const s = new Set<string>();
	for (const c of heroClasses) {
		s.add(c.hitDieLabel.trim().toLowerCase());
	}
	return [...s].sort().map((v) => ({ value: v, label: v }));
}

export const WEAPON_CATEGORY_OPTIONS: { value: string; label: string }[] = [
	{ value: 'melee', label: 'Melee' },
	{ value: 'ranged', label: 'Ranged' },
];

export const ANCESTRY_SECTION_OPTIONS = ancestrySectionFilterOptions();

export function ancestrySizeOptions(): { value: string; label: string }[] {
	return ancestrySizeFilterOptions();
}

export const ARMOR_CATEGORY_OPTIONS = armorCategoryFilterOptions();

export const MAGIC_ITEM_KIND_OPTIONS: { value: string; label: string }[] = [
	{ value: 'standard', label: 'Magic item' },
	{ value: 'wand', label: 'Wand' },
];

export const MAGIC_ITEM_SOURCE_OPTIONS: { value: string; label: string }[] = [
	{ value: 'core-rules', label: 'Core Rules' },
	{ value: 'game-masters-guide', label: "GM's Guide" },
];

export const MAGIC_ITEM_REWARD_OPTIONS: { value: string; label: string }[] = [
	{ value: 'release-valve', label: 'Release valve' },
	{ value: 'story', label: 'Story' },
	{ value: 'combat', label: 'Combat' },
];

export function spellTierOptions(): { value: string; label: string }[] {
	const out: { value: string; label: string }[] = [
		{ value: '0', label: 'Cantrip' },
	];
	for (let t = 1; t <= 9; t += 1) {
		out.push({ value: String(t), label: `Tier ${t}` });
	}
	return out;
}
