import { z } from 'astro/zod';
import { slugifyEntityId } from '../utils/slugifyEntityId';
import { spellListingMetaMarkdown } from './catalog-display-text';
import { readNimbleGameJson } from './nimble-game-data-raw';

const spellTargetSchema = z.enum([
	'single-target',
	'self',
	'aoe',
	'two-targets',
	'multi-target',
	'single-target-plus',
	'single-target-or-self',
]);

export type SpellTarget = z.infer<typeof spellTargetSchema>;

export const SPELL_TARGET_LABEL: Record<SpellTarget, string> = {
	'single-target': 'Single Target',
	self: 'Self',
	aoe: 'AoE',
	'two-targets': '2 Targets',
	'multi-target': 'Multi-target',
	'single-target-plus': 'Single Target+',
	'single-target-or-self': 'Single Target/Self',
};

const spellsSchema = z
	.object({
		schoolId: z.string().min(1),
		utility: z.boolean(),
		name: z.string().min(1),
		castingTime: z.string().min(1).optional(),
		target: spellTargetSchema.optional(),
		description: z.string().min(1),
		tier: z.number().min(0).max(9),
		secret: z.boolean().default(false),
		source: z.enum(['core-rules', 'game-masters-guide']),
	})
	.strict()
	.transform((spell) => {
		const tierLabel = spell.tier === 0 ? 'Cantrip' : `Tier ${spell.tier}`;
		const targetLabel = spell.target
			? SPELL_TARGET_LABEL[spell.target]
			: undefined;
		return {
			...spell,
			id: slugifyEntityId(spell.name, 'spell'),
			tierLabel,
			targetLabel,
		};
	});

export type SpellData = z.infer<typeof spellsSchema>;
export const spells: SpellData[] = z
	.array(spellsSchema)
	.parse(readNimbleGameJson('spells'));

export function spellDetailHref(id: string): string {
	return `/spells/${id}/`;
}

export interface SpellListingFilters {
	schoolId?: string;
	utility?: boolean;
	secret?: boolean;
}

/** Spells for doc lists (Core Rules / GMG), same filter semantics as the former `SpellsList` component. */
export function spellsMatching(filters: SpellListingFilters): SpellData[] {
	const { schoolId, utility = false, secret = false } = filters;
	return spells.filter(
		(spell) =>
			(schoolId ? spell.schoolId === schoolId : true) &&
			spell.utility === utility &&
			spell.secret === secret,
	);
}

/** Markdown fragment for the heading block body (meta line + description). */
export function spellListingBodyMarkdown(spell: SpellData): string {
	const meta = spellListingMetaMarkdown(spell);
	const desc = spell.description?.trim();
	return meta + (desc ? `\n\n${desc}` : '');
}
