import { describe, expect, it } from 'vitest';

import type { XrefTermEntry } from '../../models/xref-terms';
import { applyAutoXrefToDocument } from './process-html';

const sampleTerms: XrefTermEntry[] = [
	{
		term: 'Fireball',
		href: '/spells/fireball/',
		definition: 'A bright streak.',
		kind: 'spell',
		priority: 100,
	},
	{
		term: 'Armor',
		href: '/glossary/armor/',
		definition: 'Protection.',
		kind: 'glossary',
		priority: 50,
	},
];

describe('applyAutoXrefToDocument', () => {
	it('wraps terms in p inside [data-auto-link]', () => {
		const html = `<!DOCTYPE html><html><body><main><div data-auto-link><p>Cast Fireball here.</p></div></main></body></html>`;
		const out = applyAutoXrefToDocument(
			html,
			sampleTerms,
			'/classes/wizard/',
			'',
		);
		expect(out).toContain('class="auto-xref"');
		expect(out).toContain('data-term="Fireball"');
		expect(out).toContain('Cast ');
	});

	it('matches case-insensitively and keeps source casing inside the anchor', () => {
		const html = `<!DOCTYPE html><html><body><div data-auto-link><p>cast fireball here</p></div></body></html>`;
		const out = applyAutoXrefToDocument(
			html,
			sampleTerms,
			'/classes/wizard/',
			'',
		);
		expect(out).toContain('data-term="Fireball"');
		expect(out).toContain('>fireball<');
	});

	it('skips [data-no-xref] regions', () => {
		const html = `<!DOCTYPE html><html><body><div data-auto-link><p><span data-no-xref>Fireball</span> and Fireball.</p></div></body></html>`;
		const out = applyAutoXrefToDocument(html, sampleTerms, '/', '');
		const autoCount = (out.match(/class="auto-xref"/g) ?? []).length;
		expect(autoCount).toBe(1);
		expect(out).toContain('data-no-xref');
	});

	it('does not link when href matches current page', () => {
		const html = `<!DOCTYPE html><html><body><div data-auto-link><p>Fireball</p></div></body></html>`;
		const out = applyAutoXrefToDocument(
			html,
			sampleTerms,
			'/spells/fireball/',
			'',
		);
		expect(out).not.toContain('class="auto-xref"');
	});

	it('picks longest match (Armor vs longer phrase would need ordering)', () => {
		const terms: XrefTermEntry[] = [
			{
				term: 'Plate Armor',
				href: '/armor/plate-armor/',
				definition: 'Heavy.',
				kind: 'armor',
				priority: 64,
			},
			{
				term: 'Armor',
				href: '/glossary/armor/',
				definition: 'Protection.',
				kind: 'glossary',
				priority: 50,
			},
		].sort((a, b) => b.term.length - a.term.length);
		const html = `<!DOCTYPE html><html><body><div data-auto-link><p>Wear Plate Armor.</p></div></body></html>`;
		const out = applyAutoXrefToDocument(html, terms, '/', '');
		expect(out).toContain('data-term="Plate Armor"');
		expect(out).not.toContain('data-term="Armor"');
	});

	it('does not link inside nimble-full-bleed-hero__callout', () => {
		const html = `<!DOCTYPE html><html><body><div data-auto-link><div class="nimble-full-bleed-hero__callout not-content"><p>Cast Fireball here.</p></div></div></body></html>`;
		const out = applyAutoXrefToDocument(
			html,
			sampleTerms,
			'/classes/wizard/',
			'',
		);
		expect(out).not.toContain('class="auto-xref"');
	});

	it('returns unchanged when no data-auto-link', () => {
		const html = `<!DOCTYPE html><html><body><p>Fireball</p></body></html>`;
		const out = applyAutoXrefToDocument(html, sampleTerms, '/', '');
		expect(out).toBe(html);
	});
});
