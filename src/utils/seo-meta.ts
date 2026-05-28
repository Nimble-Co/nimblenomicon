/** Google typically shows ~150–160 characters of meta descriptions; keep snippets concise. */
export const META_DESCRIPTION_MAX = 160;

/**
 * Collapses whitespace and trims; truncates with an ellipsis so Open Graph / meta descriptions
 * stay readable in search and social previews.
 */
export function truncateMetaDescription(
	text: string,
	max = META_DESCRIPTION_MAX,
): string {
	const t = text.replace(/\s+/g, ' ').trim();
	if (t.length <= max) return t;
	const cut = t.slice(0, max - 1);
	const lastSpace = cut.lastIndexOf(' ');
	const safe = lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut.trimEnd();
	return `${safe}…`;
}
