import { z } from 'astro/zod';
import rawSizes from '../data/sizes.json';
import { sourceRefSchema } from './entity-base';

const sizeSchema = z
	.object({
		name: z.string().min(1),
		description: z.string(),
		source: sourceRefSchema,
	})
	.strict();
export type SizeData = z.infer<typeof sizeSchema>;
export const sizes: SizeData[] = z.array(sizeSchema).parse(rawSizes);
