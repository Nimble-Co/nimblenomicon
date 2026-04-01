import { z } from 'astro/zod';
import rawSidebar from '../data/game-masters-guide-sidebar.json';
import { gameMastersGuideSnippets } from './game-masters-guide-snippets';

const snippetIds = new Set(gameMastersGuideSnippets.map((r) => r.id));

const gameMastersGuideSidebarLeafSchema = z
	.object({
		name: z.string().min(1),
		anchor: z.string().min(1),
	})
	.strict();

const gameMastersGuideSidebarChapterSchema = z
	.object({
		name: z.string().min(1),
		collapsed: z.boolean(),
		items: z.array(gameMastersGuideSidebarLeafSchema).min(1),
	})
	.strict();

const gameMastersGuideSidebarSchema = z
	.array(gameMastersGuideSidebarChapterSchema)
	.min(1)
	.superRefine((chapters, ctx) => {
		for (let ci = 0; ci < chapters.length; ci++) {
			const ch = chapters[ci]!;
			for (let li = 0; li < ch.items.length; li++) {
				const { anchor } = ch.items[li]!;
				if (!snippetIds.has(anchor)) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: `Unknown anchor "${anchor}" (no matching Game Master's Guide snippet id)`,
						path: [ci, 'items', li, 'anchor'],
					});
				}
			}
		}
	});

export type GameMastersGuideSidebarChapter = z.infer<
	typeof gameMastersGuideSidebarChapterSchema
>;
export type GameMastersGuideSidebarLeaf = z.infer<
	typeof gameMastersGuideSidebarLeafSchema
>;

export const gameMastersGuideSidebar: GameMastersGuideSidebarChapter[] =
	gameMastersGuideSidebarSchema.parse(rawSidebar);

export function gameMastersGuideSidebarToNavItems(basePath: string): Array<{
	label: string;
	collapsed: boolean;
	items: Array<{ label: string; link: string }>;
}> {
	const prefix = basePath.endsWith('/') ? basePath : `${basePath}/`;
	return gameMastersGuideSidebar.map((chapter) => ({
		label: chapter.name,
		collapsed: chapter.collapsed,
		items: chapter.items.map((item) => ({
			label: item.name,
			link: `${prefix}#${item.anchor}`,
		})),
	}));
}
