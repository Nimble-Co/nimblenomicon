<script lang="ts">
	import { ORAMA_DATA_SEARCH_TYPE_LABELS_SINGULAR } from '../../../constants/orama-data-search';
	import type { SearchableGameDataDoc } from '../../../models/search-filters';
	import type { WeaponSearchCardPayload } from '../../../models/search-result-card';

	interface Props {
		doc: SearchableGameDataDoc;
		weapon: WeaponSearchCardPayload;
	}

	let { doc, weapon }: Props = $props();
</script>

<article
	class="border-hairline bg-surface w-full max-w-xl rounded-md border-4 border-double p-3 text-fg"
>
	<div
		class="text-fg-muted text-xs font-medium uppercase tracking-wide leading-none"
	>
		{ORAMA_DATA_SEARCH_TYPE_LABELS_SINGULAR.weapon}
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
	<p class="text-fg-muted m-0 mt-1 text-sm italic">
		{weapon.categoryLabel} weapon
	</p>
	<ul
		class="m-0 mt-2 list-none space-y-1 p-0 text-base font-medium tabular-nums"
	>
		<li>
			<span class="text-fg-muted font-normal">Damage</span>
			{weapon.damage}
		</li>
		<li><span class="text-fg-muted font-normal">Cost</span> {weapon.cost}</li>
	</ul>
	{#if weapon.properties.length > 0}
		<div class="mt-2 text-sm leading-relaxed">
			<span class="text-fg-muted font-medium">Properties</span>
			<ul class="m-0 mt-1 list-disc pl-5">
				{#each weapon.properties as line (line)}
					<li>{line}</li>
				{/each}
			</ul>
		</div>
	{/if}
</article>
