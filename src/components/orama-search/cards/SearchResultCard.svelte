<script lang="ts">
	import {
		SIMPLE_SEARCH_CARD_KINDS,
		parseSearchResultCard,
		type SearchResultCardPayload,
		type SimpleSearchCardPayload,
	} from '../../../models/search-result-card';
	import type {
		SearchResultDoc,
		SearchableGameDataDoc,
	} from '../../../models/search-filters';
	import SearchResultBookCard from './SearchResultBookCard.svelte';
	import SearchResultClassCard from './SearchResultClassCard.svelte';
	import SearchResultFallbackCard from './SearchResultFallbackCard.svelte';
	import SearchResultMonsterCard from './SearchResultMonsterCard.svelte';
	import SearchResultSimpleCard from './SearchResultSimpleCard.svelte';
	import SearchResultSpellCard from './SearchResultSpellCard.svelte';
	import SearchResultWeaponCard from './SearchResultWeaponCard.svelte';

	interface Props {
		doc: SearchResultDoc;
	}

	let { doc }: Props = $props();

	const gameDoc = $derived(doc as SearchableGameDataDoc);

	const payload = $derived(
		doc.type === 'books' ? null : parseSearchResultCard(gameDoc.cardJson),
	);

	const simpleKinds = new Set<string>(SIMPLE_SEARCH_CARD_KINDS);

	function isSimplePayload(
		p: SearchResultCardPayload,
	): p is SimpleSearchCardPayload {
		return simpleKinds.has(p.kind);
	}
</script>

{#if doc.type === 'books'}
	<SearchResultBookCard {doc} />
{:else if payload?.kind === 'spell'}
	<SearchResultSpellCard doc={gameDoc} spell={payload} />
{:else if payload?.kind === 'monster'}
	<SearchResultMonsterCard doc={gameDoc} {payload} />
{:else if payload?.kind === 'class'}
	<SearchResultClassCard doc={gameDoc} classPayload={payload} />
{:else if payload?.kind === 'weapon'}
	<SearchResultWeaponCard doc={gameDoc} weapon={payload} />
{:else if payload && isSimplePayload(payload)}
	<SearchResultSimpleCard doc={gameDoc} simple={payload} />
{:else}
	<SearchResultFallbackCard doc={gameDoc} />
{/if}
