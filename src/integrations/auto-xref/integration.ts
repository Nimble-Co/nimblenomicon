import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { AstroIntegration } from 'astro';

import { applyAutoXrefToDocument } from './process-html';
import { buildMatchableTerms } from './term-index';

export type AutoXrefIntegrationOptions = {
	/** Astro `base` (e.g. `/` or `/repo/`); used for script `src` and path normalization. */
	base: string;
};

function normalizeAssetBase(base: string): string {
	const b = base.trim() || '/';
	return b.endsWith('/') ? b : `${b}/`;
}

function htmlRelativeToPathname(relativePosix: string): string {
	let p = relativePosix.replace(/\\/g, '/');
	if (p.endsWith('/index.html')) {
		p = p.slice(0, -'/index.html'.length);
	} else if (p.endsWith('index.html') && !p.includes('/')) {
		p = '';
	} else if (p.endsWith('.html')) {
		p = p.slice(0, -'.html'.length);
	}
	if (p === '' || p === '/') return '/';
	const withSlash = p.startsWith('/') ? p : `/${p}`;
	return withSlash.endsWith('/') ? withSlash : `${withSlash}/`;
}

/** Pathname including `import.meta.env.BASE_URL` prefix (matches `href` on entity links). */
function distFileToSelfPathname(
	relativePosix: string,
	basePrefix: string,
): string {
	const rel = htmlRelativeToPathname(relativePosix);
	if (rel === '/') {
		return basePrefix === '' ? '/' : `${basePrefix}/`;
	}
	return `${basePrefix}${rel}`;
}

async function walkHtmlFiles(dir: string): Promise<string[]> {
	const out: string[] = [];
	const entries = await fs.readdir(dir, { withFileTypes: true });
	for (const ent of entries) {
		const full = path.join(dir, ent.name);
		if (ent.isDirectory()) {
			out.push(...(await walkHtmlFiles(full)));
		} else if (ent.isFile() && ent.name.endsWith('.html')) {
			out.push(full);
		}
	}
	return out;
}

export function autoXrefIntegration(
	options: AutoXrefIntegrationOptions,
): AstroIntegration {
	const assetBase = normalizeAssetBase(options.base);
	const basePrefix = assetBase.replace(/\/$/, '');

	return {
		name: 'nimble-auto-xref',
		hooks: {
			'astro:build:done': async ({ dir, logger }) => {
				const distDir = fileURLToPath(dir);
				const terms = buildMatchableTerms();
				const files = await walkHtmlFiles(distDir);
				let updated = 0;
				for (const filePath of files) {
					const rel = path.relative(distDir, filePath);
					const posixRel = rel.split(path.sep).join('/');
					const selfPath = distFileToSelfPathname(posixRel, basePrefix);
					const raw = await fs.readFile(filePath, 'utf8');
					const next = applyAutoXrefToDocument(
						raw,
						terms,
						selfPath,
						assetBase,
						basePrefix,
					);
					if (next !== raw) {
						await fs.writeFile(filePath, next, 'utf8');
						updated += 1;
					}
				}
				logger.info(
					`Auto-xref: processed ${files.length} HTML files, updated ${updated}.`,
				);
			},
		},
	};
}
