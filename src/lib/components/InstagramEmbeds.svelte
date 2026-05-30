<script lang="ts">
	import { onMount } from 'svelte';

	type Props = {
		permalinks: string[];
		blockedTitle: string;
		blockedBody: string;
		gridClass?: string;
		itemClass?: string;
	};
	let {
		permalinks,
		blockedTitle,
		blockedBody,
		gridClass = 'grid grid-cols-1 justify-items-center gap-6 lg:grid-cols-3',
		itemClass = 'h-[640px] w-full max-w-[540px]'
	}: Props = $props();

	type InstagramWindow = Window & {
		instgrm?: { Embeds: { process: () => void } };
	};

	let blocked = $state(false);

	onMount(() => {
		const w = window as InstagramWindow;

		if (w.instgrm?.Embeds) {
			w.instgrm.Embeds.process();
		} else if (!document.querySelector('script[src*="instagram.com/embed.js"]')) {
			const script = document.createElement('script');
			script.src = 'https://www.instagram.com/embed.js';
			script.async = true;
			script.onerror = () => {
				blocked = true;
			};
			document.body.appendChild(script);
		}

		const timer = window.setTimeout(() => {
			if (!(window as InstagramWindow).instgrm?.Embeds) {
				blocked = true;
			}
		}, 4000);

		return () => window.clearTimeout(timer);
	});
</script>

{#if blocked}
	<div
		class="mx-auto flex max-w-xl flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 px-6 py-12 text-center"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="1.5"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="size-8 text-muted-foreground"
			aria-hidden="true"
		>
			<rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
			<path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
			<line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
		</svg>
		<p class="font-heading font-semibold text-foreground">{blockedTitle}</p>
		<p class="max-w-md text-sm text-muted-foreground">{blockedBody}</p>
	</div>
{:else}
	<div class={gridClass}>
		{#each permalinks as permalink (permalink)}
			<div
				class="{itemClass} overflow-hidden"
				style="mask-image: linear-gradient(to bottom, black 88%, transparent); -webkit-mask-image: linear-gradient(to bottom, black 88%, transparent);"
			>
				<blockquote
					class="instagram-media"
					data-instgrm-captioned
					data-instgrm-permalink={permalink}
					data-instgrm-version="14"
					style="background:#FFF; border:0; border-radius:3px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin:1px; max-width:540px; min-width:326px; padding:0; width:100%;"
				></blockquote>
			</div>
		{/each}
	</div>
{/if}
