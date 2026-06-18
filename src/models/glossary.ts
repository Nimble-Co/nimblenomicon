import { z } from 'astro/zod';
import { slugifyEntityId } from '../utils/slugifyEntityId';
import { readNimbleGameJson } from './nimble-game-data-raw';
import { refineUniqueStringIdsByKey } from './zod-unique-array';

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
	.superRefine(refineUniqueStringIdsByKey<GlossaryEntryData>('glossary'))
	.parse(readNimbleGameJson('glossary'));

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
