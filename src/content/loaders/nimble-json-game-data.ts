import type { Loader } from 'astro/loaders';

import {
	NIMBLE_JSON_IDS,
	nimbleGameDataById,
} from '../../models/nimble-data-files';

/**
 * Build-time loader: registers every Nimble JSON dataset as one `nimbleGameData` entry
 * (id = file stem), matching the Atom news loader pattern.
 */
export function nimbleJsonGameDataLoader(): Loader {
	return {
		name: 'nimble-json-game-data-loader',
		load: async ({ store, parseData, logger }) => {
			store.clear();
			for (const id of NIMBLE_JSON_IDS) {
				const raw = nimbleGameDataById[id];
				const data = await parseData({ id, data: raw });
				store.set({ id, data });
			}
			logger.debug(
				`[nimble-json-game-data] Loaded ${NIMBLE_JSON_IDS.length} dataset(s)`,
			);
		},
	};
}
