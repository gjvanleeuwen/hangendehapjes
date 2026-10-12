<script lang="ts">
	import { enhance } from '$app/forms';
	import type { Deal } from '$lib/deals';
	import { keepValues } from './shared';

	// The internal note, editable in the list. Saves when you leave the field,
	// only if something changed. A textarea so line breaks survive.
	let { deal }: { deal: Deal } = $props();

	const save = (e: Event) => {
		const el = e.currentTarget as HTMLTextAreaElement;
		if (el.value !== deal.notes) el.form?.requestSubmit();
	};
</script>

<form method="POST" action="?/update" use:enhance={keepValues}>
	<input type="hidden" name="id" value={deal.id} />
	<textarea
		name="notes"
		rows="2"
		maxlength="5000"
		value={deal.notes}
		onblur={save}
		placeholder="Notitie…"
		aria-label="Interne notitie"
		class="w-full resize-y rounded-md border border-transparent bg-transparent px-1.5 py-1 text-xs hover:border-input focus:border-input focus:bg-background focus:outline-none"
	></textarea>
</form>
