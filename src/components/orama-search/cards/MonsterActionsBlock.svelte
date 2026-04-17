<script lang="ts">
	import MarkdownSnippet from './MarkdownSnippet.svelte';
	import type { MonsterActionLine } from './monster-card-constants';

	interface Props {
		actions: MonsterActionLine[];
		/** Shown above actions when set (legendary “ACTIONS: …”). */
		actionsIntro?: string;
		/** Outer wrapper top margin */
		marginClass?: 'mt-3' | 'mt-2';
		/** Extra class on multi-action `<ul>` (e.g. `mt-3` for standard layout). */
		actionListTopClass?: string;
	}

	let {
		actions,
		actionsIntro,
		marginClass = 'mt-3',
		actionListTopClass = '',
	}: Props = $props();
</script>

{#if actions.length > 0}
	<div class="{marginClass} text-base leading-relaxed">
		{#if actionsIntro}
			<p class="m-0 mb-1.5 font-bold">ACTIONS: {actionsIntro}</p>
		{/if}
		{#if actions.length === 1}
			{@const a = actions[0]!}
			<div class="m-0">
				<strong>{a.name}</strong>
				{' '}
				<MarkdownSnippet markdown={a.descriptionMd} inline />
				{#if a.joinNext === 'or'}
					{' '}OR:{/if}
				{#if a.joinNext === 'then'}
					{' '}Then:{/if}
			</div>
		{:else}
			<ul
				class="m-0 list-outside list-disc space-y-1.5 pl-5 text-base leading-relaxed {actionListTopClass}"
			>
				{#each actions as a, i (i)}
					<li class="m-0 pl-1">
						<strong>{a.name}</strong>
						{' '}
						<MarkdownSnippet markdown={a.descriptionMd} inline />
						{#if a.joinNext === 'or'}
							{' '}OR:{/if}
						{#if a.joinNext === 'then'}
							{' '}Then:{/if}
					</li>
				{/each}
			</ul>
		{/if}
	</div>
{/if}
