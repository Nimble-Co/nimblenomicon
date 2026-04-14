<script lang="ts">
	import type { MultiSelectFilterDim } from '../../models/search-filters';
	import {
		FILTER_CHECKBOX_INPUT_CLASS,
		FILTER_CHECKBOX_ROW_CLASS,
		FILTER_DROPDOWN_CLEAR_BUTTON_CLASS,
		FILTER_DROPDOWN_CLEAR_FOOTER_CLASS,
		FILTER_DROPDOWN_PANEL_CLASS,
		FILTER_DROPDOWN_SCROLL_CLASS,
		FILTER_DROPDOWN_SUMMARY_CLASS,
		FILTER_MULTI_LABEL_CLASS,
		FILTER_MULTI_VALUE_CLASS,
		multiDropdownSummaryText,
	} from '../../scripts/orama-search-toolbar-constants';

	type Option = { value: string; label: string };

	let {
		dim,
		label,
		selectedValues,
		options,
		onCheckboxChange,
		onClear,
	}: {
		dim: MultiSelectFilterDim;
		label: string;
		selectedValues: string[];
		options: Option[];
		onCheckboxChange: (value: string, checked: boolean) => void;
		onClear: () => void;
	} = $props();

	const summaryText = $derived(
		multiDropdownSummaryText(selectedValues, options),
	);

	/** Only one multi-select filter panel open at a time (accordion). */
	function onFilterDetailsToggle(e: Event) {
		const el = e.currentTarget;
		if (!(el instanceof HTMLDetailsElement)) return;
		if (!el.open) return;
		const wrap = el.closest('[data-orama-secondary-wrap]');
		if (!wrap) return;
		for (const node of wrap.querySelectorAll(
			'details[data-orama-filter-dropdown]',
		)) {
			if (node !== el) (node as HTMLDetailsElement).open = false;
		}
	}
</script>

<div class="flex shrink-0 flex-col gap-1">
	<span class="{FILTER_MULTI_LABEL_CLASS} whitespace-nowrap">{label}</span>
	<div class="relative min-w-0 shrink-0">
		<details
			class="group relative"
			data-orama-filter-dropdown={dim}
			ontoggle={onFilterDetailsToggle}
		>
			<summary class={FILTER_DROPDOWN_SUMMARY_CLASS}>
				<span class="{FILTER_MULTI_VALUE_CLASS} min-w-0 text-left"
					>{summaryText}</span
				>
				<span class="text-fg-muted shrink-0" aria-hidden="true">▾</span>
			</summary>
			<div
				class={FILTER_DROPDOWN_PANEL_CLASS}
				role="group"
				aria-label={label}
				onclick={(e) => e.stopPropagation()}
			>
				<div class={FILTER_DROPDOWN_SCROLL_CLASS}>
					{#each options as opt (opt.value)}
						<label class={FILTER_CHECKBOX_ROW_CLASS}>
							<input
								type="checkbox"
								class={FILTER_CHECKBOX_INPUT_CLASS}
								checked={selectedValues.includes(opt.value)}
								onchange={(e) =>
									onCheckboxChange(opt.value, e.currentTarget.checked)}
							/>
							<span>{opt.label}</span>
						</label>
					{/each}
				</div>
				<div class={FILTER_DROPDOWN_CLEAR_FOOTER_CLASS}>
					<button
						type="button"
						class={FILTER_DROPDOWN_CLEAR_BUTTON_CLASS}
						onclick={onClear}
					>
						Clear
					</button>
				</div>
			</div>
		</details>
	</div>
</div>
