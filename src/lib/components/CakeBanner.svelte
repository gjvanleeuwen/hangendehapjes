<script lang="ts">
	import type { Translations } from '$lib/i18n/types';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Picture from './Picture.svelte';

	type Props = { t: Translations };
	let { t }: Props = $props();
</script>

{#if t.products.cakeBanner}
	<section id="bruidstaarten" class="scroll-mt-20 bg-background pb-20 md:pb-28">
		<div class="mx-auto max-w-6xl px-6">
			<div
				class="rounded-lg border border-(--brand-amaranth)/20 bg-muted/35 p-5 shadow-sm md:p-6"
			>
				<div class="max-w-2xl">
					<p class="text-xs font-medium tracking-[0.15em] text-(--brand-magenta) uppercase">
						{t.products.cakeBanner.kicker}
					</p>
					<h3 class="mt-2 font-heading text-2xl leading-tight tracking-tight">
						{t.products.cakeBanner.heading}
					</h3>
					<p class="mt-2 text-sm leading-relaxed text-muted-foreground">
						{t.products.cakeBanner.body}
					</p>
				</div>
				<div class="mt-5 grid gap-3 md:grid-cols-3">
					{#each t.products.cakeBanner.links as link (link.href)}
						<a
							href={link.href}
							class="group grid grid-cols-[5rem_1fr] overflow-hidden rounded-md border border-border bg-background text-left transition-colors hover:border-(--brand-amaranth)/40 md:grid-cols-1"
						>
							<div class="aspect-square overflow-hidden bg-muted md:aspect-4/3">
								<Picture
									src={link.image}
									alt={link.imageAlt}
									sizes="(min-width: 768px) 320px, 80px"
									loading="lazy"
									class="size-full object-cover transition-transform duration-300 group-hover:scale-105"
								/>
							</div>
							<div class="flex min-w-0 items-center justify-between gap-2 p-3">
								<span class="text-sm font-medium leading-snug">{link.label}</span>
								<ChevronRight class="size-4 shrink-0 text-(--brand-magenta)" />
							</div>
						</a>
					{/each}
				</div>
			</div>
		</div>
	</section>
{/if}
