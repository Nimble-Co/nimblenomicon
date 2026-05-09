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
	formatMagicalItemKind,
	magicalItemDetailMarkdown,
	type MagicalItemData,
} from '../models/magical-items';
import {
	miscAdventuringEquipmentDetailMarkdown,
	type MiscAdventuringEquipmentRowData,
} from '../models/misc-adventuring-equipment';
import { spellSchools } from '../models/spell-schools';
import type { SpellData } from '../models/spells';
import {
	formatWeaponCategory,
	weaponDetailMarkdown,
	type WeaponRowData,
} from '../models/weapons';
import {
	coreRulesDocHref,
	gameMastersGuideDocHref,
	heroesDocHref,
} from '../utils/url';

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

function spellMetaMarkdown(spell: SpellData, schoolName: string): string {
	const components = [
		`${schoolName} Spell`,
		spell.tierLabel,
		spell.castingTime?.trim(),
		spell.targetLabel,
		spell.utility ? 'Utility' : '',
		spell.secret ? 'Secret' : '',
	];
	return `_${components.filter(Boolean).join(', ')}_`;
}

export function spellDetailPageProps(
	spell: SpellData,
): DetailPageMarkdownProps {
	const schoolName =
		spellSchools.find((school) => school.id === spell.schoolId)?.name ??
		spell.schoolId;
	const bodyMarkdown =
		spellMetaMarkdown(spell, schoolName) + '\n\n' + spell.description;
	const sourceHref =
		spell.source === 'core-rules'
			? coreRulesDocHref(spell.id)
			: gameMastersGuideDocHref(spell.id);
	const sourceName =
		spell.source === 'core-rules' ? 'Core Rules' : "Game Master's Guide";
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
		sourceHref: coreRulesDocHref(row.id),
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
		sourceHref: coreRulesDocHref(row.id),
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
					href: gameMastersGuideDocHref(row.id),
					sourceName: "Game Master's Guide",
				}
			: { href: coreRulesDocHref(row.id), sourceName: 'Core Rules' };
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
		sourceHref: coreRulesDocHref(row.id),
		sourceName: 'Core Rules',
		bodyMarkdown,
	};
}

export function backgroundDetailPageProps(
	row: BackgroundRowData,
): DetailPageMarkdownProps {
	return {
		title: row.name,
		description: `Character background — ${row.name}.`,
		backLabel: 'All Backgrounds',
		searchType: 'background',
		sourceHref: coreRulesDocHref(row.id),
		sourceName: 'Core Rules',
		bodyMarkdown: row.description?.trim() ?? '',
	};
}

export function conditionDetailPageProps(
	row: ConditionData,
): DetailPageMarkdownProps {
	return {
		title: row.name,
		description: `Condition — ${row.name}.`,
		backLabel: 'All Conditions',
		searchType: 'condition',
		sourceHref: coreRulesDocHref(row.id),
		sourceName: 'Core Rules',
		bodyMarkdown: row.description?.trim() ?? '',
	};
}

export function glossaryDetailPageProps(
	row: GlossaryEntryData,
): DetailPageMarkdownProps {
	return {
		title: row.name,
		description: `Glossary — ${row.name}.`,
		backLabel: 'All Glossary',
		searchType: 'glossary',
		sourceHref: coreRulesDocHref(row.id),
		sourceName: 'Core Rules',
		bodyMarkdown: row.description?.trim() ?? '',
	};
}

export function languageDetailPageProps(
	row: LanguageData,
): DetailPageMarkdownProps {
	return {
		title: row.name,
		description: `Language — ${row.name}.`,
		backLabel: 'All Languages',
		searchType: 'language',
		sourceHref: coreRulesDocHref(row.id),
		sourceName: 'Core Rules',
		bodyMarkdown: row.description?.trim() ?? '',
	};
}

export function miscEquipmentDetailPageProps(
	row: MiscAdventuringEquipmentRowData,
): DetailPageMarkdownProps {
	return {
		title: row.name,
		description: `Misc adventuring gear — ${row.name}.`,
		backLabel: 'All Misc. Adventuring Equipment',
		searchType: 'equipment',
		sourceHref: coreRulesDocHref(row.id),
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
		sourceHref: gameMastersGuideDocHref(record.id),
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
		sourceHref: heroesDocHref(heroClass.id),
		sourceName: 'Heroes',
	};
}
