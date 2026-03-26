---
name: core-rules-data-driven
description: Extracts repeatable blocks from src/content/docs/core-rules.mdx into verbatim JSON under src/data, Zod + parsed data in src/features/<feature>/*.ts, Astro components, MDX wiring, and Pages CMS (.pages.yml) so JSON can be edited in the CMS. Use when asked to make Core Rules data-driven, add a Zod-backed rules section, refactor MDX into components, or follow the sizes/stats/skills pipeline in nimblenomicon.
license: MIT
metadata:
  author: nimblenomicon
  version: "1.3"
---

# Core Rules — data-driven extraction

## When to read this skill

Apply when the user wants a **structured** Core Rules block (repeated rows, list items, or table-like content) moved into typed data and components. Skip for one-off narrative paragraphs with no repeating shape.

**Repo note:** This workflow is authored under `.agents/skills/core-rules-data-driven/` (nimblenomicon agent skills), not under `.cursor/skills/`.

## Stats

### Zod + parsed data (`src/features/stats.ts`)

```ts
import { z } from "astro/zod";
import rawStats from "../data/stats.json";

const statSchema = z
  .object({
    name: z.string().min(1),
    stat: z.string().min(1),
    body: z.string(),
  })
  .strict();
export type StatData = z.infer<typeof statSchema>;
export const stats: StatData[] = z.array(statSchema).parse(rawStats);
```

### MDX wiring (`src/content/docs/core-rules.mdx`)

```mdx
import { stats } from "../../features/stats";

{stats.map((stat) => (
  <p><strong>{stat.name}</strong> ({stat.stat}) {stat.body}</p>
))}
```

## Skills

### Zod + parsed data (`src/features/skills.ts`)

```ts
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
```

### MDX wiring (`src/content/docs/core-rules.mdx`)

```mdx
import { skills } from "../../features/skills";

{skills.map((skill) => (
  <p><strong>{skill.name}</strong> ({skill.stat}) {skill.body}</p>
))}
```

## Size

### Zod + parsed data (`src/features/sizes.ts`)

```ts
import { z } from "astro/zod";
import rawSizes from "../data/sizes.json";

const sizeSchema = z
  .object({
    name: z.string().min(1),
    body: z.string(),
  })
  .strict();
export type SizeData = z.infer<typeof sizeSchema>;
export const sizes: SizeData[] = z.array(sizeSchema).parse(rawSizes);
```

### MDX wiring (`src/content/docs/core-rules.mdx`)

```mdx
import { sizes } from "../../features/sizes";

<ul>
  {sizes.map((size) => (
    <li>
      <strong>{size.name}</strong> {size.body}
    </li>
  ))}
</ul>
```

## Conditions

### Zod + parsed data (`src/features/conditions.ts`)

```ts
import { z } from "astro/zod";
import rawConditions from "../data/conditions.json";

const conditionSchema = z
  .object({
    name: z.string().min(1),
    body: z.string(),
  })
  .strict();
export type ConditionData = z.infer<typeof conditionSchema>;
export const conditions: ConditionData[] = z
  .array(conditionSchema)
  .parse(rawConditions);
```

### MDX wiring (`src/content/docs/core-rules.mdx`)

```mdx
import { conditions } from "../../features/conditions";

<ul>
  {conditions.map((condition) => (
    <li>
      <strong>{condition.name}</strong> {condition.body}
    </li>
  ))}
</ul>
```

## Discovery (before implementation)

1. Open `src/content/docs/core-rules.mdx` and mark the **exact** block to replace.
2. Decide record fields so JSON + Astro can reproduce the same DOM (paragraphs, lists, tables, blockquotes).
3. If the section could be modeled multiple ways, **ask** which shape to use — do not pick arbitrarily.

## Implementation order

Follow the existing pipeline in `src/features/sizes/`, `src/features/stats/`, and `src/features/skills/` (see [examples.md](examples.md)):
one plural `*.ts` file with private Zod schema + exported type and parsed array, plus one `*.astro` component.

### 1. Data

- Add `src/data/<name>.json`.
- Use a **top-level array** when every row shares the same fields (`src/data/skills.json`).
- **Copy text verbatim** from `core-rules.mdx` — no rewording or typo fixes in rule text.

### 2. Feature folder

- Create `src/features/<folder>/`.
- **Naming (this repo):** plural folder + matching data module: `sizes/sizes.ts` + `Size.astro`, `stats/stats.ts` + `Stat.astro`, `skills/skills.ts` + `Skill.astro`, `conditions/conditions.ts` + `Condition.astro`.

### 3. Zod + parsed data (`<name>.ts`)

- Use `import { z } from "astro/zod"`.
- Keep the schema local (`const <name>Schema = z.object(...).strict()`), then export:
  - `export type <Name>Data = z.infer<typeof <name>Schema>`
  - `export const <names>: <Name>Data[] = z.array(<name>Schema).parse(rawJson)`

### 4. No Astro barrel

- Do **not** re-export the component from the `.ts` file.
- Import the default component from `*.astro` and `{ data }` from `*.ts` in MDX (see [examples.md](examples.md)).

### 5. Astro

- One component per record unless a single wrapper is clearly better.
- Match markdown semantics: `<p>`, `<li>`, `<th>`/`<td>`, etc.
- Use `marked.parse` only for fields that contain markdown/HTML (pattern: `src/features/skills/Skill.astro`).

### 6. MDX

- Remove the old markdown for that block.
- Add `import Component from "../../features/<folder>/Component.astro"` and `import { items } from "../../features/<folder>/<name>.ts"` (fix depth if the doc moves).
- Use `.map()` like the examples above; include outer `<ul>`, `<table>`, etc., when the original was a list or table.

### 7. Verify

- `npm run build` succeeds.
- Zod parse passes at runtime; visually compare to prior markdown output.

### 8. Pages CMS (last step)

- Update **`.pages.yml`** at the repo root so the new JSON file is editable in [Pages CMS](https://pagescms.org/docs/configuration).
- Under `content:`, add a **`file`** entry (or match an existing pattern) with:
  - `name` / `label` for the collection in the UI
  - `path:` pointing at `src/data/<name>.json`
  - `format: json` and `list: true` when the file is a **top-level array** of records
  - `fields:` aligned with the JSON keys and Zod shape (`type: string`, `type: text`, `required`, `options.minlength` / `options.maxlength` when useful — see [string field](https://pagescms.org/docs/configuration/string-field/) / [text field](https://pagescms.org/docs/configuration/text-field/))
- For a field that must match another collection stored as **`file` + `list: true`** (e.g. skill → stat code → `stats.json`), use `type: string` and document the match in `description`. Pages CMS `reference` does not populate options for single-file JSON lists yet ([pages-cms#311](https://github.com/pages-cms/pages-cms/issues/311)); rely on Zod (e.g. `.refine` against parsed stats) for validation.
- Mirror live examples: `stats`, `sizes`, `skills`, and `conditions` blocks in `.pages.yml`.

## Anti-patterns

- Flattening narrative prose into JSON without a repeated structure.
- Editing rule wording during extraction.
- Dropping list/table wrappers so the rendered DOM diverges from markdown.
- Shipping new `src/data/*.json` without a matching `.pages.yml` entry when editors are expected to use Pages CMS.

## Additional resources

- Concrete snippets: [examples.md](examples.md)
