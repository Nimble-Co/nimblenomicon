/**
 * Default sort for reference index tables: alphabetical by `name`.
 * Column-level sorting can be added later without changing this baseline.
 */
export function compareReferenceRowsByName(
	a: { name: string },
	b: { name: string },
): number {
	return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
}
