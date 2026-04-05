import { z } from 'astro/zod';
import rawLegendaryMonsters from '../data/legendary-monsters.json';
import { slugifyEntityId } from '../lib/slugifyEntityId';
import { sizes } from './sizes';
import { monsterActionSchema, monsterLevelSchema } from './monsters';

const namedBlockSchema = z
	.object({
		name: z.string().min(1),
		description: z.string().min(1),
	})
	.strict();

const sizeSlugs = sizes.map((s) => slugifyEntityId(s.name, 'size')) as [
	string,
	...string[],
];
const sizeSchema = z.enum(sizeSlugs).default('medium');

const legendaryMonsterSchema = z
	.object({
		name: z.string().min(1),
		level: monsterLevelSchema,
		size: sizeSchema,
		creatureType: z.string().min(1),
		hp: z.number().int().positive(),
		armor: z.enum(['none', 'medium', 'heavy']),
		movement: z
			.object({
				speed: z.number().default(6),
				mode: z.enum(['walk', 'fly', 'burrow', 'swim']).default('walk'),
			})
			.strict(),
		saves: z
			.object({
				str: z.number().int().optional(),
				dex: z.number().int().optional(),
				con: z.number().int().optional(),
				int: z.number().int().optional(),
				wil: z.number().int().optional(),
				cha: z.number().int().optional(),
				all: z.number().int().optional(),
			})
			.strict()
			.optional(),
		specialAbilities: z.array(namedBlockSchema).default([]),
		actionsIntro: z.string().min(1).optional(),
		actions: z.array(monsterActionSchema).default([]),
		bloodied: z.string().min(1).optional(),
		lastStand: z.string().min(1),
		notes: z.string().min(1).optional(),
	})
	.strict()
	.transform((row) => ({
		...row,
		id: slugifyEntityId(row.name, 'legendary-monster'),
	}));

export type LegendaryMonsterData = z.infer<typeof legendaryMonsterSchema>;
export const legendaryMonsters: LegendaryMonsterData[] = z
	.array(legendaryMonsterSchema)
	.parse(rawLegendaryMonsters);

export function getLegendaryMonsterById(
	id: string,
): LegendaryMonsterData | undefined {
	return legendaryMonsters.find((m) => m.id === id);
}
