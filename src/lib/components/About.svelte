<script lang="ts">
	import type { Translations } from '$lib/i18n/types';
	import SectionHeading from './SectionHeading.svelte';

	type Props = { t: Translations };
	let { t }: Props = $props();
</script>

<section id="about" class="bg-background">
	<div class="mx-auto max-w-3xl px-6 py-20 md:py-28">
		<SectionHeading align="center">{t.about.heading}</SectionHeading>
		<div class="mt-6 space-y-4 text-base leading-relaxed text-muted-foreground md:text-lg">
			{#each t.about.body as paragraph (paragraph)}
				<p>{paragraph}</p>
			{/each}
		</div>
	</div>
</section>
