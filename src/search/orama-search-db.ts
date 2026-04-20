import { create, load, type RawData } from '@orama/orama';
import { ORAMA_DATA_SEARCH_SCHEMA } from '../models/orama-schema';

const INDEX_URL = '/orama-data-search.json';
const BOOKS_INDEX_URL = '/orama-books-search.json';

const BOOKS_SCHEMA = {
	id: 'string',
	type: 'string',
	book: 'string',
	title: 'string',
	subtitle: 'string',
	content: 'string',
	href: 'string',
} as const;

export type OramaDataSearchDb = ReturnType<typeof create>;
export type OramaBooksSearchDb = ReturnType<typeof create>;

let dbPromise: Promise<OramaDataSearchDb> | undefined;
let booksDbPromise: Promise<OramaBooksSearchDb | null> | undefined;

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

export function getOramaBooksSearchDb(): Promise<OramaBooksSearchDb | null> {
	if (!booksDbPromise) {
		booksDbPromise = (async () => {
			const r = await fetch(BOOKS_INDEX_URL);
			if (r.status === 404) return null;
			if (!r.ok) return null;
			const raw = (await r.json()) as RawData;
			const instance = create({ schema: BOOKS_SCHEMA });
			load(instance, raw);
			return instance;
		})();
	}
	return booksDbPromise;
}
