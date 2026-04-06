import { z } from 'astro/zod';
import rawOptionalVariantRules from '../data/optional-variant-rules.json';
import { sourceRefSchema } from './entity-base';

const optionalVariantRuleSchema = z
	.object({
		name: z.string().min(1),
		description: z.string(),
		source: sourceRefSchema,
	})
	.strict();

export type OptionalVariantRuleData = z.infer<typeof optionalVariantRuleSchema>;
export const optionalVariantRules: OptionalVariantRuleData[] = z
	.array(optionalVariantRuleSchema)
	.parse(rawOptionalVariantRules);
