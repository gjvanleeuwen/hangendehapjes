<script lang="ts">
	import type { Translations } from '$lib/i18n/types';
	import { Button } from '$lib/components/ui/button/index.js';
	import Picture from '$lib/components/Picture.svelte';

	type Props = { t: Translations };
	let { t }: Props = $props();
</script>

<section class="relative isolate min-h-[80vh] overflow-hidden bg-foreground text-background">
	<Picture
		src={t.hero.image}
		alt={t.hero.imageAlt}
		sizes="100vw"
		class="absolute inset-0 -z-10 size-full object-cover opacity-60"
		loading="eager"
		fetchpriority="high"
	/>
	<div
		class="absolute inset-0 -z-10 bg-linear-to-b from-foreground/40 via-foreground/30 to-foreground/85"
	></div>

	<div class="mx-auto flex min-h-[80vh] max-w-6xl flex-col justify-end px-6 py-24 md:py-32">
		<p class="text-sm tracking-[0.2em] text-background/80 uppercase">{t.hero.eyebrow}</p>
		<h1
			class="mt-4 max-w-3xl font-heading text-4xl leading-tight tracking-tight md:text-6xl lg:text-7xl"
		>
			{t.hero.title}
		</h1>
		<p class="mt-6 max-w-xl text-base text-background/85 md:text-lg">{t.hero.subtitle}</p>
		<div class="mt-8 flex flex-wrap gap-3">
			<Button href="#products" size="lg">
				{t.hero.secondaryCta}
			</Button>
		</div>
	</div>
</section>
