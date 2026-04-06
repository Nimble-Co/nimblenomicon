import { z } from 'astro/zod';
import rawAdventuringMotivations from '../data/adventuring-motivations.json';
import { sourceRefSchema } from './entity-base';

const adventuringMotivationSchema = z
	.object({
		name: z.string().min(1),
		description: z.string().min(1),
		source: sourceRefSchema,
	})
	.strict();

export type AdventuringMotivationData = z.infer<
	typeof adventuringMotivationSchema
>;
export const adventuringMotivations: AdventuringMotivationData[] = z
	.array(adventuringMotivationSchema)
	.parse(rawAdventuringMotivations);
