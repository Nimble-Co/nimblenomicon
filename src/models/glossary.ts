import { z } from 'astro/zod';
import rawGlossary from '../data/glossary.json';
import { slugifyEntityId } from '../utils/slugifyEntityId';

const glossaryEntryRowSchema = z.preprocess(
	(raw) => {
		if (!raw || typeof raw !== 'object') return raw;
		const o = { ...(raw as Record<string, unknown>) };
		delete o.id;
		const name = typeof o.name === 'string' ? o.name : '';
		const id = slugifyEntityId(name, 'glossary');
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

export type GlossaryEntryData = z.infer<typeof glossaryEntryRowSchema>;

export const glossary: GlossaryEntryData[] = z
	.array(glossaryEntryRowSchema)
	.superRefine((rows, ctx) => {
		const seen = new Map<string, number>();
		for (let i = 0; i < rows.length; i++) {
			const id = rows[i]!.id;
			if (seen.has(id)) {
				ctx.addIssue({
					code: 'custom',
					message: `Duplicate glossary id "${id}" (rows ${seen.get(id)} and ${i})`,
					path: [i, 'id'],
				});
			} else {
				seen.set(id, i);
			}
		}
	})
	.parse(rawGlossary);

/** Root-absolute path to a glossary detail page. */
export function glossaryDetailHrefFromCoreRules(id: string): string {
	return `/glossary/${id}/`;
}

/** Sort glossary entries by name for the index page. */
export function compareGlossaryRowsForListing(
	a: GlossaryEntryData,
	b: GlossaryEntryData,
): number {
	return a.name.localeCompare(b.name);
}
