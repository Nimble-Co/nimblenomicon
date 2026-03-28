import { z } from "astro/zod";
import rawBackgrounds from "../data/backgrounds.json";

const backgroundSegmentSchema = z
  .object({
    name: z.string().min(1),
    description: z.string(),
  })
  .strict();

export type BackgroundSegmentData = z.infer<typeof backgroundSegmentSchema>;
export const backgrounds: BackgroundSegmentData[] = z
  .array(backgroundSegmentSchema)
  .parse(rawBackgrounds);
