<script lang="ts">
	import type { Translations } from '$lib/i18n/types';
	import { Button } from '$lib/components/ui/button/index.js';
	import { INSTAGRAM_URL } from '$lib/site-config';
	import SectionHeading from './SectionHeading.svelte';
	import InstagramEmbeds from './InstagramEmbeds.svelte';

	type Props = { t: Translations };
	let { t }: Props = $props();

	const posts = [
		'https://www.instagram.com/reel/DXuaQahiOuF/',
		'https://www.instagram.com/reel/DYPUD2gIS1Z/',
		'https://www.instagram.com/p/DXtSIpKiGje/'
	];
</script>

<section id="photos" class="bg-background">
	<div class="mx-auto max-w-6xl px-6 py-20 md:py-28">
		<div class="mb-10 max-w-2xl">
			<SectionHeading>{t.photos.heading}</SectionHeading>
			<p class="mt-3 text-muted-foreground">{t.photos.intro}</p>
		</div>

		<InstagramEmbeds
			permalinks={posts}
			blockedTitle={t.photos.blockedTitle}
			blockedBody={t.photos.blockedBody}
		/>

		<div class="mt-10 flex justify-center">
			<Button href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" size="lg">
				{t.photos.cta}
			</Button>
		</div>
	</div>
</section>
