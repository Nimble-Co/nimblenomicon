import { z } from 'astro/zod';
import { slugifyEntityId } from '../utils/slugifyEntityId';
import { readNimbleGameJson } from './nimble-game-data-raw';
import { namedAbilityBlockSchema } from './creature-stat-shared';

const classLevelRowSchema = z
	.object({
		level: z.number().int().min(1).max(20),
		abilities: z.array(namedAbilityBlockSchema),
	})
	.strict();

/** Parsed from JSON without `id`; `id` is set in `heroClassSchema` via `slugifyEntityId`. */
const abilityListInputSchema = z
	.object({
		name: z.string().min(1),
		description: z.string().min(1),
		items: z.array(namedAbilityBlockSchema),
	})
	.strict();

const savesSchema = z
	.object({
		STR: z.number().int(),
		DEX: z.number().int(),
		INT: z.number().int(),
		WIL: z.number().int(),
	})
	.strict();

/** Exactly one of type (stat weapons), kind list, or range — matches Heroes JSON / CMS. */
const weaponsSchema = z
	.object({
		type: z.string().min(1).optional(),
		kind: z
			.array(
				z.union([
					z.string().min(1),
					z.object({ name: z.string().min(1) }).strict(),
				]),
			)
			.min(1)
			.optional(),
		range: z.string().min(1).optional(),
	})
	.strict()
	.superRefine((w, ctx) => {
		const set = [w.type != null, w.kind != null, w.range != null].filter(
			Boolean,
		).length;
		if (set !== 1) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Weapons must set exactly one of: type, kind, or range.',
			});
		}
	})
	.transform((w) => ({
		type: w.type,
		range: w.range,
		kind: w.kind?.map((x) => (typeof x === 'string' ? x : x.name)) ?? undefined,
	}));

const subclassRowSchema = z
	.object({
		name: z.string().min(1),
		levels: z.array(classLevelRowSchema),
	})
	.strict();

function hitDieLabel(hitDie: string): string {
	const trimmed = hitDie.trim().toLowerCase();
	return trimmed.startsWith('d') ? `1${trimmed}` : trimmed;
}

const SAVE_KEYS = ['STR', 'DEX', 'INT', 'WIL'] as const;

function savesDisplay(saves: z.infer<typeof savesSchema>): string {
	const parts: string[] = [];
	for (const k of SAVE_KEYS) {
		const v = saves[k];
		if (v === 0) continue;
		parts.push(`${k}${v > 0 ? '+' : '−'}`);
	}
	return parts.length > 0 ? parts.join(', ') : '—';
}

function weaponsDisplay(weapons: z.infer<typeof weaponsSchema>): string {
	if (weapons.type != null) return `All ${weapons.type} weapons`;
	if (weapons.kind != null) return weapons.kind.join(', ');
	return weapons.range ?? '';
}

function armorDisplay(armor: string[]): string {
	if (armor.length === 0) return 'None';
	return armor.join(', ');
}

const keyStatRowSchema = z
	.object({ stat: z.string().min(1) })
	.strict()
	.transform((r) => r.stat);

const armorRowSchema = z
	.object({ name: z.string().min(1) })
	.strict()
	.transform((r) => r.name);

const gearRowSchema = z
	.object({ name: z.string().min(1) })
	.strict()
	.transform((r) => r.name);

const heroClassSchema = z
	.object({
		name: z.string().min(1),
		/** Core Rules one-line blurb (shown in class list on Core Rules). */
		description: z.string().min(1),
		introduction: z.string().min(1),
		keyStats: z.array(keyStatRowSchema).min(1),
		hitDie: z.string().min(1),
		startingHp: z.number().int(),
		saves: savesSchema,
		armor: z.array(armorRowSchema),
		weapons: weaponsSchema,
		startingGear: z.array(gearRowSchema),
		levels: z.array(classLevelRowSchema),
		abilityLists: z.array(abilityListInputSchema).default([]),
		subclasses: z.array(subclassRowSchema),
	})
	.strict()
	.transform((row) => {
		const id = slugifyEntityId(row.name, 'class');
		const subclasses = row.subclasses.map((sub) => ({
			...sub,
			id: slugifyEntityId(`${row.name} ${sub.name}`, 'subclass'),
		}));
		const abilityLists = row.abilityLists.map((list) => ({
			...list,
			id: slugifyEntityId(`${row.name} ${list.name}`, 'ability-list'),
		}));
		return {
			...row,
			subclasses,
			abilityLists,
			id,
			hitDieLabel: hitDieLabel(row.hitDie),
			savesDisplay: savesDisplay(row.saves),
			weaponsDisplay: weaponsDisplay(row.weapons),
			armorDisplay: armorDisplay(row.armor),
			gearDisplay: row.startingGear.join(', '),
			keyStatsDisplay: row.keyStats.join(', '),
		};
	});

export type HeroSubclassData = {
	name: string;
	levels: z.infer<typeof classLevelRowSchema>[];
	id: string;
};

export type HeroClassData = z.infer<typeof heroClassSchema>;

export const heroClasses: HeroClassData[] = z
	.array(heroClassSchema)
	.parse(readNimbleGameJson('classes'));

export function getHeroClassById(classId: string): HeroClassData | undefined {
	return heroClasses.find((c) => c.id === classId);
}
