<script lang="ts">
	import type { Locale, Translations } from '$lib/i18n/types';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { WHATSAPP_URL } from '$lib/site-config';
	import { trackInView } from '$lib/inView';
	import { cn } from '$lib/utils.js';
	import { toast } from 'svelte-sonner';
	import SectionHeading from './SectionHeading.svelte';
	import Picture from './Picture.svelte';
	import PlusIcon from '@lucide/svelte/icons/plus';

	type Props = { t: Translations; locale: Locale };
	let { t, locale }: Props = $props();

	let name = $state('');
	let email = $state('');
	let phone = $state('');
	let eventDate = $state('');
	let location = $state('');
	let guests = $state('');
	let choiceKey = $state('');
	let customChoice = $state(''); // free text when "anders" is picked
	let dagdeel = $state<'' | 'taartmoment' | 'receptie' | 'feest' | 'dessert' | 'voorgerecht'>('');
	let servingTime = $state('');
	let referral = $state('');
	let message = $state('');
	let subject = $state(''); // honeypot — must stay empty
	let submitting = $state(false);
	let started = $state(false);

	// Two-step flow: 1) jij & je keuze (wie + wat), 2) over je feest (de details).
	// Two steps keep each screen balanced — splitting it further just adds clicks.
	let step = $state(1);
	const totalSteps = 2;

	const today = new Date().toISOString().slice(0, 10);

	const emailValid = $derived(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
	const step1Valid = $derived(
		choiceKey !== '' &&
			(choiceKey !== 'anders' || customChoice.trim().length > 0) &&
			name.trim().length > 0 &&
			emailValid
	);
	const step2Valid = $derived(eventDate !== '' && Number(guests) >= 1 && message.trim().length > 0);
	const canAdvance = $derived(step === 1 ? step1Valid : step2Valid);

	function next() {
		if (step < totalSteps && canAdvance) {
			if (step === 1) saveLead();
			step += 1;
			// Funnel: how many people make it past step 1 vs. drop off there.
			window.umami?.track('contact_step', { step, locale });
		}
	}

	// Save the step-1 details so we can still reach people who never finish
	// step 2. Fire-and-forget: it must never slow down or block the form.
	function saveLead() {
		void fetch('/api/contact/lead', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			keepalive: true,
			body: JSON.stringify({
				email,
				name,
				phone,
				serviceType,
				choice: choiceValue,
				locale,
				subject
			})
		}).catch(() => {});
	}

	function back() {
		if (step > 1) step -= 1;
	}

	type ChoiceCard = {
		key: string;
		serviceType: 'hapjes' | 'taart' | 'anders';
		label: string;
		group: string;
		image?: { src: string; position?: string };
	};

	// Six picture cards: the five products from the homepage plus "anders".
	// The service type follows from the card, so there's no separate step for it.
	const choiceCards = $derived.by((): ChoiceCard[] => {
		const product = (id: string) => t.products.items.find((p) => p.id === id);
		const cake = (id: string) => t.products.cakes?.items.find((c) => c.id === id);
		const hapjes = t.products.hapjesHeading;
		const taarten = t.products.cakes?.heading ?? '';
		const tiramisuImg = product('toetjes')?.image;
		const burrataImg = product('borrel')?.image;
		const tTaart = cake('tiramisutaart');
		const klassiekImg = cake('klassiek')?.image;
		const italiaansImg = cake('italiaans')?.image;
		return [
			{
				key: 'tiramisu-live',
				serviceType: 'hapjes',
				label: t.contact.options.tiramisuLive,
				group: hapjes,
				image: tiramisuImg ? { src: tiramisuImg } : undefined
			},
			{
				key: 'burrata-live',
				serviceType: 'hapjes',
				label: t.contact.options.burrataLive,
				group: hapjes,
				image: burrataImg ? { src: burrataImg } : undefined
			},
			{
				key: 'tiramisu-taart',
				serviceType: 'taart',
				label: t.contact.options.tiramisuTaart,
				group: taarten,
				image: tTaart ? { src: tTaart.image, position: tTaart.position } : undefined
			},
			{
				key: 'bruidstaart',
				serviceType: 'taart',
				label: t.contact.options.bruidstaart,
				group: taarten,
				image: klassiekImg ? { src: klassiekImg } : undefined
			},
			{
				key: 'millefeuille',
				serviceType: 'taart',
				label: t.contact.options.millefeuille,
				group: taarten,
				image: italiaansImg ? { src: italiaansImg } : undefined
			},
			{
				key: 'anders',
				serviceType: 'anders',
				label: t.contact.options.anders,
				group: t.contact.options.andersNote
			}
		];
	});

	const selectedChoice = $derived(choiceCards.find((c) => c.key === choiceKey) ?? null);
	const serviceType = $derived(selectedChoice?.serviceType ?? '');
	// What we send and store: the product name, or the visitor's own words for "anders".
	const choiceValue = $derived(
		choiceKey === 'anders' ? customChoice.trim() : (selectedChoice?.label ?? '')
	);

	// WhatsApp message prefilled with whatever they already typed, so they
	// don't have to repeat themselves and we get the details straight away.
	const waHref = $derived.by(() => {
		const p = t.contact.whatsapp.prefill;
		const lines = [
			p.greeting,
			choiceValue ? `${p.choice}: ${choiceValue}` : '',
			name.trim() ? `${p.name}: ${name.trim()}` : '',
			emailValid ? `${p.email}: ${email.trim()}` : '',
			phone.trim() ? `${p.phone}: ${phone.trim()}` : '',
			eventDate ? `${p.date}: ${eventDate}` : '',
			guests ? `${p.guests}: ${guests}` : '',
			location.trim() ? `${p.location}: ${location.trim()}` : ''
		].filter(Boolean);
		return `${WHATSAPP_URL}?text=${encodeURIComponent(lines.join('\n'))}`;
	});

	const selectClass =
		'border-input focus-visible:border-ring focus-visible:ring-ring/50 h-8 w-full min-w-0 rounded-lg border bg-transparent px-2.5 py-1 text-base outline-none transition-colors focus-visible:ring-3 md:text-sm';

	function pickChoice(card: ChoiceCard) {
		choiceKey = card.key;
		// Captures what people are drawn to even if they never finish the form.
		window.umami?.track('contact_service_type', {
			serviceType: card.serviceType,
			choice: card.key,
			locale
		});
	}

	// Fires once when a visitor first interacts with any field — lets us measure
	// form abandonment (contact_start vs contact_submit) instead of only seeing
	// the people who made it all the way through.
	function markStarted() {
		if (started) return;
		started = true;
		window.umami?.track('contact_start', { locale });
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (submitting) return;
		submitting = true;

		try {
			const res = await fetch('/api/contact', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name,
					email,
					phone,
					eventDate,
					location,
					guests,
					serviceType,
					choice: choiceValue,
					dagdeel: dagdeel ? t.contact.dagdelen[dagdeel] : '',
					servingTime,
					referral,
					message,
					subject,
					locale
				})
			});

			if (!res.ok) {
				const data = (await res.json().catch(() => null)) as { error?: string } | null;
				const reason =
					res.status === 429 || data?.error === 'rate_limited'
						? 'rate_limited'
						: data?.error || `http_${res.status}`;
				window.umami?.track('contact_error', { reason, locale });
				if (res.status === 429 || data?.error === 'rate_limited') {
					toast.error(t.contact.errorRateTitle, { description: t.contact.errorRateBody });
				} else {
					toast.error(t.contact.errorTitle, { description: t.contact.errorBody });
				}
				return;
			}

			window.umami?.track('contact_submit', {
				locale,
				serviceType: serviceType || 'none',
				choice: choiceKey || 'none',
				referral: referral ? 'provided' : 'empty'
			});
			toast.success(t.contact.successTitle, { description: t.contact.successBody });
			name = '';
			email = '';
			phone = '';
			eventDate = '';
			location = '';
			guests = '';
			choiceKey = '';
			customChoice = '';
			dagdeel = '';
			servingTime = '';
			referral = '';
			message = '';
			subject = '';
			started = false;
			step = 1;
		} catch {
			window.umami?.track('contact_error', { reason: 'network', locale });
			toast.error(t.contact.errorTitle, { description: t.contact.errorBody });
		} finally {
			submitting = false;
		}
	}
