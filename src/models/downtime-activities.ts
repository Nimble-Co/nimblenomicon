import { z } from 'astro/zod';
import { readNimbleGameJson } from './nimble-game-data-raw';

const downtimeActivitySchema = z
	.object({
		name: z.string().min(1),
		description: z.string(),
	})
	.strict();

export type DowntimeActivityData = z.infer<typeof downtimeActivitySchema>;
export const downtimeActivities: DowntimeActivityData[] = z
	.array(downtimeActivitySchema)
	.parse(readNimbleGameJson('downtime-activities'));
