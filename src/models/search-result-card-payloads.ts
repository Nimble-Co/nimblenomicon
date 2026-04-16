/**
 * Build `SearchResultCardPayload` values for `cardJson` during Orama index generation.
 */
import { slugifyEntityId } from '../utils/slugifyEntityId';
import type { AncestryRowData } from './ancestries';
import { formatArmorCategoryLabel, type ArmorRowData } from './armor';
import type { BackgroundRowData } from './backgrounds';
import type { ConditionRowData } from './conditions';
import type { HeroClassData } from './class';
import type { GlossaryRowData } from './glossary';
import type {
	LegendaryCreatureData,
	LegendaryEntryData,
} from './legendary-monsters';
import type { LanguageRowData } from './languages';
import type { MagicalItemData } from './magical-items';
import type { MiscAdventuringEquipmentRowData } from './misc-adventuring-equipment';
import type { MonsterData, MonsterAction } from './monsters';
import { spellSchools } from './spell-schools';
import type { SpellData } from './spells';
import {
	MAX_ACTION_MD,
	MAX_BLOCK_MD,
	MAX_NOTES_MD,
	stringifySearchResultCard,
	truncateCardMd,
	type SearchResultCardPayload,
} from './search-result-card';
import { sizes } from './sizes';
import { formatWeaponCategory, type WeaponRowData } from './weapons';

/**
 * "Flavor Is Free" asides live in the same `trait` string as markdown blockquotes, not a separate JSON field.
 * Drop those paragraphs from search cards; other blockquotes (e.g. Half-Elves note) stay.
 */
export function stripFlavorIsFreeBlockquotesFromMarkdown(md: string): string {
	return md
		.split(/\n\n+/)
		.filter((block) => {
			const t = block.trim();
			if (!t.startsWith('>')) return true;
			return !/\bFlavor Is Free\b/i.test(t);
		})
		.join('\n\n')
		.trim();
}

function spellSchoolName(schoolId: string): string {
	return spellSchools.find((s) => s.id === schoolId)?.name ?? schoolId;
}

function sizeLabel(sizeSlug: string): string {
	const match = sizes.find((s) => slugifyEntityId(s.name, 'size') === sizeSlug);
	return match?.name ?? sizeSlug;
}

function actionHeading(action: MonsterAction): string {
	const uses = action.uses != null ? ` (${action.uses}x)` : '';
	const endsSentence = /[.!?;:]$/.test(action.name.trim());
	return `${action.name}${uses}${endsSentence ? '' : '.'}`;
}

const SAVE_LABEL = { str: 'STR', dex: 'DEX', int: 'INT', wil: 'WIL', all: 'ALL' } as const;

function legendarySaveBadges(saves: LegendaryCreatureData['saves']): string[] {
	if (!saves) return [];
	if (typeof saves.all === 'number' && saves.all !== 0) {
		const n = saves.all;
		const sign = n > 0 ? '+'.repeat(n) : '-'.repeat(-n);
		return [`ALL${sign}`];
	}
	const order = ['str', 'dex', 'int', 'wil'] as const;
	const out: string[] = [];
	for (const k of order) {
		const v = saves[k];
		if (typeof v === 'number' && v > 0) {
			out.push(`${SAVE_LABEL[k]}${'+'.repeat(v)}`);
		}
	}
	return out;
}

export function buildSpellCardPayload(spell: SpellData): SearchResultCardPayload {
	return {
		v: 1,
		kind: 'spell',
		schoolName: spellSchoolName(spell.schoolId),
		tierLabel: spell.tierLabel,
		castingTime: spell.castingTime?.trim() || undefined,
		targetLabel: spell.targetLabel,
		utility: spell.utility,
		secret: spell.secret,
		descriptionMd: truncateCardMd(spell.description),
	};
}

export function buildStandardMonsterCardPayload(
	m: MonsterData,
): SearchResultCardPayload {
	const familyName = m.family?.name;
	const familyAbilities =
		m.family && familyName
			? m.family.abilities.map((a) => ({
					name: `${familyName}: ${a.name}`,
					descriptionMd: truncateCardMd(a.description, MAX_BLOCK_MD),
				}))
			: [];

	return {
		v: 1,
		kind: 'monster',
		variant: 'standard',
		level: String(m.level),
		isMinion: m.isMinion,
		sizeSlug: m.size,
		hp: m.hp,
		armor: m.armor,
		movementMode: m.movement.mode,
		movementSpeed: m.movement.speed,
		kindName: m.kind?.name,
		familyName,
		familyAbilities,
		notesMd: m.notes ? truncateCardMd(m.notes, MAX_NOTES_MD) : undefined,
		specialAbilities: m.specialAbilities.map((a) => ({
			name: a.name,
			descriptionMd: truncateCardMd(a.description, MAX_BLOCK_MD),
		})),
		actions: m.actions.map((a) => ({
			name: actionHeading(a),
			uses: a.uses,
			descriptionMd: truncateCardMd(a.description, MAX_ACTION_MD),
			joinNext: a.joinNext,
		})),
	};
}

