import { z } from 'astro/zod';
import { slugifyEntityId } from '../utils/slugifyEntityId';
import { readNimbleGameJson } from './nimble-game-data-raw';

const weaponPropertyLineSchema = z
	.object({
		description: z.string().min(1),
	})
	.strict();

const weaponRowSchema = z.preprocess(
	(raw) => {
		if (!raw || typeof raw !== 'object') return raw;
		const o = { ...(raw as Record<string, unknown>) };
		delete o.id;
		const name = typeof o.name === 'string' ? o.name : '';
		const id = slugifyEntityId(name, 'weapon');
		return { ...o, id };
	},
	z
		.object({
			id: z.string().min(1),
			category: z.enum(['melee', 'ranged']),
			name: z.string().min(1),
			damage: z.string().min(1),
			propertyLines: z.array(weaponPropertyLineSchema).default([]),
			cost: z.string().min(1),
		})
		.strict(),
);

export type WeaponPropertyLineData = z.infer<typeof weaponPropertyLineSchema>;
export type WeaponRowData = z.infer<typeof weaponRowSchema>;

export const weapons: WeaponRowData[] = z
	.array(weaponRowSchema)
	.superRefine((rows, ctx) => {
		const seen = new Map<string, number>();
		for (let i = 0; i < rows.length; i++) {
			const id = rows[i]!.id;
			if (seen.has(id)) {
				ctx.addIssue({
					code: 'custom',
					message: `Duplicate weapon id "${id}" (rows ${seen.get(id)} and ${i})`,
					path: [i, 'id'],
				});
			} else {
				seen.set(id, i);
			}
		}
	})
	.parse(readNimbleGameJson('weapons'));

/** Human-readable category for tables and meta lines. */
export function formatWeaponCategory(
	category: WeaponRowData['category'],
): string {
	return category === 'melee' ? 'Melee' : 'Ranged';
}

/** Markdown body for a weapon detail page (stats only; no separate lore field). */
export function weaponDetailMarkdown(row: WeaponRowData): string {
	const cat = formatWeaponCategory(row.category);
	const props = row.propertyLines.map((p) => p.description).filter(Boolean);
	const propsBlock =
		props.length > 0 ? `\n\n**Properties:** ${props.join(', ')}` : '';
	return `*${cat} weapon.*\n\n**Damage:** ${row.damage}\n\n**Cost:** ${row.cost}${propsBlock}`;
}

/** Root-absolute path to a weapon detail page. */
export function weaponDetailHrefFromCoreRules(id: string): string {
	return `/weapons/${id}/`;
}
