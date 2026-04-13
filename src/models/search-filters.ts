/**
 * Per-type game data search filters: URL param names, parsing, serialization,
 * and helpers to populate Orama index fields + build `where` clauses.
 */
import type { OramaDataSearchType } from '../constants/orama-data-search';
import type { SpellData } from './spells';
import type { MonsterData } from './monsters';
import type { LegendaryEntryData } from './legendary-monsters';
import type { HeroClassData } from './class';
import type { WeaponRowData } from './weapons';
import type { AncestryRowData } from './ancestries';
import type { ArmorRowData } from './armor';
import type { MagicalItemData } from './magical-items';

/** Every extra field stored on each Orama doc (empty string when unused for that row). */
export const ORAMA_FILTER_FIELD_NAMES = [
	'spellTier',
	'spellSchool',
	'spellTarget',
	'spellUtility',
	'spellSecret',
	'monsterLevel',
	'monsterFamily',
	'monsterKind',
	'monsterArmor',
	'monsterSpeed',
	'monsterSize',
	'monsterMinion',
	'monsterLegendary',
	'classKeyStats',
	'classHitDie',
	'weaponCategory',
	'ancestrySection',
	'ancestrySize',
	'armorCategory',
	'magicKind',
	'magicSource',
	'magicReward',
] as const;

export type OramaFilterFieldName = (typeof ORAMA_FILTER_FIELD_NAMES)[number];

export type OramaFilterFields = Record<OramaFilterFieldName, string>;

export function emptyOramaFilterFields(): OramaFilterFields {
	const o = {} as Record<string, string>;
	for (const k of ORAMA_FILTER_FIELD_NAMES) o[k] = '';
	return o as OramaFilterFields;
}

/** Query param keys used for filters (not `q` or `type`). */
export const SEARCH_FILTER_QUERY_KEYS = [
	'tier',
	'school',
	'target',
	'utility',
	'secret',
	'level',
	'family',
	'kind',
	'armor',
	'speed',
	'size',
	'minion',
	'legendary',
	'stat',
	'hitdie',
	'category',
	'section',
	'source',
	'reward',
] as const;

export type SearchFilterQueryKey = (typeof SEARCH_FILTER_QUERY_KEYS)[number];

const KEYS_BY_TYPE: Record<
	OramaDataSearchType,
	readonly SearchFilterQueryKey[]
> = {
	spell: ['tier', 'school', 'target', 'utility', 'secret'],
	monster: [
		'level',
		'family',
		'kind',
		'armor',
		'speed',
		'size',
		'minion',
		'legendary',
	],
	class: ['stat', 'hitdie'],
	weapon: ['category'],
	ancestry: ['section', 'size'],
	armor: ['category'],
	equipment: [],
	'magic-item': ['kind', 'source', 'reward'],
	glossary: [],
	language: [],
	background: [],
};

export function filterKeysForType(
	type: OramaDataSearchType,
): readonly SearchFilterQueryKey[] {
	return KEYS_BY_TYPE[type];
}

export type SearchFiltersState = {
	tier: string[];
	school: string[];
	target: string[];
	utility: boolean | null;
	secret: boolean | null;
	level: string[];
	family: string[];
	kind: string[];
	armor: string[];
	speed: string[];
	size: string[];
	minion: boolean | null;
	legendary: boolean | null;
	stat: string[];
	hitdie: string[];
	category: string[];
	section: string[];
	source: string[];
	reward: string[];
};

/** Dimensions that use `string[]` multi-select in URL state (checkbox dropdowns in UI). */
export type MultiSelectFilterDim =
	| 'tier'
	| 'school'
	| 'target'
	| 'level'
	| 'family'
	| 'kind'
	| 'armor'
	| 'speed'
	| 'size'
	| 'stat'
	| 'hitdie'
	| 'category'
	| 'section'
	| 'source'
	| 'reward';

/**
 * Set or clear one value in a multi-select dimension (for checkbox `change`, not toggle-click).
 */
export function setMultiFilterValue(
	prev: SearchFiltersState,
	dim: MultiSelectFilterDim,
	value: string,
	selected: boolean,
): SearchFiltersState {
	const cur = [...(prev[dim] as string[])];
	const i = cur.indexOf(value);
	if (selected && i < 0) cur.push(value);
	if (!selected && i >= 0) cur.splice(i, 1);
	cur.sort((a, b) => a.localeCompare(b));
	return { ...prev, [dim]: cur };
}

