import { z } from "astro/zod";
import rawCharacterClasses from "../data/character-classes.json";

const characterClassSchema = z
  .object({
    name: z
      .string()
      .min(1)
      .refine((s) => s === s.toLowerCase(), {
        message: "Class name must be lowercase in data",
      }),
    description: z.string(),
  })
  .strict();

export type CharacterClassData = z.infer<typeof characterClassSchema>;
export const characterClasses: CharacterClassData[] = z
  .array(characterClassSchema)
  .parse(rawCharacterClasses);
