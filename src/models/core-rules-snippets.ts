import { z } from 'astro/zod';
import rawSnippets from '../data/core-rules-snippets.json';

const coreRulesSnippetSchema = z
	.object({
		name: z.string().min(1),
		description: z.string().min(1),
	})
	.strict();

export type CoreRulesSnippetData = z.infer<typeof coreRulesSnippetSchema>;

export const coreRulesSnippets: CoreRulesSnippetData[] = z
	.array(coreRulesSnippetSchema)
	.parse(rawSnippets);
