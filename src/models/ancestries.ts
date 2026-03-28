import { z } from "astro/zod";
import rawAncestries from "../data/ancestries.json";

/** Stored in JSON / CMS; kebab-case matches `.pages.yml` select `name` values. */
export const ancestrySizeEnum = z.enum([
  "small",
  "medium",
  "large",
  "small-and-medium",
]);
export type AncestrySize = z.infer<typeof ancestrySizeEnum>;

const ancestrySizeDisplayMap: Record<AncestrySize, string> = {
  small: "Small",
  medium: "Medium",
  large: "Large",
  "small-and-medium": "Small and Medium",
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
