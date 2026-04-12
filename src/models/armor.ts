import { z } from 'astro/zod';
import { slugifyEntityId } from '../utils/slugifyEntityId';
import { readNimbleGameJson } from './nimble-game-data-raw';

const armorCategorySchema = z.enum([
	'cloth',
	'leather',
	'plate',
	'mail',
	'shields',
]);

const armorRowSchema = z.preprocess(
	(raw) => {
		if (!raw || typeof raw !== 'object') return raw;
		const o = { ...(raw as Record<string, unknown>) };
		delete o.id;
		const name = typeof o.name === 'string' ? o.name : '';
		const id = slugifyEntityId(name, 'armor');
		return { ...o, id };
	},
	z
		.object({
			id: z.string().min(1),
			category: armorCategorySchema,
			name: z.string().min(1),
			armor: z.string().min(1),
			cost: z.string().min(1),
		})
		.strict(),
);

export type ArmorCategory = z.infer<typeof armorCategorySchema>;
export type ArmorRowData = z.infer<typeof armorRowSchema>;

export const armorRows: ArmorRowData[] = z
	.array(armorRowSchema)
	.superRefine((rows, ctx) => {
		const seen = new Map<string, number>();
		for (let i = 0; i < rows.length; i++) {
			const id = rows[i]!.id;
			if (seen.has(id)) {
				ctx.addIssue({
					code: 'custom',
					message: `Duplicate armor id "${id}" (rows ${seen.get(id)} and ${i})`,
					path: [i, 'id'],
				});
			} else {
				seen.set(id, i);
			}
		}
	})
	.parse(readNimbleGameJson('armor'));

/** Section order and labels for the Core Rules armor tables. */
export const armorTableSections: { category: ArmorCategory; label: string }[] =
	[
		{ category: 'cloth', label: 'Cloth' },
		{ category: 'leather', label: 'Leather' },
		{ category: 'plate', label: 'Plate' },
		{ category: 'mail', label: 'Mail' },
		{ category: 'shields', label: 'Shields' },
	];

/** Human-readable armor section (table heading). */
export function formatArmorCategoryLabel(category: ArmorCategory): string {
	const found = armorTableSections.find((s) => s.category === category);
	return found?.label ?? category;
}

/** Markdown body for an armor detail page. */
export function armorDetailMarkdown(row: ArmorRowData): string {
	const section = formatArmorCategoryLabel(row.category);
	return `*${section}.*\n\n**Armor:** ${row.armor}\n\n**Cost:** ${row.cost}`;
}

/** Root-absolute path to an armor detail page. */
export function armorDetailHrefFromCoreRules(id: string): string {
	return `/armor/${id}/`;
}

const categoryOrder: readonly ArmorCategory[] = [
	'cloth',
	'leather',
	'plate',
	'mail',
	'shields',
];

/** Sort for the index: section order (as in Core Rules), then name. */
export function compareArmorRowsForListing(
	a: ArmorRowData,
	b: ArmorRowData,
): number {
	const ai = categoryOrder.indexOf(a.category);
	const bi = categoryOrder.indexOf(b.category);
	const d = ai - bi;
	if (d !== 0) return d;
	return a.name.localeCompare(b.name);
}
