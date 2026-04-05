import { z } from 'astro/zod';
import rawMonsters from '../data/monsters.json';
import { slugifyEntityId } from '../lib/slugifyEntityId';
import { monsterFamilies } from './monster-families';
import { monsterKinds } from './monster-kinds';
import { sizes } from './sizes';

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

/** Monster level: fractional minion-style tiers or whole levels 1–20. */
const MONSTER_LEVEL_VALUES = [
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

const movementSchema = z
	.object({
		speed: z.number().default(6),
		mode: z.enum(['walk', 'fly', 'burrow', 'swim']).default('walk'),
	})
	.strict()
	.default({ speed: 6, mode: 'walk' });

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

const monsterSchema = z
	.object({
		name: z.string().min(1),
		level: monsterLevelSchema,
		isMinion: z.boolean().default(false),
		size: sizeSchema,
		hp: z.number().optional(),
		armor: z.enum(['none', 'medium', 'heavy']).default('none'),
		movement: movementSchema,
		actions: z.array(monsterActionSchema).default([]),
		notes: z.string().min(1).optional(),
		specialAbilities: z.array(namedBlockSchema).default([]),
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

		let kindRow: (typeof monsterKinds)[number] | undefined;
		if (kindSlug !== undefined) {
			const found = monsterKinds.find((k) => k.id === kindSlug);
			if (found === undefined) {
				throw new Error(
					`Unknown monster kind slug "${kindSlug}" for monster "${rest.name}"`,
				);
			}
			kindRow = found;
		}

		let familyRow: (typeof monsterFamilies)[number] | undefined;
		if (familySlug !== undefined) {
			const found = monsterFamilies.find((f) => f.id === familySlug);
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

export type MonsterAction = z.infer<typeof monsterActionSchema>;
export type MonsterData = z.infer<typeof monsterSchema>;
export const monsters: MonsterData[] = z
	.array(monsterSchema)
	.parse(rawMonsters);

export function getMonstersByKindId(kindId: string): MonsterData[] {
	return monsters.filter((m) => m.kind?.id === kindId);
}
