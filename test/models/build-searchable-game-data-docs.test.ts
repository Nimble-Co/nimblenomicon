import { describe, expect, it } from 'vitest';
import { buildSearchableGameDataDocs } from '../../src/models/build-searchable-game-data-docs';
import {
	ORAMA_DATA_SEARCH_SCHEMA,
	ORAMA_FILTER_FIELD_NAMES,
} from '../../src/models/orama-game-data-index';

describe('buildSearchableGameDataDocs', () => {
	it('produces rows that match the Orama schema keys', () => {
		const docs = buildSearchableGameDataDocs();
		expect(docs.length).toBeGreaterThan(0);

		const schemaKeys = new Set(Object.keys(ORAMA_DATA_SEARCH_SCHEMA));
		const ids = new Set<string>();

		for (const doc of docs) {
			for (const k of schemaKeys) {
				expect(doc).toHaveProperty(k);
				expect(typeof (doc as Record<string, unknown>)[k]).toBe('string');
			}
			expect(ids.has(doc.id)).toBe(false);
			ids.add(doc.id);
		}
	});

	it('fills every filter facet column (empty string when unused)', () => {
		const doc = buildSearchableGameDataDocs()[0]!;
		for (const k of ORAMA_FILTER_FIELD_NAMES) {
			expect(typeof doc[k]).toBe('string');
		}
	});
});
