/**
 * Props for [`DetailPage.astro`](../components/DetailPage.astro): shell metadata + optional markdown body.
 */
import type { OramaDataSearchType } from '../constants/orama-data-search';
import type { HeroClassData } from '../models/class';
import type { LegendaryEntryData } from '../models/legendary-monsters';
import type { MonsterData } from '../models/monsters';
import {
	armorDetailMarkdown,
	formatArmorCategoryLabel,
	type ArmorRowData,
} from '../models/armor';
import {
	formatAncestrySectionLabel,
	formatAncestrySize,
	type AncestryRowData,
} from '../models/ancestries';
import type { BackgroundRowData } from '../models/backgrounds';
import type { ConditionData } from '../models/conditions';
import type { GlossaryEntryData } from '../models/glossary';
import type { LanguageData } from '../models/languages';
import {
	spellDetailMetaMarkdown,
	spellSchoolDisplayName,
} from '../models/catalog-display-text';
import {
	formatMagicalItemKind,
	magicalItemDetailMarkdown,
	type MagicalItemData,
} from '../models/magical-items';
import {
	miscAdventuringEquipmentDetailMarkdown,
	type MiscAdventuringEquipmentRowData,
} from '../models/misc-adventuring-equipment';
import type { SpellData } from '../models/spells';
import {
	formatWeaponCategory,
	weaponDetailMarkdown,
	type WeaponRowData,
} from '../models/weapons';

export type DetailPageShellProps = {
	title: string;
	description: string;
	backLabel: string;
	searchType: OramaDataSearchType;
	sourceHref: string;
	sourceName: string;
};

export type DetailPageMarkdownProps = DetailPageShellProps & {
	bodyMarkdown: string;
};

type SimpleMarkdownDetailRow = {
	id: string;
	name: string;
	description?: string;
};

function simpleMarkdownDetailPageProps(
	row: SimpleMarkdownDetailRow,
	config: {
		descriptionPrefix: string;
		backLabel: string;
		searchType: OramaDataSearchType;
	},
): DetailPageMarkdownProps {
	return {
		title: row.name,
		description: `${config.descriptionPrefix} — ${row.name}.`,
		backLabel: config.backLabel,
		searchType: config.searchType,
		sourceHref: `/core-rules/#${row.id}`,
		sourceName: 'Core Rules',
		bodyMarkdown: row.description?.trim() ?? '',
	};
}

export function spellDetailPageProps(
	spell: SpellData,
): DetailPageMarkdownProps {
	const bodyMarkdown =
		spellDetailMetaMarkdown(spell) + '\n\n' + spell.description;
	const sourceHref = `/${spell.source}/#${spell.id}`;
	const sourceName =
		spell.source === 'core-rules' ? 'Core Rules' : "Game Master's Guide";
	const schoolName = spellSchoolDisplayName(spell.schoolId);
	return {
		title: spell.name,
		description: `${schoolName} school — ${spell.name}.`,
		backLabel: 'All Spells',
		searchType: 'spell',
		sourceHref,
		sourceName,
		bodyMarkdown,
	};
}

export function weaponDetailPageProps(
	row: WeaponRowData,
): DetailPageMarkdownProps {
	const cat = formatWeaponCategory(row.category);
	return {
		title: row.name,
		description: `${cat} weapon — ${row.name}.`,
		backLabel: 'All Weapons',
		searchType: 'weapon',
		sourceHref: `/core-rules/#${row.id}`,
		sourceName: 'Core Rules',
		bodyMarkdown: weaponDetailMarkdown(row),
	};
}

export function armorDetailPageProps(
	row: ArmorRowData,
): DetailPageMarkdownProps {
	const section = formatArmorCategoryLabel(row.category);
	return {
		title: row.name,
		description: `${section} — ${row.name}.`,
		backLabel: 'All Armor',
		searchType: 'armor',
		sourceHref: `/core-rules/#${row.id}`,
		sourceName: 'Core Rules',
		bodyMarkdown: armorDetailMarkdown(row),
	};
}

