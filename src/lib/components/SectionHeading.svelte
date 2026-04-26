<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
		align?: 'left' | 'center';
		class?: string;
	};
	let { children, align = 'left', class: className = '' }: Props = $props();
</script>

<div class="{align === 'center' ? 'text-center' : ''} {className}">
	<h2 class="font-heading text-3xl leading-tight tracking-tight md:text-4xl">
		{@render children()}
	</h2>
	<span
		aria-hidden="true"
		class="{align === 'center' ? 'mx-auto' : ''} mt-3 block h-1 w-12 bg-(--brand-amaranth)"
	></span>
</div>
