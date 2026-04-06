import { heroClasses } from './class';

export type CharacterClassData = {
	/** Lowercase display name (Core Rules list). */
	name: string;
	/** Core Rules short blurb; same as `HeroClassData.summary`. */
	description: string;
};

/** Core Rules class list — derived from full `classes.json` via `heroClasses`. */
export const characterClasses: CharacterClassData[] = heroClasses.map((c) => ({
	name: c.name.toLowerCase(),
	description: c.summary,
}));
