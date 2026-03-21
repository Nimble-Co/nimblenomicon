/**
 * Per-section Starlight sidebar configs. Each home tile / book gets its own nav tree;
 * other sections’ links do not appear in the sidebar.
 */
export const SECTION_KEYS = [
	'core-rules',
	'heroes',
	'game-masters-guide',
	'adventures',
	'monsters-and-more',
	'creators-kit',
] as const;

export type SectionKey = (typeof SECTION_KEYS)[number];

/** Starlight manual sidebar shape (same as `starlight.sidebar` in astro.config). */
export const SECTION_SIDEBAR_CONFIG = {
	'core-rules': [
		{
			label: 'Start Here',
			collapsed: false,
			items: [{ label: 'Core Rules', link: '/core-rules/' }],
		},
		{
			label: 'COMBAT',
			collapsed: true,
			items: [{ label: 'Combat', link: '/core-rules/combat/' }],
		},
		{
			label: 'EQUIPMENT',
			collapsed: true,
			items: [{ label: 'Equipment', link: '/core-rules/equipment/' }],
		},
		{
			label: 'MAGIC',
			collapsed: true,
			items: [{ label: 'Spells', link: '/core-rules/spells/' }],
		},
	],
	heroes: [
		{ label: 'Heroes', link: '/heroes/' },
	],
	'game-masters-guide': [
		{ label: "Game Master's Guide", link: '/game-masters-guide/' },
	],
	adventures: [
		{ label: 'Adventures', link: '/adventures/' },
	],
	'monsters-and-more': [
		{ label: 'Monsters & More', link: '/monsters-and-more/' },
	],
	'creators-kit': [
		{ label: "Creator's Kit", link: '/creators-kit/' },
	],
} as const satisfies Record<SectionKey, readonly unknown[]>;

/** First path segment for multi-file sections, or the slug for top-level docs. */
export function getSectionKey(entryId: string): SectionKey | null {
	if (!entryId || entryId === '404') return null;
	const first = entryId.split('/')[0];
	if (first === 'core-rules') return 'core-rules';
	if (SECTION_KEYS.includes(first as SectionKey)) return first as SectionKey;
	return null;
}
