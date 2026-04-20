<script lang="ts">
	import { ORAMA_DATA_SEARCH_TYPE_LABELS_SINGULAR } from '../../../constants/orama-data-search';
	import type { SearchableGameDataDoc } from '../../../models/search-filters';

	interface Props {
		doc: SearchableGameDataDoc;
	}

	let { doc }: Props = $props();

	const typeLabel = $derived(
		ORAMA_DATA_SEARCH_TYPE_LABELS_SINGULAR[doc.type] ?? doc.type,
	);
</script>

<article
	class="border-hairline bg-surface w-full max-w-xl rounded-md border-2 p-3 text-fg shadow-sm"
>
	<div
		class="text-fg-muted text-xs font-medium uppercase tracking-wide leading-none"
	>
		{typeLabel}
	</div>
	<div class="text-fg-muted mt-1 text-sm leading-snug">
		{#if doc.href}
			<a
				href={doc.href}
				class="text-fg font-semibold underline decoration-fg/30 underline-offset-2 hover:decoration-fg"
			>
				{doc.title}
			</a>
			{#if doc.subtitle}
				<span> — {doc.subtitle}</span>
			{/if}
		{:else}
			<span class="text-fg font-semibold">{doc.title}</span>
			{#if doc.subtitle}
				<span> — {doc.subtitle}</span>
			{/if}
		{/if}
	</div>
</article>
