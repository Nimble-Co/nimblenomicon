import { z } from "astro/zod";
import rawOutline from "../data/core-rules-outline.json";

const entrySchema = z
	.object({
		slug: z.string().min(1),
		label: z.string().min(1),
		depth: z.union([z.literal(1), z.literal(2)]),
	})
	.strict();

const outlineSchema = z
	.object({
		entries: z.array(entrySchema).min(1),
	})
	.strict();

export type CoreRulesOutlineEntry = z.infer<typeof entrySchema>;

const parsed = outlineSchema.parse(rawOutline);

/** Validated Core Rules sidebar outline (anchors must match heading ids in the page). */
export const coreRulesOutlineEntries: CoreRulesOutlineEntry[] = parsed.entries;
