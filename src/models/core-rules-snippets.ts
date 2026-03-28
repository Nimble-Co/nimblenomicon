import { z } from 'astro/zod';
import rawSnippets from '../data/core-rules-snippets.json';

const coreRulesSnippetSchema = z
	.object({
		id: z.string().min(1),
		name: z.string().min(1),
		description: z.string(),
		headingLevel: z.enum(['h1', 'h2', 'h3', 'none']).optional(),
	})
	.strict();

export type CoreRulesSnippetData = z.infer<typeof coreRulesSnippetSchema>;

export const coreRulesSnippets: CoreRulesSnippetData[] = z
	.array(coreRulesSnippetSchema)
	.pipe(
		z.array(coreRulesSnippetSchema).superRefine((rows, ctx) => {
			const seen = new Map<string, number>();
			for (let i = 0; i < rows.length; i++) {
				const id = rows[i]!.id;
				if (seen.has(id)) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: `Duplicate snippet id "${id}" (rows ${seen.get(id)} and ${i})`,
						path: [i, 'id'],
					});
				} else {
					seen.set(id, i);
				}
			}
		}),
	)
	.parse(rawSnippets);
