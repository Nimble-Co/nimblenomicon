import { z } from "astro/zod";
import rawSpells from "../data/spells.json";

const spellEntrySchema = z
  .object({
    name: z.string().min(1),
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
