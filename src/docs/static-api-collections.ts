const dataModules = import.meta.glob('../data/*.json', {
	eager: true,
	import: 'default',
}) as Record<string, unknown>;

function slugFromPath(path: string): string {
	const file = path.split('/').pop() ?? '';
	return file.replace(/\.json$/i, '');
}

const dataBySlug = new Map<string, unknown>();
for (const [path, data] of Object.entries(dataModules)) {
	dataBySlug.set(slugFromPath(path), data);
}

export function getCollectionSlugs(): string[] {
	return [...dataBySlug.keys()].sort((a, b) => a.localeCompare(b));
}

export function getCollectionData(slug: string): unknown | undefined {
	return dataBySlug.get(slug);
}
