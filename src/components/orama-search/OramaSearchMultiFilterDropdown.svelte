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
</script>

<div class="relative shrink-0">
	<details class="group relative" data-orama-filter-dropdown={dim}>
		<summary class={FILTER_DROPDOWN_SUMMARY_CLASS}>
			<div class="flex min-w-0 flex-col items-start gap-0 text-left">
				<span class={FILTER_MULTI_LABEL_CLASS}>{label}</span>
				<span class={FILTER_MULTI_VALUE_CLASS}>{summaryText}</span>
			</div>
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
