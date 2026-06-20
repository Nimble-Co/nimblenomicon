import { describe, expect, it } from 'vitest';
import { formatSearchEmptyResultsMessage } from '../../src/components/orama-search/toolbar-styles';

describe('formatSearchEmptyResultsMessage', () => {
	it('describes browse-all empty index', () => {
		expect(formatSearchEmptyResultsMessage('', null)).toBe(
			'No entries in the index.',
		);
	});

	it('describes typed browse with no query', () => {
		expect(formatSearchEmptyResultsMessage('', 'spell')).toBe(
			'No spells entries in the index.',
		);
	});

	it('describes global text search miss', () => {
		expect(formatSearchEmptyResultsMessage('bolt', null)).toBe(
			'No results for “bolt”.',
		);
	});

	it('describes typed text search miss', () => {
		expect(formatSearchEmptyResultsMessage('bolt', 'spell')).toBe(
			'No spells results for “bolt”.',
		);
	});
});
