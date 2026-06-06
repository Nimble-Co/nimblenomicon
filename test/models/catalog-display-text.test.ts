import { describe, expect, it } from 'vitest';
import {
	formatSpellCardMetaLine,
	spellDetailMetaMarkdown,
	spellListingMetaMarkdown,
	spellSchoolDisplayName,
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

	it('spellListingMetaMarkdown omits school and flags', () => {
		const s = baseSpell({ utility: true, secret: true });
		expect(spellListingMetaMarkdown(s)).toBe(
			'_Tier 1, 1 Action, Single Target_',
		);
	});

	it('formatSpellCardMetaLine joins card fields with middle dots', () => {
		expect(
			formatSpellCardMetaLine({
				schoolName: 'Fire',
				tierLabel: 'Tier 1',
				castingTime: '1 Action',
				targetLabel: 'Single Target',
			}),
		).toBe('Fire · Tier 1 · 1 Action · Single Target');
	});
});
