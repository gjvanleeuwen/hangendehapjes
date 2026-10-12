<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import DocumentView from '$lib/admin/DocumentView.svelte';

	// A factuur in the klantportaal: the same document we made in the admin,
	// plus a clear note when it's already paid.
	let { data } = $props();
</script>

<svelte:head>
	<title>Factuur {data.number} - Hangende Hapjes</title>
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>

<main class="mx-auto max-w-3xl px-4 py-6 print:p-0">
	<div class="mb-4 flex flex-wrap items-center gap-3 print:hidden">
		<Button href="/klantportaal/{data.token}" variant="outline">‹ Terug</Button>
		<Button type="button" onclick={() => window.print()}>Download / opslaan als PDF</Button>
		{#if data.paid}
			<span class="border border-primary/30 bg-primary/10 px-2 py-1 text-sm">
				Betaald, dankjewel!
			</span>
		{/if}
	</div>

	<div class="overflow-x-auto bg-white text-black shadow-sm print:shadow-none">
		<DocumentView doc={data.doc} />
	</div>
</main>

<style>
	@media print {
		:global(body) {
			background: white;
		}
	}
	@page {
		size: A4;
		margin: 18mm;
	}
</style>
