import { z } from 'astro/zod';
import { readNimbleGameJson } from './nimble-game-data-raw';

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
	.parse(readNimbleGameJson('gmg-monster-builder-levels'));
