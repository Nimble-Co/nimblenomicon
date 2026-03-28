import { z } from 'astro/zod';
import rawMiscAdventuringEquipment from '../data/misc-adventuring-equipment.json';

const miscAdventuringEquipmentRowSchema = z
	.object({
		name: z.string().min(1),
		description: z.string().min(1),
		cost: z.string().min(1),
	})
	.strict();

export type MiscAdventuringEquipmentRowData = z.infer<
	typeof miscAdventuringEquipmentRowSchema
>;

export const miscAdventuringEquipment: MiscAdventuringEquipmentRowData[] = z
	.array(miscAdventuringEquipmentRowSchema)
	.parse(rawMiscAdventuringEquipment);
