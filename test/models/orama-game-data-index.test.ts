import { describe, expect, it } from 'vitest';
import {
	buildOramaGameDataSearchSchema,
	ORAMA_DATA_SEARCH_SCHEMA,
	ORAMA_FILTER_FIELD_NAMES,
	emptyOramaFilterFields,
} from '../../src/models/orama-game-data-index';

describe('orama-game-data-index', () => {
	it('includes every filter field name on the Orama schema', () => {
		for (const k of ORAMA_FILTER_FIELD_NAMES) {
			expect(ORAMA_DATA_SEARCH_SCHEMA[k]).toBe('string');
		}
	});

	it('buildOramaGameDataSearchSchema matches the singleton export', () => {
		expect(buildOramaGameDataSearchSchema()).toEqual(ORAMA_DATA_SEARCH_SCHEMA);
	});

	it('emptyOramaFilterFields zeros every filter column', () => {
		const empty = emptyOramaFilterFields();
		for (const k of ORAMA_FILTER_FIELD_NAMES) {
			expect(empty[k]).toBe('');
		}
	});
});
