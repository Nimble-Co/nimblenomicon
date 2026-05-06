<script lang="ts">
	import { ORAMA_DATA_SEARCH_TYPE_LABELS_SINGULAR } from '../../../constants/orama-data-search';
	import type { SearchableGameDataDoc } from '../../../models/orama-game-data-index';
	import type { LegendaryMonsterSearchCardPayload } from '../../../models/search-result-card';
	import MarkdownSnippet from './MarkdownSnippet.svelte';
	import LegendarySoloMonsterSearchCard from './LegendarySoloMonsterSearchCard.svelte';
	import LegendaryTeamMonsterSearchCard from './LegendaryTeamMonsterSearchCard.svelte';

	interface Props {
		doc: SearchableGameDataDoc;
		payload: LegendaryMonsterSearchCardPayload;
	}

	let { doc, payload: leg }: Props = $props();
</script>

<article
	class="border-hairline bg-surface w-full max-w-xl rounded-md border-4 border-double p-2 text-fg"
>
	<div
		class="text-fg-muted mb-1 text-xs font-medium uppercase tracking-wide leading-none"
	>
		{ORAMA_DATA_SEARCH_TYPE_LABELS_SINGULAR.monster}
	</div>
	{#if !leg.isTeam && leg.creatures[0]}
		<LegendarySoloMonsterSearchCard {doc} {leg} solo={leg.creatures[0]!} />
	{:else}
		<LegendaryTeamMonsterSearchCard {doc} {leg} />
	{/if}

	{#if leg.bloodiedMd || leg.lastStandMd}
		<div
			class="border-hairline mt-3 flex flex-col gap-3 border-t pt-3 text-base leading-relaxed sm:gap-4"
		>
			{#if leg.bloodiedMd}
				<section class="m-0">
					<h4 class="m-0 text-sm font-bold uppercase tracking-wide">
						Bloodied
					</h4>
					<div class="[&_strong]:text-danger [&_p]:m-0">
						<MarkdownSnippet markdown={leg.bloodiedMd} />
					</div>
				</section>
			{/if}
			{#if leg.lastStandMd}
				<section class="m-0">
					<h4 class="m-0 text-sm font-bold uppercase tracking-wide">
						Last Stand
					</h4>
					<div class="[&_strong]:text-danger [&_p]:m-0">
						<MarkdownSnippet markdown={leg.lastStandMd} />
					</div>
				</section>
			{/if}
		</div>
	{/if}

	{#if leg.notesMd}
		<div class="mt-3 border-t border-hairline pt-2">
			<MarkdownSnippet markdown={leg.notesMd} />
		</div>
	{/if}
</article>
