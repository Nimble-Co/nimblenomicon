# ♻️ refactor: centralize section metadata and search placeholder

**Type:** refactor / enhancement (maintainability)  
**Conventional title:** `refactor: centralize section metadata and search config`  
**Brainstorm:** [docs/ideate/2026-03-22-components-maintainability-brainstorm-doc.md](../ideate/2026-03-22-components-maintainability-brainstorm-doc.md)

## Stakeholders

| Audience | Impact |
|----------|--------|
| **Maintainers** | Single registry for section labels, paths, icons, and sizes; fewer drift bugs. |
| **End users** | No intentional UX or copy change; behavior must match today. |

## Background and motivation

`HomeLanding.astro` and `SectionSidebarBrand.astro` duplicate the same six sections (labels, asset imports, dimensions). `SECTION_SIDEBAR_CONFIG` repeats the same labels and path-shaped links. Search UI repeats the literal `Search for anything...` in `Search.astro` and `HomeLanding.astro`.

The brainstorm chose **config-first DRY** plus **documentation** for Starlight upgrades (no deep refactor of `HeroCallout`, `NimbleHomePage`, or `Search.astro` structure unless file size forces a split).

## Technical review (2026-03-22)

**Verdict:** Approve with clarifications below (review used simplicity + maintainability criteria; this repo is Astro/Starlight, not Flutter—no Bloc/package rules apply).

**Findings folded into this doc:**

| Topic | Guidance |
|-------|----------|
| **File layout** | Prefer either a new `section-metadata.ts` **or** colocate `SECTION_METADATA` in `section-sidebars.ts` so keys, sidebar shape, and presentation live in one module—fewer imports for a six-section site. Choose based on file length tolerance. |
| **`withBase` / `BASE_URL`** | Prefer **not** spreading `import.meta.env` helpers across arbitrary TS unless everything is Vite-processed. Options: (a) keep `withBase` in `HomeLanding.astro` and have metadata export only `path`, composing `href` in the component; or (b) keep a small `withBase` next to metadata if only `.astro` (and Vite-bundled `src/`) imports it. Avoid non-Vite Node entrypoints calling env-dependent helpers. |
| **Types** | After deriving `SECTION_SIDEBAR_CONFIG`, confirm types still satisfy `section-sidebar.ts` (use `satisfies` or an explicit builder return type) to avoid widening. |
| **CONTRIBUTING commands** | Document **`grep -r`** as well as **`rg`** so maintainers without ripgrep can run the checklist. |
| **`Search.astro`** | Replacing the frontmatter placeholder variable is enough; `pagefindTranslations` and the template pick it up—no extra abstraction. |
| **Global sidebar** | Checklist sync for `astro.config.mjs` vs `SECTION_METADATA` remains required if config is not imported from shared TS. |

**No blockers** identified for implementation.

## User flow and regression scope

**No user journey change.** Users still land on home, open search, and navigate sections as today.

**Regression checks (manual):**

- [ ] Home: six tiles show correct icons, labels, and destinations (including `base` / GitHub Pages).
- [ ] Each section doc: sidebar brand shows correct icon + title; nav and inline TOC behave as before.
- [ ] Search: header trigger and home “fake” search show the same placeholder text; ⌘/Ctrl+K still opens modal.
- [ ] Section-scoped pagination (prev/next within section) unchanged.

## Acceptance criteria

- [ ] One **authoritative** definition of per-section **label**, **canonical path** (e.g. `/heroes/`), **icon**, and **display dimensions** for home tiles vs sidebar brand.
- [ ] `SECTION_SIDEBAR_CONFIG` **labels and links** are derived from that authority (no duplicated label strings for the same section key).
- [ ] `SEARCH_PLACEHOLDER` (or equivalent name) is exported once and used by `Search.astro` and `HomeLanding.astro` (including `aria-label` and visible placeholder where applicable).
- [ ] `CONTRIBUTING.md` includes a **Starlight upgrade checklist** (grep internal imports, smoke tests, sidebar persistence note, optional `@astrojs/starlight` version pin).
- [ ] `NavSidebarPersister.astro` has a short **comment** pointing maintainers to verify behavior after Starlight bumps.
- [ ] `npm run build` succeeds; no new lint/type errors if the project adds them later.

## Technical approach

### 1. Section metadata module

**Option A — new file `src/config/section-metadata.ts`:** Export `SECTION_METADATA` as `Record<SectionKey, …>`.

**Option B — extend `src/config/section-sidebars.ts`:** Define `SECTION_METADATA` in the same file as `SECTION_KEYS` and `SECTION_SIDEBAR_CONFIG` (recommended if the team prefers one “sections” module over an extra file).

Each metadata entry includes:

- `label` (string) — single source for sidebar + tiles + any future consumers.
- `path` (string) — leading-slash path ending with `/`, matching current sidebar links (e.g. `/heroes/`). Define **once per key** so slugs cannot drift from `getSectionKey` / routing.
- Icon: import SVGs once (same assets as today).
- `home`: `{ width, height }` for `HomeLanding` tile images.
- `sidebar`: `{ width, height }` for `SectionSidebarBrand` `<img>` (current behavior differs from home; keep both).

