import { z } from 'astro/zod';
import { readNimbleGameJson } from './nimble-game-data-raw';

const saveTypeSchema = z
	.object({
		name: z.string().min(1),
		description: z.string(),
	})
	.strict();

export type SaveTypeData = z.infer<typeof saveTypeSchema>;
export const saveTypes: SaveTypeData[] = z
	.array(saveTypeSchema)
	.parse(readNimbleGameJson('save-types'));
