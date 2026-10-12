<script lang="ts">
	type Props = {
		/** Umami surface key, e.g. 'tiramisu' → blog_tiramisu_top_offerte. */
		event: string;
		label?: string;
		note?: string;
	};
	let {
		event,
		label = 'Direct een voorstel aanvragen',
		note = 'Je hoort binnen 1–2 dagen van ons.'
	}: Props = $props();
</script>

<!-- Early CTA, right under the summary with the "vanaf" prices, where intent
     peaks. Jumps to the inline form (#aanvraag) further down the same page. -->
<div class="mt-6 flex flex-wrap items-center gap-3">
	<a
		href="#aanvraag"
		data-umami-event="blog_{event}_top_offerte"
		class="inline-flex h-10 items-center justify-center rounded-md bg-(--brand-magenta) px-5 text-sm font-medium text-white transition-colors hover:opacity-90"
	>
		{label}
	</a>
	<span class="text-sm text-muted-foreground">{note}</span>
</div>
