/**
 * Shared class names and labels for the full-page Orama data search toolbar (Svelte UI).
 */
import {
	ORAMA_DATA_SEARCH_TYPE_LABELS,
	type OramaDataSearchType,
} from '../constants/orama-data-search';

export const TYPE_FILTER_PILL_CLASS =
	'orama-type-filter-pill shrink-0 rounded-full border border-hairline bg-surface text-sm text-fg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800/80';
export const TYPE_FILTER_PILL_ACTIVE_CLASS =
	'border-accent-500 bg-accent-500/15 text-fg font-medium dark:bg-accent-500/20';
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
