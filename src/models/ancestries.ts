import { z } from "astro/zod";
import rawAncestries from "../data/ancestries.json";

const ancestrySchema = z
  .object({
    section: z.enum(["common", "exotic"]),
    name: z.string().min(1),
    sizeLine: z.string().min(1),
    flavor: z.string(),
    trait: z.string(),
    callout: z.string().optional(),
  })
  .strict();

export type AncestryData = z.infer<typeof ancestrySchema>;
export const ancestries: AncestryData[] = z
  .array(ancestrySchema)
  .parse(rawAncestries);
