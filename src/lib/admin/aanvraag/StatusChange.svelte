<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import {
		PREPAYMENT_STATUSES,
		PREPAYMENT_STATUS_LABELS,
		STATUS_LABELS,
		isValidReason,
		reasonOptions,
		type Deal,
		type DealStatus
	} from '$lib/deals';
	import { selectClass } from './shared';

	// Changing the status of an aanvraag. Nothing is saved until this form is
	// submitted: the new status goes in one request together with the data that
	// belongs to it (dates, amount, costs, reden), and those fields are required.
	// Annuleren or Escape leaves the aanvraag exactly as it was.
	let {
		deal,
		status,
		preset = {},
		actionBase = '',
		onclose
	}: {
		deal: Deal;
		status: DealStatus;
		preset?: Record<string, string>; // prefills from an action button, e.g. lostReason
		actionBase?: string;
		onclose: () => void;
	} = $props();

	// Today and +14 days in local time, as YYYY-MM-DD for <input type="date">.
	const ymd = (d: Date) =>
		`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
	const today = ymd(new Date());
	const inTwoWeeks = ymd(new Date(Date.now() + 14 * 86_400_000));

	const s = $derived(status);
	const sent = $derived(s === 'offerte_verstuurd' || s === 'in_optie');
	const rejected = $derived(s === 'afgewezen' || s === 'afgewezen_intern');
	// With an active offerteversie the amount follows that quote, so don't ask.
	const askAmount = $derived((sent || s === 'geaccepteerd') && deal.quoteVersions.length === 0);
	// Leaving 'nieuw' means we answered: when was that?
	const askFirstReply = $derived(deal.status === 'nieuw' && s !== 'nieuw' && !deal.firstReplyOn);

	const reasons = $derived(reasonOptions(s).filter((r) => r.value !== ''));
	const presetReason = $derived(
		preset.lostReason ?? (isValidReason(s, deal.lostReason) ? deal.lostReason : '')
	);

	const title = $derived(
		s === 'afgewezen'
			? 'Waarom zei de klant nee?'
			: s === 'afgewezen_intern'
				? 'Waarom zeggen wij nee?'
				: `Naar "${STATUS_LABELS[s]}"`
	);

	let error = $state('');

	const open = (el: HTMLDialogElement) => {
		el.showModal();
	};
</script>

<dialog
	{@attach open}
	{onclose}
	class="m-auto w-[min(30rem,calc(100%-1.5rem))] rounded-lg border bg-card p-0 text-foreground shadow-lg backdrop:bg-black/40"
>
	<form
		method="POST"
		action="{actionBase}?/update"
		class="space-y-4 p-4"
		use:enhance={() => {
			error = '';
			return async ({ result, update }) => {
				if (result.type === 'success') {
					await update({ reset: false });
					onclose();
				} else if (result.type === 'failure') {
					// Stay open and say what's missing; nothing was saved.
					error = String(result.data?.error ?? 'Opslaan mislukt.');
				} else {
					await update({ reset: false });
				}
			};
		}}
	>
		<input type="hidden" name="id" value={deal.id} />
		<input type="hidden" name="status" value={s} />
		<div>
			<h2 class="font-heading text-lg">{title}</h2>
			<p class="text-sm text-muted-foreground">
				{deal.name} · van "{STATUS_LABELS[deal.status]}" naar "{STATUS_LABELS[s]}"
			</p>
		</div>

		{#if error}
			<p class="border border-destructive/40 bg-destructive/5 p-2 text-sm text-destructive">
				{error}
			</p>
		{/if}

		{#if reasons.length > 0}
			<fieldset class="space-y-1">
				<legend class="mb-1 text-sm font-medium">Reden *</legend>
				{#each reasons as r, i (r.value)}
					<label
						class="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm has-checked:border-primary has-checked:bg-primary/5"
					>
						<input
							type="radio"
							name="lostReason"
							value={r.value}
							checked={presetReason === r.value}
							required={i === 0}
							class="size-4"
						/>
						{r.label}
					</label>
				{/each}
			</fieldset>
		{/if}

		{#if s === 'afgewezen'}
			<div class="space-y-1">
				<Label for="sc-afgewezenOp">Afgewezen op *</Label>
				<Input
					id="sc-afgewezenOp"
					name="afgewezenOp"
					type="date"
					required
					value={deal.afgewezenOp ?? today}
				/>
			</div>
		{/if}

		{#if sent}
			<div class="grid grid-cols-2 gap-3">
				<div class="space-y-1">
					<Label for="sc-offerteVerstuurdOp">Offerte verstuurd *</Label>
					<Input
						id="sc-offerteVerstuurdOp"
						name="offerteVerstuurdOp"
						type="date"
						required
						value={deal.offerteVerstuurdOp ?? today}
					/>
				</div>
				<div class="space-y-1">
					<Label for="sc-geldigTot">Geldig tot *</Label>
					<Input
						id="sc-geldigTot"
						name="geldigTot"
						type="date"
						required
						value={deal.geldigTot ?? inTwoWeeks}
					/>
				</div>
			</div>
		{/if}

		{#if s === 'geaccepteerd'}
			<div class="space-y-1">
				<Label for="sc-geaccepteerdOp">Geaccepteerd op *</Label>
				<Input
					id="sc-geaccepteerdOp"
					name="geaccepteerdOp"
					type="date"
					required
					value={deal.geaccepteerdOp ?? today}
				/>
			</div>
		{/if}

		{#if askAmount}
			<div class="space-y-1">
				<Label for="sc-offerteAmount">Offertebedrag incl. btw *</Label>
				<Input
					id="sc-offerteAmount"
					name="offerteAmount"
					type="number"
					step="0.01"
					min="1"
					required
					inputmode="decimal"
					value={deal.offerteAmount ?? ''}
				/>
			</div>
		{/if}

		{#if s === 'geleverd'}
			<div class="space-y-1">
				<Label for="sc-costs">Kosten excl. btw *</Label>
				<Input
					id="sc-costs"
					name="costs"
					type="number"
					step="any"
					min="0"
					required
					inputmode="decimal"
					value={deal.costs ?? ''}
				/>
				<p class="text-xs text-muted-foreground">
					Ingrediënten, verpakking, reizen. De uren vul je in op het overzicht.
				</p>
			</div>
		{/if}

		{#if s === 'factuur_verstuurd'}
			<div class="space-y-1">
				<Label for="sc-factuurVerstuurdOp">Factuur verstuurd op *</Label>
				<Input
					id="sc-factuurVerstuurdOp"
					name="factuurVerstuurdOp"
					type="date"
					required
					value={deal.factuurVerstuurdOp ?? today}
				/>
			</div>
		{/if}

		{#if s === 'afgerond'}
			<div class="grid grid-cols-2 gap-3">
				<div class="space-y-1">
					<Label for="sc-betaaldOp">Betaald op *</Label>
					<Input
						id="sc-betaaldOp"
						name="betaaldOp"
						type="date"
						required
						value={deal.betaaldOp ?? today}
					/>
				</div>
				<div class="space-y-1">
					<Label for="sc-finalPaymentStatus">Eindbetaling</Label>
					<select
						id="sc-finalPaymentStatus"
						name="finalPaymentStatus"
						class={selectClass}
						value={preset.finalPaymentStatus ?? 'paid'}
					>
						{#each PREPAYMENT_STATUSES as ps (ps)}
							<option value={ps}>{PREPAYMENT_STATUS_LABELS[ps]}</option>
						{/each}
					</select>
				</div>
			</div>
		{/if}

		{#if askFirstReply}
			<div class="space-y-1">
				<Label for="sc-firstReplyOn">Eerste reactie op *</Label>
				<Input id="sc-firstReplyOn" name="firstReplyOn" type="date" required value={today} />
				<p class="text-xs text-muted-foreground">Al eerder gereageerd? Pas de datum aan.</p>
			</div>
		{/if}

		{#if rejected}
			<div class="space-y-1">
				<Label for="sc-notes">Interne notitie</Label>
				<Textarea id="sc-notes" name="notes" rows={2} value={deal.notes} maxlength={5000} />
			</div>
		{/if}

		<div class="flex justify-end gap-2">
			<Button type="button" variant="outline" onclick={onclose}>Annuleren</Button>
			<Button type="submit">Opslaan</Button>
		</div>
	</form>
</dialog>
