import { describe, expect, it } from 'vitest';
import { stripFlavorIsFreeBlockquotesFromMarkdown } from '../../src/models/search-result-card-payloads';
import {
	parseSearchResultCard,
	searchResultCardSchema,
} from '../../src/models/search-result-card';

describe('parseSearchResultCard', () => {
	it('parses a valid spell payload', () => {
		const raw = JSON.stringify({
			v: 1,
			kind: 'spell',
			schoolName: 'Fire',
			tierLabel: 'Tier 1',
			castingTime: '1 action',
			targetLabel: 'Single Target',
			utility: false,
			secret: false,
			descriptionMd: 'Burns stuff.',
		});
		const p = parseSearchResultCard(raw);
		expect(p?.kind).toBe('spell');
		if (p?.kind === 'spell') {
			expect(p.schoolName).toBe('Fire');
		}
	});

	it('returns null for invalid JSON', () => {
		expect(parseSearchResultCard('not json')).toBeNull();
	});

	it('returns null for wrong shape', () => {
		expect(parseSearchResultCard(JSON.stringify({ foo: 1 }))).toBeNull();
	});

	it('returns null for empty string', () => {
		expect(parseSearchResultCard('')).toBeNull();
	});

	it('accepts all simple kinds', () => {
		for (const kind of [
			'ancestry',
			'background',
			'equipment',
			'magic-item',
			'glossary',
			'language',
			'condition',
			'armor',
		] as const) {
			const raw = JSON.stringify({
				v: 1,
				kind,
				excerptMd: 'x',
			});
			expect(parseSearchResultCard(raw)?.kind).toBe(kind);
		}
	});
});

describe('searchResultCardSchema', () => {
	it('rejects monster missing variant', () => {
		const r = searchResultCardSchema.safeParse({
			v: 1,
			kind: 'monster',
			level: '1',
		});
		expect(r.success).toBe(false);
	});
});

describe('stripFlavorIsFreeBlockquotesFromMarkdown', () => {
	it('removes Flavor Is Free blockquote paragraph', () => {
		const md =
			'**Optimistic.** Reroll dice.\n\n> **Flavor Is Free.** Sidebar text.';
		expect(stripFlavorIsFreeBlockquotesFromMarkdown(md)).toBe(
			'**Optimistic.** Reroll dice.',
		);
	});

	it('keeps other blockquotes', () => {
		const md =
			'**Lithe.** Fast.\n\n> **What About Half-Elves?** Mix ancestries.';
		expect(stripFlavorIsFreeBlockquotesFromMarkdown(md)).toBe(md);
	});
});
