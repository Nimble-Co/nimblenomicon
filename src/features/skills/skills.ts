import { z } from "astro/zod";
import rawSkills from "../../data/skills.json";

const skillSchema = z
  .object({
    name: z.string().min(1),
    stat: z.string().min(1),
    body: z.string(),
    callout: z.string().optional(),
  })
  .strict();
export type SkillData = z.infer<typeof skillSchema>;
export const skills: SkillData[] = z.array(skillSchema).parse(rawSkills);
