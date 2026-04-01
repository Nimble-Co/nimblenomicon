import { z } from 'astro/zod';
import rawSnippets from '../data/game-masters-guide-snippets.json';

const gameMastersGuideSnippetSchema = z
	.object({
		id: z.string().min(1),
		description: z.string().min(1),
	})
	.strict();

export type GameMastersGuideSnippetData = z.infer<
	typeof gameMastersGuideSnippetSchema
>;

export const gameMastersGuideSnippets: GameMastersGuideSnippetData[] = z
	.array(gameMastersGuideSnippetSchema)
	.pipe(
		z.array(gameMastersGuideSnippetSchema).superRefine((rows, ctx) => {
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
