# Orama search UI: Astro patterns vs Svelte (brainstorm)

**Date:** 2026-04-11  
**Topic:** Whether the recently built Orama-backed game-data search should move to a Svelte component for clarity and maintainability.

## Context (current implementation)

- **Stack:** Astro 6 + Starlight, Tailwind v4, no UI framework in `package.json`.
- **Behavior:** `@orama/orama` loads a static JSON index; **quick search** (typeahead) runs in the header (`Search.astro` override) and on the home hero (`HomeLanding.astro`); **full results** run on `/search/` (`src/pages/search/index.astro`).
- **Implementation style:** Vanilla TypeScript modules (`src/scripts/orama-search-ui.ts`) plus a **`site-search` custom element** class inlined in `Search.astro` for mobile panel UX, ⌘/Ctrl+K, and wiring two quick-search panels.

## Astro guidance (brief)

- Astro defaults to **static HTML** and adds JS only where needed ([Islands architecture](https://docs.astro.build/en/concepts/islands/)).
- **Client frameworks** (React, Svelte, Vue, …) are optional via integrations and `client:*` directives; overusing `client:load` works against the performance story.
- **Bundled `<script>`** in `.astro` files is a supported, documented path for modest interactivity without a framework ([Client-side scripts](https://docs.astro.build/en/guides/client-side-scripts/)).

## Devil’s advocate: use Svelte

**Strong points**

- Reactive state maps well to combobox-style UIs (query, loading, highlight index, open/closed) and can reduce manual DOM sync bugs.
- Colocated markup + scoped styles can be easier to read than long `innerHTML` strings and `querySelector` chains.
- Testing with Vitest + Testing Library is a well-trodden path for Svelte components.

**Weak points / risks for _this_ repo**

- **New subsystem:** would require `@astrojs/svelte`, `svelte`, compiler config, and ESLint awareness—none of which exist today.
- **Bundle cost:** runtime + hydration for widgets that already work with plain TS + small DOM updates.
- **Starlight:** the header is already an Astro override; mixing a Svelte island into the same slot is doable but adds a second UI paradigm next to the rest of Starlight’s Astro components.

## Devil’s advocate: keep vanilla TS (refactor in place)

**Strong points**

- Aligns with **“minimal JS”** and avoids a second UI stack on a mostly static docs site.
- **Orama** is already imported from plain TS; debouncing and `escapeHtml` are framework-agnostic.
- **Custom elements** are a standard way to encapsulate behavior without Svelte; the heavy part is the `SiteSearch` class, which can live in its own module.

**Weak points**

- Without discipline, vanilla code can sprawl (`innerHTML`, global listeners). Mitigation: **split modules**, small pure helpers, and tests for string/utility behavior.

## Decision

**Do not introduce Svelte for this search experience.**

Rationale: the interaction is real but bounded (fetch index, debounce, list rendering, keyboard); the project already uses vanilla TS + one custom element successfully. Adding Svelte would increase dependency and cognitive surface for incremental gain. The **tidy** fix is to **extract** the custom element and any duplicated shortcut wiring into **focused TypeScript modules** and add **targeted unit tests** (e.g. HTML escaping), not to adopt a new framework.

## Follow-up

See implementation plan: `docs/plan/2026-04-11-refactor-orama-search-scripts-plan.md`.
