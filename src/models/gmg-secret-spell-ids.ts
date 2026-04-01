import { z } from 'astro/zod';
import raw from '../data/gmg-secret-spell-ids.json';

const rowSchema = z
	.object({
		spellId: z.string().min(1),
	})
	.strict();

export type GmgSecretSpellIdRow = z.infer<typeof rowSchema>;

export const gmgSecretSpellIdRows: GmgSecretSpellIdRow[] = z
	.array(rowSchema)
	.parse(raw);

export const gmgSecretSpellIds: string[] = gmgSecretSpellIdRows.map(
	(r) => r.spellId,
);
