import { z } from 'astro/zod';
import rawWeaponProperties from '../data/weapon-properties.json';
import { sourceRefSchema } from './entity-base';

const weaponPropertySchema = z
	.object({
		name: z.string().min(1),
		description: z.string(),
		source: sourceRefSchema,
	})
	.strict();

export type WeaponPropertyData = z.infer<typeof weaponPropertySchema>;

export const weaponProperties: WeaponPropertyData[] = z
	.array(weaponPropertySchema)
	.parse(rawWeaponProperties);
