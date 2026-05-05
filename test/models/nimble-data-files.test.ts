import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import {
	nimbleGameDataById,
	nimbleJsonIds,
} from '../../src/models/nimble-data-files';

const repoRoot = fileURLToPath(new URL('../..', import.meta.url));
const dataDir = path.join(repoRoot, 'src', 'data');

describe('nimble-data-files', () => {
	it('exposes one entry per src/data JSON file, sorted by id', async () => {
		const files = (await readdir(dataDir)).filter((f) => f.endsWith('.json'));
		const stems = files
			.map((f) => f.replace(/\.json$/i, ''))
			.sort((a, b) => a.localeCompare(b));

		expect(nimbleJsonIds).toEqual(stems);
		expect(
			Object.keys(nimbleGameDataById).sort((a, b) => a.localeCompare(b)),
		).toEqual(stems);
		for (const stem of stems) {
			expect(nimbleGameDataById[stem]).toBeDefined();
		}
	});
});
