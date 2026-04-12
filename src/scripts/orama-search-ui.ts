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
} {
	const params = new URLSearchParams(window.location.search);
	const q = params.get('q')?.trim() ?? '';
	return { q, type: parseTypeFromSearchParams(params) };
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
	options?: { replace?: boolean },
): void {
	const params = new URLSearchParams(window.location.search);
	if (q.length > 0) params.set('q', q);
	else params.delete('q');
	if (type) params.set('type', type);
	else params.delete('type');
	const query = params.toString();
	const next = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`;
	if (
		next !==
		`${window.location.pathname}${window.location.search}${window.location.hash}`
	) {
		const method = options?.replace ? 'replaceState' : 'pushState';
		window.history[method]({}, '', next);
	}
}

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
	const statusEl = root.querySelector<HTMLElement>(
		'[data-orama-search-status]',
	);
	const liveEl = root.querySelector<HTMLElement>('[data-orama-search-live]');
	const typeFilterBarEl = root.querySelector<HTMLElement>(
		'[data-orama-type-filter-bar]',
	);

	if (!resultsEl || !statusEl) return;

	let db: OramaDataSearchDb | undefined;
	let loading = true;
	let activeType: OramaDataSearchType | null = null;

	statusEl.textContent = 'Loading search index…';

	function announce(message: string): void {
		if (liveEl) liveEl.textContent = message;
	}

	function typeFilterLabel(t: OramaDataSearchType): string {
		return ORAMA_DATA_SEARCH_TYPE_LABELS[t] ?? t;
	}

	function updateStatusLine(q: string, type: OramaDataSearchType | null): void {
		const typePhrase = type ? typeFilterLabel(type) : null;
		if (q.length > 0) {
			statusEl.textContent = typePhrase
				? `Showing ${typePhrase.toLowerCase()} results for “${q}”.`
				: `Showing results for “${q}”.`;
			return;
		}
		if (typePhrase) {
			statusEl.textContent = `Showing ${typePhrase.toLowerCase()} entries (add a search term to narrow further).`;
			return;
		}
		if (input) {
			statusEl.textContent = 'Search game data by name or keyword.';
		} else {
			statusEl.textContent = 'Use the top search bar to search game data.';
		}
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

		const refs = typeFilterLayoutRefs;
		if (refs?.moreBtn) {
			const holds =
				activeType !== null &&
				refs.typeBtns.some(
					(b) =>
						refs.morePanel.contains(b) &&
						b.getAttribute('data-orama-type-filter') === activeType,
				);
			if (holds) refs.moreBtn.setAttribute('data-more-holds-selection', '');
			else refs.moreBtn.removeAttribute('data-more-holds-selection');
		}
	}

	const TYPE_FILTER_PILL_CLASS =
		'orama-type-filter-pill inline-flex shrink-0 items-center justify-center rounded-full border border-hairline bg-surface px-3 py-1.5 text-sm text-fg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800/80';
	const TYPE_FILTER_MENUITEM_CLASS =
		'orama-type-filter-menu-item flex w-full min-w-[10rem] items-center rounded-none border-0 bg-transparent px-3 py-2.5 text-left text-sm text-fg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800/80';

	let typeFilterLayoutRefs: {
		primaryRow: HTMLElement;
		moreWrap: HTMLElement;
		moreBtn: HTMLButtonElement;
		morePanel: HTMLElement;
		allBtn: HTMLButtonElement;
		typeBtns: HTMLButtonElement[];
	} | null = null;
	let typeFilterMoreOpen = false;
	let typeFilterLayoutObserver: ResizeObserver | undefined;

	function setTypeFilterMoreOpen(open: boolean): void {
		typeFilterMoreOpen = open;
		const refs = typeFilterLayoutRefs;
		if (!refs) return;
		refs.moreBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
		refs.morePanel.classList.toggle('hidden', !open);
		refs.morePanel.setAttribute('aria-hidden', open ? 'false' : 'true');
	}

	function closeTypeFilterMore(): void {
		setTypeFilterMoreOpen(false);
	}

	function syncTypeFilterChipPresentation(): void {
		const refs = typeFilterLayoutRefs;
		if (!refs) return;
		const { morePanel, typeBtns } = refs;
		for (const b of typeBtns) {
			if (morePanel.contains(b)) {
				b.className = TYPE_FILTER_MENUITEM_CLASS;
				b.setAttribute('role', 'menuitem');
			} else {
				b.className = TYPE_FILTER_PILL_CLASS;
				b.removeAttribute('role');
			}
		}
	}

	function layoutTypeFilterOverflow(): void {
		const refs = typeFilterLayoutRefs;
		const bar = typeFilterBarEl;
		if (!refs || !bar) return;

		const { primaryRow, moreWrap, morePanel, allBtn, typeBtns } = refs;
		const gapPx = 8;
		const barWidth = bar.getBoundingClientRect().width;
		if (barWidth <= 0) return;

		// Try everything in one row without "More".
		moreWrap.classList.add('hidden');
		moreWrap.classList.remove('flex');
		primaryRow.replaceChildren(allBtn, ...typeBtns);
		morePanel.replaceChildren();
		syncTypeFilterChipPresentation();

		const rowGap = gapPx;
		const sumPrimaryWidth = (): number => {
			let w = 0;
			for (const el of primaryRow.children) {
				w += (el as HTMLElement).offsetWidth;
			}
			w += Math.max(0, primaryRow.children.length - 1) * rowGap;
			return w;
		};

		if (sumPrimaryWidth() <= barWidth + 0.5) {
			closeTypeFilterMore();
			syncTypeFilterButtonState();
			return;
		}

		moreWrap.classList.remove('hidden');
		moreWrap.classList.add('flex');

		let low = 0;
		let high = typeBtns.length;
		let best = 0;
		while (low <= high) {
			const mid = Math.floor((low + high) / 2);
			primaryRow.replaceChildren(allBtn, ...typeBtns.slice(0, mid));
			morePanel.replaceChildren(...typeBtns.slice(mid));
			syncTypeFilterChipPresentation();
			void primaryRow.offsetWidth;
			void moreWrap.offsetWidth;
			const primaryW = sumPrimaryWidth();
			const moreW = moreWrap.offsetWidth;
			if (primaryW + gapPx + moreW <= barWidth + 0.5) {
				best = mid;
				low = mid + 1;
			} else {
				high = mid - 1;
			}
		}

		primaryRow.replaceChildren(allBtn, ...typeBtns.slice(0, best));
		morePanel.replaceChildren(...typeBtns.slice(best));
		syncTypeFilterChipPresentation();

		closeTypeFilterMore();
		syncTypeFilterButtonState();
	}

	function scheduleTypeFilterLayout(): void {
		requestAnimationFrame(() => layoutTypeFilterOverflow());
	}

	function renderTypeFilterBar(): void {
		if (!typeFilterBarEl) return;

		typeFilterLayoutObserver?.disconnect();
		closeTypeFilterMore();

		const bar = typeFilterBarEl;
		bar.classList.remove('hidden');
		bar.classList.add('block');

		const outer = document.createElement('div');
		outer.className = 'flex min-w-0 items-stretch gap-2';

		const primaryRow = document.createElement('div');
		primaryRow.className =
			'flex min-w-0 flex-1 flex-nowrap items-stretch gap-2 overflow-hidden';
		primaryRow.setAttribute('data-orama-type-filter-primary', '');

		const moreWrap = document.createElement('div');
		moreWrap.className = 'relative hidden shrink-0 self-stretch';
		moreWrap.setAttribute('data-orama-type-filter-more-wrap', '');

		const moreBtn = document.createElement('button');
		moreBtn.type = 'button';
		moreBtn.className = `${TYPE_FILTER_PILL_CLASS} h-full gap-1`;
		moreBtn.setAttribute('data-orama-type-more-toggle', '');
		moreBtn.setAttribute('aria-expanded', 'false');
		moreBtn.setAttribute('aria-haspopup', 'true');
		const morePanelId = `orama-type-more-${Math.random().toString(36).slice(2, 9)}`;
		moreBtn.setAttribute('aria-controls', morePanelId);
		moreBtn.innerHTML = `<span>More</span><span class="text-fg-muted" aria-hidden="true">▾</span>`;

		const morePanel = document.createElement('div');
		morePanel.id = morePanelId;
		morePanel.setAttribute('data-orama-type-more-panel', '');
		morePanel.className =
			'border-hairline bg-surface absolute top-full right-0 z-50 mt-1 hidden min-w-[11rem] flex-col divide-y divide-hairline overflow-hidden rounded-lg border py-0 shadow-lg';
		morePanel.setAttribute('role', 'menu');
		morePanel.setAttribute('aria-hidden', 'true');

		const allBtn = document.createElement('button');
		allBtn.type = 'button';
		allBtn.className = TYPE_FILTER_PILL_CLASS;
		allBtn.setAttribute('data-orama-type-filter', '');
		allBtn.setAttribute('aria-pressed', 'false');
		allBtn.textContent = 'All';

		const typeBtns: HTMLButtonElement[] = [];
		for (const t of ORAMA_DATA_SEARCH_TYPE_ORDER) {
			const b = document.createElement('button');
			b.type = 'button';
			b.className = TYPE_FILTER_PILL_CLASS;
			b.setAttribute('data-orama-type-filter', t);
			b.setAttribute('aria-pressed', 'false');
			b.textContent = typeFilterLabel(t);
			typeBtns.push(b);
		}

		moreWrap.append(moreBtn, morePanel);
		outer.append(primaryRow, moreWrap);
		bar.replaceChildren(outer);

		typeFilterLayoutRefs = {
			primaryRow,
			moreWrap,
			moreBtn,
			morePanel,
			allBtn,
			typeBtns,
		};

		moreBtn.addEventListener('click', (e) => {
			e.preventDefault();
			e.stopPropagation();
			setTypeFilterMoreOpen(!typeFilterMoreOpen);
		});

		typeFilterLayoutObserver = new ResizeObserver(() =>
			scheduleTypeFilterLayout(),
		);
		typeFilterLayoutObserver.observe(bar);

		ensureTypeFilterBarGlobalListeners(bar);

		syncTypeFilterButtonState();
		scheduleTypeFilterLayout();
	}

	let typeFilterBarGlobalListenersBound = false;

	function ensureTypeFilterBarGlobalListeners(bar: HTMLElement): void {
		if (typeFilterBarGlobalListenersBound) return;
		typeFilterBarGlobalListenersBound = true;

		document.addEventListener(
			'click',
			(e) => {
				if (!typeFilterMoreOpen) return;
				const refs = typeFilterLayoutRefs;
				if (!refs) return;
				const t = e.target as Node | null;
				if (t && refs.moreWrap.contains(t)) return;
				closeTypeFilterMore();
			},
			true,
		);

		bar.addEventListener('keydown', (e) => {
			if (e.key === 'Escape' && typeFilterMoreOpen) {
				e.stopPropagation();
				closeTypeFilterMore();
				typeFilterLayoutRefs?.moreBtn.focus();
			}
		});
	}

	function renderResults(term: string): void {
		if (!db) return;
		const q = term.trim();
		const typeWhere = activeType ? { type: activeType } : undefined;

		if (q.length === 0 && !activeType) {
			resultsEl.innerHTML = '';
			announce('');
			return;
		}

		const res =
			q.length > 0
				? search(db, {
						term: q,
						limit: SEARCH_LIMIT,
						properties: ['title', 'content', 'subtitle'],
						...(typeWhere ? { where: typeWhere } : {}),
					})
				: search(db, {
						limit: SEARCH_LIMIT,
						...(typeWhere ? { where: typeWhere } : {}),
					});

		const hits = res.hits.filter(Boolean) as {
			document: GameDataDoc;
		}[];

		const emptyMsg =
			q.length > 0
				? activeType
					? `No ${typeFilterLabel(activeType).toLowerCase()} results for “${escapeHtml(q)}”.`
					: `No results for “${escapeHtml(q)}”.`
				: `No ${typeFilterLabel(activeType!).toLowerCase()} entries in the index.`;

		if (hits.length === 0) {
			resultsEl.innerHTML = `<p class="text-fg-muted mt-4">${emptyMsg}</p>`;
			announce(emptyMsg.replace(/<[^>]+>/g, ''));
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
		if (q.length > 0) {
			announce(`${hits.length} result${hits.length === 1 ? '' : 's'} for ${q}`);
		} else if (activeType) {
			const kind = typeFilterLabel(activeType);
			announce(
				`${hits.length} ${kind} ${hits.length === 1 ? 'entry' : 'entries'}`,
			);
		} else {
			announce(`${hits.length} result${hits.length === 1 ? '' : 's'}`);
		}
	}

	function applyFromLocation(): void {
		const { q, type } = readSearchPageParams();
		activeType = type;
		if (input && q.length > 0) {
			input.value = q;
		}
		updateStatusLine(q, activeType);
		syncTypeFilterButtonState();
		if (db) renderResults(q);
	}

	getOramaDataSearchDb()
		.then((instance) => {
			db = instance;
			loading = false;
			stripInvalidTypeFromUrl();
			const { q, type } = readSearchPageParams();
			activeType = type;
			renderTypeFilterBar();
			if (input) {
				input.disabled = false;
				if (q.length > 0) {
					input.value = q;
				} else {
					input.focus();
				}
			}
			updateStatusLine(q, activeType);
			renderResults(q);
		})
		.catch((err: unknown) => {
			loading = false;
			const msg = err instanceof Error ? err.message : 'Unknown error';
			statusEl.textContent = `Could not load search index: ${msg}`;
			if (input) input.disabled = true;
		});

	if (typeFilterBarEl) {
		typeFilterBarEl.addEventListener('click', (e) => {
			const t = e.target;
			if (!(t instanceof Element)) return;
			if (t.closest('[data-orama-type-more-toggle]')) return;
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
			closeTypeFilterMore();
			const q = (
				input?.value ??
				new URLSearchParams(window.location.search).get('q') ??
				''
			).trim();
			setSearchPageUrl(q, activeType, { replace: false });
			updateStatusLine(q, activeType);
			syncTypeFilterButtonState();
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
		setSearchPageUrl(q, activeType, { replace: true });
		updateStatusLine(q, activeType);
		syncTypeFilterButtonState();
		renderResults(input.value);
	}, DEBOUNCE_MS);

	input.addEventListener('input', run);
	input.addEventListener('search', () => {
		if (input.value === '') {
			setSearchPageUrl('', activeType, { replace: true });
			updateStatusLine('', activeType);
			syncTypeFilterButtonState();
			renderResults('');
		}
	});
}
