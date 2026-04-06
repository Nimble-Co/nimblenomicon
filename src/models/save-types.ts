import { z } from 'astro/zod';
import rawSaveTypes from '../data/save-types.json';
import { sourceRefSchema } from './entity-base';

const saveTypeSchema = z
	.object({
		name: z.string().min(1),
		description: z.string(),
		source: sourceRefSchema,
	})
	.strict();

export type SaveTypeData = z.infer<typeof saveTypeSchema>;
export const saveTypes: SaveTypeData[] = z
	.array(saveTypeSchema)
	.parse(rawSaveTypes);
