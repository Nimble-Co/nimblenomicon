<script lang="ts">
	import {
		FILTER_CHECKBOX_INPUT_CLASS,
		FILTER_INLINE_CHECKBOX_LABEL_CLASS,
	} from '../../scripts/orama-search-toolbar-constants';

	let {
		checked,
		text,
		onChange,
	}: {
		checked: boolean;
		text: string;
		onChange: (checked: boolean) => void;
	} = $props();
</script>

<label class={FILTER_INLINE_CHECKBOX_LABEL_CLASS}>
	<input
		type="checkbox"
		class={FILTER_CHECKBOX_INPUT_CLASS}
		{checked}
		onchange={(e) => onChange(e.currentTarget.checked)}
	/>
	<span>{text}</span>
</label>
