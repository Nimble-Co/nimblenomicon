import { z } from 'astro/zod';
import { slugifyEntityId } from '../utils/slugifyEntityId';
import {
	creatureArmorTierSchema,
	creatureMovementSchema,
	creatureSizeSchema,
	namedAbilityBlockSchema,
} from './creature-stat-shared';
import type { MonsterFamilyData } from './monster-families';
import { monsterFamilies } from './monster-families';
import type { MonsterKindData } from './monster-kinds';
import { monsterKinds } from './monster-kinds';
import { readNimbleGameJson } from './nimble-game-data-raw';

const movementSchema = creatureMovementSchema.default({
	speed: 6,
	mode: 'walk',
});

/** Monster level: fractional minion-style tiers or whole levels 1–20. */
export const MONSTER_LEVEL_VALUES = [
	'1/4',
	'1/3',
	'1/2',
	'1',
	'2',
	'3',
	'4',
	'5',
	'6',
	'7',
	'8',
	'9',
	'10',
	'11',
	'12',
	'13',
	'14',
	'15',
	'16',
	'17',
	'18',
	'19',
	'20',
	'21',
] as const;

export const monsterLevelSchema = z.enum(MONSTER_LEVEL_VALUES);
export type MonsterLevel = z.infer<typeof monsterLevelSchema>;

/** Connector after this action toward the next (`or` = same-line “ OR:”; then “OR:” before next; `then` = “ Then:”). */
export const monsterActionJoinNextSchema = z.enum(['or', 'then']);

export const monsterActionSchema = z
	.object({
		name: z.string().min(1),
		uses: z.number().int().positive().optional(),
		description: z.string().min(1),
		joinNext: monsterActionJoinNextSchema.optional(),
	})
	.strict();

function monsterRowSchemaForReferenceData(
	kinds: readonly MonsterKindData[],
	families: readonly MonsterFamilyData[],
) {
	return z
		.object({
			name: z.string().min(1),
			level: monsterLevelSchema,
			isMinion: z.boolean().default(false),
			size: creatureSizeSchema,
			hp: z.number().optional(),
			armor: creatureArmorTierSchema.default('none'),
			movement: movementSchema,
			actions: z.array(monsterActionSchema).default([]),
			notes: z.string().min(1).optional(),
			specialAbilities: z.array(namedAbilityBlockSchema).default([]),
			kind: z.string().min(1).optional(),
			family: z.string().min(1).optional(),
		})
		.strict()
		.transform((row) => {
			const { kind: kindSlug, family: familySlug, ...rest } = row;

			if (kindSlug === undefined && familySlug === undefined) {
				return {
					...rest,
					family: undefined,
					id: slugifyEntityId(rest.name, 'monster'),
					kind: undefined,
				};
			}

			let kindRow: MonsterKindData | undefined;
			if (kindSlug !== undefined) {
				const found = kinds.find((k) => k.id === kindSlug);
				if (found === undefined) {
					throw new Error(
						`Unknown monster kind slug "${kindSlug}" for monster "${rest.name}"`,
					);
				}
				kindRow = found;
			}

			let familyRow: MonsterFamilyData | undefined;
			if (familySlug !== undefined) {
				const found = families.find((f) => f.id === familySlug);
				if (found === undefined) {
					throw new Error(
						`Unknown monster family slug "${familySlug}" for monster "${rest.name}"`,
					);
				}
				familyRow = found;
			}

			return {
				...rest,
				family: familyRow,
				id: slugifyEntityId(rest.name, 'monster'),
				kind: kindRow,
			};
		});
}

export type MonsterAction = z.infer<typeof monsterActionSchema>;
export type MonsterData = z.infer<
	ReturnType<typeof monsterRowSchemaForReferenceData>
>;
export const monsters: MonsterData[] = z
	.array(monsterRowSchemaForReferenceData(monsterKinds, monsterFamilies))
	.parse(readNimbleGameJson('monsters'));

export function getMonstersByKindId(kindId: string): MonsterData[] {
	return monsters.filter((m) => m.kind?.id === kindId);
}
