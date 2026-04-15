import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { create, insertMultiple, save } from '@orama/orama';
import type { AstroIntegration } from 'astro';

import {
	bookIdFromDistRelativePath,
	extractBookSearchTextFromHtml,
	extractBookSearchTitleFromHtml,
	pathnameToHref,
	truncateBookContent,
	type BookSearchDoc,
} from '../../models/book-search';
import { distFileToSelfPathname } from '../auto-xref/pathname';

export type OramaBooksIndexIntegrationOptions = {
	/** Astro `base` (e.g. `/` or `/repo/`); used for emitted `href` values. */
	base: string;
};

function normalizeAssetBase(base: string): string {
	const b = base.trim() || '/';
	return b.endsWith('/') ? b : `${b}/`;
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

export function oramaBooksIndexIntegration(
	options: OramaBooksIndexIntegrationOptions,
): AstroIntegration {
	const assetBase = normalizeAssetBase(options.base);
	const basePrefix = assetBase.replace(/\/$/, '');

	return {
		name: 'nimble-orama-books-index',
		hooks: {
			'astro:build:done': async ({ dir, logger }) => {
				const distDir = fileURLToPath(dir);
				const integrationDir = path.dirname(fileURLToPath(import.meta.url));
				const outFile = path.join(
					integrationDir,
					'..',
					'..',
					'..',
					'public',
					'orama-books-search.json',
				);

				const files = await walkHtmlFiles(distDir);
				const docs: BookSearchDoc[] = [];

				for (const filePath of files) {
					const rel = path.relative(distDir, filePath);
					const posixRel = rel.split(path.sep).join('/');
					const book = bookIdFromDistRelativePath(posixRel);
					if (book == null) continue;

					const raw = await fs.readFile(filePath, 'utf8');
					const text = extractBookSearchTextFromHtml(raw);
					if (!text) continue;

					const title = extractBookSearchTitleFromHtml(raw);
					const selfPath = distFileToSelfPathname(posixRel, basePrefix);
					const href = pathnameToHref(selfPath, basePrefix);
					const excerpt =
						text.length > 140 ? `${text.slice(0, 140).trim()}…` : text.trim();

					docs.push({
						id: `${book}:${selfPath}`,
						type: 'books',
						book,
						title,
						subtitle: excerpt,
						content: truncateBookContent(text),
						href,
					});
				}

				docs.sort((a, b) => a.id.localeCompare(b.id));

				const db = create({
					schema: {
						id: 'string',
						type: 'string',
						book: 'string',
						title: 'string',
						subtitle: 'string',
						content: 'string',
						href: 'string',
					},
				});
				if (docs.length > 0) {
					insertMultiple(db, docs, 200);
				}
				const rawIndex = save(db);
				await fs.mkdir(path.dirname(outFile), { recursive: true });
				await fs.writeFile(outFile, JSON.stringify(rawIndex), 'utf8');
				logger.info(
					`Orama books index: wrote ${docs.length} documents to public/orama-books-search.json.`,
				);
			},
		},
	};
}
