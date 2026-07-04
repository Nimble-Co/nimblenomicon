import { describe, expect, it } from 'vitest';
import { formatOramaSearchEmptyMessage } from '../../src/components/orama-search/toolbar-styles';

describe('formatOramaSearchEmptyMessage', () => {
	it('returns browse-all copy when query and type are empty', () => {
		expect(formatOramaSearchEmptyMessage('   ', null)).toBe(
			'No entries in the index.',
		);
	});

	it('returns global search miss copy', () => {
		expect(formatOramaSearchEmptyMessage('fireball', null)).toBe(
			'No results for “fireball”.',
		);
	});

	it('returns typed search miss copy', () => {
		expect(formatOramaSearchEmptyMessage('fireball', 'spell')).toBe(
			'No spells results for “fireball”.',
		);
	});

	it('returns typed browse copy', () => {
		expect(formatOramaSearchEmptyMessage('', 'monster')).toBe(
			'No monsters entries in the index.',
		);
	});
});
