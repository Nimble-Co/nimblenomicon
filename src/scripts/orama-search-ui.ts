import { create, load, search, type RawData } from '@orama/orama';
import {
	ORAMA_DATA_SEARCH_TYPE_LABELS,
	ORAMA_DATA_SEARCH_TYPE_ORDER,
	type OramaDataSearchType,
} from '../constants/orama-data-search';

type GameDataDoc = {
	id: string;
	type: OramaDataSearchType;
	title: string;
	content: string;
	href: string;
	subtitle: string;
};

const INDEX_URL = '/orama-data-search.json';
const SEARCH_LIMIT = 80;
const DEBOUNCE_MS = 200;

function debounce<T extends (...args: Parameters<T>) => void>(
	fn: T,
	ms: number,
): (...args: Parameters<T>) => void {
	let t: ReturnType<typeof setTimeout> | undefined;
	return (...args: Parameters<T>) => {
		if (t) clearTimeout(t);
		t = setTimeout(() => {
			t = undefined;
			fn(...args);
		}, ms);
	};
}

function escapeHtml(s: string): string {
	return s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

export function initOramaDataSearch(root: HTMLElement): void {
	const input = root.querySelector<HTMLInputElement>(
		'[data-orama-search-input]',
	);
	const resultsEl = root.querySelector<HTMLElement>(
		'[data-orama-search-results]',
	);
	const statusEl = root.querySelector<HTMLElement>(
		'[data-orama-search-status]',
	);
	const liveEl = root.querySelector<HTMLElement>('[data-orama-search-live]');

	if (!resultsEl || !statusEl) return;

	let db: ReturnType<typeof create> | undefined;
	let loading = true;

	statusEl.textContent = 'Loading search index…';

	fetch(INDEX_URL)
		.then((r) => {
			if (!r.ok) throw new Error(`Failed to load index (${r.status})`);
			return r.json() as Promise<RawData>;
		})
		.then((raw: RawData) => {
			const instance = create({
				schema: {
					id: 'string',
					type: 'string',
					title: 'string',
					content: 'string',
					href: 'string',
					subtitle: 'string',
				},
			});
			load(instance, raw);
			db = instance;
			loading = false;
			const initialQuery = new URLSearchParams(window.location.search).get('q');
			if (initialQuery && initialQuery.trim().length > 0) {
				const query = initialQuery.trim();
				if (input) {
					input.disabled = false;
					input.value = query;
				}
				statusEl.textContent = `Showing results for “${query}”.`;
				renderResults(query);
			} else {
				if (input) {
					input.disabled = false;
					statusEl.textContent = 'Search game data by name or keyword.';
					input.focus();
				} else {
					statusEl.textContent = 'Use the top search bar to search game data.';
				}
			}
		})
		.catch((err: unknown) => {
			loading = false;
			const msg = err instanceof Error ? err.message : 'Unknown error';
			statusEl.textContent = `Could not load search index: ${msg}`;
			if (input) input.disabled = true;
		});

	function announce(message: string): void {
		if (liveEl) liveEl.textContent = message;
	}

	function renderResults(term: string): void {
		if (!db) return;
		const q = term.trim();
		if (q.length === 0) {
			resultsEl.innerHTML = '';
			announce('');
			return;
		}

		const res = search(db, {
			term: q,
			limit: SEARCH_LIMIT,
			properties: ['title', 'content', 'subtitle'],
		});

		const hits = res.hits.filter(Boolean) as {
			document: GameDataDoc;
		}[];
		if (hits.length === 0) {
			resultsEl.innerHTML = `<p class="text-fg-muted mt-4">No results for “${escapeHtml(q)}”.</p>`;
			announce(`No results for ${q}`);
			return;
		}

		const byType = new Map<OramaDataSearchType, GameDataDoc[]>();
		for (const t of ORAMA_DATA_SEARCH_TYPE_ORDER) {
			byType.set(t, []);
		}
		for (const h of hits) {
			const doc = h.document;
			const list = byType.get(doc.type);
			if (list) list.push(doc);
		}

		const parts: string[] = [];
		for (const type of ORAMA_DATA_SEARCH_TYPE_ORDER) {
			const group = byType.get(type);
			if (!group || group.length === 0) continue;
			const label = ORAMA_DATA_SEARCH_TYPE_LABELS[type];
			parts.push(
				`<section class="mt-6 border-t border-hairline pt-4 first:mt-0 first:border-t-0 first:pt-0" aria-labelledby="orama-section-${type}">`,
				`<h2 class="text-lg font-semibold text-fg" id="orama-section-${type}">${escapeHtml(label)}</h2>`,
				`<ul class="mt-2 space-y-2 list-none p-0">`,
			);
			for (const doc of group) {
				const sub = doc.subtitle ? ` — ${escapeHtml(doc.subtitle)}` : '';
				const link = doc.href
					? `<a href="${escapeHtml(doc.href)}" class="text-fg font-medium underline decoration-fg/30 underline-offset-2 hover:decoration-fg">${escapeHtml(doc.title)}</a>${sub}`
					: `<span class="text-fg font-medium">${escapeHtml(doc.title)}</span>${sub}`;
				parts.push(`<li class="text-sm text-fg-muted">${link}</li>`);
			}
			parts.push('</ul></section>');
		}

		resultsEl.innerHTML = parts.join('');
		announce(`${hits.length} result${hits.length === 1 ? '' : 's'} for ${q}`);
	}

	if (!input) return;

	const run = debounce(() => {
		if (loading || !db) return;
		renderResults(input.value);
	}, DEBOUNCE_MS);

	input.addEventListener('input', run);
	input.addEventListener('search', () => {
		if (input.value === '') {
			resultsEl.innerHTML = '';
			announce('');
		}
	});
}
