/**
 * One-time (or occasional) helper: insert `.auto-xref` links into markdown strings in
 * all `src/data` JSON files — every string value keyed exactly `description`.
 *
 * Run from repo root:
 *   npm run xref:apply-json
 *   npm run xref:apply-json -- --dry-run
 *
 * After running, `npm run build` and spot-check detail pages. Fix wrong links in JSON
 * manually (duplicate entity names, etc.). Paragraphs that already contain `auto-xref`
 * are skipped.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
	buildXrefTermList,
	processBodyWithFences,
	type XrefTermEntry,
} from './xref-link-markdown.ts';

const DATA_ROOT = fileURLToPath(new URL('../src/data', import.meta.url));

function processDescriptions(
	value: unknown,
	terms: XrefTermEntry[],
): { next: unknown; changed: boolean } {
	let changed = false;

	if (typeof value === 'string') {
		return { next: value, changed: false };
	}

	if (Array.isArray(value)) {
		const next: unknown[] = [];
		for (const item of value) {
			const r = processDescriptions(item, terms);
			if (r.changed) changed = true;
			next.push(r.next);
		}
		return { next, changed };
	}

	if (value !== null && typeof value === 'object') {
		const o = value as Record<string, unknown>;
		const next: Record<string, unknown> = {};
		for (const [k, v] of Object.entries(o)) {
			if (k === 'description' && typeof v === 'string') {
				if (v.includes('auto-xref')) {
					next[k] = v;
					continue;
				}
				const processed = processBodyWithFences(v, terms);
				if (processed !== v) {
					changed = true;
				}
				next[k] = processed;
				continue;
			}
			const r = processDescriptions(v, terms);
			if (r.changed) changed = true;
			next[k] = r.next;
		}
		return { next, changed };
	}

	return { next: value, changed: false };
}

async function walkJson(dir: string): Promise<string[]> {
	const out: string[] = [];
	const entries = await fs.readdir(dir, { withFileTypes: true });
	for (const ent of entries) {
		const full = path.join(dir, ent.name);
		if (ent.isDirectory()) {
			out.push(...(await walkJson(full)));
		} else if (ent.isFile() && ent.name.endsWith('.json')) {
			out.push(full);
		}
	}
	return out;
}

async function main() {
	const dryRun = process.argv.includes('--dry-run');
	const terms = buildXrefTermList();
	const files = await walkJson(DATA_ROOT);
	let touched = 0;

	for (const file of files) {
		const raw = await fs.readFile(file, 'utf8');
		let data: unknown;
		try {
			data = JSON.parse(raw);
		} catch {
			console.warn(
				`skip (invalid JSON): ${path.relative(process.cwd(), file)}`,
			);
			continue;
		}

		const { next, changed } = processDescriptions(data, terms);
		if (!changed) continue;

		touched += 1;
		const out = `${JSON.stringify(next, null, '\t')}\n`;
		if (!dryRun) {
			await fs.writeFile(file, out, 'utf8');
		}
		console.log(
			`${dryRun ? '[dry-run] would write ' : 'updated '}${path.relative(process.cwd(), file)}`,
		);
	}

	console.log(
		`\nDone: ${touched} file(s) ${dryRun ? 'would change' : 'changed'}, ${files.length} JSON scanned.`,
	);
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
