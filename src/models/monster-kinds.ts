import { z } from 'astro/zod';
import rawMonsterKinds from '../data/monster-kinds.json';
import { sourceRefSchema } from './entity-base';
import { slugifyEntityId } from '../utils/slugifyEntityId';

const monsterKindSchema = z
	.object({
		name: z.string().min(1),
		description: z.string().min(1),
		loot: z.string().min(1).optional(),
		sampleEncounters: z.string().min(1).optional(),
		source: sourceRefSchema,
	})
	.strict()
	.transform((row) => ({
		...row,
		id: slugifyEntityId(row.name, 'monster-kind'),
	}));

export type MonsterKindData = z.infer<typeof monsterKindSchema>;
export const monsterKinds: MonsterKindData[] = z
	.array(monsterKindSchema)
	.parse(rawMonsterKinds);
