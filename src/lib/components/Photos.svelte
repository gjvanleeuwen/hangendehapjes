<script lang="ts">
	import { onMount } from 'svelte';
	import type { Translations } from '$lib/i18n/types';
	import { Button } from '$lib/components/ui/button/index.js';
	import { INSTAGRAM_URL } from '$lib/site-config';
	import SectionHeading from './SectionHeading.svelte';

	type Props = { t: Translations };
	let { t }: Props = $props();

	const posts = [
		'https://www.instagram.com/reel/DXrQtLICJVc/',
		'https://www.instagram.com/reel/DXrlShRiNeD/',
		'https://www.instagram.com/p/DXtSIpKiGje/'
	];

	type InstagramWindow = Window & {
		instgrm?: { Embeds: { process: () => void } };
	};

	let blocked = $state(false);

	onMount(() => {
		const w = window as InstagramWindow;

		if (w.instgrm?.Embeds) {
			w.instgrm.Embeds.process();
		} else if (!document.querySelector('script[src*="instagram.com/embed.js"]')) {
			const script = document.createElement('script');
			script.src = 'https://www.instagram.com/embed.js';
			script.async = true;
			script.onerror = () => {
				blocked = true;
			};
			document.body.appendChild(script);
		}

		const timer = window.setTimeout(() => {
			if (!(window as InstagramWindow).instgrm?.Embeds) {
				blocked = true;
			}
		}, 4000);

		return () => window.clearTimeout(timer);
	});
</script>

<section id="photos" class="bg-background">
	<div class="mx-auto max-w-6xl px-6 py-20 md:py-28">
		<div class="mb-10 max-w-2xl">
			<SectionHeading>{t.photos.heading}</SectionHeading>
			<p class="mt-3 text-muted-foreground">{t.photos.intro}</p>
		</div>

		{#if !blocked}
			<div class="grid grid-cols-1 justify-items-center gap-6 lg:grid-cols-3">
				{#each posts as permalink (permalink)}
					<div
						class="h-[640px] w-full max-w-[540px] overflow-hidden"
						style="mask-image: linear-gradient(to bottom, black 88%, transparent); -webkit-mask-image: linear-gradient(to bottom, black 88%, transparent);"
					>
						<blockquote
							class="instagram-media"
							data-instgrm-captioned
							data-instgrm-permalink={permalink}
							data-instgrm-version="14"
							style="background:#FFF; border:0; border-radius:3px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin:1px; max-width:540px; min-width:326px; padding:0; width:100%;"
						></blockquote>
					</div>
				{/each}
			</div>
		{/if}

		<div class="mt-10 flex justify-center">
			<Button href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" size="lg">
				{t.photos.cta}
			</Button>
		</div>
	</div>
</section>
