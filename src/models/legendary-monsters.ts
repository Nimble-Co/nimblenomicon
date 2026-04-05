import { z } from 'astro/zod';
import rawLegendarySolo from '../data/legendary-monsters-solo.json';
import rawLegendaryTeams from '../data/legendary-monsters-teams.json';
import { slugifyEntityId } from '../lib/slugifyEntityId';
import {
	creatureArmorTierSchema,
	creatureMovementSchema,
	creatureSizeSchema,
	legendarySaveModifiersSchema,
	namedAbilityBlockSchema,
} from './creature-stat-shared';
import { monsterActionSchema, monsterLevelSchema } from './monsters';

/** One creature in a legendary team (shared stat block). */
const legendaryTeamMemberSchema = z
	.object({
		name: z.string().min(1),
		roleLabel: z.string().min(1).optional(),
		hp: z.number().int().positive(),
		armor: creatureArmorTierSchema,
		saves: legendarySaveModifiersSchema.optional(),
		specialAbilities: z.array(namedAbilityBlockSchema).default([]),
		actions: z.array(monsterActionSchema).default([]),
	})
	.strict();

const legendarySoloSchema = z
	.object({
		kind: z.literal('solo'),
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
	.strict();

const legendaryTeamSchema = z
	.object({
		kind: z.literal('team'),
		name: z.string().min(1),
		level: monsterLevelSchema,
		creatureType: z.string().min(1),
		members: z.array(legendaryTeamMemberSchema).min(2),
		actionsIntro: z.string().min(1).optional(),
		bloodied: z.string().min(1).optional(),
		lastStand: z.string().min(1),
		notes: z.string().min(1).optional(),
	})
	.strict();

const legendaryMonsterSchema = z.discriminatedUnion('kind', [
	legendarySoloSchema,
	legendaryTeamSchema,
]);

function normalizeLegendaryRow(raw: unknown): unknown {
	if (typeof raw !== 'object' || raw === null) return raw;
	const o = raw as Record<string, unknown>;
	if (Array.isArray(o.members)) {
		return { kind: 'team', ...o };
	}
	if (o.kind === undefined) {
		return { kind: 'solo', ...o };
	}
	return raw;
}

export type LegendaryTeamMemberData = z.infer<typeof legendaryTeamMemberSchema>;
export type LegendarySoloData = z.infer<typeof legendarySoloSchema>;
export type LegendaryTeamData = z.infer<typeof legendaryTeamSchema>;
export type LegendaryMonsterBase = z.infer<typeof legendaryMonsterSchema>;
export type LegendaryMonsterData = LegendaryMonsterBase & { id: string };

const soloRows = z
	.array(z.unknown())
	.parse(rawLegendarySolo)
	.map(normalizeLegendaryRow);
const teamRows = z
	.array(z.unknown())
	.parse(rawLegendaryTeams)
	.map(normalizeLegendaryRow);
const parsedRows = [...soloRows, ...teamRows];

export const legendaryMonsters: LegendaryMonsterData[] = z
	.array(legendaryMonsterSchema)
	.parse(parsedRows)
	.map((row) => ({
		...row,
		id: slugifyEntityId(row.name, 'legendary-monster'),
	}));

export function getLegendaryMonsterById(
	id: string,
): LegendaryMonsterData | undefined {
	return legendaryMonsters.find((m) => m.id === id);
}
