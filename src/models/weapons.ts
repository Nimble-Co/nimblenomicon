import { z } from "astro/zod";
import rawWeapons from "../data/weapons.json";

const weaponPropertyLineSchema = z
  .object({
    description: z.string().min(1),
  })
  .strict();

const weaponSchema = z
  .object({
    category: z.enum(["melee", "ranged"]),
    name: z.string().min(1),
    damage: z.string().min(1),
    propertyLines: z.array(weaponPropertyLineSchema).default([]),
    cost: z.string().min(1),
  })
  .strict();

export type WeaponPropertyLineData = z.infer<typeof weaponPropertyLineSchema>;
export type WeaponData = z.infer<typeof weaponSchema>;

export const weapons: WeaponData[] = z.array(weaponSchema).parse(rawWeapons);
