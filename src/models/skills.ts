import { z } from "astro/zod";
import rawSkills from "../data/skills.json";
import { stats } from "./stats";

const statCodes = new Set(stats.map((s) => s.stat));

const skillSchema = z
  .object({
    name: z.string().min(1),
    stat: z
      .string()
      .min(1)
      .refine((code) => statCodes.has(code), {
        message: "stat must match a Stat code from stats.json",
      }),
    body: z.string(),
    callout: z.string().optional(),
  })
  .strict();
export type SkillData = z.infer<typeof skillSchema>;
export const skills: SkillData[] = z.array(skillSchema).parse(rawSkills);
