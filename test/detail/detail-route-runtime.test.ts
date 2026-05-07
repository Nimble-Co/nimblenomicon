import { describe, expect, it } from 'vitest';

import {
	assertUniqueDetailIds,
	buildDetailPaths,
	buildDetailPathsFromRows,
} from '../../src/detail/detail-route-runtime';

describe('detail-route-runtime', () => {
	it('builds static paths from rows', () => {
		const rows = [{ id: 'one', name: 'One' }];
		const paths = buildDetailPathsFromRows(rows, {
			getId: (row) => row.id,
			toProps: (row) => ({ row }),
		});

		expect(paths).toEqual([
			{
				params: { id: 'one' },
				props: { row: { id: 'one', name: 'One' } },
			},
		]);
	});

	it('throws when duplicate ids are found in entry list', () => {
		expect(() =>
			buildDetailPaths(
				[
					{ id: 'dup', props: { value: 1 } },
					{ id: 'dup', props: { value: 2 } },
				],
				{
					duplicateIdError: (id) => `Duplicate id "${id}".`,
				},
			),
		).toThrow('Duplicate id "dup".');
	});

	it('asserts uniqueness for a row collection', () => {
		expect(() =>
			assertUniqueDetailIds(
				[{ id: 'shared' }, { id: 'shared' }],
				(row) => row.id,
				(id) => `Duplicate row "${id}".`,
			),
		).toThrow('Duplicate row "shared".');
	});
});
