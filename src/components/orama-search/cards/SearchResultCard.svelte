<script lang="ts">
	import {
		SIMPLE_SEARCH_CARD_KINDS,
		parseSearchResultCard,
		type SearchResultCardPayload,
		type SimpleSearchCardPayload,
	} from '../../../models/search-result-card';
	import type { SearchableGameDataDoc } from '../../../models/orama-game-data-index';
	import SearchResultClassCard from './SearchResultClassCard.svelte';
	import SearchResultFallbackCard from './SearchResultFallbackCard.svelte';
	import SearchResultMonsterCard from './SearchResultMonsterCard.svelte';
	import SearchResultSimpleCard from './SearchResultSimpleCard.svelte';
	import SearchResultSpellCard from './SearchResultSpellCard.svelte';
	import SearchResultWeaponCard from './SearchResultWeaponCard.svelte';

	interface Props {
		doc: SearchableGameDataDoc;
	}

	let { doc }: Props = $props();

	const payload = $derived(parseSearchResultCard(doc.cardJson));

	const simpleKinds = new Set<string>(SIMPLE_SEARCH_CARD_KINDS);

	function isSimplePayload(
		p: SearchResultCardPayload,
	): p is SimpleSearchCardPayload {
		return simpleKinds.has(p.kind);
	}
</script>

{#if payload?.kind === 'spell'}
	<SearchResultSpellCard {doc} spell={payload} />
{:else if payload?.kind === 'monster'}
	<SearchResultMonsterCard {doc} {payload} />
{:else if payload?.kind === 'class'}
	<SearchResultClassCard {doc} classPayload={payload} />
{:else if payload?.kind === 'weapon'}
	<SearchResultWeaponCard {doc} weapon={payload} />
{:else if payload && isSimplePayload(payload)}
	<SearchResultSimpleCard {doc} simple={payload} />
{:else}
	<SearchResultFallbackCard {doc} />
{/if}
