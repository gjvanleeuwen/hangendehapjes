<script lang="ts">
	import Contact from '$lib/components/Contact.svelte';
	import { nl } from '$lib/i18n/nl';

	type Props = {
		/** Umami surface key, e.g. 'tiramisu' → form events carry surface 'blog_tiramisu'. */
		event: string;
		heading: string;
		intro: string;
		/** Choice card to start with, e.g. 'tiramisu-taart'. */
		preselect?: string;
		/** Which choice cards to offer on this page (keys from Contact.svelte). */
		cards?: string[];
	};
	let { event, heading, intro, preselect, cards }: Props = $props();
</script>

<!-- The contact form itself, inside the blog post right after the prices. Replaces
     the old CTA that sent readers to the homepage: 9 in 10 never made that jump. -->
<Contact
	t={nl}
	locale="nl"
	variant="inline"
	surface="blog_{event}"
	{heading}
	{intro}
	{preselect}
	{cards}
/>
