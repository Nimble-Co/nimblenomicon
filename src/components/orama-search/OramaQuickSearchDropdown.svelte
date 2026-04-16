<script lang="ts">
	import { initOramaQuickSearch } from '../../scripts/orama-search-ui';

	type Props = {
		panelId: string;
		inputEl: HTMLInputElement | null;
		/** Extra classes for the results container (e.g. ss-quick-panel + header styles, or orama-home-quick). */
		panelClass: string;
	};

	let { panelId, inputEl, panelClass }: Props = $props();

	let panelEl: HTMLDivElement | null = $state(null);
	let initialized = false;

	$effect(() => {
		if (initialized) return;
		const input = inputEl;
		const panel = panelEl;
		if (!input || !panel) return;
		initOramaQuickSearch({ input, panel });
		initialized = true;
	});
</script>

<div bind:this={panelEl} id={panelId} class={panelClass} hidden></div>
