/**
 * Human-facing strings shared across detail pages, Orama docs, and search cards.
 * Spell-specific rules stay here so search subtitles and detail meta lines do not drift.
 */
import { spellSchools } from './spell-schools';
import type { SpellData } from './spells';

export function spellSchoolDisplayName(schoolId: string): string {
	return spellSchools.find((s) => s.id === schoolId)?.name ?? schoolId;
}

/** One-line subtitle for search index rows (school · tier · flags). */
export function spellSearchSubtitle(spell: SpellData): string {
	const parts = [
		spellSchoolDisplayName(spell.schoolId),
		spell.tierLabel,
		spell.utility ? 'Utility' : '',
		spell.secret ? 'Secret' : '',
	].filter(Boolean);
	return parts.join(' · ');
}

/** Italic meta line above spell body on detail pages. */
export function spellDetailMetaMarkdown(spell: SpellData): string {
	const schoolName = spellSchoolDisplayName(spell.schoolId);
	const components = [
		`${schoolName} Spell`,
		spell.tierLabel,
		spell.castingTime?.trim(),
		spell.targetLabel,
		spell.utility ? 'Utility' : '',
		spell.secret ? 'Secret' : '',
	];
	return `_${components.filter(Boolean).join(', ')}_`;
}
