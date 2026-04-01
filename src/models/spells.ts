import { z } from 'astro/zod';
import rawSpells from '../data/spells.json';
import { slugifyEntityId } from '../lib/slugifyEntityId';

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
		castingTime: z.string().min(1),
		target: spellTargetSchema.optional(),
		description: z.string().min(1),
		tier: z.number().min(0).max(9),
	})
	.strict()
	.transform((spell) => ({
		...spell,
		id: slugifyEntityId(spell.name, 'spell'),
	}));

export type SpellData = z.infer<typeof spellsSchema>;
export const spells: SpellData[] = z.array(spellsSchema).parse(rawSpells);
