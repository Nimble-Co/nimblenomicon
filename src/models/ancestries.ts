import { z } from 'astro/zod';
import rawAncestries from '../data/ancestries.json';
import { slugifyEntityId } from '../lib/slugifyEntityId';

/** Stored in JSON / CMS; kebab-case matches `.pages.yml` select `name` values. */
export const ancestrySizeEnum = z.enum([
	'small',
	'medium',
	'large',
	'small-and-medium',
]);
export type AncestrySize = z.infer<typeof ancestrySizeEnum>;

const ancestrySizeDisplayMap: Record<AncestrySize, string> = {
	small: 'Small',
	medium: 'Medium',
	large: 'Large',
	'small-and-medium': 'Small and Medium',
};

/** Human-readable size line (no parentheses). */
export function formatAncestrySize(size: AncestrySize): string {
	return ancestrySizeDisplayMap[size];
}

const ancestryRowSchema = z.preprocess(
	(raw) => {
		if (!raw || typeof raw !== 'object') return raw;
		const o = { ...(raw as Record<string, unknown>) };
		delete o.id;
		const name = typeof o.name === 'string' ? o.name : '';
		const id = slugifyEntityId(name, 'ancestry');
		return { ...o, id };
	},
	z
		.object({
			id: z.string().min(1),
			section: z.enum(['common', 'exotic']),
			name: z.string().min(1),
			size: ancestrySizeEnum,
			flavor: z.string(),
			trait: z.string(),
		})
		.strict(),
);

export type AncestryRowData = z.infer<typeof ancestryRowSchema>;

export const ancestries: AncestryRowData[] = z
	.array(ancestryRowSchema)
	.superRefine((rows, ctx) => {
		const seen = new Map<string, number>();
		for (let i = 0; i < rows.length; i++) {
			const id = rows[i]!.id;
			if (seen.has(id)) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: `Duplicate ancestry id "${id}" (rows ${seen.get(id)} and ${i})`,
					path: [i, 'id'],
				});
			} else {
				seen.set(id, i);
			}
		}
	})
	.parse(rawAncestries);

/** Root-absolute path to an ancestry detail page. */
export function ancestryDetailHrefFromCoreRules(id: string): string {
	return `/ancestries/${id}/`;
}

/**
 * Sort key for the ancestry index: common ancestries first (document order), then exotic,
 * then name.
 */
export function compareAncestryRowsForListing(
	a: AncestryRowData,
	b: AncestryRowData,
): number {
	const sec = (s: AncestryRowData['section']) => (s === 'common' ? 0 : 1);
	const d = sec(a.section) - sec(b.section);
	if (d !== 0) return d;
	return a.name.localeCompare(b.name);
}
