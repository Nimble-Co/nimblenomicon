import type { z } from 'astro/zod';

/**
 * Zod array refinement: each row must have a unique string `id` (first occurrence wins in
 * error messages). Use for game data tables where JSON omits or overwrites ids in preprocess.
 */
export function refineUniqueStringIdsByKey<T extends { id: string }>(
	label: string,
): (rows: T[], ctx: z.RefinementCtx) => void {
	return (rows, ctx) => {
		const seen = new Map<string, number>();
		for (let i = 0; i < rows.length; i++) {
			const id = rows[i]!.id;
			if (seen.has(id)) {
				ctx.addIssue({
					code: 'custom',
					message: `Duplicate ${label} id "${id}" (rows ${seen.get(id)} and ${i})`,
					path: [i, 'id'],
				});
			} else {
				seen.set(id, i);
			}
		}
	};
}

/**
 * Zod array refinement: a numeric field must be unique across rows (e.g. chaos magic d20 table).
 */
export function refineUniqueNumericField<
	T extends Record<K, number>,
	K extends keyof T & string,
>(key: K, messageForDuplicate: (value: T[K]) => string) {
	return (rows: T[], ctx: z.RefinementCtx) => {
		const seen = new Set<T[K]>();
		for (let i = 0; i < rows.length; i++) {
			const value = rows[i]![key];
			if (seen.has(value)) {
				ctx.addIssue({
					code: 'custom',
					message: messageForDuplicate(value),
					path: [i, key],
				});
			} else {
				seen.add(value);
			}
		}
	};
}
