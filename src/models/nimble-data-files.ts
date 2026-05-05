/**
 * Build-time JSON modules for game data. Uses `import.meta.glob` (Vite) so
 * `src/data/*.json`, the content loader, and the static API share one map.
 *
 * Code that loads these models outside the Vite pipeline (e.g. scripts) should
 * be run with `vite-node` so `import.meta.glob` is transformed.
 */
const dataModules = import.meta.glob('../data/*.json', {
	eager: true,
	import: 'default',
}) as Record<string, unknown>;

function stemFromModulePath(modulePath: string): string {
	const file = modulePath.split(/[/\\]/).pop() ?? '';
	return file.replace(/\.json$/i, '');
}

const nimbleGameDataById: Record<string, unknown> = {};
for (const [jsonPath, data] of Object.entries(dataModules)) {
	nimbleGameDataById[stemFromModulePath(jsonPath)] = data;
}

export { nimbleGameDataById };

/** Sorted dataset ids (one per file under `src/data/`). */
export const nimbleJsonIds = Object.keys(nimbleGameDataById).sort((a, b) =>
	a.localeCompare(b),
);

/** Alias for loaders and legacy imports (`nimble-json-ids`). */
export { nimbleJsonIds as NIMBLE_JSON_IDS };

export function getCollectionSlugs(): string[] {
	return [...nimbleJsonIds];
}

export function getCollectionData(slug: string): unknown | undefined {
	return nimbleGameDataById[slug];
}
