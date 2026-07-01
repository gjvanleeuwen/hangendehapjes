<script lang="ts">
	import CateringLocation from '$lib/catering/CateringLocation.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<CateringLocation content={data.content} locale="en" />
