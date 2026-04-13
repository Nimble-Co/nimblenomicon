/**
 * DOM helpers for the /search/ type strip (all-types pills vs collapsed dropdown) and
 * per-type secondary filter controls.
 */
import {
	ORAMA_DATA_SEARCH_TYPE_LABELS,
	ORAMA_DATA_SEARCH_TYPE_ORDER,
	type OramaDataSearchType,
} from '../constants/orama-data-search';
import type {
	MultiSelectFilterDim,
	SearchFiltersState,
} from '../models/search-filters';

export type RenderSecondaryFiltersOptions = {
	/** Re-open this dropdown after re-render (checkbox selection). */
	openDropdownDim?: MultiSelectFilterDim | null;
};
import {
	ANCESTRY_SECTION_OPTIONS,
	ARMOR_CATEGORY_OPTIONS,
	classHitDieOptions,
	classKeyStatOptions,
	MAGIC_ITEM_KIND_OPTIONS,
	MAGIC_ITEM_REWARD_OPTIONS,
	MAGIC_ITEM_SOURCE_OPTIONS,
	monsterArmorOptions,
	monsterFamilyOptions,
	monsterKindOptions,
	monsterLevelOptions,
	monsterSizeOptions,
	monsterSpeedOptions,
	spellSchoolOptions,
	spellTierOptions,
	SPELL_TARGET_FILTER_OPTIONS,
	WEAPON_CATEGORY_OPTIONS,
	ancestrySizeOptions,
} from '../models/search-filter-options';

export const TYPE_FILTER_PILL_CLASS =
	'orama-type-filter-pill shrink-0 rounded-full border border-hairline bg-surface text-sm text-fg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800/80';
export const TYPE_FILTER_PILL_ACTIVE_CLASS =
	'border-accent-500 bg-accent-500/15 text-fg font-medium dark:bg-accent-500/20';
export const TYPE_FILTER_MENUITEM_CLASS =
	'orama-type-filter-menu-item flex w-full min-w-[10rem] items-center rounded-none border-0 bg-transparent px-3 py-2.5 text-left text-sm text-fg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800/80';

export function typeFilterLabel(t: OramaDataSearchType): string {
	return ORAMA_DATA_SEARCH_TYPE_LABELS[t] ?? t;
}

function pressedPillClass(isOn: boolean): string {
	return isOn
		? `${TYPE_FILTER_PILL_CLASS} ${TYPE_FILTER_PILL_ACTIVE_CLASS}`
		: TYPE_FILTER_PILL_CLASS;
}

function multiDropdownSummaryText(
	list: string[],
	options: { value: string; label: string }[],
): string {
	if (list.length === 0) return 'Any';
	if (list.length <= 2) {
		return list
			.map((v) => options.find((o) => o.value === v)?.label ?? v)
			.join(', ');
	}
	return `${list.length} selected`;
}

function toggleStringInList(list: string[], value: string): string[] {
	const s = new Set(list);
	if (s.has(value)) s.delete(value);
	else s.add(value);
	return [...s].sort();
}

export type CollapsedTypeDropdownRefs = {
	wrap: HTMLElement;
	toggleBtn: HTMLButtonElement;
	panel: HTMLElement;
};

