<script lang="ts">
	import type { BlogFaq } from './faqs';
	import * as Accordion from '$lib/components/ui/accordion/index.js';

	type Props = { items: BlogFaq[]; heading?: string; intro?: string };
	let {
		items,
		heading = 'Veelgestelde vragen',
		intro = 'De vragen die we het vaakst krijgen, kort en duidelijk beantwoord.'
	}: Props = $props();
</script>

<section class="mt-12">
	<h2 class="font-heading text-2xl tracking-tight md:text-3xl">{heading}</h2>
	{#if intro}
		<p class="mt-2 text-base text-muted-foreground">{intro}</p>
	{/if}

	<Accordion.Root type="single" class="mt-6 space-y-2">
		{#each items as item (item.id)}
			<Accordion.Item
				value={item.id}
				class="-mx-4 rounded-lg px-4 transition-colors data-[state=open]:bg-(--brand-magenta)/12"
			>
				<Accordion.Trigger class="text-base font-normal md:text-lg">
					{item.question}
				</Accordion.Trigger>
				<Accordion.Content>
					<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
						{item.answer}
					</p>
				</Accordion.Content>
			</Accordion.Item>
		{/each}
	</Accordion.Root>
</section>

<style>
	section :global([data-slot='accordion-trigger-icon']) {
		color: var(--brand-magenta);
	}
</style>