/** Remove all selections for one multi-select dimension (checkbox dropdown “Clear”). */
export function clearMultiFilterDim(
	prev: SearchFiltersState,
	dim: MultiSelectFilterDim,
): SearchFiltersState {
	return { ...prev, [dim]: [] };
}

export function emptySearchFiltersState(): SearchFiltersState {
	return {
		tier: [],
		school: [],
		target: [],
		utility: null,
		secret: null,
		level: [],
		family: [],
		kind: [],
		armor: [],
		speed: [],
		size: [],
		minion: null,
		legendary: null,
		stat: [],
		hitdie: [],
		category: [],
		section: [],
		source: [],
		reward: [],
	};
}

/** Fresh filter state for a type (spell defaults “utility spells” to on). */
export function initialFiltersForType(
	type: OramaDataSearchType,
): SearchFiltersState {
	const s = emptySearchFiltersState();
	if (type === 'spell') {
		s.utility = true;
	}
	return s;
}

function splitCommaList(raw: string | null): string[] {
	if (raw == null || raw.trim() === '') return [];
	return raw
		.split(',')
		.map((s) => {
			try {
				return decodeURIComponent(s.trim());
			} catch {
				return s.trim();
			}
		})
		.filter(Boolean);
}

function parseTriState(raw: string | null): boolean | null {
	if (raw == null || raw === '') return null;
	if (raw === '1' || raw === 'true') return true;
	if (raw === '0' || raw === 'false') return false;
	return null;
}

/**
 * Read filter state from URL for the given data type (only keys valid for that type).
 */
export function parseSearchFiltersFromParams(
	type: OramaDataSearchType | null,
	params: URLSearchParams,
): SearchFiltersState {
	const out = emptySearchFiltersState();
	if (!type) return out;
	const keys = KEYS_BY_TYPE[type];
	for (const key of keys) {
		const v = params.get(key);
		switch (key) {
			case 'utility': {
				if (type === 'spell' && (v == null || v === '')) {
					out.utility = true;
				} else {
					out.utility = parseTriState(v);
				}
				break;
			}
			case 'secret': {
				out.secret = parseTriState(v);
				break;
			}
			case 'minion':
			case 'legendary': {
				const t = key as 'minion' | 'legendary';
				out[t] = parseTriState(v);
				break;
			}
			case 'tier':
				out.tier = splitCommaList(v);
				break;
			case 'school':
				out.school = splitCommaList(v);
				break;
			case 'target':
				out.target = splitCommaList(v);
				break;
			case 'level':
				out.level = splitCommaList(v);
				break;
			case 'family':
				out.family = splitCommaList(v);
				break;
			case 'kind':
				out.kind = splitCommaList(v);
				break;
			case 'armor':
				out.armor = splitCommaList(v);
				break;
			case 'speed':
				out.speed = splitCommaList(v);
				break;
			case 'size':
				out.size = splitCommaList(v);
				break;
			case 'stat':
				out.stat = splitCommaList(v);
				break;
			case 'hitdie':
				out.hitdie = splitCommaList(v);
				break;
			case 'category':
				out.category = splitCommaList(v);
				break;
			case 'section':
				out.section = splitCommaList(v);
				break;
			case 'source':
				out.source = splitCommaList(v);
				break;
			case 'reward':
				out.reward = splitCommaList(v);
				break;
			default:
				break;
		}
	}
	return out;
}

function serializeCommaList(values: string[]): string | undefined {
	if (values.length === 0) return undefined;
	return values.join(',');
}

/**
 * Apply current filter state to URLSearchParams: set/remove only filter keys for `type`.
 * Preserves `q` and other unrelated params.
 */
