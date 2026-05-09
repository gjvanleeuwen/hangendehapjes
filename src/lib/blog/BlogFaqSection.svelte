<script lang="ts">
	import type { BlogFaq } from './faqs';

	type Props = { items: BlogFaq[]; heading?: string };
	let { items, heading = 'Veelgestelde vragen' }: Props = $props();
</script>

<section class="mt-12 space-y-6">
	<h2 class="font-heading text-2xl tracking-tight md:text-3xl">{heading}</h2>

	{#each items as item (item.id)}
		<div class="space-y-2">
			<h3 class="font-heading text-xl md:text-2xl">{item.question}</h3>
			<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
				{item.answer}
			</p>
		</div>
	{/each}
</section>
