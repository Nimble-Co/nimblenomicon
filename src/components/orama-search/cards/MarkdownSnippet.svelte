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

	const bodyClass =
		'search-card-md text-base leading-relaxed [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:my-2 [&_li]:my-0.5 [&_p]:m-0 [&_p]:inline';
</script>

<!-- Trusted game data (same source as detail pages). -->
{#if inline}
	<span class="{bodyClass} {className}" data-auto-link>
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html html}
	</span>
{:else}
	<div class="{bodyClass} {className}" data-auto-link>
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html html}
	</div>
{/if}
