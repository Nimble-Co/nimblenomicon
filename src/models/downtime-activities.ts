import { z } from 'astro/zod';
import rawDowntimeActivities from '../data/downtime-activities.json';
import { sourceRefSchema } from './entity-base';

const downtimeActivitySchema = z
	.object({
		name: z.string().min(1),
		description: z.string(),
		source: sourceRefSchema,
	})
	.strict();

export type DowntimeActivityData = z.infer<typeof downtimeActivitySchema>;
export const downtimeActivities: DowntimeActivityData[] = z
	.array(downtimeActivitySchema)
	.parse(rawDowntimeActivities);
