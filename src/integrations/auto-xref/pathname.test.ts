import { describe, expect, it } from 'vitest';

import { distFileToSelfPathname, htmlRelativeToPathname } from './pathname';

describe('htmlRelativeToPathname', () => {
	it('maps index.html under a segment to a trailing-slash path', () => {
		expect(htmlRelativeToPathname('spells/fireball/index.html')).toBe(
			'/spells/fireball/',
		);
	});

	it('maps root index.html to /', () => {
		expect(htmlRelativeToPathname('index.html')).toBe('/');
	});
});

describe('distFileToSelfPathname', () => {
	it('prefixes page pathnames with basePrefix when non-empty', () => {
		expect(
			distFileToSelfPathname('spells/fireball/index.html', '/nimblenomicon'),
		).toBe('/nimblenomicon/spells/fireball/');
	});

	it('uses / for root index when base is empty', () => {
		expect(distFileToSelfPathname('index.html', '')).toBe('/');
	});
});
