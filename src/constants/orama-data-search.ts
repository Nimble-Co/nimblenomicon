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
