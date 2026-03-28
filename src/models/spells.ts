import { z } from "astro/zod";
import rawSpells from "../data/spells.json";

export const spellTargetSchema = z.enum([
  "single-target",
  "self",
  "aoe",
  "two-targets",
  "multi-target",
  "single-target-plus",
  "single-target-or-self",
]);
export type SpellTarget = z.infer<typeof spellTargetSchema>;

const spellEntryBase = {
  name: z.string().min(1),
  /** 0 = cantrip, 1–9 = spell tier */
  level: z.number().int().min(0).max(9),
  /** Heroic actions to cast; null when using castingNote instead (e.g. 1 minute, 24 hours) */
  actions: z.union([z.number().int().positive(), z.null()]),
  target: spellTargetSchema,
  body: z.string(),
  /** When actions is null, describe cast time (e.g. "24 hours", "Casting Time: 1 minute") */
  castingNote: z.string().optional(),
};

const spellEntrySchema = z
  .object(spellEntryBase)
  .strict()
  .refine(
    (s) =>
      (s.actions === null && s.castingNote && s.castingNote.length > 0) ||
      (s.actions !== null && s.castingNote === undefined),
    { message: "actions must be a positive integer, or null with castingNote set" },
  );

const spellSchoolSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    spells: z.array(spellEntrySchema),
  })
  .strict();

const utilitySchoolWithSpellsSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    spells: z.array(spellEntrySchema),
  })
  .strict();

const utilitySchoolFlatSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    flat: z.literal(true),
    level: z.number().int().min(0).max(9),
    actions: z.union([z.number().int().positive(), z.null()]),
    target: spellTargetSchema,
    body: z.string(),
    castingNote: z.string().optional(),
  })
  .strict()
  .refine(
    (s) =>
      (s.actions === null && s.castingNote && s.castingNote.length > 0) ||
      (s.actions !== null && s.castingNote === undefined),
    { message: "actions must be a positive integer, or null with castingNote set" },
  );

const utilitySchoolSchema = z.union([
  utilitySchoolWithSpellsSchema,
  utilitySchoolFlatSchema,
]);

const spellsPayloadSchema = z
  .object({
    schools: z.array(spellSchoolSchema),
    utilitySchools: z.array(utilitySchoolSchema),
  })
  .strict();

export type SpellEntryData = z.infer<typeof spellEntrySchema>;
export type SpellSchoolData = z.infer<typeof spellSchoolSchema>;
export type UtilitySchoolData = z.infer<typeof utilitySchoolSchema>;
export type SpellsPayloadData = z.infer<typeof spellsPayloadSchema>;

export const spellsData: SpellsPayloadData = spellsPayloadSchema.parse(rawSpells);
