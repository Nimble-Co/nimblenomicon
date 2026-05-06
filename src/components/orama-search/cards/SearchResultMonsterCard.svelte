<script lang="ts">
	import type { SearchableGameDataDoc } from '../../../models/orama-game-data-index';
	import type {
		LegendaryMonsterSearchCardPayload,
		StandardMonsterSearchCardPayload,
	} from '../../../models/search-result-card';
	import LegendaryMonsterSearchCard from './LegendaryMonsterSearchCard.svelte';
	import StandardMonsterSearchCard from './StandardMonsterSearchCard.svelte';

	interface Props {
		doc: SearchableGameDataDoc;
		payload:
			| StandardMonsterSearchCardPayload
			| LegendaryMonsterSearchCardPayload;
	}

	let { doc, payload }: Props = $props();
</script>

{#if payload.variant === 'standard'}
	<StandardMonsterSearchCard {doc} {payload} />
{:else}
	<LegendaryMonsterSearchCard {doc} {payload} />
{/if}
