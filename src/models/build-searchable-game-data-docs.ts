/**
 * Builds full-text Orama documents from validated Nimble game data (single projection seam).
 * Consumed by `scripts/build-orama-index.ts` and tests.
 */
import {
	ancestries,
	ancestryDetailHrefFromCoreRules,
	formatAncestrySectionLabel,
	formatAncestrySize,
} from './ancestries';
import { backgrounds, backgroundDetailHrefFromCoreRules } from './backgrounds';
import { conditions, conditionDetailHrefFromCoreRules } from './conditions';
import { heroClasses } from './class';
import { glossary, glossaryDetailHrefFromCoreRules } from './glossary';
import { legendaryMonsters } from './legendary-monsters';
import {
	armorRows,
	armorDetailHrefFromCoreRules,
	formatArmorCategoryLabel,
} from './armor';
import { languages, languageDetailHrefFromCoreRules } from './languages';
import {
	magicalItems,
	magicalItemDetailHrefFromCoreRules,
} from './magical-items';
import {
	miscAdventuringEquipment,
	miscAdventuringEquipmentDetailHrefFromCoreRules,
} from './misc-adventuring-equipment';
import { monsters, type MonsterData } from './monsters';
import { spells, type SpellData } from './spells';
import { spellSchools } from './spell-schools';
import { weapons, weaponDetailHrefFromCoreRules } from './weapons';
import {
	buildAncestryCardPayload,
	buildArmorCardPayload,
	buildBackgroundCardPayload,
	buildClassCardPayload,
	buildConditionCardPayload,
	buildEquipmentCardPayload,
	buildGlossaryCardPayload,
	buildLanguageCardPayload,
	buildLegendaryMonsterCardPayload,
	buildMagicItemCardPayload,
	buildSpellCardPayload,
	buildStandardMonsterCardPayload,
	buildWeaponCardPayload,
	stringifySearchResultCard,
} from './search-result-card-payloads';
import {
	emptyOramaFilterFields,
	type OramaFilterFields,
	type SearchableGameDataDoc,
} from './orama-game-data-index';
import {
	spellFilterFields,
	monsterFilterFields,
	legendaryMonsterFilterFields,
	classFilterFields,
	weaponFilterFields,
	ancestryFilterFields,
	armorFilterFields,
	magicItemFilterFields,
} from './search-filters';

const MAX_CONTENT_LEN = 48_000;

function truncate(text: string): string {
	if (text.length <= MAX_CONTENT_LEN) return text;
	return `${text.slice(0, MAX_CONTENT_LEN)}…`;
}

function joinText(
	...parts: (string | number | undefined | null | false)[]
): string {
	return parts
		.filter((p) => p !== undefined && p !== null && p !== false && p !== '')
		.map(String)
		.join('\n')
		.trim();
}

function blocksToText(
	blocks: readonly { name: string; description: string }[],
): string {
	return blocks.map((b) => `${b.name}. ${b.description}`).join('\n');
}

function spellSchoolName(schoolId: string): string {
	return spellSchools.find((s) => s.id === schoolId)?.name ?? schoolId;
}

function formatMagicalItemKind(kind: 'standard' | 'wand'): string {
	return kind === 'wand' ? 'Wand' : 'Magic item';
}

function spellSubtitle(spell: SpellData): string {
	const parts = [
		spellSchoolName(spell.schoolId),
		spell.tierLabel,
		spell.utility ? 'Utility' : '',
		spell.secret ? 'Secret' : '',
	].filter(Boolean);
	return parts.join(' · ');
}

function monsterSearchContent(m: MonsterData): string {
	const kindName = m.kind?.name;
	const familyName = m.family?.name;
	const actionText = m.actions
		.map((a) => {
			const u = a.uses != null ? ` (${a.uses} uses)` : '';
			return `${a.name}${u}: ${a.description}`;
		})
		.join('\n');
	return truncate(
		joinText(
			m.name,
			`Level ${m.level}`,
			m.isMinion ? 'Minion' : '',
			`Size ${m.size}`,
			m.hp != null ? `HP ${m.hp}` : '',
			`Armor ${m.armor}`,
			kindName ? `Kind ${kindName}` : '',
			familyName ? `Family ${familyName}` : '',
			m.notes,
			blocksToText(m.specialAbilities),
			actionText,
		),
	);
}

