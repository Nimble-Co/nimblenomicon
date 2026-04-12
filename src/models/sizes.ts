import { z } from 'astro/zod';
import { readNimbleGameJson } from './nimble-game-data-raw';

const sizeSchema = z
	.object({
		name: z.string().min(1),
		description: z.string(),
	})
	.strict();
export type SizeData = z.infer<typeof sizeSchema>;
export const sizes: SizeData[] = z
	.array(sizeSchema)
	.parse(readNimbleGameJson('sizes'));