export function magicalItemDetailPageProps(
	row: MagicalItemData,
): DetailPageMarkdownProps {
	const typeLabel = formatMagicalItemKind(row.kind);
	const sourceRef =
		row.source === 'game-masters-guide'
			? {
					href: `/game-masters-guide/#${row.id}`,
					sourceName: "Game Master's Guide",
				}
			: { href: `/core-rules/#${row.id}`, sourceName: 'Core Rules' };
	return {
		title: row.name,
		description: `${typeLabel} — ${row.name}.`,
		backLabel: 'All Magical Items',
		searchType: 'magic-item',
		sourceHref: sourceRef.href,
		sourceName: sourceRef.sourceName,
		bodyMarkdown: magicalItemDetailMarkdown(row),
	};
}

export function ancestryDetailPageProps(
	row: AncestryRowData,
): DetailPageMarkdownProps {
	const sectionLabel = formatAncestrySectionLabel(row.section);
	const bodyMarkdown =
		`**(${formatAncestrySize(row.size)})** ${sectionLabel} ancestry.\n\n` +
		row.flavor +
		'\n\n' +
		row.trait;
	return {
		title: row.name,
		description: `${sectionLabel} ancestry — ${row.name}.`,
		backLabel: 'All Ancestries',
		searchType: 'ancestry',
		sourceHref: `/core-rules/#${row.id}`,
		sourceName: 'Core Rules',
		bodyMarkdown,
	};
}

export function backgroundDetailPageProps(
	row: BackgroundRowData,
): DetailPageMarkdownProps {
	return simpleMarkdownDetailPageProps(row, {
		descriptionPrefix: 'Character background',
		backLabel: 'All Backgrounds',
		searchType: 'background',
	});
}

export function conditionDetailPageProps(
	row: ConditionData,
): DetailPageMarkdownProps {
	return simpleMarkdownDetailPageProps(row, {
		descriptionPrefix: 'Condition',
		backLabel: 'All Conditions',
		searchType: 'condition',
	});
}

export function glossaryDetailPageProps(
	row: GlossaryEntryData,
): DetailPageMarkdownProps {
	return simpleMarkdownDetailPageProps(row, {
		descriptionPrefix: 'Glossary',
		backLabel: 'All Glossary',
		searchType: 'glossary',
	});
}

export function languageDetailPageProps(
	row: LanguageData,
): DetailPageMarkdownProps {
	return simpleMarkdownDetailPageProps(row, {
		descriptionPrefix: 'Language',
		backLabel: 'All Languages',
		searchType: 'language',
	});
}

export function miscEquipmentDetailPageProps(
	row: MiscAdventuringEquipmentRowData,
): DetailPageMarkdownProps {
	return {
		title: row.name,
		description: `Misc adventuring gear — ${row.name}.`,
		backLabel: 'All Misc. Adventuring Equipment',
		searchType: 'equipment',
		sourceHref: `/core-rules/#${row.id}`,
		sourceName: 'Core Rules',
		bodyMarkdown: miscAdventuringEquipmentDetailMarkdown(row),
	};
}

export function monsterDetailPageShell(
	variant: 'monster' | 'legendary',
	record: MonsterData | LegendaryEntryData,
): DetailPageShellProps {
	const title = record.name;
	const description =
		variant === 'monster'
			? `Monster stat block — ${record.name}.`
			: `Legendary monster — ${record.name}.`;
	return {
		title,
		description,
		backLabel: 'All Monsters',
		searchType: 'monster',
		sourceHref: `/game-masters-guide/#${record.id}`,
		sourceName: "Game Master's Guide",
	};
}

export function classDetailPageShell(
	heroClass: HeroClassData,
): DetailPageShellProps {
	return {
		title: heroClass.name,
		description: `Hero class — ${heroClass.name}.`,
		backLabel: 'All Classes',
		searchType: 'class',
		sourceHref: `/heroes/#${heroClass.id}`,
		sourceName: 'Heroes',
	};
}
