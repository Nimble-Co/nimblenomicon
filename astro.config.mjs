import starlight from '@astrojs/starlight';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

const owner = process.env.GITHUB_REPOSITORY_OWNER;
const repo = process.env.GITHUB_REPOSITORY?.split('/')[1];
const isUserSite = Boolean(owner && repo && repo === `${owner}.github.io`);

/** GitHub Pages (CI): correct absolute URLs and asset paths. Local dev: defaults. */
/** Trailing slash on `base` is required so `import.meta.env.BASE_URL` matches Astro/Vite rules; otherwise Starlight can emit broken hrefs like `/repocore-rules/` on project pages. */
const site = owner && repo ? `https://${owner}.github.io` : undefined;
const base = owner && repo ? (isUserSite ? '/' : `/${repo}/`) : undefined;

// https://astro.build/config
export default defineConfig({
  site,
  base,
  integrations: [
    starlight({
      title: 'The Nimble Nomicon',
      favicon: '/favicon.png',
      logo: {
        src: './src/assets/nimblenomicon_icon.svg',
        alt: 'The Nimble Nomicon',
      },
      components: {
        SiteTitle: './src/components/SiteTitle.astro',
        Search: './src/components/Search.astro',
        Sidebar: './src/components/Sidebar.astro',
        TwoColumnContent: './src/components/TwoColumnContent.astro',
        Footer: './src/components/Footer.astro',
        PageTitle: './src/components/PageTitle.astro',
        Banner: './src/components/Banner.astro',
      },
      /** Fallback / global index; each section’s nav is `src/config/section-sidebars.ts` + `resolveSectionSidebar`. */
      sidebar: [
        { label: 'Core Rules', link: '/core-rules/' },
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
