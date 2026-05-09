<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';

	let { form } = $props();
	let submitting = $state(false);
</script>

<svelte:head>
	<title>Admin login</title>
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>

<main class="bg-background flex min-h-screen items-center justify-center px-4">
	<form
		method="POST"
		class="bg-card w-full max-w-sm space-y-4 border p-6 shadow-sm"
		use:enhance={() => {
			submitting = true;
			return async ({ update }) => {
				await update();
				submitting = false;
			};
		}}
	>
		<h1 class="font-heading text-xl">Admin</h1>
		<div class="space-y-2">
			<Label for="password">Wachtwoord</Label>
			<Input id="password" name="password" type="password" autocomplete="current-password" required />
		</div>
		{#if form?.error}
			<p class="text-destructive text-sm">{form.error}</p>
		{/if}
		<Button type="submit" class="w-full" disabled={submitting}>
			{submitting ? 'Bezig…' : 'Inloggen'}
		</Button>
	</form>
</main>
