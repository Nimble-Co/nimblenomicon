import { z } from 'astro/zod';
import { slugifyEntityId } from '../utils/slugifyEntityId';
import { sizes } from './sizes';

const sizeSlugs = sizes.map((s) => slugifyEntityId(s.name, 'size')) as [
	string,
	...string[],
];

/** Size slug from `sizes.json` (kebab-case); default medium when omitted in data. */
export const creatureSizeSchema = z.enum(sizeSlugs).default('medium');

export type CreatureSizeSlug = z.infer<typeof creatureSizeSchema>;

/** None / Medium / Heavy armor tiers used on stat blocks. */
export const creatureArmorTierSchema = z.enum(['none', 'medium', 'heavy']);

export type CreatureArmorTier = z.infer<typeof creatureArmorTierSchema>;

/** Walk, fly, burrow, swim — same vocabulary as standard monsters. */
export const creatureMovementModeSchema = z.enum([
	'walk',
	'fly',
	'burrow',
	'swim',
]);

export type CreatureMovementMode = z.infer<typeof creatureMovementModeSchema>;

/**
 * Movement line on a stat block. Field defaults match omitted JSON fields.
 * Wrap with `.default({ speed: 6, mode: 'walk' })` when the whole object can be omitted.
 */
export const creatureMovementSchema = z
	.object({
		speed: z.number().default(6),
		mode: creatureMovementModeSchema.default('walk'),
	})
	.strict();

export type CreatureMovement = z.infer<typeof creatureMovementSchema>;

/** Bold name + prose — special abilities on monsters; traits on legendary stat blocks. */
export const namedAbilityBlockSchema = z
	.object({
		name: z.string().min(1),
		description: z.string().min(1),
	})
	.strict();

/** Legendary-only: advantaged (+) / disadvantaged (-) saves; Nimble uses STR/DEX/INT/WIL. */
export const legendarySaveModifiersSchema = z
	.object({
		str: z.number().int().optional(),
		dex: z.number().int().optional(),
		int: z.number().int().optional(),
		wil: z.number().int().optional(),
		all: z.number().int().optional(),
	})
	.strict();

export type LegendarySaveModifiers = z.infer<
	typeof legendarySaveModifiersSchema
>;
