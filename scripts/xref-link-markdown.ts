/**
 * Shared logic for inserting `.auto-xref` links into markdown fragments.
 * Used by apply-xref-mdx.ts and apply-xref-json.ts.
 */

import {
	buildXrefTermList,
	type XrefTermEntry,
} from '../src/models/xref-terms.ts';

export { buildXrefTermList, type XrefTermEntry };

export const MAX_LINKS_PER_PARAGRAPH = 3;

function escapeAttr(s: string): string {
	return s
		.replace(/&/g, '&amp;')
		.replace(/"/g, '&quot;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}

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

/** Skip markdown `[label](url)` when scanning. */
function skipMarkdownLink(text: string, start: number): number {
	if (text[start] !== '[') return start;
	let i = start + 1;
	let depth = 1;
	while (i < text.length && depth > 0) {
		if (text[i] === '[') depth += 1;
		if (text[i] === ']') depth -= 1;
		i += 1;
	}
	if (i >= text.length || text[i] !== '(') return start;
	i += 1;
	while (i < text.length && text[i] !== ')') i += 1;
	return i < text.length ? i + 1 : start;
}

/** Skip `<...>` through first `>` (best-effort for MDX/HTML). */
function skipAngleTag(text: string, start: number): number {
	if (text[start] !== '<') return start;
	const gt = text.indexOf('>', start);
	return gt === -1 ? start : gt + 1;
}

/** ATX markdown heading: `#` … `######` then whitespace (CommonMark). */
function isMarkdownAtxHeadingLine(line: string): boolean {
	return /^#{1,6}\s/.test(line.trimStart());
}

function linkLine(
	line: string,
	terms: XrefTermEntry[],
	usedTerms: Set<string>,
	linksInPara: { n: number },
): { out: string; changed: boolean } {
	let i = 0;
	const segments: string[] = [];

	while (i < line.length) {
		if (linksInPara.n >= MAX_LINKS_PER_PARAGRAPH) {
			segments.push(line.slice(i));
			break;
		}

		const ch = line[i]!;
		if (ch === '[') {
			const after = skipMarkdownLink(line, i);
			if (after > i) {
				segments.push(line.slice(i, after));
				i = after;
				continue;
			}
		}
		if (ch === '<') {
			const after = skipAngleTag(line, i);
			if (after > i) {
				segments.push(line.slice(i, after));
				i = after;
				continue;
			}
		}

		const m = findMatchAt(line, i, terms);
		if (!m) {
			segments.push(ch);
			i += 1;
			continue;
		}

		const { entry, len } = m;
		if (usedTerms.has(entry.term)) {
			segments.push(line.slice(i, i + len));
			i += len;
			continue;
		}

		usedTerms.add(entry.term);
		linksInPara.n += 1;

		const inner = escapeAttr(entry.term);
		const def = escapeAttr(entry.definition);
		const kind = escapeAttr(entry.kind);
		const href = escapeAttr(entry.href);

		segments.push(
			`<a href="${href}" class="auto-xref" data-term="${inner}" data-kind="${kind}" data-definition="${def}">${line.slice(i, i + len)}</a>`,
		);
		i += len;
	}

	const out = segments.join('');
	return { out, changed: out !== line };
}

function linkParagraph(
	para: string,
	terms: XrefTermEntry[],
): { out: string; changed: boolean } {
	const trimmed = para.trimStart();
	if (/^import\s/u.test(trimmed) || para.includes('auto-xref')) {
		return { out: para, changed: false };
	}

	const lines = para.split(/\n/);
	const usedTerms = new Set<string>();
	const linksInPara = { n: 0 };
	let anyChanged = false;

	const outLines = lines.map((line) => {
		if (isMarkdownAtxHeadingLine(line)) {
			return line;
		}
		const { out, changed } = linkLine(line, terms, usedTerms, linksInPara);
		if (changed) anyChanged = true;
		return out;
	});

	const out = outLines.join('\n');
	return { out, changed: anyChanged };
}

/** Process text outside ``` fenced code blocks only. */
export function processBodyWithFences(
	body: string,
	terms: XrefTermEntry[],
): string {
	let result = '';
	let i = 0;
	while (i < body.length) {
		const fence = body.indexOf('```', i);
		if (fence === -1) {
			result += processBodyPlain(body.slice(i), terms);
			break;
		}
		result += processBodyPlain(body.slice(i, fence), terms);
		const close = body.indexOf('```', fence + 3);
		if (close === -1) {
			result += body.slice(fence);
			break;
		}
		result += body.slice(fence, close + 3);
		i = close + 3;
	}
	return result;
}

function processBodyPlain(body: string, terms: XrefTermEntry[]): string {
	const paras = body.split(/\n\n/);
	const out = paras.map((p) => {
		const { out: next } = linkParagraph(p, terms);
		return next;
	});
	return out.join('\n\n');
}
