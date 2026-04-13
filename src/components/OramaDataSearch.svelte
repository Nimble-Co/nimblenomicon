<script lang="ts">
	import { search } from '@orama/orama';
	import { onMount, tick } from 'svelte';
	import {
		ORAMA_DATA_SEARCH_TYPE_LABELS,
		ORAMA_DATA_SEARCH_TYPE_ORDER,
		type OramaDataSearchType,
	} from '../constants/orama-data-search';
	import {
		ANCESTRY_SECTION_OPTIONS,
		ARMOR_CATEGORY_OPTIONS,
		classHitDieOptions,
		classKeyStatOptions,
		MAGIC_ITEM_KIND_OPTIONS,
		MAGIC_ITEM_REWARD_OPTIONS,
		MAGIC_ITEM_SOURCE_OPTIONS,
		monsterArmorOptions,
		monsterFamilyOptions,
		monsterKindOptions,
		monsterLevelOptions,
		monsterSizeOptions,
		monsterSpeedOptions,
		spellSchoolOptions,
		spellTierOptions,
		SPELL_TARGET_FILTER_OPTIONS,
		WEAPON_CATEGORY_OPTIONS,
		ancestrySizeOptions,
	} from '../models/search-filter-options';
	import {
		buildOramaWhereForFilters,
		clearMultiFilterDim,
		documentMatchesFilters,
		emptySearchFiltersState,
		filterKeysForType,
		hasAnyActiveFilters,
		initialFiltersForType,
		setMultiFilterValue,
		type MultiSelectFilterDim,
		type SearchFiltersState,
		type SearchableGameDataDoc,
	} from '../models/search-filters';
	import { patchSearchFiltersState } from '../scripts/orama-search-filters-ui';
	import {
		getOramaDataSearchDb,
		type OramaDataSearchDb,
	} from '../scripts/orama-search-ui';
	import {
		multiDropdownSummaryText,
		pressedPillClass,
		TYPE_FILTER_MENUITEM_CLASS,
		TYPE_FILTER_PILL_CLASS,
		typeFilterLabel,
	} from '../scripts/orama-search-toolbar-constants';
	import {
		readSearchPageParams,
		setSearchPageUrl,
		stripInvalidTypeFromUrl,
	} from '../scripts/orama-search-url';

	type GameDataDoc = SearchableGameDataDoc;

	const SEARCH_LIMIT = 80;
	const SEARCH_LIMIT_FILTERED = 500;
	const BROWSE_RANDOM_COUNT = 50;
	const BROWSE_RANDOM_POOL = 500;
	const DEBOUNCE_MS = 200;

	const ORAMA_DATA_SEARCH_TYPES = new Set<string>(ORAMA_DATA_SEARCH_TYPE_ORDER);

	let query = $state('');
	let activeType = $state<OramaDataSearchType | null>(null);
	let activeFilters = $state<SearchFiltersState>(emptySearchFiltersState());
	let db = $state<OramaDataSearchDb | null>(null);
	let loading = $state(true);
	let loadError = $state<string | null>(null);
	let liveMessage = $state('');
	let collapsedTypeOpen = $state(false);

	let results = $state<GameDataDoc[]>([]);
	let secondaryWrapEl: HTMLDivElement | undefined = $state();
	let collapsedTypeWrapEl: HTMLDivElement | undefined = $state();

	const typePanelId = `orama-collapsed-type-${Math.random().toString(36).slice(2, 9)}`;

	let debounceTimer: ReturnType<typeof setTimeout> | undefined;

	function shuffleBrowseDocs<T>(items: T[]): T[] {
		const a = items.slice();
		for (let i = a.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[a[i], a[j]] = [a[j]!, a[i]!];
		}
		return a;
	}

	function announce(msg: string) {
		liveMessage = msg;
	}

	function computeResults(
		instance: OramaDataSearchDb,
		qRaw: string,
		type: OramaDataSearchType | null,
		filters: SearchFiltersState,
	): GameDataDoc[] {
		const q = qRaw.trim();
		const browseAllTypes = q.length === 0 && !type;

		if (browseAllTypes) {
			const res = search(instance, { limit: BROWSE_RANDOM_POOL });
			const pool = res.hits
				.filter(Boolean)
				.map((h) => h.document as GameDataDoc);
			return shuffleBrowseDocs(pool).slice(0, BROWSE_RANDOM_COUNT);
		}

		const fetchLimit =
			type !== null &&
			(hasAnyActiveFilters(type, filters) ||
				(type === 'class' && filters.stat.length > 0))
				? SEARCH_LIMIT_FILTERED
				: SEARCH_LIMIT;

		const builtWhere = buildOramaWhereForFilters(type, filters);
		const whereClause =
			type !== null ? (builtWhere ?? { type: type }) : undefined;

		const res =
			q.length > 0
				? search(instance, {
						term: q,
						limit: fetchLimit,
						properties: ['title', 'content', 'subtitle'],
						...(whereClause ? { where: whereClause as never } : {}),
					})
				: search(instance, {
						limit: fetchLimit,
						...(whereClause ? { where: whereClause as never } : {}),
					});

		let docs = res.hits.filter(Boolean).map((h) => h.document as GameDataDoc);
		if (type !== null) {
			docs = docs.filter((doc) => documentMatchesFilters(doc, type, filters));
		}
		return docs.slice(0, SEARCH_LIMIT);
	}

	function refreshResults() {
		if (!db) return;
		const q = query;
		const docs = computeResults(db, q, activeType, activeFilters);

		const browseAllTypes = q.trim().length === 0 && !activeType;

		const emptyMsg = browseAllTypes
			? 'No entries in the index.'
			: q.trim().length > 0
				? activeType
					? `No ${typeFilterLabel(activeType).toLowerCase()} results for “${q.trim()}”.`
					: `No results for “${q.trim()}”.`
				: `No ${typeFilterLabel(activeType!).toLowerCase()} entries in the index.`;

		if (docs.length === 0) {
			results = [];
			announce(emptyMsg);
			return;
		}

		results = docs;
		if (browseAllTypes) {
			announce(
				`${docs.length} sample ${docs.length === 1 ? 'entry' : 'entries'}`,
			);
		} else if (q.trim().length > 0) {
			announce(
				`${docs.length} result${docs.length === 1 ? '' : 's'} for ${q.trim()}`,
			);
		} else if (activeType) {
			const kind = typeFilterLabel(activeType);
			announce(
				`${docs.length} ${kind} ${docs.length === 1 ? 'entry' : 'entries'}`,
			);
		} else {
			announce(`${docs.length} result${docs.length === 1 ? '' : 's'}`);
		}
	}

	function applyFromLocation() {
		const { q, type, filters } = readSearchPageParams();
		activeType = type;
		activeFilters = filters;
		query = q;
		collapsedTypeOpen = false;
		if (db) refreshResults();
	}

	function scheduleQueryCommit() {
		if (debounceTimer) clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			debounceTimer = undefined;
			if (!db || loading) return;
			setSearchPageUrl(query.trim(), activeType, activeFilters, {
				replace: true,
			});
			refreshResults();
		}, DEBOUNCE_MS);
	}

	function onNavQueryInput(e: Event) {
		const t = e.currentTarget;
		if (!(t instanceof HTMLInputElement)) return;
		query = t.value;
		scheduleQueryCommit();
	}

	function onNavQuerySearch(e: Event) {
		const t = e.currentTarget;
		if (!(t instanceof HTMLInputElement)) return;
		if (t.value === '') onQuerySearchClear();
	}

	function onQuerySearchClear() {
		if (debounceTimer) clearTimeout(debounceTimer);
		debounceTimer = undefined;
		query = '';
		if (db) {
			setSearchPageUrl('', activeType, activeFilters, { replace: true });
			refreshResults();
		}
	}

	function selectDataType(nextType: OramaDataSearchType | null) {
		activeType = nextType;
		activeFilters =
			nextType !== null
				? initialFiltersForType(nextType)
				: emptySearchFiltersState();
		collapsedTypeOpen = false;
		const q = query.trim();
		setSearchPageUrl(q, activeType, activeFilters, { replace: false });
		if (db) refreshResults();
	}

	async function commitFiltersAndUrl(
		nextFilters: SearchFiltersState,
		reopenDropdown: MultiSelectFilterDim | null,
	) {
		activeFilters = nextFilters;
		const q = query.trim();
		setSearchPageUrl(q, activeType, activeFilters, { replace: true });
		if (db) refreshResults();
		await tick();
		if (reopenDropdown !== null && secondaryWrapEl) {
			const d = secondaryWrapEl.querySelector<HTMLDetailsElement>(
				`details[data-orama-filter-dropdown="${reopenDropdown}"]`,
			);
			if (d) d.open = true;
		}
	}

	function onTypeMenuPick(raw: string) {
		const nextType =
			raw.length === 0
				? null
				: ORAMA_DATA_SEARCH_TYPES.has(raw)
					? (raw as OramaDataSearchType)
					: null;
		if (raw.length > 0 && nextType === null) return;
		selectDataType(nextType);
	}

	function toggleTri(dim: 'minion' | 'legendary') {
		if (activeType === null) return;
		const next = patchSearchFiltersState(activeFilters, {
			kind: 'toggle-tri',
			dim,
		});
		void commitFiltersAndUrl(next, null);
	}

	function onMultiCheckbox(
		dim: MultiSelectFilterDim,
		value: string,
		checked: boolean,
	) {
		const next = setMultiFilterValue(activeFilters, dim, value, checked);
		void commitFiltersAndUrl(next, dim);
	}

	function onClearDim(dim: MultiSelectFilterDim) {
		const next = clearMultiFilterDim(activeFilters, dim);
		void commitFiltersAndUrl(next, dim);
	}

	function onClearAllFilters() {
		const next =
			activeType !== null
				? initialFiltersForType(activeType)
				: emptySearchFiltersState();
		void commitFiltersAndUrl(next, null);
	}

	function onUtilityChange(checked: boolean) {
		if (activeType !== 'spell') return;
		void commitFiltersAndUrl(
			{ ...activeFilters, utility: checked ? true : null },
			null,
		);
	}

	function onSecretChange(checked: boolean) {
		if (activeType !== 'spell') return;
		void commitFiltersAndUrl(
			{ ...activeFilters, secret: checked ? true : null },
			null,
		);
	}

	function onDocClickCollapseType(e: MouseEvent) {
		if (!collapsedTypeOpen) return;
		const t = e.target as Node | null;
		if (t && collapsedTypeWrapEl?.contains(t)) return;
		collapsedTypeOpen = false;
	}

	function onDocClickFilterDetails(e: MouseEvent) {
		const wrap = secondaryWrapEl;
		if (!wrap) return;
		const raw = e.target;
		if (!(raw instanceof Node)) return;
		const el =
			raw.nodeType === Node.ELEMENT_NODE ? (raw as Element) : raw.parentElement;
		if (!el) return;
		if (wrap.contains(el)) {
			const inside = el.closest('details');
			if (inside && wrap.contains(inside)) {
				return;
			}
		}
		for (const d of wrap.querySelectorAll('details')) {
			(d as HTMLDetailsElement).open = false;
		}
	}

	const typeLabel = (t: OramaDataSearchType) =>
		ORAMA_DATA_SEARCH_TYPE_LABELS[t] ?? t;

	function headerSearchInputs(): HTMLInputElement[] {
		const out: HTMLInputElement[] = [];
		const d = document.querySelector<HTMLInputElement>('#ss-desktop-q');
		const m = document.querySelector<HTMLInputElement>('#ss-mobile-q');
		if (d) out.push(d);
		if (m) out.push(m);
		return out;
	}

	function focusHeaderSearchIfEmpty(q: string) {
		if (q.length > 0) return;
		queueMicrotask(() => {
			const wide = window.matchMedia('(min-width: 50rem)').matches;
			const el = wide
				? document.querySelector<HTMLInputElement>('#ss-desktop-q')
				: document.querySelector<HTMLInputElement>('#ss-mobile-q');
			el?.focus();
		});
	}

	onMount(() => {
		window.addEventListener('popstate', applyFromLocation);
		document.addEventListener('click', onDocClickCollapseType, true);
		document.addEventListener('click', onDocClickFilterDetails, true);

		const navInputs = headerSearchInputs();
		for (const el of navInputs) {
			el.addEventListener('input', onNavQueryInput);
			el.addEventListener('search', onNavQuerySearch);
		}

		getOramaDataSearchDb()
			.then((instance) => {
				db = instance;
				loading = false;
				loadError = null;
				stripInvalidTypeFromUrl();
				const { q, type, filters } = readSearchPageParams();
				query = q;
				activeType = type;
				activeFilters = filters;
				refreshResults();
				focusHeaderSearchIfEmpty(q);
			})
			.catch((err: unknown) => {
				loading = false;
				const msg = err instanceof Error ? err.message : 'Unknown error';
				loadError = msg;
				announce(`Could not load search index: ${msg}`);
			});

		return () => {
			window.removeEventListener('popstate', applyFromLocation);
			document.removeEventListener('click', onDocClickCollapseType, true);
			document.removeEventListener('click', onDocClickFilterDetails, true);
			for (const el of navInputs) {
				el.removeEventListener('input', onNavQueryInput);
				el.removeEventListener('search', onNavQuerySearch);
			}
			if (debounceTimer) clearTimeout(debounceTimer);
		};
	});
