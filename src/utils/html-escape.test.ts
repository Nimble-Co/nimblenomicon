import { describe, expect, it } from 'vitest';

import { escapeHtml } from './html-escape';

describe('escapeHtml', () => {
	it('escapes ampersands and angle brackets', () => {
		expect(escapeHtml('a & b <tag>')).toBe('a &amp; b &lt;tag&gt;');
	});

	it('escapes double quotes', () => {
		expect(escapeHtml('say "hi"')).toBe('say &quot;hi&quot;');
	});

	it('leaves plain text unchanged', () => {
		expect(escapeHtml('plain')).toBe('plain');
	});
});
