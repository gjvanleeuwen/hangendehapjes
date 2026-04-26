<script lang="ts">
	import type { Translations } from '$lib/i18n/types';
	import MailIcon from '@lucide/svelte/icons/mail';

	type Props = { t: Translations };
	let { t }: Props = $props();

	const year = new Date().getFullYear();
</script>

<footer class="border-t border-border bg-background">
	<div class="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-12 md:flex-row md:items-center md:justify-between">
		<div>
			<p class="font-wordmark text-lg font-bold uppercase tracking-[0.08em] text-primary">Hangende Hapjes</p>
			<p class="text-sm text-muted-foreground">{t.footer.tagline}</p>
			<p class="text-sm text-muted-foreground">{t.footer.basedIn}</p>
		</div>
		<div class="flex flex-col gap-2 text-sm md:items-end">
			<a
				class="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
				href="mailto:info@hangendehapjes.nl"
			>
				<MailIcon class="size-4" />
				info@hangendehapjes.nl
			</a>
			<a
				class="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
				href="https://instagram.com/hangendehapjes"
				target="_blank"
				rel="noopener noreferrer"
				aria-label={t.footer.instagram}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="size-4"
					aria-hidden="true"
				>
					<rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
					<path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
					<line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
				</svg>
				@hangendehapjes
			</a>
			<p class="text-xs text-muted-foreground">© {year} Hangende Hapjes</p>
		</div>
	</div>
</footer>
