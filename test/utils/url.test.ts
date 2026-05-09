import { describe, expect, it } from 'vitest';

import {
	coreRulesDocHref,
	dataSearchBrowseUrl,
	gameMastersGuideDocHref,
	heroesDocHref,
	normalizeBaseUrl,
	searchPageUrl,
} from '../../src/utils/url';

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

describe('dataSearchBrowseUrl', () => {
	it('appends type query to search path', () => {
		expect(dataSearchBrowseUrl('/', 'never', 'spell')).toBe(
			'/search?type=spell',
		);
		expect(dataSearchBrowseUrl('/docs/', 'never', 'class')).toBe(
			'/docs/search?type=class',
		);
	});

	it('appends type after trailing slash when Starlight uses always', () => {
		expect(dataSearchBrowseUrl('/', 'always', 'monster')).toBe(
			'/search/?type=monster',
		);
	});

	it('encodes magic-item type slug', () => {
		expect(dataSearchBrowseUrl('/', 'never', 'magic-item')).toBe(
			'/search?type=magic-item',
		);
	});
});

describe('doc anchor hrefs', () => {
	it('builds Core Rules and GMG fragment links', () => {
		expect(coreRulesDocHref('foo-bar')).toBe('/core-rules/#foo-bar');
		expect(gameMastersGuideDocHref('baz')).toBe('/game-masters-guide/#baz');
	});

	it('builds Heroes doc fragment links', () => {
		expect(heroesDocHref('champion')).toBe('/heroes/#champion');
	});
});
