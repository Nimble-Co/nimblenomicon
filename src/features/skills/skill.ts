import { z } from "zod";
import rawSkills from "../../data/skills.json";

export { default as Skill } from "./Skill.astro";

export const skillSchema = z
  .object({
    name: z.string().min(1),
    stat: z.string().min(1),
    body: z.string(),
    callout: z.string().optional(),
  })
  .strict();

export const skillsSchema = z.array(skillSchema);

export type SkillData = z.infer<typeof skillSchema>;

export const skills: SkillData[] = skillsSchema.parse(rawSkills);
