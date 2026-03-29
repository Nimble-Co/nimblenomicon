import slugify from '@sindresorhus/slugify';

/** Matches legacy URL slugs: apostrophes become word separators (e.g. Heart's → heart-s). */
const slugifyOptions = {
	lowercase: true,
	customReplacements: [["'", ' ']] as [string, string][],
};

/**
 * Stable URL segment from a display name. Empty or degenerate names use `emptyFallback`.
 */
export function slugifyEntityId(name: string, emptyFallback: string): string {
	const trimmed = typeof name === 'string' ? name.trim() : '';
	if (trimmed === '') return emptyFallback;
	const out = slugify(trimmed, slugifyOptions);
	return out === '' ? emptyFallback : out;
}