export function renderCollapsedTypeDropdown(activeType: OramaDataSearchType): {
	outer: HTMLElement;
	refs: CollapsedTypeDropdownRefs;
} {
	const outer = document.createElement('div');
	outer.className = 'flex min-w-0 items-center gap-2';

	const wrap = document.createElement('div');
	wrap.className = 'relative shrink-0';
	wrap.setAttribute('data-orama-collapsed-type-wrap', '');

	const toggleBtn = document.createElement('button');
	toggleBtn.type = 'button';
	toggleBtn.className = `${TYPE_FILTER_PILL_CLASS} gap-1`;
	toggleBtn.setAttribute('data-orama-collapsed-type-toggle', '');
	toggleBtn.setAttribute('aria-expanded', 'false');
	toggleBtn.setAttribute('aria-haspopup', 'true');
	const panelId = `orama-collapsed-type-${Math.random().toString(36).slice(2, 9)}`;
	toggleBtn.setAttribute('aria-controls', panelId);

	const label = document.createElement('span');
	label.setAttribute('data-orama-collapsed-type-label', '');
	label.textContent = typeFilterLabel(activeType);
	toggleBtn.append(label);
	toggleBtn.append(document.createTextNode(' '));
	const chev = document.createElement('span');
	chev.className = 'text-fg-muted';
	chev.setAttribute('aria-hidden', 'true');
	chev.textContent = '▾';
	toggleBtn.append(chev);

	const panel = document.createElement('div');
	panel.id = panelId;
	panel.className =
		'border-hairline bg-surface absolute top-full left-0 z-50 mt-1 hidden min-w-[12rem] flex-col divide-y divide-hairline overflow-hidden rounded-lg border py-0 shadow-lg';
	panel.setAttribute('role', 'menu');
	panel.setAttribute('aria-hidden', 'true');
	panel.setAttribute('data-orama-collapsed-type-panel', '');

	const allBtn = document.createElement('button');
	allBtn.type = 'button';
	allBtn.className = TYPE_FILTER_MENUITEM_CLASS;
	allBtn.setAttribute('data-orama-type-filter', '');
	allBtn.setAttribute('role', 'menuitem');
	allBtn.textContent = 'All types';
	panel.append(allBtn);

	for (const t of ORAMA_DATA_SEARCH_TYPE_ORDER) {
		const b = document.createElement('button');
		b.type = 'button';
		b.className = TYPE_FILTER_MENUITEM_CLASS;
		b.setAttribute('data-orama-type-filter', t);
		b.setAttribute('role', 'menuitem');
		if (t === activeType) {
			b.classList.add('border-l-2', 'border-accent-500', 'pl-2.5');
		}
		b.textContent = typeFilterLabel(t);
		panel.append(b);
	}

	wrap.append(toggleBtn, panel);
	outer.append(wrap);

	return {
		outer,
		refs: { wrap, toggleBtn, panel },
	};
}

