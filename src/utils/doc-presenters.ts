/**
 * Maps model rows to markdown lines / table props for generic doc components.
 * Keeps domain-specific formatting out of generic doc components under `src/components/`.
 */

import {
	ancestries,
	formatAncestrySize,
	type AncestryRowData,
} from '../models/ancestries';
import { adventuringMotivations } from '../models/adventuring-motivations';
import { backgrounds } from '../models/backgrounds';
import { characterClasses } from '../models/character-classes';
import { conditions } from '../models/conditions';
import { dcExamples } from '../models/dc-examples';
import { downtimeActivities } from '../models/downtime-activities';
import { glossary } from '../models/glossary';
import { languages } from '../models/languages';
import {
	magicalItemDetailHrefFromCoreRules,
	magicalItems,
	type MagicalItemData,
} from '../models/magical-items';
import { compareReferenceRowsByName } from './reference-index-sort';
import { optionalVariantRules } from '../models/optional-variant-rules';
import { saveTypes } from '../models/save-types';
import { sizes } from '../models/sizes';
import { skills } from '../models/skills';
import { spellSchools } from '../models/spell-schools';
import { statArrays } from '../models/stat-arrays';
import { stats } from '../models/stats';
import { weaponProperties } from '../models/weapon-properties';
import { chaosMagicRows } from '../models/chaos-magic';
import { gmgGoldByLevel } from '../models/gmg-gold-by-level';
import { gmgMonsterBuilderLevels } from '../models/gmg-monster-builder-levels';
import {
	armorDetailHrefFromCoreRules,
	armorRows,
	armorTableSections,
	type ArmorCategory,
} from '../models/armor';
import {
	miscAdventuringEquipment,
	miscAdventuringEquipmentDetailHrefFromCoreRules,
} from '../models/misc-adventuring-equipment';
import { magicalItemRarities } from '../models/magical-item-rarities';
import { spellScrollCosts } from '../models/spell-scroll-costs';
import { wandCosts } from '../models/wand-costs';
import {
	weaponDetailHrefFromCoreRules,
	weapons,
	type WeaponRowData,
} from '../models/weapons';

/** Matches `DataTable` column shape (defined here to avoid circular imports). */
export type DocTableColumn = {
	key: string;
	label: string;
	rowHeader?: boolean;
	markdown?: boolean;
	cellClass?: string;
	align?: 'start' | 'center' | 'end';
};

export type MarkdownLineItem = { id?: string; markdown: string };

export function statsParagraphLines(): MarkdownLineItem[] {
	return stats.map((stat) => ({
		markdown: `**${stat.name}** (${stat.stat}) ${stat.description}`,
	}));
}

export function skillsParagraphLines(): MarkdownLineItem[] {
	return skills.map((skill) => ({
		markdown: `**${skill.name}** (${skill.stat}) ${skill.description}`,
	}));
}

export function dcExampleBulletLines(): MarkdownLineItem[] {
	return dcExamples.map((row) => ({
		markdown: `**${row.name}:** ${row.description}`,
	}));
}

export function saveTypeBulletLines(): MarkdownLineItem[] {
	return saveTypes.map((st) => ({
		markdown: `**${st.name} Save.** ${st.description}`,
	}));
}

export function sizeBulletLines(): MarkdownLineItem[] {
	return sizes.map((size) => ({
		markdown: `**${size.name}** ${size.description}`,
	}));
}

export function conditionBulletLines(): MarkdownLineItem[] {
	return conditions.map((c) => ({
		id: c.id,
		markdown: `[**${c.name}.**](/conditions/${c.id}/) ${c.description}`,
	}));
}

export function downtimeBulletLines(): MarkdownLineItem[] {
	return downtimeActivities.map((a) => ({
		markdown: `**${a.name}.** ${a.description}`,
	}));
}

export function characterClassBulletLines(): MarkdownLineItem[] {
	return characterClasses.map((c) => ({
		markdown: `**${c.name.toUpperCase()}.** ${c.description}`,
	}));
}

export function statArrayBulletLines(): MarkdownLineItem[] {
	return statArrays.map((arr) => ({
		markdown: `**${arr.name}:** ${arr.description}`,
	}));
}

export function languageBulletLines(): MarkdownLineItem[] {
	return languages.map((lang) => ({
		id: lang.id,
		markdown: `[**${lang.name}.**](/languages/${lang.id}/) ${lang.description}`,
	}));
}

export function weaponPropertyBulletLines(): MarkdownLineItem[] {
	return weaponProperties.map((wp) => ({
		markdown: `**${wp.name}.** ${wp.description}`,
	}));
}

export function spellSchoolBulletLines(): MarkdownLineItem[] {
	return spellSchools.map((school) => ({
		markdown: `**${school.name} Spells.** ${school.description}`,
	}));
}

