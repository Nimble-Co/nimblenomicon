import { z } from 'astro/zod';
import { readNimbleGameJson } from './nimble-game-data-raw';

const dcExampleSchema = z
	.object({
		name: z.string().min(1),
		description: z.string().min(1),
	})
	.strict();

export type DcExampleData = z.infer<typeof dcExampleSchema>;
export const dcExamples: DcExampleData[] = z
	.array(dcExampleSchema)
	.parse(readNimbleGameJson('dc-examples'));
