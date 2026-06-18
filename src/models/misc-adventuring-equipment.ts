import { z } from 'astro/zod';
import { slugifyEntityId } from '../utils/slugifyEntityId';
import { readNimbleGameJson } from './nimble-game-data-raw';
import { refineUniqueStringIdsByKey } from './zod-unique-array';

const miscAdventuringEquipmentRowSchema = z.preprocess(
	(raw) => {
		if (!raw || typeof raw !== 'object') return raw;
		const o = { ...(raw as Record<string, unknown>) };
		delete o.id;
		const name = typeof o.name === 'string' ? o.name : '';
		const id = slugifyEntityId(name, 'misc-gear');
		return { ...o, id };
	},
	z
		.object({
			id: z.string().min(1),
			name: z.string().min(1),
			description: z.string().min(1),
			cost: z.string().min(1),
		})
		.strict(),
);

export type MiscAdventuringEquipmentRowData = z.infer<
	typeof miscAdventuringEquipmentRowSchema
>;

export const miscAdventuringEquipment: MiscAdventuringEquipmentRowData[] = z
	.array(miscAdventuringEquipmentRowSchema)
	.superRefine(
		refineUniqueStringIdsByKey<MiscAdventuringEquipmentRowData>(
			'misc adventuring equipment',
		),
	)
	.parse(readNimbleGameJson('misc-adventuring-equipment'));

/** Markdown body for a detail page. */
export function miscAdventuringEquipmentDetailMarkdown(
	row: MiscAdventuringEquipmentRowData,
): string {
	return `*Misc adventuring gear.*\n\n**Cost:** ${row.cost}\n\n${row.description}`;
}

/** Root-absolute path to a misc gear detail page. */
export function miscAdventuringEquipmentDetailHrefFromCoreRules(
	id: string,
): string {
	return `/misc-adventuring-equipment/${id}/`;
}

/** Sort by name for the index page. */
export function compareMiscAdventuringEquipmentRowsForListing(
	a: MiscAdventuringEquipmentRowData,
	b: MiscAdventuringEquipmentRowData,
): number {
	return a.name.localeCompare(b.name);
}
