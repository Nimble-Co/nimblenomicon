import { create, load, type RawData } from '@orama/orama';
import { ORAMA_DATA_SEARCH_SCHEMA } from '../models/orama-schema';

const INDEX_URL = '/orama-data-search.json';

export type OramaDataSearchDb = ReturnType<typeof create>;

let dbPromise: Promise<OramaDataSearchDb> | undefined;

export function getOramaDataSearchDb(): Promise<OramaDataSearchDb> {
	if (!dbPromise) {
		dbPromise = (async () => {
			const r = await fetch(INDEX_URL);
			if (!r.ok) throw new Error(`Failed to load index (${r.status})`);
			const raw = (await r.json()) as RawData;
			const instance = create({ schema: ORAMA_DATA_SEARCH_SCHEMA });
			load(instance, raw);
			return instance;
		})();
	}
	return dbPromise;
}