export function glossaryParagraphLines(): MarkdownLineItem[] {
	return glossary.map((entry) => ({
		id: entry.id,
		markdown: `[**${entry.name}.**](/glossary/${entry.id}/) ${entry.description}`,
	}));
}

export function backgroundsBlockLines(): MarkdownLineItem[] {
	return backgrounds.map((segment) => ({
		id: segment.id,
		markdown: `[**${segment.name}.**](/backgrounds/${segment.id}/) ${segment.description}`,
	}));
}

export function adventuringMotivationParagraphLines(): MarkdownLineItem[] {
	return adventuringMotivations.map((m) => ({
		markdown: `**${m.name}** ${m.description}`,
	}));
}

export function optionalVariantRuleSections(): {
	id?: string;
	title: string;
	bodyMarkdown: string;
}[] {
	return optionalVariantRules.map((rule) => ({
		title: rule.name,
		bodyMarkdown: rule.description,
	}));
}

export function ancestryBlocks(section: 'common' | 'exotic'): {
	id: string;
	title: string;
	href: string;
	metaLine?: string;
	flavor?: string;
	bodyMarkdown: string;
}[] {
	const rows = ancestries.filter((a) => a.section === section);
	return rows.map((a: AncestryRowData) => ({
		id: a.id,
		title: a.name,
		href: `/ancestries/${a.id}`,
		metaLine: `(${formatAncestrySize(a.size)})`,
		flavor: a.flavor,
		bodyMarkdown: a.trait,
	}));
}

export function magicalItemBlocks(
	kind?: MagicalItemData['kind'],
	opts?: {
		source?: MagicalItemData['source'];
		adventuringRewardCategory?: MagicalItemData['adventuringRewardCategory'];
	},
): {
	id: string;
	title: string;
	href: string;
	subtitleMarkdown?: string;
	bodyMarkdown: string;
}[] {
	const rows = kind
		? magicalItems
				.filter((item) => item.kind === kind)
				.sort(compareReferenceRowsByName)
		: [...magicalItems].sort(compareReferenceRowsByName);

	const filtered = rows.filter((row) => {
		if (opts?.source && row.source !== opts.source) return false;
		if (
			typeof opts?.adventuringRewardCategory !== 'undefined' &&
			row.adventuringRewardCategory !== opts.adventuringRewardCategory
		) {
			return false;
		}
		return true;
	});

	return filtered.map((item) => ({
		id: item.id,
		title: item.name,
		href: magicalItemDetailHrefFromCoreRules(item.id),
		subtitleMarkdown: item.subtitle?.trim() || undefined,
		bodyMarkdown: item.description,
	}));
}

const WEAPONS_COLUMNS: DocTableColumn[] = [
	{ key: 'name', label: 'ITEM', rowHeader: true, markdown: true },
	{ key: 'damage', label: 'DAMAGE' },
	{ key: 'properties', label: 'PROPERTIES' },
	{ key: 'cost', label: 'COST', align: 'end' },
];

export function weaponsTableRows(
	category: 'melee' | 'ranged',
): Record<string, unknown>[] {
	return weapons
		.filter((w) => w.category === category)
		.map((w: WeaponRowData) => ({
			id: w.id,
			name: `[${w.name}](${weaponDetailHrefFromCoreRules(w.id)})`,
			damage: w.damage,
			properties: w.propertyLines.map((p) => p.description).join(', '),
			cost: w.cost,
		}));
}

export function coreRulesWeaponsTable(category: 'melee' | 'ranged'): {
	columns: DocTableColumn[];
	rows: Record<string, unknown>[];
} {
	return { columns: WEAPONS_COLUMNS, rows: weaponsTableRows(category) };
}

const ARMOR_COLUMNS: DocTableColumn[] = [
	{ key: 'name', label: 'ITEM', rowHeader: true, markdown: true },
	{ key: 'armor', label: 'ARMOR' },
	{ key: 'cost', label: 'COST', align: 'end' },
];

export function armorTableSectionsData(): {
	sectionLabel: string;
	columns: DocTableColumn[];
	rows: Record<string, unknown>[];
}[] {
	return armorTableSections.map(
		({ category: cat, label }: { category: ArmorCategory; label: string }) => ({
			sectionLabel: label,
			columns: ARMOR_COLUMNS,
			rows: armorRows
				.filter((row) => row.category === cat)
				.map((row) => ({
					id: row.id,
					name: `[${row.name}](${armorDetailHrefFromCoreRules(row.id)})`,
					armor: row.armor,
					cost: row.cost,
				})),
		}),
	);
}

