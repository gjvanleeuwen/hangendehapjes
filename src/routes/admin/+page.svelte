<script lang="ts">
	import { formatEUR } from '$lib/admin/calc';
	import { STATUS_LABELS, type LeadTrend } from '$lib/deals';

	let { data } = $props();
	const m = $derived(data.metrics);
	const trend = $derived(data.trend);

	const monthLabel = (ym: string) => {
		const [y, mo] = ym.split('-');
		const names = [
			'jan',
			'feb',
			'mrt',
			'apr',
			'mei',
			'jun',
			'jul',
			'aug',
			'sep',
			'okt',
			'nov',
			'dec'
		];
		return `${names[Number(mo) - 1] ?? mo} ${y}`;
	};

	const trendText = (t: LeadTrend): string => {
		const dir = t.direction === 'drop' ? 'daling' : t.direction === 'rise' ? 'stijging' : 'gelijk';
		const p = `p=${t.pValue.toFixed(3).replace('.', ',')}`;
		switch (t.verdict) {
			case 'insufficient':
				return `Te weinig data (${t.total} leads in ${2 * t.windowDays} dgn) — vul oude aanvragen aan of wacht op meer data.`;
			case 'significant':
				return t.direction === 'drop'
					? `⚠️ Significante daling (${p}) — waarschijnlijk géén toeval; de moeite waard om op te acteren.`
					: `Significante stijging (${p}) — mooi, waarschijnlijk echt.`;
			case 'suggestive':
				return `Mogelijke ${dir} (${p}) — let op, nog geen zekerheid.`;
			default:
				return `Binnen normale ruis (${p}) — nog geen signaal.`;
		}
	};

	const trendClass = (t: LeadTrend): string => {
		if (t.verdict === 'significant')
			return t.direction === 'drop' ? 'font-medium text-red-600' : 'font-medium text-green-700';
		if (t.verdict === 'suggestive') return 'text-amber-600';
		return 'text-muted-foreground';
	};
</script>

