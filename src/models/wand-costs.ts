import { z } from 'astro/zod';
import rawWandCosts from '../data/wand-costs.json';
import { sourceRefSchema } from './entity-base';

const wandCostSchema = z
	.object({
		name: z.string().min(1),
		cost: z.string().min(1),
		source: sourceRefSchema,
	})
	.strict();

export type WandCostData = z.infer<typeof wandCostSchema>;
export const wandCosts: WandCostData[] = z
	.array(wandCostSchema)
	.parse(rawWandCosts);
