<script lang="ts">
	import { ORAMA_DATA_SEARCH_TYPE_LABELS_SINGULAR } from '../../../constants/orama-data-search';
	import type { SearchableGameDataDoc } from '../../../models/orama-game-data-index';
	import type { StandardMonsterSearchCardPayload } from '../../../models/search-result-card';
	import { sizeLabel } from '../../../models/search-result-card-payloads';
	import MarkdownSnippet from './MarkdownSnippet.svelte';
	import MonsterAbilityBlock from './MonsterAbilityBlock.svelte';
	import MonsterActionsBlock from './MonsterActionsBlock.svelte';
	import MonsterStatsLine from './MonsterStatsLine.svelte';

	interface Props {
		doc: SearchableGameDataDoc;
		payload: StandardMonsterSearchCardPayload;
	}

	let { doc, payload: m }: Props = $props();

	const showSize = m.sizeSlug !== 'medium';
	const showSpeed = m.movementMode !== 'walk' || m.movementSpeed !== 6;
</script>

<article
	class="border-hairline bg-surface w-full max-w-xl rounded-md border-4 border-double p-2 text-fg"
	data-search-card-root
>
	<div
		class="text-fg-muted mb-1 text-xs font-medium uppercase tracking-wide leading-none"
	>
		{ORAMA_DATA_SEARCH_TYPE_LABELS_SINGULAR.monster}
	</div>
	<header class="flex items-end justify-between gap-3">
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
				LVL {m.level}{#if m.isMinion}, Minion{/if}{#if showSize}, {sizeLabel(
						m.sizeSlug,
					).toUpperCase()}{/if}{#if m.kindName}, {m.kindName}{/if}
			</p>
		</hgroup>
		<MonsterStatsLine
			armor={m.armor}
			hp={m.hp}
			{showSpeed}
			movementMode={m.movementMode}
			movementSpeed={m.movementSpeed}
		/>
	</header>

	{#each m.familyAbilities as fa, fi (`family-${fi}-${fa.name}`)}
		<MonsterAbilityBlock name={fa.name} markdown={fa.descriptionMd} />
	{/each}

	{#each m.specialAbilities as ability (ability.name)}
		<MonsterAbilityBlock name={ability.name} markdown={ability.descriptionMd} />
	{/each}

	<MonsterActionsBlock actions={m.actions} actionListTopClass="mt-3" />

	{#if m.notesMd}
		<div class="mt-3 border-t border-hairline pt-2">
			<MarkdownSnippet markdown={m.notesMd} />
		</div>
	{/if}
</article>
