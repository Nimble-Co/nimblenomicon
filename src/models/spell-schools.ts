import { z } from 'astro/zod';
import rawSpellSchools from '../data/spell-schools.json';
import { slugifyEntityId } from '../utils/slugifyEntityId';

const spellSchoolSchema = z
	.object({
		name: z.string().min(1),
		description: z.string(),
	})
	.strict()
	.transform((spell) => ({
		...spell,
		id: slugifyEntityId(spell.name, 'spell-school'),
	}));

export type SpellSchoolData = z.infer<typeof spellSchoolSchema>;
export const spellSchools: SpellSchoolData[] = z
	.array(spellSchoolSchema)
	.parse(rawSpellSchools);
