import { search } from '@orama/orama';
import {
	ORAMA_SEARCH_DEBOUNCE_MS,
	ORAMA_DATA_SEARCH_TYPE_LABELS_SINGULAR,
	type OramaDataSearchType,
} from '../constants/orama-data-search';
import type { SearchableGameDataDoc } from '../models/orama-game-data-index';
import { quickSearchSecondLine } from './quickSearchSecondLine';
import {
	getOramaDataSearchDb,
	type OramaDataSearchDb,
} from './orama-search-db';

type GameDataDoc = SearchableGameDataDoc;

const QUICK_SEARCH_LIMIT = 10;

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
			ORAMA_DATA_SEARCH_TYPE_LABELS_SINGULAR[t] ?? t;

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
			const descRaw = quickSearchSecondLine(doc);
			const desc = escapeHtml(descRaw);
			const descLine =
				descRaw !== ''
					? `<span class="mt-0.5 block w-full text-sm leading-snug text-fg-muted line-clamp-2">${desc}</span>`
					: '';
			if (doc.href) {
				const optId = `${panel.id}-opt-${optNum}`;
				optNum += 1;
				parts.push(
					`<li role="presentation">`,
					`<a role="option" id="${escapeHtml(optId)}" class="ss-quick-link flex flex-col items-start gap-0 px-3 py-2 text-left no-underline hover:bg-gray-200/80 dark:hover:bg-gray-800/80" href="${escapeHtml(doc.href)}">`,
					`<span class="text-[0.65rem] font-medium uppercase tracking-wide text-fg-muted leading-none">${kind}</span>`,
					`<span class="text-sm font-medium leading-tight text-fg">${title}</span>`,
					descLine,
					`</a>`,
					`</li>`,
				);
			} else {
				parts.push(
					`<li role="presentation" class="px-3 py-2 text-left">`,
					`<span class="text-[0.65rem] font-medium uppercase tracking-wide text-fg-muted">${kind}</span>`,
					`<span class="mt-0.5 block text-sm font-medium leading-tight text-fg">${title}</span>`,
					descLine,
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
	}, ORAMA_SEARCH_DEBOUNCE_MS);

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

export type { OramaDataSearchDb } from './orama-search-db';
