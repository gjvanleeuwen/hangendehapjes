<script lang="ts">
	import { formatEUR } from '$lib/admin/calc';
	import { STATUS_LABELS } from '$lib/deals';

	let { data } = $props();
	const m = $derived(data.metrics);

	const monthLabel = (ym: string) => {
		const [y, mo] = ym.split('-');
		const names = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
		return `${names[Number(mo) - 1] ?? mo} ${y}`;
	};
</script>

<div class="space-y-6">
	<h1 class="font-heading text-2xl">Admin</h1>
	<p class="text-muted-foreground">Tools voor offertes en facturen.</p>

	{#if data.dbConfigured && m.total > 0}
		<section class="space-y-4">
			<h2 class="font-heading text-lg">Funnel</h2>
			<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
				<div class="bg-card border p-4">
					<div class="text-2xl font-semibold">{m.total}</div>
					<div class="text-muted-foreground text-xs">Aanvragen</div>
				</div>
				<div class="bg-card border p-4">
					<div class="text-2xl font-semibold">{m.offertes}</div>
					<div class="text-muted-foreground text-xs">Offertes verstuurd</div>
				</div>
				<div class="bg-card border p-4">
					<div class="text-2xl font-semibold">{m.won}</div>
					<div class="text-muted-foreground text-xs">Geboekt</div>
				</div>
				<div class="bg-card border p-4">
					<div class="text-2xl font-semibold">{m.conversionPct}%</div>
					<div class="text-muted-foreground text-xs">Offerte → geboekt</div>
				</div>
			</div>
			<p class="text-muted-foreground text-sm">
				{m.open} open · {m.lost} {STATUS_LABELS.afgewezen.toLowerCase()} · {m.declinedByUs}
				{STATUS_LABELS.afgewezen_intern.toLowerCase()} · {formatEUR(m.wonValue)} geboekte waarde · {formatEUR(
					m.pendingValue
				)} openstaand (offerte/optie)
			</p>

			<div class="grid gap-4 md:grid-cols-2">
				{#if m.byMonth.length > 0}
					<div class="border">
						<div class="bg-muted p-2 text-sm font-medium">Per maand (cohort)</div>
						<table class="w-full text-sm">
							<thead class="text-muted-foreground text-left text-xs">
								<tr>
									<th class="p-2 font-medium">Maand</th>
									<th class="p-2 font-medium">Aanvragen</th>
									<th class="p-2 font-medium">Offertes</th>
									<th class="p-2 font-medium">Geboekt</th>
								</tr>
							</thead>
							<tbody>
								{#each m.byMonth as row (row.month)}
									<tr class="border-t">
										<td class="p-2">{monthLabel(row.month)}</td>
										<td class="p-2">{row.leads}</td>
										<td class="p-2">{row.offertes}</td>
										<td class="p-2">{row.won}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}

				{#if m.bySource.length > 0}
					<div class="border">
						<div class="bg-muted p-2 text-sm font-medium">Per bron</div>
						<table class="w-full text-sm">
							<thead class="text-muted-foreground text-left text-xs">
								<tr>
									<th class="p-2 font-medium">Bron</th>
									<th class="p-2 font-medium">Aanvragen</th>
									<th class="p-2 font-medium">Geboekt</th>
								</tr>
							</thead>
							<tbody>
								{#each m.bySource as row (row.source)}
									<tr class="border-t">
										<td class="p-2">{row.source}</td>
										<td class="p-2">{row.leads}</td>
										<td class="p-2">{row.won}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			</div>
			<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
				<div class="bg-card border p-4">
					<div class="text-lg font-semibold">{formatEUR(m.takeHome)}</div>
					<div class="text-muted-foreground text-xs">Take-home (geboekt)</div>
				</div>
				<div class="bg-card border p-4">
					<div class="text-lg font-semibold">{m.hourly == null ? '—' : formatEUR(m.hourly)}</div>
					<div class="text-muted-foreground text-xs">Per uur (take-home)</div>
				</div>
				<div class="bg-card border p-4">
					<div class="text-lg font-semibold">{formatEUR(m.vat)}</div>
					<div class="text-muted-foreground text-xs">Btw op verkoop</div>
				</div>
				<div class="bg-card border p-4">
					<div class="text-lg font-semibold">{formatEUR(m.costs)}</div>
					<div class="text-muted-foreground text-xs">Kosten</div>
				</div>
			</div>
			<div class="text-sm font-medium">Nog te winnen — als openstaande offertes &amp; opties doorgaan</div>
			<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
				<div class="bg-card border p-4">
					<div class="text-lg font-semibold">{formatEUR(m.pendingValue)}</div>
					<div class="text-muted-foreground text-xs">Potentiële omzet (incl. btw)</div>
				</div>
				<div class="bg-card border p-4">
					<div class="text-lg font-semibold">{formatEUR(m.pendingTakeHome)}</div>
					<div class="text-muted-foreground text-xs">Potentiële take-home</div>
				</div>
				<div class="bg-card border p-4">
					<div class="text-lg font-semibold">{formatEUR(m.optieValue)}</div>
					<div class="text-muted-foreground text-xs">Waarvan in optie (omzet)</div>
				</div>
				<div class="bg-card border p-4">
					<div class="text-lg font-semibold">{formatEUR(m.optieTakeHome)}</div>
					<div class="text-muted-foreground text-xs">Waarvan in optie (take-home)</div>
				</div>
			</div>
			{#if m.hours > 0}
				<div class="border">
					<div class="bg-muted p-2 text-sm font-medium">Tijd per fase (geboekte klussen) · {m.hours} uur totaal</div>
					<table class="w-full text-sm">
						<thead class="text-muted-foreground text-left text-xs">
							<tr>
								<th class="p-2 font-medium">Fase</th>
								<th class="p-2 font-medium">Totaal uren</th>
								<th class="p-2 font-medium">Klussen</th>
								<th class="p-2 font-medium">Gem. per klus</th>
							</tr>
						</thead>
						<tbody>
							{#each m.byPhase as row (row.phase)}
								<tr class="border-t">
									<td class="p-2">{row.label}</td>
									<td class="p-2">{row.hours}</td>
									<td class="p-2">{row.deals}</td>
									<td class="p-2">{row.avg ? row.avg.toFixed(1) : '—'}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
			<p class="text-muted-foreground text-xs">
				Later te vergelijken met Search Console & Instagram om te zien waar leads vandaan komen.
			</p>
		</section>
	{/if}

	<div class="grid gap-3 sm:grid-cols-2">
		<a href="/admin/aanvragen" class="bg-card hover:bg-muted block border p-5 transition">
			<h2 class="font-heading text-lg">Aanvragen & offertes</h2>
			<p class="text-muted-foreground text-sm">Pijplijn, agenda en de funnel-cijfers.</p>
		</a>
		<a href="/admin/document?kind=offerte" class="bg-card hover:bg-muted block border p-5 transition">
			<h2 class="font-heading text-lg">Offerte</h2>
			<p class="text-muted-foreground text-sm">Prijsindicatie zonder factuurnummer.</p>
		</a>
		<a href="/admin/document?kind=factuur" class="bg-card hover:bg-muted block border p-5 transition">
			<h2 class="font-heading text-lg">Factuur</h2>
			<p class="text-muted-foreground text-sm">Met factuurnummer en betaalinstructies.</p>
		</a>
		<a href="/admin/document?kind=kwitantie" class="bg-card hover:bg-muted block border p-5 transition">
			<h2 class="font-heading text-lg">Kwitantie</h2>
			<p class="text-muted-foreground text-sm">Bewijs van betaling, geen BTW.</p>
		</a>
		<a href="/admin/calculator" class="bg-card hover:bg-muted block border p-5 transition">
			<h2 class="font-heading text-lg">Calculator</h2>
			<p class="text-muted-foreground text-sm">Bereken een offerteprijs met sliders.</p>
		</a>
	</div>
</div>
