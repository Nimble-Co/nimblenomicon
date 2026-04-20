import { defineCollection } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { z } from 'astro/zod';
import { nimbleJsonGameDataLoader } from './content/loaders/nimble-json-game-data';
import { nimbleNewsAtomLoader } from './content/loaders/nimble-news-atom';

const nimbleNewsEntrySchema = z.object({
	id: z.string(),
	url: z.string().url(),
	title: z.string(),
	publishedIso: z.string(),
	imageUrl: z.string().url().optional(),
});

export const collections = {
	docs: defineCollection({
		loader: docsLoader(),
		schema: docsSchema({
			extend: ({ image }) =>
				z.object({
					/** Hide the default `<h1>` when the page uses a custom title (e.g. on a hero image). */
					hidePageTitle: z.boolean().optional(),
					/** Render `banner` inside the hero (see `HeroCallout`) instead of the default top bar. */
					bannerInHero: z.boolean().optional(),
					/**
					 * Optional 1200×630 (or similar) image for Open Graph / Twitter link previews.
					 * Overrides the site default in `astro.config.ts` when set in frontmatter `head`
					 * (see AGENTS.md).
					 */
					shareImage: image().optional(),
				}),
		}),
	}),
	news: defineCollection({
		loader: nimbleNewsAtomLoader(),
		schema: nimbleNewsEntrySchema,
	}),
	/** One entry per JSON file under `src/data/` (validated at runtime via Zod in `src/models/`). */
	nimbleGameData: defineCollection({
		loader: nimbleJsonGameDataLoader(),
		schema: z.unknown(),
	}),
};
