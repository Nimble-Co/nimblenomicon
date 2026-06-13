/** Action row shape (matches `monsterActionCardSchema` in search-result-card). */
export type MonsterActionLine = {
	name: string;
	descriptionMd: string;
	joinNext?: 'or' | 'then';
};

export {
	CREATURE_ARMOR_ABBREV as armorAbbrev,
	CREATURE_SPEED_MODE_LABEL as SPEED_MODE_LABEL,
} from '../../../models/creature-stat-display';
