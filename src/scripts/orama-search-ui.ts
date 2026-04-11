import { create, load, search, type RawData } from '@orama/orama';
import {
	ORAMA_DATA_SEARCH_TYPE_LABELS,
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
const QUICK_SEARCH_LIMIT = 10;
const DEBOUNCE_MS = 200;

const ORAMA_SCHEMA = {
	id: 'string',
	type: 'string',
	title: 'string',
	content: 'string',
	href: 'string',
	subtitle: 'string',
} as const;

export type OramaDataSearchDb = ReturnType<typeof create>;

let dbPromise: Promise<OramaDataSearchDb> | undefined;

export function getOramaDataSearchDb(): Promise<OramaDataSearchDb> {
	if (!dbPromise) {
		dbPromise = (async () => {
			const r = await fetch(INDEX_URL);
			if (!r.ok) throw new Error(`Failed to load index (${r.status})`);
			const raw = (await r.json()) as RawData;
			const instance = create({ schema: ORAMA_SCHEMA });
			load(instance, raw);
			return instance;
		})();
	}
	return dbPromise;
}

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

export type OramaQuickSearchOptions = {
	input: HTMLInputElement;
	panel: HTMLElement;
	/** Max hits (default 10). */
	limit?: number;
};

/**
 * Typeahead under a search input: debounced Orama query, compact link list, dismiss on
 * click-outside / Escape. Form submit (Enter) is unchanged.
 */
export function initOramaQuickSearch(options: OramaQuickSearchOptions): void {
	const { input, panel } = options;
	const limit = options.limit ?? QUICK_SEARCH_LIMIT;
	const root =
		input.closest('form') ?? input.parentElement ?? panel.parentElement;

	let activeIndex = -1;

	const getOptionAnchors = (): HTMLAnchorElement[] =>
		Array.from(panel.querySelectorAll<HTMLAnchorElement>('a.ss-quick-link[href]'));

	const syncActiveClasses = (): void => {
		const opts = getOptionAnchors();
		for (const a of opts) {
			a.classList.remove('ss-quick-link--active');
			a.removeAttribute('aria-selected');
		}
		if (activeIndex < 0 || activeIndex >= opts.length) {
			activeIndex = -1;
			input.removeAttribute('aria-activedescendant');
			return;
		}
		const el = opts[activeIndex];
		el.classList.add('ss-quick-link--active');
		el.setAttribute('aria-selected', 'true');
		if (el.id) input.setAttribute('aria-activedescendant', el.id);
		el.scrollIntoView({ block: 'nearest' });
	};

	const setActive = (index: number): void => {
		const opts = getOptionAnchors();
		if (opts.length === 0) {
			activeIndex = -1;
			input.removeAttribute('aria-activedescendant');
			return;
		}
		activeIndex = Math.max(-1, Math.min(index, opts.length - 1));
		syncActiveClasses();
	};

	const hide = (): void => {
		panel.hidden = true;
		panel.innerHTML = '';
		input.removeAttribute('aria-expanded');
		activeIndex = -1;
		input.removeAttribute('aria-activedescendant');
	};

	if (panel.id) {
		input.setAttribute('aria-controls', panel.id);
	}

	const renderQuick = (term: string, db: OramaDataSearchDb): void => {
		const q = term.trim();
		if (q.length === 0) {
			hide();
			return;
		}

		const res = search(db, {
			term: q,
			limit,
			properties: ['title', 'content', 'subtitle'],
		});

		const hits = res.hits.filter(Boolean) as {
			document: GameDataDoc;
		}[];

		const typeLabel = (t: OramaDataSearchType) =>
			ORAMA_DATA_SEARCH_TYPE_LABELS[t] ?? t;

		if (hits.length === 0) {
			panel.innerHTML = `<p class="ss-quick-empty px-3 py-2 text-left text-sm text-fg-muted">No results for “${escapeHtml(q)}”.</p>`;
			panel.hidden = false;
			input.setAttribute('aria-expanded', 'true');
			activeIndex = -1;
			input.removeAttribute('aria-activedescendant');
			return;
		}

		const parts: string[] = [
			`<ul class="ss-quick-list m-0 list-none divide-y divide-hairline p-0 text-left" role="listbox">`,
		];
		let optNum = 0;
		for (const h of hits) {
			const doc = h.document;
			const kind = escapeHtml(typeLabel(doc.type));
			const title = escapeHtml(doc.title);
			if (doc.href) {
				const optId = `${panel.id}-opt-${optNum}`;
				optNum += 1;
				parts.push(
					`<li role="presentation">`,
					`<a role="option" id="${escapeHtml(optId)}" class="ss-quick-link flex flex-col items-start gap-0.5 px-3 py-2 text-left no-underline hover:bg-gray-200/80 dark:hover:bg-gray-800/80" href="${escapeHtml(doc.href)}">`,
					`<span class="text-[0.65rem] font-medium uppercase tracking-wide text-fg-muted leading-none">${kind}</span>`,
					`<span class="text-sm font-medium text-fg">${title}</span>`,
					`</a>`,
					`</li>`,
				);
			} else {
				parts.push(
					`<li role="presentation" class="px-3 py-2 text-left">`,
					`<span class="text-[0.65rem] font-medium uppercase tracking-wide text-fg-muted">${kind}</span>`,
					`<span class="mt-0.5 block text-sm font-medium text-fg">${title}</span>`,
					`</li>`,
				);
			}
		}
		parts.push('</ul>');
		panel.innerHTML = parts.join('');
		panel.hidden = false;
		input.setAttribute('aria-expanded', 'true');
		activeIndex = -1;
		input.removeAttribute('aria-activedescendant');
	};

	const run = debounce(() => {
		const q = input.value;
		if (q.trim().length === 0) {
			hide();
			return;
		}
		getOramaDataSearchDb()
			.then((db) => {
				renderQuick(q, db);
			})
			.catch(() => {
				panel.innerHTML = `<p class="ss-quick-empty px-3 py-2 text-left text-sm text-danger">Could not load search.</p>`;
				panel.hidden = false;
				input.setAttribute('aria-expanded', 'true');
				activeIndex = -1;
				input.removeAttribute('aria-activedescendant');
			});
	}, DEBOUNCE_MS);

	input.addEventListener('input', run);
	input.addEventListener('search', () => {
		if (input.value === '') hide();
	});
	input.addEventListener('keydown', (e) => {
		if (e.key === 'Escape') {
			hide();
			return;
		}

		const opts = getOptionAnchors();
		const panelOpen = !panel.hidden && opts.length > 0;

		if (e.key === 'ArrowDown' && panelOpen) {
			e.preventDefault();
			if (activeIndex < opts.length - 1) setActive(activeIndex + 1);
			else if (activeIndex === -1) setActive(0);
			return;
		}

		if (e.key === 'ArrowUp' && panelOpen) {
			e.preventDefault();
			if (activeIndex === -1) setActive(opts.length - 1);
			else setActive(activeIndex - 1);
			return;
		}

		if (e.key === 'Enter' && activeIndex >= 0 && panelOpen) {
			const a = opts[activeIndex];
			if (a?.href) {
				e.preventDefault();
				window.location.assign(a.href);
			}
			return;
		}
	});

	panel.addEventListener('mouseover', (e) => {
		if (panel.hidden) return;
		const t = e.target;
		if (!(t instanceof Element)) return;
		const a = t.closest('a.ss-quick-link');
		if (!a || !panel.contains(a)) return;
		const opts = getOptionAnchors();
		const idx = opts.indexOf(a as HTMLAnchorElement);
		if (idx >= 0) {
			activeIndex = idx;
			syncActiveClasses();
		}
	});

	const onDocClick = (e: MouseEvent): void => {
		if (panel.hidden) return;
		const t = e.target as Node | null;
		if (!t || !root || root.contains(t)) return;
		hide();
	};
	document.addEventListener('click', onDocClick, true);
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

	let db: OramaDataSearchDb | undefined;
	let loading = true;

	statusEl.textContent = 'Loading search index…';

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

		const typeLabel = (t: OramaDataSearchType) =>
			ORAMA_DATA_SEARCH_TYPE_LABELS[t] ?? t;

		const parts: string[] = [
			`<ul class="mt-3 list-none divide-y divide-hairline p-0">`,
		];
		for (const h of hits) {
			const doc = h.document;
			const kind = escapeHtml(typeLabel(doc.type));
			const sub = doc.subtitle ? ` — ${escapeHtml(doc.subtitle)}` : '';
			const link = doc.href
				? `<a href="${escapeHtml(doc.href)}" class="text-fg font-medium underline decoration-fg/30 underline-offset-2 hover:decoration-fg">${escapeHtml(doc.title)}</a>${sub}`
				: `<span class="text-fg font-medium">${escapeHtml(doc.title)}</span>${sub}`;
			parts.push(
				`<li class="flex flex-col gap-0.5 py-2">`,
				`<div class="text-xs font-medium uppercase tracking-wide text-fg-muted leading-none">${kind}</div>`,
				`<div class="text-sm leading-snug text-fg-muted">${link}</div>`,
				`</li>`,
			);
		}
		parts.push('</ul>');

		resultsEl.innerHTML = parts.join('');
		announce(`${hits.length} result${hits.length === 1 ? '' : 's'} for ${q}`);
	}

	getOramaDataSearchDb()
		.then((instance) => {
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
