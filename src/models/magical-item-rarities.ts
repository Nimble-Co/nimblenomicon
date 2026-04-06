import { z } from 'astro/zod';
import rawMagicalItemRarities from '../data/magical-item-rarities.json';
import { sourceRefSchema } from './entity-base';

const magicalItemRaritySchema = z
	.object({
		name: z.string().min(1),
		availability: z.string().min(1),
		cost: z.string().min(1),
		source: sourceRefSchema,
	})
	.strict();

export type MagicalItemRarityData = z.infer<typeof magicalItemRaritySchema>;
export const magicalItemRarities: MagicalItemRarityData[] = z
	.array(magicalItemRaritySchema)
	.parse(rawMagicalItemRarities);
