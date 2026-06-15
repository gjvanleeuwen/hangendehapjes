<script lang="ts">
	import { page } from '$app/state';
	let { children } = $props();
	const isLogin = $derived(page.url.pathname === '/admin/login');
</script>

<svelte:head>
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>

{#if isLogin}
	{@render children()}
{:else}
	<div class="bg-background min-h-screen">
		<header class="bg-card border-b print:hidden">
			<div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
				<a href="/admin" class="font-heading text-lg">Hangende Hapjes — admin</a>
				<nav class="flex items-center gap-4 text-sm">
					<a href="/admin/aanvragen" class="hover:underline">Aanvragen</a>
					<a href="/admin/document" class="hover:underline">Document</a>
					<a href="/admin/calculator" class="hover:underline">Calculator</a>
					<form method="POST" action="/admin/logout">
						<button type="submit" class="hover:underline">Uitloggen</button>
					</form>
				</nav>
			</div>
		</header>
		<main class="mx-auto max-w-5xl px-4 py-6 print:max-w-none print:p-0">
			{@render children()}
		</main>
	</div>
{/if}
