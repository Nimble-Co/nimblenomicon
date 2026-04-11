# Plan: Tidy search client code (no Svelte in this slice)

## Goal

Improve structure and reduce duplication for Orama search **without** adding `@astrojs/svelte`, per [brainstorm/search-svelte-evaluation.md](../brainstorm/search-svelte-evaluation.md). Behavior and UX should remain the same (including a11y patterns already implemented).

## Non-goals

- Changing Orama schema, index build, or search limits.
- Adding the second index or filters (future work; this refactor should make those easier).
- Migrating to Svelte (deferred until builders or clear complexity threshold).

## Steps

1. **Shared keyboard shortcut**
   Add a small module (e.g. `src/scripts/wire-search-shortcut.ts`) that registers Ctrl/Cmd+K to focus a given `HTMLInputElement`. Use it from `HomeLanding.astro` and from the site-search custom element implementation so shortcut logic is not duplicated.
2. **Move `SiteSearch` custom element out of Search.astro**
   Relocate the `site-search` class + `customElements.define` to `src/scripts/site-search-element.ts` (imports `initOramaQuickSearch`). Keep the Astro file to markup + minimal script that imports the module for side effects. Preserves existing mobile animation and panel behavior.
3. **Keep Orama UI in `orama-search-ui.ts`**
   Optional light cleanup only if it stays obviously safe: ensure exports remain stable for `initOramaQuickSearch` and `initOramaDataSearch`. Avoid large behavioral edits in one pass.
4. **Verify**
   Run `npm run format:check`, `npm run lint`, `npm test`, and `npm run build` from repo root.

## Risk notes

- Custom element registration must run once per page load; importing the module from `Search.astro` `<script>` is sufficient.
- Home page must still run after DOM ready; preserve existing `DOMContentLoaded` gating if required.

## Rollback

Revert the branch; no data or content changes.
