import { z } from 'astro/zod';
import { readNimbleGameJson } from './nimble-game-data-raw';

const spellScrollCostSchema = z
	.object({
		name: z.string().min(1),
		cost: z.string().min(1),
	})
	.strict();

export type SpellScrollCostData = z.infer<typeof spellScrollCostSchema>;
export const spellScrollCosts: SpellScrollCostData[] = z
	.array(spellScrollCostSchema)
	.parse(readNimbleGameJson('spell-scroll-costs'));
