import { z } from "astro/zod";
import rawArmor from "../data/armor.json";

const armorCategorySchema = z.enum([
  "cloth",
  "leather",
  "plate",
  "mail",
  "shields",
]);

const armorRowSchema = z
  .object({
    category: armorCategorySchema,
    item: z.string().min(1),
    armor: z.string().min(1),
    cost: z.string().min(1),
  })
  .strict();

export type ArmorCategory = z.infer<typeof armorCategorySchema>;
export type ArmorRowData = z.infer<typeof armorRowSchema>;

export const armorRows: ArmorRowData[] = z
  .array(armorRowSchema)
  .parse(rawArmor);

/** Section order and labels for the Core Rules armor tables. */
export const armorTableSections: { category: ArmorCategory; label: string }[] = [
  { category: "cloth", label: "Cloth" },
  { category: "leather", label: "Leather" },
  { category: "plate", label: "Plate" },
  { category: "mail", label: "Mail" },
  { category: "shields", label: "Shields" },
];
