import { z } from 'astro/zod';
import rawLegendaryMonsters from '../data/legendary-monsters.json';
import { slugifyEntityId } from '../lib/slugifyEntityId';
import {
	creatureArmorTierSchema,
	creatureMovementSchema,
	creatureSizeSchema,
	legendarySaveModifiersSchema,
	namedAbilityBlockSchema,
} from './creature-stat-shared';
import { monsterActionSchema, monsterLevelSchema } from './monsters';

const legendaryMonsterSchema = z
	.object({
		name: z.string().min(1),
		level: monsterLevelSchema,
		size: creatureSizeSchema,
		creatureType: z.string().min(1),
		hp: z.number().int().positive(),
		armor: creatureArmorTierSchema,
		movement: creatureMovementSchema,
		saves: legendarySaveModifiersSchema.optional(),
		specialAbilities: z.array(namedAbilityBlockSchema).default([]),
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
