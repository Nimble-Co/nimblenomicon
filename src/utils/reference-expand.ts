import {
	resolveReferenceEntry,
	type XrefTermEntry,
} from '../models/xref-terms';

function escapeAttr(s: string): string {
	return s
		.replace(/&/g, '&amp;')
		.replace(/"/g, '&quot;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}

function escapeHtmlText(s: string): string {
	return escapeAttr(s);
}

function referenceTagToHtml(attrs: string): string {
	const termMatch = /term="([^"]*)"/.exec(attrs);
	if (!termMatch) {
		return '';
	}
	const term = termMatch[1]!;
	const kindMatch = /kind="([^"]*)"/.exec(attrs);
	const kind = kindMatch?.[1];
	const entry = resolveReferenceEntry(term, kind);
	if (!entry) {
		return escapeHtmlText(term);
	}
	return toAutoXrefAnchorHtml(entry, term);
}

/** Same markup as `Reference.astro` (resolved) and the HTML branch of `xref-link-markdown.ts`. */
function toAutoXrefAnchorHtml(
	entry: XrefTermEntry,
	displayTerm: string,
): string {
	const inner = escapeAttr(entry.term);
	const def = escapeAttr(entry.definition);
	const k = escapeAttr(entry.kind);
	const href = escapeAttr(entry.href);
	const text = escapeHtmlText(displayTerm);
	return `<a href="${href}" class="auto-xref" data-term="${inner}" data-kind="${k}" data-definition="${def}">${text}</a>`;
}

function expandReferenceTagsInFragment(fragment: string): string {
	return fragment.replace(
		/<Reference\s+([^>]*?)\s*\/>/g,
		(_full, attrs: string) => {
			const html = referenceTagToHtml(attrs);
			return html === '' ? _full : html;
		},
	);
}

/**
 * JSON / `renderMarkdown()` strings may contain `<Reference term="…" />` (from `xref:apply-json`).
 * Those are not MDX, so expand to `.auto-xref` HTML before the markdown processor runs.
 * Skips expansion inside ``` fenced blocks.
 */
export function expandReferenceTagsToHtmlInMarkdown(md: string): string {
	let result = '';
	let i = 0;
	while (i < md.length) {
		const fence = md.indexOf('```', i);
		if (fence === -1) {
			result += expandReferenceTagsInFragment(md.slice(i));
			break;
		}
		result += expandReferenceTagsInFragment(md.slice(i, fence));
		const close = md.indexOf('```', fence + 3);
		if (close === -1) {
			result += md.slice(fence);
			break;
		}
		result += md.slice(fence, close + 3);
		i = close + 3;
	}
	return result;
}
