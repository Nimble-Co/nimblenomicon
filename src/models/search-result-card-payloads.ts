/**
 * Build `SearchResultCardPayload` values for `cardJson` during Orama index generation.
 */
import { actionHeading, legendarySaveBadges } from './creature-stat-display';
import type { AncestryRowData } from './ancestries';
import { formatArmorCategoryLabel, type ArmorRowData } from './armor';
import type { BackgroundRowData } from './backgrounds';
import type { ConditionRowData } from './conditions';
import type { HeroClassData } from './class';
import type { GlossaryRowData } from './glossary';
import type { LegendaryEntryData } from './legendary-monsters';
import type { LanguageRowData } from './languages';
import type { MagicalItemData } from './magical-items';
import type { MiscAdventuringEquipmentRowData } from './misc-adventuring-equipment';
import { spellSchoolDisplayName } from './catalog-display-text';
import type { MonsterData } from './monsters';
import type { SpellData } from './spells';
import {
	MAX_ACTION_MD,
	MAX_BLOCK_MD,
	MAX_NOTES_MD,
	stringifySearchResultCard,
	truncateCardMd,
	type SearchResultCardPayload,
} from './search-result-card';
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

type SimpleExcerptCardKind =
	| 'background'
	| 'glossary'
	| 'language'
	| 'condition'
	| 'equipment';

function buildSimpleExcerptCardPayload(
	kind: SimpleExcerptCardKind,
	description: string,
): SearchResultCardPayload {
	return {
		v: 1,
		kind,
		excerptMd: truncateCardMd(description),
	};
}

export function buildSpellCardPayload(
	spell: SpellData,
): SearchResultCardPayload {
	return {
		v: 1,
		kind: 'spell',
		schoolName: spellSchoolDisplayName(spell.schoolId),
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

export function buildClassCardPayload(
	c: HeroClassData,
): SearchResultCardPayload {
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

export function buildWeaponCardPayload(
	w: WeaponRowData,
): SearchResultCardPayload {
	return {
		v: 1,
		kind: 'weapon',
		categoryLabel: formatWeaponCategory(w.category),
		damage: w.damage,
		cost: w.cost,
		properties: w.propertyLines.map((p) => p.description),
	};
}

export function buildAncestryCardPayload(
	a: AncestryRowData,
): SearchResultCardPayload {
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
	return buildSimpleExcerptCardPayload('background', b.description);
}

export function buildEquipmentCardPayload(
	row: MiscAdventuringEquipmentRowData,
): SearchResultCardPayload {
	return buildSimpleExcerptCardPayload('equipment', row.description);
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

export function buildGlossaryCardPayload(
	g: GlossaryRowData,
): SearchResultCardPayload {
	return buildSimpleExcerptCardPayload('glossary', g.description);
}

export function buildLanguageCardPayload(
	lang: LanguageRowData,
): SearchResultCardPayload {
	return buildSimpleExcerptCardPayload('language', lang.description);
}

export function buildConditionCardPayload(
	row: ConditionRowData,
): SearchResultCardPayload {
	return buildSimpleExcerptCardPayload('condition', row.description);
}

export function buildArmorCardPayload(
	row: ArmorRowData,
): SearchResultCardPayload {
	const cat = formatArmorCategoryLabel(row.category);
	return {
		v: 1,
		kind: 'armor',
		excerptMd: truncateCardMd(
			`**${cat}** — Armor ${row.armor}, Cost ${row.cost}`,
		),
	};
}

export { stringifySearchResultCard };
