import { z } from 'astro/zod';
import { slugifyEntityId } from '../utils/slugifyEntityId';
import { readNimbleGameJson } from './nimble-game-data-raw';

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
	.parse(readNimbleGameJson('monster-families'));
