import { z } from 'astro/zod';
import { readNimbleGameJson } from './nimble-game-data-raw';

const weaponPropertySchema = z
	.object({
		name: z.string().min(1),
		description: z.string(),
	})
	.strict();

export type WeaponPropertyData = z.infer<typeof weaponPropertySchema>;

export const weaponProperties: WeaponPropertyData[] = z
	.array(weaponPropertySchema)
	.parse(readNimbleGameJson('weapon-properties'));
