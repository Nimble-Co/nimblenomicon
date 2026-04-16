/**
 * Structured payloads embedded in Orama docs as `cardJson` (JSON string).
 * Parsed client-side for rich `/search/` result cards.
 */
import { z } from 'zod';

export const SEARCH_RESULT_CARD_VERSION = 1 as const;

export const MAX_DESCRIPTION_MD = 2_500;
export const MAX_NOTES_MD = 1_200;
export const MAX_ACTION_MD = 1_200;
export const MAX_BLOCK_MD = 1_000;
export const MAX_INTRO_MD = 1_200;

export function truncateCardMd(text: string, max = MAX_DESCRIPTION_MD): string {
	const t = text.trim();
	if (t.length <= max) return t;
	return `${t.slice(0, max - 1)}…`;
}

const spellCardSchema = z.object({
	v: z.literal(1),
	kind: z.literal('spell'),
	schoolName: z.string(),
	tierLabel: z.string(),
	castingTime: z.string().optional(),
	targetLabel: z.string().optional(),
	utility: z.boolean(),
	secret: z.boolean(),
	descriptionMd: z.string(),
});

const namedBlockSchema = z.object({
	name: z.string(),
	descriptionMd: z.string(),
});

const monsterActionCardSchema = z.object({
	name: z.string(),
	uses: z.number().optional(),
	descriptionMd: z.string(),
	joinNext: z.enum(['or', 'then']).optional(),
});

const standardMonsterCardSchema = z.object({
	v: z.literal(1),
	kind: z.literal('monster'),
	variant: z.literal('standard'),
	level: z.string(),
	isMinion: z.boolean(),
	sizeSlug: z.string(),
	hp: z.number().optional(),
	armor: z.enum(['none', 'medium', 'heavy']),
	movementMode: z.enum(['walk', 'fly', 'burrow', 'swim']),
	movementSpeed: z.number(),
	kindName: z.string().optional(),
	familyName: z.string().optional(),
	/** Family trait blocks: titles like "Goblins: Pack Tactics". */
	familyAbilities: z.array(namedBlockSchema).default([]),
	notesMd: z.string().optional(),
	specialAbilities: z.array(namedBlockSchema),
	actions: z.array(monsterActionCardSchema),
});

const legendaryCreaturePayloadSchema = z.object({
	name: z.string().optional(),
	roleLabel: z.string().optional(),
	sizeSlug: z.string(),
	hp: z.number(),
	armor: z.enum(['none', 'medium', 'heavy']),
	movementMode: z.enum(['walk', 'fly', 'burrow', 'swim']),
	movementSpeed: z.number(),
	saveBadges: z.array(z.string()),
	specialAbilities: z.array(namedBlockSchema),
	actions: z.array(monsterActionCardSchema),
});

const legendaryMonsterCardSchema = z.object({
	v: z.literal(1),
	kind: z.literal('monster'),
	variant: z.literal('legendary'),
	level: z.string(),
	creatureType: z.string(),
	isTeam: z.boolean(),
	actionsIntro: z.string().optional(),
	bloodiedMd: z.string().optional(),
	lastStandMd: z.string().optional(),
	notesMd: z.string().optional(),
	creatures: z.array(legendaryCreaturePayloadSchema).min(1),
});

const classCardSchema = z.object({
	v: z.literal(1),
	kind: z.literal('class'),
	hitDieLabel: z.string(),
	keyStatsDisplay: z.string(),
	savesDisplay: z.string(),
	weaponsDisplay: z.string(),
	armorDisplay: z.string(),
	gearDisplay: z.string(),
	descriptionMd: z.string(),
	introductionMd: z.string(),
});

const weaponCardSchema = z.object({
	v: z.literal(1),
	kind: z.literal('weapon'),
	categoryLabel: z.string(),
	damage: z.string(),
	cost: z.string(),
	properties: z.array(z.string()),
});

export const SIMPLE_SEARCH_CARD_KINDS = [
	'ancestry',
	'background',
	'equipment',
	'magic-item',
	'glossary',
	'language',
	'condition',
	'armor',
] as const;

const simpleCardSchema = z.object({
	v: z.literal(1),
	kind: z.enum(SIMPLE_SEARCH_CARD_KINDS),
	excerptMd: z.string(),
});

export const searchResultCardSchema = z.union([
	spellCardSchema,
	standardMonsterCardSchema,
	legendaryMonsterCardSchema,
	classCardSchema,
	weaponCardSchema,
	simpleCardSchema,
]);

export type SpellSearchCardPayload = z.infer<typeof spellCardSchema>;
export type StandardMonsterSearchCardPayload = z.infer<
	typeof standardMonsterCardSchema
>;
export type LegendaryMonsterSearchCardPayload = z.infer<
	typeof legendaryMonsterCardSchema
>;
export type ClassSearchCardPayload = z.infer<typeof classCardSchema>;
export type WeaponSearchCardPayload = z.infer<typeof weaponCardSchema>;
export type SimpleSearchCardPayload = z.infer<typeof simpleCardSchema>;

export type SearchResultCardPayload =
	| SpellSearchCardPayload
	| StandardMonsterSearchCardPayload
	| LegendaryMonsterSearchCardPayload
	| ClassSearchCardPayload
	| WeaponSearchCardPayload
	| SimpleSearchCardPayload;

export function parseSearchResultCard(
	raw: string | undefined | null,
): SearchResultCardPayload | null {
	if (raw == null || raw === '') return null;
	try {
		const data: unknown = JSON.parse(raw);
		const r = searchResultCardSchema.safeParse(data);
		return r.success ? r.data : null;
	} catch {
		return null;
	}
}

export function stringifySearchResultCard(payload: SearchResultCardPayload): string {
	return JSON.stringify(payload);
}
