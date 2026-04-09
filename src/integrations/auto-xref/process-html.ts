import { load, type CheerioAPI } from 'cheerio';
import type { AnyNode, Element, Text } from 'domhandler';

import type { TermEntry } from './term-index';

const MAX_LINKS_PER_BLOCK = 3;

const SKIP_DESCEND_TAGS = new Set([
	'a',
	'code',
	'pre',
	'script',
	'style',
	'kbd',
	'samp',
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

function collectTextNodes(el: Element): Text[] {
	const out: Text[] = [];
	function walk(node: AnyNode): void {
		if (node.type === 'text') {
			out.push(node as Text);
			return;
		}
		if (node.type !== 'tag') return;
		const tag = (node as Element).name;
		if (SKIP_DESCEND_TAGS.has(tag)) return;
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
	terms: TermEntry[],
): { entry: TermEntry; len: number } | null {
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
	terms: TermEntry[],
	usedTerms: Set<string>,
	linksInBlock: { n: number },
	selfPath: string,
	linkPrefix: string,
): string | null {
	if (text.length === 0) return null;

	const segments: string[] = [];
	let i = 0;

	while (i < text.length) {
		if (linksInBlock.n >= MAX_LINKS_PER_BLOCK) {
			segments.push(text.slice(i));
			break;
		}

		const m = findMatchAt(text, i, terms);
		if (!m) {
			segments.push(text[i]!);
			i += 1;
			continue;
		}

		const { entry, len } = m;
		if (usedTerms.has(entry.term)) {
			segments.push(text.slice(i, i + len));
			i += len;
			continue;
		}

		let target = entry.href;
		if (!target.startsWith('/')) target = `/${target}`;
		if (!target.endsWith('/')) target = `${target}/`;
		const hrefOut = `${linkPrefix}${target}`;

		if (hrefOut === selfPath || target === selfPath) {
			segments.push(text.slice(i, i + len));
			i += len;
			continue;
		}

		usedTerms.add(entry.term);
		linksInBlock.n += 1;

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
	terms: TermEntry[],
	selfPath: string,
	linkPrefix: string,
): void {
	const usedTerms = new Set<string>();
	const linksInBlock = { n: 0 };
	const nodes = collectTextNodes(el);
	/** Replace from end so Cheerio/DOM references stay valid */
	for (let k = nodes.length - 1; k >= 0; k--) {
		const textNode = nodes[k]!;
		const raw = textNode.data ?? '';
		const html = buildReplacementHtml(
			raw,
			terms,
			usedTerms,
			linksInBlock,
			selfPath,
			linkPrefix,
		);
		if (html === null) continue;
		$(textNode).replaceWith(html);
	}
}

const BLOCK_SELECTORS = 'p, li, dd, blockquote';

export function applyAutoXrefToDocument(
	html: string,
	terms: TermEntry[],
	selfPath: string,
	assetBase: string,
	linkPrefix: string,
): string {
	const base = assetBase.endsWith('/') ? assetBase : `${assetBase}/`;
	const $ = load(html, { decodeEntities: false }, false);

	const roots = $('[data-auto-link]');
	if (roots.length > 0) {
		roots.each((_, el) => {
			const elem = el as Element;
			$(elem)
				.find(BLOCK_SELECTORS)
				.addBack(BLOCK_SELECTORS)
				.each((__, block) => {
					processBlock($, block as Element, terms, selfPath, linkPrefix);
				});
		});
	} else {
		const main = $('main [data-pagefind-body], main').first();
		if (main.length) {
			main.find(BLOCK_SELECTORS).each((__, block) => {
				processBlock($, block as Element, terms, selfPath, linkPrefix);
			});
		}
	}

	if ($('#auto-xref-tooltip').length > 0) {
		return $.root().html() ?? html;
	}

	const tooltipAndScript =
		'<div id="auto-xref-tooltip" class="auto-xref-tooltip" role="tooltip" hidden></div>' +
		'<script type="module" src="' +
		base +
		'scripts/auto-xref-tooltip.js"></script>';

	const body = $('body');
	if (body.length) {
		body.append(tooltipAndScript);
	} else {
		const main = $('main').last();
		if (main.length) {
			main.append(tooltipAndScript);
		} else {
			$.root().append(tooltipAndScript);
		}
	}

	return $.root().html() ?? html;
}
