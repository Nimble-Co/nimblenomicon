import { z } from 'astro/zod';
import rawConditions from '../data/conditions.json';

/** Stable URL segment for condition detail pages; unique per condition. */
export function slugifyConditionId(name: string): string {
	return (
		name
			.normalize('NFKD')
			.replace(/[\u0300-\u036f]/g, '')
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '') || 'condition'
	);
}

const conditionRowSchema = z.preprocess(
	(raw) => {
		if (!raw || typeof raw !== 'object') return raw;
		const o = raw as Record<string, unknown>;
		const name = typeof o.name === 'string' ? o.name : '';
		const idRaw = o.id;
		const id =
			typeof idRaw === 'string' && idRaw.trim() !== ''
				? idRaw.trim()
				: slugifyConditionId(name);
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

export type ConditionData = z.infer<typeof conditionRowSchema>;

export const conditions: ConditionData[] = z
	.array(conditionRowSchema)
	.superRefine((rows, ctx) => {
		const seen = new Map<string, number>();
		for (let i = 0; i < rows.length; i++) {
			const id = rows[i]!.id;
			if (seen.has(id)) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: `Duplicate condition id "${id}" (rows ${seen.get(id)} and ${i})`,
					path: [i, 'id'],
				});
			} else {
				seen.set(id, i);
			}
		}
	})
	.parse(rawConditions);

/** Root-absolute path to a condition detail page. */
export function conditionDetailHrefFromCoreRules(id: string): string {
	return `/conditions/${id}/`;
}

/** Sort conditions by name for the index page. */
export function compareConditionRowsForListing(
	a: ConditionData,
	b: ConditionData,
): number {
	return a.name.localeCompare(b.name);
}
