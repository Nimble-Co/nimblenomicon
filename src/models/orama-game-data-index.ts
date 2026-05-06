/**
 * Orama game-data search index contract: filter columns, serialized schema, and full doc type.
 * Used by `build-searchable-game-data-docs.ts`, `scripts/build-orama-index.ts`,
 * `orama-search-db.ts`, and (via URL helpers in `search-filters.ts`) query/filter behavior.
 */
import type { OramaDataSearchType } from '../constants/orama-data-search';

/** Core fields on every indexed document (before per-row filter facets). */
const ORAMA_DATA_SEARCH_BASE_SCHEMA_FIELDS = {
	id: 'string',
	type: 'string',
	title: 'string',
	content: 'string',
	href: 'string',
	subtitle: 'string',
	cardJson: 'string',
} as const;

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

/**
 * Builds the Orama schema object passed to `create({ schema })` in Node and the browser.
 * Filter facets are derived from {@link ORAMA_FILTER_FIELD_NAMES} so schema keys stay aligned.
 */
export function buildOramaGameDataSearchSchema(): Readonly<
	Record<
		keyof typeof ORAMA_DATA_SEARCH_BASE_SCHEMA_FIELDS | OramaFilterFieldName,
		'string'
	>
> {
	const schema = {
		...ORAMA_DATA_SEARCH_BASE_SCHEMA_FIELDS,
	} as Record<string, 'string'>;
	for (const k of ORAMA_FILTER_FIELD_NAMES) {
		schema[k] = 'string';
	}
	return schema as Readonly<
		Record<
			keyof typeof ORAMA_DATA_SEARCH_BASE_SCHEMA_FIELDS | OramaFilterFieldName,
			'string'
		>
	>;
}

/** Singleton schema for `create` / `load` in the browser and build script. */
export const ORAMA_DATA_SEARCH_SCHEMA = buildOramaGameDataSearchSchema();

/** Full Orama document shape including filter columns (see `build-orama-index`). */
export type SearchableGameDataDoc = {
	id: string;
	type: OramaDataSearchType;
	title: string;
	content: string;
	href: string;
	subtitle: string;
	/** JSON string: structured card payload for `/search/` (see `search-result-card.ts`). */
	cardJson: string;
} & OramaFilterFields;
