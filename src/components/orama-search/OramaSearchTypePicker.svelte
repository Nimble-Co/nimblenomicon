<script lang="ts">
	import {
		ORAMA_DATA_SEARCH_TYPE_ORDER,
		type OramaDataSearchType,
	} from '../../constants/orama-data-search';
	import {
		FILTER_MULTI_LABEL_CLASS,
		TYPE_FILTER_MENUITEM_CLASS,
		TYPE_FILTER_PILL_ACTIVE_CLASS,
		TYPE_FILTER_PILL_CLASS,
		typeFilterLabel,
	} from '../../scripts/orama-search-toolbar-constants';

	let {
		mode,
		activeType,
		collapsedTypeOpen = $bindable(false),
		collapsedTypeWrapEl = $bindable<HTMLDivElement | undefined>(undefined),
		typePanelId,
		onTypeMenuPick,
	}: {
		mode: 'primary' | 'collapsed';
		activeType: OramaDataSearchType | null;
		collapsedTypeOpen?: boolean;
		collapsedTypeWrapEl?: HTMLDivElement | undefined;
		typePanelId: string;
		onTypeMenuPick: (raw: string) => void;
	} = $props();
</script>

{#if mode === 'primary'}
	<div
		class="flex flex-wrap gap-2"
		data-orama-type-filter-primary
		role="toolbar"
		aria-label="Filter by data type"
	>
		<button
			type="button"
			class="{TYPE_FILTER_PILL_CLASS} {TYPE_FILTER_PILL_ACTIVE_CLASS}"
			data-orama-type-filter=""
			data-pressed="true"
			aria-pressed="true"
			onclick={() => onTypeMenuPick('')}
		>
			All types
		</button>
		{#each ORAMA_DATA_SEARCH_TYPE_ORDER as t (t)}
			<button
				type="button"
				class={TYPE_FILTER_PILL_CLASS}
				data-orama-type-filter={t}
				data-pressed="false"
				aria-pressed="false"
				onclick={() => onTypeMenuPick(t)}
			>
				{typeFilterLabel(t)}
			</button>
		{/each}
	</div>
{:else}
	<div
		class="flex shrink-0 flex-col gap-0"
		data-orama-type-filter-bar
		role="toolbar"
		aria-label="Filter by data type"
	>
		<span class="{FILTER_MULTI_LABEL_CLASS} whitespace-nowrap">Type</span>
		<div class="relative shrink-0" bind:this={collapsedTypeWrapEl}>
			<button
				type="button"
				class="{TYPE_FILTER_PILL_CLASS} gap-1"
				data-orama-collapsed-type-toggle
				aria-expanded={collapsedTypeOpen}
				aria-haspopup="true"
				aria-controls={typePanelId}
				onclick={(e) => {
					e.preventDefault();
					e.stopPropagation();
					collapsedTypeOpen = !collapsedTypeOpen;
				}}
			>
				<span data-orama-collapsed-type-label>
					{typeFilterLabel(activeType!)}
				</span>
				{' '}
				<span class="text-fg-muted" aria-hidden="true">▾</span>
			</button>
			<div
				id={typePanelId}
				class="border-hairline bg-surface absolute top-full left-0 z-50 mt-1 flex min-w-[12rem] flex-col divide-y divide-hairline overflow-hidden rounded-lg border py-0 shadow-lg {collapsedTypeOpen
					? ''
					: 'hidden'}"
				role="menu"
				aria-hidden={collapsedTypeOpen ? 'false' : 'true'}
				data-orama-collapsed-type-panel
			>
				<button
					type="button"
					class={TYPE_FILTER_MENUITEM_CLASS}
					data-orama-type-filter=""
					role="menuitem"
					onclick={() => onTypeMenuPick('')}
				>
					All types
				</button>
				{#each ORAMA_DATA_SEARCH_TYPE_ORDER as t (t)}
					<button
						type="button"
						class="{TYPE_FILTER_MENUITEM_CLASS} {t === activeType
							? 'border-l-2 border-accent-500 pl-2.5'
							: ''}"
						data-orama-type-filter={t}
						role="menuitem"
						onclick={() => onTypeMenuPick(t)}
					>
						{typeFilterLabel(t)}
					</button>
				{/each}
			</div>
		</div>
	</div>
{/if}
