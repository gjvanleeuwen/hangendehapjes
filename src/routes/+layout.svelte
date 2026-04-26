<script lang="ts">
	import '../app.css';
	import { Toaster } from '$lib/components/ui/sonner/index.js';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" type="image/jpeg" href="/favicon.jpg" />
	<link rel="apple-touch-icon" href="/favicon.jpg" />
</svelte:head>

{@render children()}
<Toaster position="top-right" richColors />
