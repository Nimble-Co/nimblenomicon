import { z } from "zod";
import rawStats from "../../data/stats.json";

export { default as Stat } from "./Stat.astro";

export const statSchema = z
  .object({
    name: z.string().min(1),
    stat: z.string().min(1),
    body: z.string(),
  })
  .strict();

export const statsSchema = z.array(statSchema);

export type StatData = z.infer<typeof statSchema>;

export const stats: StatData[] = statsSchema.parse(rawStats);
