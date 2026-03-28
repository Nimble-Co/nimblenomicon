import { z } from "astro/zod";
import rawSpells from "../data/spells.json";

export const spellLevelSchema = z.enum([
  "cantrip",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
]);
export type SpellLevel = z.infer<typeof spellLevelSchema>;

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

const spellEntrySchema = z
  .object({
    name: z.string().min(1),
    level: spellLevelSchema,
    /** Casting cost, e.g. "1 Action", "2 Actions", "24 hours", "Casting Time: 1 minute". Empty only when redundant (avoid if possible). */
    actions: z.string(),
    target: spellTargetSchema,
    body: z.string(),
  })
  .strict();

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
    level: spellLevelSchema,
    actions: z.string(),
    target: spellTargetSchema,
    body: z.string(),
  })
  .strict();

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
