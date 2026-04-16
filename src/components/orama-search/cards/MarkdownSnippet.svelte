<script lang="ts">
	import { marked } from 'marked';

	interface Props {
		markdown: string;
		class?: string;
		/** Use a span root for inline action text (avoids div inside p). */
		inline?: boolean;
	}

	let { markdown, class: className = '', inline = false }: Props = $props();

	const html = $derived(
		marked.parse(markdown.trim() || '', { async: false }) as string,
	);

	/** Block paragraphs (default): multi-paragraph markdown (e.g. ancestry flavor + trait). */
	const blockBodyClass =
		'search-card-md text-base leading-relaxed [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:my-2 [&_li]:my-0.5';

	/** Inline flow for action lines next to bold labels. */
	const inlineBodyClass =
		'search-card-md text-base leading-relaxed [&_p]:m-0 [&_p]:inline';
</script>

<!-- Trusted game data (same source as detail pages). -->
{#if inline}
	<span class="{inlineBodyClass} {className}" data-auto-link>
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html html}
	</span>
{:else}
	<div class="{blockBodyClass} {className}" data-auto-link>
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html html}
	</div>
{/if}
