import Parser from 'rss-parser';

const ATOM_URL = 'https://nimblerpg.com/blogs/news.atom';
const ALLOWED_ARTICLE_HOST = 'nimblerpg.com';

const IMG_SRC_RE = /<img[^>]+src=["']([^"']+)["']/i;

/** `property` or `name` first, then `content` (Shopify / common CMS orderings) */
const META_PROP_CONTENT_RE =
	/<meta\s+[^>]*(?:property|name)=["']([^"']+)["'][^>]*content=["']([^"']+)["'][^>]*>/gi;
const META_CONTENT_PROP_RE =
	/<meta\s+[^>]*content=["']([^"']+)["'][^>]*(?:property|name)=["']([^"']+)["'][^>]*>/gi;

const FETCH_TIMEOUT_MS = 15_000;

export type NimbleNewsItem = {
	url: string;
	title: string;
	publishedIso: string;
	/** Hero: Open Graph / Twitter image from the article page, else first `<img>` in Atom content */
	imageUrl?: string;
};

function decodeHtmlAttr(src: string): string {
	return src
		.replace(/&amp;/g, '&')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>');
}

export function extractFirstImageSrc(
	html: string | undefined,
): string | undefined {
	if (!html) return undefined;
	const m = html.match(IMG_SRC_RE);
	if (!m?.[1]) return undefined;
	return decodeHtmlAttr(m[1].trim());
}

function resolveAgainstBase(baseUrl: string, src: string): string {
	try {
		return new URL(src.trim(), baseUrl).href;
	} catch {
		return src;
	}
}

/** Prefer HTTPS `og:image:secure_url` (Shopify) when present. */
const META_IMAGE_PRIORITY = [
	'og:image:secure_url',
	'og:image',
	'twitter:image',
	'twitter:image:src',
] as const;

function collectOpenGraphImageMeta(html: string): Map<string, string> {
	const out = new Map<string, string>();
	const add = (keyRaw: string, valRaw: string | undefined) => {
		const key = keyRaw.toLowerCase();
		const val = valRaw?.trim();
		if (!val || out.has(key)) return;
		const decoded = decodeHtmlAttr(val);
		if (decoded) out.set(key, decoded);
	};

	META_PROP_CONTENT_RE.lastIndex = 0;
	let m: RegExpExecArray | null;
	while ((m = META_PROP_CONTENT_RE.exec(html)) !== null) {
		add(m[1], m[2]);
	}

	META_CONTENT_PROP_RE.lastIndex = 0;
	while ((m = META_CONTENT_PROP_RE.exec(html)) !== null) {
		add(m[2], m[1]);
	}

	return out;
}

/**
 * Reads Open Graph / Twitter hero images from a full HTML document (Shopify blog `og:image`, etc.).
 */
export function extractHeroImageFromArticleHtml(
	html: string,
	baseUrl: string,
): string | undefined {
	const meta = collectOpenGraphImageMeta(html);
	for (const key of META_IMAGE_PRIORITY) {
		const val = meta.get(key);
		if (val) return resolveAgainstBase(baseUrl, val);
	}
	return undefined;
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
		if (!res.ok) {
			if (import.meta.env.DEV) {
				console.warn(
					`[nimble-news] Article fetch failed: ${articleUrl} (${res.status})`,
				);
			}
			return undefined;
		}
		const html = await res.text();
		return extractHeroImageFromArticleHtml(html, articleUrl);
	} catch (err) {
		if (import.meta.env.DEV) {
			console.warn(`[nimble-news] Article fetch error: ${articleUrl}`, err);
		}
		return undefined;
	}
}

function publishedToIso(item: { isoDate?: string; pubDate?: string }): string {
	if (item.isoDate) return item.isoDate;
	if (item.pubDate) {
		const d = new Date(item.pubDate);
		if (!Number.isNaN(d.getTime())) return d.toISOString();
	}
	return new Date(0).toISOString();
}

const parser = new Parser();

type PreliminaryEntry = Omit<NimbleNewsItem, 'imageUrl'> & {
	atomHtml?: string;
};

export async function getLatestNimbleNews(
	limit: number,
): Promise<NimbleNewsItem[]> {
	try {
		const res = await fetch(ATOM_URL, {
			headers: {
				'User-Agent':
					'Nimblenomicon/1.0 (https://github.com/nimble-rpg/nimblenomicon)',
				Accept: 'application/atom+xml, application/xml, text/xml, */*',
			},
		});
		if (!res.ok) {
			if (import.meta.env.DEV) {
				console.warn(
					`[nimble-news] Feed request failed: ${res.status} ${res.statusText}`,
				);
			}
			return [];
		}
		const xml = await res.text();
		const feed = await parser.parseString(xml);
		const preliminary: PreliminaryEntry[] = [];
		for (const raw of feed.items) {
			if (preliminary.length >= limit) break;
			const link = raw.link?.trim();
			const title = raw.title?.trim();
			if (!link || !title) continue;
			const extra = raw as Record<string, string | undefined>;
			const atomContent = raw.content ?? extra['content:encoded'];
			preliminary.push({
				url: link,
				title,
				publishedIso: publishedToIso(raw),
				...(typeof atomContent === 'string' ? { atomHtml: atomContent } : {}),
			});
		}

		const items: NimbleNewsItem[] = await Promise.all(
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

		return items;
	} catch (err) {
		if (import.meta.env.DEV) {
			console.warn('[nimble-news] Failed to load or parse feed:', err);
		}
		return [];
	}
}

export function formatNewsDate(iso: string): string {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return '';
	return new Intl.DateTimeFormat('en-US', {
		month: 'long',
		day: 'numeric',
		year: 'numeric',
		timeZone: 'America/New_York',
	})
		.format(d)
		.toUpperCase();
}
