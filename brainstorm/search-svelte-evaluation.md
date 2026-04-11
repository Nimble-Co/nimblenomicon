# Search UI: Astro vs Svelte — problem space

This note explores whether the Orama-backed search experience (header quick search, home hero quick search, `/search` full-page results) should move to **Svelte islands** in Astro, stay as **vanilla TypeScript + DOM**, or use a **hybrid**.

It follows the spirit of [brainstorm.md](../brainstorm.md) (performance budgets, content-first static app, search as spine) and incorporates two **devil’s-advocate** passes: one arguing **for** Svelte, one **against** adding it for search now.

## Current architecture (snapshot)

| Surface          | Mechanism                                                                                                                                                            |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Starlight header | [Search.astro](../src/components/Search.astro): `<site-search>` custom element + `initOramaQuickSearch` for two panels (mobile + desktop)                            |
| Home             | [HomeLanding.astro](../src/components/HomeLanding.astro): separate form + `initOramaQuickSearch` + shared `wireSearchShortcut`                                       |
| Data search page | [search/index.astro](../src/pages/search/index.astro): `initOramaDataSearch` on `[data-orama-root]`                                                                  |
| Core logic       | [orama-search-ui.ts](../src/scripts/orama-search-ui.ts): singleton `getOramaDataSearchDb()`, debounced `search()`, `innerHTML` rendering, listbox-style keyboard nav |

Astro + Starlight already match the project’s **islands** story: static HTML shell, **targeted** client JS. Official Astro guidance frames interactivity as optional client bundles ([Islands architecture](https://docs.astro.build/en/concepts/islands/)).

## Roadmap pressure

- **Second Orama index** (rules / GM guide / creator kit) searched **concurrently** with the game-data index (`Promise.all`, merge/rank results).
- **Filters** (school, tier, monster level, entity type) — UI state + query `where` or post-filtering.
- **Future Svelte** for character sheet, monster builder, etc.

## Devil’s advocate: use Svelte for search

### Why Svelte helps

- **Composition**: One `<OramaQuickSearch>` with props/slots replaces parallel wiring in `Search.astro` vs `HomeLanding.astro` and shrinks duplicated shortcut logic.
- **State**: Filter chips, active index for keyboard nav, loading/error for multiple fetches map cleanly to reactive state instead of manual DOM sync.
- **Safety**: Less reliance on `innerHTML` + `escapeHtml` for every new field; text nodes by default.
- **Tests**: Mounting Svelte components in Vitest is often simpler than fully exercising imperative DOM controllers.
- **Alignment**: Reuses the same client framework you plan for builders — shared primitives (buttons, panels, focus) over time.

### Svelte tradeoffs

- **New dependency path**: `@astrojs/svelte`, Svelte version alignment, ESLint/Prettier config surface.
- **Bundle cost**: Runtime + compiled component code on every route that ships the island; must stay within [brainstorm.md](../brainstorm.md) payload budgets.
- **Starlight integration**: Header override stays an Astro component; the island is an extra client boundary to debug (hydration directive, `client:load` vs `client:visible`).

## Devil’s advocate: keep vanilla TypeScript (or web components)

### Why vanilla fits

- **Performance governance**: Search is input → debounce → Orama → list; a second framework competes with index bytes under the same cap.
- **Already bounded**: Custom element `site-search` is a clear ownership boundary; Orama singleton is shared across entry points.
- **Roadmap fit**: Dual indexes and filters are **data-layer** problems solvable with `Promise.all`, merged hits, and `where` — not inherently a UI framework problem.
- **Operational simplicity**: One less runtime in the hot path for the most-used chrome.

### Vanilla tradeoffs

- **Duplication**: Quick-search wiring still lives in two Astro surfaces (home vs header) until shared components or a single island consolidate markup.
- **Maintainability**: Large imperative modules and `innerHTML` strings grow harder to change as filters multiply.

## Synthesis / recommendation

**Short term:** **Do not introduce Svelte only for search.** The interactive surface is still “text field + dropdown + keyboard listbox” and is already implemented. Adding a framework now mainly trades **bundle and tooling cost** for ergonomics you can get from **cleaner TypeScript modules** and **one shared shortcut helper**.

**Medium term:** When you **add `@astrojs/svelte`** for builders (or another substantial client slice), **re-evaluate** migrating search to Svelte islands so the **runtime cost is amortized** and design-system components stay unified. At that point, filters and multi-index UI likely tip the balance toward declarative UI.

**Hybrid (optional later):** Keep shell/layout in Astro; use a **small Svelte island** only for the filter bar + results list if that slice becomes the complexity driver, while keeping Orama loading in shared TS modules.

**Tidiness without Svelte:** Extract shared pieces explicitly: global search shortcut, optional `site-search` implementation file, and clearer separation between DB loading, rendering, and event wiring so `/search` and header share one rendering path where possible.

## References

- [brainstorm.md — Performance & architecture](../brainstorm.md#performance--architecture-notes)
- [Astro — Islands](https://docs.astro.build/en/concepts/islands/)
- [AGENTS.md — Orama index & dev workflow](../AGENTS.md)
