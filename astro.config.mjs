import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import tailwindcss from '@tailwindcss/vite';

const owner = process.env.GITHUB_REPOSITORY_OWNER;
const repo = process.env.GITHUB_REPOSITORY?.split('/')[1];
const isUserSite = Boolean(owner && repo && repo === `${owner}.github.io`);

/** GitHub Pages (CI): correct absolute URLs and asset paths. Local dev: defaults. */
const site = owner && repo ? `https://${owner}.github.io` : undefined;
const base = owner && repo ? (isUserSite ? '/' : `/${repo}`) : undefined;

// https://astro.build/config
export default defineConfig({
	site,
	base,
	integrations: [
		starlight({
			title: 'The Nimble Nomicon',
			logo: {
				src: './src/assets/nimblenomicon_icon.svg',
				alt: 'The Nimble Nomicon',
			},
			components: {
				SiteTitle: './src/components/SiteTitle.astro',
				Search: './src/components/Search.astro',
			},
			sidebar: [],
			customCss: ['./src/styles/global.css'],
		}),
	],
	vite: {
		plugins: [tailwindcss()],
	},
});
