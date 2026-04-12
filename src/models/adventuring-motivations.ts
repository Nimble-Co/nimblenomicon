import { z } from 'astro/zod';
import { readNimbleGameJson } from './nimble-game-data-raw';

const adventuringMotivationSchema = z
	.object({
		name: z.string().min(1),
		description: z.string().min(1),
	})
	.strict();

export type AdventuringMotivationData = z.infer<
	typeof adventuringMotivationSchema
>;
export const adventuringMotivations: AdventuringMotivationData[] = z
	.array(adventuringMotivationSchema)
	.parse(readNimbleGameJson('adventuring-motivations'));
