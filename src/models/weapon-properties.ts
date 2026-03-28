import { z } from 'astro/zod';
import rawWeaponProperties from '../data/weapon-properties.json';

const weaponPropertySchema = z
	.object({
		name: z.string().min(1),
		description: z.string(),
	})
	.strict();

export type WeaponPropertyData = z.infer<typeof weaponPropertySchema>;

export const weaponProperties: WeaponPropertyData[] = z
	.array(weaponPropertySchema)
	.parse(rawWeaponProperties);
