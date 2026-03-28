import { z } from 'astro/zod';
import rawGlossary from '../data/glossary.json';

const glossaryEntrySchema = z
	.object({
		name: z.string().min(1),
		description: z.string(),
	})
	.strict();
export type GlossaryEntryData = z.infer<typeof glossaryEntrySchema>;
export const glossary: GlossaryEntryData[] = z
	.array(glossaryEntrySchema)
	.parse(rawGlossary);
