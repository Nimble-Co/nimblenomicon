import { z } from 'astro/zod';
import raw from '../data/chaos-magic.json';
import { sourceRefSchema } from './entity-base';

const chaosRowSchema = z
	.object({
		roll: z.number().int().min(1).max(20),
		name: z.string().min(1),
		description: z.string().min(1),
		source: sourceRefSchema,
	})
	.strict();

export type ChaosMagicRow = z.infer<typeof chaosRowSchema>;

export const chaosMagicRows: ChaosMagicRow[] = z
	.array(chaosRowSchema)
	.pipe(
		z.array(chaosRowSchema).superRefine((rows, ctx) => {
			const seen = new Set<number>();
			for (let i = 0; i < rows.length; i++) {
				const r = rows[i]!.roll;
				if (seen.has(r)) {
					ctx.addIssue({
						code: 'custom',
						message: `Duplicate chaos roll ${r}`,
						path: [i, 'roll'],
					});
				}
				seen.add(r);
			}
		}),
	)
	.parse(raw);
