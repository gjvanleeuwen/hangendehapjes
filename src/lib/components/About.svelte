<script lang="ts">
	import type { Translations } from '$lib/i18n/types';
	import SectionHeading from './SectionHeading.svelte';
	import Picture from './Picture.svelte';

	type Props = { t: Translations };
	let { t }: Props = $props();
</script>

<section id="about" class="bg-background">
	<div class="mx-auto max-w-5xl px-6 py-20 md:py-28">
		<SectionHeading align="center">{t.about.heading}</SectionHeading>
		<div class="mt-10 grid items-center gap-8 md:mt-14 md:grid-cols-2 md:gap-12">
			<figure class="overflow-hidden rounded-2xl bg-muted">
				<div class="aspect-5/4">
					<Picture
						src={t.about.photo.src}
						alt={t.about.photo.alt}
						sizes="(min-width: 768px) 460px, 100vw"
						loading="lazy"
						class="size-full object-cover"
					/>
				</div>
			</figure>
			<div class="space-y-4 text-base leading-relaxed text-muted-foreground md:text-lg">
				{#each t.about.body as paragraph (paragraph)}
					<p>{paragraph}</p>
				{/each}
			</div>
		</div>
	</div>
</section>
