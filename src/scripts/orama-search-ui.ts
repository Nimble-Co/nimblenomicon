import { create, load, search, type RawData } from '@orama/orama';
import {
	ORAMA_DATA_SEARCH_TYPE_LABELS,
	ORAMA_DATA_SEARCH_TYPE_ORDER,
	type OramaDataSearchType,
} from '../constants/orama-data-search';
import {
	applySearchFiltersToParams,
	buildOramaWhereForFilters,
	clearAllSearchFilterParams,
	clearMultiFilterDim,
	documentMatchesFilters,
	emptySearchFiltersState,
	initialFiltersForType,
	filterKeysForType,
	hasAnyActiveFilters,
	parseSearchFiltersFromParams,
	setMultiFilterValue,
	stripSearchFilterParamsNotForType,
	type MultiSelectFilterDim,
	type SearchFiltersState,
	type SearchableGameDataDoc,
} from '../models/search-filters';
import {
	patchSearchFiltersState,
	renderCollapsedTypeDropdown,
	renderSecondaryFilters,
	typeFilterLabel,
	type RenderSecondaryFiltersOptions,
} from './orama-search-toolbar';

type GameDataDoc = SearchableGameDataDoc;

const INDEX_URL = '/orama-data-search.json';
const SEARCH_LIMIT = 80;
/** When filters are active, retrieve more hits before post-filter (class key stats). */
const SEARCH_LIMIT_FILTERED = 500;
/** No query + “All” types: show this many random docs from a larger pool. */
const BROWSE_RANDOM_COUNT = 50;
const BROWSE_RANDOM_POOL = 500;
const QUICK_SEARCH_LIMIT = 10;
const DEBOUNCE_MS = 200;

const ORAMA_DATA_SEARCH_TYPES = new Set<string>(ORAMA_DATA_SEARCH_TYPE_ORDER);

function parseTypeFromSearchParams(
	params: URLSearchParams,
): OramaDataSearchType | null {
	const raw = params.get('type')?.trim().toLowerCase();
	if (!raw) return null;
	return ORAMA_DATA_SEARCH_TYPES.has(raw) ? (raw as OramaDataSearchType) : null;
}

function readSearchPageParams(): {
	q: string;
	type: OramaDataSearchType | null;
	filters: SearchFiltersState;
} {
	const params = new URLSearchParams(window.location.search);
	const q = params.get('q')?.trim() ?? '';
	const type = parseTypeFromSearchParams(params);
	const filters = parseSearchFiltersFromParams(type, params);
	return { q, type, filters };
}

function stripInvalidTypeFromUrl(): void {
	const params = new URLSearchParams(window.location.search);
	const raw = params.get('type')?.trim();
	if (!raw) return;
	if (ORAMA_DATA_SEARCH_TYPES.has(raw.toLowerCase())) return;
	params.delete('type');
	const query = params.toString();
	const next = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`;
	window.history.replaceState({}, '', next);
}

function setSearchPageUrl(
	q: string,
	type: OramaDataSearchType | null,
	filters: SearchFiltersState,
	options?: { replace?: boolean },
): void {
	const params = new URLSearchParams(window.location.search);
	if (q.length > 0) params.set('q', q);
	else params.delete('q');
	if (type) params.set('type', type);
	else params.delete('type');
	stripSearchFilterParamsNotForType(params, type);
	applySearchFiltersToParams(type, filters, params);
	const query = params.toString();
	const next = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`;
	if (
		next !==
		`${window.location.pathname}${window.location.search}${window.location.hash}`
	) {
		const method = options?.replace ? 'replaceState' : 'pushState';
		window.history[method]({}, '', next);
	}
	dispatchSearchUrlUpdated();
}

