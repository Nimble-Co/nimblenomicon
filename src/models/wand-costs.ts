import { z } from 'astro/zod';
import rawWandCosts from '../data/wand-costs.json';

const wandCostSchema = z
	.object({
		name: z.string().min(1),
		cost: z.string().min(1),
	})
	.strict();

export type WandCostData = z.infer<typeof wandCostSchema>;
export const wandCosts: WandCostData[] = z
	.array(wandCostSchema)
	.parse(rawWandCosts);
