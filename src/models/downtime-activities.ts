import { z } from "astro/zod";
import rawDowntimeActivities from "../data/downtime-activities.json";

const downtimeActivitySchema = z
  .object({
    name: z.string().min(1),
    body: z.string(),
  })
  .strict();

export type DowntimeActivityData = z.infer<typeof downtimeActivitySchema>;
export const downtimeActivities: DowntimeActivityData[] = z
  .array(downtimeActivitySchema)
  .parse(rawDowntimeActivities);