</script>

<section
	id="contact"
	class="bg-background"
	use:trackInView={{ event: 'contact_view', data: { locale } }}
>
	<div class="mx-auto max-w-6xl px-6 py-20 md:py-28">
		<div class="mx-auto mb-10 max-w-2xl text-center">
			<SectionHeading align="center">{t.contact.heading}</SectionHeading>
			<p class="mt-3 text-muted-foreground">{t.contact.intro}</p>
		</div>

		{#snippet whatsappButton()}
			<Button
				href={waHref}
				variant="outline"
				size="lg"
				target="_blank"
				rel="noopener noreferrer"
				data-umami-event="home_whatsapp"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="currentColor"
					class="size-4 text-[#25D366]"
					aria-hidden="true"
				>
					<path
						d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 1.67c2.2 0 4.27.86 5.83 2.42a8.2 8.2 0 0 1 2.42 5.82c0 4.54-3.7 8.23-8.25 8.23a8.2 8.2 0 0 1-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.37c0-4.54 3.7-8.24 8.25-8.24Zm-3.05 4.43c-.14 0-.37.05-.57.27-.2.21-.76.74-.76 1.81 0 1.07.78 2.1.89 2.25.11.14 1.53 2.34 3.71 3.28.52.22.92.36 1.24.46.52.17.99.14 1.37.09.42-.06 1.28-.52 1.46-1.03.18-.51.18-.94.13-1.03-.05-.09-.2-.14-.41-.25-.21-.11-1.28-.63-1.48-.7-.2-.07-.34-.11-.49.11-.14.21-.56.7-.69.85-.13.14-.25.16-.46.05-.21-.11-.9-.33-1.71-1.06-.63-.56-1.06-1.26-1.18-1.47-.13-.21-.01-.33.09-.43.09-.09.21-.25.32-.37.11-.13.14-.21.21-.36.07-.14.04-.27-.02-.38-.05-.11-.49-1.18-.67-1.61-.18-.43-.36-.37-.49-.37l-.42-.01Z"
					/>
				</svg>
				{t.contact.whatsapp.cta}
			</Button>
		{/snippet}

		{#snippet honeypot()}
			<div
				aria-hidden="true"
				class="pointer-events-none absolute -left-[9999px] h-0 w-0 overflow-hidden"
			>
				<label>
					Onderwerp
					<input type="text" name="subject" tabindex="-1" autocomplete="off" bind:value={subject} />
				</label>
			</div>
		{/snippet}

		<form class="mx-auto max-w-3xl space-y-6" onsubmit={handleSubmit} onfocusin={markStarted}>
			{#if step === 1}
				<fieldset class="space-y-3">
					<legend class="mb-2 text-sm font-medium">{t.contact.labels.serviceType}</legend>
					<div class="grid grid-cols-2 gap-2 md:grid-cols-6">
						{#each choiceCards as card (card.key)}
							<label
								class={cn(
									'flex cursor-pointer items-center overflow-hidden rounded-lg border bg-card text-left transition-colors md:flex-col md:items-stretch',
									choiceKey === card.key
										? 'border-primary ring-2 ring-primary'
										: 'border-input hover:border-primary/50',
									!card.image && choiceKey !== card.key && 'border-dashed'
								)}
							>
								<input
									type="radio"
									name="choice"
									value={card.key}
									checked={choiceKey === card.key}
									onchange={() => pickChoice(card)}
									class="sr-only"
								/>
								<div
									class="relative aspect-square w-14 shrink-0 overflow-hidden bg-muted md:w-auto"
								>
									{#if card.image}
										<Picture
											src={card.image.src}
											alt=""
											sizes="(min-width: 768px) 120px, 56px"
											loading="lazy"
											class="absolute inset-0 size-full object-cover {card.image.position ?? ''}"
										/>
									{:else}
										<div class="flex size-full items-center justify-center text-muted-foreground">
											<PlusIcon class="size-5 md:size-6" aria-hidden="true" />
										</div>
									{/if}
								</div>
								<div class="min-w-0 px-2 py-1.5">
									<p class="text-xs leading-snug font-medium text-foreground">{card.label}</p>
									<p class="text-[11px] leading-snug text-muted-foreground">{card.group}</p>
								</div>
							</label>
						{/each}
					</div>
				</fieldset>

				{#if choiceKey === 'anders'}
					<div class="space-y-2">
						<Label for="customChoice">{t.contact.labels.choice}</Label>
						<Input
							id="customChoice"
							name="customChoice"
							required
							maxlength={120}
							bind:value={customChoice}
							placeholder={t.contact.placeholders.choice}
						/>
					</div>
				{/if}

				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<!-- Name on its own row, then email with phone beside it. -->
					<div class="space-y-2 md:col-span-2">
						<Label for="name">{t.contact.labels.name}</Label>
						<Input
							id="name"
							name="name"
							required
							maxlength={100}
							bind:value={name}
							autocomplete="name"
							placeholder={t.contact.placeholders.name}
						/>
					</div>
					<div class="space-y-2">
						<Label for="email">{t.contact.labels.email}</Label>
						<Input
							id="email"
							name="email"
							type="email"
							required
							maxlength={254}
							bind:value={email}
							autocomplete="email"
							placeholder={t.contact.placeholders.email}
						/>
					</div>
					<div class="space-y-2">
						<Label for="phone">
							{t.contact.labels.phone}
							<span class="text-xs text-muted-foreground">({t.contact.optional})</span>
						</Label>
						<Input
							id="phone"
							name="phone"
							type="tel"
							maxlength={30}
							bind:value={phone}
							autocomplete="tel"
							placeholder={t.contact.placeholders.phone}
						/>
					</div>
				</div>
			{:else}
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div class="space-y-2">
						<Label for="eventDate">{t.contact.labels.eventDate}</Label>
						<Input
							id="eventDate"
							name="eventDate"
							type="date"
							required
							min={today}
							bind:value={eventDate}
							class="bg-input/50"
						/>
					</div>
					<div class="space-y-2">
						<Label for="guests">{t.contact.labels.guests}</Label>
						<Input
							id="guests"
							name="guests"
							type="number"
							required
							min="1"
							max="99999"
							bind:value={guests}
							placeholder={t.contact.placeholders.guests}
						/>
					</div>
					<div class="space-y-2">
						<Label for="location">
							{t.contact.labels.location}
							<span class="text-xs text-muted-foreground">({t.contact.optional})</span>
						</Label>
						<Input
							id="location"
							name="location"
							maxlength={200}
							bind:value={location}
							placeholder={t.contact.placeholders.location}
						/>
					</div>
					<div class="space-y-2">
						<Label for="dagdeel">
							{t.contact.labels.dagdeel}
							<span class="text-xs text-muted-foreground">({t.contact.optional})</span>
						</Label>
						<select id="dagdeel" name="dagdeel" bind:value={dagdeel} class={selectClass}>
							<option value="">{t.contact.dagdelen.placeholder}</option>
							<option value="taartmoment">{t.contact.dagdelen.taartmoment}</option>
							<option value="receptie">{t.contact.dagdelen.receptie}</option>
							<option value="feest">{t.contact.dagdelen.feest}</option>
							<option value="dessert">{t.contact.dagdelen.dessert}</option>
							<option value="voorgerecht">{t.contact.dagdelen.voorgerecht}</option>
						</select>
					</div>
					<div class="space-y-2">
						<Label for="servingTime">
							{t.contact.labels.servingTime}
							<span class="text-xs text-muted-foreground">({t.contact.optional})</span>
						</Label>
						<Input id="servingTime" name="servingTime" type="time" bind:value={servingTime} />
					</div>
					<div class="space-y-2 md:col-span-2">
						<Label for="message">{t.contact.labels.message}</Label>
						<Textarea
							id="message"
							name="message"
							rows={5}
							required
							maxlength={5000}
							placeholder={t.contact.placeholders.message}
							bind:value={message}
						/>
					</div>
					<div class="space-y-2 md:col-span-2">
						<Label for="referral">
							{t.contact.labels.referral}
							<span class="text-xs text-muted-foreground">({t.contact.optional})</span>
						</Label>
						<Input
							id="referral"
							name="referral"
							maxlength={200}
							placeholder={t.contact.placeholders.referral}
							bind:value={referral}
						/>
					</div>
				</div>
			{/if}

			{@render honeypot()}

			<div class="flex flex-wrap items-center justify-end gap-3">
				{#if step > 1}
					<Button type="button" variant="outline" size="lg" onclick={back}>
						{t.contact.nav.back}
					</Button>
				{/if}
				<span class="text-xs text-muted-foreground tabular-nums" aria-hidden="true">
					{step}/{totalSteps}
				</span>
				{#if step < totalSteps}
					<Button
						type="button"
						size="lg"
						class="h-11 px-8 text-base font-semibold hover:bg-primary/85"
						disabled={!canAdvance}
						onclick={next}
					>
						{t.contact.nav.next}
					</Button>
				{:else}
					<Button
						type="submit"
						size="lg"
						class="h-11 px-8 text-base font-semibold hover:bg-primary/85"
						disabled={submitting || !step2Valid}
					>
						{submitting ? t.contact.submitting : t.contact.submit}
					</Button>
				{/if}
				{#if step === 1}
					<!-- The simpler option: WhatsApp, prefilled with what they typed so far. -->
					<span class="text-sm text-muted-foreground">{t.contact.whatsapp.or}</span>
					{@render whatsappButton()}
				{/if}
			</div>
		</form>
	</div>
</section>
