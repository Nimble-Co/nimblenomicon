/**
 * Starlight’s default integration injects a `[...slug]` catch-all that lives outside `src/pages/`.
 * This fork is identical except it does **not** register that route, so the app is a normal
 * `src/pages/` Astro project while still using Starlight’s MD pipeline, virtual modules, and UI.
 */
import mdx from '@astrojs/mdx';
import type { AstroIntegration } from 'astro';
import { AstroError } from 'astro/errors';
import {
	starlightRehypePlugins,
	starlightRemarkPlugins,
	type RemarkRehypePluginOptions,
} from '../node_modules/@astrojs/starlight/integrations/remark-rehype';
import { starlightDirectivesRestorationIntegration } from '../node_modules/@astrojs/starlight/integrations/asides';
import { starlightExpressiveCode } from '../node_modules/@astrojs/starlight/integrations/expressive-code/index';
import { starlightPagefind } from '../node_modules/@astrojs/starlight/integrations/pagefind';
import { starlightSitemap } from '../node_modules/@astrojs/starlight/integrations/sitemap';
import { vitePluginStarlightCssLayerOrder } from '../node_modules/@astrojs/starlight/integrations/vite-layer-order';
import { vitePluginStarlightUserConfig } from '../node_modules/@astrojs/starlight/integrations/virtual-user-config';
import {
	injectPluginTranslationsTypes,
	runPlugins,
	type PluginTranslations,
	type StarlightUserConfigWithPlugins,
} from '../node_modules/@astrojs/starlight/utils/plugins';
import { processI18nConfig } from '../node_modules/@astrojs/starlight/utils/i18n';
import type { StarlightConfig } from '../node_modules/@astrojs/starlight/types';

const INTEGRATION_NAME = 'nimble-starlight-shell';

export default function starlightAsLibrary(
	userOpts: StarlightUserConfigWithPlugins
): AstroIntegration {
	if (typeof userOpts !== 'object' || userOpts === null || Array.isArray(userOpts))
		throw new AstroError(
			'Invalid config passed to starlight integration',
			`The Starlight integration expects a configuration object with at least a \`title\` property.\n\n` +
				`See more details in the [Starlight configuration reference](https://starlight.astro.build/reference/configuration/)\n`
		);
	const { plugins, ...opts } = userOpts;
	let userConfig: StarlightConfig;
	let pluginTranslations: PluginTranslations = {};
	return {
		name: INTEGRATION_NAME,
		hooks: {
			'astro:config:setup': async ({
				addMiddleware,
				command,
				config,
				injectRoute,
				isRestart,
				logger,
				updateConfig,
			}) => {
				const pluginResult = await runPlugins(opts, plugins, {
					command,
					config,
					isRestart,
					logger,
				});
				const { astroI18nConfig, starlightConfig } = processI18nConfig(
					pluginResult.starlightConfig,
					config.i18n
				);

				const { integrations, useTranslations, absolutePathToLang } = pluginResult;
				pluginTranslations = pluginResult.pluginTranslations;
				userConfig = starlightConfig;

				addMiddleware({ entrypoint: '@astrojs/starlight/locals', order: 'pre' });

				if (!starlightConfig.disable404Route) {
					injectRoute({
						pattern: '404',
						entrypoint: starlightConfig.prerender
							? '@astrojs/starlight/routes/static/404.astro'
							: '@astrojs/starlight/routes/ssr/404.astro',
						prerender: starlightConfig.prerender,
					});
				}
				// Intentionally omit Starlight’s `[...slug]` injectRoute — use `src/pages/[...slug].astro` instead.

				const allIntegrations = [...config.integrations, ...integrations];
				if (!allIntegrations.find(({ name }) => name === 'astro-expressive-code')) {
					integrations.push(
						...starlightExpressiveCode({ astroConfig: config, starlightConfig, useTranslations })
					);
				}
				if (!allIntegrations.find(({ name }) => name === '@astrojs/sitemap')) {
					integrations.push(starlightSitemap(starlightConfig));
				}
				if (!allIntegrations.find(({ name }) => name === '@astrojs/mdx')) {
					integrations.push(mdx({ optimize: true }));
				}

				integrations.push(starlightDirectivesRestorationIntegration());

				const selfIndex = config.integrations.findIndex((i) => i.name === INTEGRATION_NAME);
				config.integrations.splice(selfIndex + 1, 0, ...integrations);

				const remarkRehypeOptions: RemarkRehypePluginOptions = {
					starlightConfig,
					astroConfig: config,
					useTranslations,
					absolutePathToLang,
				};

				const isCloudflareEnv =
					config.adapter?.name === '@astrojs/cloudflare' ||
					config.integrations.some(({ name }) => name === '@astrojs/cloudflare');
				const isNodeCompatibleEnv = !isCloudflareEnv;

				updateConfig({
					vite: {
						plugins: [
							vitePluginStarlightCssLayerOrder(),
							vitePluginStarlightUserConfig(
								{ command, isNodeCompatibleEnv },
								starlightConfig,
								config,
								pluginTranslations
							),
						],
						ssr: isNodeCompatibleEnv
							? {}
							: {
									optimizeDeps: {
										include: [
											'@astrojs/cloudflare/entrypoints/server',
											'@astrojs/starlight>i18next',
											'@astrojs/starlight>js-yaml',
											'@astrojs/starlight>klona/lite',
											'@astrojs/starlight>astro-expressive-code/components',
											'@astrojs/starlight>astro-expressive-code>hast-util-select',
											'@astrojs/starlight>astro-expressive-code>rehype',
											'@astrojs/starlight>astro-expressive-code>unist-util-visit',
											'@astrojs/starlight>astro-expressive-code>rehype-format',
											'@astrojs/starlight>astro-expressive-code>hastscript',
											'@astrojs/starlight>astro-expressive-code>hast-util-from-html',
											'@astrojs/starlight>astro-expressive-code>hast-util-to-string',
											'@astrojs/starlight>astro-expressive-code>@expressive-code/core>postcss',
										],
									},
								},
					},
					markdown: {
						remarkPlugins: [...starlightRemarkPlugins(remarkRehypeOptions)],
						rehypePlugins: [...starlightRehypePlugins(remarkRehypeOptions)],
					},
					scopedStyleStrategy: 'where',
					prefetch: config.prefetch ?? { prefetchAll: true },
					i18n: astroI18nConfig,
				});
			},

			'astro:config:done': ({ injectTypes }) => {
				injectPluginTranslationsTypes(pluginTranslations, injectTypes);
			},

			'astro:build:done': async (options) => {
				if (!userConfig.pagefind) return;
				return starlightPagefind(options);
			},
		},
	};
}
