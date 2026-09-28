<script lang="ts">
	import Picture from './Picture.svelte';

	type Side = {
		src: string;
		alt: string;
		/** Tailwind object-position class, e.g. `object-[30%_50%]`. */
		position?: string;
	};

	type Props = {
		left: Side;
		right: Side;
		/** Image `sizes` for the panels. */
		sizes: string;
		/**
		 * Where the seam meets the top and bottom edge, in % of the width.
		 * `seamTop > seamBottom` gives a "/" diagonal. The left panel is
		 * `seamTop`% wide and the right panel `100 - seamBottom`% wide, so pick
		 * these to give a portrait photo a narrow panel and a landscape photo a
		 * wide one.
		 */
		seamTop?: number;
		seamBottom?: number;
		caption?: string;
		class?: string;
		loading?: 'lazy' | 'eager';
	};

	let {
		left,
		right,
		sizes,
		seamTop = 60,
		seamBottom = 40,
		caption,
		class: className = '',
		loading = 'lazy'
	}: Props = $props();

	const leftStyle = $derived(
		`width:${seamTop}%;clip-path:polygon(0 0,100% 0,${(seamBottom / seamTop) * 100}% 100%,0 100%)`
	);
	const rightStyle = $derived(
		`width:${100 - seamBottom}%;clip-path:polygon(${((seamTop - seamBottom) / (100 - seamBottom)) * 100}% 0,100% 0,100% 100%,0 100%)`
	);
</script>

<figure class={className}>
	<div class="relative isolate aspect-3/2 overflow-hidden rounded-xl bg-muted">
		<div class="absolute inset-y-0 left-0" style={leftStyle}>
			<Picture
				src={left.src}
				alt={left.alt}
				{sizes}
				{loading}
				class="size-full object-cover {left.position ?? ''}"
			/>
		</div>
		<div class="absolute inset-y-0 right-0" style={rightStyle}>
			<Picture
				src={right.src}
				alt={right.alt}
				{sizes}
				{loading}
				class="size-full object-cover {right.position ?? ''}"
			/>
		</div>
		<svg
			aria-hidden="true"
			class="pointer-events-none absolute inset-0 size-full text-background"
			viewBox="0 0 100 100"
			preserveAspectRatio="none"
		>
			<line
				x1={seamTop}
				y1="0"
				x2={seamBottom}
				y2="100"
				stroke="currentColor"
				stroke-width="4"
				vector-effect="non-scaling-stroke"
			/>
		</svg>
	</div>
	{#if caption}
		<figcaption class="mt-2 text-center text-xs text-muted-foreground">{caption}</figcaption>
	{/if}
</figure>
