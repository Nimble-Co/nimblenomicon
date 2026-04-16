<script lang="ts">
	import { ORAMA_DATA_SEARCH_TYPE_LABELS_SINGULAR } from '../../../constants/orama-data-search';
	import type { SearchableGameDataDoc } from '../../../models/search-filters';
	import type {
		LegendaryMonsterSearchCardPayload,
		StandardMonsterSearchCardPayload,
	} from '../../../models/search-result-card';
	import { sizeLabel } from '../../../models/search-result-card-payloads';
	import MarkdownSnippet from './MarkdownSnippet.svelte';
	import MonsterAbilityBlock from './MonsterAbilityBlock.svelte';

	interface Props {
		doc: SearchableGameDataDoc;
		payload: StandardMonsterSearchCardPayload | LegendaryMonsterSearchCardPayload;
	}

	let { doc, payload }: Props = $props();

	const SPEED_MODE_LABEL: Record<string, string> = {
		walk: 'Walk',
		fly: 'Fly',
		burrow: 'Burrow',
		swim: 'Swim',
	};

	const armorAbbrev: Record<'none' | 'medium' | 'heavy', string | null> = {
		none: null,
		medium: 'M',
		heavy: 'H',
	};
</script>

{#if payload.variant === 'standard'}
	{@const m = payload}
	{@const showSize = m.sizeSlug !== 'medium'}
	{@const showSpeed =
		m.movementMode !== 'walk' || m.movementSpeed !== 6}
	{@const hasHp = m.hp !== undefined}
	{@const hasArmorBadge = Boolean(armorAbbrev[m.armor])}
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
			<ul
				class="m-0 flex shrink-0 list-none flex-wrap items-end justify-end gap-2 p-0 text-base font-bold tabular-nums"
				aria-label="Quick stats"
			>
				{#if hasArmorBadge}
					<li>
						<span
							class="border-hairline inline-flex h-6 min-w-6 items-center justify-center border text-xs"
							title="Armor">{armorAbbrev[m.armor]}</span
						>
					</li>
				{/if}
				{#if hasHp}
					<li>
						<span title="Hit points"
							><span aria-hidden="true">♥</span>{m.hp}</span
						>
					</li>
				{/if}
				{#if showSpeed}
					<li>
						<span class="text-fg-muted">
							{SPEED_MODE_LABEL[m.movementMode] ?? m.movementMode}
							{m.movementSpeed}
						</span>
					</li>
				{/if}
			</ul>
		</header>

		{#each m.familyAbilities as fa, fi (`family-${fi}-${fa.name}`)}
			<MonsterAbilityBlock name={fa.name} markdown={fa.descriptionMd} />
		{/each}

		{#each m.specialAbilities as ability (ability.name)}
			<MonsterAbilityBlock name={ability.name} markdown={ability.descriptionMd} />
		{/each}

		{#if m.actions.length > 0}
			<div class="mt-3 text-base leading-relaxed">
				{#if m.actions.length === 1}
					{@const a = m.actions[0]!}
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
						class="mt-3 m-0 list-outside list-disc space-y-1.5 pl-5 text-base leading-relaxed"
					>
						{#each m.actions as a, i (i)}
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

		{#if m.notesMd}
			<div class="mt-3 border-t border-hairline pt-2">
				<MarkdownSnippet markdown={m.notesMd} />
			</div>
		{/if}
	</article>
{:else}
	{@const leg = payload}
	<article
		class="border-hairline bg-surface w-full max-w-xl rounded-md border-4 border-double p-2 text-fg"
	>
		<div
			class="text-fg-muted mb-1 text-xs font-medium uppercase tracking-wide leading-none"
		>
			{ORAMA_DATA_SEARCH_TYPE_LABELS_SINGULAR.monster}
		</div>
		{#if !leg.isTeam && leg.creatures[0]}
			{@const solo = leg.creatures[0]!}
			{@const showSize = solo.sizeSlug !== 'medium'}
			{@const showSpeed =
				solo.movementMode !== 'walk' || solo.movementSpeed !== 6}
			{@const hasArmorBadge = Boolean(armorAbbrev[solo.armor])}
			<header class="border-hairline flex items-end justify-between gap-3 border-b pb-2">
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
				<ul
					class="m-0 flex shrink-0 list-none flex-wrap items-end justify-end gap-2 p-0 text-base font-bold tabular-nums"
					aria-label="Quick stats"
				>
					{#if hasArmorBadge}
						<li>
							<span
								class="border-hairline inline-flex h-6 min-w-6 items-center justify-center border text-xs"
								title="Armor">{armorAbbrev[solo.armor]}</span
							>
						</li>
					{/if}
					<li>
						<span title="Hit points"
							><span aria-hidden="true">♥</span>{solo.hp}</span
						>
					</li>
					{#each solo.saveBadges as badge (badge)}
						<li>
							<span title="Save modifier"
								><span aria-hidden="true">★</span>{badge}</span
							>
						</li>
					{/each}
					{#if showSpeed}
						<li>
							<span class="text-fg-muted">
								{SPEED_MODE_LABEL[solo.movementMode] ?? solo.movementMode}
								{solo.movementSpeed}
							</span>
						</li>
					{/if}
				</ul>
			</header>

			{#each solo.specialAbilities as ability (ability.name)}
				<MonsterAbilityBlock name={ability.name} markdown={ability.descriptionMd} />
			{/each}

			{#if solo.actions.length > 0}
				<div class="mt-3 text-base leading-relaxed">
					{#if leg.actionsIntro}
						<p class="m-0 mb-1.5 font-bold">ACTIONS: {leg.actionsIntro}</p>
					{/if}
					{#if solo.actions.length === 1}
						{@const a = solo.actions[0]!}
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
							class="m-0 list-outside list-disc space-y-1.5 pl-5 text-base leading-relaxed"
						>
							{#each solo.actions as a, i (i)}
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
		{:else}
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

						{#if member.actions.length > 0}
							<div class="mt-2 text-base leading-relaxed">
								{#if member.actions.length === 1}
									{@const a = member.actions[0]!}
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
										class="m-0 list-outside list-disc space-y-1.5 pl-5 text-base leading-relaxed"
									>
										{#each member.actions as a, ai (ai)}
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
					</div>
				{/each}
			</div>
		{/if}

		{#if leg.bloodiedMd || leg.lastStandMd}
			<div
				class="border-hairline mt-3 flex flex-col gap-3 border-t pt-3 text-base leading-relaxed sm:gap-4"
			>
				{#if leg.bloodiedMd}
					<section class="m-0">
						<h4 class="m-0 text-sm font-bold uppercase tracking-wide">Bloodied</h4>
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
{/if}
