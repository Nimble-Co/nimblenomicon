import { z } from 'astro/zod';
import rawMagicalItems from '../data/magical-items.json';

/** Stable URL segment for magical item detail pages; unique per item. */
export function slugifyMagicalItemId(name: string): string {
	return (
		name
			.normalize('NFKD')
			.replace(/[\u0300-\u036f]/g, '')
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '') || 'magical-item'
	);
}

function injectIds(raw: unknown): unknown {
	if (!Array.isArray(raw)) return raw;
	return raw.map((item) => {
		if (!item || typeof item !== 'object') return item;
		const o = item as Record<string, unknown>;
		const name = typeof o.name === 'string' ? o.name : '';
		const idRaw = o.id;
		const id =
			typeof idRaw === 'string' && idRaw.trim() !== ''
				? idRaw.trim()
				: slugifyMagicalItemId(name);
		return { ...o, id };
	});
}

const magicalItemStandardSchema = z
	.object({
		id: z.string().min(1),
		kind: z.literal('standard'),
		name: z.string().min(1),
		subtitle: z.string().optional(),
		description: z.string().min(1),
	})
	.strict();

const magicalItemWandSchema = z
	.object({
		id: z.string().min(1),
		kind: z.literal('wand'),
		name: z.string().min(1),
		subtitle: z.string().optional(),
		description: z.string().min(1),
	})
	.strict();

const magicalItemSchema = z.discriminatedUnion('kind', [
	magicalItemStandardSchema,
	magicalItemWandSchema,
]);

export type MagicalItemData = z.infer<typeof magicalItemSchema>;

export const magicalItems: MagicalItemData[] = z
	.array(magicalItemSchema)
	.superRefine((rows, ctx) => {
		const seen = new Map<string, number>();
		for (let i = 0; i < rows.length; i++) {
			const id = rows[i]!.id;
			if (seen.has(id)) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: `Duplicate magical item id "${id}" (rows ${seen.get(id)} and ${i})`,
					path: [i, 'id'],
				});
			} else {
				seen.set(id, i);
			}
		}
	})
	.parse(injectIds(rawMagicalItems));

/** Index column label for item kind. */
export function formatMagicalItemKind(kind: MagicalItemData['kind']): string {
	return kind === 'wand' ? 'Wand' : 'Standard';
}

/** Markdown body for a detail page (subtitle + description; name is the page title). */
export function magicalItemDetailMarkdown(item: MagicalItemData): string {
	const kindLine = item.kind === 'wand' ? '*Wand.*' : '*Magic item.*';
	const parts: string[] = [kindLine];
	if (item.subtitle?.trim()) {
		parts.push('', item.subtitle.trim());
	}
	parts.push('', item.description);
	return parts.join('\n');
}

/** Root-absolute path to a magical item detail page. */
export function magicalItemDetailHrefFromCoreRules(id: string): string {
	return `/magical-items/${id}/`;
}

/**
 * Sort for the index: standard items first, then wands; within each group, by name.
 */
export function compareMagicalItemsForListing(
	a: MagicalItemData,
	b: MagicalItemData,
): number {
	const ord = (k: MagicalItemData['kind']) => (k === 'standard' ? 0 : 1);
	const d = ord(a.kind) - ord(b.kind);
	if (d !== 0) return d;
	return a.name.localeCompare(b.name);
}
