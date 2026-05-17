<script lang="ts">
	import { IMAGE_MANIFEST, type OptimizedImageName } from '$lib/image-manifest';

	type Props = {
		src: string;
		alt: string;
		sizes: string;
		class?: string;
		loading?: 'lazy' | 'eager';
		fetchpriority?: 'high' | 'low' | 'auto';
		decoding?: 'async' | 'sync' | 'auto';
	};

	let {
		src,
		alt,
		sizes,
		class: className = '',
		loading = 'lazy',
		fetchpriority = 'auto',
		decoding = 'async'
	}: Props = $props();

	const baseName = $derived(
		src.replace(/^.*\//, '').replace(/\.[^.]+$/, '') as OptimizedImageName
	);
	const entry = $derived(IMAGE_MANIFEST[baseName]);

	const avifSrcset = $derived(buildSrcset(baseName, entry?.widths ?? [], 'avif'));
	const webpSrcset = $derived(buildSrcset(baseName, entry?.widths ?? [], 'webp'));

	function buildSrcset(name: string, widths: readonly number[], ext: 'avif' | 'webp') {
		return widths.map((w) => `/images/optimized/${name}-${w}.${ext} ${w}w`).join(', ');
	}
</script>

{#if entry}
	<picture>
		<source type="image/avif" srcset={avifSrcset} {sizes} />
		<source type="image/webp" srcset={webpSrcset} {sizes} />
		<img
			{src}
			{alt}
			width={entry.width}
			height={entry.height}
			{loading}
			{decoding}
			{fetchpriority}
			class={className}
		/>
	</picture>
{/if}