const ORAMA_SCHEMA = {
	id: 'string',
	type: 'string',
	title: 'string',
	content: 'string',
	href: 'string',
	subtitle: 'string',
	spellTier: 'string',
	spellSchool: 'string',
	spellTarget: 'string',
	spellUtility: 'string',
	spellSecret: 'string',
	monsterLevel: 'string',
	monsterFamily: 'string',
	monsterKind: 'string',
	monsterArmor: 'string',
	monsterSpeed: 'string',
	monsterSize: 'string',
	monsterMinion: 'string',
	monsterLegendary: 'string',
	classKeyStats: 'string',
	classHitDie: 'string',
	weaponCategory: 'string',
	ancestrySection: 'string',
	ancestrySize: 'string',
	armorCategory: 'string',
	magicKind: 'string',
	magicSource: 'string',
	magicReward: 'string',
} as const;

export const SEARCH_URL_UPDATE_EVENT = 'nimble-search-url-update';

let searchToolbarOutsideClickBound = false;
let filterDetailsOutsideClickBound = false;

function dispatchSearchUrlUpdated(): void {
	window.dispatchEvent(new CustomEvent(SEARCH_URL_UPDATE_EVENT));
}

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

function shuffleBrowseDocs<T>(items: T[]): T[] {
	const a = items.slice();
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j]!, a[i]!];
	}
	return a;
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
		Array.from(
			panel.querySelectorAll<HTMLAnchorElement>('a.ss-quick-link[href]'),
		);

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

	panel.addEventListener('mouseleave', () => {
		if (panel.hidden) return;
		activeIndex = -1;
		syncActiveClasses();
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
	const liveEl = root.querySelector<HTMLElement>('[data-orama-search-live]');
	const typeFilterBarEl = root.querySelector<HTMLElement>(
		'[data-orama-type-filter-bar]',
	);

	if (!resultsEl) return;

	let db: OramaDataSearchDb | undefined;
	let loading = true;
	let activeType: OramaDataSearchType | null = null;
	let activeFilters: SearchFiltersState = emptySearchFiltersState();
	/** After checkbox change, re-open the same `<details>` dropdown (see `renderSecondaryFilters`). */
	let pendingOpenFilterDropdown: MultiSelectFilterDim | null = null;

	const secondaryWrapEl = root.querySelector<HTMLElement>(
		'[data-orama-secondary-wrap]',
	);
	const toolbarRowEl = root.querySelector<HTMLElement>(
		'[data-orama-toolbar-row]',
	);

	function announce(message: string): void {
		if (liveEl) liveEl.textContent = message;
	}

	function syncTypeFilterButtonState(): void {
		if (!typeFilterBarEl) return;
		const buttons = typeFilterBarEl.querySelectorAll<HTMLButtonElement>(
			'[data-orama-type-filter]',
		);
		for (const btn of buttons) {
			const v = btn.getAttribute('data-orama-type-filter');
			const pressed =
				(activeType === null && (v === '' || v === null)) ||
				(activeType !== null && v === activeType);
			btn.setAttribute('aria-pressed', pressed ? 'true' : 'false');
			btn.setAttribute('data-pressed', pressed ? 'true' : 'false');
		}
	}

	let collapsedTypeDropdownOpen = false;
	let collapsedTypeRefs: {
		wrap: HTMLElement;
		toggleBtn: HTMLButtonElement;
		panel: HTMLElement;
	} | null = null;

	function setCollapsedTypeDropdownOpen(open: boolean): void {
		collapsedTypeDropdownOpen = open;
		if (!collapsedTypeRefs) return;
		collapsedTypeRefs.toggleBtn.setAttribute(
			'aria-expanded',
			open ? 'true' : 'false',
		);
		collapsedTypeRefs.panel.classList.toggle('hidden', !open);
		collapsedTypeRefs.panel.setAttribute(
			'aria-hidden',
			open ? 'false' : 'true',
		);
	}

	function closeCollapsedTypeDropdown(): void {
		setCollapsedTypeDropdownOpen(false);
	}

	function renderSearchChrome(): void {
		if (!typeFilterBarEl) return;

		const reopenFilterDropdown = pendingOpenFilterDropdown;
		pendingOpenFilterDropdown = null;

		closeCollapsedTypeDropdown();
		collapsedTypeRefs = null;

		const bar = typeFilterBarEl;

		if (activeType === null) {
			toolbarRowEl?.classList.add('hidden');
			bar.replaceChildren();
			if (secondaryWrapEl) {
				secondaryWrapEl.classList.add('hidden');
				secondaryWrapEl.innerHTML = '';
			}
			syncTypeFilterButtonState();
			return;
		}

		toolbarRowEl?.classList.remove('hidden');
		bar.classList.remove('hidden');
		bar.classList.add('block');

		const { outer, refs } = renderCollapsedTypeDropdown(activeType);
		collapsedTypeRefs = refs;
		bar.replaceChildren(outer);
		refs.toggleBtn.addEventListener('click', (e) => {
			e.preventDefault();
			e.stopPropagation();
			setCollapsedTypeDropdownOpen(!collapsedTypeDropdownOpen);
		});

		if (secondaryWrapEl) {
			if (filterKeysForType(activeType).length > 0) {
				secondaryWrapEl.classList.remove('hidden');
				const secondaryOpts: RenderSecondaryFiltersOptions | undefined =
					reopenFilterDropdown !== null
						? { openDropdownDim: reopenFilterDropdown }
						: undefined;
				secondaryWrapEl.replaceChildren(
					renderSecondaryFilters(activeType, activeFilters, secondaryOpts),
				);
			} else {
				secondaryWrapEl.classList.add('hidden');
				secondaryWrapEl.innerHTML = '';
			}
		}

		syncTypeFilterButtonState();
	}

	function renderResults(term: string): void {
		if (!db) return;
		const q = term.trim();

		const browseAllTypes = q.length === 0 && !activeType;

		let docs: GameDataDoc[];

		if (browseAllTypes) {
			const res = search(db, { limit: BROWSE_RANDOM_POOL });
			const pool = res.hits
				.filter(Boolean)
				.map((h) => h.document as GameDataDoc);
			docs = shuffleBrowseDocs(pool).slice(0, BROWSE_RANDOM_COUNT);
		} else {
			const filters = activeFilters;
			const fetchLimit =
				activeType !== null &&
				(hasAnyActiveFilters(activeType, filters) ||
					(activeType === 'class' && filters.stat.length > 0))
					? SEARCH_LIMIT_FILTERED
					: SEARCH_LIMIT;

			const builtWhere = buildOramaWhereForFilters(activeType, filters);
			const whereClause =
				activeType !== null ? (builtWhere ?? { type: activeType }) : undefined;

			const res =
				q.length > 0
					? search(db, {
							term: q,
							limit: fetchLimit,
							properties: ['title', 'content', 'subtitle'],
							...(whereClause ? { where: whereClause as never } : {}),
						})
					: search(db, {
							limit: fetchLimit,
							...(whereClause ? { where: whereClause as never } : {}),
						});

			docs = res.hits.filter(Boolean).map((h) => h.document as GameDataDoc);
			if (activeType !== null) {
				docs = docs.filter((doc) =>
					documentMatchesFilters(doc, activeType, filters),
				);
			}
			docs = docs.slice(0, SEARCH_LIMIT);
		}

		const emptyMsg = browseAllTypes
			? 'No entries in the index.'
			: q.length > 0
				? activeType
					? `No ${typeFilterLabel(activeType).toLowerCase()} results for “${escapeHtml(q)}”.`
					: `No results for “${escapeHtml(q)}”.`
				: `No ${typeFilterLabel(activeType!).toLowerCase()} entries in the index.`;

		if (docs.length === 0) {
			resultsEl.innerHTML = `<p class="text-fg-muted mt-4">${emptyMsg}</p>`;
			announce(emptyMsg.replace(/<[^>]+>/g, ''));
			return;
		}

		const typeLabel = (t: OramaDataSearchType) =>
			ORAMA_DATA_SEARCH_TYPE_LABELS[t] ?? t;

		const parts: string[] = [
			`<ul class="mt-3 list-none divide-y divide-hairline p-0">`,
		];
		for (const doc of docs) {
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
		if (browseAllTypes) {
			announce(
				`${docs.length} sample ${docs.length === 1 ? 'entry' : 'entries'}`,
			);
		} else if (q.length > 0) {
			announce(`${docs.length} result${docs.length === 1 ? '' : 's'} for ${q}`);
		} else if (activeType) {
			const kind = typeFilterLabel(activeType);
			announce(
				`${docs.length} ${kind} ${docs.length === 1 ? 'entry' : 'entries'}`,
			);
		} else {
			announce(`${docs.length} result${docs.length === 1 ? '' : 's'}`);
		}
	}

	function applyFromLocation(): void {
		const { q, type, filters } = readSearchPageParams();
		activeType = type;
		activeFilters = filters;
		if (input && q.length > 0) {
			input.value = q;
		}
		renderSearchChrome();
		if (db) renderResults(q);
	}

	getOramaDataSearchDb()
		.then((instance) => {
			db = instance;
			loading = false;
			stripInvalidTypeFromUrl();
			const { q, type, filters } = readSearchPageParams();
			activeType = type;
			activeFilters = filters;
			renderSearchChrome();
			if (input) {
				input.disabled = false;
				if (q.length > 0) {
					input.value = q;
				} else {
					input.focus();
				}
			}
			renderResults(q);
		})
		.catch((err: unknown) => {
			loading = false;
			const msg = err instanceof Error ? err.message : 'Unknown error';
			announce(`Could not load search index: ${msg}`);
			if (input) input.disabled = true;
		});

	if (!searchToolbarOutsideClickBound) {
		searchToolbarOutsideClickBound = true;
		document.addEventListener(
			'click',
			(e) => {
				if (!collapsedTypeRefs || !collapsedTypeDropdownOpen) return;
				const t = e.target as Node | null;
				if (t && collapsedTypeRefs.wrap.contains(t)) return;
				closeCollapsedTypeDropdown();
			},
			true,
		);
	}

	const secondaryWrapForDetails = secondaryWrapEl;
	if (secondaryWrapForDetails && !filterDetailsOutsideClickBound) {
		filterDetailsOutsideClickBound = true;
		document.addEventListener(
			'click',
			(e) => {
				const raw = e.target;
				if (!(raw instanceof Node)) return;
				const el =
					raw.nodeType === Node.ELEMENT_NODE
						? (raw as Element)
						: raw.parentElement;
				if (!el) return;
				if (secondaryWrapForDetails.contains(el)) {
					const inside = el.closest('details');
					if (inside && secondaryWrapForDetails.contains(inside)) {
						return;
					}
				}
				for (const d of secondaryWrapForDetails.querySelectorAll('details')) {
					d.open = false;
				}
			},
			true,
		);
	}

	if (secondaryWrapEl) {
		secondaryWrapEl.addEventListener('change', (e) => {
			const t = e.target;
			if (!(t instanceof HTMLInputElement)) return;
			if (
				t.type === 'checkbox' &&
				t.hasAttribute('data-orama-filter-utility-binary')
			) {
				if (activeType !== 'spell') return;
				activeFilters = { ...activeFilters, utility: t.checked };
				const q = (
					input?.value ??
					new URLSearchParams(window.location.search).get('q') ??
					''
				).trim();
				setSearchPageUrl(q, activeType, activeFilters, { replace: true });
				renderSearchChrome();
				if (!loading && db) renderResults(q);
				return;
			}
			if (
				t.type === 'checkbox' &&
				t.hasAttribute('data-orama-filter-secret-binary')
			) {
				if (activeType !== 'spell') return;
				activeFilters = {
					...activeFilters,
					secret: t.checked ? true : null,
				};
				const q = (
					input?.value ??
					new URLSearchParams(window.location.search).get('q') ??
					''
				).trim();
				setSearchPageUrl(q, activeType, activeFilters, { replace: true });
				renderSearchChrome();
				if (!loading && db) renderResults(q);
				return;
			}
			if (t.type !== 'checkbox' || !t.hasAttribute('data-orama-filter-multi'))
				return;
			if (activeType === null) return;
			const dim = t.getAttribute(
				'data-orama-filter-dim',
			) as MultiSelectFilterDim | null;
			const value = t.getAttribute('data-orama-filter-value') ?? '';
			if (!dim) return;
			pendingOpenFilterDropdown = dim;
			activeFilters = setMultiFilterValue(activeFilters, dim, value, t.checked);
			const q = (
				input?.value ??
				new URLSearchParams(window.location.search).get('q') ??
				''
			).trim();
			setSearchPageUrl(q, activeType, activeFilters, { replace: true });
			renderSearchChrome();
			if (!loading && db) renderResults(q);
		});

		secondaryWrapEl.addEventListener('click', (e) => {
			const t = e.target;
			if (!(t instanceof Element)) return;
			const clearDimEl = t.closest<HTMLElement>(
				'[data-orama-filter-clear-dim]',
			);
			if (clearDimEl && activeType !== null) {
				const dim = clearDimEl.getAttribute(
					'data-orama-filter-clear-dim',
				) as MultiSelectFilterDim | null;
				if (!dim) return;
				e.preventDefault();
				pendingOpenFilterDropdown = dim;
				activeFilters = clearMultiFilterDim(activeFilters, dim);
				const q = (
					input?.value ??
					new URLSearchParams(window.location.search).get('q') ??
					''
				).trim();
				setSearchPageUrl(q, activeType, activeFilters, { replace: true });
				renderSearchChrome();
				if (!loading && db) renderResults(q);
				return;
			}
			if (t.closest('[data-orama-clear-filters]')) {
				activeFilters =
					activeType !== null
						? initialFiltersForType(activeType)
						: emptySearchFiltersState();
				const q = (
					input?.value ??
					new URLSearchParams(window.location.search).get('q') ??
					''
				).trim();
				setSearchPageUrl(q, activeType, activeFilters, { replace: true });
				renderSearchChrome();
				if (!loading && db) renderResults(q);
				return;
			}
			const tri = t.closest<HTMLElement>('[data-orama-filter-tri]');
			if (tri && activeType !== null) {
				const dim = tri.getAttribute('data-orama-filter-dim') as
					| 'minion'
					| 'legendary'
					| null;
				if (!dim) return;
				activeFilters = patchSearchFiltersState(activeFilters, {
					kind: 'toggle-tri',
					dim,
				});
				const q = (
					input?.value ??
					new URLSearchParams(window.location.search).get('q') ??
					''
				).trim();
				setSearchPageUrl(q, activeType, activeFilters, { replace: true });
				renderSearchChrome();
				if (!loading && db) renderResults(q);
			}
		});
	}

	if (typeFilterBarEl) {
		typeFilterBarEl.addEventListener('click', (e) => {
			const t = e.target;
			if (!(t instanceof Element)) return;
			if (t.closest('[data-orama-collapsed-type-toggle]')) return;
			const btn = t.closest<HTMLButtonElement>('[data-orama-type-filter]');
			if (!btn || !typeFilterBarEl.contains(btn)) return;
			const raw = btn.getAttribute('data-orama-type-filter')?.trim() ?? '';
			const nextType =
				raw.length === 0
					? null
					: ORAMA_DATA_SEARCH_TYPES.has(raw)
						? (raw as OramaDataSearchType)
						: null;
			if (raw.length > 0 && nextType === null) return;
			activeType = nextType;
			activeFilters =
				nextType !== null
					? initialFiltersForType(nextType)
					: emptySearchFiltersState();
			closeCollapsedTypeDropdown();
			const q = (
				input?.value ??
				new URLSearchParams(window.location.search).get('q') ??
				''
			).trim();
			setSearchPageUrl(q, activeType, activeFilters, { replace: false });
			renderSearchChrome();
			if (!loading && db) renderResults(q);
		});
	}

	window.addEventListener('popstate', () => {
		if (loading || !db) return;
		applyFromLocation();
	});

	if (!input) return;

	const run = debounce(() => {
		if (loading || !db) return;
		const q = input.value.trim();
		setSearchPageUrl(q, activeType, activeFilters, { replace: true });
		syncTypeFilterButtonState();
		renderResults(input.value);
	}, DEBOUNCE_MS);

	input.addEventListener('input', run);
	input.addEventListener('search', () => {
		if (input.value === '') {
			setSearchPageUrl('', activeType, activeFilters, { replace: true });
			syncTypeFilterButtonState();
			renderResults('');
		}
	});
}
