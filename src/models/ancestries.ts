import { z } from "astro/zod";
import rawAncestries from "../data/ancestries.json";

/** Stored in JSON / CMS; kebab-case matches `.pages.yml` select `name` values. */
export const ancestrySizeEnum = z.enum([
  "small",
  "medium",
  "large",
  "small-or-medium",
  "small-or-med",
]);
export type AncestrySize = z.infer<typeof ancestrySizeEnum>;

const ancestrySizeDisplayMap: Record<AncestrySize, string> = {
  small: "Small",
  medium: "Medium",
  large: "Large",
  "small-or-medium": "Small or Medium",
  "small-or-med": "Small or Med",
};

/** Human-readable size line (no parentheses). */
export function formatAncestrySize(size: AncestrySize): string {
  return ancestrySizeDisplayMap[size];
}

const ancestrySchema = z
  .object({
    section: z.enum(["common", "exotic"]),
    name: z.string().min(1),
    size: ancestrySizeEnum,
    flavor: z.string(),
    trait: z.string(),
  })
  .strict();

export type AncestryData = z.infer<typeof ancestrySchema>;
export const ancestries: AncestryData[] = z
  .array(ancestrySchema)
  .parse(rawAncestries);
