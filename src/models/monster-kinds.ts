import { z } from 'astro/zod';
import { slugifyEntityId } from '../utils/slugifyEntityId';
import { readNimbleGameJson } from './nimble-game-data-raw';

const monsterKindSchema = z
	.object({
		name: z.string().min(1),
		description: z.string().min(1),
		loot: z.string().min(1).optional(),
		sampleEncounters: z.string().min(1).optional(),
	})
	.strict()
	.transform((row) => ({
		...row,
		id: slugifyEntityId(row.name, 'monster-kind'),
	}));

export type MonsterKindData = z.infer<typeof monsterKindSchema>;
export const monsterKinds: MonsterKindData[] = z
	.array(monsterKindSchema)
	.parse(readNimbleGameJson('monster-kinds'));
