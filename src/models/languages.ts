import { z } from 'astro/zod';
import rawLanguages from '../data/languages.json';
import { sourceRefSchema } from './entity-base';
import { slugifyEntityId } from '../utils/slugifyEntityId';

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
			source: sourceRefSchema,
		})
		.strict(),
);

export type LanguageData = z.infer<typeof languageRowSchema>;

export const languages: LanguageData[] = z
	.array(languageRowSchema)
	.superRefine((rows, ctx) => {
		const seen = new Map<string, number>();
		for (let i = 0; i < rows.length; i++) {
			const id = rows[i]!.id;
			if (seen.has(id)) {
				ctx.addIssue({
					code: 'custom',
					message: `Duplicate language id "${id}" (rows ${seen.get(id)} and ${i})`,
					path: [i, 'id'],
				});
			} else {
				seen.set(id, i);
			}
		}
	})
	.parse(rawLanguages);

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
