import { z } from 'astro/zod';
import rawMonsterFamilies from '../data/monster-families.json';
import { slugifyEntityId } from '../lib/slugifyEntityId';

const namedBlockSchema = z
	.object({
		name: z.string().min(1),
		description: z.string().min(1),
	})
	.strict();

const monsterFamilySchema = z
	.object({
		name: z.string().min(1),
		abilities: z.array(namedBlockSchema).default([]),
	})
	.strict()
	.transform((row) => ({
		...row,
		id: slugifyEntityId(row.name, 'monster-family'),
	}));

export type MonsterFamilyData = z.infer<typeof monsterFamilySchema>;
export const monsterFamilies: MonsterFamilyData[] = z
	.array(monsterFamilySchema)
	.parse(rawMonsterFamilies);
