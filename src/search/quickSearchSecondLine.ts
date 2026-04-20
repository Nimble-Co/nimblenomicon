/**
 * Second-line preview for Orama quick search: only short-reference entries
 * (glossary, languages, conditions). Other types use title + kind only.
 */
import { marked } from 'marked';
import { parseSearchResultCard } from '../models/search-result-card';
import type { SearchableGameDataDoc } from '../models/search-filters';

function htmlToPlainText(html: string): string {
	return html
		.replace(/<[^>]*>/g, ' ')
		.replace(/&nbsp;/g, ' ')
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/\s+/g, ' ')
		.trim();
}

function markdownToPlainPreview(markdown: string, maxLen: number): string {
	const raw = markdown.trim();
	if (!raw) return '';
	const html = marked.parse(raw, { async: false }) as string;
	let text = htmlToPlainText(html);
	if (text.length > maxLen) {
		text = `${text.slice(0, Math.max(0, maxLen - 1))}…`;
	}
	return text;
}

export function quickSearchSecondLine(
	doc: Pick<SearchableGameDataDoc, 'cardJson'>,
): string {
	const payload = parseSearchResultCard(doc.cardJson);
	if (!payload) return '';

	switch (payload.kind) {
		case 'glossary':
		case 'language':
		case 'condition':
			return markdownToPlainPreview(payload.excerptMd, 320);
		default:
			return '';
	}
}
