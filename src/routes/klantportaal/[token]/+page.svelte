<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { formatDateNL, formatEUR } from '$lib/admin/calc';

	let { data, form } = $props();

	const d = $derived(data.deal);
	// Once signed, the name + place of signature are frozen server-side, so show
	// them as read-only rather than letting someone edit a field that won't save.
	const signed = $derived(Boolean(d.acceptedTermsAt));
	const eventDate = $derived(
		d.eventDate ? formatDateNL(d.eventDate) : d.eventDateText || 'Nog af te stemmen'
	);
	const serviceLabel = $derived(
		d.serviceType === 'taart'
			? 'Taart / dessert'
			: d.serviceType === 'hapjes'
				? 'Hangende hapjes'
				: d.serviceType || 'Offerte'
	);
	const canPayDeposit = $derived(Boolean(d.acceptedTermsAt || form?.saved) && !!d.depositLink);
	const canPayFinal = $derived(Boolean(d.acceptedTermsAt || form?.saved) && !!d.finalPaymentLink);
	const activeQuote = $derived(
		d.quoteVersions.find((q) => q.id === d.activeQuoteId) ?? d.quoteVersions.find((q) => q.active)
	);
	const otherQuotes = $derived(d.quoteVersions.filter((q) => q.id !== activeQuote?.id));

	function paymentBadge(status: string, hasLink: boolean, canPay: string | boolean) {
		if (status === 'paid')
			return { label: 'Betaald', className: 'border-primary/30 bg-primary/10' };
		if (canPay) return { label: 'Betaallink klaar', className: 'border-amber-300 bg-amber-50' };
		if (hasLink)
			return { label: 'Na akkoord beschikbaar', className: 'border-amber-300 bg-amber-50' };
		if (status === 'sent')
			return { label: 'Link verstuurd', className: 'border-amber-300 bg-amber-50' };
		return { label: 'Nog niet verstuurd', className: 'border-muted bg-muted/40' };
	}

	const depositBadge = $derived(paymentBadge(d.depositStatus, !!d.depositLink, canPayDeposit));
	const finalBadge = $derived(
		paymentBadge(d.finalPaymentStatus, !!d.finalPaymentLink, canPayFinal)
	);
</script>

<svelte:head>
	<title>Offerte accepteren — Hangende Hapjes</title>
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>

