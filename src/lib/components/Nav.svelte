<script lang="ts">
	import type { Translations } from '$lib/i18n/types';
	import { Button } from '$lib/components/ui/button/index.js';

	type Props = { t: Translations };
	let { t }: Props = $props();
</script>

<header
	class="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60"
>
	<div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
		<a
			href={t.nav.homeHref}
			class="font-wordmark text-lg font-bold tracking-[0.08em] text-(--brand-teal) uppercase"
		>
			Hangende Hapjes
		</a>

		<nav class="hidden items-center gap-8 text-sm md:flex">
			<a
				class="text-muted-foreground transition-colors hover:text-foreground"
				href="{t.nav.homeHref}#about"
			>
				{t.nav.about}
			</a>
			<a
				class="text-muted-foreground transition-colors hover:text-foreground"
				href="{t.nav.homeHref}#products"
			>
				{t.nav.products}
			</a>
			{#if t.nav.cakes && t.products.cakeBanner}
				<a
					class="text-muted-foreground transition-colors hover:text-foreground"
					href="{t.nav.homeHref}#bruidstaarten"
				>
					{t.nav.cakes}
				</a>
			{/if}
			<a
				class="text-muted-foreground transition-colors hover:text-foreground"
				href="{t.nav.homeHref}#photos"
			>
				{t.nav.photos}
			</a>
		</nav>

		<div class="flex items-center gap-2">
			<a
				href={t.nav.switchHref}
				class="text-xs tracking-wider text-muted-foreground uppercase transition-colors hover:text-foreground"
				aria-label={t.nav.otherLabel}
			>
				{t.nav.switchLabel}
			</a>
			<Button href="{t.nav.homeHref}#contact" size="sm" class="hidden sm:inline-flex"
				>{t.nav.contact}</Button
			>
		</div>
	</div>
</header>
