import { z } from 'astro/zod';
import { readNimbleGameJson } from './nimble-game-data-raw';

const statArraySchema = z
	.object({
		name: z.string().min(1),
		description: z.string(),
	})
	.strict();

export type StatArrayData = z.infer<typeof statArraySchema>;
export const statArrays: StatArrayData[] = z
	.array(statArraySchema)
	.parse(readNimbleGameJson('stat-arrays'));
