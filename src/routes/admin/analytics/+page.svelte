<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { formatEUR } from '$lib/admin/calc';
	import type { LeadTrend } from '$lib/deals';

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
				return `Te weinig data (${t.total} leads in ${2 * t.windowDays} dgn).`;
			case 'significant':
				return t.direction === 'drop'
					? `Significante daling (${p}).`
					: `Significante stijging (${p}).`;
			case 'suggestive':
				return `Mogelijke ${dir} (${p}).`;
			default:
				return `Normale ruis (${p}).`;
		}
	};

	const trendClass = (t: LeadTrend): string => {
		if (t.verdict === 'significant')
			return t.direction === 'drop' ? 'font-medium text-red-600' : 'font-medium text-green-700';
		if (t.verdict === 'suggestive') return 'text-amber-600';
		return 'text-muted-foreground';
	};
</script>

<svelte:head>
	<title>Analytics · admin</title>
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>

<div class="space-y-6">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div>
			<h1 class="font-heading text-2xl">Analytics</h1>
			<p class="text-sm text-muted-foreground">{m.total} aanvragen, {m.open} open.</p>
		</div>
		<Button href="/admin/aanvragen/export.json" variant="outline" download="deals.json">
			Exporteer JSON
		</Button>
	</div>

	{#if !data.dbConfigured}
		<div class="border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
			Geen database geconfigureerd. Zet <code>DATABASE_URL</code> in de omgeving (Dokploy Postgres) om
			aanvragen op te slaan.
		</div>
	{:else}
		<section class="space-y-3">
			<div class="grid grid-cols-2 gap-3 md:grid-cols-4">
				<div class="border bg-card p-3">
					<div class="text-2xl font-semibold">{m.total}</div>
					<div class="text-xs text-muted-foreground">Aanvragen</div>
				</div>
				<div class="border bg-card p-3">
					<div class="text-2xl font-semibold">{m.open}</div>
					<div class="text-xs text-muted-foreground">Open</div>
				</div>
				<div class="border bg-card p-3">
					<div class="text-2xl font-semibold">{m.conversionPct}%</div>
					<div class="text-xs text-muted-foreground">Offerte naar geboekt</div>
				</div>
				<div class="border bg-card p-3">
					<div class="text-2xl font-semibold">{formatEUR(m.pendingValue)}</div>
					<div class="text-xs text-muted-foreground">
						Openstaand · gewogen {formatEUR(m.weightedPendingValue)}
					</div>
				</div>
			</div>

			<div class="space-y-4 border bg-card p-4 text-sm">
				<h2 class="font-medium">Details</h2>
				<div class="grid gap-3 md:grid-cols-[1fr_1.2fr]">
					<div class="border bg-background p-3">
						<div class="text-xs font-medium text-muted-foreground uppercase">Lead-trend</div>
						<div class="mt-2 flex items-baseline gap-2">
							<span class="text-xl font-semibold">{trend.recent}</span>
							<span class="text-xs text-muted-foreground">laatste {trend.windowDays} dgn</span>
							<span class="text-muted-foreground">vs</span>
							<span class="text-xl font-semibold">{trend.prior}</span>
						</div>
						<p class="mt-1 {trendClass(trend)}">{trendText(trend)}</p>
					</div>
					<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
						<div class="border bg-background p-3">
							<div class="font-semibold">{formatEUR(m.wonValue)}</div>
							<div class="text-xs text-muted-foreground">Geboekt</div>
						</div>
						<div class="border bg-background p-3">
							<div class="font-semibold">{formatEUR(m.takeHome)}</div>
							<div class="text-xs text-muted-foreground">Take-home</div>
						</div>
						<div class="border bg-background p-3">
							<div class="font-semibold">{m.hourly == null ? '–' : formatEUR(m.hourly)}</div>
							<div class="text-xs text-muted-foreground">Per uur</div>
						</div>
						<div class="border bg-background p-3">
							<div class="font-semibold">{formatEUR(m.optieValue)}</div>
							<div class="text-xs text-muted-foreground">In optie</div>
						</div>
					</div>
				</div>

				<div class="grid gap-4 lg:grid-cols-2">
					{#if m.byMonth.length > 0}
						<div class="border">
							<div class="bg-muted p-2 text-xs font-medium uppercase">Per maand</div>
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
							<div class="bg-muted p-2 text-xs font-medium uppercase">Per bron</div>
							<table class="w-full text-sm">
								<thead class="text-left text-xs text-muted-foreground">
									<tr>
										<th class="p-2 font-medium">Bron</th>
										<th class="p-2 font-medium">Aanvragen</th>
										<th class="p-2 font-medium">Geboekt</th>
									</tr>
								</thead>
								<tbody>
									{#each m.bySource.slice(0, 8) as row (row.source)}
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

				{#if m.hours > 0}
					<div class="border">
						<div class="bg-muted p-2 text-xs font-medium uppercase">
							Tijd per fase · {m.hours} uur totaal
						</div>
						<table class="w-full text-sm">
							<thead class="text-left text-xs text-muted-foreground">
								<tr>
									<th class="p-2 font-medium">Fase</th>
									<th class="p-2 font-medium">Uren</th>
									<th class="p-2 font-medium">Klussen</th>
									<th class="p-2 font-medium">Gem.</th>
								</tr>
							</thead>
							<tbody>
								{#each m.byPhase as row (row.phase)}
									<tr class="border-t">
										<td class="p-2">{row.label}</td>
										<td class="p-2">{row.hours}</td>
										<td class="p-2">{row.deals}</td>
										<td class="p-2">{row.avg ? row.avg.toFixed(1) : '–'}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			</div>
		</section>
	{/if}
</div>