export function applySearchFiltersToParams(
	type: OramaDataSearchType | null,
	filters: SearchFiltersState,
	params: URLSearchParams,
): void {
	for (const k of SEARCH_FILTER_QUERY_KEYS) params.delete(k);

	if (!type) return;
	const keys = KEYS_BY_TYPE[type];
	for (const key of keys) {
		let serialized: string | undefined;
		switch (key) {
			case 'tier':
				serialized = serializeCommaList(filters.tier);
				break;
			case 'school':
				serialized = serializeCommaList(filters.school);
				break;
			case 'target':
				serialized = serializeCommaList(filters.target);
				break;
			case 'utility':
				if (filters.utility === true) params.set('utility', '1');
				else if (filters.utility === false) params.set('utility', '0');
				break;
			case 'secret':
				if (filters.secret === true) params.set('secret', '1');
				else if (filters.secret === false) params.set('secret', '0');
				break;
			case 'level':
				serialized = serializeCommaList(filters.level);
				break;
			case 'family':
				serialized = serializeCommaList(filters.family);
				break;
			case 'kind':
				serialized = serializeCommaList(filters.kind);
				break;
			case 'armor':
				serialized = serializeCommaList(filters.armor);
				break;
			case 'speed':
				serialized = serializeCommaList(filters.speed);
				break;
			case 'size':
				serialized = serializeCommaList(filters.size);
				break;
			case 'minion':
				if (filters.minion === true) params.set('minion', '1');
				else if (filters.minion === false) params.set('minion', '0');
				break;
			case 'legendary':
				if (filters.legendary === true) params.set('legendary', '1');
				else if (filters.legendary === false) params.set('legendary', '0');
				break;
			case 'stat':
				serialized = serializeCommaList(filters.stat);
				break;
			case 'hitdie':
				serialized = serializeCommaList(filters.hitdie);
				break;
			case 'category':
				serialized = serializeCommaList(filters.category);
				break;
			case 'section':
				serialized = serializeCommaList(filters.section);
				break;
			case 'source':
				serialized = serializeCommaList(filters.source);
				break;
			case 'reward':
				serialized = serializeCommaList(filters.reward);
				break;
			default:
				break;
		}
		if (serialized !== undefined) params.set(key, serialized);
	}
}

export function clearAllSearchFilterParams(params: URLSearchParams): void {
	for (const k of SEARCH_FILTER_QUERY_KEYS) params.delete(k);
}

/** Remove filter params that are not valid for the current `type` (e.g. after changing type). */
export function stripSearchFilterParamsNotForType(
	params: URLSearchParams,
	type: OramaDataSearchType | null,
): void {
	const allowed = type ? new Set<string>(KEYS_BY_TYPE[type]) : null;
	for (const k of SEARCH_FILTER_QUERY_KEYS) {
		if (!allowed || !allowed.has(k)) params.delete(k);
	}
}

export function hasAnyActiveFilters(
	type: OramaDataSearchType | null,
	filters: SearchFiltersState,
): boolean {
	if (!type) return false;
	const keys = KEYS_BY_TYPE[type];
	for (const key of keys) {
		switch (key) {
			case 'utility':
				// Default for spells is “utility spells” on; only “non-utility” is an extra filter.
				if (filters.utility === false) return true;
				break;
			case 'secret':
				if (filters.secret !== null) return true;
				break;
			case 'minion':
				if (filters.minion !== null) return true;
				break;
			case 'legendary':
				if (filters.legendary !== null) return true;
				break;
			case 'tier':
				if (filters.tier.length > 0) return true;
				break;
			case 'school':
				if (filters.school.length > 0) return true;
				break;
			case 'target':
				if (filters.target.length > 0) return true;
				break;
			case 'level':
				if (filters.level.length > 0) return true;
				break;
			case 'family':
				if (filters.family.length > 0) return true;
				break;
			case 'kind':
				if (filters.kind.length > 0) return true;
				break;
			case 'armor':
				if (filters.armor.length > 0) return true;
				break;
			case 'speed':
				if (filters.speed.length > 0) return true;
				break;
			case 'size':
				if (filters.size.length > 0) return true;
				break;
			case 'stat':
				if (filters.stat.length > 0) return true;
				break;
			case 'hitdie':
				if (filters.hitdie.length > 0) return true;
				break;
			case 'category':
				if (filters.category.length > 0) return true;
				break;
			case 'section':
				if (filters.section.length > 0) return true;
				break;
			case 'source':
				if (filters.source.length > 0) return true;
				break;
			case 'reward':
				if (filters.reward.length > 0) return true;
				break;
			default:
				break;
		}
	}
	return false;
}

// --- Index population helpers ---

export function spellFilterFields(
	spell: SpellData,
): Pick<
	OramaFilterFields,
	'spellTier' | 'spellSchool' | 'spellTarget' | 'spellUtility' | 'spellSecret'
> {
	return {
		spellTier: String(spell.tier),
		spellSchool: spell.schoolId,
		spellTarget: spell.target ?? '',
		spellUtility: spell.utility ? '1' : '0',
		spellSecret: spell.secret ? '1' : '0',
	};
}

export function monsterFilterFields(
	m: MonsterData,
): Pick<
	OramaFilterFields,
	| 'monsterLevel'
	| 'monsterFamily'
	| 'monsterKind'
	| 'monsterArmor'
	| 'monsterSpeed'
	| 'monsterSize'
	| 'monsterMinion'
	| 'monsterLegendary'
