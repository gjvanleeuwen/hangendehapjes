<script lang="ts">
	import type { Translations } from '$lib/i18n/types';
	import { FACEBOOK_URL, INSTAGRAM_URL, TIKTOK_URL } from '$lib/site-config';
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
			<div class="flex items-center gap-4 text-muted-foreground">
				<a
					href={INSTAGRAM_URL}
					target="_blank"
					rel="noopener noreferrer"
					aria-label={t.footer.instagram}
					class="hover:text-foreground"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="size-5"
						aria-hidden="true"
					>
						<rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
						<path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
						<line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
					</svg>
				</a>
				<a
					href={FACEBOOK_URL}
					target="_blank"
					rel="noopener noreferrer"
					aria-label={t.footer.facebook}
					class="hover:text-foreground"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="size-5"
						aria-hidden="true"
					>
						<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
					</svg>
				</a>
				<a
					href={TIKTOK_URL}
					target="_blank"
					rel="noopener noreferrer"
					aria-label={t.footer.tiktok}
					class="hover:text-foreground"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="size-5"
						aria-hidden="true"
					>
						<path
							d="M21 7.917v4.034a9.948 9.948 0 0 1-5-1.951v4.5a6.5 6.5 0 1 1-8-6.326v4.326a2.5 2.5 0 1 0 4 2v-13h4.083a6.005 6.005 0 0 0 4.917 5.917z"
						/>
					</svg>
				</a>
			</div>
			<p class="text-xs text-muted-foreground">© {year} Hangende Hapjes</p>
		</div>
	</div>
</footer>
