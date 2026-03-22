---
date: 2026-03-22
topic: components-maintainability
---

# Starlight components: maintainability and hardening

## What We're Building

Incremental improvements to the custom Starlight surface area (`src/components/` and closely related config), driven by the review themes: **duplication** (home vs section chrome), **oversized overrides** (especially search), **deep `node_modules` coupling**, and **fragile glue** (sidebar persistence, home shell fork).

The goal is not a rewrite. It is to **reduce drift and upgrade pain** while keeping current UX and behavior. Work ships in **small PRs** with clear rollback boundaries.

## Assumptions

- Section tiles on the home page follow the same **order and set** as `SECTION_KEYS` in `src/config/section-sidebars.ts`.
- **Single default locale** for UI strings until product prioritizes i18n.
- `astro.config.mjs` continues to define Starlight’s top-level `sidebar` array; that array stays aligned with section entry points (today’s pattern), not replaced by a dynamic build step unless a later plan requires it.

## Approaches Considered

### A. Config-first DRY (recommended)

**Recommended: Yes**

Add **`SECTION_METADATA`** (name TBD) keyed by `SectionKey`: display label, `withBase(path)`-style href, icon module reference, and **two optional dimension presets** (`home` vs `sidebar`) so one registry replaces the parallel maps in `HomeLanding.astro` and `SectionSidebarBrand.astro`. Nav **tree** structure stays in `SECTION_SIDEBAR_CONFIG`; metadata supplies **presentation** only. If a sidebar link label must match the tile label, **use one string** per section (avoid copying the label into two config keys).

- Pros: Fixes the highest-value duplication with minimal abstraction; one place to rename sections or swap assets; aligns with existing `SectionKey` typing.
- Cons: Requires a migration PR and a rule: new sections update the registry once.
- Best when: You expect copy tweaks or new sections and want fewer “two lists” bugs.

### B. Thin overrides + documentation

**Recommended: Yes (combine with A)**

Keep Starlight overrides structurally as they are. Add a **Starlight upgrade checklist** to `CONTRIBUTING.md` (or `docs/`): grep for `node_modules/@astrojs/starlight`, diff relevant upstream components after bump, run smoke tests on search, sidebar, pagination, home. Split **`Search.astro`** into colocated style partials **only** if file size blocks navigation—no new abstraction layer.

- Pros: Low risk; pays off on every dependency bump.
- Cons: Does not remove coupling; makes upgrades survivable.
- Best when: Starlight bumps are recurring.

### C. Deep structural refactor

**Recommended: No (for now)**

Replace multiple overrides with wrappers, extract a local package, or generalize `HeroCallout` / `NimbleHomePage` preemptively.

- Pros: Could reduce long-term surface area.
- Cons: High cost, easy to over-build; YAGNI without multiple hero layouts or a Starlight exit.
- Best when: Multi-site design system or leaving Starlight.

## Why This Approach

Prefer **A + B**: maximum risk reduction per hour. Duplicate section definitions are the clearest bug vector; centralizing metadata is the fix. **B** accepts Starlight coupling and pays down **upgrade procedure** and optional **file splits for humans**.

Defer **C** until a second consumer of generalized heroes or a strategic fork decision exists.

## Risks

| Risk | Mitigation |
|------|------------|
| Label strings diverge between nav tree and metadata | Single `label` per `SectionKey` consumed everywhere, or derive one from the other in code |
| `astro.config` import from new TS modules | Keep config static if needed; metadata consumed only from `.astro`/TS components, not from `astro.config`, unless Astro’s config load order allows a shared import (verify in implementation) |
| `NavSidebarPersister` drifts from Starlight | Code comment at wrapper + checklist step: “verify sidebar persistence after Starlight upgrade” |

## Key Decisions

- **Section metadata**: Add a dedicated export (e.g. `src/config/section-metadata.ts`) or extend `section-sidebars.ts` **without** circular imports from `astro.config`. Icons and dimensions live next to labels and hrefs.
- **Search placeholder**: Export a single constant (e.g. `SEARCH_PLACEHOLDER` in `src/config/search.ts` or next to search-related config). `Search.astro` and `HomeLanding` import it. Revisit i18n when the product requires it.
- **`HeroCallout`**: No API change until a second page needs a hero banner; then add optional props (e.g. icon), not a framework.
- **`NavSidebarPersister`**: No rewrite unless Starlight exposes a supported extension point; document sync points with upstream.
- **Deep imports**: Prefer documented `virtual:starlight` paths where they exist; internal Starlight paths get a **pinned-version note** in the upgrade checklist.

## Open Questions

- **Search file split**: Colocate CSS vs one file with clear section comments—decide during the PR that touches `Search.astro`, based on reviewer preference.
- **Home `Banner`**: Whether the index route should omit `Banner` when no doc banner applies is a **product** call; implementation is trivial once decided.

## Next Steps

1. **Planning** — Ordered tasks: add metadata module + migrate `HomeLanding` / `SectionSidebarBrand`; add `SEARCH_PLACEHOLDER`; add upgrade checklist; optional `Search` split.
2. **Refine again** — If metadata shape or `astro.config` coupling needs another pass.
3. **Park** — Use this doc when bumping Starlight or adding a section.
