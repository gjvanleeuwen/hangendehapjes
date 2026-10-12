<script lang="ts">
	import '../app.css';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import { captureAttribution } from '$lib/attribution';

	let { children } = $props();

	// Remember where this visitor came from (utm, referrer, landing page) so the
	// contact form can send it along. Browser-only; once per full page load.
	$effect(() => {
		captureAttribution();
	});
</script>

<svelte:head>
	<link rel="icon" type="image/png" href="/favicon.png" />
	<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
</svelte:head>

{@render children()}
<Toaster position="top-right" richColors />
