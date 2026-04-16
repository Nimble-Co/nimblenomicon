<script lang="ts">
	import { ORAMA_DATA_SEARCH_TYPE_LABELS_SINGULAR } from '../../../constants/orama-data-search';
	import type { SearchableGameDataDoc } from '../../../models/search-filters';
	import type { SpellSearchCardPayload } from '../../../models/search-result-card';
	import MarkdownSnippet from './MarkdownSnippet.svelte';

	interface Props {
		doc: SearchableGameDataDoc;
		spell: SpellSearchCardPayload;
	}

	let { doc, spell }: Props = $props();
</script>

<article
	class="border-hairline bg-surface w-full max-w-xl rounded-md border-4 border-double p-3 text-fg"
	data-search-card-root
>
	<div
		class="text-fg-muted text-xs font-medium uppercase tracking-wide leading-none"
	>
		{ORAMA_DATA_SEARCH_TYPE_LABELS_SINGULAR.spell}
	</div>
	<header class="mt-1 flex flex-wrap items-baseline justify-between gap-2">
		<h3 class="m-0 text-lg font-bold leading-tight">
			{#if doc.href}
				<a
					href={doc.href}
					class="text-fg no-underline hover:underline focus-visible:underline"
				>
					{doc.title}
				</a>
			{:else}
				{doc.title}
			{/if}
		</h3>
	</header>
	<p class="text-fg-muted m-0 mt-1 text-xs italic">
		{spell.schoolName} · {spell.tierLabel}
		{#if spell.castingTime}
			· {spell.castingTime}
		{/if}
		{#if spell.targetLabel}
			· {spell.targetLabel}
		{/if}
	</p>
	{#if spell.utility || spell.secret}
		<p class="m-0 mt-1 flex flex-wrap gap-2 text-xs">
			{#if spell.utility}
				<span
					class="border-hairline rounded px-1.5 py-0.5 font-medium uppercase tracking-wide"
					>Utility</span
				>
			{/if}
			{#if spell.secret}
				<span
					class="border-hairline rounded px-1.5 py-0.5 font-medium uppercase tracking-wide"
					>Secret</span
				>
			{/if}
		</p>
	{/if}
	<div class="mt-2">
		<MarkdownSnippet markdown={spell.descriptionMd} />
	</div>
</article>
