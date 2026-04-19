<script lang="ts">
	import { search } from '@orama/orama';
	import { onMount, tick } from 'svelte';
	import {
		ORAMA_DATA_SEARCH_TYPE_ORDER,
		type OramaDataSearchType,
	} from '../../constants/orama-data-search';
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
	} from '../../models/search-filter-options';
	import {
		buildOramaWhereForFilters,
		clearMultiFilterDim,
		documentMatchesFilters,
		emptySearchFiltersState,
		filterKeysForType,
		hasAnyActiveFilters,
		initialFiltersForType,
		patchSearchFiltersState,
		setMultiFilterValue,
		type MultiSelectFilterDim,
		type SearchFiltersState,
		type SearchableGameDataDoc,
	} from '../../models/search-filters';
	import {
		getOramaDataSearchDb,
		type OramaDataSearchDb,
	} from '../../search/orama-search-db';
	import {
		FILTER_MULTI_LABEL_CLASS,
		FILTER_TOOLBAR_LABEL_SPACER_CLASS,
		FILTER_TOOLBAR_OPTIONS_ROW_CLASS,
		pressedPillClass,
		typeFilterLabel,
	} from './toolbar-styles';
	import OramaSearchFilterCheckboxLabel from './OramaSearchFilterCheckboxLabel.svelte';
	import OramaSearchMultiFilterDropdown from './OramaSearchMultiFilterDropdown.svelte';
	import OramaSearchTypePicker from './OramaSearchTypePicker.svelte';
	import SearchResultCard from './cards/SearchResultCard.svelte';
	import {
		readSearchPageParams,
		setSearchPageUrl,
		stripInvalidTypeFromUrl,
	} from '../../search/orama-search-url';

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

	const MONSTER_FILTER_ROWS = [
		{ dim: 'level' as const, label: 'Level', getOpts: monsterLevelOptions },
		{ dim: 'family' as const, label: 'Family', getOpts: monsterFamilyOptions },
		{ dim: 'kind' as const, label: 'Kind', getOpts: monsterKindOptions },
		{ dim: 'armor' as const, label: 'Armor', getOpts: monsterArmorOptions },
		{ dim: 'speed' as const, label: 'Speed', getOpts: monsterSpeedOptions },
		{ dim: 'size' as const, label: 'Size', getOpts: monsterSizeOptions },
	] as const;

	const CLASS_FILTER_ROWS = [
		{ dim: 'stat' as const, label: 'Key stat', getOpts: classKeyStatOptions },
		{ dim: 'hitdie' as const, label: 'Hit die', getOpts: classHitDieOptions },
	] as const;

	const ANCESTRY_FILTER_ROWS = [
		{
			dim: 'section' as const,
			label: 'Section',
			getOpts: () => ANCESTRY_SECTION_OPTIONS,
		},
		{ dim: 'size' as const, label: 'Size', getOpts: ancestrySizeOptions },
	] as const;

	const MAGIC_ITEM_FILTER_ROWS = [
		{
			dim: 'kind' as const,
			label: 'Kind',
			getOpts: () => MAGIC_ITEM_KIND_OPTIONS,
		},
		{
			dim: 'source' as const,
			label: 'Source',
			getOpts: () => MAGIC_ITEM_SOURCE_OPTIONS,
		},
		{
			dim: 'reward' as const,
			label: 'Reward',
			getOpts: () => MAGIC_ITEM_REWARD_OPTIONS,
		},
	] as const;

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
	class="orama-data-search not-content not-prose flex max-w-3xl flex-col gap-8"
	data-orama-root
