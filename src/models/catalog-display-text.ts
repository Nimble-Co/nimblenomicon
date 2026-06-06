/**
 * Human-facing strings shared across detail pages, Orama docs, and search cards.
 * Spell-specific rules stay here so search subtitles and detail meta lines do not drift.
 */
import { spellSchools } from './spell-schools';
import type { SpellData } from './spells';

export function spellSchoolDisplayName(schoolId: string): string {
	return spellSchools.find((s) => s.id === schoolId)?.name ?? schoolId;
}

export type SpellMetaSegment =
	| 'school'
	| 'schoolSpell'
	| 'tier'
	| 'castingTime'
	| 'target'
	| 'utility'
	| 'secret';

export type FormatSpellMetaOptions = {
	segments: SpellMetaSegment[];
	separator: ', ' | ' · ';
	/** Wrap the joined line in markdown italics when non-empty. */
	markdown?: boolean;
};

function spellMetaSegmentValue(
	spell: SpellData,
	segment: SpellMetaSegment,
	schoolName: string,
): string {
	switch (segment) {
		case 'school':
			return schoolName;
		case 'schoolSpell':
			return `${schoolName} Spell`;
		case 'tier':
			return spell.tierLabel;
		case 'castingTime':
			return spell.castingTime?.trim() ?? '';
		case 'target':
			return spell.targetLabel ?? '';
		case 'utility':
			return spell.utility ? 'Utility' : '';
		case 'secret':
			return spell.secret ? 'Secret' : '';
	}
}

/** Compose spell metadata for detail pages, lists, search subtitles, and cards. */
export function formatSpellMeta(
	spell: SpellData,
	options: FormatSpellMetaOptions,
): string {
	const schoolName = spellSchoolDisplayName(spell.schoolId);
	const parts = options.segments
		.map((segment) => spellMetaSegmentValue(spell, segment, schoolName))
		.filter(Boolean);
	const joined = parts.join(options.separator);
	return options.markdown && joined ? `_${joined}_` : joined;
}

/** Dot-separated subtitle for search index rows (school · tier · flags). */
export function spellSearchSubtitle(spell: SpellData): string {
	return formatSpellMeta(spell, {
		segments: ['school', 'tier', 'utility', 'secret'],
		separator: ' · ',
	});
}

/** Italic meta line above spell body on detail pages. */
export function spellDetailMetaMarkdown(spell: SpellData): string {
	return formatSpellMeta(spell, {
		segments: [
			'schoolSpell',
			'tier',
			'castingTime',
			'target',
			'utility',
			'secret',
		],
		separator: ', ',
		markdown: true,
	});
}

/** Italic meta line for Core Rules / GMG spell lists (tier, casting time, target). */
export function spellListingMetaMarkdown(spell: SpellData): string {
	return formatSpellMeta(spell, {
		segments: ['tier', 'castingTime', 'target'],
		separator: ', ',
		markdown: true,
	});
}

/** Dot-separated meta line for spell search result cards. */
export function formatSpellCardMetaLine(fields: {
	schoolName: string;
	tierLabel: string;
	castingTime?: string;
	targetLabel?: string;
}): string {
	const parts = [
		fields.schoolName,
		fields.tierLabel,
		fields.castingTime?.trim(),
		fields.targetLabel,
	].filter(Boolean);
	return parts.join(' · ');
}
