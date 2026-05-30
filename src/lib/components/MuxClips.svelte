<script lang="ts">
	import { onMount } from 'svelte';

	type Clip = { playbackId: string; title: string };
	type Props = {
		clips: Clip[];
		gridClass?: string;
		itemClass?: string;
		accentColor?: string;
	};
	let {
		clips,
		gridClass = 'grid grid-cols-2 justify-items-center gap-3 sm:gap-4',
		itemClass = 'w-full max-w-[300px]',
		accentColor = '#d03861'
	}: Props = $props();

	onMount(() => {
		void import('@mux/mux-player');
	});
</script>

<div class={gridClass}>
	{#each clips as clip (clip.playbackId)}
		<mux-player
			class={itemClass}
			playback-id={clip.playbackId}
			stream-type="on-demand"
			title={clip.title}
			accent-color={accentColor}
			muted
			hotkeys="nom novolumeup novolumedown"
			style="display: block; width: 100%; aspect-ratio: 9 / 16; overflow: hidden; border-radius: 0.75rem; --mute-button: none; --volume-range: none;"
		></mux-player>
	{/each}
</div>
