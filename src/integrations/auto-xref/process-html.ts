import { load, type CheerioAPI } from 'cheerio';
import type { AnyNode, Element, Text } from 'domhandler';

import type { XrefTermEntry } from '../../models/xref-terms';

const SKIP_DESCEND_TAGS = new Set([
	'a',
	'code',
	'pre',
	'script',
	'style',
	'kbd',
	'samp',
	'table',
]);

function isWordChar(ch: string): boolean {
	return /[A-Za-z0-9_]/.test(ch);
}

function wordBoundaryBefore(text: string, start: number): boolean {
	if (start === 0) return true;
	return !isWordChar(text[start - 1]!);
}

function wordBoundaryAfter(text: string, end: number): boolean {
	if (end >= text.length) return true;
	return !isWordChar(text[end]!);
}

function escapeAttr(s: string): string {
	return s
		.replace(/&/g, '&amp;')
		.replace(/"/g, '&quot;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}

function shouldSkipElement(node: AnyNode): boolean {
	if (node.type !== 'tag') return false;
	const el = node as Element;
	const tag = el.name;
	if (SKIP_DESCEND_TAGS.has(tag)) return true;
	if (el.attribs?.['data-no-xref'] !== undefined) return true;
	return false;
}

function collectTextNodes(el: Element): Text[] {
	const out: Text[] = [];
	function walk(node: AnyNode): void {
		if (node.type === 'text') {
			out.push(node as Text);
			return;
		}
		if (node.type !== 'tag') return;
		if (shouldSkipElement(node)) return;
		for (const c of (node as Element).children) {
			walk(c);
		}
	}
	for (const c of el.children) {
		walk(c);
	}
	return out;
}

function findMatchAt(
	text: string,
	pos: number,
	terms: XrefTermEntry[],
): { entry: XrefTermEntry; len: number } | null {
	for (const entry of terms) {
		const t = entry.term;
		if (t.length === 0) continue;
		if (!text.startsWith(t, pos)) continue;
		if (!wordBoundaryBefore(text, pos)) continue;
		if (!wordBoundaryAfter(text, pos + t.length)) continue;
		return { entry, len: t.length };
	}
	return null;
}

function buildReplacementHtml(
	text: string,
	terms: XrefTermEntry[],
	selfPath: string,
	linkPrefix: string,
): string | null {
	if (text.length === 0) return null;

	const segments: string[] = [];
	let i = 0;

	while (i < text.length) {
		const m = findMatchAt(text, i, terms);
		if (!m) {
			segments.push(text[i]!);
			i += 1;
			continue;
		}

		const { entry, len } = m;

		let target = entry.href;
		if (!target.startsWith('/')) target = `/${target}`;
		if (!target.endsWith('/')) target = `${target}/`;
		const hrefOut = `${linkPrefix}${target}`;

		if (hrefOut === selfPath || target === selfPath) {
			segments.push(text.slice(i, i + len));
			i += len;
			continue;
		}

		const inner = escapeAttr(entry.term);
		const def = escapeAttr(entry.definition);
		const kind = escapeAttr(entry.kind);
		const href = escapeAttr(hrefOut);

		segments.push(
			`<a href="${href}" class="auto-xref" data-term="${inner}" data-kind="${kind}" data-definition="${def}">${text.slice(i, i + len)}</a>`,
		);
		i += len;
	}

	const html = segments.join('');
	return html === text ? null : html;
}

function processBlock(
	$: CheerioAPI,
	el: Element,
	terms: XrefTermEntry[],
	selfPath: string,
	linkPrefix: string,
): void {
	const $el = $(el);
	if ($el.closest('table').length > 0) return;

	const nodes = collectTextNodes(el);
	for (let k = nodes.length - 1; k >= 0; k--) {
		const textNode = nodes[k]!;
		const raw = textNode.data ?? '';
		const html = buildReplacementHtml(raw, terms, selfPath, linkPrefix);
		if (html === null) continue;
		$(textNode).replaceWith(html);
	}
}

const BLOCK_SELECTORS = 'p, li, dd, blockquote';

export function applyAutoXrefToDocument(
	html: string,
	terms: XrefTermEntry[],
	selfPath: string,
	linkPrefix: string,
): string {
	const $ = load(html, { decodeEntities: false });

	const roots = $('[data-auto-link]');
	if (roots.length === 0) {
		return html;
	}

	roots.each((_, el) => {
		const elem = el as Element;
		$(elem)
			.find(BLOCK_SELECTORS)
			.addBack(BLOCK_SELECTORS)
			.each((__, block) => {
				processBlock($, block as Element, terms, selfPath, linkPrefix);
			});
	});

	return $.html();
}
