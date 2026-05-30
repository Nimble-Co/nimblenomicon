import { describe, expect, it } from 'vitest';
import {
	joinSpellSearchCardMetaParts,
	spellDetailMetaMarkdown,
	spellListingMetaMarkdown,
	spellSchoolDisplayName,
	spellSearchCardMetaLine,
	spellSearchSubtitle,
} from '../../src/models/catalog-display-text';
import { spellSchools } from '../../src/models/spell-schools';
import type { SpellData } from '../../src/models/spells';

function baseSpell(partial: Partial<SpellData>): SpellData {
	return {
		id: 'test-spell',
		name: 'Test Spell',
		schoolId: spellSchools[0]!.id,
		tier: 1,
		tierLabel: 'Tier 1',
		castingTime: '1 Action',
		target: 'single-target',
		targetLabel: 'Single Target',
		utility: false,
		secret: false,
		source: 'core-rules',
		description: 'Does a thing.',
		...partial,
	};
}

describe('catalog-display-text (spells)', () => {
	it('spellSchoolDisplayName resolves known schools', () => {
		const fireId = spellSchools.find((s) => s.name === 'Fire')!.id;
		expect(spellSchoolDisplayName(fireId)).toBe('Fire');
	});

	it('spellSchoolDisplayName falls back to the id', () => {
		expect(spellSchoolDisplayName('unknown-school-id')).toBe(
			'unknown-school-id',
		);
	});

	it('spellSearchSubtitle joins school, tier, and flags', () => {
		const schoolName = spellSchools[0]!.name;
		const s = baseSpell({ utility: true, secret: true });
		expect(spellSearchSubtitle(s)).toBe(
			`${schoolName} · Tier 1 · Utility · Secret`,
		);
	});

	it('spellDetailMetaMarkdown matches detail page shape', () => {
		const schoolName = spellSchools[0]!.name;
		const s = baseSpell({});
		expect(spellDetailMetaMarkdown(s)).toBe(
			`_${schoolName} Spell, Tier 1, 1 Action, Single Target_`,
		);
	});

	it('spellListingMetaMarkdown omits school (lists are grouped by school)', () => {
		const s = baseSpell({});
		expect(spellListingMetaMarkdown(s)).toBe(
			'_Tier 1, 1 Action, Single Target_',
		);
	});

	it('spellSearchCardMetaLine matches search card subtitle', () => {
		const schoolName = spellSchools[0]!.name;
		const s = baseSpell({});
		expect(spellSearchCardMetaLine(s)).toBe(
			`${schoolName} · Tier 1 · 1 Action · Single Target`,
		);
		expect(
			joinSpellSearchCardMetaParts({
				schoolName,
				tierLabel: 'Tier 1',
				castingTime: '1 Action',
				targetLabel: 'Single Target',
			}),
		).toBe(spellSearchCardMetaLine(s));
	});
});
