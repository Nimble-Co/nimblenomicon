<script lang="ts">
	import { ORAMA_DATA_SEARCH_TYPE_LABELS_SINGULAR } from '../../../constants/orama-data-search';
	import { bookLabel, type BookSearchDoc } from '../../../models/book-search';

	interface Props {
		doc: BookSearchDoc;
	}

	let { doc }: Props = $props();

	const kindLine = $derived(
		`${ORAMA_DATA_SEARCH_TYPE_LABELS_SINGULAR.books} · ${bookLabel(doc.book)}`,
	);
</script>

<article
	class="border-hairline bg-surface w-full max-w-xl rounded-md border-2 p-3 text-fg shadow-sm"
>
	<div
		class="text-fg-muted text-xs font-medium uppercase tracking-wide leading-none"
	>
		{kindLine}
	</div>
	<div class="text-fg-muted mt-1 text-sm leading-snug">
		{#if doc.href}
			<a
				href={doc.href}
				class="text-fg font-semibold underline decoration-fg/30 underline-offset-2 hover:decoration-fg"
			>
				{doc.title}
			</a>
		{:else}
			<span class="text-fg font-semibold">{doc.title}</span>
		{/if}
		{#if doc.subtitle}
			<p class="mt-1 text-xs leading-snug text-fg-muted">{doc.subtitle}</p>
		{/if}
	</div>
</article>