const MISC_EQUIP_COLUMNS: DocTableColumn[] = [
	{ key: 'name', label: 'ITEM', rowHeader: true, markdown: true },
	{ key: 'description', label: 'PROPERTIES', markdown: true },
	{ key: 'cost', label: 'COST', align: 'end' },
];

export function miscAdventuringEquipmentTable(): {
	columns: DocTableColumn[];
	rows: Record<string, unknown>[];
} {
	return {
		columns: MISC_EQUIP_COLUMNS,
		rows: miscAdventuringEquipment.map((row) => ({
			id: row.id,
			name: `[${row.name}](${miscAdventuringEquipmentDetailHrefFromCoreRules(row.id)})`,
			description: row.description,
			cost: row.cost,
		})),
	};
}

const MAGICAL_RARITY_COLUMNS: DocTableColumn[] = [
	{ key: 'name', label: 'RARITY' },
	{ key: 'availability', label: 'TYPICAL AVAILABILITY' },
	{ key: 'cost', label: 'COST', align: 'end' },
];

export function magicalItemRaritiesTable(): {
	columns: DocTableColumn[];
	rows: Record<string, unknown>[];
} {
	return {
		columns: MAGICAL_RARITY_COLUMNS,
		rows: magicalItemRarities.map((row) => ({
			name: row.name,
			availability: row.availability,
			cost: row.cost,
		})),
	};
}

const SPELL_PRICE_COLUMNS: DocTableColumn[] = [
	{ key: 'name', label: 'SPELL' },
	{ key: 'cost', label: 'TYPICAL PRICE', align: 'end' },
];

export function spellScrollCostsTable(): {
	columns: DocTableColumn[];
	rows: Record<string, unknown>[];
} {
	return {
		columns: SPELL_PRICE_COLUMNS,
		rows: spellScrollCosts.map((row) => ({
			name: row.name,
			cost: row.cost,
		})),
	};
}

export function wandCostsTable(): {
	columns: DocTableColumn[];
	rows: Record<string, unknown>[];
} {
	return {
		columns: SPELL_PRICE_COLUMNS,
		rows: wandCosts.map((row) => ({
			name: row.name,
			cost: row.cost,
		})),
	};
}

const CHAOS_COLUMNS: DocTableColumn[] = [
	{
		key: 'roll',
		label: 'd20',
		cellClass: 'whitespace-nowrap font-variant-numeric tabular-nums',
	},
	{ key: 'name', label: 'Name' },
	{ key: 'description', label: 'Effect' },
];

export function chaosMagicTable(): {
	columns: DocTableColumn[];
	rows: Record<string, unknown>[];
} {
	return {
		columns: CHAOS_COLUMNS,
		rows: chaosMagicRows.map((row) => ({
			roll: row.roll,
			name: row.name,
			description: row.description,
		})),
	};
}

const GOLD_BY_LEVEL_COLUMNS: DocTableColumn[] = [
	{ key: 'level', label: 'Level' },
	{ key: 'gold', label: 'Gold', align: 'end' },
];

export function gmgGoldByLevelTable(): {
	columns: DocTableColumn[];
	rows: Record<string, unknown>[];
} {
	return {
		columns: GOLD_BY_LEVEL_COLUMNS,
		rows: gmgGoldByLevel.map((row) => ({
			level: row.level,
			gold: row.gold.toLocaleString(),
		})),
	};
}

const MONSTER_BUILDER_COLUMNS: DocTableColumn[] = [
	{ key: 'level', label: 'Monster Level' },
	{
		key: 'hpNoArmor',
		label: 'HP (no armor)',
		cellClass: 'whitespace-nowrap',
		align: 'end',
	},
	{
		key: 'hpMediumArmor',
		label: 'HP (M)',
		cellClass: 'whitespace-nowrap',
		align: 'end',
	},
	{
		key: 'hpHeavyArmor',
		label: 'HP (H)',
		cellClass: 'whitespace-nowrap',
		align: 'end',
	},
	{
		key: 'damagePerRound',
		label: 'Dmg / round',
		cellClass: 'whitespace-nowrap',
		align: 'end',
	},
	{
		key: 'attackSampleDice',
		label: 'Attack (sample)',
		cellClass: 'min-w-40 whitespace-normal',
	},
	{
		key: 'saveDC',
		label: 'Save DC',
		cellClass: 'whitespace-nowrap',
		align: 'end',
	},
	{
		key: 'crEquivalent',
		label: 'CR equiv.',
		cellClass: 'whitespace-nowrap',
		align: 'end',
	},
];

export function gmgMonsterBuilderTable(): {
	columns: DocTableColumn[];
	rows: Record<string, unknown>[];
} {
	return {
		columns: MONSTER_BUILDER_COLUMNS,
		rows: gmgMonsterBuilderLevels.map((row) => ({ ...row })),
	};
}
