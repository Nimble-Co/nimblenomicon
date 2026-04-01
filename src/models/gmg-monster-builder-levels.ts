import { z } from 'astro/zod';
import raw from '../data/gmg-monster-builder-levels.json';

const rowSchema = z
	.object({
		level: z.string().min(1),
		hpNoArmor: z.number().int().min(0),
		hpMediumArmor: z.number().int().min(0),
		hpHeavyArmor: z.number().int().min(0),
		damagePerRound: z.number().int().min(0),
		attackSampleDice: z.string().min(1),
		saveDC: z.number().int().min(0),
		crEquivalent: z.string().min(1),
	})
	.strict();

export type GmgMonsterBuilderLevelRow = z.infer<typeof rowSchema>;

export const gmgMonsterBuilderLevels: GmgMonsterBuilderLevelRow[] = z
	.array(rowSchema)
	.parse(raw);
