import { z } from "astro/zod";
import rawDcExamples from "../data/dc-examples.json";

const dcExampleSchema = z
  .object({
    name: z.string().min(1),
    description: z.string().min(1),
  })
  .strict();

export type DcExampleData = z.infer<typeof dcExampleSchema>;
export const dcExamples: DcExampleData[] = z
  .array(dcExampleSchema)
  .parse(rawDcExamples);
