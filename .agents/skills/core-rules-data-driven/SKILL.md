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

## Discovery (before implementation)

1. Open `src/content/docs/core-rules.mdx` and mark the **exact** block to replace.
2. Decide record fields so JSON + Astro can reproduce the same DOM (paragraphs, lists, tables, blockquotes).
3. If the section could be modeled multiple ways, **ask** which shape to use — do not pick arbitrarily.

## Implementation order

Follow `src/features/sizes/`, `src/features/stats/`, and `src/features/skills/` (see [examples.md](examples.md)): one plural `*.ts` file with private Zod schema + exported type and parsed array, plus one `*.astro` component.

### 1. Data

- Add `src/data/<name>.json`.
- Use a **top-level array** when every row shares the same fields (`src/data/skills.json`).
- **Copy text verbatim** from `core-rules.mdx` — no rewording or typo fixes in rule text.

### 2. Feature folder

- Create `src/features/<folder>/`.
- **Naming (this repo):** plural folder and matching data module: `sizes/sizes.ts` + `Size.astro`, `stats/stats.ts` + `Stat.astro`, `skills/skills.ts` + `Skill.astro`.

### 3. Zod + parsed data (`<name>.ts`)

- Use `import { z } from "astro/zod"`.
- `const itemSchema = z.object(...).strict()` (not exported unless you need it elsewhere).
- `export type XData = z.infer<typeof itemSchema>`.
- `export const items: XData[] = z.array(itemSchema).parse(rawJson)`.

### 4. No Astro barrel

- Do **not** re-export the component from the `.ts` file. Import the default component from `*.astro` and `{ data }` from `*.ts` in MDX (see [examples.md](examples.md)).

### 5. Astro

- One component per record unless a single wrapper is clearly better.
- Match markdown semantics: `<p>`, `<li>`, `<th>`/`<td>`, etc.
- Use `marked.parse` only for fields that contain markdown/HTML (pattern: `src/features/skills/Skill.astro`).

### 6. MDX

- Remove the old markdown for that block.
- Add `import Component from "../../features/<folder>/Component.astro"` and `import { items } from "../../features/<folder>/<name>.ts"` (fix depth if the doc moves).
- Use `.map()` like existing Stats/Skills; include outer `<ul>`, `<table>`, etc., when the original was a list or table.

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
- Mirror live examples: `stats`, `sizes`, and `skills` blocks in `.pages.yml`.

## Reference paths

| Role          | Example                                                                                       |
| ------------- | --------------------------------------------------------------------------------------------- |
| Data          | `src/data/sizes.json`, `src/data/stats.json`, `src/data/skills.json`                          |
| Data + schema | `src/features/sizes/sizes.ts`, `src/features/stats/stats.ts`, `src/features/skills/skills.ts`   |
| Component     | `src/features/sizes/Size.astro`, `src/features/stats/Stat.astro`, `src/features/skills/Skill.astro` |
| MDX           | `src/content/docs/core-rules.mdx` — search `features/sizes`, `features/stats`, `features/skills`   |
| Pages CMS     | `.pages.yml` — `content` entries for each `src/data/*.json` list you want editable in the CMS      |

## Anti-patterns

- Flattening narrative prose into JSON without a repeated structure.
- Editing rule wording during extraction.
- Dropping list/table wrappers so the rendered DOM diverges from markdown.
- Shipping new `src/data/*.json` without a matching `.pages.yml` entry when editors are expected to use Pages CMS.

## Additional resources

- Concrete snippets: [examples.md](examples.md)
