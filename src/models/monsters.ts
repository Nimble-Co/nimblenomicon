import { z } from 'astro/zod';
import rawMonsters from '../data/monsters.json';
import { slugifyEntityId } from '../lib/slugifyEntityId';
import { monsterGroups } from './monster-groups';
import { sizes } from './sizes';

const groupIds = new Set(monsterGroups.map((g) => g.id));

const namedBlockSchema = z
	.object({
		name: z.string().min(1),
		description: z.string().min(1),
	})
	.strict();

const sizeIds = sizes.map((s) => slugifyEntityId(s.name, 'size')) as [
	string,
	...string[],
];
const sizeIdSchema = z.enum(sizeIds).default('medium');

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
] as const;

const monsterLevelSchema = z.enum(MONSTER_LEVEL_VALUES);
export type MonsterLevel = z.infer<typeof monsterLevelSchema>;

const monsterSchema = z
	.object({
		name: z.string().min(1),
		level: monsterLevelSchema,
		sizeId: sizeIdSchema,
		healthPoints: z.number().optional(),
		armor: z.enum(['none', 'medium', 'heavy']).default('none'),
		speed: z.number().default(6),
		speedMode: z.enum(['walk', 'fly', 'burrow', 'swim']).default('walk'),
		bodyDescription: z.string().min(1),
		specialAbility: namedBlockSchema.optional(),
		specialCondition: namedBlockSchema.optional(),
		groupId: z.string().min(1).optional(),
	})
	.strict()
	.superRefine((row, ctx) => {
		if (row.groupId !== undefined && !groupIds.has(row.groupId)) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: `groupId "${row.groupId}" does not match any monster group`,
				path: ['groupId'],
			});
		}
	})
	.transform((row) => ({
		...row,
		id: slugifyEntityId(row.name, 'monster'),
	}));

export type MonsterData = z.infer<typeof monsterSchema>;
export const monsters: MonsterData[] = z.array(monsterSchema).parse(rawMonsters);

export function getMonstersByGroupId(groupId: string): MonsterData[] {
	return monsters.filter((m) => m.groupId === groupId);
}
