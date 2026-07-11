export {
	armorAbbrev,
	SPEED_MODE_LABEL,
} from '../../../models/creature-stat-display';

/** Action row shape (matches `monsterActionCardSchema` in search-result-card). */
export type MonsterActionLine = {
	name: string;
	descriptionMd: string;
	joinNext?: 'or' | 'then';
};
