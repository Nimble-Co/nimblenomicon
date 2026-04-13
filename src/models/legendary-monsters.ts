import { z } from 'astro/zod';
import { slugifyEntityId } from '../utils/slugifyEntityId';
import { readNimbleGameJson } from './nimble-game-data-raw';
import {
	creatureArmorTierSchema,
	creatureMovementSchema,
	creatureSizeSchema,
	legendarySaveModifiersSchema,
	namedAbilityBlockSchema,
} from './creature-stat-shared';
import { monsterActionSchema, monsterLevelSchema } from './monsters';

/** One creature on a legendary stat block (solo entries use a single creature). */
const legendaryCreatureSchema = z
	.object({
		name: z.string().min(1).optional(),
		roleLabel: z.string().min(1).optional(),
		size: creatureSizeSchema,
		hp: z.number().int().positive(),
		armor: creatureArmorTierSchema,
		movement: creatureMovementSchema,
		saves: legendarySaveModifiersSchema.optional(),
		specialAbilities: z.array(namedAbilityBlockSchema).default([]),
		actions: z.array(monsterActionSchema).default([]),
	})
	.strict();

const legendaryEntrySchema = z
	.object({
		name: z.string().min(1),
		level: monsterLevelSchema,
		creatureType: z.string().min(1),
		actionsIntro: z.string().min(1).optional(),
		bloodied: z.string().min(1).optional(),
		lastStand: z.string().min(1).optional(),
		notes: z.string().min(1).optional(),
		creatures: z.array(legendaryCreatureSchema).min(1),
	})
	.strict()
	.refine(
		(row) =>
			row.creatures.length <= 1 ||
			row.creatures.every(
				(c) => c.name !== undefined && c.name.trim().length > 0,
			),
		{
			message:
				'Each creature must have a name when the stat block has multiple creatures.',
		},
	);

export type LegendaryCreatureData = z.infer<typeof legendaryCreatureSchema>;
export type LegendaryEntryData = z.infer<typeof legendaryEntrySchema> & {
	id: string;
};

export type LegendaryMonsterData = LegendaryEntryData;

export const legendaryMonsters: LegendaryEntryData[] = z
	.array(legendaryEntrySchema)
	.parse(readNimbleGameJson('legendary-monsters'))
	.map((row) => ({
		...row,
		id: slugifyEntityId(row.name, 'legendary-monster'),
	}));

export function getLegendaryMonsterById(
	id: string,
): LegendaryEntryData | undefined {
	return legendaryMonsters.find((m) => m.id === id);
}
