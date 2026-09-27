<script lang="ts">
	import type { Translations } from '$lib/i18n/types';
	import { Button } from '$lib/components/ui/button/index.js';
	import Picture from '$lib/components/Picture.svelte';

	type Props = { t: Translations };
	let { t }: Props = $props();
</script>

<!--
	Diagonal split. Each photo sits in its own panel so its focal point stays in
	view, and the panels are clipped so the two meet on one diagonal:
	- mobile: top panel / bottom panel, seam from 38% (left edge) to 18% (right edge),
	  kept high so it stays above the headline
	- md+:   left panel / right panel, seam from 58% (top edge) to 30% (bottom edge);
	  the right panel is wide so the whole tiramisu taart fits
-->
<section class="relative isolate min-h-[80vh] overflow-hidden bg-foreground text-background">
	<div
		class="absolute inset-x-0 top-0 -z-10 h-[38%] [clip-path:polygon(0_0,100%_0,100%_47.368%,0_100%)] md:inset-x-auto md:inset-y-0 md:left-0 md:h-auto md:w-[58%] md:[clip-path:polygon(0_0,100%_0,51.724%_100%,0_100%)]"
	>
		<Picture
			src={t.hero.image}
			alt={t.hero.imageAlt}
			sizes="(min-width: 768px) 60vw, 100vw"
			class="size-full object-cover opacity-70"
			loading="eager"
			fetchpriority="high"
		/>
	</div>
	<div
		class="absolute inset-x-0 bottom-0 -z-10 h-[82%] [clip-path:polygon(0_24.39%,100%_0,100%_100%,0_100%)] md:inset-x-auto md:inset-y-0 md:right-0 md:h-auto md:w-[70%] md:[clip-path:polygon(40%_0,100%_0,100%_100%,0_100%)]"
	>
		<Picture
			src={t.hero.cakeImage}
			alt={t.hero.cakeImageAlt}
			sizes="(min-width: 768px) 70vw, 100vw"
			class="size-full object-cover object-[50%_65%] opacity-70 md:object-[24%_50%]"
			loading="eager"
		/>
	</div>

	<!-- Seam along the diagonal -->
	<svg
		aria-hidden="true"
		class="pointer-events-none absolute inset-0 -z-10 size-full text-background/70"
		viewBox="0 0 100 100"
		preserveAspectRatio="none"
	>
		<line
			class="md:hidden"
			x1="0"
			y1="38"
			x2="100"
			y2="18"
			stroke="currentColor"
			stroke-width="3"
			vector-effect="non-scaling-stroke"
		/>
		<line
			class="hidden md:inline"
			x1="58"
			y1="0"
			x2="30"
			y2="100"
			stroke="currentColor"
			stroke-width="3"
			vector-effect="non-scaling-stroke"
		/>
	</svg>

	<div
		class="absolute inset-0 -z-10 bg-linear-to-b from-foreground/30 via-foreground/20 to-foreground/85"
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