<div class="space-y-6">
	<h1 class="font-heading text-2xl">Admin</h1>
	<p class="text-muted-foreground">Tools voor offertes en facturen.</p>

	{#if data.dbConfigured}
		<section class="space-y-2">
			<h2 class="font-heading text-lg">Lead-trend</h2>
			<div class="border bg-card p-4">
				<div class="flex items-baseline gap-3">
					<span class="text-2xl font-semibold">{trend.recent}</span>
					<span class="text-xs text-muted-foreground">laatste {trend.windowDays} dgn</span>
					<span class="text-muted-foreground">vs</span>
					<span class="text-2xl font-semibold">{trend.prior}</span>
					<span class="text-xs text-muted-foreground">{trend.windowDays} dgn daarvoor</span>
				</div>
				<p class="mt-2 text-sm {trendClass(trend)}">{trendText(trend)}</p>
				<p class="mt-1 text-xs text-muted-foreground">
					Exacte binomiaaltoets (p=0,5): de kans dat deze verdeling toeval is als de lead-frequentie
					gelijk bleef. Spam-verdachte aanvragen tellen niet mee.
				</p>
			</div>
		</section>
	{/if}

	{#if data.dbConfigured && m.total > 0}
		<section class="space-y-4">
			<h2 class="font-heading text-lg">Funnel</h2>
			<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
				<div class="border bg-card p-4">
					<div class="text-2xl font-semibold">{m.total}</div>
					<div class="text-xs text-muted-foreground">Aanvragen</div>
				</div>
				<div class="border bg-card p-4">
					<div class="text-2xl font-semibold">{m.offertes}</div>
					<div class="text-xs text-muted-foreground">Offertes verstuurd</div>
				</div>
				<div class="border bg-card p-4">
					<div class="text-2xl font-semibold">{m.won}</div>
					<div class="text-xs text-muted-foreground">Geboekt</div>
				</div>
				<div class="border bg-card p-4">
					<div class="text-2xl font-semibold">{m.conversionPct}%</div>
					<div class="text-xs text-muted-foreground">Offerte → geboekt</div>
				</div>
			</div>
			<p class="text-sm text-muted-foreground">
				{m.open} open · {m.lost}
				{STATUS_LABELS.afgewezen.toLowerCase()} · {m.declinedByUs}
				{STATUS_LABELS.afgewezen_intern.toLowerCase()} · {formatEUR(m.wonValue)} geboekte waarde · {formatEUR(
					m.pendingValue
				)} openstaand (offerte/optie)
			</p>

			<div class="grid gap-4 md:grid-cols-2">
				{#if m.byMonth.length > 0}
					<div class="border">
						<div class="bg-muted p-2 text-sm font-medium">Per maand (cohort)</div>
						<table class="w-full text-sm">
							<thead class="text-left text-xs text-muted-foreground">
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
							<thead class="text-left text-xs text-muted-foreground">
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
				<div class="border bg-card p-4">
					<div class="text-lg font-semibold">{formatEUR(m.takeHome)}</div>
					<div class="text-xs text-muted-foreground">Take-home (geboekt)</div>
				</div>
				<div class="border bg-card p-4">
					<div class="text-lg font-semibold">{m.hourly == null ? '—' : formatEUR(m.hourly)}</div>
					<div class="text-xs text-muted-foreground">Per uur (take-home)</div>
				</div>
				<div class="border bg-card p-4">
					<div class="text-lg font-semibold">{formatEUR(m.vat)}</div>
					<div class="text-xs text-muted-foreground">Btw op verkoop</div>
				</div>
				<div class="border bg-card p-4">
					<div class="text-lg font-semibold">{formatEUR(m.costs)}</div>
					<div class="text-xs text-muted-foreground">Kosten</div>
				</div>
			</div>
			<div class="text-sm font-medium">
				Nog te winnen — als openstaande offertes &amp; opties doorgaan
			</div>
			<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
				<div class="border bg-card p-4">
					<div class="text-lg font-semibold">{formatEUR(m.pendingValue)}</div>
					<div class="text-xs text-muted-foreground">Potentiële omzet (incl. btw)</div>
				</div>
				<div class="border bg-card p-4">
					<div class="text-lg font-semibold">{formatEUR(m.pendingTakeHome)}</div>
					<div class="text-xs text-muted-foreground">Potentiële take-home</div>
				</div>
				<div class="border bg-card p-4">
					<div class="text-lg font-semibold">{formatEUR(m.optieValue)}</div>
					<div class="text-xs text-muted-foreground">Waarvan in optie (omzet)</div>
				</div>
				<div class="border bg-card p-4">
					<div class="text-lg font-semibold">{formatEUR(m.optieTakeHome)}</div>
					<div class="text-xs text-muted-foreground">Waarvan in optie (take-home)</div>
				</div>
			</div>
			{#if m.hours > 0}
				<div class="border">
					<div class="bg-muted p-2 text-sm font-medium">
						Tijd per fase (geboekte klussen) · {m.hours} uur totaal
					</div>
					<table class="w-full text-sm">
						<thead class="text-left text-xs text-muted-foreground">
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
			<p class="text-xs text-muted-foreground">
				Later te vergelijken met Search Console & Instagram om te zien waar leads vandaan komen.
			</p>
		</section>
	{/if}

	<div class="grid gap-3 sm:grid-cols-2">
		<a href="/admin/aanvragen" class="block border bg-card p-5 transition hover:bg-muted">
			<h2 class="font-heading text-lg">Aanvragen & offertes</h2>
			<p class="text-sm text-muted-foreground">Pijplijn, agenda en de funnel-cijfers.</p>
		</a>
		<a
			href="/admin/document?kind=offerte"
			class="block border bg-card p-5 transition hover:bg-muted"
		>
			<h2 class="font-heading text-lg">Offerte</h2>
			<p class="text-sm text-muted-foreground">Prijsindicatie zonder factuurnummer.</p>
		</a>
		<a
			href="/admin/document?kind=factuur"
			class="block border bg-card p-5 transition hover:bg-muted"
		>
			<h2 class="font-heading text-lg">Factuur</h2>
			<p class="text-sm text-muted-foreground">Met factuurnummer en betaalinstructies.</p>
		</a>
		<a
			href="/admin/document?kind=kwitantie"
			class="block border bg-card p-5 transition hover:bg-muted"
		>
			<h2 class="font-heading text-lg">Kwitantie</h2>
			<p class="text-sm text-muted-foreground">Bewijs van betaling, geen BTW.</p>
		</a>
		<a href="/admin/calculator" class="block border bg-card p-5 transition hover:bg-muted">
			<h2 class="font-heading text-lg">Calculator</h2>
			<p class="text-sm text-muted-foreground">Bereken een offerteprijs met sliders.</p>
		</a>
	</div>
</div>
