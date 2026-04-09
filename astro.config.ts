import path from 'node:path';
import { fileURLToPath } from 'node:url';

import starlight from '@astrojs/starlight';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

import { STARLIGHT_GLOBAL_SIDEBAR } from './src/config/section-sidebars';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const owner = process.env.GITHUB_REPOSITORY_OWNER;
const repo = process.env.GITHUB_REPOSITORY?.split('/')[1];
const isUserSite = Boolean(owner && repo && repo === `${owner}.github.io`);

/** GitHub Pages (CI): correct absolute URLs and asset paths. Local dev: defaults. */
/** Trailing slash on `base` is required so `import.meta.env.BASE_URL` matches Astro/Vite rules; otherwise Starlight can emit broken hrefs like `/repo/core-rules/` on project pages. */
const site = owner && repo ? `https://${owner}.github.io` : undefined;
const base = owner && repo ? (isUserSite ? '/' : `/${repo}/`) : undefined;

// https://astro.build/config
export default defineConfig({
	site,
	base,
	integrations: [
		starlight({
			title: 'The Nimblenomicon',
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
				SiteTitle: './src/components/SiteTitle.astro',
				Search: './src/components/Search.astro',
				Sidebar: './src/components/Sidebar.astro',
				TwoColumnContent: './src/components/TwoColumnContent.astro',
				Footer: './src/components/Footer.astro',
				PageTitle: './src/components/PageTitle.astro',
				Banner: './src/components/Banner.astro',
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