export function renderSecondaryFilters(
	activeType: OramaDataSearchType,
	filters: SearchFiltersState,
	uiOptions?: RenderSecondaryFiltersOptions,
): HTMLElement {
	const inner = document.createElement('div');
	inner.className = 'flex min-w-0 flex-1 flex-wrap items-center gap-2';
	inner.setAttribute('data-orama-secondary-inner', '');

	const addMultiSelectDropdown = (
		label: string,
		dim: MultiSelectFilterDim,
		options: { value: string; label: string }[],
		list: string[],
	): void => {
		const wrap = document.createElement('div');
		wrap.className = 'relative shrink-0';
		wrap.setAttribute('data-orama-filter-dropdown', dim);

		const details = document.createElement('details');
		details.className = 'group relative';
		if (uiOptions?.openDropdownDim === dim) {
			details.open = true;
		}

		const summary = document.createElement('summary');
		summary.className = `${TYPE_FILTER_PILL_CLASS} flex cursor-pointer list-none items-center justify-between gap-2 py-2 pr-3 pl-3 [&::-webkit-details-marker]:hidden`;
		const textCol = document.createElement('div');
		textCol.className = 'flex min-w-0 flex-col items-start gap-0 text-left';
		const labEl = document.createElement('span');
		labEl.className =
			'text-[0.65rem] font-medium uppercase tracking-wide text-fg-muted';
		labEl.textContent = label;
		const valEl = document.createElement('span');
		valEl.className = 'max-w-[11rem] truncate text-sm text-fg';
		valEl.textContent = multiDropdownSummaryText(list, options);
		textCol.append(labEl, valEl);
		const chev = document.createElement('span');
		chev.className = 'text-fg-muted shrink-0';
		chev.setAttribute('aria-hidden', 'true');
		chev.textContent = '▾';
		summary.append(textCol, chev);

		const panel = document.createElement('div');
		panel.className =
			'border-hairline bg-surface absolute left-0 top-full z-[60] mt-1 flex max-h-[min(70vh,20rem)] min-w-[12rem] flex-col overflow-hidden rounded-lg border shadow-lg';
		panel.setAttribute('role', 'group');
		panel.setAttribute('aria-label', label);
		panel.addEventListener('click', (e) => e.stopPropagation());

		const scroll = document.createElement('div');
		scroll.className = 'min-h-0 flex-1 overflow-y-auto overflow-x-hidden py-2';

		for (const opt of options) {
			const row = document.createElement('label');
			row.className =
				'flex cursor-pointer items-center gap-2.5 px-3 py-1.5 text-sm text-fg hover:bg-gray-100 dark:hover:bg-gray-800/80';
			const cb = document.createElement('input');
			cb.type = 'checkbox';
			cb.className =
				'border-hairline shrink-0 rounded text-accent-600 focus:ring-2 focus:ring-accent-500/30';
			cb.checked = list.includes(opt.value);
			cb.setAttribute('data-orama-filter-multi', '');
			cb.setAttribute('data-orama-filter-dim', dim);
			cb.setAttribute('data-orama-filter-value', opt.value);
			const span = document.createElement('span');
			span.textContent = opt.label;
			row.append(cb, span);
			scroll.append(row);
		}

		const footer = document.createElement('div');
		footer.className = 'shrink-0 border-t border-hairline bg-surface px-2 py-2';
		const clearBtn = document.createElement('button');
		clearBtn.type = 'button';
		clearBtn.className =
			'w-full rounded-md px-2 py-1.5 text-left text-sm text-fg-muted transition-colors hover:bg-gray-100 hover:text-fg dark:hover:bg-gray-800/80';
		clearBtn.setAttribute('data-orama-filter-clear-dim', dim);
		clearBtn.textContent = 'Clear';
		footer.append(clearBtn);

		panel.append(scroll, footer);

		details.append(summary, panel);
		wrap.append(details);
		inner.append(wrap);
	};

	function addSpellUtilityCheckbox(value: boolean | null): void {
		const checked = value !== false;
		const label = document.createElement('label');
		label.className =
			'shrink-0 flex cursor-pointer items-center gap-2 text-sm text-fg';
		const input = document.createElement('input');
		input.type = 'checkbox';
		input.className =
			'border-hairline shrink-0 rounded text-accent-600 focus:ring-2 focus:ring-accent-500/30';
		input.setAttribute('data-orama-filter-utility-binary', '');
		input.checked = checked;
		const span = document.createElement('span');
		span.textContent = 'Utility spells';
		label.append(input, span);
		inner.append(label);
	}

	function addSpellSecretCheckbox(value: boolean | null): void {
		const checked = value === true;
		const label = document.createElement('label');
		label.className =
			'shrink-0 flex cursor-pointer items-center gap-2 text-sm text-fg';
		const input = document.createElement('input');
		input.type = 'checkbox';
		input.className =
			'border-hairline shrink-0 rounded text-accent-600 focus:ring-2 focus:ring-accent-500/30';
		input.setAttribute('data-orama-filter-secret-binary', '');
		input.checked = checked;
		const span = document.createElement('span');
		span.textContent = 'Secret spells';
		label.append(input, span);
		inner.append(label);
	}

	const addTriToggle = (
		caption: string,
		dim: 'minion' | 'legendary',
		value: boolean | null,
	): void => {
		const on = value === true;
		const btn = document.createElement('button');
		btn.type = 'button';
		btn.className = pressedPillClass(on);
		btn.setAttribute('data-orama-filter-tri', '');
		btn.setAttribute('data-orama-filter-dim', dim);
		btn.textContent = caption;
		inner.append(btn);
	};

	switch (activeType) {
		case 'spell':
			addMultiSelectDropdown('Tier', 'tier', spellTierOptions(), filters.tier);
			addMultiSelectDropdown(
				'School',
				'school',
				spellSchoolOptions(),
				filters.school,
			);
			addMultiSelectDropdown(
				'Target',
				'target',
				SPELL_TARGET_FILTER_OPTIONS,
				filters.target,
			);
			addSpellUtilityCheckbox(filters.utility);
			addSpellSecretCheckbox(filters.secret);
			break;
		case 'monster':
			addMultiSelectDropdown(
				'Level',
				'level',
				monsterLevelOptions(),
				filters.level,
			);
			addMultiSelectDropdown(
				'Family',
				'family',
				monsterFamilyOptions(),
				filters.family,
			);
			addMultiSelectDropdown(
				'Kind',
				'kind',
				monsterKindOptions(),
				filters.kind,
			);
			addMultiSelectDropdown(
				'Armor',
				'armor',
				monsterArmorOptions(),
				filters.armor,
			);
			addMultiSelectDropdown(
				'Speed',
				'speed',
				monsterSpeedOptions(),
				filters.speed,
			);
			addMultiSelectDropdown(
				'Size',
				'size',
				monsterSizeOptions(),
				filters.size,
			);
			addTriToggle('Minion', 'minion', filters.minion);
			addTriToggle('Legendary', 'legendary', filters.legendary);
			break;
		case 'class':
			addMultiSelectDropdown(
				'Key stat',
				'stat',
				classKeyStatOptions(),
				filters.stat,
			);
			addMultiSelectDropdown(
				'Hit die',
				'hitdie',
				classHitDieOptions(),
				filters.hitdie,
			);
			break;
		case 'weapon':
			addMultiSelectDropdown(
				'Category',
				'category',
				WEAPON_CATEGORY_OPTIONS,
				filters.category,
			);
			break;
		case 'ancestry':
			addMultiSelectDropdown(
				'Section',
				'section',
				ANCESTRY_SECTION_OPTIONS,
				filters.section,
			);
			addMultiSelectDropdown(
				'Size',
				'size',
				ancestrySizeOptions(),
				filters.size,
			);
			break;
		case 'armor':
			addMultiSelectDropdown(
				'Category',
				'category',
				ARMOR_CATEGORY_OPTIONS,
				filters.category,
			);
			break;
		case 'magic-item':
			addMultiSelectDropdown(
				'Kind',
				'kind',
				MAGIC_ITEM_KIND_OPTIONS,
				filters.kind,
			);
			addMultiSelectDropdown(
				'Source',
				'source',
				MAGIC_ITEM_SOURCE_OPTIONS,
				filters.source,
			);
			addMultiSelectDropdown(
				'Reward',
				'reward',
				MAGIC_ITEM_REWARD_OPTIONS,
				filters.reward,
			);
			break;
		default:
			break;
	}

	const clearBtn = document.createElement('button');
	clearBtn.type = 'button';
	clearBtn.className =
		'text-fg-muted hover:text-fg shrink-0 text-sm underline decoration-fg/30 underline-offset-2';
	clearBtn.setAttribute('data-orama-clear-filters', '');
	clearBtn.textContent = 'Clear all filters';

	const row = document.createElement('div');
	row.className = 'flex min-h-0 min-w-0 flex-1 flex-wrap items-center gap-2';
	row.append(inner, clearBtn);
	return row;
}

