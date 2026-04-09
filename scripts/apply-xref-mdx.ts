/**
 * One-time (or occasional) helper: insert `<Reference />` components into MDX under `src/content/docs/`.
 *
 * Run from repo root:
 *   npm run xref:apply-mdx
 *   npm run xref:apply-mdx -- --dry-run
 *
 * Review diffs and fix wrong targets (duplicate names, context). Re-run only after
 * removing bad links or use --dry-run on a copy — paragraphs that already contain
 * `auto-xref` or `<Reference` are left unchanged to avoid double-wrapping.
 *
 * Adds `import Reference from '@components/Reference.astro';` once per file when needed.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
	buildXrefTermList,
	processBodyWithFences,
} from './xref-link-markdown.ts';

const DOCS_ROOT = fileURLToPath(
	new URL('../src/content/docs', import.meta.url),
);

const REFERENCE_IMPORT = `import Reference from '@components/Reference.astro';\n`;

function hasReferenceImport(source: string): boolean {
	return /from\s+['"]@components\/Reference\.astro['"]/.test(source);
}

/**
 * Ensures a single import when the body contains `<Reference` and the file does not
 * already import the component (safe when the script is re-run).
 */
function ensureReferenceImport(
	processedBody: string,
	frontmatter: string | null,
): string {
	const base =
		frontmatter === null ? processedBody : frontmatter + processedBody;

	if (!processedBody.includes('<Reference')) {
		return base;
	}
	if (hasReferenceImport(base)) {
		return base;
	}
	if (frontmatter !== null) {
		return frontmatter + REFERENCE_IMPORT + processedBody;
	}
	return REFERENCE_IMPORT + processedBody;
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
		const processedBody = processBodyWithFences(body, terms, 'mdx-reference');
		const next = ensureReferenceImport(processedBody, frontmatter);

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
