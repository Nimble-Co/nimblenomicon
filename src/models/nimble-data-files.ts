/**
 * Build-time JSON modules for game data. Imported here once so the custom content loader
 * and synchronous fallbacks (`nimble-game-data-raw`) share the same source files.
 */
import type { NimbleJsonId } from './nimble-json-ids';

import adventuringMotivations from '../data/adventuring-motivations.json';
import ancestries from '../data/ancestries.json';
import armor from '../data/armor.json';
import backgrounds from '../data/backgrounds.json';
import boons from '../data/boons.json';
import chaosMagic from '../data/chaos-magic.json';
import classes from '../data/classes.json';
import conditions from '../data/conditions.json';
import dcExamples from '../data/dc-examples.json';
import downtimeActivities from '../data/downtime-activities.json';
import glossary from '../data/glossary.json';
import gmgGoldByLevel from '../data/gmg-gold-by-level.json';
import gmgMonsterBuilderLevels from '../data/gmg-monster-builder-levels.json';
import languages from '../data/languages.json';
import legendaryMonsters from '../data/legendary-monsters.json';
import magicalItemRarities from '../data/magical-item-rarities.json';
import magicalItems from '../data/magical-items.json';
import miscAdventuringEquipment from '../data/misc-adventuring-equipment.json';
import monsterFamilies from '../data/monster-families.json';
import monsterKinds from '../data/monster-kinds.json';
import monsters from '../data/monsters.json';
import optionalVariantRules from '../data/optional-variant-rules.json';
import saveTypes from '../data/save-types.json';
import sizes from '../data/sizes.json';
import skills from '../data/skills.json';
import spellSchools from '../data/spell-schools.json';
import spellScrollCosts from '../data/spell-scroll-costs.json';
import spells from '../data/spells.json';
import statArrays from '../data/stat-arrays.json';
import stats from '../data/stats.json';
import wandCosts from '../data/wand-costs.json';
import weaponProperties from '../data/weapon-properties.json';
import weapons from '../data/weapons.json';

export const nimbleGameDataById: Record<NimbleJsonId, unknown> = {
	'adventuring-motivations': adventuringMotivations,
	ancestries,
	armor,
	backgrounds,
	boons,
	'chaos-magic': chaosMagic,
	classes,
	conditions,
	'dc-examples': dcExamples,
	'downtime-activities': downtimeActivities,
	glossary,
	'gmg-gold-by-level': gmgGoldByLevel,
	'gmg-monster-builder-levels': gmgMonsterBuilderLevels,
	languages,
	'legendary-monsters': legendaryMonsters,
	'magical-item-rarities': magicalItemRarities,
	'magical-items': magicalItems,
	'misc-adventuring-equipment': miscAdventuringEquipment,
	'monster-families': monsterFamilies,
	'monster-kinds': monsterKinds,
	monsters,
	'optional-variant-rules': optionalVariantRules,
	'save-types': saveTypes,
	sizes,
	skills,
	'spell-schools': spellSchools,
	'spell-scroll-costs': spellScrollCosts,
	spells,
	'stat-arrays': statArrays,
	stats,
	'wand-costs': wandCosts,
	'weapon-properties': weaponProperties,
	weapons,
};
