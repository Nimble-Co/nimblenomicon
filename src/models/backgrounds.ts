import { z } from 'astro/zod';
import rawBackgrounds from '../data/backgrounds.json';
import { slugifyEntityId } from '../utils/slugifyEntityId';

const backgroundRowSchema = z.preprocess(
	(raw) => {
		if (!raw || typeof raw !== 'object') return raw;
		const o = { ...(raw as Record<string, unknown>) };
		delete o.id;
		const name = typeof o.name === 'string' ? o.name : '';
		const id = slugifyEntityId(name, 'background');
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

export type BackgroundRowData = z.infer<typeof backgroundRowSchema>;

export const backgrounds: BackgroundRowData[] = z
	.array(backgroundRowSchema)
	.superRefine((rows, ctx) => {
		const seen = new Map<string, number>();
		for (let i = 0; i < rows.length; i++) {
			const id = rows[i]!.id;
			if (seen.has(id)) {
				ctx.addIssue({
					code: 'custom',
					message: `Duplicate background id "${id}" (rows ${seen.get(id)} and ${i})`,
					path: [i, 'id'],
				});
			} else {
				seen.set(id, i);
			}
		}
	})
	.parse(rawBackgrounds);

/** Root-absolute path to a background detail page. */
export function backgroundDetailHrefFromCoreRules(id: string): string {
	return `/backgrounds/${id}/`;
}

/** Sort backgrounds by name for the index page. */
export function compareBackgroundRowsForListing(
	a: BackgroundRowData,
	b: BackgroundRowData,
): number {
	return a.name.localeCompare(b.name);
}
