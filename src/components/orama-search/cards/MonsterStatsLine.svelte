<script lang="ts">
	import { armorAbbrev, SPEED_MODE_LABEL } from './monster-card-constants';

	interface Props {
		armor: 'none' | 'medium' | 'heavy';
		hp: number | undefined;
		showSpeed: boolean;
		movementMode: string;
		movementSpeed: number;
		/** Legendary solo: save modifier badges between HP and speed. */
		saveBadges?: string[];
	}

	let { armor, hp, showSpeed, movementMode, movementSpeed, saveBadges }: Props =
		$props();

	const hasArmorBadge = Boolean(armorAbbrev[armor]);
	const hasHp = hp !== undefined;
</script>

<ul
	class="m-0 flex shrink-0 list-none flex-wrap items-end justify-end gap-2 p-0 text-base font-bold tabular-nums"
	aria-label="Quick stats"
>
	{#if hasArmorBadge}
		<li>
			<span
				class="border-hairline inline-flex h-6 min-w-6 items-center justify-center border text-xs"
				title="Armor">{armorAbbrev[armor]}</span
			>
		</li>
	{/if}
	{#if hasHp}
		<li>
			<span title="Hit points"><span aria-hidden="true">♥</span>{hp}</span>
		</li>
	{/if}
	{#if saveBadges}
		{#each saveBadges as badge (badge)}
			<li>
				<span title="Save modifier"
					><span aria-hidden="true">★</span>{badge}</span
				>
			</li>
		{/each}
	{/if}
	{#if showSpeed}
		<li>
			<span class="text-fg-muted">
				{SPEED_MODE_LABEL[movementMode] ?? movementMode}
				{movementSpeed}
			</span>
		</li>
	{/if}
</ul>
