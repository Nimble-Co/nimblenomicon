# Plan: Refactor Orama search scripts (no Svelte)

**Type:** refactor  
**Date:** 2026-04-11

## Problem / motivation

The Orama search UI is implemented correctly but spread across a large inline `<script>` in `Search.astro`, shared logic in `orama-search-ui.ts`, and ad hoc wiring in `HomeLanding.astro`. This hurts readability and reviewability. We want **clear module boundaries** without adding Svelte or another client framework (see brainstorm doc).

## Background

- **Brainstorm:** `docs/brainstorm/2026-04-11-orama-search-ui-architecture-brainstorm-doc.md` — decision: stay with vanilla TS + Astro; refactor for clarity.
- **External research:** Skipped beyond official Astro docs themes (islands, client scripts)—low risk; no new APIs.

## Goals

- Move the `site-search` custom element implementation out of `Search.astro` into a dedicated module.
- Deduplicate **Ctrl/Cmd+K → focus search** logic used on the home page vs header where practical.
- Keep **behavior and accessibility** unchanged (no functional regressions).
- Add **small unit tests** for pure helpers (e.g. HTML escaping).

## Non-goals

- Adding `@astrojs/svelte` or other UI frameworks.
- Changing Orama schema, index build, or URL patterns.
- Redesigning UX of quick search or `/search/` page.

## Implementation tasks

1. **Extract `SiteSearch` custom element**
   - New file: `src/scripts/site-search-element.ts`
   - Contains: `SiteSearch` class, `customElements.define('site-search', SiteSearch)`
   - `Search.astro`: keep markup + one `<script>` that only imports the module (side-effect registration).

2. **Shared keyboard shortcut helper (optional but recommended)**
   - New file: `src/scripts/search-keyboard-shortcut.ts`
   - Export e.g. `bindSearchPaletteShortcut(onActivate: () => void)` using the same metaKey/ctrlKey + `k` behavior and `preventDefault`.
   - Use from `site-search-element.ts` (`focusSearch`) and `HomeLanding.astro` (focus home input) to avoid duplicated listener logic.

3. **Tests**
   - New file: `src/scripts/orama-search-ui.test.ts`
   - Export `escapeHtml` from `orama-search-ui.ts` (or move to `src/utils/html-escape.ts` if cleaner) and assert a few edge cases.

4. **Verification**
   - `npm run format:check`, `npm run lint`, `npm test`, `npm run build`.

## Risks

- **Registration order:** importing `site-search-element` must run before first `site-search` in DOM—current Starlight flow already relies on end-of-body scripts; keep import at bottom of `Search.astro` as today.

## Acceptance criteria

- [ ] No Svelte (or other new framework) dependencies.
- [ ] `Search.astro` script block is minimal (import + any unavoidable inline glue only if needed).
- [ ] Header search: mobile toggle, desktop/mobile quick panels, ⌘/Ctrl+K unchanged.
- [ ] Home hero quick search and shortcut unchanged.
- [ ] `/search/` full-page behavior unchanged.
- [ ] CI commands pass: format, lint, test, build.
