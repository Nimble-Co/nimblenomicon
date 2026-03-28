import { z } from 'astro/zod';
import rawLanguages from '../data/languages.json';

const languageSchema = z
	.object({
		name: z.string().min(1),
		description: z.string(),
	})
	.strict();

export type LanguageData = z.infer<typeof languageSchema>;
export const languages: LanguageData[] = z
	.array(languageSchema)
	.parse(rawLanguages);