**Base URL for tile links:** Either keep `withBase` in `HomeLanding.astro` (same as today) and pass `SECTION_METADATA[k].path` into it, or export a helper alongside metadata only if every consumer is Vite-bundled `src/` code (see Technical review table).

### 2. `src/config/section-sidebars.ts` (update)

- Build **`SECTION_SIDEBAR_CONFIG`** from `SECTION_KEYS` + `SECTION_METADATA` so each section’s first manual entry is `{ label, link: metadata.path }` (preserving today’s flat one-link-per-section shape). If a section later needs nested groups, extend the builder — not in this PR unless already required.
- Keep **`getSectionKey`** as-is unless consolidation is trivial.
- Verify the derived object **`satisfies`** the expected shape for `section-sidebar.ts` consumers (avoid type widening).

### 3. Components (update)

- **`SectionSidebarBrand.astro`**: Read title + sidebar dimensions + icon URL from `SECTION_METADATA[sectionKey]`; remove local `brands` record and duplicate imports.
- **`HomeLanding.astro`**: Build the tile list by iterating `SECTION_KEYS` (or `SECTION_METADATA`) in order; remove local `navItems` array and duplicate icon imports; wire `SEARCH_PLACEHOLDER` for button `aria-label` and placeholder span.

### 4. `src/config/search.ts` (new)

- Export `SEARCH_PLACEHOLDER` constant (string value matches current copy).

### 5. `Search.astro` (update)

- Import `SEARCH_PLACEHOLDER` from `search.ts` into the frontmatter and use that single variable for the button, dialog label, and `pagefindTranslations` (no separate abstraction layer).

### 6. Documentation

- **`CONTRIBUTING.md`**: New subsection **“Upgrading @astrojs/starlight”** with a short checklist: pin/version note; search for deep imports in project source, e.g. `grep -r 'node_modules/@astrojs/starlight' src` **or** `rg 'node_modules/@astrojs/starlight' src`; smoke list (search, sidebar expand, pagination, home); verify `NavSidebarPersister` / sidebar scroll + open state.

### 7. `NavSidebarPersister.astro` (update)

- Add a 2–4 line comment at the top: this mirrors Starlight’s persistence with a **section-scoped** sidebar hash; re-test after upgrades.

### 8. Optional / defer

- **Splitting `Search.astro` CSS**: only if reviewers find the PR hard to read; no requirement in this plan.
- **`astro.config.mjs` global `sidebar`**: If importing shared link/label data from TS into `.mjs` is awkward, keep the array as-is and add one checklist line: **global sidebar entry points match `SECTION_METADATA` paths and labels.** Prefer deriving in config only if a quick spike confirms Astro loads the import cleanly.

## Dependencies and risks

| Risk | Mitigation |
|------|------------|
| Astro `.mjs` config cannot import new TS module | Keep Starlight `sidebar` in `astro.config.mjs` manual; document sync in checklist. |
| Wrong `path` breaks pagination/sidebar matching | Build `SECTION_SIDEBAR_CONFIG` from metadata paths; compare before/after in diff. |
| Visual regression on tile or brand sizes | Copy numeric dimensions exactly from current components into metadata. |
| **Type widening** after deriving `SECTION_SIDEBAR_CONFIG` | Use `satisfies` or an explicit helper return type so `section-sidebar.ts` still receives a correctly typed structure. |
| **`withBase` / env** | Keep env-sensitive URL logic in `.astro` or clearly Vite-scoped modules (see Technical review). |

## Out of scope

- Changing `HeroCallout`, `NimbleHomePage`, or `Banner` behavior.
- i18n for search or section labels.
- Replacing deep `node_modules/@astrojs/starlight` imports (document only).
- Automated tests (none in repo today).

## Implementation task list

- [ ] Add `SECTION_METADATA` (new `src/config/section-metadata.ts` **or** colocate in `section-sidebars.ts` per Technical review).
- [ ] Add `src/config/search.ts` with `SEARCH_PLACEHOLDER`.
- [ ] Refactor `section-sidebars.ts` to derive `SECTION_SIDEBAR_CONFIG` from metadata; verify types for `section-sidebar.ts`.
- [ ] Refactor `SectionSidebarBrand.astro` to consume metadata.
- [ ] Refactor `HomeLanding.astro` to consume metadata + `SEARCH_PLACEHOLDER`.
- [ ] Update `Search.astro` to use `SEARCH_PLACEHOLDER`.
- [ ] Comment `NavSidebarPersister.astro`; extend `CONTRIBUTING.md` with Starlight upgrade checklist.
- [ ] (Optional) Align `astro.config.mjs` sidebar with shared config if import works.
- [ ] Manual regression pass per section above; run `npm run build`.

## Success

Maintainership improves (one registry, one search string) with **no user-visible regression** and a **documented upgrade path** for Starlight.

---

## Post-plan options

1. **Open the plan file** in the editor for review.
2. **Review and refine** the plan text (narrow scope or tasks).
3. **Start building** — implement the task list on a feature branch (e.g. `refactor/section-metadata`).

**Workspace:** Create a feature branch before implementing if not already on one.

Technical review is incorporated in **Technical review (2026-03-22)** above.
