import { z } from "astro/zod";
import type { TocItem } from "../../node_modules/@astrojs/starlight/utils/generateToC.ts";
import rawOutline from "../data/core-rules-outline.json";

/** Starlight “Overview” anchor id (hero title on Core Rules). */
const PAGE_TITLE_ID = "_top";

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

function injectChild(items: TocItem[], item: TocItem): void {
	const lastItem = items.at(-1);
	if (!lastItem || lastItem.depth >= item.depth) {
		items.push(item);
	} else {
		injectChild(lastItem.children, item);
	}
}

/** Builds a Starlight-compatible nested TOC from the flat outline list. */
export function coreRulesOutlineToTocItems(
	overviewTitle: string,
): TocItem[] {
	const toc: TocItem[] = [
		{
			depth: 2,
			slug: PAGE_TITLE_ID,
			text: overviewTitle,
			children: [],
		},
	];
	for (const row of coreRulesOutlineEntries) {
		injectChild(toc, {
			depth: row.depth,
			slug: row.slug,
			text: row.label,
			children: [],
		});
	}
	return toc;
}
