# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

The Nimblenomicon is a static documentation site for the Nimble tabletop RPG, built with **Astro v6 + Starlight** and styled with **Tailwind CSS v4**. Game data lives as JSON in `src/data/` and is validated by Zod schemas in `src/models/`. Content pages are `.mdx` files under `src/content/docs/`.

### Running the app

Standard commands from the repo root (see `CONTRIBUTING.md` § Local Development):

| Command           | Purpose                              |
|-------------------|--------------------------------------|
| `npm run dev`     | Dev server at `localhost:4321`       |
| `npm run build`   | Production build to `dist/`          |
| `npm run preview` | Serve production build locally       |

### Caveats

- **No lint or test scripts** exist in `package.json` yet. Do not attempt to run `npm test` or `npm run lint` — they will fail.
- **Search (Pagefind)** only works in production builds. In the dev server, the search bar is present but nonfunctional. To test search: `npm run build && npm run preview`, then use the preview server.
- The `site` option in `astro.config.ts` is **not set** (it is computed from GitHub environment variables during CI). This causes a harmless `@astrojs/sitemap` warning during local builds. Ignore it.
- **No environment variables or secrets** are required for local development.
- There are no databases, Docker containers, or backend services to run. The entire product is a single static site.