</script>

<div
	class="orama-data-search not-content not-prose flex max-w-3xl flex-col gap-4"
	data-orama-root
>
	{#if activeType === null}
		<div
			class="flex flex-wrap gap-2"
			data-orama-type-filter-primary
			role="toolbar"
			aria-label="Filter by data type"
		>
			<button
				type="button"
				class="{TYPE_FILTER_PILL_CLASS} border-accent-500 bg-accent-500/15 font-medium text-fg dark:bg-accent-500/20"
				data-orama-type-filter=""
				data-pressed="true"
				aria-pressed="true"
				onclick={() => onTypeMenuPick('')}
			>
				All types
			</button>
			{#each ORAMA_DATA_SEARCH_TYPE_ORDER as t (t)}
				<button
					type="button"
					class={TYPE_FILTER_PILL_CLASS}
					data-orama-type-filter={t}
					data-pressed="false"
					aria-pressed="false"
					onclick={() => onTypeMenuPick(t)}
				>
					{typeFilterLabel(t)}
				</button>
			{/each}
		</div>
	{/if}

	{#if activeType !== null}
		<div
			class="flex w-full min-w-0 flex-wrap items-center gap-2"
			data-orama-toolbar-row
		>
			<div
				class="min-w-0 shrink-0"
				data-orama-type-filter-bar
				role="toolbar"
				aria-label="Filter by data type"
			>
				<div class="flex min-w-0 items-center gap-2">
					<div class="relative shrink-0" bind:this={collapsedTypeWrapEl}>
						<button
							type="button"
							class="{TYPE_FILTER_PILL_CLASS} gap-1"
							data-orama-collapsed-type-toggle
							aria-expanded={collapsedTypeOpen}
							aria-haspopup="true"
							aria-controls={typePanelId}
							onclick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								collapsedTypeOpen = !collapsedTypeOpen;
							}}
						>
							<span data-orama-collapsed-type-label
								>{typeFilterLabel(activeType)}</span
							>
							{' '}
							<span class="text-fg-muted" aria-hidden="true">▾</span>
						</button>
						<div
							id={typePanelId}
							class="border-hairline bg-surface absolute top-full left-0 z-50 mt-1 flex min-w-[12rem] flex-col divide-y divide-hairline overflow-hidden rounded-lg border py-0 shadow-lg {collapsedTypeOpen
								? ''
								: 'hidden'}"
							role="menu"
							aria-hidden={collapsedTypeOpen ? 'false' : 'true'}
							data-orama-collapsed-type-panel
						>
							<button
								type="button"
								class={TYPE_FILTER_MENUITEM_CLASS}
								data-orama-type-filter=""
								role="menuitem"
								onclick={() => onTypeMenuPick('')}
							>
								All types
							</button>
							{#each ORAMA_DATA_SEARCH_TYPE_ORDER as t (t)}
								<button
									type="button"
									class="{TYPE_FILTER_MENUITEM_CLASS} {t === activeType
										? 'border-l-2 border-accent-500 pl-2.5'
										: ''}"
									data-orama-type-filter={t}
									role="menuitem"
									onclick={() => onTypeMenuPick(t)}
								>
									{typeFilterLabel(t)}
								</button>
							{/each}
						</div>
					</div>
				</div>
			</div>

			{#if filterKeysForType(activeType).length > 0}
				<div
					class="flex min-w-0 flex-1 flex-wrap items-center gap-2"
					data-orama-secondary-wrap
					bind:this={secondaryWrapEl}
				>
					<div
						class="flex min-h-0 min-w-0 flex-1 flex-wrap items-center gap-2"
						data-orama-secondary-inner
					>
						{#if activeType === 'spell'}
							<div class="relative shrink-0">
								<details
									class="group relative"
									data-orama-filter-dropdown="tier"
								>
									<summary
										class="{TYPE_FILTER_PILL_CLASS} flex cursor-pointer list-none items-center justify-between gap-2 py-2 pr-3 pl-3 [&::-webkit-details-marker]:hidden"
									>
										<div
											class="flex min-w-0 flex-col items-start gap-0 text-left"
										>
											<span
												class="text-[0.65rem] font-medium uppercase tracking-wide text-fg-muted"
												>Tier</span
											>
											<span class="max-w-[11rem] truncate text-sm text-fg"
												>{multiDropdownSummaryText(
													activeFilters.tier,
													spellTierOptions(),
												)}</span
											>
										</div>
										<span class="text-fg-muted shrink-0" aria-hidden="true"
											>▾</span
										>
									</summary>
									<div
										class="border-hairline bg-surface absolute left-0 top-full z-[60] mt-1 flex max-h-[min(70vh,20rem)] min-w-[12rem] flex-col overflow-hidden rounded-lg border shadow-lg"
										role="group"
										aria-label="Tier"
										onclick={(e) => e.stopPropagation()}
									>
										<div
											class="min-h-0 flex-1 overflow-y-auto overflow-x-hidden py-2"
										>
											{#each spellTierOptions() as opt (opt.value)}
												<label
													class="flex cursor-pointer items-center gap-2.5 px-3 py-1.5 text-sm text-fg hover:bg-gray-100 dark:hover:bg-gray-800/80"
												>
													<input
														type="checkbox"
														class="border-hairline shrink-0 rounded text-accent-600 focus:ring-2 focus:ring-accent-500/30"
														checked={activeFilters.tier.includes(opt.value)}
														onchange={(e) =>
															onMultiCheckbox(
																'tier',
																opt.value,
																e.currentTarget.checked,
															)}
													/>
													<span>{opt.label}</span>
												</label>
											{/each}
										</div>
										<div
											class="shrink-0 border-t border-hairline bg-surface px-2 py-2"
										>
											<button
												type="button"
												class="w-full rounded-md px-2 py-1.5 text-left text-sm text-fg-muted transition-colors hover:bg-gray-100 hover:text-fg dark:hover:bg-gray-800/80"
												onclick={() => onClearDim('tier')}
											>
												Clear
											</button>
										</div>
									</div>
								</details>
							</div>
							<div class="relative shrink-0">
								<details
									class="group relative"
									data-orama-filter-dropdown="school"
								>
									<summary
										class="{TYPE_FILTER_PILL_CLASS} flex cursor-pointer list-none items-center justify-between gap-2 py-2 pr-3 pl-3 [&::-webkit-details-marker]:hidden"
									>
										<div
											class="flex min-w-0 flex-col items-start gap-0 text-left"
										>
											<span
												class="text-[0.65rem] font-medium uppercase tracking-wide text-fg-muted"
												>School</span
											>
											<span class="max-w-[11rem] truncate text-sm text-fg"
												>{multiDropdownSummaryText(
													activeFilters.school,
													spellSchoolOptions(),
												)}</span
											>
										</div>
										<span class="text-fg-muted shrink-0" aria-hidden="true"
											>▾</span
										>
									</summary>
									<div
										class="border-hairline bg-surface absolute left-0 top-full z-[60] mt-1 flex max-h-[min(70vh,20rem)] min-w-[12rem] flex-col overflow-hidden rounded-lg border shadow-lg"
										role="group"
										aria-label="School"
										onclick={(e) => e.stopPropagation()}
									>
										<div
											class="min-h-0 flex-1 overflow-y-auto overflow-x-hidden py-2"
										>
											{#each spellSchoolOptions() as opt (opt.value)}
												<label
													class="flex cursor-pointer items-center gap-2.5 px-3 py-1.5 text-sm text-fg hover:bg-gray-100 dark:hover:bg-gray-800/80"
												>
													<input
														type="checkbox"
														class="border-hairline shrink-0 rounded text-accent-600 focus:ring-2 focus:ring-accent-500/30"
														checked={activeFilters.school.includes(opt.value)}
														onchange={(e) =>
															onMultiCheckbox(
																'school',
																opt.value,
																e.currentTarget.checked,
															)}
													/>
													<span>{opt.label}</span>
												</label>
											{/each}
										</div>
										<div
											class="shrink-0 border-t border-hairline bg-surface px-2 py-2"
										>
											<button
												type="button"
												class="w-full rounded-md px-2 py-1.5 text-left text-sm text-fg-muted transition-colors hover:bg-gray-100 hover:text-fg dark:hover:bg-gray-800/80"
												onclick={() => onClearDim('school')}
											>
												Clear
											</button>
										</div>
									</div>
								</details>
							</div>
							<div class="relative shrink-0">
								<details
									class="group relative"
									data-orama-filter-dropdown="target"
								>
									<summary
										class="{TYPE_FILTER_PILL_CLASS} flex cursor-pointer list-none items-center justify-between gap-2 py-2 pr-3 pl-3 [&::-webkit-details-marker]:hidden"
									>
										<div
											class="flex min-w-0 flex-col items-start gap-0 text-left"
										>
											<span
												class="text-[0.65rem] font-medium uppercase tracking-wide text-fg-muted"
												>Target</span
											>
											<span class="max-w-[11rem] truncate text-sm text-fg"
												>{multiDropdownSummaryText(
													activeFilters.target,
													SPELL_TARGET_FILTER_OPTIONS,
												)}</span
											>
										</div>
										<span class="text-fg-muted shrink-0" aria-hidden="true"
											>▾</span
										>
									</summary>
									<div
										class="border-hairline bg-surface absolute left-0 top-full z-[60] mt-1 flex max-h-[min(70vh,20rem)] min-w-[12rem] flex-col overflow-hidden rounded-lg border shadow-lg"
										role="group"
										aria-label="Target"
										onclick={(e) => e.stopPropagation()}
									>
										<div
											class="min-h-0 flex-1 overflow-y-auto overflow-x-hidden py-2"
										>
											{#each SPELL_TARGET_FILTER_OPTIONS as opt (opt.value)}
												<label
													class="flex cursor-pointer items-center gap-2.5 px-3 py-1.5 text-sm text-fg hover:bg-gray-100 dark:hover:bg-gray-800/80"
												>
													<input
														type="checkbox"
														class="border-hairline shrink-0 rounded text-accent-600 focus:ring-2 focus:ring-accent-500/30"
														checked={activeFilters.target.includes(opt.value)}
														onchange={(e) =>
															onMultiCheckbox(
																'target',
																opt.value,
																e.currentTarget.checked,
															)}
													/>
													<span>{opt.label}</span>
												</label>
											{/each}
										</div>
										<div
											class="shrink-0 border-t border-hairline bg-surface px-2 py-2"
										>
											<button
												type="button"
												class="w-full rounded-md px-2 py-1.5 text-left text-sm text-fg-muted transition-colors hover:bg-gray-100 hover:text-fg dark:hover:bg-gray-800/80"
												onclick={() => onClearDim('target')}
											>
												Clear
											</button>
										</div>
									</div>
								</details>
							</div>
							<label
								class="shrink-0 flex cursor-pointer items-center gap-2 text-sm text-fg"
							>
								<input
									type="checkbox"
									class="border-hairline shrink-0 rounded text-accent-600 focus:ring-2 focus:ring-accent-500/30"
									checked={activeFilters.utility === true}
									onchange={(e) => onUtilityChange(e.currentTarget.checked)}
								/>
								<span>Utility spells</span>
							</label>
							<label
								class="shrink-0 flex cursor-pointer items-center gap-2 text-sm text-fg"
							>
								<input
									type="checkbox"
									class="border-hairline shrink-0 rounded text-accent-600 focus:ring-2 focus:ring-accent-500/30"
									checked={activeFilters.secret === true}
									onchange={(e) => onSecretChange(e.currentTarget.checked)}
								/>
								<span>Secret spells</span>
							</label>
						{:else if activeType === 'monster'}
							{#each [{ dim: 'level' as const, label: 'Level', opts: monsterLevelOptions() }, { dim: 'family' as const, label: 'Family', opts: monsterFamilyOptions() }, { dim: 'kind' as const, label: 'Kind', opts: monsterKindOptions() }, { dim: 'armor' as const, label: 'Armor', opts: monsterArmorOptions() }, { dim: 'speed' as const, label: 'Speed', opts: monsterSpeedOptions() }, { dim: 'size' as const, label: 'Size', opts: monsterSizeOptions() }] as row (row.dim)}
								<div class="relative shrink-0">
									<details
										class="group relative"
										data-orama-filter-dropdown={row.dim}
									>
										<summary
											class="{TYPE_FILTER_PILL_CLASS} flex cursor-pointer list-none items-center justify-between gap-2 py-2 pr-3 pl-3 [&::-webkit-details-marker]:hidden"
										>
											<div
												class="flex min-w-0 flex-col items-start gap-0 text-left"
											>
												<span
													class="text-[0.65rem] font-medium uppercase tracking-wide text-fg-muted"
													>{row.label}</span
												>
												<span class="max-w-[11rem] truncate text-sm text-fg"
													>{multiDropdownSummaryText(
														activeFilters[row.dim],
														row.opts,
													)}</span
												>
											</div>
											<span class="text-fg-muted shrink-0" aria-hidden="true"
												>▾</span
											>
										</summary>
										<div
											class="border-hairline bg-surface absolute left-0 top-full z-[60] mt-1 flex max-h-[min(70vh,20rem)] min-w-[12rem] flex-col overflow-hidden rounded-lg border shadow-lg"
											role="group"
											aria-label={row.label}
											onclick={(e) => e.stopPropagation()}
										>
											<div
												class="min-h-0 flex-1 overflow-y-auto overflow-x-hidden py-2"
											>
												{#each row.opts as opt (opt.value)}
													<label
														class="flex cursor-pointer items-center gap-2.5 px-3 py-1.5 text-sm text-fg hover:bg-gray-100 dark:hover:bg-gray-800/80"
													>
														<input
															type="checkbox"
															class="border-hairline shrink-0 rounded text-accent-600 focus:ring-2 focus:ring-accent-500/30"
															checked={activeFilters[row.dim].includes(
																opt.value,
															)}
															onchange={(e) =>
																onMultiCheckbox(
																	row.dim,
																	opt.value,
																	e.currentTarget.checked,
																)}
														/>
														<span>{opt.label}</span>
													</label>
												{/each}
											</div>
											<div
												class="shrink-0 border-t border-hairline bg-surface px-2 py-2"
											>
												<button
													type="button"
													class="w-full rounded-md px-2 py-1.5 text-left text-sm text-fg-muted transition-colors hover:bg-gray-100 hover:text-fg dark:hover:bg-gray-800/80"
													onclick={() => onClearDim(row.dim)}
												>
													Clear
												</button>
											</div>
										</div>
									</details>
								</div>
							{/each}
							<button
								type="button"
								class={pressedPillClass(activeFilters.minion === true)}
								data-orama-filter-tri
								data-orama-filter-dim="minion"
								onclick={() => toggleTri('minion')}
							>
								Minion
							</button>
							<button
								type="button"
								class={pressedPillClass(activeFilters.legendary === true)}
								data-orama-filter-tri
								data-orama-filter-dim="legendary"
								onclick={() => toggleTri('legendary')}
							>
								Legendary
							</button>
						{:else if activeType === 'class'}
							{#each [{ dim: 'stat' as const, label: 'Key stat', opts: classKeyStatOptions() }, { dim: 'hitdie' as const, label: 'Hit die', opts: classHitDieOptions() }] as row (row.dim)}
								<div class="relative shrink-0">
									<details
										class="group relative"
										data-orama-filter-dropdown={row.dim}
									>
										<summary
											class="{TYPE_FILTER_PILL_CLASS} flex cursor-pointer list-none items-center justify-between gap-2 py-2 pr-3 pl-3 [&::-webkit-details-marker]:hidden"
										>
											<div
												class="flex min-w-0 flex-col items-start gap-0 text-left"
											>
												<span
													class="text-[0.65rem] font-medium uppercase tracking-wide text-fg-muted"
													>{row.label}</span
												>
												<span class="max-w-[11rem] truncate text-sm text-fg"
													>{multiDropdownSummaryText(
														activeFilters[row.dim],
														row.opts,
													)}</span
												>
											</div>
											<span class="text-fg-muted shrink-0" aria-hidden="true"
												>▾</span
											>
										</summary>
										<div
											class="border-hairline bg-surface absolute left-0 top-full z-[60] mt-1 flex max-h-[min(70vh,20rem)] min-w-[12rem] flex-col overflow-hidden rounded-lg border shadow-lg"
											role="group"
											aria-label={row.label}
											onclick={(e) => e.stopPropagation()}
										>
											<div
												class="min-h-0 flex-1 overflow-y-auto overflow-x-hidden py-2"
											>
												{#each row.opts as opt (opt.value)}
													<label
														class="flex cursor-pointer items-center gap-2.5 px-3 py-1.5 text-sm text-fg hover:bg-gray-100 dark:hover:bg-gray-800/80"
													>
														<input
															type="checkbox"
															class="border-hairline shrink-0 rounded text-accent-600 focus:ring-2 focus:ring-accent-500/30"
															checked={activeFilters[row.dim].includes(
																opt.value,
															)}
															onchange={(e) =>
																onMultiCheckbox(
																	row.dim,
																	opt.value,
																	e.currentTarget.checked,
																)}
														/>
														<span>{opt.label}</span>
													</label>
												{/each}
											</div>
											<div
												class="shrink-0 border-t border-hairline bg-surface px-2 py-2"
											>
												<button
													type="button"
													class="w-full rounded-md px-2 py-1.5 text-left text-sm text-fg-muted transition-colors hover:bg-gray-100 hover:text-fg dark:hover:bg-gray-800/80"
													onclick={() => onClearDim(row.dim)}
												>
													Clear
												</button>
											</div>
										</div>
									</details>
								</div>
							{/each}
						{:else if activeType === 'weapon'}
							<div class="relative shrink-0">
								<details
									class="group relative"
									data-orama-filter-dropdown="category"
								>
									<summary
										class="{TYPE_FILTER_PILL_CLASS} flex cursor-pointer list-none items-center justify-between gap-2 py-2 pr-3 pl-3 [&::-webkit-details-marker]:hidden"
									>
										<div
											class="flex min-w-0 flex-col items-start gap-0 text-left"
										>
											<span
												class="text-[0.65rem] font-medium uppercase tracking-wide text-fg-muted"
												>Category</span
											>
											<span class="max-w-[11rem] truncate text-sm text-fg"
												>{multiDropdownSummaryText(
													activeFilters.category,
													WEAPON_CATEGORY_OPTIONS,
												)}</span
											>
										</div>
										<span class="text-fg-muted shrink-0" aria-hidden="true"
											>▾</span
										>
									</summary>
									<div
										class="border-hairline bg-surface absolute left-0 top-full z-[60] mt-1 flex max-h-[min(70vh,20rem)] min-w-[12rem] flex-col overflow-hidden rounded-lg border shadow-lg"
										role="group"
										aria-label="Category"
										onclick={(e) => e.stopPropagation()}
									>
										<div
											class="min-h-0 flex-1 overflow-y-auto overflow-x-hidden py-2"
										>
											{#each WEAPON_CATEGORY_OPTIONS as opt (opt.value)}
												<label
													class="flex cursor-pointer items-center gap-2.5 px-3 py-1.5 text-sm text-fg hover:bg-gray-100 dark:hover:bg-gray-800/80"
												>
													<input
														type="checkbox"
														class="border-hairline shrink-0 rounded text-accent-600 focus:ring-2 focus:ring-accent-500/30"
														checked={activeFilters.category.includes(opt.value)}
														onchange={(e) =>
															onMultiCheckbox(
																'category',
																opt.value,
																e.currentTarget.checked,
															)}
													/>
													<span>{opt.label}</span>
												</label>
											{/each}
										</div>
										<div
											class="shrink-0 border-t border-hairline bg-surface px-2 py-2"
										>
											<button
												type="button"
												class="w-full rounded-md px-2 py-1.5 text-left text-sm text-fg-muted transition-colors hover:bg-gray-100 hover:text-fg dark:hover:bg-gray-800/80"
												onclick={() => onClearDim('category')}
											>
												Clear
											</button>
										</div>
									</div>
								</details>
							</div>
						{:else if activeType === 'ancestry'}
							{#each [{ dim: 'section' as const, label: 'Section', opts: ANCESTRY_SECTION_OPTIONS }, { dim: 'size' as const, label: 'Size', opts: ancestrySizeOptions() }] as row (row.dim)}
								<div class="relative shrink-0">
									<details
										class="group relative"
										data-orama-filter-dropdown={row.dim}
									>
										<summary
											class="{TYPE_FILTER_PILL_CLASS} flex cursor-pointer list-none items-center justify-between gap-2 py-2 pr-3 pl-3 [&::-webkit-details-marker]:hidden"
										>
											<div
												class="flex min-w-0 flex-col items-start gap-0 text-left"
											>
												<span
													class="text-[0.65rem] font-medium uppercase tracking-wide text-fg-muted"
													>{row.label}</span
												>
												<span class="max-w-[11rem] truncate text-sm text-fg"
													>{multiDropdownSummaryText(
														activeFilters[row.dim],
														row.opts,
													)}</span
												>
											</div>
											<span class="text-fg-muted shrink-0" aria-hidden="true"
												>▾</span
											>
										</summary>
										<div
											class="border-hairline bg-surface absolute left-0 top-full z-[60] mt-1 flex max-h-[min(70vh,20rem)] min-w-[12rem] flex-col overflow-hidden rounded-lg border shadow-lg"
											role="group"
											aria-label={row.label}
											onclick={(e) => e.stopPropagation()}
										>
											<div
												class="min-h-0 flex-1 overflow-y-auto overflow-x-hidden py-2"
											>
												{#each row.opts as opt (opt.value)}
													<label
														class="flex cursor-pointer items-center gap-2.5 px-3 py-1.5 text-sm text-fg hover:bg-gray-100 dark:hover:bg-gray-800/80"
													>
														<input
															type="checkbox"
															class="border-hairline shrink-0 rounded text-accent-600 focus:ring-2 focus:ring-accent-500/30"
															checked={activeFilters[row.dim].includes(
																opt.value,
															)}
															onchange={(e) =>
																onMultiCheckbox(
																	row.dim,
																	opt.value,
																	e.currentTarget.checked,
																)}
														/>
														<span>{opt.label}</span>
													</label>
												{/each}
											</div>
											<div
												class="shrink-0 border-t border-hairline bg-surface px-2 py-2"
											>
												<button
													type="button"
													class="w-full rounded-md px-2 py-1.5 text-left text-sm text-fg-muted transition-colors hover:bg-gray-100 hover:text-fg dark:hover:bg-gray-800/80"
													onclick={() => onClearDim(row.dim)}
												>
													Clear
												</button>
											</div>
										</div>
									</details>
								</div>
							{/each}
						{:else if activeType === 'armor'}
							<div class="relative shrink-0">
								<details
									class="group relative"
									data-orama-filter-dropdown="category"
								>
									<summary
										class="{TYPE_FILTER_PILL_CLASS} flex cursor-pointer list-none items-center justify-between gap-2 py-2 pr-3 pl-3 [&::-webkit-details-marker]:hidden"
									>
										<div
											class="flex min-w-0 flex-col items-start gap-0 text-left"
										>
											<span
												class="text-[0.65rem] font-medium uppercase tracking-wide text-fg-muted"
												>Category</span
											>
											<span class="max-w-[11rem] truncate text-sm text-fg"
												>{multiDropdownSummaryText(
													activeFilters.category,
													ARMOR_CATEGORY_OPTIONS,
												)}</span
											>
										</div>
										<span class="text-fg-muted shrink-0" aria-hidden="true"
											>▾</span
										>
									</summary>
									<div
										class="border-hairline bg-surface absolute left-0 top-full z-[60] mt-1 flex max-h-[min(70vh,20rem)] min-w-[12rem] flex-col overflow-hidden rounded-lg border shadow-lg"
										role="group"
										aria-label="Category"
										onclick={(e) => e.stopPropagation()}
									>
										<div
											class="min-h-0 flex-1 overflow-y-auto overflow-x-hidden py-2"
										>
											{#each ARMOR_CATEGORY_OPTIONS as opt (opt.value)}
												<label
													class="flex cursor-pointer items-center gap-2.5 px-3 py-1.5 text-sm text-fg hover:bg-gray-100 dark:hover:bg-gray-800/80"
												>
													<input
														type="checkbox"
														class="border-hairline shrink-0 rounded text-accent-600 focus:ring-2 focus:ring-accent-500/30"
														checked={activeFilters.category.includes(opt.value)}
														onchange={(e) =>
															onMultiCheckbox(
																'category',
																opt.value,
																e.currentTarget.checked,
															)}
													/>
													<span>{opt.label}</span>
												</label>
											{/each}
										</div>
										<div
											class="shrink-0 border-t border-hairline bg-surface px-2 py-2"
										>
											<button
												type="button"
												class="w-full rounded-md px-2 py-1.5 text-left text-sm text-fg-muted transition-colors hover:bg-gray-100 hover:text-fg dark:hover:bg-gray-800/80"
												onclick={() => onClearDim('category')}
											>
												Clear
											</button>
										</div>
									</div>
								</details>
							</div>
						{:else if activeType === 'magic-item'}
							{#each [{ dim: 'kind' as const, label: 'Kind', opts: MAGIC_ITEM_KIND_OPTIONS }, { dim: 'source' as const, label: 'Source', opts: MAGIC_ITEM_SOURCE_OPTIONS }, { dim: 'reward' as const, label: 'Reward', opts: MAGIC_ITEM_REWARD_OPTIONS }] as row (row.dim)}
								<div class="relative shrink-0">
									<details
										class="group relative"
										data-orama-filter-dropdown={row.dim}
									>
										<summary
											class="{TYPE_FILTER_PILL_CLASS} flex cursor-pointer list-none items-center justify-between gap-2 py-2 pr-3 pl-3 [&::-webkit-details-marker]:hidden"
										>
											<div
												class="flex min-w-0 flex-col items-start gap-0 text-left"
											>
												<span
													class="text-[0.65rem] font-medium uppercase tracking-wide text-fg-muted"
													>{row.label}</span
												>
												<span class="max-w-[11rem] truncate text-sm text-fg"
													>{multiDropdownSummaryText(
														activeFilters[row.dim],
														row.opts,
													)}</span
												>
											</div>
											<span class="text-fg-muted shrink-0" aria-hidden="true"
												>▾</span
											>
										</summary>
										<div
											class="border-hairline bg-surface absolute left-0 top-full z-[60] mt-1 flex max-h-[min(70vh,20rem)] min-w-[12rem] flex-col overflow-hidden rounded-lg border shadow-lg"
											role="group"
											aria-label={row.label}
											onclick={(e) => e.stopPropagation()}
										>
											<div
												class="min-h-0 flex-1 overflow-y-auto overflow-x-hidden py-2"
											>
												{#each row.opts as opt (opt.value)}
													<label
														class="flex cursor-pointer items-center gap-2.5 px-3 py-1.5 text-sm text-fg hover:bg-gray-100 dark:hover:bg-gray-800/80"
													>
														<input
															type="checkbox"
															class="border-hairline shrink-0 rounded text-accent-600 focus:ring-2 focus:ring-accent-500/30"
															checked={activeFilters[row.dim].includes(
																opt.value,
															)}
															onchange={(e) =>
																onMultiCheckbox(
																	row.dim,
																	opt.value,
																	e.currentTarget.checked,
																)}
														/>
														<span>{opt.label}</span>
													</label>
												{/each}
											</div>
											<div
												class="shrink-0 border-t border-hairline bg-surface px-2 py-2"
											>
												<button
													type="button"
													class="w-full rounded-md px-2 py-1.5 text-left text-sm text-fg-muted transition-colors hover:bg-gray-100 hover:text-fg dark:hover:bg-gray-800/80"
													onclick={() => onClearDim(row.dim)}
												>
													Clear
												</button>
											</div>
										</div>
									</details>
								</div>
							{/each}
						{/if}

						<button
							type="button"
							class="text-fg-muted hover:text-fg shrink-0 text-sm underline decoration-fg/30 underline-offset-2"
							data-orama-clear-filters
							onclick={onClearAllFilters}
						>
							Clear all filters
						</button>
					</div>
				</div>
			{/if}
		</div>
	{/if}

	<div class="sr-only" aria-live="polite" data-orama-search-live>
		{liveMessage}
	</div>

	<div class="m-0" data-orama-search-results>
		{#if loadError}
			<p class="text-danger mt-4">Could not load search index: {loadError}</p>
		{:else if !loading && results.length === 0}
			<p class="text-fg-muted mt-4">
				{#if query.trim().length === 0 && !activeType}
					No entries in the index.
				{:else if query.trim().length > 0}
					{#if activeType}
						No {typeFilterLabel(activeType).toLowerCase()} results for “{query.trim()}”.
					{:else}
						No results for “{query.trim()}”.
					{/if}
				{:else if activeType}
					No {typeFilterLabel(activeType).toLowerCase()} entries in the index.
				{/if}
			</p>
		{:else}
			<ul class="mt-3 list-none divide-y divide-hairline p-0">
				{#each results as doc (doc.id)}
					<li class="flex flex-col gap-0.5 py-2">
						<div
							class="text-xs font-medium uppercase tracking-wide text-fg-muted leading-none"
						>
							{typeLabel(doc.type)}
						</div>
						<div class="text-sm leading-snug text-fg-muted">
							{#if doc.href}
								<a
									href={doc.href}
									class="text-fg font-medium underline decoration-fg/30 underline-offset-2 hover:decoration-fg"
								>
									{doc.title}
								</a>
								{#if doc.subtitle}
									{' — '}{doc.subtitle}
								{/if}
							{:else}
								<span class="text-fg font-medium">{doc.title}</span>
								{#if doc.subtitle}
									{' — '}{doc.subtitle}
								{/if}
							{/if}
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>