> {
	return {
		monsterLevel: m.level,
		monsterFamily: m.family?.id ?? '',
		monsterKind: m.kind?.id ?? '',
		monsterArmor: m.armor,
		monsterSpeed: String(m.movement.speed),
		monsterSize: m.size,
		monsterMinion: m.isMinion ? '1' : '0',
		monsterLegendary: '0',
	};
}

export function legendaryMonsterFilterFields(
	leg: LegendaryEntryData,
): Pick<
	OramaFilterFields,
	| 'monsterLevel'
	| 'monsterFamily'
	| 'monsterKind'
	| 'monsterArmor'
	| 'monsterSpeed'
	| 'monsterSize'
	| 'monsterMinion'
	| 'monsterLegendary'
> {
	const c0 = leg.creatures[0]!;
	return {
		monsterLevel: leg.level,
		monsterFamily: '',
		monsterKind: '',
		monsterArmor: c0.armor,
		monsterSpeed: String(c0.movement.speed),
		monsterSize: c0.size,
		monsterMinion: '0',
		monsterLegendary: '1',
	};
}

export function classFilterFields(
	c: HeroClassData,
): Pick<OramaFilterFields, 'classKeyStats' | 'classHitDie'> {
	const stats = [...c.keyStats].sort((a, b) => a.localeCompare(b));
	return {
		classKeyStats: stats.join(','),
		classHitDie: c.hitDieLabel.trim().toLowerCase(),
	};
}

export function weaponFilterFields(
	w: WeaponRowData,
): Pick<OramaFilterFields, 'weaponCategory'> {
	return { weaponCategory: w.category };
}

export function ancestryFilterFields(
	a: AncestryRowData,
): Pick<OramaFilterFields, 'ancestrySection' | 'ancestrySize'> {
	return {
		ancestrySection: a.section,
		ancestrySize: a.size,
	};
}

export function armorFilterFields(
	row: ArmorRowData,
): Pick<OramaFilterFields, 'armorCategory'> {
	return { armorCategory: row.category };
}

export function magicItemFilterFields(
	item: MagicalItemData,
): Pick<OramaFilterFields, 'magicKind' | 'magicSource' | 'magicReward'> {
	return {
		magicKind: item.kind,
		magicSource: item.source,
		magicReward: item.adventuringRewardCategory ?? '',
	};
}

// --- Orama `where` builder (string fields use direct equality; combine with and/or) ---

type StringWhere = Record<string, string>;

function eqField(field: string, value: string): StringWhere {
	return { [field]: value };
}

function orEq(
	field: string,
	values: string[],
): StringWhere | { or: StringWhere[] } | undefined {
	if (values.length === 0) return undefined;
	if (values.length === 1) return eqField(field, values[0]!);
	return { or: values.map((v) => eqField(field, v)) };
}

/**
 * Build an Orama `where` clause for `type` + active filters. Returns undefined if no type.
 */