>
	{#if activeType === null}
		<OramaSearchTypePicker
			mode="primary"
			{activeType}
			{typePanelId}
			{onTypeMenuPick}
		/>
	{/if}

	{#if activeType !== null}
		<div
			class="flex w-full min-w-0 flex-wrap items-end gap-x-3 gap-y-3 border-b border-hairline pb-3 sm:gap-x-4 sm:pb-4"
			data-orama-toolbar-row
			data-orama-secondary-wrap
			data-orama-filter-toolbar
			bind:this={secondaryWrapEl}
		>
			<OramaSearchTypePicker
				mode="collapsed"
				{activeType}
				bind:collapsedTypeOpen
				bind:collapsedTypeWrapEl
				{typePanelId}
				{onTypeMenuPick}
			/>

			{#if filterKeysForType(activeType).length > 0}
				{#if activeType === 'spell'}
					<OramaSearchMultiFilterDropdown
						dim="tier"
						label="Tier"
						selectedValues={activeFilters.tier}
						options={spellTierOptions()}
						onCheckboxChange={(value, checked) =>
							onMultiCheckbox('tier', value, checked)}
						onClear={() => onClearDim('tier')}
					/>
					<OramaSearchMultiFilterDropdown
						dim="school"
						label="School"
						selectedValues={activeFilters.school}
						options={spellSchoolOptions()}
						onCheckboxChange={(value, checked) =>
							onMultiCheckbox('school', value, checked)}
						onClear={() => onClearDim('school')}
					/>
					<OramaSearchMultiFilterDropdown
						dim="target"
						label="Target"
						selectedValues={activeFilters.target}
						options={SPELL_TARGET_FILTER_OPTIONS}
						onCheckboxChange={(value, checked) =>
							onMultiCheckbox('target', value, checked)}
						onClear={() => onClearDim('target')}
					/>
					<div
						class="flex min-w-0 flex-col gap-1"
						data-orama-toolbar-spell-options
					>
						<span class="{FILTER_MULTI_LABEL_CLASS} whitespace-nowrap"
							>Options</span
						>
						<div class={FILTER_TOOLBAR_OPTIONS_ROW_CLASS}>
							<OramaSearchFilterCheckboxLabel
								checked={activeFilters.utility === true}
								text="Utility spells"
								onChange={onUtilityChange}
							/>
							<OramaSearchFilterCheckboxLabel
								checked={activeFilters.secret === true}
								text="Secret spells"
								onChange={onSecretChange}
							/>
							<button
								type="button"
								class="text-fg-muted hover:text-fg inline-flex shrink-0 bg-transparent px-1 py-0 text-sm font-medium underline decoration-fg/25 underline-offset-2 transition-colors hover:decoration-fg/50"
								data-orama-clear-filters
								onclick={onClearAllFilters}
							>
								Clear all filters
							</button>
						</div>
					</div>
				{:else if activeType === 'monster'}
					{#each MONSTER_FILTER_ROWS as row (row.dim)}
						<OramaSearchMultiFilterDropdown
							dim={row.dim}
							label={row.label}
							selectedValues={activeFilters[row.dim]}
							options={row.getOpts()}
							onCheckboxChange={(value, checked) =>
								onMultiCheckbox(row.dim, value, checked)}
							onClear={() => onClearDim(row.dim)}
						/>
					{/each}
					<div class="flex min-w-0 flex-col gap-1" data-orama-toolbar-traits>
						<span class="{FILTER_MULTI_LABEL_CLASS} whitespace-nowrap"
							>Traits</span
						>
						<div class={FILTER_TOOLBAR_OPTIONS_ROW_CLASS}>
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
						</div>
					</div>
				{:else if activeType === 'class'}
					{#each CLASS_FILTER_ROWS as row (row.dim)}
						<OramaSearchMultiFilterDropdown
							dim={row.dim}
							label={row.label}
							selectedValues={activeFilters[row.dim]}
							options={row.getOpts()}
							onCheckboxChange={(value, checked) =>
								onMultiCheckbox(row.dim, value, checked)}
							onClear={() => onClearDim(row.dim)}
						/>
					{/each}
				{:else if activeType === 'weapon'}
					<OramaSearchMultiFilterDropdown
						dim="category"
						label="Category"
						selectedValues={activeFilters.category}
						options={WEAPON_CATEGORY_OPTIONS}
						onCheckboxChange={(value, checked) =>
							onMultiCheckbox('category', value, checked)}
						onClear={() => onClearDim('category')}
					/>
				{:else if activeType === 'ancestry'}
					{#each ANCESTRY_FILTER_ROWS as row (row.dim)}
						<OramaSearchMultiFilterDropdown
							dim={row.dim}
							label={row.label}
							selectedValues={activeFilters[row.dim]}
							options={row.getOpts()}
							onCheckboxChange={(value, checked) =>
								onMultiCheckbox(row.dim, value, checked)}
							onClear={() => onClearDim(row.dim)}
						/>
					{/each}
				{:else if activeType === 'armor'}
					<OramaSearchMultiFilterDropdown
						dim="category"
						label="Category"
						selectedValues={activeFilters.category}
						options={ARMOR_CATEGORY_OPTIONS}
						onCheckboxChange={(value, checked) =>
							onMultiCheckbox('category', value, checked)}
						onClear={() => onClearDim('category')}
					/>
				{:else if activeType === 'magic-item'}
					{#each MAGIC_ITEM_FILTER_ROWS as row (row.dim)}
						<OramaSearchMultiFilterDropdown
							dim={row.dim}
							label={row.label}
							selectedValues={activeFilters[row.dim]}
							options={row.getOpts()}
							onCheckboxChange={(value, checked) =>
								onMultiCheckbox(row.dim, value, checked)}
							onClear={() => onClearDim(row.dim)}
						/>
					{/each}
				{/if}

				{#if activeType !== 'spell'}
					<div class="flex shrink-0 flex-col gap-0">
						<span class={FILTER_TOOLBAR_LABEL_SPACER_CLASS} aria-hidden="true"
							>&nbsp;</span
						>
						<button
							type="button"
							class="text-fg-muted hover:text-fg inline-flex shrink-0 self-start bg-transparent px-0 py-1.5 text-sm font-medium underline decoration-fg/25 underline-offset-2 transition-colors hover:decoration-fg/50"
							data-orama-clear-filters
							onclick={onClearAllFilters}
						>
							Clear all filters
						</button>
					</div>
				{/if}
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
			<ul class="mt-3 list-none space-y-4 p-0">
				{#each results as doc (doc.id)}
					<li>
						<SearchResultCard {doc} />
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>
