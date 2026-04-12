import { z } from 'astro/zod';
import { readNimbleGameJson } from './nimble-game-data-raw';

const rowSchema = z
	.object({
		level: z.number().int().min(1).max(20),
		gold: z.number().int().min(0),
	})
	.strict();

export type GmgGoldByLevelRow = z.infer<typeof rowSchema>;

export const gmgGoldByLevel: GmgGoldByLevelRow[] = z
	.array(rowSchema)
	.parse(readNimbleGameJson('gmg-gold-by-level'));
