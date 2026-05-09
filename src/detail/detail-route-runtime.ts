type DetailPathEntry<Props> = {
	id: string;
	props: Props;
};

type BuildDetailPathsOptions = {
	duplicateIdError?: (id: string) => string;
};

function markUniqueDetailId(
	seen: Set<string>,
	id: string,
	duplicateIdError?: (id: string) => string,
): void {
	if (seen.has(id)) {
		throw new Error(
			duplicateIdError?.(id) ?? `Duplicate detail page id "${id}".`,
		);
	}
	seen.add(id);
}

/**
 * Shared runtime for detail route static path generation.
 * Consolidates duplicate-id enforcement across all [id] routes.
 */
export function buildDetailPaths<Props>(
	entries: ReadonlyArray<DetailPathEntry<Props>>,
	options: BuildDetailPathsOptions = {},
) {
	const seen = new Set<string>();
	return entries.map(({ id, props }) => {
		markUniqueDetailId(seen, id, options.duplicateIdError);
		return {
			params: { id },
			props,
		};
	});
}

type BuildDetailPathsFromRowsOptions<Row, Props> = BuildDetailPathsOptions & {
	getId: (row: Row) => string;
	toProps: (row: Row) => Props;
};

export function assertUniqueDetailIds<Row>(
	rows: ReadonlyArray<Row>,
	getId: (row: Row) => string,
	duplicateIdError: (id: string) => string,
) {
	const seen = new Set<string>();
	for (const row of rows) {
		markUniqueDetailId(seen, getId(row), duplicateIdError);
	}
}

export function buildDetailPathsFromRows<Row, Props>(
	rows: ReadonlyArray<Row>,
	options: BuildDetailPathsFromRowsOptions<Row, Props>,
) {
	return buildDetailPaths(
		rows.map((row) => ({
			id: options.getId(row),
			props: options.toProps(row),
		})),
		options,
	);
}
