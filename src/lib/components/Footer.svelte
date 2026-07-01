<script lang="ts">
	import type { Translations } from '$lib/i18n/types';
	import { FACEBOOK_URL, INSTAGRAM_URL, TIKTOK_URL, WHATSAPP_URL } from '$lib/site-config';
	import MailIcon from '@lucide/svelte/icons/mail';

	type Props = { t: Translations };
	let { t }: Props = $props();

	const year = new Date().getFullYear();
</script>

<footer class="border-t border-border bg-background">
	<div
		class="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-12 md:flex-row md:items-start md:justify-between"
	>
		<div class="flex flex-col gap-6 md:self-stretch">
			<div>
				<p class="font-wordmark text-lg font-bold tracking-[0.08em] text-primary uppercase">
					Hangende Hapjes
				</p>
				<p class="text-sm text-muted-foreground">{t.footer.tagline}</p>
			</div>
			<p class="text-xs text-muted-foreground md:mt-auto">© {year} Hangende Hapjes</p>
		</div>
		{#if t.footer.readingLinks && t.footer.readingLinks.length > 0}
			<div class="flex flex-col gap-2 text-sm">
				<ul class="space-y-1">
					{#each t.footer.readingLinks as link (link.href)}
						<li>
							<a
								class="text-muted-foreground transition-colors hover:text-foreground"
								href={link.href}
							>
								{link.label}
							</a>
						</li>
					{/each}
				</ul>
			</div>
		{/if}
		{#if t.footer.resourceLinks && t.footer.resourceLinks.length > 0}
			<div class="flex flex-col gap-2 text-sm">
				<ul class="space-y-1">
					{#each t.footer.resourceLinks as link (link.href)}
						<li>
							<a
								class="text-muted-foreground transition-colors hover:text-foreground"
								href={link.href}
							>
								{link.label}
							</a>
						</li>
					{/each}
				</ul>
			</div>
		{/if}
		<div class="flex flex-col gap-2 text-sm md:items-end">
			<a
				class="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
				href={WHATSAPP_URL}
				target="_blank"
				rel="noopener noreferrer"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="currentColor"
					class="size-4"
					aria-hidden="true"
				>
					<path
						d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 1.67c2.2 0 4.27.86 5.83 2.42a8.2 8.2 0 0 1 2.42 5.82c0 4.54-3.7 8.23-8.25 8.23a8.2 8.2 0 0 1-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.37c0-4.54 3.7-8.24 8.25-8.24Zm-3.05 4.43c-.14 0-.37.05-.57.27-.2.21-.76.74-.76 1.81 0 1.07.78 2.1.89 2.25.11.14 1.53 2.34 3.71 3.28.52.22.92.36 1.24.46.52.17.99.14 1.37.09.42-.06 1.28-.52 1.46-1.03.18-.51.18-.94.13-1.03-.05-.09-.2-.14-.41-.25-.21-.11-1.28-.63-1.48-.7-.2-.07-.34-.11-.49.11-.14.21-.56.7-.69.85-.13.14-.25.16-.46.05-.21-.11-.9-.33-1.71-1.06-.63-.56-1.06-1.26-1.18-1.47-.13-.21-.01-.33.09-.43.09-.09.21-.25.32-.37.11-.13.14-.21.21-.36.07-.14.04-.27-.02-.38-.05-.11-.49-1.18-.67-1.61-.18-.43-.36-.37-.49-.37l-.42-.01Z"
					/>
				</svg>
				{t.footer.whatsapp}
			</a>
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
			<p class="text-xs text-muted-foreground">
				{t.footer.photoCredit}
				<a
					href="http://www.dijkstrafotografie.com/"
					target="_blank"
					rel="noopener"
					class="underline hover:text-foreground">Dijkstra Fotografie</a
				>
			</p>
		</div>
	</div>
</footer>
