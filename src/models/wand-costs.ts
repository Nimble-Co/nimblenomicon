import { z } from 'astro/zod';
import { readNimbleGameJson } from './nimble-game-data-raw';

const wandCostSchema = z
	.object({
		name: z.string().min(1),
		cost: z.string().min(1),
	})
	.strict();

export type WandCostData = z.infer<typeof wandCostSchema>;
export const wandCosts: WandCostData[] = z
	.array(wandCostSchema)
	.parse(readNimbleGameJson('wand-costs'));
