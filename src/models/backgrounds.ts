import { z } from 'astro/zod';
import { slugifyEntityId } from '../utils/slugifyEntityId';
import { readNimbleGameJson } from './nimble-game-data-raw';
import { refineUniqueStringIdsByKey } from './zod-unique-array';

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
	.superRefine(refineUniqueStringIdsByKey<BackgroundRowData>('background'))
	.parse(readNimbleGameJson('backgrounds'));

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
