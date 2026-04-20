<script lang="ts">
	import type { SearchableGameDataDoc } from '../../../models/search-filters';
	import type { LegendaryMonsterSearchCardPayload } from '../../../models/search-result-card';
	import { sizeLabel } from '../../../models/search-result-card-payloads';
	import { armorAbbrev, SPEED_MODE_LABEL } from './monster-card-constants';
	import MonsterAbilityBlock from './MonsterAbilityBlock.svelte';
	import MonsterActionsBlock from './MonsterActionsBlock.svelte';

	interface Props {
		doc: SearchableGameDataDoc;
		leg: LegendaryMonsterSearchCardPayload;
	}

	let { doc, leg }: Props = $props();
</script>

<header class="border-hairline border-b pb-2">
	<hgroup class="flex min-w-0 flex-col gap-1">
		<p
			class="text-fg-muted m-0 text-xs font-normal uppercase italic leading-none tracking-wide"
		>
			Level {leg.level} Solo {leg.creatureType}
		</p>
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
	</hgroup>
</header>
{#if leg.actionsIntro}
	<p class="m-0 mt-3 font-bold">ACTIONS: {leg.actionsIntro}</p>
{/if}
<div class="mt-3">
	{#each leg.creatures as member, mi (mi)}
		{@const showSize = member.sizeSlug !== 'medium'}
		{@const showSpeed =
			member.movementMode !== 'walk' || member.movementSpeed !== 6}
		{@const hasArmorBadge = Boolean(armorAbbrev[member.armor])}
		<div class:list={[mi > 0 && 'border-hairline mt-3 border-t pt-3']}>
			<h4 class="m-0 text-base font-bold uppercase tracking-wide">
				{member.name ?? doc.title}
				{#if member.roleLabel}
					<span class="font-normal normal-case">
						{' '}({member.roleLabel})
					</span>
				{/if}
			</h4>
			<ul
				class="m-0 mt-1 flex list-none flex-wrap items-center gap-x-3 gap-y-1 p-0 text-base font-bold tabular-nums"
			>
				{#if showSize}
					<li class="text-fg-muted">{sizeLabel(member.sizeSlug)}</li>
				{/if}
				{#if hasArmorBadge}
					<li>
						<span
							class="border-hairline inline-flex h-6 min-w-6 items-center justify-center border text-xs"
							title="Armor">{armorAbbrev[member.armor]}</span
						>
					</li>
				{/if}
				<li>
					<span title="Hit points"
						><span aria-hidden="true">♥</span>{member.hp}</span
					>
				</li>
				{#each member.saveBadges as badge (badge)}
					<li>
						<span title="Save modifier"
							><span aria-hidden="true">★</span>{badge}</span
						>
					</li>
				{/each}
				{#if showSpeed}
					<li>
						<span class="text-fg-muted">
							{SPEED_MODE_LABEL[member.movementMode] ?? member.movementMode}
							{member.movementSpeed}
						</span>
					</li>
				{/if}
			</ul>

			{#each member.specialAbilities as ability (ability.name)}
				<MonsterAbilityBlock
					name={ability.name}
					markdown={ability.descriptionMd}
				/>
			{/each}

			<MonsterActionsBlock
				actions={member.actions}
				marginClass="mt-2"
				actionListTopClass=""
			/>
		</div>
	{/each}
</div>