export function patchSearchFiltersState(
	prev: SearchFiltersState,
	action:
		| { kind: 'toggle-multi'; dim: keyof SearchFiltersState; value: string }
		| {
				kind: 'toggle-tri';
				dim: 'minion' | 'legendary';
		  },
): SearchFiltersState {
	const next = { ...prev };
	if (action.kind === 'toggle-multi') {
		const dim = action.dim;
		if (
			dim === 'tier' ||
			dim === 'school' ||
			dim === 'target' ||
			dim === 'level' ||
			dim === 'family' ||
			dim === 'kind' ||
			dim === 'armor' ||
			dim === 'speed' ||
			dim === 'size' ||
			dim === 'stat' ||
			dim === 'hitdie' ||
			dim === 'category' ||
			dim === 'section' ||
			dim === 'source' ||
			dim === 'reward'
		) {
			const cur = prev[dim] as string[];
			(next as SearchFiltersState)[dim] = toggleStringInList(cur, action.value);
		}
		return next;
	}
	const dim = action.dim;
	const cur = prev[dim] as boolean | null;
	let nextVal: boolean | null;
	if (cur === null) nextVal = true;
	else if (cur === true) nextVal = false;
	else nextVal = null;
	(next as SearchFiltersState)[dim] = nextVal;
	return next;
}