type DocWithoutFilters = Omit<SearchableGameDataDoc, keyof OramaFilterFields>;

function mergeDoc(
	base: DocWithoutFilters,
	filterPatch: Partial<OramaFilterFields>,
): SearchableGameDataDoc {
	return {
		...base,
		...emptyOramaFilterFields(),
		...filterPatch,
	};
}

/** Full Orama rows for game-data search: one row per catalog entity with facets and card JSON. */
export function buildSearchableGameDataDocs(): SearchableGameDataDoc[] {
	const docs: SearchableGameDataDoc[] = [];

	for (const a of ancestries) {
		docs.push(
			mergeDoc(
				{
					id: `ancestry:${a.id}`,
					type: 'ancestry',
					title: a.name,
					subtitle: `${formatAncestrySectionLabel(a.section)} · ${formatAncestrySize(a.size)}`,
					href: ancestryDetailHrefFromCoreRules(a.id),
					content: truncate(
						joinText(a.name, a.section, a.size, a.flavor, a.trait),
					),
					cardJson: stringifySearchResultCard(buildAncestryCardPayload(a)),
				},
				ancestryFilterFields(a),
			),
		);
	}

	for (const c of heroClasses) {
		const levelChunks: string[] = [];
		for (const row of c.levels) {
			levelChunks.push(`Level ${row.level}`);
			levelChunks.push(blocksToText(row.abilities));
		}
		for (const sub of c.subclasses) {
			levelChunks.push(`Subclass ${sub.name}`);
			for (const row of sub.levels) {
				levelChunks.push(`Level ${row.level}`);
				levelChunks.push(blocksToText(row.abilities));
			}
		}
		for (const list of c.abilityLists) {
			levelChunks.push(`Ability list ${list.name}`);
			levelChunks.push(list.description);
			levelChunks.push(blocksToText(list.items));
		}
		docs.push(
			mergeDoc(
				{
					id: `class:${c.id}`,
					type: 'class',
					title: c.name,
					subtitle: joinText(c.hitDieLabel, c.keyStatsDisplay) || c.name,
					href: `/classes/${c.id}/`,
					content: truncate(
						joinText(
							c.name,
							c.description,
							c.introduction,
							c.savesDisplay,
							c.weaponsDisplay,
							c.armorDisplay,
							c.gearDisplay,
							...levelChunks,
						),
					),
					cardJson: stringifySearchResultCard(buildClassCardPayload(c)),
				},
				classFilterFields(c),
			),
		);
	}

	for (const b of backgrounds) {
		docs.push(
			mergeDoc(
				{
					id: `background:${b.id}`,
					type: 'background',
					title: b.name,
					subtitle: '',
					href: backgroundDetailHrefFromCoreRules(b.id),
					content: truncate(joinText(b.name, b.description)),
					cardJson: stringifySearchResultCard(buildBackgroundCardPayload(b)),
				},
				{},
			),
		);
	}

	for (const row of miscAdventuringEquipment) {
		docs.push(
			mergeDoc(
				{
					id: `equipment:${row.id}`,
					type: 'equipment',
					title: row.name,
					subtitle: row.cost,
					href: miscAdventuringEquipmentDetailHrefFromCoreRules(row.id),
					content: truncate(joinText(row.name, row.cost, row.description)),
					cardJson: stringifySearchResultCard(buildEquipmentCardPayload(row)),
				},
				{},
			),
		);
	}

	for (const item of magicalItems) {
		docs.push(
			mergeDoc(
				{
					id: `magic-item:${item.id}`,
					type: 'magic-item',
					title: item.name,
					subtitle: item.subtitle?.trim() ?? formatMagicalItemKind(item.kind),
					href: magicalItemDetailHrefFromCoreRules(item.id),
					content: truncate(
						joinText(item.name, item.subtitle, item.description, item.source),
					),
					cardJson: stringifySearchResultCard(buildMagicItemCardPayload(item)),
				},
				magicItemFilterFields(item),
			),
		);
	}

	for (const w of weapons) {
		const props = w.propertyLines.map((p) => p.description).join(', ');
		docs.push(
			mergeDoc(
				{
					id: `weapon:${w.id}`,
					type: 'weapon',
					title: w.name,
					subtitle: joinText(w.damage, w.cost),
					href: weaponDetailHrefFromCoreRules(w.id),
					content: truncate(
						joinText(
							w.name,
							w.category,
							w.damage,
							w.cost,
							props ? `Properties: ${props}` : '',
						),
					),
					cardJson: stringifySearchResultCard(buildWeaponCardPayload(w)),
				},
				weaponFilterFields(w),
			),
		);
	}

	for (const spell of spells) {
		docs.push(
			mergeDoc(
				{
					id: `spell:${spell.id}`,
					type: 'spell',
					title: spell.name,
					subtitle: spellSubtitle(spell),
					href: `/spells/${spell.id}/`,
					content: truncate(
						joinText(
							spell.name,
							spellSchoolName(spell.schoolId),
							spell.tierLabel,
							spell.castingTime,
							spell.targetLabel,
							spell.description,
						),
					),
					cardJson: stringifySearchResultCard(buildSpellCardPayload(spell)),
				},
				spellFilterFields(spell),
			),
		);
	}

	for (const g of glossary) {
		docs.push(
			mergeDoc(
				{
					id: `glossary:${g.id}`,
					type: 'glossary',
					title: g.name,
					subtitle: '',
					href: glossaryDetailHrefFromCoreRules(g.id),
					content: truncate(joinText(g.name, g.description)),
					cardJson: stringifySearchResultCard(buildGlossaryCardPayload(g)),
				},
				{},
			),
		);
	}

	for (const row of conditions) {
		docs.push(
			mergeDoc(
				{
					id: `condition:${row.id}`,
					type: 'condition',
					title: row.name,
					subtitle: '',
					href: conditionDetailHrefFromCoreRules(row.id),
					content: truncate(joinText(row.name, row.description)),
					cardJson: stringifySearchResultCard(buildConditionCardPayload(row)),
				},
				{},
			),
		);
	}

	for (const m of monsters) {
		docs.push(
			mergeDoc(
				{
					id: `monster:${m.id}`,
					type: 'monster',
					title: m.name,
					subtitle: `Level ${m.level}`,
					href: `/monsters/${m.id}/`,
					content: monsterSearchContent(m),
					cardJson: stringifySearchResultCard(
						buildStandardMonsterCardPayload(m),
					),
				},
				monsterFilterFields(m),
			),
		);
	}

	for (const leg of legendaryMonsters) {
		const creatureParts: string[] = [];
		for (const c of leg.creatures) {
			creatureParts.push(c.name ?? leg.name);
			creatureParts.push(blocksToText(c.specialAbilities));
			creatureParts.push(
				c.actions.map((a) => `${a.name}: ${a.description}`).join('\n'),
			);
		}
		docs.push(
			mergeDoc(
				{
					id: `monster:${leg.id}`,
					type: 'monster',
					title: leg.name,
					subtitle: `Level ${leg.level} · Legendary`,
					href: `/monsters/${leg.id}/`,
					content: truncate(
						joinText(
							leg.name,
							leg.creatureType,
							`Level ${leg.level}`,
							leg.actionsIntro,
							leg.bloodied,
							leg.lastStand,
							leg.notes,
							...creatureParts,
						),
					),
					cardJson: stringifySearchResultCard(
						buildLegendaryMonsterCardPayload(leg),
					),
				},
				legendaryMonsterFilterFields(leg),
			),
		);
	}

	for (const row of armorRows) {
		docs.push(
			mergeDoc(
				{
					id: `armor:${row.id}`,
					type: 'armor',
					title: row.name,
					subtitle: formatArmorCategoryLabel(row.category),
					href: armorDetailHrefFromCoreRules(row.id),
					content: truncate(
						joinText(
							row.name,
							formatArmorCategoryLabel(row.category),
							row.armor,
							row.cost,
						),
					),
					cardJson: stringifySearchResultCard(buildArmorCardPayload(row)),
				},
				armorFilterFields(row),
			),
		);
	}

	for (const lang of languages) {
		docs.push(
			mergeDoc(
				{
					id: `language:${lang.id}`,
					type: 'language',
					title: lang.name,
					subtitle: '',
					href: languageDetailHrefFromCoreRules(lang.id),
					content: truncate(joinText(lang.name, lang.description)),
					cardJson: stringifySearchResultCard(buildLanguageCardPayload(lang)),
				},
				{},
			),
		);
	}

	return docs;
}
