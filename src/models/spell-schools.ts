import { z } from "astro/zod";
import rawSpellSchools from "../data/spell-schools.json";

const spellSchoolSchema = z
  .object({
    name: z.string().min(1),
    body: z.string(),
  })
  .strict();

export type SpellSchoolData = z.infer<typeof spellSchoolSchema>;
export const spellSchools: SpellSchoolData[] = z
  .array(spellSchoolSchema)
  .parse(rawSpellSchools);
