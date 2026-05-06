/**
 * Build a serialized Orama index from validated game data and write `public/orama-data-search.json`.
 * Run via `npm run build:orama-index` (also `prebuild` / `predev`).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { create, insertMultiple, save } from '@orama/orama';

import { buildSearchableGameDataDocs } from '../src/models/build-searchable-game-data-docs';
import { ORAMA_DATA_SEARCH_SCHEMA } from '../src/models/orama-game-data-index';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '../public/orama-data-search.json');

function main(): void {
	const docs = buildSearchableGameDataDocs();
	const db = create({
		schema: ORAMA_DATA_SEARCH_SCHEMA,
	});
	insertMultiple(db, docs, 500);
	const raw = save(db);
	mkdirSync(dirname(OUT), { recursive: true });
	writeFileSync(OUT, JSON.stringify(raw), 'utf8');
	console.log(
		`Wrote ${docs.length} documents to ${OUT} (${(JSON.stringify(raw).length / 1024).toFixed(1)} KiB JSON)`,
	);
}

main();
