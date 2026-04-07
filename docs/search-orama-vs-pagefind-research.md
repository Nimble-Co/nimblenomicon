# Search: Orama vs Pagefind — research notes

**Context:** [GitHub issue #22](https://github.com/Nimble-Co/nimblenomicon/issues/22) asks whether [Orama](https://github.com/oramasearch/orama) is a good replacement for [Pagefind](https://pagefind.app/) on the Nimblenomicon. This document summarizes how search works in the repo today, compares the two engines against Nimble’s likely needs, and maps findings to planned features (typo tolerance, synonyms, and a LinkedIn-style unified search / entities experience). **No implementation recommendations are implied beyond research.**

---

## 1. How search works in this codebase today

### Starlight + Pagefind (default integration)

- The site uses **Astro 6 + Starlight** (`astro.config.ts`). Starlight’s search is provided by **Pagefind**, indexed from the **production HTML output** after `astro build`.
- The project **overrides** the Starlight `Search` component with a custom [`src/components/Search.astro`](src/components/Search.astro):
  - Wraps Starlight’s modal UX (`<site-search>`, Ctrl/Cmd+K).
  - On `DOMContentLoaded` (and only when **not** in dev), dynamically imports `@pagefind/default-ui` and instantiates `PagefindUI` with `virtual:starlight/pagefind-config`, `bundlePath` under `BASE_URL/pagefind/`, `showImages: false`, `showSubResults: true`, and a `processResult` hook to normalize URLs when trailing slashes are stripped.
  - Copies Starlight i18n strings whose keys start with `pagefind.` into the UI’s `translations` object.
- **Dev vs prod:** In `import.meta.env.DEV`, the modal shows Starlight’s dev warning instead of instantiating Pagefind (consistent with [`AGENTS.md`](../AGENTS.md): search only works after `npm run build && npm run preview`).
- **What gets indexed:** [`src/components/NimbleHomePage.astro`](src/components/NimbleHomePage.astro) sets `data-pagefind-body` on `<main>` when Pagefind is enabled for the route, so Pagefind’s crawl is anchored on rendered page bodies. **Banner** and **full-bleed hero** regions use `data-pagefind-ignore` so noisy or duplicate content can be excluded.
- **Filters:** Pagefind supports `data-pagefind-filter` on HTML to tag pages with facet-like filters (see [Pagefind: Setting up filters](https://pagefind.app/docs/filtering/)). **This repo does not currently use `data-pagefind-filter` anywhere** (only `data-pagefind-body`, `data-pagefind-ignore`). So today, search is effectively **full-corpus keyword search over HTML**, not entity-type–aware filtering.

### Structured game data vs search

- Game content lives in **`src/data/*.json`** and is validated by **Zod** in **`src/models/*.ts`**. Examples: `spells.json` (with `tier`, `schoolId`, `utility`, markdown in `description`), `classes.json` (large nested `levels` / abilities), `monsters.json` (`level`, `kind`, `family`, etc.).
- **Pagefind does not read JSON directly.** Anything in JSON is searchable only if it appears in **rendered HTML** (e.g. spell detail pages, core rules rendering). Indexes are **derived from the built site**, not from the canonical JSON files as a first-class source.
- There is already a **static JSON API** for raw collections: [`src/pages/api/collections.ts`](src/pages/api/collections.ts) and [`src/pages/api/[collection].ts`](src/pages/api/[collection].ts) expose every `src/data/*.json` file at build time via `getCollectionData` in [`src/utils/static-api-collections.ts`](src/utils/static-api-collections.ts). That is useful for **client-side apps** that want the full structured arrays, but it is **orthogonal** to Pagefind’s HTML index.

### Entity surfaces today (indexes and detail routes)

- **Per-entity index pages** under `src/pages/` (e.g. [`src/pages/spells/index.astro`](src/pages/spells/index.astro)) use `StarlightPage` + `ReferenceIndexTable` and sort/filter display columns from parsed models — they are **browsing UIs**, not a single cross-type search.
- **Detail routes** exist for many entity types (`/spells/[id]/`, `/classes/[id]/`, `/monsters/[id]/`, etc.), giving stable URLs that any search solution can target.

---

## 2. Pagefind — relevant capabilities and limits

**Strengths (for this project’s architecture)**

- **Static, no external service:** Index is built in CI/deploy; queries run in the browser against chunked static assets. Fits “everything contained statically at build time.”
- **Low operational cost:** No API keys, no search backend.
- **Proven Starlight path:** Deep integration via `@astrojs/starlight` and the default UI; the project already customizes styling and behavior around `PagefindUI`.
- **Filtering (page-level):** Filters are attached to **pages** via `data-pagefind-filter`. The default UI can expose filter sidebars with counts ([filtering docs](https://pagefind.app/docs/filtering/)). This supports coarse facets like “section” or “content type” **if** those attributes are emitted consistently in HTML.
- **Ranking tuning:** Pagefind exposes configuration for term weighting / similarity-style ranking in advanced setups (see Pagefind API / ranking docs). This is **not** the same as typo tolerance.

**Weaknesses relative to Nimble’s stated future goals**

- **Typo / fuzzy search:** There is **no built-in typo tolerance** today. [Pagefind issue #756](https://github.com/Pagefind/pagefind/issues/756) discusses fuzzy search; maintainers note difficulty given bandwidth-conscious index design. For “a few characters off,” Pagefind is **not** a strong match without upstream changes or a parallel solution.
- **Structured JSON as primary index:** Pagefind is **HTML-first**. To search JSON fields with precision (e.g. spell tier as a number, monster level), you either duplicate that structure into visible HTML/metadata or accept lossy full-text over prose. You cannot query arbitrary numeric ranges on JSON fields unless they are modeled as filter tags or similar on pages.
- **Synonyms / conceptual aliases:** No first-class synonym dictionary. Workarounds: hidden text on pages, duplicate filter tags, or custom preprocessing — all **content or template** work, not engine features.
- **Semantic / “meaning” search:** Core Pagefind is **lexical** (BM25-style relevance). True semantic similarity (e.g. “bard” → Songweaver when “bard” never appears in copy) is **out of scope** unless you add something else (e.g. embeddings + vector retrieval, or curated alias fields).
- **Unified “LinkedIn-style” search UI:** The stock modal is optimized for **find a page**. Building a **dedicated results page** with dynamic facet panels per entity type is possible with the **Pagefind JS API**, but you are still constrained by **page-level** filters and lexical search. Pagefind 1.5+ introduces a newer “Component UI” ([noted in filtering docs](https://pagefind.app/docs/filtering/)); Starlight may lag that — worth checking when evaluating long-term maintenance.

---

## 3. Orama — relevant capabilities and limits

**What Orama is (high level)**

- Open-source search engine ([`oramasearch/orama`](https://github.com/oramasearch/orama), Apache 2.0) that runs **in the browser, on a server, or on the edge**.
- From the project README: full-text search, **filters**, **facets**, field boosting, **BM25**, **typo tolerance**, exact match, stemming/tokenization for many languages, **vector** and **hybrid** search, plugins (including **data persistence** / serialization, **embeddings**, Astro plugin), and optional cloud-oriented features.

**Strengths for Nimble’s direction**

- **Typo tolerance:** Documented as a first-class search option (Levenshtein-style; configurable tolerance per query). Directly addresses requirement (1).
- **Structured documents:** You define a **schema** (strings, numbers, enums, arrays, etc.) and insert **documents** that mirror game entities. Numeric facets (spell tier, monster level, booleans like utility spells) map naturally to **filters** and **facets** in Orama’s query API.
- **Build-time static index:** Orama supports **serializing** a database (e.g. `save` / `load` patterns) so the built site can ship a **precomputed index** as JSON or binary; the client loads it and runs queries locally. That preserves the “static hosting, no runtime server” model (size and parse cost become the main tradeoffs).
- **Semantic / hybrid search (optional):** Vector fields and hybrid modes exist if you generate embeddings at build time and ship them. That can help with loose conceptual matches **without** Algolia — at the cost of index size, build complexity, and possibly WASM/model weight if embeddings are computed client-side. Synonym-like behavior can be approached via vectors **or** via explicit alias fields (often simpler for tabletop terminology).
- **Custom UI:** Orama is a **library**, not a fixed modal. A **full results page** with type tabs, per-type facet sidebars, and URL-driven state (LinkedIn-like) is a **product/UI** project on top of stable query APIs — no fighting a built-in modal’s assumptions.

**Caveats**

- **Starlight integration:** Replacing Pagefind means **owning** indexing (what to insert, when, schema versioning), **asset pipeline** (where the serialized index lives, chunking for large datasets), **dev experience** (today Pagefind is disabled in dev), and **accessibility** of the search UI. Orama provides an [official Astro plugin](https://docs.orama.com/docs/orama-js/plugins/plugin-astro) (docs are sparse in automated fetches; expect to read upstream examples).
- **Synonyms:** Orama highlights stemming/tokenization; **explicit synonym dictionaries** are not called out as a core feature in the README the way typo tolerance is. Practical approaches for requirement (2) are likely:
  - **Curated `aliases` / `searchText` string fields** populated at build time from game data or a small synonym map (e.g. map “bard” → Songweaver).
  - **Vector search** if you invest in embeddings.
- **Dual index problem:** If you still want **prose docs** (MDX) and **entities** (JSON) in one experience, you either (a) index both into one Orama database with a `kind` field and shared text fields, or (b) run **two** indices (HTML extraction vs JSON) and merge results — both are more engineering than “Starlight default.”
- **Vendor / ecosystem:** Orama Search Inc. offers **Orama Cloud** and commercial tooling; the **open-source** engine can still be used fully static. Keep licensing and optional cloud pitches in mind when reading docs.

---

## 4. Mapping to your three future features

### (1) Typo tolerance

| Engine       | Fit                                                                                                      |
| ------------ | -------------------------------------------------------------------------------------------------------- |
| **Pagefind** | Poor today; fuzzy search is a known gap ([issue #756](https://github.com/Pagefind/pagefind/issues/756)). |
| **Orama**    | Strong; typo tolerance is advertised and documented.                                                     |

### (2) Synonyms (e.g. “bard” → Songweaver)

**Data note:** In the current `classes.json`, the Songweaver class copy does not appear to use the word “bard” (quick grep on `bard` in that file returned no matches). So **lexical search alone** will not connect those concepts unless you add **aliases**, **hidden search terms**, **embedding space**, or **manual synonym data**.

| Approach                           | Pagefind                                                                           | Orama                                                                             |
| ---------------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Curated alias / `searchBlob` field | Possible via hidden HTML or filter metadata; fragile to maintain across templates. | Natural: add `aliases: string[]` or a single concatenated search field in schema. |
| Embeddings / semantic              | Not built-in; would be a **separate** pipeline + client ranker.                    | Supported as optional vector/hybrid mode with build-time embedding generation.    |

### (3) Search results page + “entities” explorer (LinkedIn-style)

**Desired UX pattern:** One entry point; filter by **entity type** (spells, classes, monsters, …); **context-dependent facets** (spell tier, class complexity, monster level, etc.); likely URL-synced filters and responsive layout.

| Engine       | Fit                                                                                                                                                                                                                                   |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pagefind** | Filters are **page-level** tags; sub-page granularity is awkward. Facet UX is tied to how you tag HTML. Building a rich explorer is possible via the JS API but fights the **HTML-as-source-of-truth** model for JSON-heavy entities. |
| **Orama**    | **Strong fit:** one document per entity (or per chunk), `kind: 'spell' \| 'class' \| ...`, numeric/boolean fields for facets, `search` + `where` for filters. UI is fully custom.                                                     |

**Existing assets that help either approach:** Parsed models in `src/models/`, static JSON API, and stable `/spells/`, `/classes/`, … routes.

---

## 5. Semantic search (issue #22 bullet)

- **Pagefind:** Lexical-first; semantic search would be **additive** (community articles describe pairing static sites with separate embedding indexes and client-side similarity — extra build steps and assets, not Pagefind core).
- **Orama:** **Native optional path** via vector and hybrid modes, with heavier build/runtime tradeoffs. Still **static** if embeddings are precomputed and shipped.

---

## 6. Summary tradeoff table

| Dimension                      | Pagefind (current)           | Orama (hypothetical)                                    |
| ------------------------------ | ---------------------------- | ------------------------------------------------------- |
| Static / no external SaaS      | Excellent                    | Excellent (self-hosted index files)                     |
| Starlight “batteries included” | Excellent                    | None; custom integration                                |
| Typo tolerance                 | Weak / absent                | Strong                                                  |
| Synonyms / conceptual aliases  | Manual HTML/content tricks   | Schema fields and/or vectors                            |
| JSON / structured facets       | Indirect (via HTML)          | Direct (schema + filters/facets)                        |
| Unified explorer UI            | Awkward; API exists          | Natural fit                                             |
| Maintenance                    | Low (follow Starlight)       | Higher (you own pipeline + UI)                          |
| Index size / perf              | Tuned for large static sites | Depends on serialization + doc count; may need chunking |

---

## 7. Suggested next steps (research / spike only)

1. **Measure corpus size:** Approximate count of “searchable units” (pages + entity rows + MDX sections) and rough JSON size to estimate serialized Orama index weight.
2. **Prototype query shapes:** List required facets per `kind` (spells: tier, school, utility; monsters: level, family; classes: complexity or tags if modeled) against Orama filter syntax.
3. **Synonym strategy decision:** Prefer **explicit alias data** in CMS/JSON vs **embedding** pipeline — aliases are smaller and explainable; embeddings are broader but heavier.
4. **Pagefind roadmap:** Re-check Pagefind releases for fuzzy search or richer APIs if staying on Starlight defaults matters more than structured explorer UX.
5. **Hybrid:** Keep Pagefind for **docs prose** and add a small Orama (or other) index **only for entities** — two search entry points unless merged in UI (merging adds complexity but can be a migration path).

---

## References

- [Nimblenomicon issue #22 — Investigate Orama as a Pagefind replacement](https://github.com/Nimble-Co/nimblenomicon/issues/22)
- [Orama GitHub / README](https://github.com/oramasearch/orama)
- [Orama docs — search](https://docs.orama.com/docs/orama-js/search)
- [Pagefind — filtering](https://pagefind.app/docs/filtering/)
- [Pagefind — fuzzy / typo tolerance discussion](https://github.com/Pagefind/pagefind/issues/756)