export function buildOramaWhereForFilters(
	type: OramaDataSearchType | null,
	filters: SearchFiltersState,
): { and: object[] } | { or: object[] } | StringWhere | undefined {
	if (!type) return undefined;

	const typeWhere = eqField('type', type);
	const f = filters;

	switch (type) {
		case 'spell': {
			const parts: object[] = [typeWhere];
			const o = orEq('spellTier', f.tier);
			if (o) parts.push(o);
			const o2 = orEq('spellSchool', f.school);
			if (o2) parts.push(o2);
			const o3 = orEq('spellTarget', f.target);
			if (o3) parts.push(o3);
			if (f.utility === true) parts.push(eqField('spellUtility', '1'));
			if (f.utility === false) parts.push(eqField('spellUtility', '0'));
			if (f.secret === true) parts.push(eqField('spellSecret', '1'));
			if (f.secret === false) parts.push(eqField('spellSecret', '0'));
			return parts.length === 1 ? (parts[0] as StringWhere) : { and: parts };
		}
		case 'monster': {
			const parts: object[] = [typeWhere];
			const o = orEq('monsterLevel', f.level);
			if (o) parts.push(o);
			const o2 = orEq('monsterFamily', f.family);
			if (o2) parts.push(o2);
			const o3 = orEq('monsterKind', f.kind);
			if (o3) parts.push(o3);
			const o4 = orEq('monsterArmor', f.armor);
			if (o4) parts.push(o4);
			const o5 = orEq('monsterSpeed', f.speed);
			if (o5) parts.push(o5);
			const o6 = orEq('monsterSize', f.size);
			if (o6) parts.push(o6);
			if (f.minion === true) parts.push(eqField('monsterMinion', '1'));
			if (f.minion === false) parts.push(eqField('monsterMinion', '0'));
			if (f.legendary === true) parts.push(eqField('monsterLegendary', '1'));
			if (f.legendary === false) parts.push(eqField('monsterLegendary', '0'));
			return parts.length === 1 ? (parts[0] as StringWhere) : { and: parts };
		}
		case 'class': {
			const parts: object[] = [typeWhere];
			const o = orEq('classHitDie', f.hitdie);
			if (o) parts.push(o);
			// `stat` uses comma-separated key stats on the doc; applied in `documentMatchesFilters`.
			return parts.length === 1 ? (parts[0] as StringWhere) : { and: parts };
		}
		case 'weapon': {
			const parts: object[] = [typeWhere];
			const o = orEq('weaponCategory', f.category);
			if (o) parts.push(o);
			return parts.length === 1 ? (parts[0] as StringWhere) : { and: parts };
		}
		case 'ancestry': {
			const parts: object[] = [typeWhere];
			const o = orEq('ancestrySection', f.section);
			if (o) parts.push(o);
			const o2 = orEq('ancestrySize', f.size);
			if (o2) parts.push(o2);
			return parts.length === 1 ? (parts[0] as StringWhere) : { and: parts };
		}
		case 'armor': {
			const parts: object[] = [typeWhere];
			const o = orEq('armorCategory', f.category);
			if (o) parts.push(o);
			return parts.length === 1 ? (parts[0] as StringWhere) : { and: parts };
		}
		case 'magic-item': {
			const parts: object[] = [typeWhere];
			const o = orEq('magicKind', f.kind);
			if (o) parts.push(o);
			const o2 = orEq('magicSource', f.source);
			if (o2) parts.push(o2);
			const o3 = orEq('magicReward', f.reward);
			if (o3) parts.push(o3);
			return parts.length === 1 ? (parts[0] as StringWhere) : { and: parts };
		}
		default:
			return typeWhere as StringWhere;
	}
}

/**
 * Class key stats are stored as comma-separated sorted list; match if any selected stat appears.
 */
export function classKeyStatsRowMatches(
	classKeyStatsField: string,
	selectedStats: string[],
): boolean {
	if (selectedStats.length === 0) return true;
	if (!classKeyStatsField) return false;
	const set = new Set(classKeyStatsField.split(',').map((s) => s.trim()));
	return selectedStats.some((s) => set.has(s));
}

/** Full Orama document shape including filter columns (see `build-orama-index`). */
export type SearchableGameDataDoc = {
	id: string;
	type: OramaDataSearchType;
	title: string;
	content: string;
	href: string;
	subtitle: string;
} & OramaFilterFields;

/**
 * Final pass after Orama search (handles class key-stats and keeps logic in one place).
 */
export function documentMatchesFilters(
	doc: SearchableGameDataDoc,
	type: OramaDataSearchType,
	filters: SearchFiltersState,
): boolean {
	if (doc.type !== type) return false;

	const inList = (field: string, selected: string[]) =>
		selected.length === 0 || selected.includes(field);

	const tri = (field: string, want: boolean | null) =>
		want === null ||
		(want === true && field === '1') ||
		(want === false && field === '0');

	switch (type) {
		case 'spell':
			return (
				inList(doc.spellTier, filters.tier) &&
				inList(doc.spellSchool, filters.school) &&
				inList(doc.spellTarget, filters.target) &&
				tri(doc.spellUtility, filters.utility) &&
				tri(doc.spellSecret, filters.secret)
			);
		case 'monster':
			return (
				inList(doc.monsterLevel, filters.level) &&
				inList(doc.monsterFamily, filters.family) &&
				inList(doc.monsterKind, filters.kind) &&
				inList(doc.monsterArmor, filters.armor) &&
				inList(doc.monsterSpeed, filters.speed) &&
				inList(doc.monsterSize, filters.size) &&
				tri(doc.monsterMinion, filters.minion) &&
				tri(doc.monsterLegendary, filters.legendary)
			);
		case 'class':
			return (
				inList(doc.classHitDie, filters.hitdie) &&
				classKeyStatsRowMatches(doc.classKeyStats, filters.stat)
			);
		case 'weapon':
			return inList(doc.weaponCategory, filters.category);
		case 'ancestry':
			return (
				inList(doc.ancestrySection, filters.section) &&
				inList(doc.ancestrySize, filters.size)
			);
		case 'armor':
			return inList(doc.armorCategory, filters.category);
		case 'magic-item':
			return (
				inList(doc.magicKind, filters.kind) &&
				inList(doc.magicSource, filters.source) &&
				inList(doc.magicReward, filters.reward)
			);
		default:
			return true;
	}
}
