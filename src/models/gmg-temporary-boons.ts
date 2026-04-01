import { z } from 'astro/zod';
import raw from '../data/gmg-temporary-boons.json';

const rowSchema = z
	.object({
		roll: z.number().int().min(1).max(8),
		description: z.string().min(1),
	})
	.strict();

export type GmgTemporaryBoonRow = z.infer<typeof rowSchema>;

export const gmgTemporaryBoons: GmgTemporaryBoonRow[] = z
	.array(rowSchema)
	.parse(raw);
