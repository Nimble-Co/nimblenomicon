import { describe, expect, it } from 'vitest';

import {
	buildMatchableTerms,
	GLOBAL_XREF_AUTOLINK_BLOCKLIST,
} from './xref-terms';

describe('GLOBAL_XREF_AUTOLINK_BLOCKLIST', () => {
	it('excludes blocked terms from buildMatchableTerms (case-insensitive)', () => {
		for (const blocked of GLOBAL_XREF_AUTOLINK_BLOCKLIST) {
			expect(
				buildMatchableTerms().some(
					(e) => e.term.trim().toLowerCase() === blocked,
				),
			).toBe(false);
		}
	});
});
