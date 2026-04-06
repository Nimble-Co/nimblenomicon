import { z } from 'astro/zod';
import { SECTION_METADATA, type SectionKey } from '../config/section-sidebars';
import { slugifyEntityId } from '../utils/slugifyEntityId';

/** Books that exist as on-site MDX (anchor links are meaningful). */
export const SOURCE_BOOK_KEYS = [
	'core-rules',
	'heroes',
	'game-masters-guide',
	'adventures',
	'creators-kit',
] as const;

export type SourceBookKey = (typeof SOURCE_BOOK_KEYS)[number];

/**
 * Citation to a specific heading on a core book page. `headingId` matches the
 * generated HTML `id` on that heading (Starlight / MDX).
 */
export const sourceRefSchema = z
	.object({
		book: z.enum(SOURCE_BOOK_KEYS),
		headingId: z.string().min(1),
	})
	.strict();

export type SourceRef = z.infer<typeof sourceRefSchema>;

export function sourceBookPath(book: SourceBookKey): string {
	return SECTION_METADATA[book as SectionKey].path;
}

/** Root-relative page URL without trailing slash (e.g. `/core-rules`). */
export function sourceBookPageHref(book: SourceBookKey): string {
	const path = sourceBookPath(book);
	return path.replace(/\/$/, '');
}

/** Link to the exact heading on the book page (`/core-rules/#spells`). */
export function sourceRefHref(ref: SourceRef): string {
	return `${sourceBookPageHref(ref.book)}/#${ref.headingId}`;
}

export function sourceBookLabel(book: SourceBookKey): string {
	return SECTION_METADATA[book as SectionKey].label;
}

/** Display line for “From …” links (book title, not the URL). */
export function sourceRefLabel(ref: SourceRef): string {
	return sourceBookLabel(ref.book);
}

/**
 * Common fields for persisted game-data rows: display `name`, stable `id`
 * from `slugifyEntityId(name, idFallback)`, and a `source` citation.
 */
export function namedEntityFieldsSchema() {
	return {
		name: z.string().min(1),
		source: sourceRefSchema,
	} as const;
}

export type NamedEntityBase = {
	name: string;
	id: string;
	source: SourceRef;
};

export function withDerivedId<T extends { name: string }>(
	row: T,
	idFallback: string,
): T & { id: string } {
	return {
		...row,
		id: slugifyEntityId(row.name, idFallback),
	};
}
