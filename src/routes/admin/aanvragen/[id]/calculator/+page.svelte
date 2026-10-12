<script lang="ts">
	import Calculator from '$lib/admin/Calculator.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Calculator · {data.deal.name}</title>
</svelte:head>

<Calculator dealId={data.deal.id} />
