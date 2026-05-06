<script lang="ts">
	import { ORAMA_DATA_SEARCH_TYPE_LABELS_SINGULAR } from '../../../constants/orama-data-search';
	import { displayClassSearchHitDieLabel } from '../../../models/class';
	import type { SearchableGameDataDoc } from '../../../models/orama-game-data-index';
	import type { ClassSearchCardPayload } from '../../../models/search-result-card';
	import MarkdownSnippet from './MarkdownSnippet.svelte';

	interface Props {
		doc: SearchableGameDataDoc;
		classPayload: ClassSearchCardPayload;
	}

	let { doc, classPayload }: Props = $props();
</script>

<article
	class="border-hairline bg-surface w-full max-w-xl rounded-md border-4 border-double p-3 text-fg"
>
	<div
		class="text-fg-muted text-xs font-medium uppercase tracking-wide leading-none"
	>
		{ORAMA_DATA_SEARCH_TYPE_LABELS_SINGULAR.class}
	</div>
	<header class="mt-1">
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
	<p class="text-fg-muted m-0 mt-1 text-sm">
		{displayClassSearchHitDieLabel(classPayload.hitDieLabel)} · Key stats:
		{classPayload.keyStatsDisplay}
	</p>
	<dl class="text-fg-muted m-0 mt-2 grid gap-1 text-sm [&_dt]:font-medium">
		<div class="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1">
			<dt>Saves</dt>
			<dd class="m-0">{classPayload.savesDisplay}</dd>
			<dt>Weapons</dt>
			<dd class="m-0">{classPayload.weaponsDisplay}</dd>
			<dt>Armor</dt>
			<dd class="m-0">{classPayload.armorDisplay}</dd>
			<dt>Gear</dt>
			<dd class="m-0">{classPayload.gearDisplay}</dd>
		</div>
	</dl>
	<div class="mt-2">
		<MarkdownSnippet markdown={classPayload.descriptionMd} />
	</div>
</article>
