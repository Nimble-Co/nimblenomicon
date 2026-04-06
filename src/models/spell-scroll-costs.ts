import { z } from 'astro/zod';
import rawSpellScrollCosts from '../data/spell-scroll-costs.json';
import { sourceRefSchema } from './entity-base';

const spellScrollCostSchema = z
	.object({
		name: z.string().min(1),
		cost: z.string().min(1),
		source: sourceRefSchema,
	})
	.strict();

export type SpellScrollCostData = z.infer<typeof spellScrollCostSchema>;
export const spellScrollCosts: SpellScrollCostData[] = z
	.array(spellScrollCostSchema)
	.parse(rawSpellScrollCosts);
