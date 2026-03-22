---
date: 2025-03-22
topic: tailwind-theme-tokens
---

# Tailwind / Starlight theme tokens — fix and clarify

## What We're Building

Correct the **broken gray scale** in `@theme` (`global.css`) so Tailwind steps are **monotonic** (each step predictably lighter or darker than its neighbors), matching how Starlight maps `--color-gray-*` into semantic `--sl-color-gray-*` slots. Optionally **dedupe** duplicate accent stops (`accent-500` / `accent-600` both `#d4a90c`) and add **light documentation** so future edits do not reintroduce the same class of bug.

This is **not** a mandate to rewrite bespoke CSS as Tailwind utilities; the codebase can stay CSS-first for custom layout. The goal is a **trustworthy token layer** under Starlight’s supported Tailwind bridge.

## Why This Approach

Three scopes were considered:

**Surgical token fix** — Recommended (Yes)

Adjust only `--color-gray-700` (and any other step that breaks monotonicity) to a value that sits **between** adjacent steps in the intended direction, then spot-check UI that relies on `--sl-color-gray-*` (sidebar, search modal, pagination, home landing). Dedupe `accent-500`/`accent-600` if both must stay identical (e.g. set one to reference the other via `var()` or drop one unused step).

- Pros: Small diff, low risk of churn, directly addresses the Starlight mapping bug.
- Cons: Does not formalize “where tokens live” for contributors.
- Best when: You want correctness now without a style-architecture project.

**Token audit + comments** — Recommended as follow-up (Yes, phase 2)

After the surgical fix, add a **short comment block** above `@theme` (or a one-page internal note linked from `CONTRIBUTING.md`) stating: (1) Starlight reads `--color-gray-*` / `--color-accent-*` through `@astrojs/starlight-tailwind`; (2) scales must stay monotonic; (3) heavy brand overrides in `:root[data-theme]` are intentional and coexist with `@theme`.

- Pros: Prevents repeat mistakes; onboarding cost drops.
- Cons: Docs can drift if nobody updates them when tokens change.
- Best when: More than one person touches theme code.

**Semantic Nimble tokens everywhere** — Not recommended now (No)

Introduce a parallel system (`--nimble-muted`, `--nimble-border`, …) across all components and reserve `@theme` only for Starlight.

- Pros: Clear separation between “design system” and “framework bridge.”
- Cons: Large refactor, easy to over-engineer for a docs site; YAGNI unless you’re scaling multiple themes or products.

**Recommendation:** Do **Surgical token fix** first, then **Token audit + comments** if the team touches this area regularly.

## Key Decisions

- **Monotonic gray scale is non-negotiable** for Starlight’s mapping model; fixing `--color-gray-700` (#858585 is lighter than `--color-gray-600` #525252) is the core bug.
- **Keep Tailwind + `@astrojs/starlight-tailwind`** — no need to remove Tailwind; the issue is data in `@theme`, not the integration choice.
- **Custom CSS stays valid** — hero, home landing, and component `<style>` blocks do not need to become utility-heavy for this fix.
- **Visual regression check** after changing grays: sidebar link states, search UI (Pagefind vars use `--sl-color-gray-*`), pagination borders, footer muted text.

## Open Questions

- **Direction of the ramp:** Should mid grays trend toward **warmer** or **cooler** neutrals when picking a new `--color-gray-700`? (Fix is numeric; brand taste is a quick design check.)
- **Accent dedupe:** Prefer `accent-600: var(--color-accent-500)` or slightly different values for hover/focus semantics — only if you actually use both steps in utilities or Starlight maps them differently; otherwise dedupe is cosmetic.
- **Dark mode:** `global.css` notes dark theme is largely default until designed; confirm whether any gray fix should be validated in `data-theme="dark"` or scope verification to light only for this pass.

---

## Handoff

Brainstorm complete. Suggested next steps:

1. **Review and refine** — Adjust scope (surgical-only vs. add comments in same PR).
2. **Continue with planning** — Short implementation plan: list exact token values, files touched, and a 5-minute visual checklist (sidebar, search, home, one doc page).
3. **Done for now** — Implement later when ready.

```md
Brainstorm complete!

Document: docs/ideate/2025-03-22-tailwind-theme-tokens-brainstorm-doc.md

Key decisions:
- Fix monotonic gray scale in `@theme` (primary bug); keep Tailwind + Starlight integration.
- Prefer surgical fix + optional documentation; defer a full semantic-token layer unless needs grow.
```
