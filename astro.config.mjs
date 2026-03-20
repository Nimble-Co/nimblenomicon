import starlight from '@astrojs/starlight';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

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
      sidebar: [
        { label: 'Home', link: '/' },
        {
          label: 'Core Rules',
          items: [
            { label: 'Core Rules', link: '/core-rules/' },
            { label: 'Combat', link: '/core-rules/combat/' },
            { label: 'Equipment', link: '/core-rules/equipment/' },
            { label: 'Spells', link: '/core-rules/spells/' },
          ],
        },
        { label: 'Heroes', link: '/heroes/' },
        { label: "Game Master's Guide", link: '/game-masters-guide/' },
        { label: 'Adventures', link: '/adventures/' },
        { label: 'Monsters & More', link: '/monsters-and-more/' },
        { label: "Creator's Kit", link: '/creators-kit/' },
      ],
      customCss: ['./src/styles/global.css'],
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
