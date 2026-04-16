<script lang="ts">
	import { marked } from 'marked';

	/** Mirrors `Ability.astro`: pale code surface, border, stat-block typography. */
	interface Props {
		name: string;
		markdown: string;
	}

	let { name, markdown }: Props = $props();

	const html = $derived(
		marked.parse(markdown.trim() || '', { async: false }) as string,
	);
</script>

<!-- Same inline layout as Ability.astro: title + body on one line (wraps only if needed). -->
<section
	class="border-hairline bg-surface-code text-fg mt-3 rounded-md border p-2 text-base italic leading-snug"
>
	<h3 class="m-0 inline text-base font-bold">{name}</h3>
	{' '}
	<span class="[&_p]:m-0 [&_p]:inline" data-auto-link>
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html html}
	</span>
</section>
