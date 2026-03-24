# Examples — Core Rules data-driven extraction

Paths assume `src/content/docs/core-rules.mdx` and imports from that file (`../../features/...`).

## JSON shape (list of records)

Verbatim strings from MDX; `body` is whatever follows the bold title in the source list item.

```json
[
  {
    "name": "Tiny",
    "body": "can be carried in a typical pocket (many can comfortably fit in 1 space)."
  }
]
```

## `<feature>.ts` (e.g. `sizes.ts`, `stats.ts`, `skills.ts`)

Zod schema stays **private** in the same file; export only the inferred type and parsed array.

```typescript
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
```

## `Size.astro` (list item)

```astro
---
import type { SizeData } from "./sizes";

interface Props {
  size: SizeData;
}

const { size } = Astro.props;
---

<li>
  <strong>{size.name}</strong> {size.body}
</li>
```

## MDX fragment

Default import: Astro component. Named import: parsed data from the matching `*.ts` file.

```mdx
import Size from "../../features/sizes/Size.astro";
import { sizes } from "../../features/sizes/sizes";

<ul>
  {sizes.map((size) => (
    <Size size={size} />
  ))}
</ul>
```

## Optional field with inline markup

When a bullet needs `<br>` or bold inside the extra text, store a string and parse with `marked` in the component (see `src/features/skills/Skill.astro` and `callout` in `skills.json`).

## Pages CMS — `.pages.yml` (last step)

Add a `content` entry so the JSON is editable in Pages CMS. Copy the shape of **`stats`** or **`sizes`** in the repo’s `.pages.yml`: `type: file`, `path: src/data/<name>.json`, `format: json`, `list: true`, and `fields` that match your keys. See [Pages CMS — configuration](https://pagescms.org/docs/configuration).
