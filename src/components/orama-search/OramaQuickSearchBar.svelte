<script lang="ts">
	export type OramaQuickSearchBarVariant =
		| 'header-mobile'
		| 'header-desktop'
		| 'home';

	type Props = {
		variant: OramaQuickSearchBarVariant;
		inputId: string;
		placeholder: string;
		action: string;
		/** Desktop header only: first key label before “K” (e.g. Ctrl or localized). */
		ctrlKeyLabel?: string;
		inputEl?: HTMLInputElement | null;
	};

	let {
		variant,
		inputId,
		placeholder,
		action,
		ctrlKeyLabel = 'Ctrl',
		inputEl = $bindable<HTMLInputElement | null>(null),
	}: Props = $props();

	const formClass: Record<OramaQuickSearchBarVariant, string> = {
		'header-mobile':
			'ss-form flex w-full min-w-0 items-center gap-2 rounded-lg border border-hairline bg-surface-nav px-2 py-1.5 text-fg',
		'header-desktop':
			'ss-form ss-desktop-form flex h-10 w-full min-w-0 items-center gap-2 rounded-lg border border-hairline bg-surface-nav pl-3 pr-2 text-sm text-fg hover:border-gray-300 dark:hover:border-gray-500',
		home: 'box-border flex w-full items-center gap-[0.65rem] rounded-full border border-hairline bg-surface-nav py-[0.65rem] pl-4 pr-4 text-left font-inherit text-fg focus-within:outline-2 focus-within:outline-offset-0 focus-within:outline-accent-500',
	};

	const inputClass: Record<OramaQuickSearchBarVariant, string> = {
		'header-mobile':
			'ss-input min-w-0 flex-1 border-0 bg-transparent font-inherit text-inherit outline-none placeholder:italic placeholder:text-fg-muted',
		'header-desktop':
			'ss-input min-w-0 flex-1 border-0 bg-transparent font-inherit text-inherit outline-none placeholder:italic placeholder:text-fg-muted',
		home: 'min-w-0 flex-1 border-0 bg-transparent font-sans text-[0.9375rem] text-fg italic outline-none placeholder:text-fg-muted placeholder:italic',
	};
</script>

<form method="get" {action} class={formClass[variant]} role="search">
	{#if variant === 'header-desktop' || variant === 'home'}
		<svg
			class={variant === 'home'
				? 'pointer-events-none shrink-0 text-fg-muted opacity-85 dark:opacity-100'
				: 'shrink-0 text-fg-muted'}
			width="20"
			height="20"
			viewBox="0 0 24 24"
			aria-hidden="true"
		>
			<path
				fill="currentColor"
				d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
			></path>
		</svg>
	{/if}
	<label class="sr-only" for={inputId}>{placeholder}</label>
	<input
		id={inputId}
		type="search"
		name="q"
		autocomplete="off"
		{placeholder}
		class={inputClass[variant]}
		aria-autocomplete="list"
		aria-keyshortcuts={variant === 'home' ? 'Control+K' : undefined}
		bind:this={inputEl}
	/>
	{#if variant === 'header-desktop'}
		<kbd
			class="ss-kbd ms-auto hidden min-[50rem]:inline-flex items-center gap-0.5 rounded bg-surface-code px-1.5 font-sans text-xs text-fg-muted"
			aria-hidden="true"
		>
			<kbd>{ctrlKeyLabel}</kbd><kbd>K</kbd>
		</kbd>
	{/if}
</form>
