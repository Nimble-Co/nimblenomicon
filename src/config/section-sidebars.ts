/**
 * Per-section Starlight sidebar configs. Each home tile / book gets its own nav tree;
 * other sections’ links do not appear in the sidebar.
 */
import type { ImageMetadata } from 'astro';
import adventuresIcon from '../assets/adventures.svg';
import coreRulesIcon from '../assets/core_rules.svg';
import creatorsKitIcon from '../assets/creators_kit.svg';
import gameMasterGuideIcon from '../assets/game_master_guide.svg';
import heroesIcon from '../assets/heroes.svg';
import monstersAndMoreIcon from '../assets/monsters_and_more.svg';

export const SECTION_KEYS = [
	'core-rules',
	'heroes',
	'game-masters-guide',
	'adventures',
	'monsters-and-more',
	'creators-kit',
] as const;

export type SectionKey = (typeof SECTION_KEYS)[number];

export type SectionPresentation = {
	label: string;
	path: string;
	icon: ImageMetadata;
	home: { width: number; height: number };
	sidebar: { width: number; height: number };
};

/** Single source for section labels, routes, icons, and image dimensions (home tiles + sidebar brand). */
export const SECTION_METADATA = {
	'core-rules': {
		label: 'Core Rules',
		path: '/core-rules/',
		icon: coreRulesIcon,
		home: { width: 20, height: 23 },
		sidebar: { width: 40, height: 46 },
	},
	heroes: {
		label: 'Heroes',
		path: '/heroes/',
		icon: heroesIcon,
		home: { width: 17, height: 25 },
		sidebar: { width: 34, height: 50 },
	},
	'game-masters-guide': {
		label: "Game Master's Guide",
		path: '/game-masters-guide/',
		icon: gameMasterGuideIcon,
		home: { width: 21, height: 18 },
		sidebar: { width: 42, height: 36 },
	},
	adventures: {
		label: 'Adventures',
		path: '/adventures/',
		icon: adventuresIcon,
		home: { width: 20, height: 18 },
		sidebar: { width: 40, height: 36 },
	},
	'monsters-and-more': {
		label: 'Monsters & More',
		path: '/monsters-and-more/',
		icon: monstersAndMoreIcon,
		home: { width: 20, height: 21 },
		sidebar: { width: 40, height: 42 },
	},
	'creators-kit': {
		label: "Creator's Kit",
		path: '/creators-kit/',
		icon: creatorsKitIcon,
		home: { width: 17, height: 23 },
		sidebar: { width: 34, height: 46 },
	},
} as const satisfies Record<SectionKey, SectionPresentation>;

/**
 * Starlight `sidebar` in `astro.config` (global fallback index). Same order and labels/paths as
 * `SECTION_KEYS` / `SECTION_METADATA` — import this from the Astro config instead of duplicating.
 */
export const STARLIGHT_GLOBAL_SIDEBAR = SECTION_KEYS.map((key) => ({
	label: SECTION_METADATA[key].label,
	link: SECTION_METADATA[key].path,
}));

/** Leaf link or collapsible group (Starlight manual sidebar shape). */
export type SectionSidebarRawItem =
	| { readonly label: string; readonly link: string }
	| {
			readonly label: string;
			readonly collapsed?: boolean;
			readonly items: readonly SectionSidebarRawItem[];
	  };

/** Per-section nav trees: one landing link per book (same shape for every section, including Core Rules). */
export const SECTION_SIDEBAR_CONFIG: {
	readonly [K in SectionKey]: readonly SectionSidebarRawItem[];
} = {
	...Object.fromEntries(
		SECTION_KEYS.map(
			(key) =>
				[
					key,
					[
						{
							label: SECTION_METADATA[key].label,
							link: SECTION_METADATA[key].path,
						},
					],
				] as const,
		),
	),
} as { readonly [K in SectionKey]: readonly SectionSidebarRawItem[] };

/** First path segment for multi-file sections, or the slug for top-level docs. */
export function getSectionKey(entryId: string): SectionKey | null {
	if (!entryId || entryId === '404') return null;
	const first = entryId.split('/')[0];
	if (first === 'core-rules') return 'core-rules';
	if (SECTION_KEYS.includes(first as SectionKey)) return first as SectionKey;
	return null;
}
