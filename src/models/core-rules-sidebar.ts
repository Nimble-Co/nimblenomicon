import { z } from 'astro/zod';
import rawSidebar from '../data/core-rules-sidebar.json';
import { coreRulesSnippets } from './core-rules-snippets';

const snippetIds = new Set(coreRulesSnippets.map((r) => r.id));

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

const coreRulesSidebarSchema = z
	.array(coreRulesSidebarChapterSchema)
	.min(1)
	.superRefine((chapters, ctx) => {
		for (let ci = 0; ci < chapters.length; ci++) {
			const ch = chapters[ci]!;
			for (let li = 0; li < ch.items.length; li++) {
				const { anchor } = ch.items[li]!;
				if (!snippetIds.has(anchor)) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: `Unknown anchor "${anchor}" (no matching core-rules snippet id)`,
						path: [ci, 'items', li, 'anchor'],
					});
				}
			}
		}
	});

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
