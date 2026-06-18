import { z } from 'astro/zod';
import { slugifyEntityId } from '../utils/slugifyEntityId';
import { readNimbleGameJson } from './nimble-game-data-raw';
import { refineUniqueStringIdsByKey } from './zod-unique-array';

const languageRowSchema = z.preprocess(
	(raw) => {
		if (!raw || typeof raw !== 'object') return raw;
		const o = { ...(raw as Record<string, unknown>) };
		delete o.id;
		const name = typeof o.name === 'string' ? o.name : '';
		const id = slugifyEntityId(name, 'language');
		return { ...o, id };
	},
	z
		.object({
			id: z.string().min(1),
			name: z.string().min(1),
			description: z.string(),
		})
		.strict(),
);

export type LanguageData = z.infer<typeof languageRowSchema>;

export const languages: LanguageData[] = z
	.array(languageRowSchema)
	.superRefine(refineUniqueStringIdsByKey<LanguageData>('language'))
	.parse(readNimbleGameJson('languages'));

/** Root-absolute path to a language detail page. */
export function languageDetailHrefFromCoreRules(id: string): string {
	return `/languages/${id}/`;
}

/** Sort languages by name for the index page. */
export function compareLanguageRowsForListing(
	a: LanguageData,
	b: LanguageData,
): number {
	return a.name.localeCompare(b.name);
}
