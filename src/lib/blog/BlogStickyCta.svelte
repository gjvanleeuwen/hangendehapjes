<script lang="ts">
	import { WHATSAPP_URL } from '$lib/site-config';

	type Props = {
		/** Umami surface key, e.g. 'tiramisu' → blog_tiramisu_sticky_offerte / _sticky_whatsapp. */
		event: string;
		label?: string;
		waText?: string;
	};
	let {
		event,
		label = 'Vraag een voorstel aan',
		waText = 'Hoi! Ik heb een vraag over Hangende Hapjes 👋'
	}: Props = $props();

	let scrollY = $state(0);
	let formInView = $state(false);

	const waHref = $derived(`${WHATSAPP_URL}?text=${encodeURIComponent(waText)}`);
	// Only once the reader is past the intro, and never on top of the form itself.
	const visible = $derived(scrollY > 500 && !formInView);

	$effect(() => {
		const form = document.getElementById('aanvraag');
		if (!form) return;
		const observer = new IntersectionObserver(
			(entries) => {
				formInView = entries.some((entry) => entry.isIntersecting);
			},
			{ threshold: 0.1 }
		);
		observer.observe(form);
		return () => observer.disconnect();
	});
</script>

<svelte:window bind:scrollY />

<!-- Mobile-only bar at the bottom of the screen: the offerte button plus WhatsApp.
     On desktop the inline form is never far away, so the bar stays hidden there. -->
{#if visible}
	<div
		class="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-3 backdrop-blur md:hidden"
		style="padding-bottom: max(0.75rem, env(safe-area-inset-bottom))"
	>
		<div class="flex items-center gap-2">
			<a
				href="#aanvraag"
				data-umami-event="blog_{event}_sticky_offerte"
				class="inline-flex h-11 flex-1 items-center justify-center rounded-md bg-(--brand-magenta) text-sm font-semibold text-white"
			>
				{label}
			</a>
			<a
				href={waHref}
				target="_blank"
				rel="noopener noreferrer"
				aria-label="Stuur een WhatsApp"
				data-umami-event="blog_{event}_sticky_whatsapp"
				class="inline-flex size-11 shrink-0 items-center justify-center rounded-md border border-input bg-card"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="currentColor"
					class="size-5 text-[#25D366]"
					aria-hidden="true"
				>
					<path
						d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 1.67c2.2 0 4.27.86 5.83 2.42a8.2 8.2 0 0 1 2.42 5.82c0 4.54-3.7 8.23-8.25 8.23a8.2 8.2 0 0 1-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.37c0-4.54 3.7-8.24 8.25-8.24Zm-3.05 4.43c-.14 0-.37.05-.57.27-.2.21-.76.74-.76 1.81 0 1.07.78 2.1.89 2.25.11.14 1.53 2.34 3.71 3.28.52.22.92.36 1.24.46.52.17.99.14 1.37.09.42-.06 1.28-.52 1.46-1.03.18-.51.18-.94.13-1.03-.05-.09-.2-.14-.41-.25-.21-.11-1.28-.63-1.48-.7-.2-.07-.34-.11-.49.11-.14.21-.56.7-.69.85-.13.14-.25.16-.46.05-.21-.11-.9-.33-1.71-1.06-.63-.56-1.06-1.26-1.18-1.47-.13-.21-.01-.33.09-.43.09-.09.21-.25.32-.37.11-.13.14-.21.21-.36.07-.14.04-.27-.02-.38-.05-.11-.49-1.18-.67-1.61-.18-.43-.36-.37-.49-.37l-.42-.01Z"
					/>
				</svg>
			</a>
		</div>
	</div>
{/if}