<main class="mx-auto max-w-3xl px-4 py-8">
	<header class="border-b pb-5">
		<div class="font-wordmark text-xl font-bold tracking-[0.08em] text-primary uppercase">
			Hangende Hapjes
		</div>
		<h1 class="mt-4 font-heading text-3xl">Offerte accepteren</h1>
		<p class="mt-2 text-muted-foreground">
			Controleer de samenvatting, vul de praktische gegevens in en ga daarna direct door naar de
			aanbetaling.
		</p>
	</header>

	{#if form?.error}
		<div class="mt-5 border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
			{form.error}
		</div>
	{/if}

	{#if form?.saved}
		<div class="mt-5 border border-primary/30 bg-primary/5 p-3 text-sm">
			{#if form.accepted}
				Dankjewel, je akkoord is binnen. Je krijgt een bevestiging per mail.
			{:else}
				Dankjewel, je gegevens zijn opgeslagen.
			{/if}
		</div>
	{/if}

	<section class="mt-6 grid gap-4 lg:grid-cols-[1fr_320px]">
		<div class="border bg-card p-5">
			<h2 class="font-heading text-xl">Samenvatting</h2>
			<dl class="mt-4 grid gap-3 text-sm sm:grid-cols-2">
				<div>
					<dt class="text-muted-foreground">Naam</dt>
					<dd class="font-medium">{d.name}</dd>
				</div>
				<div>
					<dt class="text-muted-foreground">Datum</dt>
					<dd class="font-medium">{eventDate}</dd>
				</div>
				<div>
					<dt class="text-muted-foreground">Concept</dt>
					<dd class="font-medium">{serviceLabel}</dd>
				</div>
				<div>
					<dt class="text-muted-foreground">Aantal gasten</dt>
					<dd class="font-medium">{d.guests || 'Nog af te stemmen'}</dd>
				</div>
				<div class="sm:col-span-2">
					<dt class="text-muted-foreground">Locatie</dt>
					<dd class="font-medium">{d.location || 'Nog af te stemmen'}</dd>
				</div>
				{#if d.choice}
					<div class="sm:col-span-2">
						<dt class="text-muted-foreground">Keuze</dt>
						<dd class="font-medium">{d.choice}</dd>
					</div>
				{/if}
			</dl>
		</div>

		<aside class="space-y-4 border bg-card p-5">
			<div>
				<h2 class="font-heading text-xl">Offerte</h2>
				{#if activeQuote}
					<div class="mt-3 space-y-3">
						<div>
							<div class="font-medium">{activeQuote.version} - {activeQuote.label}</div>
							<div class="text-sm text-muted-foreground">
								Totaal: {d.offerteAmount == null ? 'zie offerte' : formatEUR(d.offerteAmount)}
							</div>
							{#if d.geldigTot}
								<div class="text-sm text-muted-foreground">
									Geldig t/m {formatDateNL(d.geldigTot)}
								</div>
							{/if}
						</div>
						<a
							class="inline-flex h-10 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
							href="/klantportaal/{data.token}/offerte/{activeQuote.id}"
							target="_blank"
							rel="noreferrer"
						>
							Offerte bekijken / downloaden
						</a>
					</div>
				{:else}
					<p class="mt-2 text-sm text-muted-foreground">De offerte wordt hier klaargezet.</p>
				{/if}
			</div>

			<div class="border-t pt-4">
				<h3 class="text-sm font-medium">Betalingen</h3>
				<div class="mt-3 space-y-3 text-sm">
					<div class="flex items-start justify-between gap-3">
						<div>
							<div class="font-medium">Aanbetaling</div>
							{#if d.depositStatus === 'paid' && d.depositAmount != null}
								<div class="text-muted-foreground">{formatEUR(d.depositAmount)}</div>
							{:else if d.depositAmount != null}
								<div class="text-muted-foreground">50% na akkoord</div>
							{/if}
						</div>
						<span class="shrink-0 border px-2 py-0.5 text-xs {depositBadge.className}">
							{depositBadge.label}
						</span>
					</div>
					<div class="flex items-start justify-between gap-3">
						<div>
							<div class="font-medium">Eindbetaling</div>
							{#if d.finalPaymentStatus === 'paid' && d.finalPaymentAmount != null}
								<div class="text-muted-foreground">{formatEUR(d.finalPaymentAmount)}</div>
							{:else if d.finalPaymentAmount != null}
								<div class="text-muted-foreground">Na verrekening aanbetaling</div>
							{/if}
						</div>
						<span class="shrink-0 border px-2 py-0.5 text-xs {finalBadge.className}">
							{finalBadge.label}
						</span>
					</div>
				</div>
			</div>

			{#if otherQuotes.length > 0}
				<div class="border-t pt-4">
					<div class="text-sm font-medium">Andere opties</div>
					<div class="mt-2 space-y-2">
						{#each otherQuotes as q (q.id)}
							<div class="flex items-center justify-between gap-3 text-sm">
								<span>{q.version} - {q.label}</span>
								<a
									class="underline"
									href="/klantportaal/{data.token}/offerte/{q.id}"
									target="_blank"
									rel="noreferrer"
								>
									Bekijken
								</a>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</aside>
	</section>

	<!--
		`update({ reset: false })` is load-bearing. SvelteKit's default enhance
		resets the form on success, which snaps every textarea back to its
		mount-time defaultValue (empty) even though the answers saved fine. The
		client then sees blank fields and the next save posts those blanks over
		the stored answers.
	-->
	<form
		method="POST"
		action="?/save"
		class="mt-6 space-y-6"
		use:enhance={() =>
			async ({ update }) => {
				await update({ reset: false });
			}}
	>
		<section class="border bg-card p-5">
			{#if signed}
				<!-- Signed once, a receipt from here on. The inputs are removed rather
				     than disabled, so there is no second akkoord left to give. -->
				<div class="flex items-start gap-3">
					<span
						class="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary"
						aria-hidden="true"
					>
						<svg viewBox="0 0 20 20" fill="currentColor" class="size-4">
							<path
								fill-rule="evenodd"
								d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 0 1 1.4-1.4l3.8 3.8 6.8-6.8a1 1 0 0 1 1.4 0Z"
								clip-rule="evenodd"
							/>
						</svg>
					</span>
					<div>
						<h2 class="font-heading text-xl">Akkoord gegeven</h2>
						<p class="mt-1 text-sm text-muted-foreground">
							Getekend door {d.acceptedByName} te {d.acceptedAtLocation} op {formatDateNL(
								d.acceptedTermsAt ?? ''
							)}.
						</p>
						<p class="mt-2 text-sm text-muted-foreground">
							De gegevens hieronder kun je nog steeds aanvullen of aanpassen.
						</p>
					</div>
				</div>
			{:else}
				<h2 class="font-heading text-xl">Akkoord & digitale handtekening</h2>
				<div class="mt-4 grid gap-4 sm:grid-cols-2">
					<div class="min-w-0 space-y-1.5">
						<Label for="acceptedByName" class="text-sm">Volledige naam</Label>
						<Input
							id="acceptedByName"
							name="acceptedByName"
							required
							maxlength={160}
							value={d.acceptedByName || d.name}
							class="w-full max-w-full text-sm"
						/>
					</div>
					<div class="min-w-0 space-y-1.5">
						<Label for="acceptedAtLocation" class="text-sm">Plaats van ondertekening</Label>
						<Input
							id="acceptedAtLocation"
							name="acceptedAtLocation"
							required
							maxlength={160}
							value={d.acceptedAtLocation}
							placeholder="Bijv. Hilversum"
							class="w-full max-w-full text-sm"
						/>
					</div>
				</div>
				<label class="mt-4 flex gap-3 text-sm">
					<input type="checkbox" name="terms" value="yes" required class="mt-1 size-4" />
					<span>
						Door dit formulier te verzenden en dit vakje aan te vinken plaats ik een digitale
						handtekening. Ik ga akkoord met de offerte, de
						<a href="/terms" class="underline" target="_blank" rel="noreferrer"
							>algemene voorwaarden</a
						>, de praktische afspraken en de aanbetaling. Ik begrijp dat de boeking pas definitief
						is nadat Hangende Hapjes de aanbetaling heeft ontvangen. De aanbetaling wordt verrekend
						met de eindfactuur.
					</span>
				</label>
				<p class="mt-3 text-xs text-muted-foreground">
					De datum en tijd van ondertekening worden automatisch vastgelegd bij verzenden.
				</p>
				<input type="hidden" name="termsVersion" value={data.termsVersion} />
			{/if}
		</section>

		{#if d.portalQuestionsEnabled || d.portalNote}
			<section class="border bg-card p-5">
				<h2 class="font-heading text-xl">Praktische gegevens</h2>
				{#if d.portalNote}
					<div class="mt-3 border bg-muted/40 p-3">
						<p class="text-sm whitespace-pre-line">{d.portalNote}</p>
					</div>
				{/if}
				{#if d.portalQuestionsEnabled}
					<div class="mt-6">
						<h3 class="font-heading text-lg">Vragen</h3>
						<p class="mt-1 text-sm text-muted-foreground">
							Vul in wat je al weet. Ontbrekende details kunnen later nog worden afgestemd.
						</p>
						<div class="mt-4 grid gap-4">
							{#each d.opsQuestions as q (q.key)}
								<!--
									`min-w-0` is required: the textarea uses `field-sizing: content`, and a
									grid item defaults to `min-width: auto`, so one long unbroken token (an
									email address, a URL) makes the field grow past the viewport and drags
									the whole page wide with it.
								-->
								<div class="min-w-0 space-y-1.5">
									<Label for={q.key} class="text-sm leading-snug">{q.label}</Label>
									<Textarea
										id={q.key}
										name={q.key}
										rows={2}
										value={d.opsJson[q.key] ?? ''}
										class="w-full max-w-full text-sm break-words"
									/>
								</div>
							{/each}
						</div>
					</div>
				{/if}
			</section>
		{/if}

		<div class="flex flex-wrap items-center gap-3">
			<Button type="submit">
				{signed ? 'Gegevens opslaan' : 'Akkoord geven + gegevens opslaan'}
			</Button>
			{#if d.opsCompletedAt}
				<span class="text-sm text-muted-foreground"
					>Laatst opgeslagen: {formatDateNL(d.opsCompletedAt)}</span
				>
			{/if}
		</div>
	</form>

	<section class="mt-6 border bg-card p-5">
		<h2 class="font-heading text-xl">Aanbetaling</h2>
		{#if d.depositStatus === 'paid'}
			<p class="mt-2 text-sm">De aanbetaling staat bij ons op betaald. Dankjewel.</p>
		{:else if canPayDeposit}
			<p class="mt-2 text-sm text-muted-foreground">
				Ga na het opslaan direct door naar de betaalpagina voor de aanbetaling.
			</p>
			<a
				class="mt-4 inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
				href={d.depositLink}
				rel="noreferrer"
			>
				Aanbetaling betalen
			</a>
		{:else if d.depositLink}
			<p class="mt-2 text-sm text-muted-foreground">
				De betaallink verschijnt nadat je akkoord en praktische gegevens zijn opgeslagen.
			</p>
		{:else}
			<p class="mt-2 text-sm text-muted-foreground">
				We sturen de betaallink apart of zetten die hier klaar zodra deze beschikbaar is.
			</p>
		{/if}
	</section>

	{#if d.finalPaymentLink || d.finalPaymentStatus === 'paid'}
		<section class="mt-6 border bg-card p-5">
			<h2 class="font-heading text-xl">Eindbetaling</h2>
			{#if d.finalPaymentStatus === 'paid'}
				<p class="mt-2 text-sm">De eindbetaling staat bij ons op betaald. Dankjewel.</p>
			{:else if canPayFinal}
				<p class="mt-2 text-sm text-muted-foreground">
					De aanbetaling wordt verrekend met de eindfactuur. Betaal hier het resterende bedrag.
				</p>
				<a
					class="mt-4 inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
					href={d.finalPaymentLink}
					rel="noreferrer"
				>
					Eindbetaling betalen
				</a>
			{:else}
				<p class="mt-2 text-sm text-muted-foreground">
					De eindbetaallink verschijnt nadat je akkoord en praktische gegevens zijn opgeslagen.
				</p>
			{/if}
		</section>
	{/if}
</main>
