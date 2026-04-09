# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

The Nimblenomicon is a static documentation site for the Nimble tabletop RPG, built with **Astro v6 + Starlight** and styled with **Tailwind CSS v4**. Game data lives as JSON in `src/data/` and is validated by Zod schemas in `src/models/`. Content pages are `.mdx` files under `src/content/docs/`.

### Running the app

Standard commands from the repo root (see `CONTRIBUTING.md` § Local Development):

| Command                | Purpose                                           |
| ---------------------- | ------------------------------------------------- |
| `npm run dev`          | Dev server at `localhost:4321`                    |
| `npm run build`        | Production build to `dist/`                       |
| `npm run preview`      | Serve production build locally                    |
| `npm run format`       | Apply Prettier to the repo                        |
| `npm run format:check` | Check formatting (same as CI)                     |
| `npm run lint`         | ESLint (TS/Astro) + markdownlint (md/mdx)         |
| `npm test`             | Vitest unit tests (auto-xref path + HTML helpers) |

### Styling (Tailwind v4 + Starlight)

- **Do not** use arbitrary Tailwind values that embed Starlight CSS variables (e.g. `text-[var(--sl-color-gray-3)]`, `border-[var(--sl-color-hairline-light)]`). Those belong in [`src/styles/global.css`](src/styles/global.css) under `@theme inline` as `--color-*` aliases to `var(--sl-color-…)`, then reference them with normal utilities (`text-fg-muted`, `border-hairline`, `bg-surface-code`, `text-danger`, etc.). Keeps markup readable and preserves theme switching.

### Caveats

- **Lint, format, build, and tests** run in CI (`.github/workflows/ci.yml`). Before pushing substantive edits, run `npm run format:check`, `npm run lint`, and `npm test` locally. Markdownlint targets repo docs and `src/**`; `.agents/**` and `docs/**` are ignored so agent-skill and ideation markdown does not block the build.
- **Search (Pagefind)** only works in production builds. In the dev server, the search bar is present but nonfunctional. To test search: `npm run build && npm run preview`, then use the preview server.
- The `site` option in `astro.config.ts` is **not set** (it is computed from GitHub environment variables during CI). This causes a harmless `@astrojs/sitemap` warning during local builds. Ignore it.
- **No environment variables or secrets** are required for local development.
- There are no databases, Docker containers, or backend services to run. The entire product is a single static site.

## Content and CMS preferences (project owner)

These preferences come from ongoing Core Rules work. Agents should follow them when editing data, models, MDX, or `.pages.yml`.

### Data-driven Core Rules

- Move repeatable blocks from the Core Rules page (`src/pages/core-rules/index.astro`) into JSON under `src/data/`, validate with Zod in `src/models/`, and render from that page. Keep output matching the previous markdown unless intentionally changing copy.
- Use **`src/models/`** (not `src/features/`) for schemas and parsed exports.
- Remove one-off extraction or migration **scripts** after the migration is done; do not leave them in the branch unless they are maintained tooling.

### Naming and fields

- Prefer a single **`name`** field for row identity across features (e.g. equipment rows use `name`, not `item` or ad-hoc keys). Align JSON keys and CMS field **`name`** with that convention.
- Prefer **`description`** for long-form or rich-text content instead of **`body`** or **`properties`**, unless the shape is intentionally different (e.g. weapons use **`propertyLines`** with **`description`** per line).
- **List labels:** Do not bake trailing **`.`** or **`:`** into JSON `name` values; add punctuation in the Astro/MDX template next to the rendered name.
- When a title is embedded in prose/HTML only, **extract a `name` (or equivalent) field** and compose display in MDX so the CMS can edit it cleanly.

### Spells (Nimble terminology)

- Use **spell tier**, not “spell level.” In data use numeric **`tier`** (0 = cantrip, 1–9 = tiers). Display as **Cantrip** / **Tier 1** … **Tier 9** in italic meta lines.
- **`castingTime`** is a **string** (e.g. `1 Action`, `2 Actions`, `24 hours`, `Casting Time: 1 minute`). Do not split into numeric actions plus a separate casting note.
- **`target`** remains a structured enum.
- **`utility`** is a **boolean**. School comes only from **`schoolId`**; do not duplicate a separate school display name on each row.
- **Tempest's Command** is a **Lightning** school spell (including under utility); it is **not** its own school id.
- **`spells.json`** should stay a **flat array** suitable for Pages CMS list editing (not a wrapper-only shape that breaks the list editor).
- Spell school intro rows: store a **short school name** (e.g. Fire); add the word **Spells** in MDX for headings and list labels.

### Pages CMS (`.pages.yml`)

- **Labels:** Use **Title Case** for field labels. Avoid redundant prefixes like “Core Rules —” on every entry.
- **Grouping:** Group related files in the sidebar (e.g. spell schools next to spells, equipment together).
- Prefer **`format: json`** with **`list: true`** and explicit **`fields`** over **`format: code`** when the schema allows structured editing.
- **`type: rich-text`** with **`options.format: markdown`** for markdown fragments; keep behavior consistent with site rendering (`renderMarkdown` in MDX).
- **Optional variant rules** may live as a **top-level** content entry if that fits the IA better than nesting only under a group.
- Former “callout” content: prefer **blockquotes inside markdown `description`** instead of a separate parallel field, when that keeps editing simpler.

### Entity cross-links (`auto-xref`)

- **Build-time linking:** After `astro build`, the `nimble-auto-xref` integration runs on `dist/**/*.html`, parses HTML with Cheerio, and wraps matching catalog terms in `<a class="auto-xref" href … data-term data-kind data-definition>` (**case-insensitive** match on prose; the visible link text follows the source, while `data-term` uses the canonical catalog spelling for the tooltip). This does **not** run during `npm run dev`; use `npm run build && npm run preview` to verify links and tooltips.
- **Scoped prose:** Starlight doc bodies use the `MarkdownContent` override, which wraps markdown in **`data-auto-link`**. Any **custom Astro page or component** that renders `renderMarkdown()` output for user-facing prose must also wrap that output in an element with **`data-auto-link`** (or put it inside a parent that already has it), or the HTML pass will skip it.
- **Overrides in MDX/HTML:** Use `<span data-no-xref>…</span>` to keep a phrase from being linked. Use `<Reference term="…" kind="…" />` from `@components/Reference.astro` when the same label appears in multiple collections. Use a manual `<a class="auto-xref" href="…" data-term="…" data-definition="…" data-kind="…">…</a>` when auto-linking is wrong or missing. See the README section on cross-links for examples.
- **Tables:** Prose inside `<table>` is not auto-linked (markdown in table cells is skipped).
- **Global blocklist:** `GLOBAL_XREF_AUTOLINK_BLOCKLIST` in [`src/models/xref-terms.ts`](src/models/xref-terms.ts) holds terms (case-insensitive) that never get build-time links; add entries there for common false positives. Manual `Reference` / `.auto-xref` still work.

### Workflow

- **Verify** with `npm run build` after substantive content or schema changes.
- **Commit and push** on the working branch with clear messages; prefer **smaller commits** over one huge diff.
- When multiple reasonable design choices exist and the owner has not stated a preference, **ask** rather than guessing.
