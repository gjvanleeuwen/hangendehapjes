<script lang="ts">
	import type { Locale, Translations } from '$lib/i18n/types';
	import { Button } from '$lib/components/ui/button/index.js';
	import StarIcon from '@lucide/svelte/icons/star';

	type Props = { t: Translations; locale?: Locale };
	let { t, locale = 'nl' }: Props = $props();

	// Google rating, shown on every page. Only the score, not the count (yet).
	const ratings = $derived((t.reviews.items ?? []).map((r) => r.rating));
	const rating = $derived(
		ratings.length > 0 ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : 0
	);
	const ratingDisplay = $derived(
		rating.toLocaleString(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
	);
</script>

<header
	class="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60"
>
	<!--
		Three zones: logo + Contact on the left, page links in the middle, rating
		and language switch on the right. Below md the links are hidden, the
		"Google" label is dropped and Contact moves between rating and EN.
	-->
	<div
		class="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-6 sm:gap-6 md:grid md:grid-cols-[1fr_auto_1fr]"
	>
		<div class="flex items-center gap-6">
			<a
				href={t.nav.homeHref}
				class="font-wordmark text-base font-bold tracking-[0.08em] whitespace-nowrap text-(--brand-teal) uppercase sm:text-lg"
			>
				Hangende Hapjes
			</a>
			<Button href="{t.nav.homeHref}#contact" size="sm" class="hidden md:inline-flex">
				{t.nav.contact}
			</Button>
		</div>

		<nav class="hidden items-center gap-5 text-sm md:flex lg:gap-8">
			<a
				class="text-muted-foreground transition-colors hover:text-foreground"
				href="{t.nav.homeHref}#products"
			>
				{t.nav.products}
			</a>
			<a
				class="text-muted-foreground transition-colors hover:text-foreground"
				href="{t.nav.homeHref}#about"
			>
				{t.nav.about}
			</a>
			<a
				class="text-muted-foreground transition-colors hover:text-foreground"
				href="{t.nav.homeHref}#photos"
			>
				{t.nav.photos}
			</a>
		</nav>

		<div class="flex items-center justify-end gap-2 sm:gap-3">
			{#if ratings.length > 0}
				<a
					href="{t.nav.homeHref}#reviews"
					class="flex items-center gap-1.5 text-xs whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground md:text-sm"
					aria-label="{ratingDisplay} / 5 {t.reviews.sourceLabel}"
					data-umami-event="nav_reviews"
				>
					<StarIcon class="size-4 fill-current text-amber-500" aria-hidden="true" />
					<span class="font-semibold text-foreground tabular-nums">{ratingDisplay}</span>
					<span class="hidden md:inline" aria-hidden="true">Google</span>
				</a>
				<span class="hidden text-muted-foreground/50 md:inline" aria-hidden="true">·</span>
			{/if}
			<!-- Mobile: Contact sits between the rating and the language switch. -->
			<Button href="{t.nav.homeHref}#contact" size="sm" class="md:hidden">
				{t.nav.contact}
			</Button>
			<a
				href={t.nav.switchHref}
				class="text-xs tracking-wider text-muted-foreground uppercase transition-colors hover:text-foreground"
				aria-label={t.nav.otherLabel}
			>
				{t.nav.switchLabel}
			</a>
		</div>
	</div>
</header>
