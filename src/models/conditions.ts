import { z } from "astro/zod";
import rawConditions from "../data/conditions.json";

const conditionSchema = z
  .object({
    name: z.string().min(1),
    body: z.string(),
  })
  .strict();
export type ConditionData = z.infer<typeof conditionSchema>;
export const conditions: ConditionData[] = z
  .array(conditionSchema)
  .parse(rawConditions);
