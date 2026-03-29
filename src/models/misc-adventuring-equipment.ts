import { z } from 'astro/zod';
import rawMiscAdventuringEquipment from '../data/misc-adventuring-equipment.json';

/** Stable URL segment for misc gear detail pages; unique per row. */
export function slugifyMiscAdventuringEquipmentId(name: string): string {
	return (
		name
			.normalize('NFKD')
			.replace(/[\u0300-\u036f]/g, '')
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '') || 'misc-gear'
	);
}

const miscAdventuringEquipmentRowSchema = z.preprocess(
	(raw) => {
		if (!raw || typeof raw !== 'object') return raw;
		const o = raw as Record<string, unknown>;
		const name = typeof o.name === 'string' ? o.name : '';
		const idRaw = o.id;
		const id =
			typeof idRaw === 'string' && idRaw.trim() !== ''
				? idRaw.trim()
				: slugifyMiscAdventuringEquipmentId(name);
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
	.superRefine((rows, ctx) => {
		const seen = new Map<string, number>();
		for (let i = 0; i < rows.length; i++) {
			const id = rows[i]!.id;
			if (seen.has(id)) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: `Duplicate misc adventuring equipment id "${id}" (rows ${seen.get(id)} and ${i})`,
					path: [i, 'id'],
				});
			} else {
				seen.set(id, i);
			}
		}
	})
	.parse(rawMiscAdventuringEquipment);

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
