/** Action row shape (matches `monsterActionCardSchema` in search-result-card). */
export type MonsterActionLine = {
	name: string;
	descriptionMd: string;
	joinNext?: 'or' | 'then';
};

/** Shared labels for monster search result cards. */
export const SPEED_MODE_LABEL: Record<string, string> = {
	walk: 'Walk',
	fly: 'Fly',
	burrow: 'Burrow',
	swim: 'Swim',
};

export const armorAbbrev: Record<'none' | 'medium' | 'heavy', string | null> = {
	none: null,
	medium: 'M',
	heavy: 'H',
};
