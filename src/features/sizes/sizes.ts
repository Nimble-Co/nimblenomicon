import { z } from "astro/zod";
import rawSizes from "../../data/sizes.json";

const sizeSchema = z
  .object({
    name: z.string().min(1),
    body: z.string(),
  })
  .strict();
export type SizeData = z.infer<typeof sizeSchema>;
export const sizes: SizeData[] = z.array(sizeSchema).parse(rawSizes);
