import { z } from 'astro/zod';
import rawMonsterGroups from '../data/monster-groups.json';
import { slugifyEntityId } from '../lib/slugifyEntityId';

const namedBlockSchema = z
	.object({
		name: z.string().min(1),
		description: z.string().min(1),
	})
	.strict();

const monsterGroupSchema = z
	.object({
		name: z.string().min(1),
		description: z.string().min(1),
		sharedAbility: namedBlockSchema.optional(),
		potentialLoot: z.string(),
		sampleEncounters: z.string().min(1),
	})
	.strict()
	.transform((row) => ({
		...row,
		id: slugifyEntityId(row.name, 'monster-group'),
	}));

export type MonsterGroupData = z.infer<typeof monsterGroupSchema>;
export const monsterGroups: MonsterGroupData[] = z
	.array(monsterGroupSchema)
	.parse(rawMonsterGroups);

export function getMonsterGroupById(id: string): MonsterGroupData | undefined {
	return monsterGroups.find((g) => g.id === id);
}
