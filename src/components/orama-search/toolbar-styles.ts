/**
 * Shared class names and labels for the full-page Orama data search toolbar (Svelte UI).
 */
import {
	ORAMA_DATA_SEARCH_TYPE_LABELS,
	type OramaDataSearchType,
} from '../../constants/orama-data-search';

export const TYPE_FILTER_PILL_CLASS =
	'orama-type-filter-pill shrink-0 rounded-lg border-2 border-hairline-emphasis bg-surface text-sm text-fg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800/80';
/** Stronger than `/15` so the default “All” pill reads as selected on `bg-surface` (primary toolbar has no `data-orama-type-filter-bar` CSS override). */
export const TYPE_FILTER_PILL_ACTIVE_CLASS =
	'border-accent-500 bg-accent-50 font-semibold text-fg shadow-[inset_0_0_0_1px_rgba(226,180,27,0.2)] dark:bg-accent-950/45 dark:shadow-none';
export const TYPE_FILTER_MENUITEM_CLASS =
	'orama-type-filter-menu-item flex w-full min-w-[10rem] items-center rounded-none border-0 bg-transparent px-3 py-2.5 text-left text-sm text-fg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800/80';

export function typeFilterLabel(t: OramaDataSearchType): string {
	return ORAMA_DATA_SEARCH_TYPE_LABELS[t] ?? t;
}

export function multiDropdownSummaryText(
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

export function pressedPillClass(isOn: boolean): string {
	return isOn
		? `${TYPE_FILTER_PILL_CLASS} ${TYPE_FILTER_PILL_ACTIVE_CLASS}`
		: TYPE_FILTER_PILL_CLASS;
}

/**
 * `<summary>` for multi-select filter `<details>` dropdowns (value + chevron only;
 * the dimension label is rendered beside the pill).
 */
export const FILTER_DROPDOWN_SUMMARY_CLASS = `${TYPE_FILTER_PILL_CLASS} flex cursor-pointer list-none items-center justify-between gap-2 py-1.5 pr-3 pl-3 [&::-webkit-details-marker]:hidden`;

/** Floating panel under filter dropdowns */
export const FILTER_DROPDOWN_PANEL_CLASS =
	'border-hairline bg-surface absolute left-0 top-full z-[60] mt-1 flex max-h-[min(70vh,20rem)] min-w-[12rem] flex-col overflow-hidden rounded-lg border shadow-lg';

export const FILTER_DROPDOWN_SCROLL_CLASS =
	'min-h-0 flex-1 overflow-y-auto overflow-x-hidden py-2';

export const FILTER_CHECKBOX_ROW_CLASS =
	'flex cursor-pointer items-center gap-2.5 px-3 py-1.5 text-sm text-fg hover:bg-gray-100 dark:hover:bg-gray-800/80';

export const FILTER_CHECKBOX_INPUT_CLASS =
	'border-hairline shrink-0 rounded text-accent-600 focus:ring-2 focus:ring-accent-500/30';

export const FILTER_DROPDOWN_CLEAR_FOOTER_CLASS =
	'shrink-0 border-t border-hairline bg-surface px-2 py-2';

export const FILTER_DROPDOWN_CLEAR_BUTTON_CLASS =
	'w-full bg-transparent px-2 py-1.5 text-left text-sm text-fg-muted transition-colors hover:text-fg';

export const FILTER_MULTI_LABEL_CLASS =
	'text-[0.65rem] font-semibold uppercase leading-none tracking-wide text-fg-muted px-1';

/** Matches label row height so controls without a visible label align with dropdown/type columns */
export const FILTER_TOOLBAR_LABEL_SPACER_CLASS = `${FILTER_MULTI_LABEL_CLASS} invisible select-none`;

export const FILTER_MULTI_VALUE_CLASS =
	'max-w-[11rem] truncate text-sm text-fg';

/** Spell toolbar: utility / secret — chip height matches filter pills */
export const FILTER_INLINE_CHECKBOX_LABEL_CLASS =
	'shrink-0 flex h-9 min-h-[2.25rem] cursor-pointer items-center gap-2.5 rounded-lg border-2 border-hairline-emphasis bg-surface px-3 text-sm text-fg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800/80';

/** Secondary row under a toolbar section label (Options, Traits, …) */
export const FILTER_TOOLBAR_OPTIONS_ROW_CLASS =
	'flex min-h-[2.25rem] flex-wrap items-center gap-x-4 gap-y-2';
