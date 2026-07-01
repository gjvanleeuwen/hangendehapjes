<script lang="ts">
	import type { Locale, Translations } from '$lib/i18n/types';
	import SEO from './SEO.svelte';
	import Nav from './Nav.svelte';
	import Hero from './Hero.svelte';
	import About from './About.svelte';
	import Products from './Products.svelte';
	import FAQ from './FAQ.svelte';
	import CakeBanner from './CakeBanner.svelte';
	import Reviews from './Reviews.svelte';
	import Photos from './Photos.svelte';
	import Contact from './Contact.svelte';
	import Footer from './Footer.svelte';

	type Props = { t: Translations; locale: Locale };
	let { t, locale }: Props = $props();
</script>

<SEO {t} {locale} />

<div id="top" class="bg-background text-foreground">
	<Nav {t} />
	<main>
		<Hero {t} />
		<About {t} />
		<Products {t} />
		<FAQ {t} />
		<CakeBanner {t} />
		<Reviews {t} {locale} />
		<Photos {t} />
		<Contact {t} {locale} />
	</main>
	<Footer {t} />
</div>
