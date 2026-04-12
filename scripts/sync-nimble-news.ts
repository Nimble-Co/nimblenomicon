/**
 * Fetches https://nimblerpg.com/blogs/news.atom and writes src/data/nimble-news.json
 * for the Astro `news` content collection. Run via `npm run sync:nimble-news` (also prebuild/predev).
 */
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import Parser from 'rss-parser';
import {
	extractFirstImageSrc,
	extractHeroImageFromArticleHtml,
} from '../src/utils/nimble-news';

const ATOM_URL = 'https://nimblerpg.com/blogs/news.atom';
const OUT_FILE = new URL('../src/data/nimble-news.json', import.meta.url);
const ALLOWED_ARTICLE_HOST = 'nimblerpg.com';
const FETCH_TIMEOUT_MS = 15_000;
const MAX_ITEMS = 24;

const parser = new Parser();

function publishedToIso(item: { isoDate?: string; pubDate?: string }): string {
	if (item.isoDate) return item.isoDate;
	if (item.pubDate) {
		const d = new Date(item.pubDate);
		if (!Number.isNaN(d.getTime())) return d.toISOString();
	}
	return new Date(0).toISOString();
}

function idFromArticleUrl(url: string): string {
	try {
		const u = new URL(url);
		const segments = u.pathname.split('/').filter(Boolean);
		if (segments.length > 0) return segments.join('-');
	} catch {
		/* fall through */
	}
	return `item-${Buffer.from(url).toString('base64url').slice(0, 24)}`;
}

async function fetchHeroImageFromArticlePage(
	articleUrl: string,
): Promise<string | undefined> {
	let hostname: string;
	try {
		hostname = new URL(articleUrl).hostname;
	} catch {
		return undefined;
	}
	if (hostname !== ALLOWED_ARTICLE_HOST) return undefined;

	try {
		const res = await fetch(articleUrl, {
			headers: {
				'User-Agent':
					'Nimblenomicon/1.0 (https://github.com/nimble-rpg/nimblenomicon)',
				Accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8',
			},
			signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
		});
		if (!res.ok) return undefined;
		const html = await res.text();
		return extractHeroImageFromArticleHtml(html, articleUrl);
	} catch {
		return undefined;
	}
}

async function main() {
	try {
		const res = await fetch(ATOM_URL, {
			headers: {
				'User-Agent':
					'Nimblenomicon/1.0 (https://github.com/nimble-rpg/nimblenomicon)',
				Accept: 'application/atom+xml, application/xml, text/xml, */*',
			},
		});
		if (!res.ok) {
			console.warn(
				`[sync-nimble-news] Feed request failed: ${res.status} ${res.statusText}; writing empty list.`,
			);
			await writeFile(fileURLToPath(OUT_FILE), '[]\n', 'utf8');
			return;
		}
		const xml = await res.text();
		const feed = await parser.parseString(xml);
		type Row = {
			id: string;
			url: string;
			title: string;
			publishedIso: string;
			imageUrl?: string;
		};
		const preliminary: Array<Omit<Row, 'imageUrl'> & { atomHtml?: string }> =
			[];

		for (const raw of feed.items) {
			if (preliminary.length >= MAX_ITEMS) break;
			const link = raw.link?.trim();
			const title = raw.title?.trim();
			if (!link || !title) continue;
			const extra = raw as Record<string, string | undefined>;
			const atomContent = raw.content ?? extra['content:encoded'];
			preliminary.push({
				id: idFromArticleUrl(link),
				url: link,
				title,
				publishedIso: publishedToIso(raw),
				...(typeof atomContent === 'string' ? { atomHtml: atomContent } : {}),
			});
		}

		const rows: Row[] = await Promise.all(
			preliminary.map(async ({ atomHtml, ...rest }) => {
				const fromPage = await fetchHeroImageFromArticlePage(rest.url);
				const fromAtom = extractFirstImageSrc(atomHtml);
				const imageUrl = fromPage ?? fromAtom;
				return {
					...rest,
					...(imageUrl ? { imageUrl } : {}),
				};
			}),
		);

		await writeFile(
			fileURLToPath(OUT_FILE),
			`${JSON.stringify(rows, null, '\t')}\n`,
			'utf8',
		);
		console.log(
			`[sync-nimble-news] Wrote ${rows.length} item(s) to nimble-news.json`,
		);
	} catch (err) {
		console.warn('[sync-nimble-news] Failed:', err);
		await writeFile(fileURLToPath(OUT_FILE), '[]\n', 'utf8');
	}
}

await main();
