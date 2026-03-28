import { z } from "astro/zod";
import rawMagicalItems from "../data/magical-items.json";

const magicalItemStandardSchema = z
  .object({
    kind: z.literal("standard"),
    name: z.string().min(1),
    subtitle: z.string().optional(),
    paragraphs: z.array(z.string()),
    bullets: z.array(z.string()).optional(),
    callout: z.string().optional(),
  })
  .strict();

const magicalItemWandSchema = z
  .object({
    kind: z.literal("wand"),
    name: z.string().min(1),
    subtitle: z.string().optional(),
    body: z.string().optional(),
    recharge: z.string().min(1),
  })
  .strict();

const magicalItemSchema = z.discriminatedUnion("kind", [
  magicalItemStandardSchema,
  magicalItemWandSchema,
]);

export type MagicalItemData = z.infer<typeof magicalItemSchema>;
export const magicalItems: MagicalItemData[] = z
  .array(magicalItemSchema)
  .parse(rawMagicalItems);