export function buildLegendaryMonsterCardPayload(
	leg: LegendaryEntryData,
): SearchResultCardPayload {
	const isTeam = leg.creatures.length > 1;
	return {
		v: 1,
		kind: 'monster',
		variant: 'legendary',
		level: String(leg.level),
		creatureType: leg.creatureType,
		isTeam,
		actionsIntro: leg.actionsIntro?.trim() || undefined,
		bloodiedMd: leg.bloodied
			? truncateCardMd(leg.bloodied, MAX_NOTES_MD)
			: undefined,
		lastStandMd: leg.lastStand
			? truncateCardMd(leg.lastStand, MAX_NOTES_MD)
			: undefined,
		notesMd: leg.notes ? truncateCardMd(leg.notes, MAX_NOTES_MD) : undefined,
		creatures: leg.creatures.map((c) => ({
			name: c.name,
			roleLabel: c.roleLabel,
			sizeSlug: c.size,
			hp: c.hp,
			armor: c.armor,
			movementMode: c.movement.mode,
			movementSpeed: c.movement.speed,
			saveBadges: legendarySaveBadges(c.saves),
			specialAbilities: c.specialAbilities.map((a) => ({
				name: a.name,
				descriptionMd: truncateCardMd(a.description, MAX_BLOCK_MD),
			})),
			actions: c.actions.map((a) => ({
				name: actionHeading(a),
				uses: a.uses,
				descriptionMd: truncateCardMd(a.description, MAX_ACTION_MD),
				joinNext: a.joinNext,
			})),
		})),
	};
}

export function buildClassCardPayload(c: HeroClassData): SearchResultCardPayload {
	return {
		v: 1,
		kind: 'class',
		hitDieLabel: c.hitDieLabel,
		keyStatsDisplay: c.keyStatsDisplay,
		savesDisplay: c.savesDisplay,
		weaponsDisplay: c.weaponsDisplay,
		armorDisplay: c.armorDisplay,
		gearDisplay: c.gearDisplay,
		descriptionMd: truncateCardMd(c.description),
	};
}

export function buildWeaponCardPayload(w: WeaponRowData): SearchResultCardPayload {
	return {
		v: 1,
		kind: 'weapon',
		categoryLabel: formatWeaponCategory(w.category),
		damage: w.damage,
		cost: w.cost,
		properties: w.propertyLines.map((p) => p.description),
	};
}

export function buildAncestryCardPayload(a: AncestryRowData): SearchResultCardPayload {
	const traitForCard = stripFlavorIsFreeBlockquotesFromMarkdown(a.trait);
	return {
		v: 1,
		kind: 'ancestry',
		excerptMd: truncateCardMd(
			[a.flavor, traitForCard].filter(Boolean).join('\n\n') || a.name,
		),
	};
}

export function buildBackgroundCardPayload(
	b: BackgroundRowData,
): SearchResultCardPayload {
	return {
		v: 1,
		kind: 'background',
		excerptMd: truncateCardMd(b.description),
	};
}

export function buildEquipmentCardPayload(
	row: MiscAdventuringEquipmentRowData,
): SearchResultCardPayload {
	return {
		v: 1,
		kind: 'equipment',
		excerptMd: truncateCardMd(row.description),
	};
}

export function buildMagicItemCardPayload(
	item: MagicalItemData,
): SearchResultCardPayload {
	return {
		v: 1,
		kind: 'magic-item',
		excerptMd: truncateCardMd(
			[item.subtitle, item.description].filter(Boolean).join('\n\n'),
		),
	};
}

export function buildGlossaryCardPayload(g: GlossaryRowData): SearchResultCardPayload {
	return {
		v: 1,
		kind: 'glossary',
		excerptMd: truncateCardMd(g.description),
	};
}

export function buildLanguageCardPayload(lang: LanguageRowData): SearchResultCardPayload {
	return {
		v: 1,
		kind: 'language',
		excerptMd: truncateCardMd(lang.description),
	};
}

export function buildConditionCardPayload(
	row: ConditionRowData,
): SearchResultCardPayload {
	return {
		v: 1,
		kind: 'condition',
		excerptMd: truncateCardMd(row.description),
	};
}

export function buildArmorCardPayload(row: ArmorRowData): SearchResultCardPayload {
	const cat = formatArmorCategoryLabel(row.category);
	return {
		v: 1,
		kind: 'armor',
		excerptMd: truncateCardMd(
			`**${cat}** — Armor ${row.armor}, Cost ${row.cost}`,
		),
	};
}

export { stringifySearchResultCard, sizeLabel };
