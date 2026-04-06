/**
 * List index href + label for “back to list” on each `src/pages/<section>/[id].astro` route.
 */
export const detailPageBackLinks = {
	spells: { href: '/spells/', label: 'All Spells' },
	monsters: { href: '/monsters/', label: 'All Monsters' },
	magicalItems: { href: '/magical-items/', label: 'All Magical Items' },
	weapons: { href: '/weapons/', label: 'All Weapons' },
	armor: { href: '/armor/', label: 'All Armor' },
	conditions: { href: '/conditions/', label: 'All Conditions' },
	glossary: { href: '/glossary/', label: 'All Glossary' },
	backgrounds: { href: '/backgrounds/', label: 'All Backgrounds' },
	ancestries: { href: '/ancestries/', label: 'All Ancestries' },
	languages: { href: '/languages/', label: 'All Languages' },
	miscAdventuringEquipment: {
		href: '/misc-adventuring-equipment/',
		label: 'All Misc. Adventuring Equipment',
	},
} as const;
