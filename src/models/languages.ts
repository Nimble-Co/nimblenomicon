import { z } from 'astro/zod';
import rawLanguages from '../data/languages.json';

/** Stable URL segment for language detail pages; unique per language. */
export function slugifyLanguageId(name: string): string {
	return (
		name
			.normalize('NFKD')
			.replace(/[\u0300-\u036f]/g, '')
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '') || 'language'
	);
}

const languageRowSchema = z.preprocess(
	(raw) => {
		if (!raw || typeof raw !== 'object') return raw;
		const o = raw as Record<string, unknown>;
		const name = typeof o.name === 'string' ? o.name : '';
		const idRaw = o.id;
		const id =
			typeof idRaw === 'string' && idRaw.trim() !== ''
				? idRaw.trim()
				: slugifyLanguageId(name);
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
	.superRefine((rows, ctx) => {
		const seen = new Map<string, number>();
		for (let i = 0; i < rows.length; i++) {
			const id = rows[i]!.id;
			if (seen.has(id)) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
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
