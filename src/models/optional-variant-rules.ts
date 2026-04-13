import { z } from 'astro/zod';
import { readNimbleGameJson } from './nimble-game-data-raw';

const optionalVariantRuleSchema = z
	.object({
		name: z.string().min(1),
		description: z.string(),
	})
	.strict();

export type OptionalVariantRuleData = z.infer<typeof optionalVariantRuleSchema>;
export const optionalVariantRules: OptionalVariantRuleData[] = z
	.array(optionalVariantRuleSchema)
	.parse(readNimbleGameJson('optional-variant-rules'));
