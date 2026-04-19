<script lang="ts">
	import type { SearchableGameDataDoc } from '../../../models/search-filters';
	import type { LegendaryMonsterSearchCardPayload } from '../../../models/search-result-card';
	import { sizeLabel } from '../../../models/search-result-card-payloads';
	import MonsterAbilityBlock from './MonsterAbilityBlock.svelte';
	import MonsterActionsBlock from './MonsterActionsBlock.svelte';
	import MonsterStatsLine from './MonsterStatsLine.svelte';

	interface Props {
		doc: SearchableGameDataDoc;
		leg: LegendaryMonsterSearchCardPayload;
		solo: NonNullable<LegendaryMonsterSearchCardPayload['creatures'][0]>;
	}

	let { doc, leg, solo }: Props = $props();

	const showSize = solo.sizeSlug !== 'medium';
	const showSpeed = solo.movementMode !== 'walk' || solo.movementSpeed !== 6;
</script>

<header
	class="border-hairline flex items-end justify-between gap-3 border-b pb-2"
>
	<hgroup class="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2">
		<h3 class="m-0 text-xl font-bold leading-none">
			{#if doc.href}
				<a
					href={doc.href}
					class="text-fg no-underline decoration-from-font hover:underline focus-visible:underline"
				>
					{doc.title}
				</a>
			{:else}
				{doc.title}
			{/if}
		</h3>
		<p
			class="text-fg-muted m-0 text-xs font-normal uppercase italic leading-none tracking-wide"
		>
			Level {leg.level}, Solo{#if showSize}, {sizeLabel(solo.sizeSlug)}{/if}, {leg.creatureType}
		</p>
	</hgroup>
	<MonsterStatsLine
		armor={solo.armor}
		hp={solo.hp}
		{showSpeed}
		movementMode={solo.movementMode}
		movementSpeed={solo.movementSpeed}
		saveBadges={solo.saveBadges}
	/>
</header>

{#each solo.specialAbilities as ability (ability.name)}
	<MonsterAbilityBlock name={ability.name} markdown={ability.descriptionMd} />
{/each}

<MonsterActionsBlock
	actions={solo.actions}
	actionsIntro={leg.actionsIntro}
	actionListTopClass=""
/>
