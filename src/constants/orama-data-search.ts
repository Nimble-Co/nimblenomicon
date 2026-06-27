/**
 * Shared labels and ordering for the Orama game-data search index and `/search/` UI.
 * Order is player-facing priority (common lookups first).
 */
export const ORAMA_DATA_SEARCH_TYPE_ORDER = [
	'monster',
	'condition',
	'spell',
	'class',
	'weapon',
	'ancestry',
	'background',
	'armor',
	'equipment',
	'magic-item',
	'glossary',
	'language',
] as const;

export type OramaDataSearchType = (typeof ORAMA_DATA_SEARCH_TYPE_ORDER)[number];

const ORAMA_DATA_SEARCH_TYPES = new Set<string>(ORAMA_DATA_SEARCH_TYPE_ORDER);

/** Type guard for URL params and menu picks (`type` query / data attributes). */
export function isOramaDataSearchType(raw: string): raw is OramaDataSearchType {
	return ORAMA_DATA_SEARCH_TYPES.has(raw);
}

export const ORAMA_DATA_SEARCH_TYPE_LABELS: Record<
	OramaDataSearchType,
	string
> = {
	ancestry: 'Ancestries',
	class: 'Classes',
	background: 'Backgrounds',
	equipment: 'Equipment',
	'magic-item': 'Magic items',
	weapon: 'Weapons',
	spell: 'Spells',
	glossary: 'Glossary',
	monster: 'Monsters',
	armor: 'Armor',
	language: 'Languages',
	condition: 'Conditions',
};

/** Singular labels for per-result cards (title-case, not forced uppercase in CSS). */
export const ORAMA_DATA_SEARCH_TYPE_LABELS_SINGULAR: Record<
	OramaDataSearchType,
	string
> = {
	ancestry: 'Ancestry',
	class: 'Class',
	background: 'Background',
	equipment: 'Equipment',
	'magic-item': 'Magic item',
	weapon: 'Weapon',
	spell: 'Spell',
	glossary: 'Glossary',
	monster: 'Monster',
	armor: 'Armor',
	language: 'Language',
	condition: 'Condition',
};
