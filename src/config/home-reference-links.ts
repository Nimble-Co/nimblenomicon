/**
 * Flat index pages linked from the home landing (non-tile navigation).
 * Paths match each `src/pages/<slug>/index.astro` route.
 */
export const HOME_REFERENCE_LINKS = [
	{ label: 'Ancestries', href: '/ancestries/' },
	{ label: 'Armor', href: '/armor/' },
	{ label: 'Backgrounds', href: '/backgrounds/' },
	{ label: 'Classes', href: '/classes/' },
	{ label: 'Conditions', href: '/conditions/' },
	{ label: 'Glossary', href: '/glossary/' },
	{ label: 'Languages', href: '/languages/' },
	{ label: 'Magical Items', href: '/magical-items/' },
	{ label: 'Monsters', href: '/monsters/' },
	{ label: 'Misc. Equipment', href: '/misc-adventuring-equipment/' },
	{ label: 'Spells', href: '/spells/' },
	{ label: 'Weapons', href: '/weapons/' },
] as const;
