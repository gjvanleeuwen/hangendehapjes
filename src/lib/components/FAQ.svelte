<script lang="ts">
	import type { Translations } from '$lib/i18n/types';
	import * as Accordion from '$lib/components/ui/accordion/index.js';

	type Props = { t: Translations };
	let { t }: Props = $props();
</script>

<section id="faq" class="bg-background py-20 md:py-28">
	<div class="mx-auto max-w-6xl px-6">
		<h2 class="sr-only">{t.faq.srHeading}</h2>

		<div class="grid grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-16">
			<div class="space-y-10">
				<p class="text-(--brand-magenta) text-sm font-semibold uppercase tracking-wider">
					{t.faq.eyebrow}
				</p>

				{#each t.faq.why as item (item.heading)}
					<div class="space-y-2">
						<h3 class="font-heading text-xl md:text-2xl">{item.heading}</h3>
						<p class="text-base leading-relaxed text-muted-foreground">{item.body}</p>
					</div>
				{/each}
			</div>

			<div>
				<Accordion.Root type="single" class="space-y-2">
					{#each t.faq.items as item (item.id)}
						<Accordion.Item
							value={item.id}
							class="-mx-4 rounded-lg px-4 transition-colors data-[state=open]:bg-(--brand-magenta)/12"
						>
							<Accordion.Trigger>{item.question}</Accordion.Trigger>
							<Accordion.Content>
								<p class="leading-relaxed text-muted-foreground">{item.answer}</p>
							</Accordion.Content>
						</Accordion.Item>
					{/each}
				</Accordion.Root>
			</div>
		</div>
	</div>
</section>
