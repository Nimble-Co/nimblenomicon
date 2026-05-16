import { z } from 'astro/zod';
import { slugifyEntityId } from '../utils/slugifyEntityId';
import { readNimbleGameJson } from './nimble-game-data-raw';
import { spellTierDisplayLabel } from './spell-tier-display-label';

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
		const tierLabel = spellTierDisplayLabel(spell.tier);
		const TARGET_LABEL: Record<SpellTarget, string> = {
			'single-target': 'Single Target',
			self: 'Self',
			aoe: 'AoE',
			'two-targets': '2 Targets',
			'multi-target': 'Multi-target',
			'single-target-plus': 'Single Target+',
			'single-target-or-self': 'Single Target/Self',
		};
		const targetLabel = spell.target ? TARGET_LABEL[spell.target] : undefined;
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
	const metaParts = [
		spell.tierLabel,
		spell.castingTime?.trim(),
		spell.targetLabel,
	].filter(Boolean);
	const meta = metaParts.length > 0 ? `_${metaParts.join(', ')}_` : '';
	const desc = spell.description?.trim();
	return meta + (desc ? `\n\n${desc}` : '');
}
