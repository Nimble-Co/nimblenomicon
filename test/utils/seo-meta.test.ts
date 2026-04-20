import { describe, expect, it } from 'vitest';
import {
	META_DESCRIPTION_MAX,
	truncateMetaDescription,
} from '../../src/utils/seo-meta';

describe('truncateMetaDescription', () => {
	it('returns short strings unchanged', () => {
		expect(truncateMetaDescription('Hello world')).toBe('Hello world');
	});

	it('collapses whitespace', () => {
		expect(truncateMetaDescription('a  \n  b')).toBe('a b');
	});

	it('truncates with ellipsis under max length', () => {
		const long = 'word '.repeat(80).trim();
		const out = truncateMetaDescription(long, 40);
		expect(out.length).toBeLessThanOrEqual(40);
		expect(out.endsWith('…')).toBe(true);
	});

	it('default max matches META_DESCRIPTION_MAX', () => {
		const long = 'x'.repeat(META_DESCRIPTION_MAX + 50);
		expect(truncateMetaDescription(long).length).toBeLessThanOrEqual(
			META_DESCRIPTION_MAX,
		);
	});
});
