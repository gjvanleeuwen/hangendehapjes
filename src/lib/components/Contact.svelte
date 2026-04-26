<script lang="ts">
	import type { Locale, Translations } from '$lib/i18n/types';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { toast } from 'svelte-sonner';
	import SectionHeading from './SectionHeading.svelte';

	type Props = { t: Translations; locale: Locale };
	let { t, locale }: Props = $props();

	let name = $state('');
	let email = $state('');
	let phone = $state('');
	let eventDate = $state('');
	let location = $state('');
	let guests = $state('');
	let message = $state('');
	let interestToetjes = $state(false);
	let interestBorrel = $state(false);
	let website = $state('');
	let submitting = $state(false);

	const today = new Date().toISOString().slice(0, 10);

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (submitting) return;
		submitting = true;

		const interests: string[] = [];
		if (interestToetjes) interests.push(t.contact.labels.toetjes);
		if (interestBorrel) interests.push(t.contact.labels.borrel);

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
					message,
					interests,
					website,
					locale
				})
			});

			if (!res.ok) {
				const data = (await res.json().catch(() => null)) as { error?: string } | null;
				if (res.status === 429 || data?.error === 'rate_limited') {
					toast.error(t.contact.errorRateTitle, { description: t.contact.errorRateBody });
				} else {
					toast.error(t.contact.errorTitle, { description: t.contact.errorBody });
				}
				return;
			}

			toast.success(t.contact.successTitle, { description: t.contact.successBody });
			name = '';
			email = '';
			phone = '';
			eventDate = '';
			location = '';
			guests = '';
			message = '';
			interestToetjes = false;
			interestBorrel = false;
		} catch {
			toast.error(t.contact.errorTitle, { description: t.contact.errorBody });
		} finally {
			submitting = false;
		}
	}
</script>

<section id="contact" class="bg-background">
	<div class="mx-auto max-w-6xl px-6 py-20 md:py-28">
		<div class="mx-auto mb-10 max-w-2xl text-center">
			<SectionHeading align="center">{t.contact.heading}</SectionHeading>
			<p class="mt-3 text-muted-foreground">{t.contact.intro}</p>
		</div>

		<form class="mx-auto max-w-3xl space-y-6" onsubmit={handleSubmit}>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div class="space-y-2">
					<Label for="name">{t.contact.labels.name}</Label>
					<Input
						id="name"
						name="name"
						required
						maxlength={100}
						bind:value={name}
						autocomplete="name"
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
					/>
				</div>
				<div class="space-y-2">
					<Label for="eventDate">
						{t.contact.labels.eventDate}
						<span class="text-xs text-muted-foreground">({t.contact.optional})</span>
					</Label>
					<Input
						id="eventDate"
						name="eventDate"
						type="date"
						min={today}
						bind:value={eventDate}
					/>
				</div>
				<div class="space-y-2">
					<Label for="location">
						{t.contact.labels.location}
						<span class="text-xs text-muted-foreground">({t.contact.optional})</span>
					</Label>
					<Input id="location" name="location" maxlength={200} bind:value={location} />
				</div>
				<div class="space-y-2">
					<Label for="guests">
						{t.contact.labels.guests}
						<span class="text-xs text-muted-foreground">({t.contact.optional})</span>
					</Label>
					<Input
						id="guests"
						name="guests"
						type="number"
						min="1"
						max="99999"
						bind:value={guests}
					/>
				</div>
			</div>

			<div class="space-y-3">
				<Label>{t.contact.labels.interests}</Label>
				<div class="flex flex-wrap gap-6">
					<label class="flex items-center gap-2 text-sm">
						<Checkbox bind:checked={interestToetjes} />
						{t.contact.labels.toetjes}
					</label>
					<label class="flex items-center gap-2 text-sm">
						<Checkbox bind:checked={interestBorrel} />
						{t.contact.labels.borrel}
					</label>
				</div>
			</div>

			<div class="space-y-2">
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

			<div aria-hidden="true" class="hidden">
				<label>
					Website
					<input
						type="text"
						name="website"
						tabindex="-1"
						autocomplete="off"
						bind:value={website}
					/>
				</label>
			</div>

			<Button type="submit" size="lg" disabled={submitting}>
				{submitting ? t.contact.submitting : t.contact.submit}
			</Button>
		</form>
	</div>
</section>
