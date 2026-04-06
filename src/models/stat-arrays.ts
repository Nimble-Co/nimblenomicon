import { z } from 'astro/zod';
import rawStatArrays from '../data/stat-arrays.json';
import { sourceRefSchema } from './entity-base';

const statArraySchema = z
	.object({
		name: z.string().min(1),
		description: z.string(),
		source: sourceRefSchema,
	})
	.strict();

export type StatArrayData = z.infer<typeof statArraySchema>;
export const statArrays: StatArrayData[] = z
	.array(statArraySchema)
	.parse(rawStatArrays);
