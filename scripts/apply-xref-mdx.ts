/**
 * One-time (or occasional) helper: insert `.auto-xref` links into MDX under `src/content/docs/`.
 *
 * Run from repo root:
 *   npm run xref:apply-mdx
 *   npm run xref:apply-mdx -- --dry-run
 *
 * Review diffs and fix wrong targets (duplicate names, context). Re-run only after
 * removing bad links or use --dry-run on a copy — paragraphs that already contain
 * `auto-xref` are left unchanged to avoid double-wrapping.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
	buildXrefTermList,
	type XrefTermEntry,
} from '../src/models/xref-terms.ts';

const DOCS_ROOT = fileURLToPath(
	new URL('../src/content/docs', import.meta.url),
);

const MAX_LINKS_PER_PARAGRAPH = 3;

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

function linkParagraph(
	para: string,
	terms: XrefTermEntry[],
): { out: string; changed: boolean } {
	const trimmed = para.trimStart();
	if (/^import\s/u.test(trimmed) || para.includes('auto-xref')) {
		return { out: para, changed: false };
	}

	const usedTerms = new Set<string>();
	let linksInPara = 0;
	let i = 0;
	const segments: string[] = [];

	while (i < para.length) {
		if (linksInPara >= MAX_LINKS_PER_PARAGRAPH) {
			segments.push(para.slice(i));
			break;
		}

		const ch = para[i]!;
		if (ch === '[') {
			const after = skipMarkdownLink(para, i);
			if (after > i) {
				segments.push(para.slice(i, after));
				i = after;
				continue;
			}
		}
		if (ch === '<') {
			const after = skipAngleTag(para, i);
			if (after > i) {
				segments.push(para.slice(i, after));
				i = after;
				continue;
			}
		}

		const m = findMatchAt(para, i, terms);
		if (!m) {
			segments.push(ch);
			i += 1;
			continue;
		}

		const { entry, len } = m;
		if (usedTerms.has(entry.term)) {
			segments.push(para.slice(i, i + len));
			i += len;
			continue;
		}

		usedTerms.add(entry.term);
		linksInPara += 1;

		const inner = escapeAttr(entry.term);
		const def = escapeAttr(entry.definition);
		const kind = escapeAttr(entry.kind);
		const href = escapeAttr(entry.href);

		segments.push(
			`<a href="${href}" class="auto-xref" data-term="${inner}" data-kind="${kind}" data-definition="${def}">${para.slice(i, i + len)}</a>`,
		);
		i += len;
	}

	const out = segments.join('');
	return { out, changed: out !== para };
}

/** Process text outside ``` fenced code blocks only. */
function processBodyWithFences(body: string, terms: XrefTermEntry[]): string {
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

function splitFrontmatter(raw: string): {
	frontmatter: string | null;
	body: string;
} {
	if (!raw.startsWith('---\n')) {
		return { frontmatter: null, body: raw };
	}
	const end = raw.indexOf('\n---\n', 4);
	if (end === -1) {
		return { frontmatter: null, body: raw };
	}
	return {
		frontmatter: raw.slice(0, end + 5),
		body: raw.slice(end + 5),
	};
}

async function walkMdx(dir: string): Promise<string[]> {
	const out: string[] = [];
	const entries = await fs.readdir(dir, { withFileTypes: true });
	for (const ent of entries) {
		const full = path.join(dir, ent.name);
		if (ent.isDirectory()) {
			out.push(...(await walkMdx(full)));
		} else if (ent.isFile() && ent.name.endsWith('.mdx')) {
			out.push(full);
		}
	}
	return out;
}

async function main() {
	const dryRun = process.argv.includes('--dry-run');
	const terms = buildXrefTermList();
	const files = await walkMdx(DOCS_ROOT);
	let touched = 0;

	for (const file of files) {
		const raw = await fs.readFile(file, 'utf8');
		const { frontmatter, body } = splitFrontmatter(raw);
		const processedBody = processBodyWithFences(body, terms);
		const next =
			frontmatter === null ? processedBody : frontmatter + processedBody;

		if (next !== raw) {
			touched += 1;
			if (!dryRun) {
				await fs.writeFile(file, next, 'utf8');
			}
			console.log(
				`${dryRun ? '[dry-run] would write ' : 'updated '}${path.relative(process.cwd(), file)}`,
			);
		}
	}

	console.log(
		`\nDone: ${touched} file(s) ${dryRun ? 'would change' : 'changed'}, ${files.length} MDX scanned.`,
	);
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
