<script lang="ts">
	import { ORAMA_DATA_SEARCH_TYPE_LABELS_SINGULAR } from '../../../constants/orama-data-search';
	import type { SearchableGameDataDoc } from '../../../models/search-filters';
	import type { SimpleSearchCardPayload } from '../../../models/search-result-card';
	import MarkdownSnippet from './MarkdownSnippet.svelte';

	interface Props {
		doc: SearchableGameDataDoc;
		simple: SimpleSearchCardPayload;
	}

	let { doc, simple }: Props = $props();

	const typeLabel = $derived(ORAMA_DATA_SEARCH_TYPE_LABELS_SINGULAR[simple.kind]);
</script>

<article
	class="border-hairline bg-surface w-full max-w-xl rounded-md border-2 p-3 text-fg shadow-sm"
>
	<div
		class="text-fg-muted text-xs font-medium uppercase tracking-wide leading-none"
	>
		{typeLabel}
	</div>
	<header class="mt-1">
		<h3 class="m-0 text-lg font-semibold leading-tight">
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
		{#if doc.subtitle && simple.kind !== 'magic-item'}
			<p class="text-fg-muted m-0 mt-0.5 text-sm">{doc.subtitle}</p>
		{/if}
	</header>
	<div class="mt-2">
		<MarkdownSnippet markdown={simple.excerptMd} />
	</div>
</article>
