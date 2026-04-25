import { z } from 'astro/zod';
import { slugifyEntityId } from '../utils/slugifyEntityId';
import { readNimbleGameJson } from './nimble-game-data-raw';
import { refineUniqueStringIdsByKey } from './zod-unique-array';

const conditionRowSchema = z.preprocess(
	(raw) => {
		if (!raw || typeof raw !== 'object') return raw;
		const o = { ...(raw as Record<string, unknown>) };
		delete o.id;
		const name = typeof o.name === 'string' ? o.name : '';
		const id = slugifyEntityId(name, 'condition');
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
	.superRefine(refineUniqueStringIdsByKey<ConditionData>('condition'))
	.parse(readNimbleGameJson('conditions'));

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
