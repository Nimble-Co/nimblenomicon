import path from 'node:path';
import { fileURLToPath } from 'node:url';

import starlight from '@astrojs/starlight';
import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

import { autoXrefIntegration } from './src/integrations/auto-xref/integration';
import { STARLIGHT_GLOBAL_SIDEBAR } from './src/config/section-sidebars';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Cloudflare Pages sets `CF_PAGES_URL` during builds. Optional `SITE_URL` for other environments (e.g. CI) that need a canonical origin. */
const site = process.env.CF_PAGES_URL || process.env.SITE_URL || undefined;

/** Served at the site root on Cloudflare Pages. Trailing slash on `base` matches Astro/Vite `import.meta.env.BASE_URL` rules. */
const base = '/';

/** Resolved base for integrations (matches `import.meta.env.BASE_URL` / trailing-slash rules). */
const baseForIntegrations = base ?? '/';

// https://astro.build/config
export default defineConfig({
	site,
	base,
	integrations: [
		autoXrefIntegration({ base: baseForIntegrations }),
		svelte(),
		starlight({
			title: 'The Nimblenomicon',
			pagefind: false,
			head: [
				{
					tag: 'link',
					attrs: {
						rel: 'stylesheet',
						href: 'https://use.typekit.net/gsn8vvv.css',
					},
				},
			],
			favicon: '/favicon.png',
			logo: {
				src: './src/assets/nimblenomicon_icon.svg',
				alt: 'The Nimble Nomicon',
			},
			components: {
				Head: './src/components/Head.astro',
				Header: './src/components/Header.astro',
				SiteTitle: './src/components/SiteTitle.astro',
				Search: './src/components/Search.astro',
				Sidebar: './src/components/Sidebar.astro',
				TwoColumnContent: './src/components/TwoColumnContent.astro',
				Footer: './src/components/Footer.astro',
				PageTitle: './src/components/PageTitle.astro',
				Banner: './src/components/Banner.astro',
				MarkdownContent: './src/components/MarkdownContent.astro',
			},
			/** Sidebar “On this page” outline: include `#`–`###` only (omit `####` and deeper). */
			tableOfContents: {
				minHeadingLevel: 1,
				maxHeadingLevel: 2,
			},
			/** Fallback / global index; derived from `SECTION_METADATA` in `src/config/section-sidebars.ts`. */
			sidebar: STARLIGHT_GLOBAL_SIDEBAR,
			customCss: ['./src/styles/global.css'],
		}),
	],
	vite: {
		plugins: [tailwindcss()],
		resolve: {
			alias: {
				'@components': path.resolve(__dirname, 'src/components'),
			},
		},
	},
});
