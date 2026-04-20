import { describe, expect, it } from 'vitest';
import {
	bookIdFromDistRelativePath,
	extractBookSearchTextFromHtml,
	extractBookSearchTitleFromHtml,
	stripPageTitleSuffix,
} from '../src/models/book-search';
import {
	applySearchFiltersToParams,
	buildOramaWhereForFilters,
	documentMatchesFilters,
	emptySearchFiltersState,
	parseSearchFiltersFromParams,
} from '../src/models/search-filters';

describe('book-search helpers', () => {
	it('bookIdFromDistRelativePath returns book id for indexed prefixes', () => {
		expect(bookIdFromDistRelativePath('core-rules/index.html')).toBe(
			'core-rules',
		);
		expect(
			bookIdFromDistRelativePath('game-masters-guide/foo/index.html'),
		).toBe('game-masters-guide');
		expect(bookIdFromDistRelativePath('creators-kit/index.html')).toBe(
			'creators-kit',
		);
		expect(bookIdFromDistRelativePath('heroes/index.html')).toBeNull();
		expect(bookIdFromDistRelativePath('search/index.html')).toBeNull();
	});

	it('stripPageTitleSuffix removes site name after pipe', () => {
		expect(stripPageTitleSuffix('Core Rules | The Nimblenomicon')).toBe(
			'Core Rules',
		);
	});

	it('extractBookSearchTitleFromHtml prefers title tag', () => {
		const html = `<!DOCTYPE html><html><head><title>Foo | Site</title></head><body><main><div class="sl-markdown-content"><h1>Heading</h1></div></main></body></html>`;
		expect(extractBookSearchTitleFromHtml(html)).toBe('Foo');
	});

	it('extractBookSearchTextFromHtml returns normalized text from markdown body', () => {
		const html = `<body><main><div class="sl-markdown-content"><p>Hello <strong>world</strong>.</p><script>evil()</script></div></main></body>`;
		expect(extractBookSearchTextFromHtml(html)).toBe('Hello world.');
	});
});

describe('books search filters', () => {
	it('round-trips book multi-select in URL for type=books', () => {
		const state = emptySearchFiltersState();
		state.book = ['core-rules', 'creators-kit'];
		const params = new URLSearchParams();
		params.set('q', 'mana');
		params.set('type', 'books');
		applySearchFiltersToParams('books', state, params);
		expect(params.get('book')).toBe('core-rules,creators-kit');
		const parsed = parseSearchFiltersFromParams('books', params);
		expect(parsed.book).toEqual(['core-rules', 'creators-kit']);
	});

	it('buildOramaWhereForFilters books combines type and book or', () => {
		const f = emptySearchFiltersState();
		f.book = ['core-rules', 'game-masters-guide'];
		const where = buildOramaWhereForFilters('books', f);
		expect(where).toEqual({
			and: [
				{ type: 'books' },
				{ or: [{ book: 'core-rules' }, { book: 'game-masters-guide' }] },
			],
		});
	});

	it('documentMatchesFilters books respects book selection', () => {
		const f = emptySearchFiltersState();
		f.book = ['core-rules'];
		const doc = {
			id: 'x',
			type: 'books' as const,
			book: 'core-rules' as const,
			title: 'T',
			subtitle: '',
			content: 'c',
			href: '/core-rules/',
		};
		expect(documentMatchesFilters(doc, 'books', f)).toBe(true);
		f.book = ['creators-kit'];
		expect(documentMatchesFilters(doc, 'books', f)).toBe(false);
	});
});
