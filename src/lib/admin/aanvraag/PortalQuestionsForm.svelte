<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { DEFAULT_OPS_QUESTIONS, type Deal } from '$lib/deals';
	import { keepValues, selectClass } from './shared';

	// What the client reads in the portal: a personal note and the practical
	// questions. One ?/update form.
	let { deal }: { deal: Deal } = $props();

	const questions = $derived(
		deal.opsQuestions.length > 0 ? deal.opsQuestions : DEFAULT_OPS_QUESTIONS
	);
</script>

<form method="POST" action="?/update" class="space-y-4" use:enhance={keepValues}>
	<input type="hidden" name="id" value={deal.id} />

	<div class="space-y-1">
		<Label for="pq-portalNote">Notitie voor de klant</Label>
		<Textarea
			id="pq-portalNote"
			name="portalNote"
			rows={3}
			value={deal.portalNote}
			maxlength={2000}
			placeholder="Zichtbaar in het klantportaal, bijv. een persoonlijk bericht of een aandachtspunt."
		/>
	</div>

	<div class="space-y-2 border bg-background p-3">
		<input type="hidden" name="opsQuestionsConfig" value="yes" />
		<div class="grid gap-3 sm:grid-cols-[auto_1fr] sm:items-start">
			<div class="space-y-1">
				<Label for="pq-enabled">Praktische vragen</Label>
				<select
					id="pq-enabled"
					name="portalQuestionsEnabled"
					class={selectClass}
					value={deal.portalQuestionsEnabled ? 'true' : 'false'}
				>
					<option value="true">Tonen</option>
					<option value="false">Verbergen</option>
				</select>
			</div>
			<p class="text-xs text-muted-foreground sm:pt-6">
				Vink uit wat niet nodig is, pas tekst aan of voeg een losse vraag toe. Houd het kort.
			</p>
		</div>
		<div class="grid gap-2">
			{#each questions as q (q.key)}
				<div class="grid gap-2 sm:grid-cols-[auto_1fr] sm:items-center">
					<input type="hidden" name="opsQuestionKey" value={q.key} />
					<label class="flex items-center gap-2 text-xs text-muted-foreground">
						<input
							type="checkbox"
							name="opsQuestionEnabled_{q.key}"
							value="yes"
							checked={q.enabled}
							class="size-4"
						/>
						<span>aan</span>
					</label>
					<Input
						name="opsQuestionLabel_{q.key}"
						value={q.label}
						maxlength={240}
						aria-label="Portaalvraag"
					/>
				</div>
			{/each}
		</div>
		<div class="grid gap-2 sm:grid-cols-3">
			{#each [1, 2, 3] as i (i)}
				<div class="space-y-1">
					<Label for="pq-new-{i}" class="text-xs">Extra vraag {i}</Label>
					<Input
						id="pq-new-{i}"
						name="opsQuestionNewLabel_{i}"
						maxlength={240}
						placeholder="Optioneel"
					/>
				</div>
			{/each}
		</div>
	</div>

	<Button type="submit">Notitie & vragen opslaan</Button>
</form>
