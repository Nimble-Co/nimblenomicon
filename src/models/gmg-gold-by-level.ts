import { z } from 'astro/zod';
import raw from '../data/gmg-gold-by-level.json';
import { sourceRefSchema } from './entity-base';

const rowSchema = z
	.object({
		level: z.number().int().min(1).max(20),
		gold: z.number().int().min(0),
		source: sourceRefSchema,
	})
	.strict();

export type GmgGoldByLevelRow = z.infer<typeof rowSchema>;

export const gmgGoldByLevel: GmgGoldByLevelRow[] = z
	.array(rowSchema)
	.parse(raw);
