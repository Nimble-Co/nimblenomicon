import { z } from "astro/zod";
import rawOptionalVariantRules from "../data/optional-variant-rules.json";

const optionalVariantRuleSchema = z
  .object({
    name: z.string().min(1),
    body: z.string(),
  })
  .strict();

export type OptionalVariantRuleData = z.infer<typeof optionalVariantRuleSchema>;
export const optionalVariantRules: OptionalVariantRuleData[] = z
  .array(optionalVariantRuleSchema)
  .parse(rawOptionalVariantRules);
