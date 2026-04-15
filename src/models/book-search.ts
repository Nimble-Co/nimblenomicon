/**
 * Book full-text search: indexed section keys, document shape, and HTML extraction helpers.
 */
import * as cheerio from 'cheerio';

import { SECTION_METADATA, type SectionKey } from '../config/section-sidebars';

/** First path segment for pages included in the books Orama index. */
export const BOOK_SEARCH_IDS = [
	'core-rules',
	'game-masters-guide',
	'creators-kit',
] as const satisfies readonly SectionKey[];

export type BookSearchId = (typeof BOOK_SEARCH_IDS)[number];

const BOOK_SEARCH_ID_SET = new Set<string>(BOOK_SEARCH_IDS);

export function isBookSearchId(s: string): s is BookSearchId {
	return BOOK_SEARCH_ID_SET.has(s);
}

/**
 * Map `dist`-relative POSIX path (e.g. `core-rules/foo/index.html`) to book id, or null if not indexed.
 */
export function bookIdFromDistRelativePath(
	relativePosix: string,
): BookSearchId | null {
	const norm = relativePosix.replace(/\\/g, '/');
	const first = norm.split('/')[0]?.trim();
	if (!first || !isBookSearchId(first)) return null;
	return first;
}

export function bookLabel(book: BookSearchId): string {
	return SECTION_METADATA[book].label;
}

export type BookSearchDoc = {
	id: string;
	type: 'books';
	book: BookSearchId;
	title: string;
	subtitle: string;
	content: string;
	href: string;
};

const TITLE_SITE_SPLIT = /\s*\|\s*/;

export function stripPageTitleSuffix(rawTitle: string): string {
	const t = rawTitle.trim();
	if (!t) return t;
	const parts = t.split(TITLE_SITE_SPLIT);
	return (parts[0] ?? t).trim();
}

const MAX_BOOK_CONTENT_LEN = 48_000;

export function truncateBookContent(text: string): string {
	if (text.length <= MAX_BOOK_CONTENT_LEN) return text;
	return `${text.slice(0, MAX_BOOK_CONTENT_LEN)}…`;
}

/**
 * Plain text from Starlight doc main markup (post-build HTML). Prefer markdown body; fall back to main.
 */
export function extractBookSearchTextFromHtml(html: string): string {
	const $ = cheerio.load(html);
	$('script, style, noscript').remove();
	const main = $('main').first();
	const markdown =
		main.find('.sl-markdown-content').first().length > 0
			? main.find('.sl-markdown-content').first()
			: main.find('[data-auto-link]').first();
	const root =
		markdown.length > 0 ? markdown : main.length > 0 ? main : $.root();
	const raw = root.text();
	return raw.replace(/\s+/g, ' ').trim();
}

export function extractBookSearchTitleFromHtml(html: string): string {
	const $ = cheerio.load(html);
	const fromTag = $('title').first().text();
	if (fromTag.trim()) return stripPageTitleSuffix(fromTag);
	$('script, style, noscript').remove();
	const main = $('main').first();
	const h1 = main.find('h1').first().text().trim();
	return h1 || 'Untitled';
}

export function pathnameToHref(pathname: string, basePrefix: string): string {
	if (pathname === '/') {
		return basePrefix === '' ? '/' : `${basePrefix}/`;
	}
	return `${basePrefix}${pathname}`;
}
