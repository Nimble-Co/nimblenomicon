import { describe, expect, it } from 'vitest';

import { normalizeBaseUrl, searchPageUrl } from './url';

describe('normalizeBaseUrl', () => {
	it('strips a single trailing slash', () => {
		expect(normalizeBaseUrl('/')).toBe('');
		expect(normalizeBaseUrl('/foo/')).toBe('/foo');
	});

	it('returns the string unchanged when there is no trailing slash', () => {
		expect(normalizeBaseUrl('')).toBe('');
		expect(normalizeBaseUrl('/foo')).toBe('/foo');
	});
});

describe('searchPageUrl', () => {
	it('appends /search to the normalized base', () => {
		expect(searchPageUrl('/', 'never')).toBe('/search');
		expect(searchPageUrl('/docs/', 'never')).toBe('/docs/search');
	});

	it('adds a trailing slash when Starlight uses trailingSlash: always', () => {
		expect(searchPageUrl('/', 'always')).toBe('/search/');
		expect(searchPageUrl('/docs/', 'always')).toBe('/docs/search/');
	});

	it('does not add a trailing slash for never or ignore', () => {
		expect(searchPageUrl('/', 'ignore')).toBe('/search');
		expect(searchPageUrl('/', 'never')).toBe('/search');
	});
});
