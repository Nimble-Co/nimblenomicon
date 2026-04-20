<script lang="ts">
	import { onMount } from 'svelte';
	import { wireSearchShortcut } from '../../search/wire-search-shortcut';
	import OramaQuickSearchBar from './OramaQuickSearchBar.svelte';
	import OramaQuickSearchDropdown from './OramaQuickSearchDropdown.svelte';

	export type OramaQuickSearchFieldVariant =
		| 'header-mobile'
		| 'header-desktop'
		| 'home';

	type Props = {
		variant: OramaQuickSearchFieldVariant;
		placeholder: string;
		action: string;
		ctrlKeyLabel?: string;
	};

	let { variant, placeholder, action, ctrlKeyLabel = 'Ctrl' }: Props = $props();

	let inputEl = $state<HTMLInputElement | null>(null);

	onMount(() => {
		if (variant !== 'home') return;
		const remove = wireSearchShortcut(() => {
			inputEl?.focus();
			inputEl?.select();
		});
		return remove;
	});

	const mobilePanelClass =
		'ss-quick-panel not-prose absolute left-0 right-0 top-full z-[200] mt-1 max-h-[min(70vh,20rem)] overflow-x-hidden overflow-y-auto rounded-lg border border-hairline bg-surface-nav text-start text-fg shadow-lg [&_a]:focus-visible:outline [&_a]:focus-visible:outline-2 [&_a]:focus-visible:outline-offset-[-2px] [&_a]:focus-visible:outline-accent-500';

	const desktopPanelClass = mobilePanelClass;

	const homePanelClass =
		'orama-home-quick not-prose absolute top-full left-0 right-0 z-[200] mt-1 max-h-[min(70vh,20rem)] overflow-x-hidden overflow-y-auto rounded-lg border border-hairline bg-surface-nav text-left text-fg shadow-lg';
</script>

{#if variant === 'header-mobile'}
	<div class="ss-search-field relative w-full min-w-0">
		<OramaQuickSearchBar
			bind:inputEl
			variant="header-mobile"
			inputId="ss-mobile-q"
			{placeholder}
			{action}
		/>
		<OramaQuickSearchDropdown
			{inputEl}
			panelId="ss-mobile-quick-results"
			panelClass={mobilePanelClass}
		/>
	</div>
{:else if variant === 'header-desktop'}
	<div
		class="ss-search-field ss-desktop-wrap relative hidden min-[50rem]:flex w-full min-w-0 max-w-[40rem] flex-1"
	>
		<OramaQuickSearchBar
			bind:inputEl
			variant="header-desktop"
			inputId="ss-desktop-q"
			{placeholder}
			{action}
			{ctrlKeyLabel}
		/>
		<OramaQuickSearchDropdown
			{inputEl}
			panelId="ss-desktop-quick-results"
			panelClass={desktopPanelClass}
		/>
	</div>
{:else}
	<div class="relative w-full">
		<OramaQuickSearchBar
			bind:inputEl
			variant="home"
			inputId="home-search-q"
			{placeholder}
			{action}
		/>
		<OramaQuickSearchDropdown
			{inputEl}
			panelId="home-quick-results"
			panelClass={homePanelClass}
		/>
	</div>
{/if}

{#if variant === 'home'}
	<style>
		.orama-home-quick :global(.ss-quick-link:focus-visible) {
			outline: 2px solid var(--color-accent-500);
			outline-offset: -2px;
		}
	</style>
{/if}
