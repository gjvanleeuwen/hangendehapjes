<script lang="ts">
	type Props = {
		/** Umami surface key, e.g. 'tiramisu' → blog_tiramisu_top_offerte. */
		event: string;
		/** Short line before the button. Default fits the wedding posts. */
		lead?: string;
		label?: string;
		note?: string;
	};
	let {
		event,
		lead = 'Trouwdatum al geprikt?',
		label = 'Check of we nog vrij zijn',
		note = 'Je hoort dezelfde dag nog van ons.'
	}: Props = $props();
</script>

<!-- Early CTA, right under the summary with the "vanaf" prices, where intent
     peaks. Jumps to the inline form (#aanvraag) further down the same page. -->
<div
	class="mt-6 flex flex-col gap-3 rounded-xl border border-border bg-muted/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
>
	<div>
		<p class="font-medium text-foreground">{lead}</p>
		<p class="text-sm text-muted-foreground">{note}</p>
	</div>
	<a
		href="#aanvraag"
		data-umami-event="blog_{event}_top_offerte"
		class="inline-flex h-10 shrink-0 items-center justify-center rounded-md bg-(--brand-magenta) px-5 text-sm font-medium text-white transition-colors hover:opacity-90"
	>
		{label}
	</a>
</div>
