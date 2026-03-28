import { z } from "astro/zod";
import rawStatArrays from "../data/stat-arrays.json";

const statArraySchema = z
  .object({
    name: z.string().min(1),
    body: z.string(),
  })
  .strict();

export type StatArrayData = z.infer<typeof statArraySchema>;
export const statArrays: StatArrayData[] = z
  .array(statArraySchema)
  .parse(rawStatArrays);
