import { z } from "astro/zod";
import rawSaveTypes from "../data/save-types.json";

const saveTypeSchema = z
  .object({
    name: z.string().min(1),
    body: z.string(),
  })
  .strict();

export type SaveTypeData = z.infer<typeof saveTypeSchema>;
export const saveTypes: SaveTypeData[] = z
  .array(saveTypeSchema)
  .parse(rawSaveTypes);
