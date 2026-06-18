import { z } from 'astro/zod';
import { readNimbleGameJson } from './nimble-game-data-raw';
import { refineUniqueNumericField } from './zod-unique-array';

const chaosRowSchema = z
	.object({
		roll: z.number().int().min(1).max(20),
		name: z.string().min(1),
		description: z.string().min(1),
	})
	.strict();

export type ChaosMagicRow = z.infer<typeof chaosRowSchema>;

export const chaosMagicRows: ChaosMagicRow[] = z
	.array(chaosRowSchema)
	.pipe(
		z
			.array(chaosRowSchema)
			.superRefine(
				refineUniqueNumericField<ChaosMagicRow, 'roll'>(
					'roll',
					(r) => `Duplicate chaos roll ${r}`,
				),
			),
	)
	.parse(readNimbleGameJson('chaos-magic'));
