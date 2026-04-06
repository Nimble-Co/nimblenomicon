import { z } from 'astro/zod';
import rawStats from '../data/stats.json';
import { sourceRefSchema } from './entity-base';

const statSchema = z
	.object({
		name: z.string().min(1),
		stat: z.string().min(1),
		description: z.string(),
		source: sourceRefSchema,
	})
	.strict();
export type StatData = z.infer<typeof statSchema>;
export const stats: StatData[] = z.array(statSchema).parse(rawStats);
