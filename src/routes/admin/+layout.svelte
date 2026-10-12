<script lang="ts">
	import { page } from '$app/state';
	let { children } = $props();
	const isLogin = $derived(page.url.pathname === '/admin/login');

	const links = [
		{ href: '/admin/aanvragen', label: 'Aanvragen' },
		{ href: '/admin/analytics', label: 'Analytics' },
		{ href: '/admin/calculator', label: 'Calculator' }
	];

	const isActive = (href: string) => page.url.pathname.startsWith(href);
</script>

<svelte:head>
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>

{#if isLogin}
	{@render children()}
{:else}
	<div class="min-h-screen bg-background">
		<header class="border-b bg-card print:hidden">
			<div
				class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3"
			>
				<a href="/admin" class="font-heading text-lg">Hangende Hapjes · admin</a>
				<nav class="flex flex-wrap items-center gap-4 text-sm">
					{#each links as link (link.href)}
						<a
							href={link.href}
							class="hover:underline {isActive(link.href) ? 'font-medium underline' : ''}"
						>
							{link.label}
						</a>
					{/each}
					<form method="POST" action="/admin/logout">
						<button type="submit" class="hover:underline">Uitloggen</button>
					</form>
				</nav>
			</div>
		</header>
		<main class="mx-auto max-w-6xl px-4 py-6 print:max-w-none print:p-0">
			{@render children()}
		</main>
	</div>
{/if}
