import { z } from 'astro/zod';
import rawSidebar from '../data/core-rules-sidebar.json';

const coreRulesSidebarLeafSchema = z
	.object({
		name: z.string().min(1),
		anchor: z.string().min(1),
	})
	.strict();

const coreRulesSidebarChapterSchema = z
	.object({
		name: z.string().min(1),
		collapsed: z.boolean(),
		items: z.array(coreRulesSidebarLeafSchema).min(1),
	})
	.strict();

/** Shape-only validation. Anchors are not checked against snippet ids while sidebar is in flux. */
const coreRulesSidebarSchema = z.array(coreRulesSidebarChapterSchema).min(1);

export type CoreRulesSidebarChapter = z.infer<
	typeof coreRulesSidebarChapterSchema
>;
export type CoreRulesSidebarLeaf = z.infer<typeof coreRulesSidebarLeafSchema>;

/** Parsed Core Rules book sidebar (accordion chapters + in-page anchors). */
export const coreRulesSidebar: CoreRulesSidebarChapter[] =
	coreRulesSidebarSchema.parse(rawSidebar);

/**
 * Starlight manual sidebar entries for the Core Rules section.
 * @param basePath e.g. `/core-rules/` from `SECTION_METADATA`
 */
export function coreRulesSidebarToNavItems(basePath: string): Array<{
	label: string;
	collapsed: boolean;
	items: Array<{ label: string; link: string }>;
}> {
	const prefix = basePath.endsWith('/') ? basePath : `${basePath}/`;
	return coreRulesSidebar.map((chapter) => ({
		label: chapter.name,
		collapsed: chapter.collapsed,
		items: chapter.items.map((item) => ({
			label: item.name,
			link: `${prefix}#${item.anchor}`,
		})),
	}));
}
