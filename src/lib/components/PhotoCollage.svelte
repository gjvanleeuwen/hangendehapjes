<script lang="ts" module>
	export type CollageImage = {
		src: string;
		alt: string;
		/** Tailwind object-position class, e.g. `object-[30%_50%]`. */
		position?: string;
	};
</script>

<script lang="ts">
	import Picture from '$lib/components/Picture.svelte';

	type Props = {
		/** Best with 2, 3 or 6 photos (lead tile + square tiles fill the grid). */
		images: CollageImage[];
		caption?: string;
		class?: string;
	};

	let { images, caption, class: className = '' }: Props = $props();

	/** With 3+ photos the first one becomes a larger lead tile. */
	const lead = $derived(images.length >= 3);
</script>

{#if images.length}
	<figure class={['mt-6', className]}>
		<div class={['grid gap-2 md:gap-3', images.length === 2 ? 'grid-cols-2' : 'grid-cols-3']}>
			{#each images as image, i (image.src)}
				<div
					class={[
						'overflow-hidden rounded-lg bg-muted',
						lead && i === 0 ? 'col-span-2 row-span-2' : 'aspect-square'
					]}
				>
					<Picture
						src={image.src}
						alt={image.alt}
						sizes={lead && i === 0
							? '(min-width: 768px) 480px, 66vw'
							: '(min-width: 768px) 240px, 33vw'}
						class={['size-full object-cover', image.position].filter(Boolean).join(' ')}
					/>
				</div>
			{/each}
		</div>
		{#if caption}
			<figcaption class="mt-2 text-sm text-muted-foreground">{caption}</figcaption>
		{/if}
	</figure>
{/if}
